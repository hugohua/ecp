/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
		ShortCuts = require('./ecp.shortcuts'),
		UserInfo = require('./ecp.user.info'),
		ReqFun = require('./ecp.require.func'),
		ReqGetSet = require('./ecp.require.getset'),
		ListFun = require('./ecp.list.func'),
		localStore = require('./ecp.localstore');
	
	require('jquery.ui')($);
	require('jquery.tablesorter')($);


	var model = {
		id_list_tmpl:'#js_list_tmpl_',
		id_list_table:'#js_list_table_',
		id_pop_task:'#js_pop_task',			//右侧弹窗容器
		id_pop_task_tmpl:'#js_pop_task_tmpl',//右侧弹窗模板
	};
	
	var type = Fun.getUrlParam("type") || 'all',		//日前类型
		state = Fun.getUrlParam("state") || 15;			//状态
	
	
	/**
	 * 根据类型获取需求
	 */
	var getBaseList = function(atype,state){
		var $table = $(model.id_list_table + state);
		getBaseListAjax($table,atype,state);
	};
	
	/**
	 * ajax数据 
	 */
	var getBaseListAjax = function($table,atype,state){
		var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power,
			power_rank = user_info.users.user_power_rank;
		console.info(user_info,'===')
		if(user == 'nicoleyin'){
			power = 20;
		}	
		var req = RestApi.getRequireStateType(user,power,power_rank,state,atype);
		req.success(function(data){
			if(data && data.require){
				listActHtml(data,state);
				//缓存点击数据
				//$table.data('cache',true).data(atype+state,data);
			}
		});
	};
	
	/**
	 * 根据时间、状态 获取数据 
	 */
	var getBastListByDate = function(state,start,end){
		var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power,
			power_rank = user_info.users.user_power_rank;
		console.info(user,'===')
		if(user == 'nicoleyin'){
			power = 20;
		}	
		RestApi.getRequireByDate(user,power,power_rank,state,start, end).success(function(data) {
			if(data && data.require){
				listActHtml(data,state);
			};
		})
	};
	
	
	
	/**
	 * html结构
	 * @param {Object} data
	 */
	var listActHtml = function(data,state){
		var tpl = $(model.id_list_tmpl + state).html(),
			listHtml = Mustache.to_html(tpl, changeData(data));
		$('tbody',model.id_list_table + state).html(listHtml);
		
		//设置文字
		ListFun.setListTxt(state,data.require.length);
		//显示表格
		ReqFun.showTableByState(state);
		//隐藏右侧弹出层
		ReqFun.hideRightPop();
		if(state == 16){
			setMarkDefault();
		};
     	$(".js_tablesorter").trigger("update", [true]); 
	};
	
	/**
	 * 设置 mark 默认值 
	 */
	var setMarkDefault = function(){
		$('.js_m_avg,.js_m_pdm,.js_m_desgin,.js_m_rating','#js_list_table_3').each(function(){
			var $this = $(this),
				mark = $this.text();
			$this.addClass(Fun.getRatingColor(mark));
		})
	}
	
	/**
     * 将 ajax 的数据 进行格式转换 方便进行模板替换 
 	 * @param {Object} data
     */
    var changeData = function(data){
    	var arr = [],
    		_state = 'require_state_',
    		length = data.require.length;
    	
    	for(var i = 0;i<length;i++){
    		var state = _state + data.require[i].require_state,
    			avg = 'require_mark_avg_' + data.require[i].require_mark_avg,
    			desgin = 'require_mark_desgin_' + data.require[i].require_mark_desgin,
    			pdm = 'require_mark_pdm_' + data.require[i].require_mark_pdm;
    			
    		data.require[i][state] = true;
    		data.require[i][avg] = true;
			data.require[i][desgin] = true;
			data.require[i][pdm] = true;
    			
    		if(data.require[i].require_desgin_attachment){
				var att_obj = JSON.parse(data.require[i].require_desgin_attachment);
				data.require[i]['url'] = att_obj['attachment'][0]['url'];
			};	
    		//写入缓存
    		localStore.setRequireDataById(data.require[i].require_id,data.require[i]);
    	};
    	return data;
    };
    
    
    /**
     * 设置弹窗内容 
 	 * @param {Object} data
     */
    var setPopCont = function(data){
    	
    	ReqGetSet.setRightPopText(data);
    	//已完成才显示分数
    	if(data.require_state == 3){
    		$('.state_3').show();
    	}else{
    		$('.state_3').hide();
    	}
    	
		
		//待打分 8
		if((data.require_mark_desgin == 0 ) && data.require_state == 4){
			$('#js_req_mark').show();
		}else{
			$('#js_req_mark').hide();
		};
		ReqFun.showRightPop();
    };
    
    /**
     * 改变需求状态 
     *  $tr那一行
     *  
     */
    var successMark = function(data){
    	//如果设计师评分了
    	if(data.require.require_mark_desgin){
    		Fun.alert(1,'打分成功!');
    	};
    	//移除tr
    	ListFun.removeTr(data.require.require_id);
    	//隐藏右侧弹窗
    	ReqFun.hideRightPop();
    };
    
    /**
     *  初始化表单 如 需求类型 需求归档 等
     */
    var initFormData = function(){
    	var typeData = localStore.getTypeData(),
			tpl_type_2 = $('#js_type_tmpl_2').html(),
			listType_2 = Mustache.to_html(tpl_type_2, typeData);
		console.info(typeData,'typeData')	
		$('#js_type_select').html(listType_2);
    };
    
    
    var Events = {
    	/**
    	 * 点击表格一行  显示详细需求信息 
    	 */
    	showPop : function(){
    		$('#js_ui_tables').on('click.show','tbody tr[data-id]',function(){
    			var $this = $(this),
    				require_id = $this.attr('data-id');
    			data = localStore.getRequireDataById(require_id,function(data){
    				console.info('data',data)	
	    			setPopCont(data);
	    			ListFun.getAttrByReqId(require_id,1);
	    			// ListFun.getAttrByReqId(require_id,2);
	
	    			$this.addClass('current').siblings().removeClass('current');
    			});
    			return false;
    		});
    	},
    	/**
    	 * 隐藏右侧弹窗 
    	 */
    	closePop:function(){
    		$(model.id_pop_task).on('click','.js_pop_task_close',function(){
    			console.info('js_pop_task_close')
    			ReqFun.hideRightPop();
    		})
    	},

    	/**
    	 * 状态筛选 
    	 */
    	filterState:function(){
    		$('#js_filter_state li').on('click',function(){
    			var $this = $(this),
    				type = ListFun.getType(),
    				state = $this.attr('data-state');
    			//设置css	
    			$('#js_filter_state li').removeClass('current');
    			$this.addClass('current');//待邮件
				if(state == 7){//待评分
					type = 'all';
					ListFun.setType(type);
				};
				Fun.setUrlParam("state",state);
				//获取数据
				getBaseList(type,state);
    			ListFun.checkType();
    			ListFun.removeDateSelect();
    			return false;
    		})
    	},
    	
    	/**
    	 * 根据日前类型进行筛选 
    	 */
    	filterType:function(){
    		$('#js_filter_type a').on('click',function(){
    			var $this = $(this),
    				type = $this.attr('data-type'),
    				state = ListFun.getState();
    			console.info(type,$this,'type')
    			$this.addClass('current').siblings().removeClass('current');
    			Fun.setUrlParam("type",type);
    			//获取数据
    			getBaseList(type,state);
    			ListFun.removeDateSelect();
    			return false;
    		})
    	},
    	/**
    	 * 保存评分 及其 附件 
    	 */
    	markRequire:function(){
    		$('#js_save_mark_btn').on('click',function(){
    			var obj = ReqGetSet.getDesginMarkData(),
    				mark = parseInt(obj.require.require_mark_desgin,10);
    			console.info(obj,'getDesginMarkData')
    			//选择打分才能继续
    			if(mark){
    				if(mark < 60 && !obj.require.require_desgin_comment ){
    					Fun.alert(0,'设计稿分数太低，请写点评语吧! ');
    				}else{
    					RestApi.putRequire(obj).success(function(data){
							if(data && data.require){
								successMark(data);
							};//if
						});    				}
    				
    			}else{
    				Fun.alert(0,'评分不能为空! ');
    			}
    		});
    	},
		tableSorter:function(){
			$('.js_tablesorter').tablesorter()
		},
		/**
		 * 时间选择 
		 */
		pickDatas:function(){
			$( "#js_date_from" ).datepicker({
				defaultDate: "-1w",
				changeMonth: true,
				changeYear:true,
				// numberOfMonths: 2,
				onSelect: function( selectedDate ) {
					var $date_to = $("#js_date_to"),
						val = $date_to.val(),
						state = ListFun.getState();
					$date_to.datepicker( "option", "minDate", selectedDate );
					if(val){
						getBastListByDate(state,selectedDate,val);
						ListFun.removeType();
					}
				}
			});
			$( "#js_date_to" ).datepicker({
				defaultDate: "+1w",
				changeMonth: true,
				changeYear:true,
				// numberOfMonths: 2,
				onSelect: function( selectedDate ) {
					var $date_from = $("#js_date_from"),
						val = $date_from.val(),
						state = ListFun.getState();
					$date_from.datepicker( "option", "maxDate", selectedDate );
					if(val){
						getBastListByDate(state,val,selectedDate);
						ListFun.removeType();
					}
				}
			});
		},
    	init:function(){
    		this.showPop();
    		this.closePop();
    		this.filterState();
    		this.filterType();
    		this.markRequire();
    		this.tableSorter();
    		this.pickDatas();
    	}
    };
    
    /**
     * 初始化时显示相应的数据状态 
     */
    var initData = function(){
    	ListFun.addCurrent(state,type);
    	//获取数据
    	getBaseList(type,state);
    };
    
    /**
     * 缓存价格信息 
     */
    var setPriceData = function(){
		RestApi.getOnlyPrice().success(function(data){
			//缓存价格信息
			localStore.setPriceData(data);
			console.info(data,'getOnlyPrice')
		})
	};

	/**
	 * 检测用户权限 
	 */
	var checkPower = function(){
		var user = Fun.getUserName();
		if(!user){
			window.location = 'index.php';
			return;
		}
		RestApi.getUserApp(user).success(function(data){
			console.info(data,'data')
			if(data && data.app && data.app.user){
				var power = parseInt(data.app.user.user_power,10);
				//设计师视图  或者管理员
				if(power === 20 || power ===30 || power ===40){
					//缓存app 信息
					localStore.setAppData(data);
					
					initData();
			    	Events.init();
					
			    	ShortCuts.init();
			    	UserInfo.init();
			    	initFormData();
			    	//缓存价格数据
			    	setPriceData();
			    	Fun.navLink(power);
				}else{
					window.location = 'error.html';
				}
			}else{
				window.location = 'error.html'
			}
		})
	};
	
    exports.init = function(){
    	checkPower();
    }
	
});

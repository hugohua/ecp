/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
		UserInfo = require('./ecp.user.info'),
		localStore = require('./ecp.localstore'),
		ReqFun = require('./ecp.require.func'),
		ReqGetSet = require('./ecp.require.getset'),
		ShortCuts = require('./ecp.shortcuts'),
		ListFun = require('./ecp.list.func');
	require('jquery.ui')($);
	require('jquery.field')($);
	require('jquery.tablesorter')($);
	require('jquery.fileDownload')($);
	require('jquery.cookie')($);
	
	var model = {
		id_list_tmpl:'#js_list_tmpl_',
		id_list_table:'#js_list_table_',
		id_pop_task:'#js_pop_task',			//右侧弹窗容器
		id_pop_task_tmpl:'#js_pop_task_tmpl',//右侧弹窗模板
	};
	
	/**
	 * 获取搜索参数 
	 */
	var getParam = function(){
		var obj = {};
		$('#js_form :input[data-name]').each(function(){
			var $this = $(this),
				key = $this.attr('data-name'),
				val = $this.getValue();
			obj[key] = val;	
		});
		return obj;
	};
	
	/**
	 * 设置搜索参数 
	 */
	var setParam = function(data){
		for(var i in data){
			$('#js_form :input[data-name="'+ i +'"]').setValue(data[i]);
		};
	};
	
    /**
     *  初始化表单 如 需求类型 需求归档 等
     */
    var initFormData = function(){
    	var typeData = localStore.getTypeData(),
			tpl_type = $('#js_type_tmpl').html(),
			tpl_type_2 = $('#js_type_tmpl_2').html(),
			listType = Mustache.to_html(tpl_type, typeData),
			listType_2 = Mustache.to_html(tpl_type_2, typeData),
			
			rankData = localStore.getRankData(),
			tpl_rank = $('#js_rank_tmpl').html(),
			listRank = Mustache.to_html(tpl_rank, rankData),
			
			cpData = localStore.getCpData(),
			tpl_cp = $('#js_cp_tmpl').html(),
			listCp = Mustache.to_html(tpl_cp, cpData);
		$('#js_pop_require_type_id select').html(listType);
		$('#js_search_type_id').append(listType);
		
		$('#js_pop_require_rank_id select').html(listRank);
		$('#js_search_rank_id').append(listRank);
		
		$('#js_pop_require_cp_id select').html(listCp);
		$('#js_search_cp_id').append(listCp);
		$('#js_type_select').html(listType_2);
    };
    
    /**
     * 初始化需求 
     */
	var initRequireData = function(){
		var id = Fun.getUrlParam('id');
		console.info(id)
		if(id){
			RestApi.getRequireById(id).success(function(data){
				var require_data = data.require;
				setParam(require_data);
			});
		};
	};
	
	var Events = {
		edit:function(){
			$('#js_form').on('submit',function(){
				if( confirm('确认要修改这个需求数据吗？') ){
					var obj = {
						require:getParam()
					}
					RestApi.putRequire(obj).success(function(data){
						if(data && data.require){
							alert('修改成功');
						}
					});
				}
				return false;
			});
		},
		
		/**
		 * 时间选择 
		 */
		pickDates:function(){
			$( "#js_date_from" ).datepicker({
				//defaultDate: "-2m",
				changeMonth: true,
				//numberOfMonths: 3,
				onSelect: function( selectedDate ) {
					$('#js_date_to').datepicker( "option", "minDate", selectedDate );
				}
			});
			$( "#js_date_to" ).datepicker({
				//defaultDate: "-2m",
				changeMonth: true,
				//numberOfMonths: 3,
				onSelect: function( selectedDate ) {
					$('#js_date_from').datepicker( "option", "maxDate", selectedDate );
				}
			});
		},
		
		/**
		 * 审核设计师 
		 */
		initDesignerPop:function(){
			$('#js_require_verify_user').on({
				'focus':function(){
					var id = $(this).attr('id'),
						rank_id = $('#js_pop_require_rank_id select').getValue();
					Fun.showCheckUserPop(rank_id,'#'+id)
				}
			})
		},

		init:function(){
			this.edit();
			this.pickDates();
			this.initDesignerPop();
		}
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
				//产品经理视图  或 项目经理  或者管理员
				if(power === 10 || power ===30 || power ===40){
					//缓存app 信息
					localStore.setAppData(data);
					
					Events.init();
			    	//设置登录信息 和 退出事件
					UserInfo.init();
					//导航链接
					Fun.navLink(power);
					//审核设计师列表
					Fun.initCheckUserPop();
					//初始化右侧下拉框
					initFormData();
					//初始化数据
					initRequireData();
				}else{
					window.location = 'error.html';
				}
			}else{
				// window.location = 'error.html'
			}
		})
	};
	
    exports.init = function(){
    	checkPower();
    }
	
});

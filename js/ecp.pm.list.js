/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		localStore = require('./ecp.localstore'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		c = require('./ecp.config.user'),
		ReqFun = require('./ecp.require.func'),
		ReqGetSet = require('./ecp.require.getset'),
		ListFun = require('./ecp.list.func');
		
	require('jquery.ui')($);
	require('jquery.tablesorter')($);
	
	var model = {
		id_list_tmpl:'#js_list_tmpl_',
		id_list_table:'#js_list_table_',
		id_pop_task:'#js_pop_task',			//右侧弹窗容器
		id_pop_task_tmpl:'#js_pop_task_tmpl'//右侧弹窗模板
	};
	
	var type = Fun.getUrlParam("type") || 'next',		//日前类型
		state = Fun.getUrlParam("state") || 10;			//状态
		
	/**
	 * 获根据类型获取需求
	 */
	var getBaseList = function(type,state){
        if(state != 60){
            getBaseListAjax(type,state);
        }else{
            getBaseListDel(type,state);
        }
	};
	
	/**
	 * ajax数据 
	 */
	var getBaseListAjax = function(type,state){
		var obj = getPageReqInfo(),
			req = (state != 50) ? RestApi.getRequireStateType(obj.user,obj.power,obj.power_rank,obj.state,obj.type) 
								: RestApi.getRequireBakStateType(obj.user,obj.power,obj.power_rank,50,obj.type),
			
			req2 = (state != 50) ? RestApi.getCountByState(state) 
								: RestApi.getCountBakByState(state);			
			
		req.success(function(data){
			if(data && data.require){
				listAction(data,state,type);
			}
		});
		
		req2.success(function(data){
			for(var i in data.summary){
				$('#js_filter_type a[data-type="'+ i +'"] i').text(data.summary[i]);
			}
		});
	};

    /**
     * 获取已删需求ajax
     * @param type
     */
    var getBaseListDel = function(type,state){
        RestApi.getRequireByDel(type).success(function(data){
            if(data && data.require){
                listAction(data,state,type);
            }
        })

        RestApi.getCountByState(state).success(function(data){
            for(var i in data.summary){
                $('#js_filter_type a[data-type="'+ i +'"] i').text(data.summary[i]);
            }
        });
    };
	
	var getRequireById = function(require_id){
		var state = ListFun.getState(),
			req = (state != 50) ? RestApi.getRequireById(require_id) 
								: RestApi.getRequireBakById(require_id);
		return req;
	};
	
	/**
	 * 获取数据后执行相关的操作 
	 */
	var listAction = function(data,state,type){
		console.info(state,'ssssssss')
		if(state == 5 || state == 11 || state == 12 || state == 50){
			listEmail(data,state);
			setStartEndDate(data,type);
		}else{
			listActHtml(data,state);
		}
		//如果是进行中 则设置需求进度
		if(state == 4){
			setTimeout(function(){
				ReqFun.setUiRank('#js_list_table_4');
			},1000);
		};
		//显示表格
		ReqFun.showTableByState(state);
		//设置文字
		ListFun.setListTxt(state,data.require.length);
	};
	
	/**
	 * 获取开始和结束日期 
	 */
	var setStartEndDate = function(data,type){
		var today = new Date(),
			offset = 0;
		
		switch(type){
			case 'next':
			offset = 1;
			break;
			case 'prev':
			offset = -1;
			break;
		};
		var week = Fun.getWeeks(today,offset),
			start = week.week_day[0],
			weekend = [week.week_day[5],week.week_day[6]],
			end = week.week_day[4],
			length = data.require.length,
			last_start_date = length ? data.require[data.require.length-1]['require_start_date'] : '';
		//判断需求里 是否包含周六日需求  存在 说明 都是包含周六日的需求	
		if($.inArray(last_start_date, weekend) !== -1){
			end = week.week_day[6];
		};
		$('#js_list_table_5').attr({
			'data-start-date':start,
			'data-end-date':end
		});
	};
	
	/**
	 * 获取页面ajax所需信息 
	 */
	var getPageReqInfo = function(){
		var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power,
			power_rank = user_info.users.user_power_rank,
			type = ListFun.getType(),
			state = ListFun.getState();
		var obj = {
			type:type,
			state:state,
			user:user,
			power:power,
			power_rank:power_rank
		};
		return obj;
	}
		
	/**
	 * 根据 状态 类型 CP 获取 需求数 
	 */
	var getRequireByCp = function(cp_id){
		var obj = getPageReqInfo();	
		var req = RestApi.getRequireStateTypeCp(obj.user,obj.power,obj.state,obj.type,cp_id);
		return req;
	};
	
	/**
	 * 根据 状态 类型 CP 获取 需求数 
	 */
	var getRequireByCpAll = function(){
		var obj = getPageReqInfo();	
		var req = RestApi.getRequireStateType(obj.user,obj.power,obj.power_rank,obj.state,obj.type);
		return req;
	};
	
	var getBastListAjax = function(state,start,end){
		var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power,
			power_rank = user_info.users.user_power_rank,
			req = (state != 50) ? RestApi.getRequireByDate(user,power,power_rank,state,start, end) : 
				  RestApi.getRequireBakByDate(user,power,power_rank,state,start, end);
		return req;		  
	}
		
	/**
	 * 根据时间、状态 获取数据 
	 */
	var getBastListByDate = function(state,start,end){
		var req = getBastListAjax(state,start,end);
				
		req.success(function(data) {
			if(data && data.require){
				listAction(data,state);
				//待邮件
				if(state == 5){
					$('#js_list_table_5').attr({
						'data-start-date':start,
						'data-end-date':end
					});
				};
				
			};
		})
	};
	
	/**
	 * html结构
	 * @param {Object} data
	 */
	var listActHtml = function(data,state){
		var tpl = $(model.id_list_tmpl + state).html(),
			listHtml = Mustache.to_html(tpl, changeData(data))
		$('tbody',model.id_list_table + state).html(listHtml);//.parent().show().siblings('.ui_state').hide();
		//已完成状态 设置分数默认值
		if(state == 3){
			setMarkDefault(3);
		}
		//更新sorttable 插件
 		$(model.id_list_table + state).trigger("update"); 
	};
	
	/**
	 * Email模板 
	 */
	var listEmail = function(data,state){
		console.info(data,state,'aaaaaaaaaaaaaaaaa')
		var tpl = $(model.id_list_tmpl + state).html(),
			data_e = changeDataToEmail(changeData(data),state),
			listHtml = Mustache.to_html(tpl, data_e),
			id = model.id_list_table + state;
		
		$(id).find('.js_content').html(listHtml).end().show();//.siblings('.js_ui_page').hide();
		//更新sorttable 插件
		if( $('table:first',id).hasClass('js_tablesorter') ){
			$("thead th:nth-child(1)",id).data("sorter", false); 
			$('.js_tablesorter',id).tablesorter();
		}
 		$(".js_tablesorter").trigger("update"); 
 		
 		var tab_tpl = $('#js_cp_tab_tmpl_'+ state).html(),
			tab_list = Mustache.to_html(tab_tpl, data_e);
		$('#js_cp_tab_'+state).html(tab_list);
		//初始化第一个tab
		$('.nav-tabs a:first',id).tab('show');
			
 		if(state == 11 || state == 12){
 			
			setMarkDefault(state);
			getSumPrice('#js_list_table_'+state);
			
			
		}else if(state == 5){
			setEmailDefaultCp();
			if(data.require.length){
				$('#js_send_pdm').show();
			}else{
				$('#js_send_pdm').hide();
			}
		}
		// else if(state == 50){
			// var tab_tpl = $('#js_cp_tab_tmpl_'+ state).html(),
				// tab_list = Mustache.to_html(tab_tpl, data_e);
 			// $('#js_cp_tab_'+state).html(tab_list);
 			// //初始化第一个tab
			// $('.nav-tabs a:first',id).tab('show');
		// };
	};
	
	/**
	 * 设置Email CP 的默认值 
	 */
	var setEmailDefaultCp = function(){
		$('.js_edit_cp','#js_list_table_5').each(function(){
			var $this = $(this),
				cp_id = $this.attr('data-old-val');
			$this.setValue(cp_id);
		});
	};
	
	/**
	 * 设置 mark 默认值 
	 */
	var setMarkDefault = function(state){
		var $container = $(model.id_list_table + state);
		$('.js_mark_change',$container).each(function(){
			var $this = $(this),
				mark = $this.attr('data-old-val');
			$this.setValue(mark);
		});
		$('.js_m_avg,.js_m_rating,.js_m_rating_pdm,.js_m_pdm,.js_m_desgin',$container).each(function(){
			var $this = $(this),
				mark = $this.text();
			$this.addClass(Fun.getRatingColor(mark));
		});
	};
	
	var getSumPrice = function(id){
		$(id).find('table').each(function(){
			var sum = 0;
			var $table = $(this);
			$table.find('.js_m_fcost').each(function(){
				sum += parseInt($(this).text(),10);
			});
			$table.find('.js_sum_price').text(sum);
		});
	};
	
	/**
	 * 根据CP ID获取CP名称 
	 */
	var getCpNameById = function(cp_id){
		var data = localStore.getCpData();
    	if(!data) return;
    	var data = data.cp;
    	for(var i in data){
    		if(data[i]['cp_id'] == cp_id){
    			return data[i]['cp_name'];
    		}
    	}
	};
	
	/**
	 * 将数据转换成email需要的格式 
	 */
	var changeDataToEmail = function(data,state){
		console.info('changeDataToEmail',state)
		var cp_data = localStore.getCpData(),
			obj = {};
		//构造cp对象	
		for(var i in cp_data.cp){
			//console.info(cp_data['cp'][i]['cp_id'],"cp_data['cp'][i]['cp_id']")
			var cp_id = cp_data['cp'][i]['cp_id'];
			obj[cp_id] = [];
		};
		
		//填充cp对象
		for (var i in data.require){
			var cp_id = data.require[i].cp_id;
			//如果CP被删除，则跳过该CP
			if(obj[cp_id]){
				obj[cp_id].push(data.require[i]);
				//历史需求快照 需求备份
				if(state == 50){
					data.require[i].require_state = 50;
				};
				localStore.setRequireDataById(data.require[i].require_id,data.require[i]);
			}
    	};
    	
    	var arr = [];
    	//删除空的CP对象
    	for(var i in obj){
    		//构造email表格对象
    		if(obj[i].length){
    			arr.push({
    				cp_info:obj[i],
    				cp_length:obj[i].length,
    				cp_name:obj[i][0]['cp_name'],
    				cp_email:obj[i][0]['cp_email'],
    				cp_id:obj[i][0]['cp_id']
    			})
    		}
    		// else{
    			// arr.push({
    				// cp_length:0,
    				// cp_name:getCpNameById(i),
    				// cp_id:i
    			// })
    		// };
    	};
    	
    	var cp_data = localStore.getCpData();
    	// data['cp'] = cp_data['cp'];
    	
    	var nobj = {
    		email_obj:arr,
    		cp:cp_data['cp']
    	};
    	console.info(nobj,obj,'=========')
    	return nobj;
	};
	
	/**
	 * 将数据转换成email需要的格式 
	 */
	var changeDataToEmailByRank = function(data){
		var rank_data = localStore.getRankData(),
			obj = {};
		//构造cp对象	
		for(var i in rank_data.rank){
			//console.info(cp_data['cp'][i]['cp_id'],"cp_data['cp'][i]['cp_id']")
			var rank_id = rank_data['rank'][i]['rank_id'];
			obj[rank_id] = [];
		};
		
		//填充cp对象
		for (var i in data.require){
			var rank_id = data.require[i].rank_id;
			//如果rank被删除，则跳过该CP
			if(obj[rank_id]){
				obj[rank_id].push(data.require[i]);
			}
    	};
    	
    	var arr = [];
    	//删除空的CP对象
    	for(var i in obj){
    		//构造email表格对象
    		if(obj[i].length){
    			arr.push({
    				rank_info:obj[i],
    				rank_length:obj[i].length,
					rank_name:obj[i][0]['rank_name']
    			})
    		};
    	};
    	
    	var nobj = {
    		email_obj:arr,
    		length : data.require.length,
			start_date : $('#js_list_table_5').attr('data-start-date'),
			end_date : $('#js_list_table_5').attr('data-end-date')
    	};
    	console.info(rank_data,nobj,'111111111111111111111111111111');
    	return nobj;
	};
	
	/**
     * 将 ajax 的数据 进行格式转换 方便进行模板替换 
 	 * @param {Object} data
     */
    var changeData = function(data){
    	for (var i in data.require){
    		var rank			= 'require_rank_' + data.require[i].require_rank_id,					//归类ID
    			type 			= 'require_type_' + data.require[i].require_type_id,					//类型ID
    			type_state 		= 'require_type_state_' + data.require[i].require_type,					//正常或临时需求
    			modify_attr		= 'require_modify_attr_' + data.require[i].is_modify_attr,				//是否修改需求属性
    			turn_req 		= 'require_turn_req_' + data.require[i].is_turn_require,					//是否是驳回的需求
    			price_change	= 'require_change_' + data.require[i].require_pm_cost,					//价格是否有调整
    			avg 			= 'require_mark_avg_' + data.require[i].require_mark_avg,				//平均分
    			desgin 			= 'require_mark_desgin_' + data.require[i].require_mark_desgin,		//设计师分数
    			pdm 			= 'require_mark_pdm_' + data.require[i].require_mark_pdm,				//pm分数
    			type_check		= 'type_check_' + data.require[i].type_check;						//是否需要评分
    			
    		data.require[i][rank] = true;
    		data.require[i][type] = true;
    		data.require[i][type_state] = true;
    		data.require[i][modify_attr] = true;
    		data.require[i][price_change] = true;
    		data.require[i][avg] = true;
			data.require[i][desgin] = true;
			data.require[i][pdm] = true;
			data.require[i][type_check] = true;
			data.require[i][turn_req] = true;
			data.require[i]['desgin_verify_user'] = Fun.getEnglishName(data.require[i]['require_verify_user']);
            data.require[i]['state_name'] = ReqFun.getStateDetailName(data.require[i].require_state,data.require[i]);
			//产品打分后，设计才能打分
			if( data.require[i].require_mark_pdm != 0 ){
				data.require[i]['desgin_not_mark'] = true;
			}
			
			if(data.require[i].require_desgin_attachment){
				var att_obj = JSON.parse(data.require[i].require_desgin_attachment);
				data.require[i]['url'] = att_obj['attachment'][0]['url'];
			};
			
    		//写入缓存
    		localStore.setRequireDataById(data.require[i].require_id,data.require[i]);
    		// console.info(data.require[i],'changedata')
    	}
    	var cp_data = localStore.getCpData();
    	data['cp'] = cp_data['cp'];
    	console.info(data,'changedata')
    	return data;
    };
    
    /**
     * 设置弹窗内容 
 	 * @param {Object} data
     */
    var setPopCont = function(data){
    	//PM视图始终显示输入框
    	//文本状态
    	if(data.require_state == 11 || data.require_state == 12 || data.require_state == 50){
    		$('#js_add_attr_btn,#js_pop_attribute_v_1,#js_pop_task .state_1 input,#js_pop_task .state_1 select,#js_pop_task .state_1 textarea ,#js_pop_upload,#js_edit_req_btn').hide();
    		$('.state_1 span,#js_pop_attribute_t_1,#js_pop_require_type_id strong').show();
    		ReqGetSet.setRightPopText(data);
    	}else{
    		$('#js_add_attr_btn,#js_pop_attribute_v_1,#js_pop_task .state_1 input,#js_pop_task .state_1 select,#js_pop_task .state_1 textarea ,#js_pop_upload,#js_edit_req_btn').show();
    		$('.state_1 span,#js_pop_attribute_t_1,#js_pop_require_type_id strong').hide();
    		ReqGetSet.setRightPopInfo(data,true);
    	};
    	
    	//已完成才显示分数
    	if(data.require_state == 3 || data.require_state == 11){
    		$('#js_req_mark,#js_confirm_tr').show();
    		//部分显示
    	}else if(data.require_state == 12){
    		$('#js_req_mark').show();
    		$('#js_confirm_tr').hide();
    	}else{
    		$('#js_req_mark,#js_confirm_tr').hide();
    	}
    	
    	
    	if(data.require_state == 3){
    		$('#js_state_3').show();
    		$('#js_state_4').hide();
    	}else{
    		$('#js_state_3').hide();
    		$('#js_state_4').show();
    	};
    	
    	if(data.require_state == 11){
    		$('#js_confirm_price_btn,#js_confirm_save_price_btn').show();
    		$('#js_save_price_btn').hide();
    	}else{
    		$('#js_confirm_price_btn,#js_confirm_save_price_btn').hide();
    		$('#js_save_price_btn').show();
    	};
    	
    	//待排期状态 不显示修改CP
    	if(data.require_state == 1){
    		$('#js_pop_require_cp_id').hide();
    	}else{
    		$('#js_pop_require_cp_id').show();
    	};
    	
    	//待邮件
    	if(data.require_state == 5){
    		$('#js_pop_require_cp_id').hide();
    	}else{
    		$('#js_pop_require_cp_id').show();
    	}

    	if(data.require_pdm_comment){
    		$('#js_pop_require_pdm_comment').show();
    	}else{
    		$('#js_pop_require_pdm_comment').hide();
    	};
    	if(data.require_desgin_comment){
    		$('#js_pop_require_desgin_comment').show();
    	}else{
    		$('#js_pop_require_desgin_comment').hide();
    	}

        //几月几号之前则不允许修改
        //2014/3/10号（含10号）之前的数据全部冻结，只能查询
        var $eidtForm = $('#js_req_mark,#js_edit_req_btn,#js_pop_editstate,#js_pop_editclear,#js_pop_editstate');
        if(new Date(data.require_start_date).getTime() <= 1394409600000){
            $eidtForm.hide()
        }else{
            $eidtForm.show();
        }

		ReqFun.showRightPop();
    };
    
    
    /**
      * 改变表格行 状态  
      * state: 状态ID 
      */
    var changeTrState = function($tr,cp_id){
    	console.info(cp_id)
    	if(cp_id != 0){
    		$tr.addClass('select_done');
    	}else{
    		$tr.removeClass('select_done');
    	}
    };
    
    /**
     * 改变需求状态 
     *  $tr那一行
     *  
     */
    var successMark = function(data){
    	//如果PM评分了
    	if(data.require.require_mark_pdm){
    		Fun.alert(1,'打分成功，该需求已完成，点击【确认】，需求归档到【已完成】 状态');
    	}else{
    		Fun.alert(1,'打分成功，等待 产品经理 打分，点击【确认】，需求归档到【进行中】 状态')
    	}
    	//移除tr
    	ListFun.removeTr(data.require.require_id);
    	//隐藏右侧弹窗
    	ReqFun.hideRightPop();
    };
    
    /**
     * 获取排期邮件列表的 数据 用于更新需求状态 
     */
    var getEmailReqData = function($container){
		var arr = [];
		$container.find('tbody tr').each(function(){
			var $tr = $(this),
				req_id = $tr.attr('data-id');
			arr.push(req_id);
		});
		var data = {
			require:arr.join(',')
		};
		console.info(data,'data')
		return data;
    };
    
    var changeCp = function($select){
    	var $this = $select,
			val = parseInt($this.getValue(),10),
			req_id = $this.attr('data-id'),
			state = 5,
			req,
			//ajax修改数据
			obj = {
				require:{
					require_id:req_id,
					require_state:state,		//待邮件
					require_cp_id:val
				}
			};
		
		//不存在值时	
		if(!val){
			state = 1;
			obj = {
				require:{
					require_id:req_id,
					require_state:state,		//返回待排期
					require_cp_id:''
				}
			};
		};
		//ajax 更新数据
		req = RestApi.putRequire(obj);
		
		return req;
    };
    
    /**
     * 修改分数  object
     */
    var changeMark = function($select,callback){
    	var key = $select.attr('data-name'),
    		$tr = $select.closest('tr'),
    		req_id =$tr.attr('data-id'),
			mark = parseInt($select.attr('data-mark')),	//另一个分数
			val = parseInt($select.getValue());			//本身分数
			
			localStore.getRequireDataById(req_id,function(data){
				var avg = (mark + val)/2,
					rating = Fun.getRating(avg),												//评级
					num = parseInt(data.require_ads,10),										//需求数量
					start_date = data.require_start_date,										//需求创建时间
					base_cost = localStore.getPriceByIds(data.cp_id,data.type_id,rating,start_date) * num,		//基础价格
					require_pm_cost = data.require_pm_cost || 0,
					change_cost = data.require_pm_cost_change == 1 ? require_pm_cost : -require_pm_cost,	//调整价格
					attr_cost = data.require_base_cost - (localStore.getPriceByIds(data.cp_id,data.type_id,$tr.find('.js_m_rating').text(),start_date) * num), //附加属性价格	
					obj = {
						require:{
							require_id			:req_id,
							require_mark_avg	:avg,
							require_rating		:Fun.getRating(avg),
							require_base_cost	: base_cost + attr_cost,
							require_final_cost	: base_cost + parseFloat(change_cost) + attr_cost
						}
					};
				obj.require[key] = val;
				console.info(obj,rating,data.require_base_cost , rating,start_date,'changeMark')
				callback(obj);
			});
		// return obj;
    };
    
    /**
     * 打分成功后的回调函数 
     */
    var markSuccess = function($tr,data){
    	$tr.find('span.js_m_pdm').text(data.require.require_mark_pdm);
    	$tr.find('span.js_m_desgin').text(data.require.require_mark_desgin);
    	$tr.find('select[data-name="require_mark_pdm"]').attr('data-mark',data.require.require_mark_desgin);
    	$tr.find('select[data-name="require_mark_desgin"]').attr('data-mark',data.require.require_mark_pdm);
    	//先移除样式
    	$('td span.js_m_avg,td span.js_m_rating',$tr).removeClass('tag_1 tag_2 tag_3');
    	
    	$tr.find('td span.js_m_avg').text(data.require.require_mark_avg).addClass(Fun.getRatingColor(data.require.require_mark_avg));
    	$tr.find('td span.js_m_rating').text(data.require.require_rating).addClass(Fun.getRatingColor(data.require.require_rating));
    	$tr.find('td span.js_m_fcost').text(data.require.require_final_cost);//价格
    	$tr.effect("highlight",1000);
    };
    
    /**
     * 更新表格 需求数
     */
    var updateTableNum = function($container){
    	console.info($container)
    	var id = $container.attr('id');
    	var length = $container.find('tbody tr').length;
    	if(length){
    		$container.find('h4 .js_cp_length').text(length);
    		$('#js_cp_tab_5 a[href="#'+ id +'"] i').text(length);
    	}else{
    		$container.remove()
    		$('#js_cp_tab_5 a[href="#'+ id +'"]').closest('li').remove();
    		$('#js_cp_tab_5 li:first a').trigger('click');
    		console.info($('#js_cp_tab_5 li:first'),'pppppp')
    	};
    	console.info(id,'id')
    };
    
    /**
     * 根据不同的状态显示相应的界面 
     */
    var showState = function(state,type){
    	if(state == 10){
    		showSummary();
			//显示表格
			ReqFun.showTableByState(state);
		}else{
			//获取数据
			getBaseList(type,state);
		}
    };
    
    /**
     * 检测 还没有被选中的CP
     */
    var checkNotChangeCp = function(){
    	var length = $('#js_list_table_1').find('tr.tr_state_1:visible').not('.js_cp_done').length,
    		done_len = $('#js_list_table_1').find('tr.js_cp_done:visible').length,
    		check = length;
    	console.info(length,done_len)
    	//如果存在
    	if(length && !done_len){
    		check = -1;
    	}
    	return check;
    };
    
    /**
     * 获取需求概况 
     */
    var showSummary = function(){
    	var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power;
    	RestApi.getSummary('all',power).success(function(data){
    		ReqGetSet.setSummary(data,power);
    	});
    };
    
    /**
     * 获取email发送邮件的时间
     */
    var getEmailSendDate = function(prefix){
    	var $parent = $('#js_list_table_5'),
			start = $parent.attr('data-start-date'),
			end = $parent.attr('data-end-date'),
			date_str = '';
		if(start && end){
			date_str = ' ('+ start + '~' + end +') ';
		};	
    	
    	return 	date_str;
    };
    
    /**
	 * 获取收信人和抄送人 
	 */
	var getEmailUsers = function(){
		var obj = {
			sender			: Fun.getCurUserEmali(),
			receiver 		: $('#js_email_receiver').val(),
			cc				: $('#js_email_cc').val()
		};
		return obj;
	};
	
	var setEmailUsers = function(data){
        console.log(data,'data===')
		var user = Fun.getCurUserEmali();
		$('#js_email_receiver').val(data.receiver + user);
		$('#js_email_cc').val(data.cc);
	};
    
     /**
	 * 获取email发送数据 
	 */
	var getEmailDataForCp = function($container){
		var sender = Fun.getCurUserEmali(),
			$parent = $('#js_list_table_5')
			cp_name = $container.find('.js_cp_name').text(),
			cp_email = $container.attr('data-email'),
			start = $parent.attr('data-start-date'),
			end = $parent.attr('data-end-date'),
			date_str = '',
			msg = setEmailTableStyle($container);
		
		if(start && end){
			date_str = ' ('+ start + '~' + end +') ';
		}
		
		var obj = {
			subject			:"【京东外包】"+ cp_name + date_str + "周工作计划",
			sender			:sender,		//发送者
			receiver		:cp_email,		//接受者
			msg				:msg
		};
		return obj;
	};
	
	/**
	 * email for pdm 
	 * receiver:接收者
	 */
	var getEmailDataForPdm = function($container,receiver){
		var sender = Fun.getCurUserEmali(),
			$html = $($container.html()),
			$parent = $('#js_list_table_5')
			cp_email = $html.attr('data-email'),
			start = $parent.attr('data-start-date'),
			end = $parent.attr('data-end-date'),
			date_str = '',
			msg = setEmailTableStyle($html,true);
		
		if(start && end){
			date_str = ' ('+ start + '~' + end +') ';
		}
		
		var obj = {
			subject			:"【电商用户体验设计部-设计管理组】" + date_str + "周工作计划",
			sender			:sender,		//发送者
			receiver		:receiver,		//接受者
			cc				:c.email_cc,
			msg				:msg
		};
		return obj;
	};
	
	var changeEmailDetailData = function(data){
		data.cp_name = data.require[0].cp_name;
		data.cp_length = data.require.length;
		data.start_date = $('#js_list_table_5').attr('data-start-date');
		data.end_date = $('#js_list_table_5').attr('data-end-date');
		return data;
	};
	
	/**
	 * 获取收件人 
	 */
	var getReceivers = function(data){
		var receiver = [],
			email = '';
		for(var i in data){
			receiver.push(data[i]['require_creator']);
		};
		//清除重复收件人
		receiver = Fun.clearSort(receiver).join(';');
		RestApi.getUserInfoByName(receiver).success(function(data){
			if(data && data.users){
				for(var i in data.users){
					email += data.users[i]['user_email'] + ';';
				}//for
				
				//设置email
				setEmailUsers({
					receiver:email,
					cc:c.email_cc
				});
				
			}//if
		});
		
		
		//receiver = Fun.clearSort(receiver).join(';');
		return receiver;	
	};
	
	var _changePrice = function(){
		var cp_id = $('#js_pop_require_cp_id select').getValue(),
			type_id = $('#js_pop_require_type_id select').getValue();
		$('#js_pop_require_type_id').attr('data-type-id',type_id);
		$('#js_pop_cp_id').val(cp_id);
		console.info(cp_id,type_id,'cp_id')
		
		ReqGetSet.getPricesForSave(function(price_data){
			$('#js_pop_require_base_cost').text(price_data.require.require_base_cost);
			$('#js_require_final_cost').val(price_data.require.require_final_cost);
			//判断价格是否是数字
			if(!$.isNumeric(price_data.require.require_final_cost)){
				alert('价格计算出错，是否是修改了需求类型？可以试试【清除需求评分】！');
			};
		});
		
	};
    
    var getReqIds = function(cp_id){
		var ids = $('#js_ui_tables .js_ui_page:visible input[name="js_cp_group_'+ cp_id +'"]').getValue();
		return ids;					
	};
	
	/**
	 * 检测需求类型是否有变更 
	 */
	var checkTypeChange = function(obj){
		var $type = $('#js_pop_require_type_id'),
			old_check = $type.attr('data-type-check'),										//原始需求打分状态
			//old_state = data.require_state,												//原始需求状态
			new_check = $type.find('select option:checked').attr('data-check'),				//新打分状态
			type = 0;
		//从需要评分 到 不需要评分
		if(old_check == 1 && new_check == 0){
			obj.require.require_mark_pdm = 0;
			obj.require.require_mark_desgin = 0;
			obj.require.require_mark_avg = 0;
			obj.require.require_rating = null;
			obj.require.require_rating_pdm = null;
		}
		return obj;
	};

	/**
	 * 设置email发送邮件
	 * data 配套属性 数据
	 * $container 邮件容器ID
	 */
	var setEmailAttr = function(data){
		var data = data.attribute;
		for(var i in data){
			var str = '配套：'+ data[i].type_name + '; 数量：'+ data[i].att_text + '<br />';
			$('#js_demand_'+ data[i].att_require_id).append(str);
		}
	};
	
	/**
	 * 同步易讯服务器的图片到本地服务器 
	 */
	var sysIcsonImg = function(require_id){
		//$container = js_att_list_2
		$('#js_att_list_2').find('a').each(function(){
			var url = $(this).attr('href');

			//非OA服务器
			if(url.indexOf('shyw') !== -1 ){
                console.log(url);
                
				RestApi.sysIcsonImg(require_id,url);
			}
		});
	};
    
    var Events = {
    	/**
    	 * 点击表格一行  显示详细需求信息 
    	 */
    	showPop : function(){
    		$('#js_ui_tables').on('click.show','.js_tablesorter tbody tr[data-id]',function(){
    			var $this = $(this),
    				require_id = $this.attr('data-id');
    				
    				
    			//localStore.getRequireDataById(require_id,function(data){
    			getRequireById(require_id).success(function(data){
    				var data = data.require;	
    				console.info(data,'ddddddd');	
	    			$this.addClass('current').siblings().removeClass('current');	
	    			setPopCont(data);
	    			if(data.require_state !== 50){
	    				ListFun.getAttrByReqId(require_id,1);
	    			}else{
	    				ListFun.getAttrByReqBakId(require_id,1);
	    			}
	    			// return false;
    			});
    			
    		});
    	},
    	/**
    	 * 隐藏右侧弹窗 
    	 */
    	closePop:function(){
    		$(model.id_pop_task).on('click','.js_pop_task_close',function(){
    			ReqFun.hideRightPop();
    		})
    	},
    	/**
		 * 点击右侧保存 
		 */
		editPopReq:function(){
			$('#js_edit_req_btn button.js_save').on('click',function(){
				
				var obj = ReqGetSet.getRightPopInfo(),
					validate = Fun.validate('#js_form_pop');
				
				console.info(obj,validate,'aa')
				if(validate){
					obj = checkTypeChange(obj);
					//提交数据	
					RestApi.putRequire(obj).success(function(data){
						if(data && data.require){
							var $tr = $('#js_ui_tables table:visible tr[data-id="'+ data.require.require_id +'"]');
							console.info($tr,'tr');
							ListFun.updateTrForPm($tr,data);
							//隐藏右侧弹出层
    						ReqFun.hideRightPop();
							localStore.setRequireDataById(data.require.require_id,data.require);
							//更新需求属性
							ReqGetSet.insertUpdateAttr(data.require.require_id,$('#js_pop_attribute_v_1'));
						};
					});
				}else{
					Fun.alert(0,'所有输入框不为空！');
				};
			});
		},
		/**
		 * 删除需求 
		 */
		delPopReq:function(){
			$('#js_edit_req_btn button.js_del').on('click',function(){
				var del_id = $('#js_pop_require_id').val(),
					del_user = Fun.getUserName();
				//隐藏操作区域
				if(confirm('你确定要删除这个需求吗？')){
					RestApi.delRequireById(del_id).success(function(data){
						//删除页面数据
						ListFun.removeTr(del_id);
						ReqFun.hideRightPop();
					});
				};
			});
		},
		
		/**
		 * 中止需求 
		 * 中止的需求将自动归档到 其他类型
		 * 同时状态转为 待评分 状态
		 */
		abortPopReq:function(){
			$('#js_edit_req_btn button.js_abort').on('click',function(){
				var req_id = $('#js_pop_require_id').val();
				var obj = {
					require:{
						require_id:$('#js_pop_require_id').val(),
						require_type_id:9,		//其他类型
						require_mark_pdm	:0,		//清空需求分数
    					require_mark_desgin	:0,
    					require_mark_avg	:0,
    					require_rating_pdm	:null,
    					require_rating		:null,
    					require_check		:null
					}
				}
				//隐藏操作区域
				if(confirm('中止需求 将会把该需求自动归类到【其他】类型，你确定要中止该需求吗？')){
					RestApi.putRequire(obj).success(function(data){
						//删除页面数据
						ListFun.removeTr(data.require.require_id);
						localStore.setRequireDataById(data.require.require_id,data.require);
						ReqFun.hideRightPop();
						//Email邮件通知
	    				//ReqFun.actionEmail(data,'中止');
					});
				};
			});
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
    			$this.addClass('current');
				Fun.setUrlParam("state",state);
				//隐藏右侧弹出层
    			ReqFun.hideRightPop();
    			
    			showState(state,type);
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
    			//隐藏右侧弹出层
    			ReqFun.hideRightPop();
    			ListFun.removeDateSelect();
    			return false;
    		})
    	},
    	/**
    	 * 选择CP服务商事件 选择后 在tr标明已经选择 
    	 */
    	changeCp:function(){
    		$('#js_ui_tables').on('change','.js_cp_change',function(){
    			var $this = $(this),
    				$tr = $this.closest('tr'),
    				req = changeCp($this);
    			req.success(function(data){
					//修改成功后的回调
					if(data && data.require){
						changeTrState($tr,data.require.require_cp_id);
						//同步右边弹出层 修复数据不同步的
						$('#js_pop_require_cp_id select').setValue(data.require.require_cp_id);
					};
				});
    			return false;
    		});
    		
    		//
    		// $('#js_ui_tables').on('change','.js_cp_change',function(){
    			// var $this = $(this),
    				// $tr = $this.closest('tr'),
    				// val = parseInt($this.getValue());
    			// if(val){
    				// $tr.addClass('js_cp_done');
    			// }else{
    				// $tr.removeClass('js_cp_done');
    			// }	
    			// return false;
    		// });
    		
    		//阻止tr点击冒泡事件
    		$('#js_ui_tables').on('click','.js_cp_change',function(){
    			return false;
    		})
    	},
    	/**
    	 * cp 排期确认 
    	 */
    	changeCpSubmit:function(){
    		$('#js_cp_change_btn').on('click',function(){
    			
    			//选择所有可见的 待排期 列表
    			var arr = {};
    			$('#js_list_table_1').find('tr.js_cp_done:visible').each(function(){
    				var $tr = $(this),
    					req_id = $tr.attr('data-id'),
    					cp_id = $tr.find('.js_cp_change').getValue();
    				arr[req_id]	= cp_id;
    			});
    			var data = {
    				require:arr
    			};
    			
    			var check = checkNotChangeCp();
    			console.info(check,'check')
    			//存在尚未选择的CP 或者 全部CP选择
    			if(check && (check!==-1) || !check){
    				if(confirm('尚有【'+ check +'】个需求未选择 CP服务商，确认要提交吗？')){
    					//更新数据
	    				RestApi.putCpByIds(data).success(function(data){
	    					if(data && data.require){
	    						Fun.alert(1,'排期成功，需求自动转入【进行中】状态!');
	    						//清除  cache
								
	    						for(var i in data.require){
	    							var $tr = $('#js_list_table_1').find('tr[data-id="'+ i +'"]');
	    							$tr.remove();
	    						}
	    						
	    					}
						});//rest api
    				};//if
    			}else{
    				Fun.alert(0,'请选择CP服务商!');
    			}
    		});
    	},
    	/**
    	 * 修改分数
    	 */
    	changeMark:function(){
    		$('#js_ui_tables').on('change','.js_mark_change',function(){
    			var $this = $(this),
    				$tr = $this.closest('tr');
    			changeMark($this,function(obj){
    				//ajax 更新数据
	    			RestApi.putRequire(obj).success(function(data){
						//修改成功后的回调
						if(data && data.require){
							markSuccess($tr,data);
							localStore.setRequireDataById(data.require.require_id,data.require);
						};
					});
    			});
    			
    			return false;
    		});
    		//阻止tr点击冒泡事件
    		$('#js_ui_tables').on('click','.js_mark_change',function(){
    			return false;
    		})
    	},
    	/***
    	 * 修改价格 
    	 */
    	changePrice:function(){
    		//最终价格
    		var _finalp = function(){
    			var change = parseInt($('#js_pop_require_pm_cost_change').getValue(),10),
    				base_price = parseInt($('#js_pop_require_base_cost').text(),10),
    				pm_price = parseInt( $('#js_pop_require_pm_cost').val(),10 ),
    				final_price = change ? (base_price + pm_price) : (base_price - pm_price);
    			$('#js_require_final_cost').val(final_price).effect("highlight",1000);	
    		}
    		
    		//动态调整价格
    		$('#js_pop_require_pm_cost').on('input',function(){
    			_finalp();
    		});
    		//动态调整价格
    		$('#js_pop_require_pm_cost_change').on('change',function(){
    			_finalp();
    		});
    		//动态调整中间价
    		$('#js_require_final_cost').on('input',function(){
    			var final_price = parseInt($(this).val(),10),
    				base_price = parseInt($('#js_pop_require_base_cost').text(),10),
    				diff = final_price - base_price;
    			//正数	
    			if(diff>0){
    				$('#js_pop_require_pm_cost_change').setValue(1);
    				$('#js_pop_require_pm_cost').val(diff)
    			}else{
    				$('#js_pop_require_pm_cost_change').setValue(0);
    				$('#js_pop_require_pm_cost').val(Math.abs(diff));
    			}	
    		});
    		//动态调整价格
    		//保存
    		$('#js_save_price_btn').on('click',function(){
    			var p_obj  = ReqGetSet.getPriceInfo(),
    				r_obj = ReqGetSet.getRightPopInfo(),
    				change_pirce = $('#js_pop_require_pm_cost').val();
    			//如果价格有调整
    			if(change_pirce && (change_pirce !=0) && !$('#js_pop_require_cost_comment').val()){
    				Fun.alert(0,'请输入价格调整理由！');
    				return;
    			};
    			$.extend(true, p_obj, r_obj);
    			
    			//存在值
    			p_obj = checkTypeChange(p_obj);
				RestApi.putRequire(p_obj).success(function(data){
    				console.info(data);
    				Fun.alert(1,'保存成功！');
    				//隐藏右侧弹出层
    				ReqFun.hideRightPop();
    				localStore.setRequireDataById(data.require.require_id,data.require);
					//更新需求属性
					ReqGetSet.insertUpdateAttr(data.require.require_id,$('#js_pop_attribute_v_1'));
    				//更新表格数据
    				var $tr = $('#js_ui_tables table:visible tr[data-id="'+ data.require.require_id +'"]');
					ListFun.updateTrForPm($tr,data);
    				$tr.find('.js_m_fcost').text(data.require.require_final_cost);
    			})

    			//同步易讯图片
    			sysIcsonImg(p_obj.require.require_id);
    			
    		});
    		//确认结算
    		$('#js_confirm_price_btn').on('click',function(){
    			var p_obj  = ReqGetSet.getPriceInfo();
    			
    			//如果价格有调整
    			if(($('#js_pop_require_pm_cost').val() != 0) && !$('#js_pop_require_cost_comment').val()){
    				Fun.alert(0,'请输入价格调整理由！');
    				return;
    			};
    			p_obj.require.require_state = 12;//已结算
    			//存在值
				RestApi.putRequire(p_obj).success(function(data){
    				console.info(data);
    				Fun.alert(1,'结算成功，需求自动转入已结算状态！');
    				//隐藏右侧弹出层
    				ReqFun.hideRightPop();
    				localStore.setRequireDataById(data.require.require_id,data.require);
    				ListFun.removeTr(data.require.require_id);
    			})
    		});
    		//确认保存
    		$('#js_confirm_save_price_btn').on('click',function(){
    			var p_obj  = ReqGetSet.getPriceInfo();
    			
    			//如果价格有调整
    			if(($('#js_pop_require_pm_cost').val() != 0) && !$('#js_pop_require_cost_comment').val()){
    				Fun.alert(0,'请输入价格调整理由！');
    				return;
    			};
    			//存在值
				RestApi.putRequire(p_obj).success(function(data){
    				console.info(data);
    				Fun.alert(1,'价格保存成功！');
    				//隐藏右侧弹出层
    				ReqFun.hideRightPop();
    				localStore.setRequireDataById(data.require.require_id,data.require);
    				
    				var $tr = $('#js_ui_tables table:visible tr[data-id="'+ data.require.require_id +'"]');
    				//更新价格字段
    				$tr.find('.js_m_fcost').text(data.require.require_final_cost);
    				//价格有调整
    				if( (data.require.require_pm_cost != 0) && (!$tr.find('.js_change_type .js_tiao').lenght)){
    					$tr.find('.js_change_type').append('<span title="价格有做调整" class="tag_3 js_tiao">调</span>');
    				};
    				console.info(data.require.require_pm_cost,$tr.find('.js_change_type .js_tiao').lenght)
    			})
    		});
    	},
    	/**
    	 * 需求审核通过 转入待结算状态 
    	 */
    	passReq:function(){
    		$('#js_pass_btn').on('click',function(){
    			var obj = ReqGetSet.getRightPopInfo(),
					validate = Fun.validate('#js_form_pop');
				
				if(validate){
					
					//如果价格有调整
	    			if(($('#js_pop_require_pm_cost').val() != 0) && !$('#js_pop_require_cost_comment').val()){
	    				Fun.alert(0,'请输入价格调整理由！');
	    				return;
	    			};
					
					var price_data  = ReqGetSet.getPriceInfo();
					//待结算状态
					obj.require.require_state = 11;
					$.extend(true,obj, price_data);
					console.info('obj',obj);
					//提交数据	
					RestApi.putRequire(obj).success(function(data){
						if(data && data.require){
							//隐藏右侧弹出层
    						ReqFun.hideRightPop();
							localStore.setRequireDataById(data.require.require_id,data.require);
							//更新需求属性
							ReqGetSet.insertUpdateAttr(data.require.require_id,$('#js_pop_attribute_v_1'));
							//删除该行
							ListFun.removeTr(data.require.require_id);
							Fun.alert(1,'审核成功，需求自动转入待结算状态！');
						};
					});
					
					//同步易讯图片
    				sysIcsonImg(obj.require.require_id);
					
				}else{
					Fun.alert(0,'所有输入框不为空！');
				};
				
    		});
    	},
    	/**
    	 * 驳回 需求
    	 */
    	turnDownReq:function(){
    		$('#js_turn_down_btn,#js_turn_down_btn2').on('click',function(){
    			if(confirm('驳回需求，会将需求状态转为【待评分】，同时清空产品和设计的评分、评级。确定要驳回该需求吗？')){
    				var data = {
	    				require:{
	    					require_id			:$('#js_pop_require_id').val(),		
	    					require_state		:4,
	    					require_mark_pdm	:0,
	    					require_mark_desgin	:0,
	    					require_mark_avg	:0,
	    					require_rating_pdm	:null,
	    					require_rating		:null,
	    					require_check		:null,
	    					is_email			:'turn require',
	    					is_turn_require		:1					//驳回需求
	    					
	    				}
	    			};
	    			RestApi.putRequire(data).success(function(data){
	    				if(data && data.require){
	    					ListFun.removeTr(data.require.require_id);
	    					//隐藏右侧弹出层
    						ReqFun.hideRightPop();
	    					Fun.alert(1,'驳回需求成功，该需求自动返回待评分状态！');
	    					
	    					//Email邮件通知
	    					ReqFun.actionEmail(data,'驳回');
	    					
	    				}
	    			});
    			};
    		});
    	},
    	tableSorter:function(){
    		$("#js_list_table_11 thead th:eq(0)").data("sorter", false); 
    		
			$('.js_tablesorter').tablesorter(); 
		},
		/**
		 * 显示Email发送 
		 */
		showSendEmail:function(){
			$('#js_ui_tables').on('click.email','.js_send_email',function(){
				
				var $this = $(this),
					cp_id = $this.attr('data-cp-id'),
					cp_name = $this.attr('data-cp-name'),
					ids = getReqIds(cp_id),
					bak = $this.attr('data-bak'),
					req,attr_req;
					
				if(!ids){
					Fun.alert(0,'请先选择要发送排期邮件的需求!');
					return;
				};
				
				req = bak ? RestApi.getRequireBakByIds(ids) : RestApi.getRequireByIds(ids);
				attr_req = bak ? RestApi.getAttributeBakByIds(ids) : RestApi.getAttributeByIds(ids);
				
				$.when(req,attr_req).done(function(data,attrs){
					console.info(data,attrs,'showSendEmail');
					var data = data[0],
						attrs = attrs[0];
					if(data && data.require){
						var tpl =  $('#js_email_detail').html(),					//邮件HTML模板结构
							listHtml = Mustache.to_html(tpl, changeEmailDetailData(data));
						Fun.showWindow('邮件预览',listHtml,'#js_send_email_cp_btn');	
						//补充配套类型
						setEmailAttr(attrs);
						//更新sorttable 插件
						$('#js_ui_window .js_tablesorter').tablesorter({
							cssInfoBlock : "tablesorter-no-sort",
							sortList: [[4,0]],
							widgets: [ 'email'] 
						});
						//收信人
						setEmailUsers({
							receiver:$this.attr('data-email') + ';',
							cc:c.email_cp_cc
						});
						$('#js_send_email_cp_btn').attr('data-cp-name',cp_name)
					};
				})
				// req.success(function(data){
				// });
				
				return false;
			});
			
			//发送产品经理周知
			$('#js_send_pdm_btn').on('click',function(){
				var $this = $(this),
					start = $('#js_date_from').val(),
					end = $('#js_date_to').val(),
					req;
				
				if( start && end){
					var state = ListFun.getState();
					req= getBastListAjax(state,start,end);
				}else{
					req = getRequireByCpAll();
				}
				req.success(function(data){
					console.info(data,'showSendEmail');
					if(data && data.require){
						var tpl =  $('#js_email_detail_pdm').html(),					//邮件HTML模板结构
							listHtml = Mustache.to_html(tpl, changeDataToEmailByRank(data));
						Fun.showWindow('邮件预览',listHtml,'#js_send_email_pdm_btn');
						//更新sorttable 插件
						$('#js_ui_window .js_tablesorter').tablesorter({
							cssInfoBlock : "tablesorter-no-sort",
							sortList: [[5,0]],
							widgets: [ 'email'] 
						});
						//设置收信人
						getReceivers(data.require);
						
						
					};//if
				})	
				return false;
				
			});
			
		},
		/**
		 * 确认排期 
		 */
		sendEmailRtx:function(){
			$('#js_send_email_cp_btn').on('click.email',function(){
				var $this = $(this),
					$container = $('#js_list_table_5'),
					//receiver = $this.attr('data-email'),
					cp_name = $this.attr('data-cp-name'),
					users = getEmailUsers(),
					//r_data = ReqGetSet.getRtxData($container),
					date_str = getEmailSendDate();
		
				var email_obj = {
					subject			:"【京东外包】"+ cp_name + date_str + "周工作计划",
					sender			:users.sender,		//发送者
					receiver		:users.receiver,		//接受者
					cc				:users.cc,
					msg				:Fun.getWindowBody()
				};
				RestApi.sendEmail(email_obj);
				//RestApi.sendRtxMsg(r_data);
				//提示信息
				Fun.alert(1,'发送排期邮件成功!');
				//更新按钮状态
				$this.hide().siblings().show();
				//禁止再次修改CP
				$container.find('.js_edit_cp').prop('disabled',true);
				Fun.closeWindow();
				
				return false;
			});
			
			//发送产品经理周知
			$('#js_send_email_pdm_btn').on('click',function(){
				var date_str = getEmailSendDate(),
					$container = $('#js_list_table_5'),
					users = getEmailUsers(),
					//r_data = ReqGetSet.getRtxData($container),
					//p_data = getEmailReqData($container),
					email_obj = {
						subject			:"【电商用户体验设计部-设计管理组】" + date_str + "周工作计划",
						sender			:users.sender,		//发送者
						receiver		:users.receiver,		//接受者
						cc				:users.cc,
						msg				:Fun.getWindowBody()
					};	
				RestApi.sendEmail(email_obj);
				Fun.alert(1,'发送排期邮件成功!');
				Fun.closeWindow();
				//RestApi.sendRtxMsg(r_data);
				//更新数据

			});
			
		},
		/**
		 * 修改Email cp 
		 */
		changeEmailCp:function(){
			$('#js_list_table_5').on('click.cp','.js_edit_cp',function(){
				return false;
			})
			$('#js_list_table_5').on('change.cp','.js_edit_cp',function(){
				var $this = $(this),
					$tr = $this.closest('tr'),
					$o_container = $tr.closest('.task_review'),
					cp_name = $this.find('option:selected').text(),
					req = changeCp($this);
				$tr.find('.js_cp_tr_name').text(cp_name);	
				req.success(function(data){
					//修改成功后的回调
					if(data && data.require){
						var $container = $('div[data-cp-id="'+ data.require.require_cp_id +'"]','#js_list_table_5');
						//更新缓存
						localStore.setRequireDataById(data.require.require_id,data.require,1);
						//存在这个cp
						if($container.length){
							$container.find('tbody').append($tr);
							$tr.effect("highlight",1000);
							//更新目标表格需求数
							updateTableNum($container);
						}else{
							//将最后一个克隆  然后复制到后面
							var $last = $('#js_list_table_5 .task_review').last();
							$last.clone().attr('id','cp_5_'+data.require.require_cp_id)
									   .find('h4 .js_cp_name').text(cp_name)
								 .end().find('h4 .js_cp_length').text(1)
								 .end().find('h4 .js_cp_email').val(data.require.cp_email)
								 .end().find('tbody').empty().append($tr)
								 .end()
								 .attr('data-cp-id',data.require.require_cp_id).insertAfter($last);
							//新增一个tab 
							$('#js_cp_tab_5').append('<li><a data-toggle="tab" href="#cp_5_'+ data.require.require_cp_id +'">'+ cp_name +'<i>1</i></a></li>') 
						};
						//更新当前表格需求数
						updateTableNum($o_container);
					};
				});
			});
		},
		
		/**
		 * 改变需求状态 
		 */
		changeRequireState:function(){
			$('#js_change_req').on('click',function(){
				var $container = $('#js_list_table_5'),
					p_data = getEmailReqData($container);
				if(confirm('你确认已经将排期邮件发送给产品经理和CP吗？')){
					//更新数据
					RestApi.putCpStateByIds(9,p_data).success(function(data){
						if(data && data.require){
							Fun.alert(1,'状态扭转成功，需求自动转入【待启动】状态!');
							$('#js_filter_state [data-state="4"]').trigger('click');
						};
					});//rest api	
					
					//备份数据
					RestApi.backupReqData(p_data.require);
				}
			});
			//将表格转入待启动状态
			$('#js_ui_tables').on('click','.js_change_qd',function(){
				var $this = $(this),
					$container = $this.closest('.task_review'),
					cp_id = $this.attr('data-cp-id'),
					ids = getReqIds(cp_id),
					p_data = {
						require:ids
					};
					
				if(!ids){
					Fun.alert(0,'请先选择要 转入到启动状态 的需求!');
					return;
				};
				
				if(confirm('你确认将【已经】将选中排期邮件发送给产品经理和CP吗？')){
					//更新数据
					RestApi.putCpStateByIds(9,p_data).success(function(data){
						if(data && data.require){
							Fun.alert(1,'状态扭转成功，需求自动转入【待启动】状态!');
							console.info(cp_id,$('#js_ui_tables .js_ui_page:visible input[name="js_cp_group_'+ cp_id +'"]:checked').closest('tr'))
							$('#js_ui_tables .js_ui_page:visible input[name="js_cp_group_'+ cp_id +'"]:checked').closest('tr').find('.js_edit_cp').prop('disabled',true);
							//$this.removeClass().addClass('btn_2');
						};
					});//rest api	
					
					//备份数据
					RestApi.backupReqData(ids);
				}	
			});
		},
		/**
		 * 修改需求类型 显示数量 
		 */
		changeAdText:function(){
			ReqFun.changeAdTextEvent($('#js_pop_require_type_id select'),$('#js_pop_require_ads'));
		},
        triggerRank:function(){
            ReqFun.triggerRankEvent('#js_pop_require_rank_id select');
        },
		/**
		 * 联动修改价格 
		 */
		changeAttrPrice:function(){
			$(document).on('input','#js_pop_require_ads,#js_pop_attribute_v_1 .js_row',function(){
				_changePrice();
			});
			
			$(document).on('change','#js_pop_require_type_id select,#js_pop_require_rank_id select,#js_pop_require_cp_id select,#js_pop_attribute_v_1 select',function(){
				_changePrice();
			});
			
		},
		/**
		 * 时间选择 
		 */
		pickDatas:function(){
			$( "#js_date_from" ).datepicker({
				defaultDate: "+1w",
				changeMonth: true,
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
			//待排期状态下的需求时间修改
			$('#js_pop_require_start_date input').datepicker();
		},
		/**
		 * 需求概述事件 
		 */
		summanyAction:function(){
			$('#js_list_table_10').on('click','.js_rtx_pm',function(){
				var $this = $(this),
					receiver_pdm = $this.attr('data-pdm'),
					receiver_desginer = $this.attr('data-desginer'),
					num = $this.closest('li').find('span').text(),
					str = '';
				if(receiver_pdm){
					ListFun.rtxPdmDesgin(receiver_pdm);
					str += '产品经理:' + receiver_pdm + '; ';
				};
				if(receiver_desginer){
					ListFun.rtxPdmDesgin(receiver_desginer);
					str += '设计师:' + receiver_desginer + '; ';
				}
				
				Fun.alert(1,'已RTX提醒' + str + '进行评分！');
				return false;
			});
			//需处理事件
			$('#js_list_table_10').on('click','.js_action',function(){
				var $this = $(this),
					type = $this.attr('data-type'),
					state = $this.attr('data-state');
				
				ListFun.triggerAction(state,type,function(){
					//获取数据
    				getBaseList(type,state);
				});	
					
			});
		},
		/**
		 * 初始化需求 属性那一块内容区域 
		 */
		initRequireAttr:function(){
			//删除按钮
			$(document).on('click.del','#js_pop_attribute_v_1 .js_del,#js_pop_attribute_v_2 .js_del',function(){
				var $this = $(this),
					$tr = $this.closest('.js_row'),
					val = $tr.find('.js_att_text').val(),
					att_id = $tr.attr('data-id');
				if(val){
					if(confirm('确认要删除这行吗?')){
						$tr.remove();
						att_id && RestApi.delAttrById(att_id);
						_changePrice();
					};
				}else{
					$tr.remove();
					att_id && RestApi.delAttrById(att_id);
				}	
				return false;
			});
			//新增一行按钮
			$('#js_add_attr_btn').on('click.add',function(){
				var str = $('#js_pop_att_clone').html();
				$('#js_pop_attribute_v_1').append(str);
				return false;
			});
		},
		initDesignerPop:function(){
			$('#js_require_verify_user2').on({
				'focus':function(){
					var id = $(this).attr('id'),
						rank_id = $('#js_pop_require_rank_id select').getValue();
					Fun.showCheckUserPop(rank_id,'#'+id)
				}
			})
		},
		sendRtxRemind:function(){
			$('#js_ui_tables').on('click','.js_send_rtx',function(){
				var $this = $(this),
					user = Fun.getEnglishName($this.attr('data-user')),
					sender = Fun.getUserName(),
					req_name = $this.attr('data-name');
				RestApi.sendRtxMsg({
					title:"ECP需求提醒",
					receiver:user,
					msginfo:sender + '提醒您，需求：'+ req_name +' ，请登录：'+ c.root +' 查看'
				});
				Fun.alert(1,'RTX提醒成功！');
				$this.removeClass('btn_2').addClass('btn_1');
				return false;
			});
			
		},
		/**
		 * 全选  全部选 转入结算 
		 */
		checkBoxChange:function(){
			$('#js_ui_tables').on('click','th .js_cp_group',function(){
				var name = $(this).attr('data-checkbox')
				$("input[name='"+ name +"']").prop('checked', this.checked);
			});
			
			//阻止tr点击冒泡事件
    		$('#js_ui_tables').on('click','input[name="js_cbox"]',function(e){
    			e.stopPropagation();
    		});
    		$('#js_ui_tables').on('click','td .js_cp_group',function(e){
    			e.stopPropagation();
    		});
    		
    		/**
		     * 获取选中待结算的需求
		     */
		    var getStatePriceIds = function(cp_id){
				var data = {
					require:$('#js_ui_tables input[name="js_cbox_'+ cp_id +'"]').getValue()
				};
				console.info(data,'data')
				return data;
		    };
    		
    		//批量结算
    		$('#js_ui_tables').on('click','.js_change_list',function(){
    			var cp_id = $(this).attr('data-cp-id'),
    				ids = $('#js_ui_tables input[name="js_cbox_'+ cp_id +'"]').getValue(),
    				p_data = {
						require:ids
					};
					
    			if(!ids){
    				Fun.alert(0,'请先选择需要 结算 的需求！');
    				return;
    			}
    			if(confirm('你确定要将选中的需求批量转入【已结算】吗？')){
    				
    				//更新数据
					RestApi.putCpStateByIds(12,p_data).success(function(data){
						if(data && data.require){
							Fun.alert(1,'批量结算成功，需求自动转入【已结算】!');
							$('#js_ui_tables input[name="js_cbox_'+ cp_id +'"]:checked').each(function(){
								$(this).closest('tr').remove();
							});
						};
					});//rest api	
    			};
    		});
		},
		
		/**
		 * 清除需求评分 
		 */
		clearRating:function(){
			$('#js_chear_fen').on('click',function(){
    			if(confirm('该操作不可恢复,确定要清除需求评分和评级吗？')){
    				var data = {
	    				require:{
	    					require_id			:$('#js_pop_require_id').val(),		
	    					require_mark_pdm	:0,
	    					require_mark_desgin	:0,
	    					require_mark_avg	:0,
	    					require_rating_pdm	:null,
	    					require_rating		:null,
	    					require_check		:null
	    					
	    				}
	    			};
	    			RestApi.putRequire(data).success(function(data){
	    				if(data && data.require){
	    					$('#js_ui_tables tr[data-id="'+ data.require.require_id +'"]')
	    					.find('.js_m_rating_pdm').remove()
	    					.end().find('.js_m_rating').remove()
	    					.end().find('.js_m_avg').remove()
	    					.end().find('.js_mark_change').remove()
	    					Fun.alert(1,'需求评分和评级已清除！');
	    				}
	    			})
    			};
				
			});
		},
        init:function(){
            //初始化
            for(var i in this) {
                if (this.hasOwnProperty(i) && i !== 'init') {
                    this[i]();
                }
            }
        }
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

            rankCateData = localStore.getRankCateData(),
            tpl_rankCate = $('#js_rankcate_tmpl').html(),
            listRankCate = Mustache.to_html(tpl_rankCate, rankCateData),

            cpData = localStore.getCpData(),
            tpl_cp = $('#js_cp_tmpl').html(),
            listCp = Mustache.to_html(tpl_cp, cpData);


        $('#js_pop_require_type_id').find('select').html(listType);
        $('#js_pop_require_rank_id').find('select').html(listRank);
        $('#js_pop_require_cp_id').find('select').html(listCp);
        $('#js_pop_require_rank_cate_id select,#js_bd_rank_cate').html(listRankCate);
        $('#js_type_select').html(listType_2);
    };
    
    /**
     * 初始化时显示相应的数据状态 
     */
    var initData = function(){
    	ListFun.addCurrent(state,type);
    	//获取数据
    	// getBaseList(type,state);
    	showState(state,type);
    };
    
    exports.init = function(){
    	Events.init();
    	initFormData();
    	initData();
    	Fun.initCheckUserPop();
    }
	
});

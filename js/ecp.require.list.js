/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		c = require('./ecp.config.user'),
		localStore = require('./ecp.localstore'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		ReqGetSet = require('./ecp.require.getset'),
		ReqFun = require('./ecp.require.func'),
		PdmFun = require('./ecp.pdm.func'),
		ListFun = require('./ecp.list.func'),
		qq = require('fileuploader');
	require('jquery.tablesorter')($);
	require('jquery.ui')($);
	require('jquery.transit')($);
	
	var model = {
		id_list_tmpl:'#js_list_tmpl_',
		id_list_table:'#js_list_table_',
		id_pop_task:'#js_pop_task',			//右侧弹窗容器
		id_pop_task_tmpl:'#js_pop_task_tmpl'//右侧弹窗模板
	};
	
	var type = Fun.getUrlParam("type") || 'all',		//日前类型
		state = Fun.getUrlParam("state") || 99;			//状态
	
	
	
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
		
		var req = RestApi.getRequireStateType(user,power,power_rank,state,atype);
		console.info(power,'power')	
		req.success(function(data){
			if(data && data.require){
				listActHtml(data,state);
			}
		});
		return req;
	};
	
	/**
	 * 根据时间、状态 获取数据 
	 */
	var getBastListByDate = function(state,start,end){
		var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power,
			power_rank = user_info.users.user_power_rank;
		RestApi.getRequireByDate(user,power,power_rank,state,start, end).success(function(data) {
			if(data && data.require){
				listActHtml(data,state);
			};
		})
	};
	
	/**
	 * 设置 mark 默认值 
	 */
	var setMarkDefault = function(){
		$('.js_m_avg,.js_m_pdm,.js_m_desgin,.js_m_rating','#js_list_table_13').each(function(){
			var $this = $(this),
				mark = $this.text();
			$this.addClass(Fun.getRatingColor(mark));
		})
	}
	
	/**
	 * html结构
	 * @param {Object} data
	 */
	var listActHtml = function(data,state){
		var tpl = $(model.id_list_tmpl + state).html(),
			listHtml = Mustache.to_html(tpl, changeData(data));
		$('tbody',model.id_list_table + state).html(listHtml);
		// console.info($('tbody',model.id_list_table + state),state,data)
		//设置文字
		PdmFun.setListTxt(state,data.require.length);
		//显示表格
		PdmFun.showTableByState(state);
		//如果是进行中 则设置需求进度
		if(state == 24){
			setTimeout(function(){
				ReqFun.setUiRank('#js_list_table_24');
			},1000);
			
		}else if(state == 13){
			setMarkDefault();
		};
		console.info(state,'state')
		// showTopMenu(state);
		//已完成状态 设置分数默认值
     	$(".js_tablesorter").trigger("update", [true]); 
     	
     	//是否关联req id
		var req_id = Fun.getUrlParam('reqid');
		if(req_id){
			$('tbody',model.id_list_table + state).find('tr[data-id="'+ req_id +'"]').trigger('click');
			Fun.setUrlParam('reqid',0);
		}
				
	};
	
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
    			// rating = 'require_rating_' + data.require[i].require_rating;
    			avg = 'require_mark_avg_' + data.require[i].require_mark_avg,
    			desgin = 'require_mark_desgin_' + data.require[i].require_mark_desgin,
    			pdm = 'require_mark_pdm_' + data.require[i].require_mark_pdm;
    			
			data.require[i][state] = true;
			data.require[i][avg] = true;
			data.require[i][desgin] = true;
			data.require[i][pdm] = true;
			data.require[i]['desgin_verify_user'] = Fun.getEnglishName(data.require[i]['require_verify_user']);
			
			if(data.require[i].require_desgin_attachment){
				var att_obj = JSON.parse(data.require[i].require_desgin_attachment);
				data.require[i]['url'] = att_obj['attachment'][0]['url'];
			};
			//未发启动邮件
			if(!data.require[i].is_email){
				data.require[i]['notemail'] = true;
			}
			//console.info(data.require[i].is_email,"data.require[i].is_email")
    			
    		//写入缓存
    		localStore.setRequireDataById(data.require[i].require_id,data.require[i]);
    	};
    	console.info('changeData',data)
    	return data;
    };
    
    /**
     * 获取需求概况 
     */
    // var showSummary = function(){
    	// var user_info = localStore.getSingleUserData(),
			// user = user_info.users.english_name,
			// power = user_info.users.user_power;
    	// RestApi.getSummary(user,power).success(function(data){
    		// ReqGetSet.setSummary(data);
    	// });
    // };
    
    /**
     * 显示头部导航 
     */
    var showTopMenu = function(state){
    	if(state != 9){
    		$('#js_filter_type,#js_ui_pickdate').show();
    	}else{
    		$('#js_filter_type,#js_ui_pickdate').hide();
    	}
    };
    
    /**
     * 设置弹窗内容 
 	 * @param {Object} data
     */
    var setPopCont = function(data){
    	var state = ListFun.getState();
    	//先隐藏属性设置
    	//$('#js_pop_attribute').hide();
    	//待排期 显示输入框
    	if(data.require_state == 1 || data.require_state == 5){
    		$('#js_add_attr_btn,#js_pop_attribute_v_1,#js_pop_task .state_1 input,#js_pop_task .state_1 select,#js_pop_task .state_1 textarea ,#js_edit_req_btn').show();
    		$('.state_1 td span,#js_pop_attribute_t_1,#js_pop_require_type_id strong').hide();
    		ReqGetSet.setRightPopInfo(data);
    	}else{
    		$('#js_add_attr_btn,#js_pop_attribute_v_1,#js_pop_task .state_1 input,#js_pop_task .state_1 select,#js_pop_task .state_1 textarea ,#js_edit_req_btn').hide();
    		$('.state_1 td span,#js_pop_attribute_t_1,#js_pop_require_type_id strong').show();
    		ReqGetSet.setRightPopText(data);
    	};
    	
    	//待启动
    	if(data.require_state == 1 || data.require_state == 5 || data.require_state == 9){
    		$('#js_pop_attr_cont').hide();
    	}else{
    		$('#js_pop_attr_cont').show();
    	}
    	//待评分状态
    	if(state == 8){
    		//初始化上传设计稿插件
    		uploadDesgin(data.require_id);
    		// var length = $('#js_iframe_u').length;
    		// if(!length){
    			// $('#js_upload_desgin').html('<iframe id="js_iframe_u" class="ui_iframe_upload" src="http://case.oa.com/upload/uploadify?uid=hugohua&cbk=caseUpload&sid=ecp&ext=.swf,.zip,.rar,.png,.jpg,.gif,.psd,.doc,.docx,.xls,.xlsx,.pdf&tip=1&css='+ c.root +'css/uploadify.css&time='+ (new Date()).getTime()  +'"></iframe>');
    		// };
    		//判断是否需要评分 1.
    		if(data.type_check == 1){
    			$('#js_req_mark .js_type_check').show();
    		}else{
    			$('#js_req_mark .js_type_check').hide();
    		};
    		
    		$('#js_req_mark').show();
			$('#js_pop_attribute').hide();
			//$('#js_pop_require_ads_2 input').val(data.require_ads).attr('old-value',data.require_ads);
			ListFun.getAttrByReqId(data.require_id,2);
			
			//拉取需求类型
			var $ads2 = $('#js_pop_require_ads_2'),
				$type2 = $('#js_pop_require_type_id_2');
    		$ads2.attr('old-value',data.require_ads).val(data.require_ads);
    		$type2.setValue(data.require_type_id);
    		if(data.type_show_num == '1'){
    			$ads2.css('display','inline-block');
    		}else{
    			$ads2.hide();
    		}
    		
    	}else{
			$('#js_req_mark').hide();
			$('#js_pop_attribute').show();
			ListFun.getAttrByReqId(data.require_id,1);
		};
		//已完成状态才显示
		if(data.require_state != 3){
			$('.state_3').hide();
		}
		//设计稿上传
		// if(data.require_desgin_attachment){
			// $('#js_upload_desgin').hide();
		// };
		ReqFun.showRightPop();
    };
    
    /**
     * 改变需求状态 
     *  $tr那一行
     *  
     */
    var successMark = function(data){
    	//如果设计师评分了
    	Fun.alert(1,'打分成功，等待设计师打分，需求归档到【进行中】 状态');
    	//移除tr
		ListFun.removeTr(data.require.require_id);
    	//隐藏右侧弹窗
    	ReqFun.hideRightPop();
    	//更新进行中的cache
    	$('#js_list_table_8').removeData();
    };
    
    /**
     * 根据不同的状态显示相应的界面 
     */
    var showState = function(state,type){
    	//获取数据
		if(state != 99){
			getBaseList(type,state);
		}
    }

	/**
     * 更新拖动页面的视图 
     */
    var updateDragView = function(data){
    	
    	var $div = $('#js_req_list tbody td div[data-id="'+ data.require.require_id +'"]'),
    		$tr = $('#js_tapd_tab th[data-day="'+ data.require.require_start_date +'"]')
    	//先判断拖动视图内是否存在该条数据
    	if($div.length || $tr.length){
    		//需要重新拉取数据
    		$('#js_toggle_page').attr('data-drag-reload',true);
    	};
    };
    
    
    var Events = {
    	/**
    	 * 点击表格一行  显示详细需求信息 
    	 */
    	showPop : function(){
    		$('#js_page_2').on('click.show','tbody tr[data-id]',function(){
    			var $this = $(this),
    				require_id = $this.attr('data-id');
    			
    			localStore.getRequireDataById(require_id,function(data){
    				console.info('data',data)	
	    			setPopCont(data);
	    			$this.addClass('current').siblings().removeClass('current');
    			});
    			
    			// return false;
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
					//提交数据	
					RestApi.putRequire(obj).success(function(data){
						if(data && data.require){
							var $tr = $('#js_ui_tables table:visible tr[data-id="'+ data.require.require_id +'"]');
							ListFun.updateTr($tr,data);
							//隐藏右侧弹出层
    						ReqFun.hideRightPop();
							localStore.setRequireDataById(data.require.require_id,data.require);
							//更新添加需求状态下的表格数据
							updateDragView(data);
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
		 * 修改弹窗需求 
		 */
		delPopReq:function(){
			$('#js_edit_req_btn button.js_del,#js_admin_btn button.js_del').on('click',function(){
				var del_id = $('#js_pop_require_id').val();
				//隐藏操作区域
				if(confirm('你确定要删除这个需求吗？')){
					RestApi.delRequireById(del_id).success(function(data){
						//删除页面数据
						ListFun.removeTr(del_id);
						ReqFun.hideRightPop();
						//更新拖曳页面
						$('#js_toggle_page').attr('data-drag-reload',true);
					});
				};
			});
		},
    	/**
    	 * 状态筛选 
    	 */
    	filterState:function(){
    		//不包含申请排期按钮
    		$('#js_filter_state li').on('click',function(){
    			var $this = $(this),
    				state = $this.attr('data-state')
    				type = PdmFun.getType(state);
    				
    			//设置css	
    			$('#js_filter_state li').removeClass('current');
    			$this.addClass('current');
				Fun.setUrlParam("state",state);
				//隐藏右侧弹出层
				ReqFun.hideRightPop();

				console.info(type,state,'filterState')
				showState(state,type);
    			PdmFun.checkType(type,state);
    			ListFun.removeDateSelect();
    			//隐藏日历
    			$('#js_datepicker').hide();
    			return false;
    		})
    	},
    	
    	/**
    	 * 根据日前类型进行筛选 
    	 */
    	filterType:function(){
    		$('.js_filter_type a').on('click',function(){
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
    			var obj = ReqGetSet.getMarkData(),
    				mark = parseInt(obj.require.require_mark_pdm,10);
    			console.info(obj,'getMarkData')
    			//待打分状态 未打分
    			if( obj.require.require_state == 4 && !mark ){
    				Fun.alert(0,'评分不能为空!');
    				return;
    			};
    			//分数过低
    			if((obj.require.require_state == 4  && (mark < 60) ) && !obj.require.require_pdm_comment){
    				Fun.alert(0,'设计稿分数太低，请写点评语吧!');
    				return;
    			};
    			
				if(ReqGetSet.checkUpload($('#js_upload_desgin'),$('#js_att_list_2'))){
					RestApi.putRequire(obj).success(function(data){
						if(data && data.require){
							successMark(data);
						};//if
					});
					//更新需求属性
					ReqGetSet.insertUpdateAttr(obj.require.require_id,$('#js_pop_attribute_v_2'));
					//更新配套广告数
					//ReqGetSet.updateAttrForAds(obj.require.require_id,$('#js_pop_require_ads_2 input'))
				}else{
					Fun.alert(0,'请上传设计稿再 保存! ');
				}
    		});
    	},
    	/*
    	 * 上传 
		 */
		upload:function(){
			//删除事件
			ReqFun.delFileEvent('#js_att_list_2');
			ReqFun.delFileEvent('#js_att_list_3');
		},
		tableSorter:function(){
			$('.js_tablesorter').tablesorter();
		},
		changeAdText:function(){
			ReqFun.changeAdTextEvent($('#js_pop_require_type_id select'),$('#js_pop_require_ads'));
			ReqFun.changeAdTextEvent($('#js_pop_require_type_id_2'),$('#js_pop_require_ads_2'));
			
		},
		/**
		 * 时间选择 
		 */
		pickDatas:function(){
			$( ".js_date_from" ).datepicker({
				defaultDate: "-1w",
				changeMonth: true,
				changeYear:true,
				// numberOfMonths: 2,
				onSelect: function( selectedDate ) {
					var $date_to = $(this).closest('.ui_pickdate').find(".js_date_to"),
						val = $date_to.val(),
						state = ListFun.getState();
					$date_to.datepicker( "option", "minDate", selectedDate );
					if(val){
						getBastListByDate(state,selectedDate,val);
						PdmFun.removeType(state);
					}
				}
			});
			$( ".js_date_to" ).datepicker({
				defaultDate: "+1w",
				changeMonth: true,
				changeYear:true,
				// numberOfMonths: 2,
				onSelect: function( selectedDate ) {
					var $date_from = $(this).closest('.ui_pickdate').find(".js_date_from"),
						val = $date_from.val(),
						state = ListFun.getState();
					$date_from.datepicker( "option", "maxDate", selectedDate );
					if(val){
						getBastListByDate(state,val,selectedDate);
						PdmFun.removeType(state);
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
				var receiver = c.pm_list,
					num = $(this).closest('li').find('span').text();
				ListFun.rtxPm(receiver,num);
				Fun.alert(1,'已RTX提醒' + receiver + '进行排期！');
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
		 * 显示email框 
		 */
		showSendEmail:function(){
			$('#js_list_table_9').on('click','.js_send_email',function(){
				var $tr = $(this).closest('tr'),
					require_id = $tr.attr('data-id'),
					rank_id = $tr.attr('data-rank-id'),
					type_id = $tr.attr('data-type-id'),
					is_yixun_dev = false;					//用于判断需求配套是否是易讯重构需求
				localStore.getRequireDataById(require_id,function(data){
					var listHtml,
						email = c.email_cp_cc + data.cp_email + ';',
						tpl =  $('#js_email_detail').html(),					//邮件HTML模板结构
						$div;
						
					data.week_name = Fun.getWeekName(new Date(data.require_start_date).getDay());
					$div = $(Mustache.to_html(tpl, data));
					//抄送一份给自己
					var user_data = localStore.getSingleUserData();
					email += user_data.users.user_email + ';';
					// console.info('getSingleUserData',user_data)
					
					//如果是易讯需求 并且是重构需求 则抄送给易讯重构接口人
					if(rank_id == 1 && (type_id == 24 || type_id == 25 || type_id == 26) ){
						is_yixun_dev = true;
						email += c.yixun_cp_dev;
					}
                    //京东无线
                    if(rank_id == 16){
                        email += c.email_jdwuxian_cc;
                    }
					
					//抄送一份给设计师和前端
					if(data.require_verify_user){
						var v_user = Fun.getEnglishName(data.require_verify_user);
						RestApi.getUserInfoByName(v_user).success(function(data){
							if(data && data.users){
								for(var i in data.users){
									email += data.users[i]['user_email'] + ';';
								}//for
							}//if
							
							$('#js_send_email_cp').val(Fun.filledEmail(email));
						});
					}else{
						$('#js_send_email_cp').val(Fun.filledEmail(email));
					};
					
					
					$('#js_send_email_cp').attr('data-id',data.require_id);
					ReqFun.getAttrByReqId(require_id).success(function(data){
						if(data && data.attribute && data.attribute.length){
							var str = '';
							
							for(var i in data.attribute){
								str += data.attribute[i]['type_name'] + ':' + data.attribute[i]['att_text'] + '个;<br />';
								var att_type_id = data.attribute[i]['attr_type_id'];
								//如果是易讯需求 并且是重构需求 则抄送给易讯重构接口人
								if(is_yixun_dev == false && rank_id == 1 && (att_type_id == 24 || att_type_id == 25 || att_type_id == 26)){
									$('#js_send_email_cp').val(function(index,value){
										return value + Fun.filledEmail(c.yixun_cp_dev)
									});
								}
							};
							
							$div.find('#js_req_attr').html(str);
						};
						Fun.showWindow('邮件预览',$div.html(),'#js_send_cp_container');	
						$('#js_att_list_3').empty();
						//初始化email 附件上传组件
						//initIframeEmailAttr();
					})
				});
					
				return false;
			})
		},
		/**
		 * 发送email 
		 */
		sendEmail:function(){
			$('#js_send_email_cp_btn').on('click',function(){
				
				var getAttrList = function(){
					var arr = [];
					$('#js_att_list_3 li').each(function(index) {
						var $li = $(this),
							url = $li.attr('data-url'),
							name = $li.attr('data-filedesc');
					   arr.push({
					   	url:url,
					   	name:name
					   });
					});
					return arr;
				}
				
				var $this = $(this),
					$send = $('#js_send_email_cp'),
					require_id = $send.attr('data-id')
					receiver = Fun.replaceAll($send.val(),'；',';');	//替换中文逗号
				
				//发件人邮箱
				var user_data = localStore.getSingleUserData();
				
				localStore.getRequireDataById(require_id,function(data){
					var today = Fun.today(),
						obj = {
							subject			:"【京东外包】" + data.cp_name +' ' + data.require_name + " 工作计划",
							sender			:user_data.users.user_email,		//发送者
							receiver		:receiver,		//接受者
							cc				:'',
							msg				:Fun.getWindowBody(),
							attachment		:getAttrList()
						},
						u_data = {
							require:{
								require_id:data.require_id,
								is_email:receiver,
								require_state:4//待评分 进行中
							}
						};
					
					//匹配中文
					var rcjk = /[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]+/g;
					var check = rcjk.test(receiver);
					if(check){
						alert('邮件发送地址不能包含中文');
						return;
					};
					
					RestApi.sendEmail(obj).success(function(data){
						if(data && data == 1){
							RestApi.putRequire(u_data).success(function(data){
								Fun.alert(1,'成功发送Email给CP!');
								Fun.closeWindow();	
								ListFun.removeTr(data.require.require_id);
							});
						}else{
							alert('邮件发送出错，请重试，或RTX联系：hugohua');
						}
					}).error(function(){
						alert('邮件发送出错，可能原因: \n 1、网络问题，请刷新重试  \n 2、附件过多，或过大。请修改附件大小后重试  \n 3、最后还是不行？请联系技术支持:hugohua');
					});
				});
					

			});
		},
		
		/**
		 * 上传附件 
		 */
		uploadAttr:function(){
			
			var uploader = new qq.FileUploader({
				element: document.getElementById('js_upload_attr'),
				action: c.root +'fileuploader.php',
				//allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'swf','zip','rar','doc','docx','psd'],
				params:{folder:'attachment/'},
				onComplete: function(id, fileName, responseJSON){
					console.info(id, fileName, responseJSON)
					if(responseJSON && responseJSON.filename){
						var data = {
							attachment:{
									type			:responseJSON.filetype,
									filename		:responseJSON.filename,
									url				:responseJSON.directory + responseJSON.filename,
									filedesc		:responseJSON.filename
								}
							};
						ReqGetSet.setFileList(data,3); 
					}else{
						alert('上传文件太大，无法上传！大小限制为：2M');
					}
					
				}
			});
			
		},
		addReqTrigger:function(){
			$('#js_sumary_table').on('click','tbody tr:not(.error)',function(){
				var $this = $(this),
					req_id = $this.attr('data-id'),
					state = $this.find('.js_sumary_action span').attr('data-state'),
					$table = $(model.id_list_table + state);
				//切换页面
				Fun.setUrlParam('reqid',req_id);
				$(model.id_list_table + state).show().siblings('.js_ui_page').hide();
				PdmFun.addCurrent(state,'all');
				//获取数据	
				getBaseListAjax($table,'all',state).success(function(){
					//显示列表页
					Fun.showPageList();
				})
			});
		},
		/**
		 * 联动修改需求类型和数量 
		 */
		changeTrigger:function(){
			//显示广告 和 评分
			$('#js_pop_require_type_id_2').on('change',function(){
				var $this = $(this),
					val = $this.getValue(),
					$option = $this.find('option:selected'),
					txt = $option.text();
				$('#js_pop_require_type_id').attr('data-type-id',val).find('span').text(txt);	
				//是否显示评分
				var check = $option.attr('data-check');
				$('#js_pop_type_check').val(check);
				//需要评分
				if(check == 1){
					$('#js_req_mark .js_type_check').show();
				}else{
					$('#js_req_mark .js_type_check').hide();
				}
				
			});
			$('#js_pop_require_ads_2').on('input',function(){
				var ads = $(this).val();
				$('#js_pop_require_ads').val(ads);
				$('#js_pop_require_type_id strong').text('('+ ads +'个)')
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
    
    exports.initSumary = function(){
    	var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power,
			power_rank = user_info.users.user_power_rank;
		console.info(user,power,'initSumary')
		var req = RestApi.getRequireStateType(user,power,power_rank,'30','all');
		req.success(function(data){
			if(data && data.require){
				listSumary(data);
			}
		});
    };
    
    var listSumary = function(data){
    	var tpl = $('#js_sumary_tmpl').html(),
			listHtml = Mustache.to_html(tpl, changeData(data));
		$('tbody','#js_sumary_table').html(listHtml);
		$(".js_tablesorter").trigger("update", [true]); 
    };

    /**
     * case 上传数据 回调 
     */
    var caseUploadSuccess = function(data,num){
    	var msg = JSON.parse(data);
    	//上传成功
		if(!msg.IsError){
			var type = Fun.getFileType(msg.Context.newName),
				data = {
				attachment:{
						type			:type,
						filename		:msg.Context.newName,
						url				:'http://case.oa.com'+ msg.Context.rawFile,
						filedesc		:msg.Context.file.Name
					}
				};
			ReqGetSet.setFileList(data,num);
		}
    };
    
    /**
     * 上传设计稿 
     */
    var uploadDesgin = function(require_id){
    	var uploader = new qq.FileUploader({
			element: document.getElementById('js_upload_desgin'),
			action: c.root +'fileuploader.php',
			allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'swf','zip','rar','pdf','7z'],
			params:{folder:'design/' + require_id + '/',newname:true},
			onComplete: function(id, fileName, responseJSON){
				console.info(id, fileName, responseJSON)
				if(responseJSON && responseJSON.filename){
					var data = {
						attachment:{
								type			:Fun.getFileType(responseJSON.filename),
								filename		:fileName,
								url				:c.root + responseJSON.directory + responseJSON.filename,
								filedesc		:responseJSON.filename
							}
						};
					ReqGetSet.setFileList(data,2);
				}
				
			}
		});
		//删除事件
		ReqFun.delFileEvent('#js_att_list');
    };//上传设计稿
    
    
    exports.init = function(){
    	Events.init();
    };
	
});

/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		Fun = require('./ecp.func'),
		c = require('./ecp.config.user'),
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
		id_pop_task_tmpl:'#js_pop_task_tmpl'//右侧弹窗模板
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
            obj[key] = val
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
	 * 设置 mark 默认值 
	 */
	var setMarkDefault = function(){
		var $container = $('#js_ui_tables');
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
		console.info($container)
	};
	
	var listData = function(data){
		var tpl = $('#js_table_tmpl').html(),
			listHtml = Mustache.to_html(tpl, changeData(data));
		$('tbody','#js_container').html(listHtml);
		$(".js_tablesorter").trigger("update", [true]); 
		//已完成状态 设置分数默认值
		setMarkDefault();
		//价格总额计算
		getSumPrice();
		//rtx链接
		getPdmList();
	};
	
	/**
	 * 获取所有PDM 
	 */
	var getPdmList = function(){
		var $table = $('#js_ui_tables');
		var arr = [],pdm = '';
		$table.find('.js_p_require_creator').each(function(){
			arr.push($(this).text());
		});
		arr.push(Fun.getUserName());
		arr = Fun.clearSort(arr);
		pdm = arr.join(';');
		$('#js_rtx_link').attr('href','view_rtx.html?pdm='+pdm);
	};
	
	/**
	 * 价格总额计算 
	 */
	var getSumPrice = function(){
		var sum = 0;
		var $table = $('#js_ui_tables');
		$table.find('.js_m_fcost').each(function(){
			var $this = $(this),
				fprice = parseInt($this.text(),10);
			sum += fprice;
			//检测价格是否准确
			if(fprice){
				var base_price = parseInt($this.attr('data-base'),10),		//基础价格
					pis = parseInt($this.attr('data-cost-change'),10),				//正数还是减数 符合
					pchange = parseInt($this.attr('data-cost'),10);		//调整金额
				//负数
				if(!pis){
					pchange = -pchange;
				};
				
				if(base_price + pchange !== fprice){
					$this.css('color','#f00').attr('title','价格计算有误，请检查该需求的价格是否存在问题!');
//					console.info($this,'aaaaaaaaaa')
				}
					
			}
			
		});
		$('#js_total_price').text(sum);
	};
	
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
    			pdm 			= 'require_mark_pdm_' + data.require[i].require_mark_pdm;				//pm分数
    			type_check		= 'type_check_' + data.require[i].type_check;						//是否需要评分
    			
    		data.require[i][rank] = true;
    		data.require[i][type] = true;
    		data.require[i][type_state] = true;
    		data.require[i][modify_attr] = true;
    		data.require[i][price_change] = true;
    		data.require[i][turn_req] = true;
    		data.require[i][avg] = true;
			data.require[i][desgin] = true;
			data.require[i][pdm] = true;
			data.require[i][type_check] = true;
			data.require[i]['desgin_verify_user'] = Fun.getEnglishName(data.require[i]['require_verify_user']);
			
			if(data.require[i].require_desgin_attachment){
				var att_obj = JSON.parse(data.require[i].require_desgin_attachment);
				data.require[i]['url'] = att_obj['attachment'][0]['url'];
			};
			
			data.require[i]['state_name'] = ReqFun.getStateDetailName(data.require[i].require_state,data.require[i]);
			
    		//写入缓存
    		localStore.setRequireDataById(data.require[i].require_id,data.require[i]);
    	};
    	return data;
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
					start_date = data.require_start_date,	
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
				// console.info(obj,rating,data.require_base_cost , localStore.getPriceByIds(data.cp_id,data.type_id,$tr.find('.js_m_rating').text()),'changeMark')
				callback(obj);
			});
		// return obj;
    };


    /**
     * 获取数据导出选项设置 
     */
    var exportOption = function(){
    	var group = $('input[name="group_ex"]').getValue(),
    		pingfen = $('input[name="group_pf"]').getValue(),
    		downzip = $('input[name="group_zip"]').getValue(),
    		obj = {
    			group:group,
    			pingfen:pingfen,
    			downzip:downzip
    		};
    	
    	return obj;
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

        var $cpId = $('#js_search_cp_id'),
            str = '0';

        $('#js_pop_require_type_id').find('select').html(listType);
        $('#js_search_type_id').append(listType);

        $('#js_pop_require_rank_id').find('select').html(listRank);
//        $('#js_search_rank_id').append(listRank);

        $('#js_search_rank_cate_id,#js_bd_rank_cate,#js_pop_require_rank_cate_id select').append(listRankCate);

        $('#js_pop_require_cp_id').find('select').html(listCp);
        $cpId.append(listCp);
        //修改下拉框
        $cpId.find('[data-type="1"]').each(function(){
            var $this = $(this),
                cp_id = $this.attr('value');
            str += ',' + cp_id;
            $this.appendTo('#js_waipai');
        })
        $('#js_waipai_all').attr('value',str);

        //全部平台
        var pstr = '0';
        $cpId.find('[data-type="0"]').each(function(){
            var $this = $(this),
                cp_id = $this.attr('value');
            pstr += ',' + cp_id;
        })
        $('#js_ping_all').attr('value',pstr);
        $('#js_type_select').html(listType_2);
        //待排期状态下的需求时间修改
        $('#js_pop_require_start_date input').datepicker();
    };


    /**
     * 设置弹窗内容 
 	 * @param {Object} data
     */
    var setPopCont = function(data){
    	//PM视图始终显示输入框
    	//文本状态
    	if(data.require_state == 11 || data.require_state == 12){
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
    		$('#js_req_mark').show();
    		//部分显示
    	}else{
    		$('#js_req_mark').hide();
    	};
    	
    	
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
    	
		ReqFun.showRightPop();
    };
    
    var _changePrice = function(){
		var cp_id = $('#js_pop_require_cp_id select').getValue(),
			type_id = $('#js_pop_require_type_id select').getValue();
		$('#js_pop_require_type_id').attr('data-type-id',type_id);
		$('#js_pop_cp_id').val(cp_id);
		console.info(cp_id,type_id,'cp_id')
		// debugger;
		ReqGetSet.getPricesForSave(function(price_data){
			$('#js_pop_require_base_cost').text(price_data.require.require_base_cost);
			$('#js_require_final_cost').val(price_data.require.require_final_cost);
			//判断价格是否是数字
			if(!$.isNumeric(price_data.require.require_final_cost)){
				alert('价格计算出错，是否是修改了需求类型？可以试试【清除需求评分】！');
			}
		});
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
    
    var setCheckPriceLink = function(start,end){
    	$('#js_check_price').attr('href','api/check_price.php?start=' + start + '&end=' + end);
    	$('#js_check_design').attr('href','api/check/design/' + start + '/' + end);
    };

    /**
	 * 同步易讯服务器的图片到本地服务器 
	 */
	var sysIcsonImg = function(require_id){
		//$container = js_att_list_2
		$('#js_att_list_2').find('a').each(function(){
			var url = $(this).attr('href');
			//非OA域名
            if(url.indexOf('shyw') !== -1 ){
				RestApi.sysIcsonImg(require_id,url);
			}
		});
	};
	
	var Events = {
		search:function(){
			$('#js_form').on('submit',function(){
				var obj = getParam();
				var str = JSON.stringify(obj);
				$.cookie("ecp_search",str,{expires:2});
				RestApi.searchRequire(obj).success(function(data){
//					Fun.setUrlParam('q',str);
					if(data && data.require){
						listData(data);
						$('#js_total').text(data.require.length);
						$('#js_container').show();
						setCheckPriceLink(obj.require_start_date,obj.require_finish_date);
					}
				});
				return false;
			});
		},
		/**
		 * 重置表单 
		 */
		resetForm:function(){
			$('#js_reset_btn').on('click',function(){
				//设置有权限的产品
				var user = localStore.getSingleUserData(),
					user_rank = user.users.user_power_rank;
					
				if(user_rank == 0){
					$('#js_form :input').clearForm();	
				}else{
					$('#js_form :input:not(#js_search_rank_id)').clearForm();	
				};
				
				$('#js_container').hide();
				$.cookie("ecp_search",null);
				return false;
			});
		},
		/**
		 * 导出Excel 
		 */
		exporExcel:function(){
			$('#js_excel_btn').on('click',function(){
				var param = getParam(),
					option = exportOption();
				$.extend(param, option);
				console.info(param,'param')
				var obj = {
					data:param
				};
				RestApi.exportRequire(obj).success(function(data){
					if(data && data.success){
						
						if(data.ids){
							RestApi.downDesginZip(data.ids,data.filename).success(function(d){
								if(d && d.success){
									var url = 'download/' + d.filename;
									$.fileDownload(url);
								}
							})
						}else{
							var url = 'excel/' + data.filename;
							$.fileDownload(url);
						}
						//window.open(url);
					}
				})
			});
		},
		
		/**
		 * 导出Excel 
		 */
		exporExcelPay:function(){
			$('#js_pay_btn').on('click',function(){
				var param = getParam(),
					option = exportOption();
				$.extend(param, option);
				console.info(param,'param')
				var obj = {
					data:param
				};
				RestApi.exportRequirePay(obj).success(function(data){
					if(data && data.success){
						var url = 'excel/' + data.filename;
						$.fileDownload(url);
					}
				})
			});
		},
		
		/**
		 * 时间选择 
		 */
		pickDatas:function(){
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
    	 * 点击表格一行  显示详细需求信息 
    	 */
    	showPop : function(){
    		$('#js_container').on('click.show','.js_tablesorter tbody tr[data-id]',function(){
    			var $this = $(this),
    				require_id = $this.attr('data-id');
    			
    			localStore.getRequireDataById(require_id,function(data){
    				console.info(data,'ddddddd');	
	    			$this.addClass('current').siblings().removeClass('current');	
	    			setPopCont(data);
	    			//设置需求状态
	    			$('#js_change_state').setValue(data.require_state);
	    			$('#js_pop_require_state').val(data.require_state);
	    			
	    			ListFun.getAttrByReqId(require_id,1);
	    			//设置全局修改的链接
	    			$('#js_edit_all').attr('href','view_edit.html?id='+require_id);
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
		 * 修改需求类型 显示数量 
		 */
		changeAdText:function(){
			ReqFun.changeAdTextEvent($('#js_pop_require_type_id select'),$('#js_pop_require_ads'));
		},

        triggerRank:function(){
            ReqFun.triggerRankEvent('#js_search_rank_id');
            ReqFun.triggerRankEvent('#js_pop_require_rank_id select');
        },

    	/**
		 * 初始化需求 属性那一块内容区域 f
		 */
		initRequireAttr:function(){
			//删除按钮
			$('#js_pop_attribute_v_1').on('click.del','.js_del',function(){
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
		/**
		 * 审核设计师 
		 */
		initDesignerPop:function(){
			$('#js_require_verify_user2').on({
				'focus':function(){
					var id = $(this).attr('id'),
						rank_id = $('#js_pop_require_rank_id select').getValue();
					Fun.showCheckUserPop(rank_id,'#'+id)
				}
			})
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
    		})
    		//阻止tr点击冒泡事件
    		.on('click','.js_mark_change',function(){
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
    		};
    		
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
    		$('#js_turn_down_btn').on('click',function(){
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
	    					//ReqFun.actionEmail(data,'驳回');
	    					
	    				}
	    			});
    			};
    		});
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
		delPopReq:function(){
			$('#js_edit_req_btn button.js_del,#js_change_del').on('click',function(){
				var del_id = $('#js_pop_require_id').val();
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
						require_id:req_id,
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
		 * 修改需求状态 
		 */
		changeState:function(){
			$('#js_change_done').on('click',function(){
				var require_id = $('#js_pop_require_id').val(),
					require_state = $('#js_pop_require_state').val(),
					val = $('#js_change_state').getValue();
				if(val == require_state) return;	
				//待排期状态 不能直接转到其他状态下。（因为必须要先分配CP）
				if(require_state == 1){
					alert('待排期状态下无法直接修改，请先到待排期视图 选择需求供应商！');
					return;
				};
				//待邮件状态、待启动 不能直接转到已打分、待结算、已结算状态。（因为需要打分和上传设计稿）
				if((require_state == 5 || require_state == 9) && (val == 3 ||val == 11 ||val == 12)){
					alert('无法改变需求状态，因为需要先上传设计稿或打分！');
					return;
				};
				
				if(confirm('你确定要修改需求状态吗？')){
					var obj = {
						require:{
							require_id:require_id,
							require_state:val
						}
					}
					RestApi.putRequire(obj).success(function(data){
						//写入缓存
	    				localStore.setRequireDataById(require_id,data.require);
	    				//更新表格行
	    				$('#js_ui_tables tbody tr[data-id="'+ require_id +'"] .js_search_state').text(Fun.getStateName(val));
	    				Fun.alert(1,'修改需求状态成功！');
					});
				}
					
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
	    					$('#js_ui_tables tr[data-id="'+ data.require.require_id +'"]').find('.js_rating').text('');
	    					Fun.alert(1,'需求评分和评级已清除！');
	    				}
	    			})
    			};
				
			});
		},

		clearDesign:function(){
			$('#js_check_design').on('click',function(){
				if( !confirm('清理设计稿前 建议先导出一份原始稿件做备份，以防误操作！') ){
					return false;
				}
			})
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
	 * 初始化搜索数据 
	 */
	var initSearchData = function(){

		var str = Fun.getUrlParam('q') ||  $.cookie("ecp_search");
        //替换一下url转义
        if(!str) return;
        str = Fun.replaceAll(str ,'%22', '"');
		var data = JSON.parse(str);
		setParam(data);
	};
	
	/**
	 * 如果是高级产品经理等 需要 权限进入 
	 */
	var checkPowerRank = function(user_rank){
		if(user_rank !=0){
			$('#js_search_rank_id').setValue(user_rank).prop('disabled',true);
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
					//快捷键
					ShortCuts.init();
			    	$('.js_tablesorter').tablesorter();
			    	//初始化搜索数据
					initSearchData();
					//设置用户权限
					checkPowerRank(data.app.user.user_power_rank);
				}else{
					window.location = 'error.html';
				}
			}else{
				// window.location = 'error.html'
			}
		})
	};
	
    exports.init = function(){
//        $.cookie('login_user_ecp','p_jdyghua',{path:'/'})
    	checkPower();
    }
	
});

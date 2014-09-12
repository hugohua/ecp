/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		RestApi = require('./ecp.rest'),
		ReqGetSet = require('./ecp.require.getset'),
		Fun = require('./ecp.func'),
		ReqFun = require('./ecp.require.func'),
		localStore = require('./ecp.localstore');
	
	require('jquery.field')($);
	
	var msg = {
		add_succ:'添加需求成功',
		add_error:'所有输入框不能为空，请检查后重新输入!'
	};
	
	var clearForm = function(){
		$(':input','#js_form').clearForm();
	};
	
	
	/**
	 * 插入需求属性数据 
	 */
	var insertAttr = function(require_id){
		var obj = ReqGetSet.getRequireAttrInfo($('#js_attr_cont')),
			i_length = obj.insert.length;
		if(i_length){
			var obj_i = {
				attribute:obj.insert
			};
			RestApi.addAttribute(require_id,obj_i);
		}
	};
	
	
	/**
	 * 设置表单 默认值
	 */
	var setDefaultFormVal = function(){
		//默认选中需求归类
		var ranks = localStore.getRankRequire();
        if(ranks){
            $('#js_require_rank_id').setValue(ranks.rank_id);
            $('#js_require_rank_cate_id').setValue(ranks.rank_cate_id);
        }

		//是否显示广告数
		ReqFun.changeAdText(0,1);
	};
	
	/**
	 * 检测上个月是否存在待排期需求 
	 */
	var checkStatePdm = function(){
		var day = new Date().getDate(),
			uname = Fun.getUserName();
		//当前日期大于10号的话，则需要判断是否存在上月未评分需求
		if(uname && (day >= 10)){
			RestApi.checkStatePdm(uname).success(function(data){
				//存在值
				if(data.require && data.require != 0){
					$('#js_table_view').data('old',data.require);
				}
			})
		};
	};
	
	var Events = {
		/**
		 * 点击表格 弹出 提示框 
		 */
		addReqPop:function(){
			$('#js_table_view,#js_req_list').on('click.add','td',function(){
				//先判断是否可以新增需求
				var $td = $(this),
                    old = $('#js_table_view').data('old'),
                    obj = {
                        day:$td.attr('data-day'),
                        week_name:$td.attr('data-week-name'),
                        type:'添加排期'
                    };

				if(old){
					alert('您还有逾期未处理的【待评分】需求'+ old +'个，需要先完成上传才能添加新的需求。如果已经上传完请按F5刷新页面 ！');
					$('#js_filter_state').find('li[data-state="8"]').trigger('click');
					return;
				}

				//先清空表单
				clearForm();
				//设置表单默认值
				setDefaultFormVal();
				
				$('#js_edit_require_btn,#js_del_require_btn').hide();
				$('#js_add_require_btn').show();
				$('#js_require_creator').val( Fun.getUserName() );
				//设置弹出层 信息 
				ReqFun.setPopInfo(obj);
				//显示弹窗
				ReqFun.showRequirePop(true);
				//清空需求属性设置
				$('#js_attr_cont').find('tbody').empty();
				//Fun.clearAttrPop();
				//触发事件
				//Fun.showPopAtt( 1 );//页面首页
				//获得焦点
				ReqFun.setPopFocus();
				console.info(obj,'addReqPop');
			});
		},
		/**
		 * 添加需求事件 
		 */
		addReq:function(){
			$('#js_add_require_btn').on('click',function(){
				var obj = ReqGetSet.getRequireInfo(),
					validate = Fun.validate('#js_require_info'),
                    defaultRank;
				if(validate){
					RestApi.addRequire(obj).success(function(data){
						if(data && data.require){
							var b_data = ReqGetSet.getRequireBox(),
								week_obj = Fun.getWeeks($('#js_ui_view').data('date'),0,true);
							$.extend(b_data,data.require);
							console.info('data.require',data,obj,b_data,week_obj)
							ReqFun.appendRequire(b_data,week_obj,false);
							ReqFun.hideRequirePop();
							//插入需求属性
							insertAttr(data.require.require_id)
							//删除需求池缓存信息
							//ReqFun.removeListCache();
							//更新缓存时间截
							$('#js_toggle_page').attr('data-list-reload',true);
                            //缓存rank状态 下次使用默认 不用每次选择
                            defaultRank = {
                                rank_id:obj.require.require_rank_id,
                                rank_cate_id:obj.require.require_rank_cate_id
                            };
                            localStore.setRankRequire(defaultRank);
						}
					});
				}else{
					Fun.alert(0,msg.add_error);
				}
				
			});
			return false;
		},
		/**
		 * 隐藏弹窗 
		 */
		hidePop:function(){
			$('.js_pop .js_close').on('click',function(){
				ReqFun.hideRequirePop();
			});
		},

		/**
		 * 初始化需求类型及需求归档 
		 */
		initTypeAndRank:function(){
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
            //修改下拉框
            var str = '0';
            //debugger;
			$('#js_require_type_id,#js_pop_require_type_id select,#js_pop_require_type_id_2').html(listType);
            $('#js_require_rank_id,#js_pop_require_rank_id select').html(listRank);
            $('#js_require_rank_cate_id,#js_pop_require_rank_cate_id select,#js_bd_rank_cate').html(listRankCate);

			$('#js_point_cp').html(listCp).find('[data-type="1"]').each(function(){
				var $this = $(this),
					cp_id = $this.attr('value');
					str += ',' + cp_id;
				$this.appendTo('#js_waipai');	
			});
			$('#js_waipai_all').attr('value',str);
			
			$('.js_type_select').html(listType_2);
		},
		/**
		 * 初始化需求 属性那一块内容区域 
		 */
		initRequireAttr:function(){
			//删除按钮
			$(document).on('click.del','#js_attr_cont .js_del,#js_pop_attribute_v_1 .js_del,#js_pop_attribute_v_2 .js_del',function(){
				var $this = $(this),
					$tr = $this.closest('.js_row'),
					val = $tr.find('.js_att_text').val(),
					att_id = $tr.attr('data-id');
				if(val){
					if(confirm('确认要删除这行吗?')){
						$tr.remove();
						att_id && RestApi.delAttrById(att_id);
					}
				}else{
					$tr.remove();
					att_id && RestApi.delAttrById(att_id);
				}	
				
				return false;
			});
            var $attrCont = $('#js_attr_cont');
			//新增一行按钮
            $attrCont.on('click.add','.js_add',function(){
				var str = $('#js_attr_clone').find('tbody').html();
				$('#js_attr_cont').find('tbody').append(str);
				return false;
			});
			
			$('#js_add_attr_btn').on('click.add',function(){
				var str = $('#js_pop_att_clone').html();
				$('#js_pop_attribute_v_1').append(str);
				return false;
			});
			
			$('#js_add_attr_btn_2').on('click.add',function(){
				var str = $('#js_pop_att_clone').html();
				$('#js_pop_attribute_v_2').append(str);
				return false;
			});
			
			//新增需求时  若选择 数量 则不显示相关配套内容
            $attrCont.on('change','.js_type_select',function(){
				var $this = $(this),
					$type = $('#js_require_type_id'),
					type_id = $type.getValue(),
					show_num = $type.find('option:selected').attr('data-show-num'),
					this_type_id = $this.getValue();
				if(type_id == this_type_id && show_num == 1){
					Fun.alert(0,'请直接在【需求类型】那选择数量即可，无需新增一样的配套类型');
					$this.setValue(1);
				}
			});
		},

		changeAdText:function(){
			ReqFun.changeAdTextEvent($('#js_require_type_id'),$('#js_require_ads'));
		},

        triggerRank:function(){
            ReqFun.triggerRankEvent('#js_require_rank_id');
            ReqFun.triggerRankEvent('#js_pop_require_rank_id select');
        },

		/**
		 * 初始化设计师弹窗 
		 */
		initDesignerPop:function(){
			$('#js_require_verify_user').on({
				'focus':function(){
					var id = $(this).attr('id'),
						rank_id = $('#js_require_rank_id').getValue();
//					console.info(id,$('#js_require_rank_id').getValue())
					Fun.showCheckUserPop(rank_id,'#'+id)
				}
			});
			$('#js_require_verify_user2').on({
				'focus':function(){
					var id = $(this).attr('id'),
						rank_id = $('#js_pop_require_rank_id').find('select').getValue();
					Fun.showCheckUserPop(rank_id,'#'+id)
				}
			});
			$('#js_require_rank_id').on('change',function(){
				Fun.hideCheckUserPop();
				$('#js_require_verify_user').val('');
			});
		},
		/**
		 * 初始化 前端弹窗 
		 */
		initDevPop:function(){
			$('#js_require_verify_dev').on({
				'focus':function(){
					var id = $(this).attr('id');	
					Fun.showDevPop('#'+id);
				}
			});
			
			$('#js_rank_dev').on('click','li',function(){
				var name = $(this).find('strong').text();
				$('#js_require_verify_dev').val(name);
				Fun.hideDevPop();
				return false;
			});
		},

		/**
		 * 初始化 
		 */
		init:function(){
            //初始化
            for(var i in this) {
                if (this.hasOwnProperty(i) && i !== 'init') {
                    this[i]();
                }
            }
		}
		
	};
	
	exports.init = function(){
		console.info('init require add');
		Events.init();
		checkStatePdm();
	};
	
	
});

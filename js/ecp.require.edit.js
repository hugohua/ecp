/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		RestApi = require('./ecp.rest'),
		ReqGetSet = require('./ecp.require.getset'),
		Fun = require('./ecp.func'),
		localStore = require('./ecp.localstore'),
		ReqFun = require('./ecp.require.func');
	
	var msg = {
		edit_error:'所有输入框不能为空，请检查后重新输入!',
		conf:'你确认要删除这个需求吗？'
	}
	
	var model = {
		id_tapd_tab : '#js_tapd_tab', //表头id
		id_req_list : '#js_req_list', //表内容id 用于放置需求列表
		id_req_list_tmpl : '#js_req_list_tmpl',		//内容模板
	};
	
	/**
	 * 删除需求 
	 */
	var removeReqBox = function(container){
		var $td =  $(container).parent();
		$(container).hide("highlight",function(){
			$(this).remove();
		});
		ReqFun.splitCell( $td );
	};
	
	
	var Events = {
		/***
		 * 点击修改链接 弹出修改窗口 
		 */
		editReqPop:function(){
			//TODO:这里修改成 类名js_tapd_item
			$(model.id_req_list).on('click.edit','.js_tapd_item',function(){
				var $this  = $(this),
					$container = $this.closest('td'),
					require_id = $this.attr('data-id'),
					is_edit = $this.hasClass('js_drag_edit');		//是否可编辑修改
				
				localStore.getRequireDataById(require_id,function(data){
					var pop_obj = {
						day:$container.attr('data-day'),
						week_name:$container.attr('data-week-name'),
						type: is_edit ? '修改排期' : '查看需求',
						req_type_id:data.require_type || 1,
						rank_id:data.require_rank_id			//需求归类
					};
				// console.info(pop_obj,'pop_obj');
					//设置弹窗显示内容
					ReqFun.setPopInfo(pop_obj);
					//设置表单数据
					ReqGetSet.setRequireInfo(data);
					//拉取属性设置数据
					ReqFun.getAttrByReqId(require_id);
					//显示 隐藏 按钮
					$('#js_edit_require_btn,#js_del_require_btn').show();
					$('#js_add_require_btn').hide();
					//打开弹窗
					ReqFun.showRequirePop(is_edit);
				});
				
				return false;
			});
		},
		/**
		 * 修改需求事件 
		 */
		editReq:function(){
			$('#js_edit_require_btn').on('click',function(){
				var $this = $(this),
					obj = ReqGetSet.getRequireInfo(),
					validate = Fun.validate('#js_require_info');
				console.info(obj,'obj');
				//修改不需要更新需求类型
				delete obj.require.require_type;
				if(validate){
					//提交数据	
					RestApi.putRequire(obj).success(function(data){
						if(data && data.require){
							//alert(msg.add_succ);
							var r_info = ReqGetSet.getRequireBox(),
								$container = $('#js_require_' + data.require.require_id);
								
							ReqGetSet.setRequireBox($container,data.require);
							localStore.setRequireDataById(data.require.require_id,data.require);
							ReqFun.hideRequirePop();
							//更新需求属性
							ReqGetSet.insertUpdateAttr(data.require.require_id,$('#js_attr_cont'));
							//更新配套广告数
							//ReqGetSet.updateAttrForAds(data.require.require_id,$('#js_require_ads'))
							//更新缓存时间截
							$('#js_toggle_page').attr('data-list-reload',true);
						};
					});
				}else{
					Fun.alert(0,msg.edit_error);
				};
			});
			return false;
		},
		delRequire:function(){
			$('#js_del_require_btn').on('click.del',function(){
				var $this = $(this),
					del_id = $('#js_require_id').val();
				//隐藏操作区域
				if(confirm(msg.conf)){
					RestApi.delRequireById(del_id).success(function(data){
						removeReqBox('#js_require_'+del_id);
						ReqFun.hideRequirePop();
						//更新缓存时间截
						$('#js_toggle_page').attr('data-list-reload',true);
					});
				};
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
		console.info('init require edit');
		Events.init();
	};
	
	
});

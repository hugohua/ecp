/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
		c = require('./ecp.config.user'),
		Mustache = require('mustache'),
		ReqFun = require('./ecp.require.func'),
		RestApi = require('./ecp.rest');
	
	/**
     * 设置头部文字 
     */
    exports.setListTxt = function(state,num){
    	var tit = $('#js_filter_state [data-state="'+ state +'"]').text(),
    		n_txt =  num ? '('+ num +')' : '';
    	$('#js_list_text').text(tit + n_txt);
    };
    
    /**
     * 获取数据 时间维度 
     */
    exports.getType = function(){
    	var type = $('#js_filter_type a.current').attr('data-type') || 'week';
    	return type;
    };
    
    /**
     * 获取需求类型 
     */
    exports.getState = function(){
    	var state = $('#js_filter_state li.current').attr('data-state') || 8;
    	return state;
    };
    
    /**
	 * 检测type是否选中 
	 */
	exports.checkType = function(type){
		type = type || exports.getType();
		if(!$('#js_filter_type a.current').length){
			$('#js_filter_type a[data-type="'+ type +'"]').addClass('current');
		}
	};
	
	/**
	 * 设置type 
	 */
	exports.setType = function(type){
		Fun.setUrlParam("type",type);
		exports.removeType();
		$('#js_filter_type a[data-type="'+ type +'"]').addClass('current');
	};
	
	
	/**
	 * 移除时间类型 
	 */
	exports.removeType = function(){
		$('#js_filter_type a').removeClass('current');
	};
	
	/**
	 * 移除日期选择内容 
	 */
	exports.removeDateSelect = function(){
		$('#js_date_from,#js_date_to').val('');
	};
	
	/**
	 * RTX弹窗提醒PM排期 
	 */
	exports.rtxPm = function(receiver,num){
		var user = Fun.getUserName();
		RestApi.sendRtxMsg({
			title:'ECP待排期提醒',
			receiver:receiver,
			msginfo:user + '提醒您，尚有' + num + '个待排期需求未处理，请登录：'+ c.root +' 查看'
		});
	};
	
	/**
	 * RTX弹窗提醒PDM 和设计师 
	 */
	exports.rtxPdmDesgin = function(receiver){
		var user = Fun.getUserName();
		RestApi.sendRtxMsg({
			title:'ECP待评分提醒',
			receiver:receiver,
			msginfo:user + '刚刚发起了待评分提醒，请关注。详情请登录：'+ c.root +' 查看'
		});
	};
	
    /**
     * 修改需求后 更新 行 
     */
    exports.updateTr = function($tr,data){
    	$tr.find('.js_p_require_name').text(data.require.require_name);
    	$tr.find('.js_p_type_name').text(data.require.type_name);
    	$tr.find('.js_p_rank_name').text(data.require.rank_name);
    	$tr.find('.js_p_require_verify_user').text(Fun.getEnglishName(data.require.require_verify_user));
    	$tr.find('.js_p_require_start_date').text(data.require.require_start_date);
    	$tr.effect("highlight",1000);
    	console.info($tr,data,$tr.find('.js_p_require_verify_user'))
    };
    
    /**
     * 修改需求后 更新 行 
     */
    exports.updateTrForPm = function($tr,data){
    	exports.updateTr($tr,data);
    	//console.info($tr.find('.js_p_cp_name'),data.require.cp_name)
    	//$tr.find('.js_p_require_start_date').text(data.require.require_start_date);
    	$tr.find('.js_p_cp_name').text(data.require.cp_name).attr('data-cp-id',data.require.cp_id);
    	$tr.find('.js_p_require_workload').text(data.require.require_workload);
    	if(data.require.require_state == 4){
    		
    		$tr.find('.js_ui_range').attr({
    			'data-workload':data.require.require_workload,
    			'data-date':data.require.require_start_date
    		})
			ReqFun.setUiRank($tr);
		};
    };
    
    /**
     * 需求概况 点击获取数据 
 * @param {Object} state
 * @param {Object} type
     */
    exports.triggerAction = function(state,type,callback){
    	$('#js_filter_state li').removeClass('current');
    	$('#js_filter_state li[data-state="'+ state +'"]').addClass('current');
    	
    	$('#js_filter_type a').removeClass('current');
    	$('#js_filter_type a[data-type="'+ type +'"]').addClass('current');
		Fun.setUrlParam("state",state);
		Fun.setUrlParam("type",type);
		exports.checkType();
		exports.removeDateSelect();
		if (callback && typeof(callback) === "function") {  
        	callback();  
  		};
    };
    
    /**
	 * 新增选中状态 
	 */
	exports.addCurrent = function(state,type){
		//模拟点击
    	$('#js_filter_type a[data-type="'+ type +'"]').addClass('current');
    	$('#js_filter_state li[data-state="'+ state +'"]').addClass('current');
	};
    
	/**
     * 删除一行 
     */
    exports.removeTr = function(require_id){
    	 $('#js_ui_tables table:visible tr[data-id="'+ require_id +'"]').remove();
    };
    
    /**
	 * 获取需求属性列表 
	 * can_hide 是否可以隐藏
	 */
	exports.getAttrByReqId = function(require_id,num,can_hide){
		
		$('#js_pop_attribute_t_' + num).empty();
		$('#js_pop_attribute_v_'+num).empty();
		$('#js_pop_attribute').show();
		var req = RestApi.getAttributeById(require_id).success(function(data){
			if(data && data.attribute){
				var length = data.attribute.length;
				if(length){
					var tpl = $('#js_pop_attribute_t_tmpl').html(),
						listHtml = Mustache.to_html(tpl, data);
					//$('#js_pop_attribute').show();	
					$('#js_pop_attribute_t_' + num).html(listHtml);
					
					//输入框
					exports.setAttrList(data,num);
				}else{
					$('#js_pop_attribute_t_' + num).html('无');
					// $('#js_pop_attribute').hide();
				}
			};
		});
	};
	
	/**
	 * 获取需求属性列表 
	 * can_hide 是否可以隐藏
	 */
	exports.getAttrByReqBakId = function(require_id,num,can_hide){
		
		$('#js_pop_attribute_t_' + num).empty();
		$('#js_pop_attribute_v_'+num).empty();
		$('#js_pop_attribute').show();
		var req = RestApi.getAttributeBakById(require_id).success(function(data){
			if(data && data.attribute){
				var length = data.attribute.length;
				if(length){
					var tpl = $('#js_pop_attribute_t_tmpl').html(),
						listHtml = Mustache.to_html(tpl, data);
					//$('#js_pop_attribute').show();	
					$('#js_pop_attribute_t_' + num).html(listHtml);
					
					//输入框
					exports.setAttrList(data,num);
				}else{
					$('#js_pop_attribute_t_' + num).html('无');
					// $('#js_pop_attribute').hide();
				}
			};
		});
	};
	
	/**
	 * 设置右侧弹窗的属性配置列表 
	 */
	exports.setAttrList = function(data,num){
		var str = $('#js_pop_att_clone').html(),
			$container = $('#js_pop_attribute_v_'+num);
			//$('#js_pop_attribute').show();
		if($container.length){
			for(var i in data.attribute){
				var a_data = data.attribute[i],
					$clone = $(str);
				$clone.attr({
				'data-id':a_data.att_id,
				'data-type':'update'
				})
			   .find('.js_attr_type_id').setValue(a_data.attr_type_id).removeAttr('id')
			   .end().find('.js_att_text').val(a_data.att_text).attr('old-value',a_data.att_text)
			   .end().appendTo($container);
			};	
		};//if	
	};
	
	/**
	 * 设置需求稿链接 
	 */
	exports.setAttLink = function(data){
		if(data.require_desgin_attachment){
			var att_obj = JSON.parse(data.require_desgin_attachment);
			exports.setFileList(att_obj,2);
			exports.setFileList(att_obj,1);
		}
	};
	
});

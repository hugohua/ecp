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
		// Upload = require('./ecp.uploader'),
		localStore = require('./ecp.localstore');
	
	require('jquery.field')($);
	
	/**
	 * 检测type是否选中 
	 */
	exports.checkType = function(type,state){
		$('.js_filter_type a','#js_list_table_'+state).removeClass('current');
		$('.js_filter_type a[data-type="'+ type +'"]','#js_list_table_'+state).addClass('current');
	};
	
	/**
	 * 移除时间类型 
	 */
	exports.removeType = function(state){
		$('.js_filter_type a','#js_list_table_'+state).removeClass('current');
	};
	
	/**
	 * 新增选中状态 
	 */
	exports.addCurrentPdm = function(state,type){
		//模拟点击
		$('.js_filter_type a','#js_list_table_'+state).removeClass('current');
    	$('.js_filter_type a[data-type="'+ type +'"]','#js_list_table_'+state).addClass('current');
    	$('#js_filter_state li').removeClass('current');
    	$('#js_filter_state li[data-state="'+ state +'"]').addClass('current');
	};
	
	/**
     * 获取需求类型 
     */
    exports.getType = function(state){
    	var type = $('.js_filter_type a.current','#js_list_table_'+state).attr('data-type') || 'all';
    	console.info( $('.js_filter_type a.current','#js_list_table_'+state),'bbbbbbbbbbbbbbbbbbbb')
    	return type;
    };
    
    /**
	 * 新增选中状态 
	 */
	exports.addCurrent = function(state,type){
		//模拟点击
		$('.js_filter_type a','#js_list_table_'+state).removeClass('current');
    	$('.js_filter_type a[data-type="'+ type +'"]','#js_list_table_'+state).addClass('current');
    	$('#js_filter_state li').removeClass('current');
    	$('#js_filter_state li[data-state="'+ state +'"]').addClass('current');
	};
	
	/**
     * 设置头部文字 
     */
    exports.setListTxt = function(state,num){
    	var n_txt =  num ? '('+ num +')' : '';
    	$('#js_list_table_'+ state).find('.js_table_num').text(n_txt);
    };
    
    /***
     * 显示相应的 表格
     */
    exports.showTableByState = function(state){
    	$('#js_list_table_' + state).show().siblings('.js_ui_page').hide();
    	// var $old_page = $('#js_ui_tables .js_ui_page:visible'),
    		// $new_page = $('#js_list_table_' + state);
//     	
    	// //不是同一个
    	// if($old_page.attr('id') !== $new_page.attr('id') ){
    		// $old_page.hide();
    		// $new_page.show( 
    			// "drop", 
                // {direction: "down",easing: 'easeOutQuad',},
                // 500 );
    	// };
    };
	
	
	
});

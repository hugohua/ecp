/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		Fun = require('./ecp.func'),
		ReqFun = require('./ecp.require.func'),
		RestApi = require('./ecp.rest'),
		localStore = require('./ecp.localstore');
	
	require('jquery.field')($);
	
	/**
	 * 判断是否是工作日填写需求 
	 */
	var isWork = function(){
		var is_work = $('#js_tapd_tab').hasClass('weekend');
		return is_work;
	};
	
	/**
	 * 获取需求信息 
	 */
	exports.getRequireInfo = function(){
		var start = $('#js_require_start_date').val(),
			workload = $('#js_require_workload').getValue(),
			require_cp_id = parseInt($('#js_point_cp').getValue(),10),			//是否指定CP
			require_state = require_cp_id ? 5 : 1,						//指定CP后   改成待邮件状态
			require_type = $('#js_table_view').data('tempreq') ? 0 : 1,	//是否临时需求
			iswork = isWork();
		var obj = {
			require:{
				require_id						:$('#js_require_id').val(),
				require_name					:$('#js_require_name').val(),					//需求名称
				require_type_id					:$('#js_require_type_id').getValue(),			//需求类型
				require_rank_id					:$('#js_require_rank_id').getValue() || 1,			//需求归类
                require_rank_cate_id            :$('#js_require_rank_cate_id').getValue(),      //需求归类细分
				require_verify_user				:$('#js_require_verify_user').val(),			//审核设计师
				require_verify_dev				:$('#js_require_verify_dev').val(),				//审核前端
				require_state					:require_state,
				require_ads						:$('#js_require_ads').val() || 1,				//配置广告数
				require_workload				:workload,			//预计工作量
				require_demand					:$('#js_require_demand').val(),					//设计要求
				require_start_date				:start,				//开始时间
				//require_attachment				: require_attachment,							//附件
				require_creator					: $.trim($('#js_require_creator').val()) || Fun.getUserName(),							//需求创建者
				require_finish_date				: ReqFun.getEndDate(start,workload,iswork),		//结束时间
				require_type					: require_type,
				require_cp_id					: require_cp_id
				//require_add_time				: Fun.dateFormat(new Date(),"yyyy-MM-dd hh:mm:ss")
			}
		};
		return obj;
	};
	
	/***
	 * 设置需求信息 
 	 * @param {Object} data
	 */
	exports.setRequireInfo = function(data){
		$('#js_require_id').val(data.require_id);			
		$('#js_require_name').val(data.require_name);			//需求名称
		$('#js_require_type_id').setValue(data.require_type_id);	//需求类型
		$('#js_require_rank_id').setValue(data.require_rank_id);	//需求归类
        $('#js_require_rank_cate_id').setValue(data.require_rank_cate_id);
		$('#js_require_verify_user').val(data.require_verify_user);	//审核设计师
		//$('#js_require_verify_dev').val(data.require_verify_dev);		//审核前端
		$('#js_require_ads').val(data.require_ads).attr('old-value',data.require_ads);			//配置广告数
		$('#js_require_workload').setValue(data.require_workload).attr('old-wday',data.require_workload);		//预计工作量
		$('#js_require_demand').val(data.require_demand);			//设计要求
		$('#js_require_start_date').val(data.require_start_date);		//开始时间
		$('#js_point_cp').setValue(data.require_cp_id);
		$('#js_require_creator').val(data.require_creator || Fun.getUserName());
		console.info(data,'dddd')
		ReqFun.changeAdText(data.type_show_num,data.type_check);
        ReqFun.triggerRank('#js_require_rank_id');
		//触发事件
		//Fun.showPopAtt( data.require_type_id );
		//附件
		// if(data.require_attachment){
			// var att_obj = JSON.parse(data.require_attachment);
			// $('#js_att_list_3').empty();
			// exports.setFileList(att_obj,3);
		// };
	};
	
	/**
	 * 获取需求信息 
	 */
	exports.getRequireBox = function(){
		var obj = {
			require_name			:$('#js_require_name').val(),			//需求名称
			rank_name				:$('#js_require_rank_id option:selected').text(),	//需求归类
			type_name				:$('#js_require_type_id option:selected').text()	//需求类型
			//require_ads				:$('#js_require_ads').val(),			//配置广告数
		};
		console.info('getRequireBox',obj)
		return obj;
	};
	
	
	/**
	 * 设置Box信息
	 * @param {Object} container
	 * @param {Object} data
	 */
	exports.setRequireBox = function($container,data){
		var r_data= exports.getRequireBox();
		$.extend(data, r_data);
		
		//判断是否修改工作量
		var oday = parseFloat($('#js_require_workload').attr('old-wday')),
			wday = parseFloat(data.require_workload),
			week_obj = Fun.getWeeks($('#js_ui_view').data('date'),0,true),
			$td = $container.parent();
		//加大了工作日
		if(wday !== oday){
			ReqFun.appendRequire(data,week_obj,false);
			$container.remove();
			ReqFun.splitCell($td);
		}else{
			$('.js_require_rank_name',$container).text(data.rank_name);
			$('.js_require_name',$container).text(data.require_name);
			$('.js_require_type_name',$container).text(data.type_name);
			//$('.js_require_ads',$container).text(data.require_ads);
			$container.effect("highlight",1000);
		}
	};
	
	/**
	 * 拖动需求时  更新需求时间 
	 * $td:目标td
	 * $div:拖动的对象
	 */
	exports.getRequireDate = function($td,$div){
		var start = $td.attr('data-day');
		var obj = {
			require:{
				require_start_date:start,
				require_finish_date:ReqFun.getEndDate(start,$div.attr('data-workload'),isWork()),
				require_id:$div.attr('data-id')
			}
		};
		return obj;
	};
	
	var getPriceForReq = function($container,rating){
		var cp_id = $('#js_pop_cp_id').val(),
			t_base = $('#js_pop_require_type_id').attr('data-type-id'),
			base_num = $('#js_pop_require_ads').val() || $('#js_pop_require_ads_2').val() ,
			require_start_date = $('#js_pop_require_start_date').attr('data-date'),
			price_t = 0;
		$('.js_row',$container).each(function(){
			var $this = $(this),
				$type = $this.find('.js_attr_type_id'),
				type_id = $type.getValue(),
				type_chek = parseInt($type.find('option:selected').attr('data-check'),10),
				attr_arting = type_chek ? rating : 'B',
				num = parseInt($this.find('.js_att_text').val(),10),
				price = localStore.getPriceByIds(cp_id,type_id,attr_arting,require_start_date);
			//如果是数字	
			if($.isNumeric( num )){
				price_t += price * num;
			}
		});
		//本身价格 * 数量
		price_t += (localStore.getPriceByIds(cp_id,t_base,rating,require_start_date) * parseInt(base_num,10));
		return price_t;
	};
	
	/**
	 * 设计师 获取价格 
	 */
	var getPriceForDesign = function($container,rating){
		var cp_id = $('#js_pop_cp_id').val(),
			t_base = $('#js_pop_require_type_id').attr('data-type-id'),
			require_start_date = $('#js_pop_require_start_date').attr('data-date'),
			price_t = 0;
		$('.js_row',$container).each(function(){
			var $this = $(this),
				type_id = $this.attr('data-type'),
				num = parseInt($this.attr('data-num'),10),
				price = localStore.getPriceByIds(cp_id,type_id,rating,require_start_date);
			//如果是数字	
			if($.isNumeric( num )){
				price_t += price * num;
			}
		});
		//本身价格
		price_t += localStore.getPriceByIds(cp_id,t_base,rating,require_start_date);
		return price_t;
	};
	
	/**
	 * 判断是否修改过配置属性 
	 */
	var checkModifyAttr = function($container){
		var check = 1;
		$('#js_req_mark input[old-value]').each(function(){
			var $this = $(this),
				old_val = $this.attr('old-value'),
				new_val = $this.val();
			if(old_val != new_val){
				check = 0;
				return check;
			}
		});
		//有新增需求配置 则直接返回
		if( $('#js_pop_attribute_v_2 p[data-type="insert"]').length ){
			check = 0;
			return check;
		};
		return check;
	};
	
	/**
	 * 产品经理打分 及 附件上传 
	 */
	exports.getMarkData = function(){
		//附件上传
		var att_list = exports.getFileList('#js_att_list_2'),
			type_check = parseInt($('#js_pop_type_check').val(),10),
			str = '',
			require_state = type_check ? 4 : 3, //3 直接到达已完成状态
			require_mark_pdm = parseInt($('#js_require_mark_pdm').getValue() || 0);
			
		att_list &&  (str = JSON.stringify(att_list));
		
		var obj = {
    		require:{
    			require_mark_pdm:require_mark_pdm,			//打分
    			require_id:$('#js_pop_require_id').val(),
    			require_desgin_attachment:str,
    			require_pdm_comment:$('#js_require_pdm_comment').val(),
    			require_state:require_state,
    			is_modify_attr:checkModifyAttr(),
    			require_type_id:$('#js_pop_require_type_id_2').getValue(),
    			require_ads:$('#js_pop_require_ads_2').val(),
    			require_rank_id:$('#js_pop_require_rank_id').attr('data-rank-id')
    		}
    	};
    	//不需要打分 则可直接算价格
		if(!type_check){
			require_state = 3;
			var price = getPriceForReq('#js_pop_attribute_v_2','B');
			obj.require.require_base_cost = price;
			obj.require.require_final_cost = price;
			delete obj.require.require_mark_pdm;
		};
    	
    	//不存在 则不需要更新
    	if(!str){
    		delete obj.require.require_desgin_attachment;
    	}
    	return obj;
    };
    
    
    /**
	 * 设计师打分
	 */
	exports.getDesginMarkData = function(){
		var require_mark_avg,
			require_id = $('#js_pop_require_id').val()
			require_mark_desgin = parseInt($('#js_require_mark_desgin').getValue(),10),
			d_mark = parseInt($('#js_pop_require_mark_pdm span').text()),		//产品经理打分
			avg = (require_mark_desgin + d_mark)/2 ,
			rating = Fun.getRating(avg);
			price = getPriceForReq('#js_pop_attribute_v_1',rating);
			
		var obj = {
    		require:{
    			require_mark_desgin:require_mark_desgin,			//打分
    			require_id:require_id,
    			require_desgin_comment:$('#js_require_desgin_comment').val(),
    			require_base_cost:price,
    			require_final_cost:price,
    			require_state:3,
    			require_mark_avg:avg,
    			require_rating:rating,
    			require_rating_pdm:rating
    		}
    	};
    	return obj;
    };
    
    /**
	 * 附件列表 
	 */
	exports.setFileList = function(data,num){
		var _changeData = function(data){
			if(data.attachment.length){
				for(var i in data.attachment){
					var type = data.attachment[i]['type'];
					data.attachment[i]['type_'+type] = true;
				}
			}else{
				var type = data.attachment['type'];
				data.attachment['type_'+type] = true;
			}
			return data;
		}
		if($('#js_att_tmpl_'+num).length){
			var tpl = $('#js_att_tmpl_'+num).html(),
				listHtml = Mustache.to_html(tpl, _changeData(data));
			$('#js_att_list_'+num).append(listHtml);
		}
		console.info(data, $('#js_att_tmpl_'+num),$('#js_att_list_'+num),'setFileList')
	};
	
	
	/**
	 * 获取文件列表 
	 */
	exports.getFileList = function($container){
		var arr = [],obj;
		if(!$('li',$container).length) return;
		$('li',$container).each(function(index) {
			var $li = $(this);
			arr.push({
			   	filename:$li.attr('data-filename'),
			   	filedesc:$li.attr('data-filedesc'),
			   	type:$li.attr('data-type'),
			   	url:$li.find('a').attr('href')
			});
		});
		
		obj = {
			attachment:arr
		};
		console.info(obj,'obj')
		return obj;
	};
	
	/**
	 * 成品附件 
 	 * @param {Object} data 
	 */
	// exports.setDesginList = function(data){
		// var tpl = $('#js_att_right_tmpl').html(),
			// listHtml = Mustache.to_html(tpl, data);
		// $('#js_att_list_right').append(listHtml);
	// };
	
	/**
	 * 设置右侧弹出层 数据 
	 */
	exports.setRightPopInfo = function(data,ispm){
		if(typeof ispm == "undefined") {ispm = false;}
//		console.info(data,'dddd')
        var $typeId = $('#js_pop_require_type_id'),
            $sDate = $('#js_pop_require_start_date');
		$('#js_pop_require_id').val(data.require_id);
		$('#js_pop_require_name').find('input').val(data.require_name);			//需求名称
        $typeId.attr({
			'data-type-id':data.type_id,
			'data-type-check':data.type_check
		});
        $typeId.find('select').setValue(data.require_type_id);	//需求类型

		$('#js_pop_require_rank_id').find('select').setValue(data.require_rank_id);	//需求归类
//        debugger;
        ReqFun.triggerRank('#js_pop_require_rank_id select');
        $('#js_pop_require_rank_cate_id_select').setValue(data.require_rank_cate_id);//归类细分
//        console.log($('#js_pop_require_rank_cate_id').find('select'),data.require_rank_cate_id,'======a====');

		$('#js_require_verify_user2').val(data.require_verify_user);	//审核设计师
		//$('#js_pop_require_ads input').setValue(data.require_ads).attr('old-value',data.require_ads);			//配置广告数
		$('#js_pop_require_ads').val(data.require_ads).attr('old-value',data.require_ads);
		$('#js_pop_require_workload').find('select').setValue(data.require_workload);		//预计工作量
		$('#js_pop_require_demand').find('textarea').val(data.require_demand);			//设计要求
        $sDate.attr('data-date',data.require_start_date);
        $sDate.find('input').val(data.require_start_date);		//开始时间
		$('#js_pop_type_check').val(data.type_check);							//是否需要打分
		$('#js_pop_cp_id').val(data.cp_id);										//是否需要打分
		ReqFun.changeAdText(data.type_show_num,data.type_check);

        //是否临时需求
        $('#js_pop_require_type').find('select').setValue(data.require_type);

		//设计稿附件
		$('#js_att_list_2').empty();
		if(data.require_desgin_attachment){
			var att_obj = JSON.parse(data.require_desgin_attachment);
			exports.setFileList(att_obj,2);
		};
		
		$('#js_pop_require_pdm_comment').find('span').html(data.require_pdm_comment).show();		//产品经理评语
//		console.info(data.require_pdm_comment,'data.require_pdm_commentdata.require_pdm_comment')
		//产品评语
		$('#js_pop_require_desgin_comment').find('span').html(data.require_desgin_comment).show();		//设计师评语评语
		
		//PM视图
		if(ispm){
			$('#js_pop_require_cp_id').find('select').setValue(data.require_cp_id);
			$('#js_pop_require_base_cost').text(data.require_base_cost);			//基础价格
			$('#js_pop_require_pm_cost').val(data.require_pm_cost);			//基础价格
			$('#js_require_final_cost').val(data.require_final_cost);			//基础价格
			$('#js_pop_require_cost_comment').val(data.require_cost_comment);			//基础价格
			$('#js_pop_require_pm_cost_change').setValue(data.require_pm_cost_change);			//基础价格
		};
		
		//新增编号 和 创建者
		$('#js_pop_req_id').text(data.rank_short+ data.require_id);
		$('#js_pop_creater').text(data.require_creator);
		
		console.info(data,'setRightPopInfo')
	};
	
	/**
	 * 设置右侧文本内容 
	 */
	exports.setRightPopText = function(data){
		$('#js_pop_require_id').val(data.require_id);			
		$('#js_pop_require_name').find('span').text(data.require_name);			//需求名称
		$('#js_pop_require_type_id').attr({
			'data-type-id':data.type_id,
			'data-type-check':data.type_check
		});
		$('#js_pop_require_type_id').find('span').text(data.type_name);	//需求类型
		$('#js_pop_require_type_id').find('strong').text('('+ data.require_ads +'个)');	//需求类型
		$('#js_pop_require_rank_id').attr('data-rank-id',data.rank_id);
		$('#js_pop_require_rank_id').find('span').text(data.rank_name);	//需求归类
		$('#js_pop_require_verify_user').find('span').text(data.require_verify_user  || '无');	//审核设计师
		$('#js_pop_require_cp_id').find('span').text(data.cp_name);
		$('#js_pop_require_ads').val(data.require_ads).attr('old-value',data.require_ads);
		//$('#js_pop_require_ads span').text(data.require_ads);			//配置广告数
		$('#js_pop_require_workload').find('span').text(data.require_workload);		//预计工作量
		$('#js_pop_require_demand').find('span').text(data.require_demand);			//设计要求
		$('#js_pop_require_start_date').attr('data-date',data.require_start_date);
		$('#js_pop_require_start_date').find('span').text(data.require_start_date);		//开始时间
		$('#js_pop_require_base_cost').text(data.require_base_cost);			//基础价格
		$('#js_pop_require_pm_cost_change').setValue(data.require_pm_cost_change);
		$('#js_pop_require_pm_cost').val(data.require_pm_cost);
		$('#js_require_final_cost').val(data.require_final_cost);	
		$('#js_pop_require_cost_comment').val(data.require_cost_comment);
		$('#js_pop_type_check').val(data.type_check);							//是否需要打分
		$('#js_pop_cp_id').val(data.cp_id);	
		ReqFun.changeAdText(data.type_show_num,data.type_check);
		$('#js_pop_require_ads').hide();
		if(data.require_mark_desgin != 0){
			$('#js_pop_require_mark_desgin').show().find('span').text(data.require_mark_desgin).addClass(Fun.getRatingColor(data.require_mark_desgin));				//设计师打分
		}else{
			$('#js_pop_require_mark_desgin').hide();
		};
		if(data.require_mark_pdm != 0){
			$('#js_pop_require_mark_pdm').show();
			$('#js_pop_require_mark_pdm span').text(data.require_mark_pdm).addClass(Fun.getRatingColor(data.require_mark_pdm));				//设计师打分
		}else{
			$('#js_pop_require_mark_pdm').hide();
		};
		console.log(data.require_mark_avg,'js_pop_require_mark_avg')
		if(data.require_mark_avg != 0){
			
			$('#js_pop_require_mark_avg').show();
			$('#js_pop_require_mark_avg span').text(data.require_mark_avg).addClass(Fun.getRatingColor(data.require_mark_avg));						//平均分
		}else{
			$('#js_pop_require_mark_avg').hide();
		};
		if(data.require_rating){
			$('#js_pop_require_rating').show();
			$('#js_pop_require_rating span').text(data.require_rating).addClass(Fun.getRatingColor(data.require_rating));				//评级
		}else{
			$('#js_pop_require_rating').hide();
		};
		if(data.require_pdm_comment){
			$('#js_pop_require_pdm_comment').show();
			$('#js_pop_require_pdm_comment span').html(data.require_pdm_comment);		//产品经理评语
		}else{
			$('#js_pop_require_pdm_comment').hide();
		};
		if(data.require_desgin_comment){
			$('#js_pop_require_desgin_comment').show();
			$('#js_pop_require_desgin_comment span').html(data.require_desgin_comment);		//设计师评语
		}else{
			$('#js_pop_require_desgin_comment').hide();
		};
		
		
		//设计稿附件
		$('#js_att_list_1,#js_att_list_2').empty();
		if(data.require_desgin_attachment){
			$('#js_pop_require_attr').show();
			var att_obj = JSON.parse(data.require_desgin_attachment);
			exports.setFileList(att_obj,2);
			exports.setFileList(att_obj,1);
		}else{
			$('#js_pop_require_attr').hide();
		};
		
		//新增编号 和 创建者
		$('#js_pop_req_id').text(data.rank_short+ data.require_id);
		$('#js_pop_creater').text(data.require_creator);
		
	};
	
	/**
	 * 获取修改价格数据 
	 */
	exports.getPriceInfo = function(){
		var obj = {
			require:{
				require_id:$('#js_pop_require_id').val(),
				require_base_cost : $('#js_pop_require_base_cost').text(),			//基础价格
				require_pm_cost_change:$('#js_pop_require_pm_cost_change').getValue(),
				require_pm_cost:$('#js_pop_require_pm_cost').val(),
				require_final_cost:$('#js_require_final_cost').val(),
				require_cost_comment:$('#js_pop_require_cost_comment').val()
				//require_state:11														//待结算	
			}
		};
		return obj;
	}
	
	/**
	 * 获取基础价格 和 最终价格 
	 * 保存数据时获取价格
	 */
	exports.getPricesForSave = function(callback){
		var require_id = $('#js_pop_require_id').val();
		
		localStore.getRequireDataById(require_id,function(data){
			//需求状态 待排期 待邮件 待启动 不需要计算价格
			if(data.require_state == 1 || data.require_state == 5 || data.require_state == 4){
				return false;
			}
			var rating = data.require_rating ? data.require_rating : 'B',
				base_price = getPriceForReq('#js_pop_attribute_v_1',rating),
				require_pm_cost = $('#js_pop_require_pm_cost').val() || data.require_pm_cost,
				change_cost = data.require_pm_cost_change == 1 ? require_pm_cost : -require_pm_cost,
				final_cost = base_price + parseFloat(change_cost);
			
			var obj = {
				require:{
					require_base_cost : base_price,
					require_final_cost : final_cost
				}
			};
			callback(obj);
		});
		// return obj;
	};
	
	/**
	 * 获取右侧弹窗基本信息 用于修改需求 
	 */
	exports.getRightPopInfo = function(){
		//需求附件上传
		// var att_list = exports.getFileList('#js_att_list_1'),
			// require_attachment = '';
// 			
		// att_list && 	(require_attachment = JSON.stringify(att_list));
		var cp_id = $('#js_pop_require_cp_id select').getValue() || $('#js_pop_cp_id').val(),
			start = $('#js_pop_require_start_date input').val(),
			workload = $('#js_pop_require_workload select').getValue(),
			iswork = isWork();
		var obj = {
			require:{
				require_id			    :$('#js_pop_require_id').val(),
				require_name		    :$('#js_pop_require_name input').val(),			//需求名称
				require_type_id		    :$('#js_pop_require_type_id select').getValue(),	//需求类型
                require_rank_id		    :$('#js_pop_require_rank_id select').getValue(),	//需求归类
                require_rank_cate_id	:$('#js_pop_require_rank_cate_id_select').getValue(),	//需求归类细分
				require_verify_user	    :$('#js_require_verify_user2').val(),	//审核设计师
				require_ads			    :$('#js_pop_require_ads').val(),			//配置广告数
				require_workload	    :workload,		//预计工作量
				require_demand		    :$('#js_pop_require_demand textarea').val(),			//设计要求
				require_start_date	    :start,		//开始时间
				require_cp_id		    :cp_id,
				require_finish_date	    : ReqFun.getEndDate(start,workload,iswork),		//结束时间
                require_type            : $('#js_pop_require_type').find('select').getValue()       //是否正常需求
				//require_attachment	: require_attachment,
				//require_mark_pdm:	$('#js_require_mark_pdm').getValue(),				//产品打分
			}
		};
		return obj;
	};
	
	/**
	 * 检测是否一定要上传 
	 * $uid 上传ID
	 */
	exports.checkUpload = function($uid,$ul){
		var check = true;
		if($uid.is(":visible")){
			if(!$ul.find('li').length){
				check = false;
			}
		}
		return check;
	};
	
	
	/**
	 * 获取rtx弹窗提醒 
 * @param {Object} $container
	 */
	exports.getRtxData = function($container){
		var sender = Fun.getUserName(),
			receiver = [];
			content = '您好！CP排期邮件(2012-9-17 ~ 2012-09-21)已由【'+ sender +'】发出，请及时关注相关需求进度！' ;
		//构建rtx接收者
		$('.task_review_tab tr',$container).each(function(){
			var $this = $(this),
				//desginer = $this.find('.js_e_require_verify_user').val(),
				creater = $this.find('.js_e_require_creator').text()
			//receiver.push(Fun.getEnglishName(desginer));
			receiver.push(creater);
		});
		receiver.push(sender);
		receiver = Fun.clearSort(receiver).join(';');
			
		//所有
		var obj = {
			title:"【ECP】排期邮件发送提醒 测试",
			receiver:'hugohua',
	 		msginfo: content
		};
		return obj;
	};
	
	/**
	 * 获取需求属性内容 
 	 * @param {Object} $container
	 */
	exports.getRequireAttrInfo = function($container){
		var arr_i = [],	//插入数据
			arr_u = [];//更新数据
		$container.find('.js_row').each(function(){
			var $tr = $(this),
				type = $tr.attr('data-type'),
				attr_type_id = $tr.find('.js_attr_type_id').getValue(),
				att_text = $tr.find('.js_att_text').val();
			//新增
			if(type === 'insert'){
				arr_i.push({
					attr_type_id:attr_type_id,
					att_text:att_text
				});
			}else{
				//更新
				arr_u.push({
					attr_type_id:attr_type_id,
					att_text:att_text,
					att_id:$tr.attr('data-id')
				});
			};
		});
		var obj = {
			insert:arr_i,
			update:arr_u
		};
		return obj;
	};
	
	/**
	 * 获取需求属性内容  新增需求弹窗部分
	 * TODO: 暂时不需要这种方式
 	 * @param {Object} $container
	 */
	exports.getRequireAttrTextInfo = function($container){
		var arr_i = [],	//插入数据
			arr_u = [];//更新数据
		$container.find('label').each(function(){
			var $this = $(this),
				type = $this.attr('data-type'),
				attr_type_id = $this.attr('data-type-id'),
				att_text = $this.find('input').val();
			//存在 并且不为0	
			if(att_text && att_text !=0){
				//新增
				if(type === 'insert'){
					arr_i.push({
						attr_type_id:attr_type_id,
						att_text:att_text
					});
				}else{
					//更新
					arr_u.push({
						attr_type_id:attr_type_id,
						att_text:att_text,
						att_id:$this.attr('data-id')
					});
				};
			};
			
		});
		var obj = {
			insert:arr_i,
			update:arr_u
		};
		return obj;
	};
	
	/**
	 * 设置需求概述信息 
 * @param {Object} data
	 */
	exports.setSummary = function(data,power){
		power = power || 0;
		//设置待办数量
		var toggleLi = function(num,id){
			var $id = $('#js_sum_'+id);
			if(num != 0){
				$id.find('span').text(num);
			}else{
				$id.hide();
			};
		};
		
		/**
		 * 获取 用户列表
 		 * @param {Object} user_arr
		 */
		var getUsers = function(user_arr){
			var length = user_arr.length,
				user_list = '';
			if(length){
				//去重复
				user_arr = Fun.clearSort(user_arr);
				user_list = user_arr.join(';');
			};
			return user_list;
		};
		
		var data = data.summary;
		toggleLi(data.pre_8,1);
		toggleLi(data.pre_3,2);
		toggleLi(data.pre_1,3);
		
		toggleLi(data.this_8,4);
		toggleLi(data.this_3,5);
		toggleLi(data.this_1,6);
		toggleLi(data.this_9,9);

		//toggleLi(data.next_8,12);
		//toggleLi(data.next_3,11);
		toggleLi(data.next_1,10);

		//PM视图
		if(power == 30 || power == 40){
			$('#js_sum_1 button').attr({
				'data-pdm':getUsers(data.user_create_pre),
				'data-desginer':getUsers(data.user_desgin_pre),
				'title':"产品：" + getUsers(data.user_create_pre) + "  设计：" + getUsers(data.user_desgin_pre)
				
			});
			$('#js_sum_4 button').attr({
				'data-pdm':getUsers(data.user_create_this),
				'data-desginer':getUsers(data.user_desgin_this),
				'title':"产品：" + getUsers(data.user_create_this) + "  设计：" + getUsers(data.user_desgin_this)
			});
			
			//toggleLi(data.user_create_pre.length + data.user_desgin_pre.length,1);
			//toggleLi(data.user_create_this.length + data.user_desgin_this.length,4);
		}else{
			toggleLi(data.pre_8,1);
			toggleLi(data.this_8,4);
		};

        /**
         * 获取一周时间
         */
        var getWeekRank = function(type){
            var dates;
            if(type === '本周'){
                dates = Fun.getWeeks(new Date(),0);
            }else if(type === '下周'){
                dates = Fun.getWeeks(new Date(),1);
            }else{
                dates = Fun.getWeeks(new Date(),-1);
            }
            return {
                start_date:dates.week_day[0],
                end_date:dates.week_day[6]
            }
        };
		
		//设置需求统计
		var setStatistics = function(data,lin_num,type){
			var str = '',all_str = '',count = 0, txt = '',
                dateRank = getWeekRank(type),
                //搜索页查询字符串
                query = {
                    is_modify_attr          :   '',
                    is_turn_require         :   '',
                    require_cp_id           :   '',
                    require_creator         :   '',
                    require_finish_date     :   dateRank.end_date,
                    require_id              :   '',
                    require_name            :   '',
                    require_pm_cost         :   '',
                    require_rank_cate_id    :   '',
                    require_rank_id         :   '',
                    require_rating          :   '',
                    require_start_date      :   dateRank.start_date,
                    require_state           :   '',
                    require_type            :   '',
                    require_type_id         :   '',
                    require_verify_user     :   '',
                    require_workload        :   ''
                };

			for(var i in data){
				var num = parseInt(data[i]['counts'],10); 
				count += num;
                query['require_type_id'] = data[i]['type_id'];
				str += '<p>' + data[i]['type_name'] + "<a target='_blank' href='view_search.html?q="+ JSON.stringify(query) +"'><span class='c_tx2'> " +  num + '</span></a>个；</p>';
			}
			if($.isNumeric(lin_num) && lin_num != 0){
                query['require_type'] = 0;
                query['require_type_id'] = 0;
				str += "<p class='js_temp_require'>临时需求<a target='_blank' href='view_search.html?q="+ JSON.stringify(query) +"'><span class='c_tx2'>"+ lin_num +"</span></a>个</p>";
			}
			if(count){
				all_str += '<p class="ui_total"> 您'+ type +'一共有<span class="c_tx2">'+ count +'</span>个需求</p>' + str;
			}
			
			if(all_str){
				txt = all_str;
			}else{
				txt = '您'+ type +'没有相关需求!'
			}
			return txt;
		};
		$('#js_pre_statistics').html(setStatistics(data.pre_s,data.pre_l,'上周'));
		$('#js_this_statistics').html(setStatistics(data.this_s,data.this_l,'本周'));
		$('#js_next_statistics').find('p').html(setStatistics(data.next_s,data.next_l,'下周'));
		
	};
	
	/**
	 * 插入 和 更新 需求属性 
	 */
	exports.insertUpdateAttr = function(require_id,$container){
		var att_data = exports.getRequireAttrInfo($container),
			u_length = att_data.update.length,
			i_length = att_data.insert.length;
		//存在插入数据的话	
		if(i_length){
			var obj_i = {
				attribute:att_data.insert
			};
			RestApi.addAttribute(require_id,obj_i).success(function(data){
				if(data.error){
					Fun.alert(0,'请输入数字!')
				}
			});
		};
		//存在更新数据的话
		if(u_length){
			var obj_u = {
				attribute:att_data.update
			};
			RestApi.putAttributes(obj_u);
		};
	};
	
	/**
	 * 插入 和 更新 需求属性 
	 */
	exports.insertUpdateAttrText = function(require_id,$container){
		var att_data = exports.getRequireAttrTextInfo($container),
			u_length = att_data.update.length,
			i_length = att_data.insert.length;
		//存在插入数据的话	
		if(i_length){
			var obj_i = {
				attribute:att_data.insert
			};
			RestApi.addAttribute(require_id,obj_i).success(function(data){
				if(data.error){
					Fun.alert(0,'请输入数字!')
				}
			});
		};
		//存在更新数据的话
		if(u_length){
			var obj_u = {
				attribute:att_data.update
			};
			RestApi.putAttributes(obj_u);
		};
	};
	
	/**
	 * 更新配套广告数 
	 */
	exports.updateAttrForAds = function(require_id,$input){
		var old_value = $input.attr('old-value'),
			new_value = $input.val();
		if(old_value != new_value){
			var obj_u = {
				attribute:{
					att_require_id:require_id,
					att_text:new_value
				}
			};
			RestApi.putAttributeByAds(obj_u);
		}	
	};
	
});

define(function(require, exports, module) {  
    
    var $ = require('jquery'),
		c = require('./ecp.config.user'),
    	localStore = require('./ecp.localstore');
    require('jquery.cookie')($);
    require('jquery.field')($);
   /**
	 * 获取用户名
	 */
	exports.getUserName  = function(){
		var user = exports.getUrlParam('uname') || $.cookie("login_user_ecp");
		return user;
		//$.cookie("login_user_ecp",'hugohua');
		//return 'hugohua';
		//return $.cookie("login_user_ecp");
	};

    /**
     * 获取当前用户的email
     */
    exports.getCurUserEmali = function(){
        var data = localStore.getSingleUserData();
//        return 'uedecp@tencent.com';
        return  data.users.user_email || 'uedecp@tencent.com';
    };


	/** 
	 * transform the Date to String according the format pattern
	 * eg: 
	 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	 * (new Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18 
	 */  
	exports.dateFormat = function(date,fmt) {
		var o = {
		"M+" : date.getMonth() + 1, 
		"d+" : date.getDate(), 
		"h+" : date.getHours() % 12 == 0 ? 12 : date.getHours()%12, 
		"H+" : date.getHours(), 
		"m+" : date.getMinutes(), 
		"s+" : date.getSeconds(), 
		"q+" : Math.floor((date.getMonth()+3)/3), 
		"S" : date.getMilliseconds() 
		};
		var week = {
		"0" : "\u65e5",
		"1" : "\u4e00",
		"2" : "\u4e8c",
		"3" : "\u4e09",
		"4" : "\u56db",
		"5" : "\u4e94",
		"6" : "\u516d"
		};
		if(/(y+)/.test(fmt)){
			fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
		}
		if(/(E+)/.test(fmt)){
			fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[date.getDay()+""]);
		}
		for(var k in o){
			if(new RegExp("("+ k +")").test(fmt)){
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
			}
		}
		return fmt;
	};
	
	//获得某月的天数      
	exports.getMonthDays = function(myMonth){
		var nowYear = new Date().getFullYear();
	    var monthStartDate = new Date(nowYear, myMonth, 1);       
	    var monthEndDate = new Date(nowYear, myMonth + 1, 1);       
	    var   days   =   (monthEndDate   -   monthStartDate)/(1000   *   60   *   60   *   24);       
	    return   days;       
	};
	
	/**
	 * 获得本月的开始日期 
	 */      
	exports.getMonthStartDate = function(){      
		var nowYear = new Date().getFullYear();
		var nowMonth = new Date().getMonth();
	    var monthStartDate = new Date(nowYear, nowMonth, 1);      
	    return exports.dateFormat(monthStartDate,'yyyy-MM-dd');
	}      
	     
	/**
	 * 获得本月的结束日期 
	 */      
	exports.getMonthEndDate = function(){      
		var nowYear = new Date().getFullYear();
		var nowMonth = new Date().getMonth();
	    var monthEndDate = new Date(nowYear, nowMonth, exports.getMonthDays(nowMonth));       
	    return exports.dateFormat(monthEndDate,'yyyy-MM-dd'); 
	};
	
	/**
	 * 获取当前时间
	 */
	exports.today = function(){
		 return exports.dateFormat(new Date(),"yyyy-MM-dd");
	};
	
	/**
	 * 根据日期  返回 星期几
	 */
	exports.getWeekName = function(day){
		var name;
		switch(day) 
		{ 
			case 0:name="周日";break; 
			case 1:name="周一";break; 
			case 2:name="周二";break; 
			case 3:name="周三";break; 
			case 4:name="周四";break; 
			case 5:name="周五";break; 
			case 6:name="周六";break; 
		};
		return name;
	};
	
	
	/**
	 * 获取一周的日期
	 * @param {date}: 表示指定的日期
	 * @param {offset}: 偏移量
	 */
	exports.getWeeks = function(date,offset,work) {
		var oneDayTime = 24 * 3600 * 1000;
		var today = !date ? new Date() : date;
		// console.info(today,'today')
		var d = today.getDay();
		if (d == 0) {
			// 如果是周日，往前推一天
			today = new Date(today.getTime() - oneDayTime);
			d = 6;
		}
		var todayTime = today.getTime();
		var obj, weeks = [], week_name = [];
		var week = 7;
		if(work) week = 5;
		for (var i = 1; i <= 7; i++) {
			var _date = new Date(todayTime + (i - d + offset * 7) * oneDayTime), //原始日期
				_d = exports.dateFormat(_date, "yyyy-MM-dd"), //日期
				_wn = exports.getWeekName(_date.getDay());
			//星期几
			weeks.push(_d);
			week_name.push(_wn);
		};
		obj = {
			week_day : weeks,
			week_name : week_name
		};
		return obj;
	};
	
	// exports.getWordWeek = function()
	
	exports.getWeekRange = function(date,num){
		var oneDayTime = 24 * 3600 * 1000;
		// var	d = date.getDay();
		var todayTime = date.getTime();	
		var obj, weeks = [], week_name = [];
		for (var i = 0; i < num; i++) {
			var _date = new Date(todayTime + i * oneDayTime), //原始日期
				_d = exports.dateFormat(_date, "yyyy-MM-dd"), //日期
				_wn = exports.getWeekName(_date.getDay());
			//星期几
			weeks.push(_d);
			week_name.push(_wn)
		};
		obj = {
			week_day : weeks,
			week_name : week_name
		};
		return obj;
	}
	
	/**
	 * 根据日期 获取本周 上周 下周 的 周一 日期 
	 * offset 表示偏移量
	 */
	exports.getWeekDayByType = function(date,offset){
		var obj = exports.getWeeks(date,offset);
		return obj.week_day[0];
	};
	
	/**
	 * 计算差值 
	 * start_date 开始时间 一般是当天
	 * end_date 结束时间 一般是需求时间
	 */
	exports.diffDate = function(start_date,end_date){
		var dft = start_date.getTime()  - end_date.getTime();
		return dft/1000/3600/24;
	};
	
	/**
	 * 获取URL参数
	 * //example getUrlParam('id') or getUrlParam('id','#')
	 */
	exports.getUrlParam = function(){
		var url = top.window.location.href;
		var u, params, StrBack = '';
		if (arguments[arguments.length - 1] == "#") 
			u = url.split("#");
		else 
			u = url.split("?");
		if (u.length == 1) 
			params = '';
		else 
			params = u[1];
		
		if (params != '') {
			gg = params.split("&");
			var MaxI = gg.length;
			str = arguments[0] + "=";
			for (i = 0; i < MaxI; i++) {
				if (gg[i].indexOf(str) == 0) {
					StrBack = gg[i].replace(str, "");
					break;
				}
			}
		}
		return StrBack;
	};
	
	
	/**
	 * 设置URL参数 
	 * html5 history.pushState
	 */
	exports.setUrlParam = function(param,value,title){
		var search = location.search,
			pathname = location.pathname || '',
			title = title || '';
		if(search && search!="?" ){
			var p_val = exports.getUrlParam(param);
			//存在值
			if(p_val){
				search = search.replace( param+"="+p_val, param+"="+value );
				history.pushState('', '', pathname + search);
			}else{
				search = search + "&" + param+"="+value;
				history.pushState('', '', pathname + search);
			}
		}else{
			history.pushState(title, '', pathname + "?" +param+"="+value);
		}
	};
	
	/***
	 * 设置radio checkbox 的选中状态
	 * @param {Object} $input
	 */
	exports.setInputClass = function($input){
		var $tgt = $input;
			if ($tgt.attr("type") == "radio") {
				var name = $tgt.attr("name");
				$('input[type="radio"][name="' + name + '"]').closest("label").removeClass("btn-success");
				$tgt.closest("label").addClass("btn-success");
			}
			else 
				if ($tgt.attr("type") == "checkbox") {
//					ulog.info("$tgt",$tgt,$tgt.attr('checked'))
					if ($tgt.attr('checked')) {
						$tgt.closest("label").addClass("btn-success");
					}
					else {
						$tgt.closest("label").removeClass("btn-success");
					}
				}
	};
	
	/**
	 * 全部查找替换
	 * @param {Object} reallyDo
	 * @param {Object} replaceWith
	 * @param {Object} ignoreCase
	 */
	exports.replaceAll = function(str ,reallyDo, replaceWith, ignoreCase) {
        if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
	        return str.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);   
	    } else {   
	        return str.replace(reallyDo, replaceWith);   
	    }   
	};
	
	/**
	 * 数组去重
	 */
	exports.clearSort = function(arr){  
	    var temp={},result=[];  
	    for(var i=0;i<arr.length;i++){  
	        if(!temp[arr[i]]){  
	            result.push(arr[i]);  
	            temp[arr[i]]=true;  
	        }  
	    }  
	    return result;  
	};
	
	
	/**
	 * 表单验证
	 */
	exports.validate = function(container){
		var _validate = true,
				error = 0;
		$(":input[data-validate]",container).each(function(){
			var val = $(this).val();
			//不为空
			if(!val || val ==0){
				error++;
			}
		});
		
		error && (_validate = false);
		console.info(_validate,'_validate')
		return _validate;
	};
   
    /**
     * 获取状态名称 
 * @param {Object} state_id
     */
	exports.getStateName = function(state_id) {
		var state_id = parseInt(state_id, 10), text = '';
		switch(state_id) {
			case 1:
			text = '待排期';
			break;
			case 2:
			text = '进行中';
			break;
			case 3:
			text = '已完成';
			break;
			case 4:
			text = '待评分';
			break;
			case 5:
			text = '待邮件';
			break;
		}
		return text;
	};
	
	/**
	 * 获取评级 
	 */
	exports.getRating = function(mark){
		var rating;
		if(mark >= 85){
			rating = 'A';
		}else if( mark >= 60 && mark < 85 ){
			rating = 'B';
		}else{
			rating = 'C';
		};
		return rating;
	};
	
	/**
	 * 根据全名 获取english 
 	* @param {Object} full_name
	 */
	exports.getEnglishName = function(full_name){
		var name = full_name.replace(/\(.+?\)/g,"");
		return name;
	};
	
	/**
	 * 根据名字+说明 获取名字
 	* @param {Object} full_name
	 */
	exports.getEnglishNameForRank = function(full_name){
		var end = full_name.indexOf('('),
			name = full_name;
		//存在（
		if(end !== -1){
			name = full_name.substring(0,end);
		};
		return name;
	};
	
	/**
	 * 根据名字+说明 获取名字
 	* @param {Object} full_name
	 */
	exports.getPureName = function(full_name){
		var end = full_name.indexOf('['),
			name = full_name;
		//存在（
		if(end !== -1){
			name = full_name.substring(0,end);
		};
		return name;
	};
	
	/**
	 * 根据全名 获取english 
 	* @param {Object} full_name
	 */
	exports.getUserEmail = function(full_name){
		var end = full_name.indexOf('('),
			name = full_name;
		var arr = full_name.split('('),
			icson = arr[1].indexOf('ICSON'),
			email = arr[0];
		//存在（
		if(icson !== -1){
			email += '@51buy.com'
		};
		return email;
	};
	
	/**
	 * 给相应的分数或评级颜色 
	 */
	exports.getRatingColor = function(num){
		var mark = parseInt(num,10),
			color = '';
		//如果是数字
		if(mark){
			if(mark >= 85){
				color = 'tag_1';
			}else if( mark >= 60 && mark < 85 ){
				color = 'tag_2';
			}else if( mark < 60 ){
				color = 'tag_3';
			};
		}else{
			if(num === "A"){
				color = 'tag_1';
			}else if( num === "B" ){
				color = 'tag_2';
			}else if( num === "C" ){
				color = 'tag_3';
			};
		};
		return color;
	};
	
	/**
	 * 弹窗提示状态 
 * @param {Object} state
 * @param {Object} msg
	 */
	exports.alert = function(state,msg){
		var cname = '',time = 2000;
		if(state == 1){
			cname = 'ui_tips_success';
			time = 1000;
		}else if(state == 0){
			cname = 'ui_tips_faild';
			time = 3000;
		}
		var $tips = $('<div class="ui_tips '+ cname +'"><div class="ui_tips_con"><p>'+ msg +'</p></div></div>');
		$('body').append($tips);
		setTimeout(function(){
			$tips.fadeOut(function(){
				$(this).remove();
			})
		},time)
	};
	
	/**
	 * 检测是否是第一次登录 
	 */
	exports.checkFirstLogin = function(){
		var fcheck = localStore.getFirstLogin();
		console.info(fcheck,'fcheck')
		if(!fcheck){
			$('.js_help').show();
		};
	};
	
	/**
	 * 判断是否是图片 
	 */
	exports.getFileType = function(filename){
		var arr = filename.split('.'),
			type = arr[1],
			images = ['jpg', 'jpeg', 'png', 'gif','JPG', 'JPEG', 'PNG', 'GIF'];
		//文件
		if($.inArray(type,images) !== -1){
			type = 'image';
		};
		return type;
	};
	
	/**
	 * 导航链接 
	 */
	exports.navLink = function(power){
		console.info(power,'navLink')
		$('[data-power*="'+ power +'"]').show();
	};
	
	/**
	 * 显示弹窗 
 * @param {Object} body
 * @param {Object} state
	 */
	exports.showWindow = function(title,body,id){
		var $container = $('#js_ui_window'),
			$close = $container.find('.js_close');
		$container.find('.js_ui_window_con').html(body);
		$container.find('.js_ui_window_tit').text(title)
		$(id).show().siblings('.js_action').hide();
		$('#js_ui_window,#js_ui_mask').show();
		if(!$close.data('data-event')){
			$close.on('click',function(){
				exports.closeWindow();
				$(this).data('data-event',true)
			});
		};
		
	};
	
	exports.closeWindow = function(){
		$('#js_ui_window,#js_ui_mask').hide();
	};
	
	exports.getWindowBody = function(){
		return $('#js_ui_window').find('.js_ui_window_con').html();
	};
	
	/**
	 * 初始化rank 审核设计师 
	 */
	exports.initCheckUserPop = function(){
		var data = localStore.getRankData(),
			rank = data.rank,
			$container = $('#js_rank_check'),
			str_desgin = '',
			str_wb = '';
		for(var i in rank){
			var arr,
				arr_wb,
				list = rank[i]['rank_designer'],
				list_wb = rank[i]['rank_wb'],
				rank_id = rank[i]['rank_id'];
			//存在数据	
			if(list){
				arr = list.split(';');
				for(var j in arr){
					var user_arr = arr[j].split('|');
					str_desgin += '<li data-rank-id="'+ rank_id +'"><p><img src="http://dayu.oa.com/avatars/'+ exports.getEnglishNameForRank(arr[j]) +'/avatar.jpg"  /></p><p><span class="js_p_name">'+ user_arr[0] +'</span><span class="c_tx1">'+ (user_arr[1] || "全部") +'</span></p></li>';
				};
			};
			
			if(list_wb){
				arr_wb = list_wb.split(';');
				for(var j in arr_wb){
					var user_wb = arr_wb[j].split('|');
					str_wb += '<li data-rank-id="'+ rank_id +'"><p><img src="http://dayu.oa.com/avatars/'+ exports.getEnglishNameForRank(arr_wb[j]) +'/avatar.jpg"  /></p><p><span class="js_p_name">'+ user_wb[0] +'</span><span class="c_tx1">'+ (user_wb[1] || "全部") +'</span></p></li>';
				}
			}
		}
		$container.find('.js_desgin').html(str_desgin).end().find('.js_wb').html(str_wb);
		//添加事件
		$container.on('click','li',function(){
			var $this = $(this);
			if($this.hasClass('selected')){
				$this.removeClass('selected')
			}else{
				$this.addClass('selected').siblings().removeClass('selected');
			};
			
			//如果只是一个 判断确认按钮是否显示
			if( !$('#js_rank_btn:visible').length ){
				var $input = $( $container.attr('data-input') ),
					name = $this.find('.js_p_name').text();
				$input.val(name);
				exports.hideCheckUserPop();
			}
			
			return false;
		});
		
		//确认事件
		$('#js_rank_btn button').on('click',function(){
			var $li = $container.find('li.selected'),
				$input = $($container.attr('data-input')),
				length = $li.length,
				name = '';
			//只选了一个人	
			if(length == 1){
				name = $li.find('.js_p_name').text();
			}else if(length == 2){
				name = $li.eq(0).find('.js_p_name').text() + ';' + $li.eq(1).find('.js_p_name').text();
			};
			$input.val(name);
			exports.hideCheckUserPop();
		});
	};
	
	
	/**
	 * 显示弹窗 
	 * @param {Object} rank_id
	 * @param {Object} pos
	 */
	exports.showCheckUserPop = function(rank_id,input_id){
		var $container = $('#js_rank_check'),
			$btn = $('#js_rank_btn'),
			pos = $(input_id).offset(),
			val = $(input_id).val(),
			offset = 29,
			offset_w = 0;
		console.info(rank_id,pos,$container.find('li[data-rank-id="'+ rank_id +'"]'),'rank_id')	
		$container.find('li').removeClass('selected').hide();
		//判断输入框是否有值 并且是两个
		if(val){
			var arr = val.split(';');
			for(var i in arr){
				$container.find('li:contains("'+ arr[i] +'")').addClass('selected');
			}
		};
		
		
		$container.css({
			left:pos.left,
			top:pos.top + offset,
			display:'block'
		}).attr('data-input',input_id).find('li[data-rank-id="'+ rank_id +'"]').slideDown(100);
		//全部显示
		$container.find('.autofinish_item').show();
		$btn.show();
		//只显示其中一个
		$container.find('ul').each(function(index) {
		var $ul = $(this),
			length = $ul.find('li:visible').length;
			//如果没有审核前端
			if(!length){
			  	$ul.closest('div').hide();
			  	$btn.hide();
			};
		});
		
		//如果是右侧弹出层
		if(input_id == '#js_require_verify_user2' && $container.width() > 230 ){
			$container.css('left',pos.left - 217);
		};
	};
	
	exports.hideCheckUserPop = function(){
		var $container = $('#js_rank_check');
		$container.slideUp(100);
	};
	
	/***
	 * 根据type id  设置显示附属的需求类型 
 	 * @param {Object} type_id 需求类型ID
	 */
	exports.getAttrType = function(type_id){
		var arr = [1,2,10,3,4,5,6,8,23,7,24],
			type_id = parseInt(type_id);
		switch(type_id) 
		{ 
			case 1:	//页面首页
				arr = [2,10,3,4,5,6,8,23,7,24];
			break; 
			
			case 2:	//页面内页
				arr = [10,3,4,5,6,8,23,7,24];
			break; 
			
			case 10:	//巨无霸
				arr = [3,4,5,6,8,23,7,24];
			break; 	
			
			case 3:	//创意广告
				arr = [4,5,6,8,23,7,24];
			break; 
			
			case 4:	//静态修改尺寸
				arr = [3,5,6,8,23,7,24];
			break;
			
			case 5:	//flash广告
				arr = [3,4,6,8,23,7,24];
			break; 
			
			case 6:	//flash广告-修改尺寸
				arr = [3,4,5,8,23,7,24];
			break;
			
			case 8:	//海报设计
				arr = [3,4,5,6,23,7,24];
			break; 
			
			case 23:	//海报改尺寸
				arr = [3,4,5,6,8,7,24];
			break;
			
			case 7:	//模板页面
				arr = [3,4,5,6,8,23,24];
			break; 
			
			case 24:	//模板页面
				arr = [1,2,10,3,4,5,6,8,23,7];
			break; 
			
		};
		
		return arr;
	};
	
	exports.showPopAtt = function(type_id){
		var arr = exports.getAttrType(type_id);
		$('#js_pop_tapd label').hide();	
		for(var i in arr){
			$('#js_pop_tapd label[data-type-id="'+ arr[i] +'"]').show();
		}
	};
	
	/**
	 * 清除添加 修改弹窗需求时的 需求类型数据 
	 */
	exports.clearAttrPop = function(){
		$('#js_pop_tapd label input').val('');
	};
	
	/**
	 * 根据表单对象 遍历获取数据 
	 */
	exports.getDbData = function(form_id){
		var obj = {};
		$(':input[data-db-name]',form_id).each(function(){
			var $this = $(this),
				key = $this.attr('data-db-name'),
				val = $this.getValue();
			obj[key] = val;	
			
		});
		return obj;
	};
	
	exports.setDbData = function(data,form_id){
		for(var i in data){
			$(':input[data-db-name="'+ i +'"]',form_id).setValue(data[i]);
		}
	};
	
	/**
	 * 根据数据库数据 更新页面片段 
 	 * @param {Object} data
	 */
	exports.updateView = function(data,container){
		for(var i in data){
			$('[data-db-name="'+ i +'"]',container).html(data[i]);
		}
	};
	
	/**
	 * 显示 我的工作台页面 
	 */
	exports.showPageWork = function(){
		$('#js_page_1').addClass('ui_left').removeClass('none');		//个人工作台
		$('#js_page_2').addClass('none').removeClass('ui_right');		//列表页面
		$('#js_show_p1').hide();
		$('#js_show_p2').show();
		exports.setUrlParam("page",1);//显示页面1
	};
	
	/**
	 * 显示 需求列表 新增需求页面 
	 */
	exports.showPageList = function(){
		$('#js_page_1').addClass('none').removeClass('ui_left');				//个人工作台
		$('#js_page_2').removeClass('none').addClass('ui_right');				//列表页面
		$('#js_show_p1').show();
		$('#js_show_p2').hide();
		exports.setUrlParam("page",2);//显示页面2
	};
	
	/**
	 * 判断是否是易讯域名 
	 */
	exports.checkYiXun = function(){
		var check = false;
		if(location.hostname.indexOf(c.yixun) !== -1){
			check = true;
		};
		return check;
	};
	
	/**
	 * 易讯用户发邮件 则自动补全邮箱地址 
	 */
	exports.filledEmail = function(emails){
		var yx = exports.checkYiXun();
		if(!yx){
			return emails;
		};
		var e_arr = emails.split(';'),
			n_emails = '';
		for(var i in e_arr){
			if(e_arr[i].length < 3) break;
			//不存在@的情况，只是英文名 并且有3个英文
			if(e_arr[i].indexOf('@') === -1){
				n_emails += e_arr[i] + '@tencent.com;';
			}else{
				n_emails += e_arr[i] + ';';
			};
		};
		return n_emails;
	};
	
	/**
	 * 数字转价格 
	 */
	Number.prototype.formatMoney = function(c, d, t){
var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 	};

 	/**
 	 * 颜色数组 copy 自flex 28个
 	 */
 	exports.getColor = function(index){
 		var color = [
			'#e48701', '#a5bc4e', '#1b95d9', '#caca9e',
	         '#6693b0', '#f05e27', '#86d1e4', '#e4f9a0',
	         '#ffd512', '#75b000', '#0662b0', '#ede8c6'
//	        '#cc3300', '#d1dfe7', '#52d4ca', '#c5e05d',
//	        '#e7c174', '#fff797', '#c5f68f', '#bdf1e6',
//	        '#9e987d', '#eb988d', '#91c9e5', '#93dc4a',
//	        '#ffb900', '#9ebbcd', '#009797', '#0db2c2'
	    ],
	    length = color.length;
	    if(index>length){
	    	index = index%length;//求余
	    };
	    return color[index];
 	};

})
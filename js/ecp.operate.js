define(function(require, exports, module) {  
    
    var $ = require('jquery'),
    	Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
    	ReqFun = require('./ecp.require.func'),
    	ReqAdd = require('./ecp.require.add'),
    	ReqEdit = require('./ecp.require.edit'),
    	ShortCuts = require('./ecp.shortcuts'),
    	Mustache = require('mustache'),
    	ReqGetSet = require('./ecp.require.getset'),
    	List = require('./ecp.require.list'),
    	UserInfo = require('./ecp.user.info'),
    	localStore = require('./ecp.localstore'),
    	PdmFun = require('./ecp.pdm.func'),
    	task = require('./ecp.task');
    
	require('jquery.ui')($);
	// require('jquery.transit')($);
	
	var model = {
		id_tapd_tab : '#js_tapd_tab', //表头id
		id_req_list : '#js_req_list', //表内容id 用于放置需求列表
		id_list_table:'#js_list_table',
		id_req_list_tmpl : '#js_req_list_tmpl', //表内容 模板
		id_pop_task:'#js_pop_task'			//右侧弹窗容器
	};
	
	var time =  parseInt(Fun.getUrlParam('time')) || new Date().getTime();
	$('#js_ui_view').data('date',new Date(time));
	//初始化
	// var week_obj = Fun.getWeeks(new Date(time),0,true);
	
	/***
	 * 初始化创建表格  头部表格
	 */
	var drawTable = function(week_obj) {
		var head = '<tr>', body = '<tr>', view = '<tr>';
		var j = 0;
		for (var i in week_obj.week_day) {
			j++;
			var fmt_date = Fun.dateFormat(new Date(week_obj.week_day[i]),'dd/MM')
			head += '<th data-num="'+ j +'" data-week-name="'+ week_obj.week_name[i] +'" data-day="' + week_obj.week_day[i] + '" class="js_item_add"><span>' + week_obj.week_name[i] + '</span><span>' + fmt_date + '</span></th>';
			//body += '<td data-week-name="'+ week_obj.week_name[i] +'" data-day="' + week_obj.week_day[i] + '"><a class="js_item_add tapd_item_add" href="javascript:;">添加需求</a></td>';
			view += '<td data-num="'+ j +'" data-week-name="'+ week_obj.week_name[i] +'" data-day="' + week_obj.week_day[i] + '"></td>';//<a href="javascript:;" class="tapd_item_add js_item_add" data-week-name="'+ week_obj.week_name[i] +'" data-day="' + week_obj.week_day[i] + '">添加需求</a>
		};
		head += '</tr>';
		body += '</tr>';
		view += '</tr>';
		$(model.id_tapd_tab).html(head);
		$('#js_table_view').html(view);
		// $(model.id_req_list).html(body);
		// var length = week_obj.week_day.length;
		//先创建5行
		ReqFun.createTable(5, week_obj);
		dropEvent();
	}; 

   
	/***
	 * 循环添加 
	 */
	var listRequire = function(data){
		var week_obj = Fun.getWeeks($('#js_ui_view').data('date'),0,true);
		//数据存在 则绘制表格
		if(data.length){
			checkReqHasWeekend(week_obj,data);
			for(var i in data){
				ReqFun.appendRequire(data[i],week_obj,true);
			};
		}
		//设置新增需求时 是临时需求还是正常需求
//		ReqFun.setRequireType(week_obj.week_day[0],week_obj.week_day[week_obj.week_day.length-1 ]);
		
		var $t1 = $('#js_table_view'),		//
			$t2 = $('#js_req_list');
			
		if( $t1.height() < $t2.height() ){
			$t1.height( $t2.height() );
		};
			
		// console.info($('#js_table_view').height(),$('#js_req_list').height())
	};
	
	/***
	 * 显示或隐藏添加按钮 
	 */
	var toggleThClass = function($td,display){
		var toggle = function($td,display){
			var index = $td.index(),
			$th = $('#js_tapd_tab th').eq(index);
			if(display === 'show'){
				$th.addClass('current');
			}else{
				$th.removeClass('current');
			}
		};
        
        $(document).on({
		    mouseenter: function() {
		       toggle($(this),'show');
		    },
		    mouseleave: function() {
		       toggle($(this),'hide')
		    }
		}, '#js_table_view td,#js_req_list td');
	};
	
	/**
	 * 显示或隐藏周末 
	 */
	var toggleWeekendDay = function(){
		$('#js_toggle_week').on('click',function(){
			$('#js_tapd_tab,#js_table_view,#js_req_list').toggleClass('weekend');
		});
	};
	
	
	var dropEvent = function(){
		$("#js_table_view td").droppable({
            accept: ".js_tapd_item",
            //hoverClass: "week_hover",
            drop: function (event, ui) {
            	changeRequireDate($(this),ui.draggable);
            	$('#js_table_view tr td').removeClass('week_hover');
            },
            over: function(event, ui) {
            	var $td = $(this);
            	//从右往前移动时 先执行over 再执行out 故 需要设置setTimeout
            	setTimeout(function(){
            		var wday = ui.draggable.attr('data-workload');
					selectRows($td,wday).addClass('week_hover');
					console.info('over');
	            	},1)
			},
			out: function(event, ui) {
				var wday = ui.draggable.attr('data-workload');
				selectRows($(this),wday).removeClass('week_hover');
				console.info('out');
			}
       });
	};
	
	/***
	 * 目标td
	 * 工作天数 
	 */
	var selectRows = function($td,wday){
		var wday = Math.ceil(parseFloat(wday)), //天数 列数
			week_days = $('#js_table_view tr:first td:visible').index() + 1;		//获取总数
			num = $td.index() + 1;		//获取当前位置
		//如果单元格不够	
		if(week_days - num < wday){
			wday = week_days - num + 1;
		};
		console.info(week_days,num,wday)
		var $tds = $td.nextAll().andSelf().slice(0, wday);
		// console.info($tds)
		return $tds;
	}
	
	
	/**
	 * 改变需求 的 开始时间
	 * $td:目标单元格 一列
	 * $div:需求
	 */
	var changeRequireDate = function($td,$div){
		var $oldTd = $div.parent(),			//原有单元格
			day = $td.attr('data-day'),
			index = $td.index(),			//view table 的index
			$ttd = $('#js_req_list').find('td[data-day="'+ day +'"]:empty').eq(0),		//找到对应的单元格
			week_days = $('#js_table_view tr:first td').index(),		//7
			wday = parseFloat($div.attr('data-workload')),											//需求天数
			colspan = Math.ceil(wday),									//向上取整
			week_obj = Fun.getWeeks($('#js_ui_view').data('date'),0,true),
			$ntd;
		
		//不存在 则新增一行
		if(!$ttd.length){
			//不存在 则创建一行
			ReqFun.createTable(1, week_obj);
			$ntd = $('#js_req_list tr:last td').eq(index);
		}else{
			if(colspan > 1){
				$ntd = ReqFun.getDropTd($ttd,colspan,week_obj,day);
			}else{
				$ntd = $ttd;
			}
		};
		console.info($ttd,$ntd);
		ReqFun.splitCell($oldTd);
		//确认目标单元格后
		ReqFun.mergeCell($ntd,colspan);
		$ntd.append($div);
		//有小数
		if(colspan > wday && (parseFloat($ntd.attr('colspan')) == colspan)){
			$div.css('width',wday/colspan*100 + '%');
		}else{
			$div.removeAttr('style');
		};
		//更新数据
		updateRequireDate($ntd,$div);
		// ReqFun.mergeCell($oldTd,wday);
		// console.info($ntd,$div,'good',$oldTd)
	};
	
	
	/**
	 * 更新需求时间 
	 */
	var updateRequireDate = function($td,$div){
		var obj = ReqGetSet.getRequireDate($td,$div);
		//提交数据	
		RestApi.putRequire(obj).success(function(data){
			localStore.setRequireDataById(data.require.require_id,data.require);
		});
	};
	
	
	/**
	 * 删除空行 
	 */
	var removeEmptyTr = function(){
		$('#js_req_list tr').each(function(index) {
		  var $tr = $(this);
		  console.info($tr.find('td').has('div'),$tr.find('td').has('div').html(),'tttttttt')
		  if($tr.find('td div.ui-draggable-dragging').length){
		  	$tr.remove();
		  }
		});
	}

	/**
	 * 获取数据 并填充表格
	 * @param {Object} start
	 * @param {Object} end
	 */
	var getRequireByDate = function(start, end) {
		var user_info = localStore.getSingleUserData(),
			user = user_info.users.english_name,
			power = user_info.users.user_power,
			power_rank = user_info.users.user_power_rank;
			
		RestApi.getRequireByDate(user,power,power_rank,'all',start, end).success(function(data) {
			if(data && data.require){
				listRequire(data.require);
			};
		})
	};
	
	/**
	 * 创建和需求 
	 */
	var drawPage = function(week_obj){
		$('#js_req_list').empty();
		//创建表格
    	drawTable(week_obj);
    	//获取数据
    	var start = week_obj.week_day[0],
    		end = week_obj.week_day[week_obj.week_day.length-1 ];
    	// console.info(start,end)
    	//显示需求表格排期
    	getRequireByDate(start,end);
    	
    	ReqFun.showStartEndDate(start,end);
	};
	
	/**
	 * 添加需求代码 
	 */
	var addBtnStr = function(){
		var str = '<a href="javascript:;" class="js_item_add tapd_item_add">添加需求</a>';
		//第一行 新增 添加需求按钮
		$('tr:first td',model.id_req_list).each(function(){
			$(this).prepend(str);
		});
	}
	
    /**
	 * 初始化日期插件 
	 */
	var datePicker = function(){
		var date = $('#js_ui_view').data('date'),
			week_obj = Fun.getWeeks(date,0,true);
		//初始化日期插件	
		var $datepicker = $('#js_datepicker').datepicker({
			beforeShowDay: function(date) {
				if ($.inArray(Fun.dateFormat(date,"yyyy-MM-dd"), week_obj.week_day) >= 0){
					return [true, "hightlight_date", "查看本周需求"];
				};
				return [true, "", ""];
            },
            onSelect: function(_selectedDate) {
            	var date = new Date(_selectedDate);
            	week_obj = Fun.getWeeks(date,0,true);
            	Fun.setUrlParam('time',date.getTime());
            	$datepicker.hide();
            	drawPage(week_obj);
            }
		});
		//设置日期插件的当前时间
		$datepicker.datepicker('setDate', new Date(time));
		
		//本周 上周 下周
		$('#js_getweek_type').on('click','button[data-type]',function(){
			var $this = $(this),
				type = parseInt($this.attr('data-type'),10),
				date = $('#js_ui_view').data('date'),		//获取当前日期
				week_first_day = type ? Fun.getWeekDayByType(date,type) : new Date().getTime(),
				date_first_day = new Date(week_first_day),
				week_obj = Fun.getWeeks(date_first_day,0,true);		
			//缓存日期
			$('#js_ui_view').data('date',new Date(week_first_day));
			//同步日期控件
			$datepicker.datepicker('setDate', new Date(week_first_day));
			
			Fun.setUrlParam('time',date_first_day.getTime());		
            drawPage(week_obj);
		});
		
		//点击探出日期控件
		$('#js_calendar_btn').on('click',function(){
			var offset = $(this).offset();
			$datepicker.css({
				top: offset.top + 30,
				left:offset.left,
				display:'block'
			});
			return false;
		});
		//隐藏日历
		$('#js_filter_state a,#js_getweek_type button[data-type],#js_show_p1').on('click.hidepop',function(){
			// console.info('hide')
			$datepicker.hide();
		})
		
	};
	
	
	/**
	 * 页面初始化时加载数据 
	 * 加载申请排期表格数据
	 */
	var initPageDragTableData = function(){
		var week_obj = Fun.getWeeks(new Date(time),0,true);
        drawPage(week_obj);
	};
	
	/**
	 * 页面切换 
	 */
	var initPageShow = function(){
		//切换到个人工作台页面
		$('#js_show_p1').on('click',function(){
			Fun.showPageWork();
			//隐藏弹窗
			ReqFun.hideRequirePop();
			//加载个人工作台数据
			List.initSumary();
			//List.initData();
		});
		
		//切换到申请外包需求页面
		$('#js_add_reqbtn,#js_show_p2').on('click',function(){
			initPageDragTableData();
			Fun.showPageList();
			//显示排期表格
			PdmFun.showTableByState(99);
			//$('#js_filter_state li[data-state="99"]').trigger('click');			//触发一下申请排期按钮
		});


		//申请排期按钮事件
		$('#js_filter_state li[data-state="99"]').on('click.show',function(){
			initPageDragTableData();
			PdmFun.showTableByState(99);
			console.info('99999999')
		});
		
		
		//页面加载时初始化
		var page = Fun.getUrlParam("page") || 1;
		if(page == 1){
			$('#js_page_1').removeClass('none').addClass('shwo_first');		//个人工作台
			//加载个人工作台数据
			List.initSumary();
			console.info('initSumary');
			$('#js_show_p2').show();
		}else{
			$('#js_page_2').removeClass('none').addClass('shwo_first');
			$('#js_show_p1').show();
			$('#js_show_p2').hide();
			//加载申请排期表格数据
			//initPageDragTableData();
			//显示排期表格
			//PdmFun.showTableByState(99);
			var state = Fun.getUrlParam('state') || 99 ;
			$('#js_filter_state li[data-state="'+ state +'"]').trigger('click');
		}
	};
	
	/**
     * 缓存价格信息 
     */
    var setPriceData = function(){
		RestApi.getOnlyPrice().success(function(data){
			//缓存价格信息
			localStore.setPriceData(data);
			console.info(data,'getOnlyPrice')
		})
	};
	
	/**
	 * 检测 
	 */
	var checkReqHasWeekend = function(week_obj,data){
		//最后两天是周六日
		var weekend = [week_obj.week_day[week_obj.week_day.length-1 ],week_obj.week_day[week_obj.week_day.length-2 ]],
			last_day = data[data.length-1]['require_start_date'];
		//存在 说明 都是包含周六日的需求	
		if($.inArray(last_day, weekend) !== -1){
			$('#js_tapd_tab,#js_table_view,#js_req_list').removeClass('weekend');
		}			
	};
	
	/**
     * 初始化用户权限 
     */
    var initPowerAction = function(power,power_rank){
    	if(power === 10 && power_rank === 1){
    		$('#js_admin_btn').show();
    	}else{
    		$('#js_admin_btn').hide();
    	}
    };
	
	/**
	 * 检测用户权限 
	 */
	var checkPower = function(){
		var user = Fun.getUserName();
		if(!user){
			var url = 'index.php';
			window.location = url;
			return;
		}
		
		RestApi.getUserApp(user).success(function(data){
			console.info(data,user,'data')
			if(data && data.app && data.app.user){
				var power = parseInt(data.app.user.user_power,10),
					power_rank = parseInt(data.app.user.user_power_rank,10);
				//产品经理视图  或 项目经理  或者管理员
				if(power === 10 || power ===30 || power ===40){
					//缓存app 信息
					localStore.setAppData(data);
					List.init();
					initPageShow();
					datePicker();
					ReqAdd.init();
					ReqEdit.init();
					ShortCuts.init();
					//events
					// toggleThClass();
					toggleWeekendDay();
					//设置登录信息 和 退出事件
					UserInfo.init();
					//检测用户联系方式是否录入
					ReqFun.checkUserContact(data.app.user);
					//缓存价格信息
					setPriceData();
					//导航链接
					Fun.navLink(power);
					//审核设计师列表
					Fun.initCheckUserPop();
					//管理员删除功能
					initPowerAction(power,power_rank);
					
				}else{
					window.location = 'error.html';
				}
			}else{
				// window.location = 'error.html'
			}
		})
	};
	
	exports.init = function(){
		console.info('init op add');
		checkPower();
		// dropEvent();
		// Datepicker.init();
	};
    
})  
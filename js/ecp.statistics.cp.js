/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
    	Mustache = require('mustache'),
		UserInfo = require('./ecp.user.info');
	require('jquery.tablesorter')($);
	require('jquery.fileDownload')($);
	
	var getData = function(start,end){
		//需求类型占比
		RestApi.statisticsCpByDate(start,end).success(function(data){
			console.info(data)
			drawTable(data);
			//计算价格和数量
			countPrice(data);
			//设置URL
			setUrlParam(start,end);
		});
	};
	
	/**
	 * 绘制table 
	 */
	var drawTable = function(data){
		var tpl = $('#js_stat_tpl').html(),
			statistics = data.data.statistics,
			listHtml = Mustache.to_html(tpl, data);
		$('#js_stat_cont').html(listHtml);
		// console.info(statistics)
		for(var i in statistics){
			var d = statistics[i];
			$('#d_' + d.cp_id + '_' + d.type_id + '_' + d.rank_id).text(d.count).attr('data-price',d.price);
		}		
	};
	
	var countPrice = function(data){
		var length = data.data.type.length + 2;
		$('#js_stat_cont .js_tablesorter').each(function(){
			var $table = $(this);
			//计算价格
			$table.find('tbody tr').each(function(){
				var $tr = $(this),
					sum_price = 0;
				$tr.find('td[data-price]').each(function(){
					var $td = $(this),
						price = parseInt($td.attr('data-price'));
					sum_price += price;	

				});
				$tr.find('.js_tolprice').text(sum_price);
			});
			//循环表格列
			for (var i = 2; i <= length; i++) {
				var sum_num = 0;
				$table.find('tbody tr td:nth-child('+ i +')').each(function(){
					var $td = $(this),
						num = parseInt($td.text());
					sum_num += num;	
				});

				$table.find('tfoot tr td:nth-child('+ i +')').text(sum_num);
			};
		});
	};

	/**
	 * 设置URL参数  和下载链接参数
	 */
	var setUrlParam = function(start,end){
		Fun.setUrlParam('start',start);
		Fun.setUrlParam('end',end);
	};
	
	var getTableData = function(){
		var data = [];
		$('#js_stat_cont table:visible').each(function(index) {
		    var $table = $(this),
		    	cp_name = $table.attr('data-name'),
		  		arr = [];
		  	$table.find('tr').each(function(){
		  		var $tr = $(this),
		  			result = [];
		  		$tr.find('td,th').each(function(){
		  			var val = $(this).text();
		  			result.push(val);
		  		});
		  		arr.push(result);	
		  	});
		  	data.push({
		  		name:cp_name,
		  		data:arr
		  	});
		});
		return data;
	};
	
	
	var Event = {
		/**
		 * 时间选择 
		 */
		initDatePicker:function(){
			/**
			 * 时间选择 
			 */
			$( "#js_date_from" ).datepicker({
				defaultDate: "+1w",
				changeMonth: true
			});
			$( "#js_date_to" ).datepicker({
				defaultDate: "+1w",
				changeMonth: true
			});
		},
		
		/**
		 * 确认按钮
		 */
		submit:function(){
			$('#js_stati_btn').on('click',function(){
				var start = $( "#js_date_from" ).val(),
					end = $( "#js_date_to" ).val();
				getData(start,end);
			});
		},
		
		export_excel:function(){
			$('#js_export_btn').on('click',function(){
				var data = {
					data:getTableData()
				}
				RestApi.exportCpData(data).success(function(d){
					if(d && d.success){
						var url = 'excel/' + d.filename
						$.fileDownload(url);
					}
				})
				return false;
			});
		},
		
		
		/**
		 * 初始化 
		 */
		init:function(){
			this.initDatePicker();
			this.submit();
			this.export_excel();
		}
	};
	
	/**
	 * 页面加载时初始化页面 
	 */
	var initPage = function(){
		//加载时初始化
		var start = Fun.getUrlParam('start') || Fun.getMonthStartDate();
		var end = Fun.getUrlParam('end') || Fun.getMonthEndDate();
		$( "#js_date_from" ).val(start);
		$( "#js_date_to" ).val(end);
		getData(start,end);
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
		
		RestApi.getUserPower(user).success(function(data){
			if(data && data.users){
				var power = parseInt(data.users.user_power,10);
				// 者管理员
				if(power === 40){
					//设置登录信息 和 退出事件
					UserInfo.init();
					//初始化事件
					Event.init();
					//初始化排序
					$('.js_tablesorter').tablesorter();
					//菜单
					Fun.navLink(power);
					//加载数据
					initPage();
					
				}else{
					window.location = 'error.html';
				}
			}else{
				window.location = 'error.html'
			}
		})
	};
	
    exports.init = function(){
    	checkPower();
    };
	
});

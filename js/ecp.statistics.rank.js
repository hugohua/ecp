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
		RestApi.statisticsRankByDate(start,end).success(function(data){
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
			$('#d_' + d.type_id + '_' + d.rank_id).text(d.count).attr('data-price',d.price);
		};
		//外派设计师金额
		setPaiDesignPrice(data.data.price);
	};
	
	/**
	 * 计算价格和数量
	 */
	var countPrice = function(data){
		var length = data.data.type.length + 4;		//多了 平台金额|派驻金额|总金额
		$('#js_stat_cont .js_tablesorter').each(function(){
			var $table = $(this);
			//计算平台价格
			$table.find('tbody tr').each(function(){
				var $tr = $(this),
					sum_price = 0;
				$tr.find('td[data-price]').each(function(){
					var $td = $(this),
						price = parseFloat($td.attr('data-price'));
					sum_price += price;	

				});
				$tr.find('.js_pingtai_price:first').text(sum_price);

				var paizhu_price = parseFloat($tr.find('.js_paizhu_price:first').text() || 0),
					tolprice = paizhu_price + sum_price;	//平台价格+派驻价格

				//总价
				$tr.find('.js_tolprice:first').text( tolprice );

			});

			//计算总金额


			//循环表格列 计算合计几个
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
	 * 设置外派设计师金额
	 */
	var setPaiDesignPrice = function(prices){
		for(var i in prices){
			//有归属部门，并且有固定工资 (固定工资条件：rating=> H ; type id => 0)
			// console.log('setPaiDesignPrice',prices[i])
			if( (prices[i]['cp_rank_id'] != 0) && (prices[i]['price_rating'] == 'H') &&  (prices[i]['price_type_id'] == 0)){
				var $waiPrice = $('#js_cprank_' + prices[i]['cp_rank_id']),
					old_price = parseFloat($waiPrice.text()),
					new_price = parseFloat(prices[i]['price_name']) + old_price;
				$waiPrice.text(new_price);
			}
		}
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
				RestApi.exportRankData(data).success(function(d){
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
			//初始化
            for(var i in this) {
                if (this.hasOwnProperty(i) && i !== 'init') {
                    console.info(i)
                    this[i]();
                }
            }
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

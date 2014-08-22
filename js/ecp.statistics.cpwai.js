/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
    	Mustache = require('mustache'),
		UserInfo = require('./ecp.user.info');
	
	var getData = function(start,end){
		console.info(start,end);
		//需求类型占比
		var req = RestApi.getCp(1),
			req2 = RestApi.getCpPrice(start,end,1);

		$.when(req,req2).done(function(data1,data2){
			var cp_data = data1[0],
				price_data = data2[0];
			//画table
			drawTable(cp_data);	
			//设置价格
			setPriceToTable(price_data.prices);
			//计算总价格
			countPrice(cp_data);
		})
	};

	/**
	 * 设置价格到table
	 */
	var setPriceToTable = function(data){
		for(var i in data){
			var date = data[i]['price_month'],
				month = new Date(date).getMonth() + 1,
				price = parseInt(data[i]['price_name'],10),
				fmt_price = '&#65509;'+price.formatMoney(0,',',',')
			$('#js_'+ data[i]['price_cp_id'] +'_' + month).html(fmt_price).attr('data-price',price);
		}
	};

	/**
	 * 计算金额
	 */
	var countPrice = function(data){
		var $table = $('#js_waipai_table'),
			length = data.cp.length + 1;

		//计算价格
		$table.find('tbody tr').each(function(){
			var $tr = $(this),
				sum_price = 0;
			$tr.find('td[data-price]').each(function(){
				var $td = $(this),
					price = parseInt($td.attr('data-price'));
				sum_price += price;	

			});
			$tr.find('.js_tolprice').html('&#65509;'+sum_price.formatMoney(0,',',',')).attr('data-price',sum_price);
		});
		//循环表格列
		for (var i = 4; i <= length; i++) {
			var sum_price = 0;
			$table.find('tbody tr td:nth-child('+ i +')').each(function(){
				var $td = $(this),
					price = parseInt($td.attr('data-price')) || 0;
				sum_price += price;	
			});
			$table.find('tfoot tr td:nth-child('+ i +')').html('&#65509;'+sum_price.formatMoney(0,',',',')).attr('data-price',sum_price);
		};

		//last
		$table.find('tbody tr td:nth-child(16)').each(function(){
			var $td = $(this),
				price = parseInt($td.attr('data-price')) || 0;
			sum_price += price;	
		});

		$table.find('tfoot tr td:nth-child(16)').html('&#65509;'+sum_price.formatMoney(0,',',',')).attr('data-price',sum_price);
	};
	
	/**
	 * 绘制table 
	 */
	var drawTable = function(data){
		var tpl = $('#js_stat_tpl').html(),
			cp_data = {data:data},
			listHtml = Mustache.to_html(tpl, cp_data);
		$('#js_stat_cont').html(listHtml);
	};

	var getTableData = function(){
		var data = [];
	    var $table = $('#js_waipai_table'),
	  		arr = [];
	  	$table.find('tr').each(function(){
	  		var $tr = $(this),
	  			result = [];
	  		$tr.find('th,td').each(function(){
	  			var $this = $(this),
	  				price = $this.attr('data-price'),
	  				text = $this.text(),
	  				val = '';
	  			if(price){
	  				val = price;
	  			}else if(text){
	  				val = text
	  			};
	  			result.push(val);
	  		});
	  		arr.push(result);	
	  	});
	  	data.push({
	  		data:arr
	  	});
		return data;
	};

	
	
	var Event = {
		
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
				RestApi.exportCpWaiData(data).success(function(d){
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
			this.submit();
			this.export_excel();
		}
	};
	
	/**
	 * 页面加载时初始化页面 
	 */
	var initPage = function(){
		//加载时初始化
		var start = Fun.getUrlParam('start') || new Date().getFullYear() + '-01-01';
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

/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
		Highcharts = require('highcharts'),
		Mustache = require('mustache'),
		UserInfo = require('./ecp.user.info');
	require('jquery.tablesorter')($);

	var m = {
		$rank:$('#js_stati_rank'),
		$date_from:$('#js_date_from'),
		$date_to:$('#js_date_to')
	}
	
	$.tablesorter.addParser({
        // set a unique id
        id: 'marketcap',
        is: function(s) {
            // return false so this parser is not auto detected
            return false;
        },
        format: function(s) {
            s = s.replace('￥','');
            s = s.replace(',','');
            // format your data for normalization
            return s;
        },
        // set type, either numeric or text
        type: 'numeric'
    });
	
	/**
	 * 高亮表格行 
	 */
	var hightLineTable = function($table,index){
		$table.find('tbody tr:eq('+ index +')').addClass('hightline').siblings('tr').removeClass('hightline');
	};
	
	/**
	 * 还原表格样式 
	 */
	var resetTable = function($table){
		$table.find('tbody tr').removeClass('hightline');
	};

	/***
	 * 绘制饼状图 
	 */
	var drawPieChart = function(id,data){
		// console.info(id,data)
		var chart = new Highcharts.Chart({
			//不显示 highcharts水印
			credits : {
			  enabled : false
			},
            chart: {
                renderTo: id,
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: ''
                // style: {
		         // color: '#000',
		         // font: '700 18px 微软雅黑'
		     	// },
            },
            tooltip: {
            	style:{
            		fontFamily: '微软雅黑',
                    fontSize:'14px'
            	},
            	// headerFormat: '<span>{point.key}</span>',
        	    // pointFormat: '<b>{point.percentage}%</b>',
            	// percentageDecimals: 1,
            	formatter: function () {
                   return this.point.name + ': <b>' + Highcharts.numberFormat(this.percentage, 1) + '%</b>';
               }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                itemMarginBottom:10,
                // x: -10,
                // y: 100,
                borderWidth: 0
            },
            plotOptions: {
                pie: {
                    cursor: 'pointer',
                    allowPointSelect:true,
                    showInLegend: true,
                    dataLabels: {
                        enabled: true,
                        // distance: -30,			//显示在内部
                        color: '#000000',
                        connectorColor: '#000000',
                        style:{
                        	fontFamily: '微软雅黑',
                        	fontSize:'14px'
                        	
                        },
                        formatter: function() {
                            return '<span>'+ this.point.name +'</span>: '+ Highcharts.numberFormat(this.percentage,1) +' %';
                        }
                    }
                },
                series: {
	                point: {
	                    events: {
	                        mouseOver: function() {
	                            var $table = $('#'+id).closest('.ecp_statistics_item').find('table.js_tablesorter');
	                            hightLineTable($table,this.x);
	                        }
	                    }
	                },
	                events: {
	                    mouseOut: function() {    
	                        var $table = $('#'+id).closest('.ecp_statistics_item').find('table.js_tablesorter');
	                        resetTable($table);
	                    }
	                }
	            }
            },
            
            series: [{
                type: 'pie',
                name: '占比',
                data: data,
                startAngle: 90
            }]
        });
		return chart;
	};
	
	/**
	 * 表格
	 * ID 表格ID
	 * Data 表格数据
	 * isShowNum 是否显示数量
	 */
	var drawTable = function(id,table_data){
		var tpl = $('#'+id + '_tpl').html(),
			listHtml = Mustache.to_html(tpl, table_data);
		$('#'+id).html(listHtml);
		//初始化排序
		$('#'+id).find('.js_tablesorter').tablesorter({ 
            headers: { 
                1: { 
                    sorter:'marketcap' 
                } ,
                2: { 
                    sorter:'marketcap' 
                } ,
                3: { 
                    sorter:'marketcap' 
                } 
            } 
        });
	};
	
	/**
	 * //获取图表数据 
	 */
	var getData = function(start,end,rank_id){
		rank_id = rank_id || 0;
		//需求类型占比
		RestApi.statisticsByDate('type',start,end,rank_id).success(function(data){
			var chart_data = changeChartData(data),
				table_data = changeTableData(data),
				chart = drawPieChart('js_type_chart',chart_data);
			drawTable('js_type_table',table_data);
			triggerChartEvent('js_type_table',chart);
		});

		//需求归类占比
		RestApi.statisticsByDate('rank',start,end).success(function(data){
			console.log(data,'rank')
			var chart_data = changeChartData(data),
				table_data = changeTableData(data),
				chart = drawPieChart('js_rank_chart',chart_data);

			drawTable('js_rank_table',table_data);
			triggerChartEvent('js_rank_table',chart);
		});
		
		//需求CP占比
		RestApi.statisticsByDate('cp',start,end,rank_id).success(function(data){
			var chart_data = changeChartData(data),
				table_data = changeTableData(data),
				chart = drawPieChart('js_cp_chart',chart_data);
			drawTable('js_cp_table',table_data);
			triggerChartEvent('js_cp_table',chart);
		});
		
		//设置URL
		setUrlParam(start,end,rank_id);
	};
	
	/**
	 * 设置URL参数  和下载链接参数
	 */
	var setUrlParam = function(start,end,rank_id){
		Fun.setUrlParam('start',start);
		Fun.setUrlParam('end',end);
		Fun.setUrlParam('rank_id',rank_id);
		// $('#js_down_excel').attr('href','api/download_summary.php?date='+start);
	};
	
	/**
	 * 数据转换 
	 */
	var changeChartData = function(data){
		var arr = [];
		var cindex = 0;
		for(var i in data.statistics){
			data.statistics[i]['color'] = Fun.getColor(cindex);
			//转为数字型
			if(data.statistics[i]['total_price'] == null){
				data.statistics[i]['y'] = parseInt(data.statistics[i]['price'],10);
			}else{
				data.statistics[i]['y'] = parseInt(data.statistics[i]['total_price'],10);	
			}
			arr.push(data.statistics[i]);
			cindex++;
		};
		return arr;
	};
	
	/**
	 * 数据转换为表格所需数据
	 */
	var changeTableData = function(data){
		var arr = [],
			obj,
			prices = 0;
		for(var i in data.statistics){
			var price = parseInt(data.statistics[i]['price'],10);
			prices += price;
			arr.push(data.statistics[i]);
		};

		obj = {
			data:{
				statistics:arr,
				total_price:prices,
				fmt_total_price:prices.formatMoney(0,'.',',')
			}
		};

		if(data.total_ping_price != null){
			obj.data['total_ping_price'] = data['total_ping_price'];
			obj.data['fmt_total_ping_price'] = data['total_ping_price'].formatMoney(0,'.',',');

			obj.data['total_wai_price'] = data['total_wai_price'];
			obj.data['fmt_total_wai_price'] = data['total_wai_price'].formatMoney(0,'.',',');

			obj.data['total_all_price'] = data['total_all_price'];
			obj.data['fmt_total_all_price'] = data['total_all_price'].formatMoney(0,'.',',');
		}

		return obj;
	}
	
	/**
	 * 更新chart 
	 */
	var triggerChartEvent = function(id,chart){
		$('tbody tr','#'+id).on({
			'mouseover':function(){
				var index = $(this).index();
				$(chart.series[0].data[index].graphic.element).css({ opacity: 0.7 });	
			},
			'mouseout':function(){
				var index = $(this).index();
				$(chart.series[0].data[index].graphic.element).css({ opacity: 1 });	
			}
		})
	};

	/**
	 * 初始化下拉控件
	 */
	var initRankSelect = function(){
		RestApi.getRank().success(function(data){
			var tpl = $('#js_stati_rank_tpl').html(),
				listHtml = Mustache.to_html(tpl, data);
			m.$rank.html(listHtml);
		});
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
					end = $( "#js_date_to" ).val(),
					rank_id = m.$rank.getValue();
				getData(start,end,rank_id);
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
		var rank_id = Fun.getUrlParam('rank_id') || 0;
		$( "#js_date_from" ).val(start);
		$( "#js_date_to" ).val(end);
		getData(start,end,rank_id);
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
					//初始化下拉框
					initRankSelect();
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

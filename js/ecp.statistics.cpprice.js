/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
    	Highcharts = require('highcharts'),
		UserInfo = require('./ecp.user.info');

	var getData = function(start,end){
        //全部
        RestApi.getCpPrices(start,end).success(function(data){
            console.info(data);
            var data = changeData(data);
            drawPieChart('js_stat_cont',data);

            setUrlParam(start,end);

             //尚未初始化
                    // chart.addSeries({
                    //     name: item.name,
                    //     data: data.data.price
                    // });

        });

        
	};

    /**
     * 数据格式转换
     */
    var changeData = function(data){
        var arr = [],
            data = data.data,
            i = 0,
            chart_data;        //图标所需数据

        data.forEach(function(item){
            var obj = {
                type: 'line',
                name: item.rank_name,
                data: item.price,
                color: Fun.getColor(i),
            };
            i++;
            // console.info(obj)
            arr.push(obj);
        });

        chart_data = {
            month:data[0].month,
            series:arr
        };

        return chart_data;

    };


    var m = {
        $date_from : $('#js_date_from'),
        $date_to   : $('#js_date_to')
    }

	/***
	 * 绘制饼状图 
	 */
	var drawPieChart = function(id,data){
		console.info(id,data)
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
                text: '',
                // style: {
		         // color: '#000',
		         // font: '700 18px 微软雅黑'
		     	// },
            },
            tooltip: {
            	style:{
            		fontFamily: '微软雅黑',
                    fontSize:'14px',
            	},
            	// headerFormat: '<span>{point.key}</span>',
        	    // pointFormat: '<b>{point.percentage}%</b>',
            	// percentageDecimals: 1,
            	// formatter: function () {
             //       return this.point.name + ': <b>' + Highcharts.numberFormat(this.percentage, 1) + '%</b>';
             //   }
            },
            xAxis: {
                categories: data.month,
                title: {
                    text: '日期',
                    style:{
                        fontFamily: '微软雅黑',
                        fontSize:'16px',
                        color: '#666666',
                        fontWeight: 'normal'
                        
                    }
                }
            },
            yAxis: {
                title: {
                    text: '金额',
                    style:{
                        fontFamily: '微软雅黑',
                        fontSize:'16px',
                        color: '#666666',
                        fontWeight: 'normal'
                        
                    }
                }
            },
            legend: {
                // layout: 'vertical',
                // align: 'right',
                // verticalAlign: 'middle',
                // itemMarginBottom:10,
                // x: -10,
                // y: 100,
                borderWidth: 0
            },
            plotOptions: {
                line: {
                    cursor: 'pointer',
                    allowPointSelect:true,
                    showInLegend: true,
                    dataLabels: {
                        enabled: true,
                        // distance: -30,			//显示在内部
                        color: '#666666',
                        connectorColor: '#000000',
                        style:{
                        	fontFamily: '微软雅黑',
                        	fontSize:'14px',
                        	
                        },
                        formatter: function() {
                            return '￥' + Highcharts.numberFormat(this.y,0);
                        }
                    }
                },
            },
            
            // series: [{
            //     type: 'line',
            //     name: '全部',
            //     data: data.price,
            //     color: '#e48701'
            // }]

            series: data.series
        });
		return chart;
	};

    /**
     * 设置URL参数  和下载链接参数
     */
    var setUrlParam = function(start,end){
        Fun.setUrlParam('start',start);
        Fun.setUrlParam('end',end);
    };

    var Event = {
        /**
         * 时间选择 
         */
        initDatePicker:function(){
            /**
             * 时间选择 
             */
            m.$date_from.datepicker({
                defaultDate: "+1w",
                changeMonth: true
            });
            m.$date_to.datepicker({
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
        var start = Fun.getUrlParam('start') || '2013-01-01';
        var end = Fun.getUrlParam('end') || Fun.getMonthEndDate();
        m.$date_from.val(start);
        m.$date_to.val(end);
        //加载数据
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
					//菜单
					Fun.navLink(power);
                    //初始化页面
                    initPage();
                    //事件
                    Event.init();
					
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

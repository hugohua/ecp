/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func');
	
	require('jquery.ui')($);
	
	var datePicker = function(){
		//初始化
		var week_obj = Fun.getWeeks();
		$('#js_datepicker').datepicker({
			beforeShowDay: function(date) {
				if ($.inArray(Fun.dateFormat(date,"yyyy-MM-dd"), week_obj.week_day) >= 0){
					return [true, "hightlight_date", "查看本周需求"];
				};
				return [true, "", ""];
            },
            onSelect: function(_selectedDate) {
            	var date = new Date(_selectedDate);
            	week_obj = Fun.getWeeks(date);
            	//创建表格
            	drawTable(week_obj);
            	//获取数据
            	var start = week_obj.week_day[0],
            		end = week_obj.week_day[week_obj.week_day.length-1 ];
            	console.info(start,end)
            	getRequireByDate(start,end);
            }
		});
	};
	
	
	
	
	exports.init = function(){
		datePicker();
		Events.init();
	};
	
	
});

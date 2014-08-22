/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		localStore = require('./ecp.localstore'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		c = require('./ecp.config.user'),
		ReqFun = require('./ecp.require.func'),
		ReqGetSet = require('./ecp.require.getset'),
		ListFun = require('./ecp.list.func');
	
	var changeData = function(data){
		for(var i in data){
			var status = data[i]['Status'];
			data[i][status] = true;
		};
		var d = {
			require:data
		}
		return d;
	};
	
	var getTaskData = function(){
		var user = Fun.getUserName(),
			sdate = Fun.getWeekDayByType(new Date(),0);
			// url = 'http://et.oa.com/api/task/getall?uid=saidaxie&sdate=2012-11-29&edate=2012-12-03';
			url = 'http://et.oa.com/api/task/getall?uid='+ user +'&sdate='+sdate;
		$.getJSON(url,function(data){
			var tpl = $('#js_sumary_task_tmpl').html(),
				listHtml = Mustache.to_html(tpl, changeData(data));
			$('tbody','#js_sumary_task_table').html(listHtml);
			$(".js_tablesorter").trigger("update", [true]); 
		});
	};
	
	
	exports.init = function(){
		if(!Fun.checkYiXun()){
			getTaskData();
		};
	};
	
	
	//exports.init();
	
	
});

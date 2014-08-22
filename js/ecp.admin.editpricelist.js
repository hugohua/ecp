/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		UserInfo = require('./ecp.user.info'),
		localStore = require('./ecp.localstore');
	
	require('jquery.ui')($);
    //用户权限
    var power;
    /**
     * 转为Template 所需数据
     * @param data
     * @returns {*}
     */
    var changeData = function(data){
        data.editprices.forEach(function(item,index){
            item['editprice_check_'+ item.edit_check] = true;
            item['editprice_power_' + power] = true;
        });
        return data;
    }


    var initPage = function(){

       RestApi.getEditPriceDates().success(function(data){
           var data = changeData(data);
           console.info(data)
           var tpl = $('#js_list_tmpl').html(),
               listHtml = Mustache.to_html(tpl,data);

           $('tbody','#js_list_table').html(listHtml);
        });
    };

	var getUserPower = function(){
		var user = Fun.getUserName();
		if(!user){
			window.location = 'index.php';
			return;
		};
		
		RestApi.getUserPower(user).success(function(data){
			if(data && data.users){
				power = parseInt(data.users.user_power,10);
				// 管理员 和 财务
				if(power === 40 || power === 50){
					//设置登录信息 和 退出事件
					UserInfo.init();
					Fun.navLink(power);
					//获取CP
					initPage();
				}else{
					window.location = 'error.html';
				};
			};
		});
	}
	
	exports.init = function(){
		getUserPower();
	};
	
	
});

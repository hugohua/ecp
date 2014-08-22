/**
 *  用户注册
 */
define(function(require, exports, module) {  
   var $ = require('jquery'),
    	Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest');
   
   require('jquery.cookie')($);
   /**
    * 获取登录数据 
    */
   var getData = function(){
   		var obj = {
			users:Fun.getDbData('#js_form')
		};
		//登录名和 英文名一样
		obj.users.login_name = obj.users.english_name;
		obj.users.full_name = obj.users.english_name + '('+ obj.users.chinese_name +')';
		return obj;
   };
   
   /**
    * 登录事件 
    */
   var registerEvent = function(){
		$('#js_form').on('submit',function(){
			var obj = getData();
			var validate = Fun.validate('#js_form');
			if(validate){
				RestApi.addUser(obj).success(function(data){
					if(data && data.users){
						alert('已成功注册,请联系管理员开通权限！您的登录名是:' + data.users.login_name);
						$.cookie("login_user_ecp",data.users.login_name,{expires:30,path: '/'});
						window.location = 'error_yixun.html';
					}else{
						Fun.alert(0,'用户已存在 无需再次注册！');
					};
				});
			}else{
				alert('所有字段不能为空!');
			}
			return false;
		});
   };
   
   exports.init = function(){
   		//checkLogin();
   		registerEvent();
   };
   
});  
/**
 *  用户登录
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
			data:{
				user : $.trim($('#js_english_name').val()) ,
				password : $.trim($('#js_user_password').val())
			}
		};
		return obj;
   };
   
   /**
    * 登录事件 
    */
   var loginEvent = function(){
		$('#js_login_btn').on('click',function(){
			var obj = getData();
			RestApi.checkLogin(obj).success(function(data){
				
				if(data && data.users){
					//缓存数据
					$.cookie("login_user_ecp",data.users.login_name,{expires:30,path: '/'});
					window.location = 'view_pdm.html';
				}else{
					alert('用户名或密码错误，登录失败！');
				}
				
			});
			return false;
		});
   };
   
   /**
    * 判断是否登录 
    */
   var checkLogin = function(){
	   	var user = $.cookie("login_user_ecp");
	   	if(user){
	   		window.location = 'view_pdm.html';
	   	};
   };
   
   
   exports.init = function(){
   		//checkLogin();
   		loginEvent();
   };
   
});  
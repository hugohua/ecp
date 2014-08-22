/**
 * 切换类
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
		c = require('./ecp.config.user');
	
	exports.init = function(){
		var name = Fun.getUserName();
		$('#js_user_photo').css('background-image','url(http://dayu.oa.com/avatars/'+ name +'/avatar.jpg)');
		
		$("#js_logout").on("click.func",function(){
			$.cookie("login_user_ecp",null,{path: '/'})
			$.cookie("last_login_page",window.location.href,{path: '/'});
			var url = 'http://passport.oa.com/modules/passport/signout.ashx?url=' + c.root + "index.php";
			//易讯
			Fun.checkYiXun() && (url = 'login.html');
			
			top.location.href = url;
			return false;
		});
			
	};
	
	
	//exports.init();
	
	
});

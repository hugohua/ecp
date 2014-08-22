/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		c = require('./ecp.config.user'),
		RestApi = require('./ecp.rest'),
		ReqGetSet = require('./ecp.require.getset'),
		Fun = require('./ecp.func'),
		localStore = require('./ecp.localstore'),
		ReqFun = require('./ecp.require.func');
	
	
	
	/**
	 * 登录后设置登录信息 
	 */
	var setUserData = function(){
		var data = localStore.getSingleUserData();
		if(data && data.users){
			//$('#js_user_photo,#js_user_photo_big').attr('src','http://dayu.oa.com/avatars/'+ data.users.english_name +'/avatar.jpg');
			//$('#js_user_name').text(data.users.full_name);
			$('#js_user_photo').css('background-image','url(http://qlogo1.store.qq.com/qzone/'+ data.users.user_qq +'/'+ data.users.user_qq +'/50)');
			//设置弹窗信息
			exports.setUserInfo(data);
		};
	};
	
	var Events = {
		/**
		 * 退出事件 
		 */
		logout:function(){
			$("#js_logout").on("click.func",function(){
				$.cookie("login_user_ecp",null,{path: '/'})
				$.cookie("last_login_page",window.location.href,{path: '/'});
				var url = 'http://passport.oa.com/modules/passport/signout.ashx?url=' + c.root + "index.php";
				//易讯
				Fun.checkYiXun() && (url = 'login.html');
				
				top.location.href = url;
				return false;
			});
		},
		showPop:function(){
			$('#js_my_info').on('click',function(){
				$('#js_user_pop,#js_ui_mask').show();
			});
		},
		/**
		 * 关闭按钮 
		 */
		closePop:function(){
			$('.js_pop .js_close').on('click',function(){
				$('#js_user_pop,#js_ui_mask').hide();
			});
		},
		/**
		 * 确认提交按钮 
		 */
		submitUser:function(){
			$('#js_user_btn').on('click',function(){
				var u_data = exports.getUserInfo();
				RestApi.putUserByIds(u_data).success(function(data){
					if(data && data.users){
						Fun.alert(1,'修改资料成功！');
						exports.hideUserInfo();
					};//if
				});//rest api
			})
		},
		init:function(){
			this.logout();
			this.showPop();
			this.closePop();
			this.submitUser();
		}
	}
	
	/**
	 * 设置user 弹窗信息 
 * @param {Object} data
	 */
	exports.setUserInfo = function(data){
		console.info(data,'setUserInfo')
		$('#js_user_phone').val(data.users.user_phone);
		$('#js_user_qq').val(data.users.user_qq);
		$('#js_user_id').val(data.users.id);
		$('#js_user_email').val(data.users.user_email);
	};
	
	/**
	 * 获取user 信息 
	 */
	exports.getUserInfo = function(){
		var obj = {
			users:{
				user_phone:$('#js_user_phone').val(),
				user_qq:$('#js_user_qq').val(),
				id:$('#js_user_id').val(),
				user_email:$('#js_user_email').val()
			}
		};
		return obj;
	}
	
	
	exports.hideUserInfo = function(){
		$('#js_user_pop,#js_ui_mask').hide();
	};
	
	/**
	 * 初始化 
	 */
	exports.init = function(){
		Events.init();
		setUserData();
	};
	
	
});

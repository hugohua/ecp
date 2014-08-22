/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
    	UserInfo = require('./ecp.user.info'),
		localStore = require('./ecp.localstore');
	require('jquery.tablesorter')($);
	
		
	/**
	 * 获取搜索参数 
	 */
	var getParam = function(){
		var obj = {};
		$('#js_form :input[data-name]').each(function(){
			var $this = $(this),
				key = $this.attr('data-name'),
				val = $this.val();
			obj[key] = val;	
		});
		return obj;
	};
	
	/**
	 * 设置搜索参数 
	 */
	var setParam = function(data){
		for(var i in data){
			$('#js_form :input[data-name="'+ i +'"]').val(data[i]);
		};
	};
	
	/**
	 * 设置收件人 
	 */
	var setReceiver = function(){
		var pdm = Fun.getUrlParam('pdm');
		if(pdm){
			$('#js_receiver').val(pdm);
		}
	};
	
	var sendRtxEvent = function(){
		$('#js_form').on('submit',function(){
			var obj = getParam();
			RestApi.sendRtxMsg(obj).success(function(data){
				alert('发送成功！');
			});
			return false;
		});
	}
	
	/**
	 * 检测用户权限 
	 */
	var checkPower = function(){
		var user = Fun.getUserName();
		if(!user){
			window.location = 'index.php';
			return;
		}
		
		RestApi.getUserApp(user).success(function(data){
			console.info(data,'data')
			if(data && data.app && data.app.user){
				var power = parseInt(data.app.user.user_power,10);
				//产品经理视图  或 项目经理  或者管理员
				if(power === 10 || power ===30 || power ===40){
			    	//设置登录信息 和 退出事件
					UserInfo.init();
					//导航链接
					Fun.navLink(power);
					
					setReceiver();
					sendRtxEvent();
					
				}else{
					window.location = 'error.html';
				}
			}else{
				// window.location = 'error.html'
			}
		})
	};
	
    exports.init = function(){
    	checkPower();
    }
	
});

/**
 * 需求列表
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest'),
		ShortCuts = require('./ecp.shortcuts'),
		UserInfo = require('./ecp.user.info'),
		List = require('./ecp.pm.list'),
		localStore = require('./ecp.localstore');//,
		//WebDb =  require('./ecp.websql');
		
	
	require('bootstrap.tab')($);
	/**
     * 缓存价格信息 
     */
    var setPriceData = function(){
		RestApi.getOnlyPrice().success(function(data){
			//缓存价格信息
			localStore.setPriceData(data);
			console.info(data,'getOnlyPrice')
		})
	};
	
	/**
	 * 返回顶部 
	 */
	var backTopEvent = function(){
		$(window).scroll(function() {
			if($(this).scrollTop() != 0) {
				$('#js_backtop').fadeIn();	
			} else {
				$('#js_backtop').fadeOut();
			}
		});
	 
		$('#js_backtop').click(function() {
			$('body,html').animate({scrollTop:0},800);
		});
	};

	/**
	 * 清除临时需求 
	 */
	var clearTempRequire = function(){
		$('#js_clear_next_ls').on('click',function(){
			var $this = $(this);
			RestApi.clearNextTempRequire().success(function(data){
				if(data.require == "success"){
					$this.closest("li").find(".js_temp_require").remove();
					Fun.alert(1,"清除临时需求成功！");
				}

			});

		})
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
		
		RestApi.getUserApp(user).success(function(data){
			console.info(data,'data')
			if(data && data.app && data.app.user){
				var power = parseInt(data.app.user.user_power,10);
				//PM视图  或者管理员
				if(power ===30 || power ===40){
					//初始化WEB SQL DB
					//WebDb.init();
					//先清除缓存信息
					//console.info(localStore)
					localStore.clear();
					//缓存app 信息
					localStore.setAppData(data);
					
					List.init();
			    	ShortCuts.init();
			    	UserInfo.init();
			    	Fun.navLink(power);
			    	//缓存价格数据
			    	setPriceData();
			    	backTopEvent();
			    	clearTempRequire();
                    //设置当前用户的email
//                    window.user_email = data.app.user.user_email;
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

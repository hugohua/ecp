define(function(require, exports, module) {  
    
    var $ = require('jquery'),
    	shortcut = require('shortcut'),
    	UserInfo = require('./ecp.user.info'),
    	Fun = require('./ecp.func'),
    	ReqFun = require('./ecp.require.func');
    
   	
   	
   	/**
	 * 快捷操作
	 */
	var shortCuts = function(){
		
		var short_cuts = [
			//27
			{key:"esc",method:function(){
				ReqFun.hideRequirePop();
				ReqFun.hideRightPop();
				UserInfo.hideUserInfo();
				Fun.closeWindow();
				// Fun.hideCheckUserPop();
			}}
		];
		
		$.each(short_cuts,function(index,elem){
			shortcut.add(elem.key, function () {
				elem.method();
				return false;
			}, { 'type': 'keydown', 'propagate': false });
		});
	};
	
	
	exports.init = function(){
		console.info('init shortCuts')
		shortCuts();
	};
    
    
})  
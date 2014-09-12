/**
 * sea js 库  配置信息
 * 参考API:http://seajs.org/docs/zh-cn/configuration.html
 */
(function() {
	/**
	 * js文件映射
	 */
	var alias = {
		'jquery' : 'jquery',
		'$' : 'jquery',
		'mustache' : 'mustache',
		'shortcut':'shortcut',
		
		//plugins
		'jquery.cookie':'jquery.cookie',
		'jquery.pubsub':'jquery.pubsub',
		'jquery.contenteditable':'jquery.contenteditable',
		'jquery.field':'jquery.field',
		'jquery.ui':'jquery.ui',
		'jquery.colorpicker':'jquery.colorpicker',
		'jquery.pagination':'jquery.pagination',
		'jquery.contextMenu':'jquery.contextMenu',
		'jquery.tablesorter':'jquery.tablesorter',
		'jquery.fileDownload':'jquery.fileDownload',
		'jquery.ui.monthpicker':'jquery.ui.monthpicker',
		
		
		//bootstrap
		'bootstrap.alert':'bootstrap-alert',
		'bootstrap.modal':'bootstrap-modal',
		'bootstrap.transition':'bootstrap-transition',
		'bootstrap.tab':'bootstrap-tab',
		'bootstrap.tooltip':'bootstrap-tooltip',
		'bootstrap.dropdown':'bootstrap-dropdown',
		//localStore
		'localStore':'localStore',
		'fileuploader':'fileuploader',
		'highcharts':'highcharts'
		
		
	};

	seajs.config({
		//base : './js/',
		alias : alias,
		//时间截
		map : [[ /^(.*\.(?:css|js))(.*)$/i, '$1?20140221125' ]],
		debug : 0
	});
	
})();

/**
 * 安全使用console API
 */
(function(a) {
	function b() {
	}

	for(var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), d; !!( d = c.pop()); ) {
		a[d] = a[d] || b;
	}
})( function() {
	try {
		return window.console;
	} catch(a) {
		return (window.console = {});
	}
}());



define(function(require, exports) {
	/**
	 * 时间截
	 */
	exports.load = function(name, options) {
		
		/**
		 * 检测用户浏览器 
		 */
		var broswer = navigator.userAgent.toLowerCase(),
//			is_chrome = / (?:chrome|crios|crmo)\/([0-9.]+)/.test(broswer),
            is_chrome = broswer.indexOf('chrome') > -1,
			is_safari = broswer.indexOf('safari') > -1,
			is_ff = broswer.indexOf('firefox') > -1;
//        return;
		if(is_chrome || is_ff || is_safari){
			require.async('./' + name, function(mod) {
				if (mod && mod.init) {
					//如果有init函数，初始化时则执行init();
					mod.init();
					console.info('init web');
				}
			});
		}else{
			window.location.href = 'error_browser.html';
			return;
		}
		
		
	};

});






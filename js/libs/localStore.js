define(function(require, exports, module) {  

/***
 * Module based on jquery plugin from http://www.stoimen.com/blog/2010/02/26/jquery-localstorage-plugin-alpha
 * localStorage类，支持object，number类型
 */
	
	var ls = null,
		hasJSON = (typeof JSON !== 'undefined');

	if (typeof localStorage !== 'undefined') {
		ls = localStorage;
	}

	exports.setItem = function(key, value, lifetime) {
		if (!ls || !exports.canStoreItem(value)) return false;
		
		var time = new Date();
		if (typeof lifetime === 'undefined') lifetime = 24*60*60*1000;//默认是1天
		lifetime = lifetime * 24 * 60 * 60 * 1000
		ls.setItem(key, JSON.stringify(value));
		ls.setItem('meta_ct_'+ key, time.getTime());
		ls.setItem('meta_lt_'+ key, lifetime);
		return true;
	};

	exports.getItem  = function(key) {
	     if (!ls) return false;
	     var time = new Date();
	     if (time.getTime() - ls.getItem('meta_ct_'+key) > ls.getItem('meta_lt_'+key)) {
	        exports.removeItem(key);
	        return null;
	     }
	     return JSON.parse(ls.getItem(key));
	};

	exports.removeItem  = function(key) {
	     if (!ls) return false;

	     ls.removeItem(key);
	     ls.removeItem('meta_ct_'+key);
	     ls.removeItem('meta_lt_'+key);
	     return true;
	};
	
	exports.canStoreItem  = function(value) {
		switch (typeof value) {
			case 'string':
			case 'number':
				return true;
		}
		if (!hasJSON) {
			console && console.warn('localStore cannot serialise object data.');
		}
		return hasJSON;
	};
	
	exports.clear = function(){
		ls.clear();
	}
	

}) ;
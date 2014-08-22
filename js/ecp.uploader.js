define(function(require, exports, module) {  
    
    var $ = require('jquery'),
    	c = require('./ecp.config.user'),
    	qq = require('fileuploader');
    
   	
   	/**
	 * 上传插件
	 * 上传ID
	 * 路径
	 * 回调函数
	 */
	exports.createUploader = function(id,path,callback){
		var uploader = new qq.FileUploader({
			element: document.getElementById(id),
			action: c.root +'fileuploader.php',
			allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'swf','zip','rar','doc','docx'],
			params:{
				folder:path,
				newname:true
			},
			onComplete: function(id, fileName, responseJSON){
				if (callback && typeof(callback) === "function") {  
			        callback(responseJSON);  
			    };
			}
		});
	};
   	
    
})  
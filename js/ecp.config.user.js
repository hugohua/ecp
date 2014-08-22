
define(function(require, exports, module) {
	
	//易讯domain
	exports.yixun = 'shyw.ecc.icson.com';
	
	var rootUrl = function(){
		var root = 'http://ecp.oa.com/';
		
		if(location.hostname.indexOf('test.oa.com') !== -1){
			root = 'http://test.oa.com/ecp/';
		}else if(location.hostname.indexOf('vlabs.oa.com') !== -1){
			root = 'http://vlabs.oa.com/ecp/';
		}else if(location.hostname.indexOf('localhost') !== -1){
			root = 'http://localhost/ecp/';
		}else if(location.hostname.indexOf('sh.ecc.com') !== -1){
			root = 'http://sh.ecc.com/tips/task/';
		}else if(location.hostname.indexOf('ecd.oa.com') !== -1){
            root = 'http://ecd.oa.com/task/';
        }else if(location.hostname.indexOf('ecp.jd.me') !== -1){
            root = 'http://ecp.jd.me/';
        }else if(location.hostname.indexOf(exports.yixun) !== -1){
			root = 'http://'+ exports.yixun +'/tips/task/';
		}
		return root;
	};
	  
	//网站根目录
	exports.root = rootUrl();
	
	exports.pm_list = 'yindingding@jd.com;';
	
	//PDM邮件抄送
	exports.email_cc = 'yindingding@jd.com;xieminghong@jd.com;lejiamin@jd.com;renqiang1@jd.com;fangyuming@jd.com,liuqian1@jd.com';
	
	//CP启动邮件需要抄送给如下用户
	exports.email_cp_cc = 'yindingding@jd.com;xieminghong@jd.com;';
	
	//易讯CP启动邮件需要抄送给如下用户
	exports.yixun_cp_dev = 'filialwang;mangohuang;';
});

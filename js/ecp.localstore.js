/**
 *  localStore 类
 */
define(function(require, exports, module) {  
    
    var localStore = require('localStore'),
    	ls = require('./ecp.config.localstore'),
    	RestApi = require('./ecp.rest');
    	
    
    exports.dateFormat = function(date,fmt) {
        var o = {
        "M+" : date.getMonth() + 1, 
        "d+" : date.getDate(), 
        "h+" : date.getHours() % 12 == 0 ? 12 : date.getHours()%12, 
        "H+" : date.getHours(), 
        "m+" : date.getMinutes(), 
        "s+" : date.getSeconds(), 
        "q+" : Math.floor((date.getMonth()+3)/3), 
        "S" : date.getMilliseconds() 
        };
        var week = {
        "0" : "\u65e5",
        "1" : "\u4e00",
        "2" : "\u4e8c",
        "3" : "\u4e09",
        "4" : "\u56db",
        "5" : "\u4e94",
        "6" : "\u516d"
        };
        if(/(y+)/.test(fmt)){
            fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        if(/(E+)/.test(fmt)){
            fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[date.getDay()+""]);
        }
        for(var k in o){
            if(new RegExp("("+ k +")").test(fmt)){
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    };

    /***
     * 获取layout缓存数据
 	 * @param {Object} layout_id
     */
    exports.getRequireDataById = function(require_id,callBack){
    	RestApi.getRequireById(require_id).success(function(data){
    		if(data && data.require){
    			callBack(data.require);
    		}
    	})
    	// var layout_data = localStore.getItem(ls.require_pre + require_id);					//tb_layout 表数据
    	// return layout_data;
    	// var data = null;
    	// WebDb.query('SELECT DATA FROM REQUEST where ID =' + require_id,{
    		// success:function(rex){
    			// if(rex){
    				// data = JSON.parse(rex.item(0)['DATA']);
    				// callBack(data);
    				// console.info(data,'aaa')
    			// };
	    	// }
    	// });
    	
    	
    	//return data;
    };
    
    
    exports.setRequireDataById = function(require_id,data){
    	//localStore.setItem(ls.require_pre + require_id,data,1);
    	//var str = JSON.stringify(data);
    	//WebDb.query("DELETE FROM REQUEST");
    	//console.info(data,'aaaaa')
    	//console.info(str,data)
    	
    	// WebDb.query("UPDATE REQUEST SET DATA = 'ddddd' where ID = " +require_id,{
    		// success:function(){
    			// console.info('good',require_id)
    		// }
    	// });
    	// console.info(require_id)
    	// WebDb.query('SELECT ID FROM REQUEST where ID =' + require_id,{
    		// success:function(rex){
    			// if(rex){
    				// console.info('good')
    				// WebDb.query("UPDATE REQUEST SET DATA = ? where ID = ?",{
    					// arguments:[str,require_id]
    				// });
    			// }else{
    				// console.info('g1')
    				// // console.info(rex,'========')
    				// WebDb.query("INSERT INTO REQUEST(ID,DATA) VALUES ("+ require_id +",'"+ str +"')");
    			// }
	    	// }
    	// });
    };
    
    /***
     * 获取cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.getCpData = function(){
    	var cp_data = localStore.getItem(ls.cp_all);					//tb_cp 表数据
    	return cp_data;
    };
    
    /***
     * 设置cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.setCpData = function(data){
    	localStore.setItem(ls.cp_all,data);
    };
    
    /***
     * 获取cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.getCpDataById = function(cp_id){
    	var cp_data = localStore.getItem(ls.cp_pre + cp_id);					//tb_cp 表数据
    	return cp_data;
    };
    
    /***
     * 设置cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.setCpDataById = function(cp_id,data){
    	localStore.setItem(ls.cp_pre + cp_id,data);
    };

    exports.setRankData = function(data){
        localStore.setItem(ls.rank_all,data);
    };
    
    /***
     * 获取cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.getRankData = function(){
    	var cp_data = localStore.getItem(ls.rank_all);					//tb_cp 表数据
    	return cp_data;
    };

    exports.setRankCateData = function(data){
        localStore.setItem(ls.rank_cate_all,data);
    };

    exports.getRankCateData = function(){
        var rank_cate_data = localStore.getItem(ls.rank_cate_all);					//tb_cp 表数据
        return rank_cate_data;
    };


    
    /***
     * 设置cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.setPriceData = function(data){
    	localStore.setItem(ls.price_all,data);
    };
    
    /***
     * 获取cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.getPriceData = function(){
    	var data = localStore.getItem(ls.price_all);					//tb_cp 表数据
    	return data;
    };
    
    /***
     * CP id
     * 需求类型ID
     * 需求归档ABC 
     */
    exports.getPriceByIds = function(cp_id,type_id,rating,require_start_date){
    	var data = exports.getPriceData();
    	if(!data) return;
    	var data = data.prices,
            date = exports.dateFormat( new Date(require_start_date),'yyyy-MM-01' );
        // console.info(date,'getPriceByIds',cp_id,type_id,rating)    
    	for(var i in data){
    		if(data[i]['price_cp_id'] == cp_id &&  data[i]['price_type_id'] == type_id && 
               data[i]['price_rating'] == rating &&  data[i]['price_month'] == date){
                console.info('good')
    			return parseFloat(data[i]['price_name']);
    		}
    	};
        return 0;
    };

    

    /***
     * 获取cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.getRankDataById = function(rank_id){
    	var data = localStore.getItem(ls.rank_pre + rank_id);					//tb_cp 表数据
    	return data;
    };
    
    /***
     * 设置cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.setRankDataById = function(rank_id,data){
    	localStore.setItem(ls.rank_pre + rank_id,data);
    };
    
    /***
     * 获取cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.getTypeData = function(){
    	var cp_data = localStore.getItem(ls.type_all);					//tb_cp 表数据
    	return cp_data;
    };
    
    /***
     * 设置cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.setTypeData = function(data){
    	localStore.setItem(ls.type_all,data);
    };
    
    exports.getTypeDataById = function(type_id){
    	var data = localStore.getItem(ls.type_pre + type_id);					//tb_cp 表数据
    	return data;
    };
    
    /***
     * 设置cp缓存数据
 	 * @param {Object} layout_id
     */
    exports.setTypeDataById = function(type_id,data){
    	localStore.setItem(ls.type_pre + type_id,data);
    };
    
    /***
     * 获取user data 信息
 	 * @param {Object} layout_id
     */
    exports.getSingleUserData = function(){
    	var user_data = localStore.getItem(ls.user_single);					//tb_users 表数据
    	return user_data;
    };
    
    
    exports.setSingleUserData = function(data){
    	localStore.setItem(ls.user_single,data);
    };
    
    /***
     * 缓存app信息 
 * @param {Object} data
     */
    exports.setAppData = function(data){
    	//缓存user 信息
		exports.setSingleUserData({users:data.app.user});
		//缓存type 信息
		exports.setTypeData({type:data.app.type});
		//缓存rank 信息
		exports.setRankData({rank:data.app.rank});
		//缓存cp 信息
		exports.setCpData({cp:data.app.cp});
        //缓存rank cate 信息
        exports.setRankCateData({rankcate:data.app.rankcate});
    };
    
    /**
     * 判断是否是第一次登录 
     */
    exports.getFirstLogin = function(){
    	var fcheck = localStore.getItem(ls.first_login);
    	return fcheck;
    };
    
    exports.setFirstLogin = function(){
    	localStore.setItem(ls.first_login,true,365);
    };
    
    exports.clear = function(){
    	localStore.clear();
    };

    /**
     * 设置提交表单的默认值
     * @param data
     */
    exports.setRankRequire = function(data){
        console.info(data,'data')
        localStore.setItem(ls.rank_require_default,data);
    };

    exports.getRankRequire = function(){
        var defaultRank= localStore.getItem(ls.rank_require_default);
        console.log(defaultRank,'defaultRank')
        return defaultRank;
    }
   	
    
});
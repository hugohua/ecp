/***
 * hugohua
 */
define(function(require, exports, module) {
	var $ = require('jquery'), 
		c = require('./ecp.config.user');

	var defaults = {
		dataType : "json"
	};
	
	var initAjax = function(){
		$('body').ajaxStart(function(){
			$(this).append('<div id="js_loading" class="ui_loading"></div>');
		})
		.ajaxStop(function(){
			$("#js_loading").remove();
		})
		.ajaxError(function(){
			$("#js_loading").remove();
		});
		console.info('initAjax')
	};
	initAjax();

	/***
	 * 获取api url
	 * @param {Object} api_name
	 */
	var getUrl = function(api_path) {
		var url = c.root + api_path;
		return url;
	}
	/***
	 *
	 * @param {Object} params
	 * @param {Object} type GET/POST/PUT/DELETE
	 */
	var baseRest = function(params, type) {
		$.extend(params, defaults);
		params.type = type || "GET";
		var jxhr = $.ajax(params);
		return jxhr;
	};
	
	/**
	 * 插入需求数据
	 * @param {Object} data
	 */
	exports.addRequire = function(data) {
		var params = {
			data : data,
			url : getUrl('api/require'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};
	
	/***
	 * 根据 需求ID 获取数据 
	 */
	exports.getRequireById = function(id,params){
		params = params || {};
		params.url = getUrl('api/require/id/' + id);
		return baseRest(params);
	};
	
	/***
	 * 根据 需求ID 获取数据 
	 */
	exports.getRequireBakById = function(id,params){
		params = params || {};
		params.url = getUrl('api/require_bak/id/' + id);
		return baseRest(params);
	};
	
	/**
	 * 修改需求数据
	 * @param {Object} data
	 */
	exports.putRequire = function(data) {
		var require_id = data.require.require_id;
		var params = {
			data : data,
			url : getUrl('api/require/' + require_id),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'PUT');
	};
	
	/**
	 * 根据ID删除需求
	 * @param {Object} data
	 */
	exports.delRequireById = function(require_id,params) {
		params = params || {};
		params.url = getUrl('api/del/require/' + require_id);
		return baseRest(params, 'PUT');
	};
	
	
	/***
	 * 获取一段时间的需求数据  for pdm
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.getRequirePdmByDate = function(start,end,params){
		params = params || {};
		params.url = getUrl('api/require/pdm/' + start + '/' + end);
		return baseRest(params);
	};
	
	
	/***
	 * 获取CP列表 根据cp类型 （可选）
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.getCp = function(cp_type,params){
		console.info(cp_type,'cp_type')
		params = params || {};
		params.url = (typeof(cp_type)=='undefined') ? getUrl('api/cp') : getUrl('api/cp/' + cp_type);
		return baseRest(params);
	};
	
	/***
	 * 更新多行CP记录 待排期状态
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.putCpByIds = function(data){
		var params = {
			data : data,
			url : getUrl('api/require/cp'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};
	
	/**
	 * 获取用户权限
	 */
	exports.getUserPower = function(user,params) {
		params = params || {};
		params.url = getUrl("api/power/" + user);
		return baseRest(params);
	};
	
	/**
	 * 根据用户名 获取 权限信息 及初始化页面所需数据
	 */
	exports.getUserApp = function(user,params) {
		params = params || {};
		params.url = getUrl("api/app/" + user);
		return baseRest(params);
	};
	
	/**
	 * 根据user id 获取用户信息 
	 * @param {Object} user_id
	 * @param {Object} params
	 */
	exports.getUserById = function(user_id,params){
		params = params || {};
		params.url = getUrl("api/user/" + user_id);
		return baseRest(params);
	};
	
	/**
	 * 根据user id 获取用户信息 
	 * @param {Object} user_id
	 * @param {Object} params
	 */
	exports.getUsersByPower = function(power,params){
		params = params || {};
		params.url = getUrl("api/users/" + power);
		return baseRest(params);
	};
	
	/***
	 * 更新多行CP记录 待排期状态
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.putUserByIds = function(data){
		var user_id = data.users.id;
		var params = {
			data : data,
			url : getUrl('api/user/' + user_id)
		};
		return baseRest(params,'PUT');
	};
	

	/***
	 * 获取一段时间 待排期 数据  for pdm
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.getRequireStateType = function(user,power,power_rank,state,type,params){
		params = params || {};
		params.url = getUrl('api/require/list/' + user + '/' + power + '/'+ power_rank + '/' + state + '/' + type);
		return baseRest(params);
	};
	
	/***
	 * 获取一段时间 待排期 数据  for pm bak
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.getRequireBakStateType = function(user,power,power_rank,state,type,params){
		params = params || {};
		params.url = getUrl('api/require_bak/list/' + user + '/' + power + '/'+ power_rank +'/' + state + '/' + type);
		return baseRest(params);
	};
	
	exports.getRequireStateTypeCp = function(user,power,power_rank,state,type,cp_id,params){
		params = params || {};
		params.url = getUrl('api/require/list/' + user + '/' + power + '/'+ power_rank + '/' + state + '/' + type + '/' + cp_id);
		return baseRest(params);
	};
	
	exports.getRequireByIds = function(ids,params){
		params = params || {};
		params.url = getUrl('api/require/list/' + ids);
		return baseRest(params);
	};
	
	exports.getRequireBakByIds = function(ids,params){
		params = params || {};
		params.url = getUrl('api/require_bak/list/' + ids);
		return baseRest(params);
	};
	
	/***
	 * 获取一段时间 待排期 数据  for pdm
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.getRequireByDate = function(user,power,power_rank,state,start,end,params){
		params = params || {};
		params.url = getUrl('api/require/date/' + user + '/' + power + '/' + power_rank + '/' + state + '/'+ start + '/' + end);
		return baseRest(params);
	};
	
	exports.getRequireBakByDate = function(user,power,power_rank,state,start,end,params){
		params = params || {};
		params.url = getUrl('api/require_bak/date/' + user + '/' + power + '/' + power_rank + '/' + state + '/'+ start + '/' + end);
		return baseRest(params);
	};
	
	/***
	 * 批量更新需求状态
 	 * data:{
 	 * 	require:{
 	 * 	 state:1
 	 * 	 ids:1,2,3
 	 * }
 	 * }
	 */
	exports.putCpStateByIds = function(state,data){
		var params = {
			data : data,
			url : getUrl('api/require/state/' + state),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};
	
	/**
	 * 插入需求属性
	 * @param {Object} data
	 */
	exports.addAttribute = function(require_id,data) {
		var params = {
			data : data,
			url : getUrl('api/require/attribute/' + require_id),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};
	
	/**
	 * 根据require_id 获取需求属性
	 * @param {Object} user_id
	 * @param {Object} params
	 */
	exports.getAttributeById = function(require_id,params){
		params = params || {};
		params.url = getUrl("api/require/attribute/" + require_id);
		params.beforeSend = function(){$("#js_loading").remove();}
		return baseRest(params);
	};
	
	/**
	 * 根据require_id 获取需求属性
	 * @param {Object} user_id
	 * @param {Object} params
	 */
	exports.getAttributeBakById = function(require_id,params){
		params = params || {};
		params.url = getUrl("api/require_bak/attribute_bak/" + require_id);
		params.beforeSend = function(){$("#js_loading").remove();}
		return baseRest(params);
	};

	/**
	 * 根据require_id 获取需求属性
	 * @param {Object} user_id
	 * @param {Object} params
	 */
	exports.getAttributeByIds = function(require_ids,params){
		params = params || {};
		params.url = getUrl("api/require/attribute/list/" + require_ids);
		params.beforeSend = function(){$("#js_loading").remove();}
		return baseRest(params);
	};
	
	/**
	 * 根据require_id 获取需求属性
	 * @param {Object} user_id
	 * @param {Object} params
	 */
	exports.getAttributeBakByIds = function(require_ids,params){
		params = params || {};
		params.url = getUrl("api/require_bak/attribute_bak/list/" + require_ids);
		params.beforeSend = function(){$("#js_loading").remove();}
		return baseRest(params);
	};
	
	/***
	 * 更新多行attr记录
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.putAttributes = function(data){
		var params = {
			data : data,
			url : getUrl('api/require/attribute/ids'),
			beforeSend:function(){$("#js_loading").remove();}
		};
		return baseRest(params,'PUT');
	};
	
	/***
	 * 更新广告数
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.putAttributeByAds = function(data){
		var params = {
			data : data,
			url : getUrl('api/require/attribute/ads'),
			beforeSend:function(){$("#js_loading").remove();}
		};
		return baseRest(params,'PUT');
	};
	
	
	/**
	 * 根据ID删除需求
	 * @param {Object} data
	 */
	exports.delAttrById = function(att_id,params) {
		params = params || {};
		params.url = getUrl('api/require/attribute/' + att_id);
		params.beforeSend = function(){$("#js_loading").remove();}
		return baseRest(params, 'DELETE');
	};
	
	/***
	 * 获取 需求概况
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.getSummary = function(user,power,params){
		params = params || {};
		params.url = getUrl('api/require/summary/' + user + '/' + power);
		return baseRest(params);
	};
	
	/**
	 * 插入需求数据
	 * @param {Object} data
	 */
	exports.addCp = function(data) {
		var params = {
			data : data,
			url : getUrl('api/cp'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};
	
	/***
	 * 
	 */
	exports.putCpById = function(data){
		var params = {
			data : data,
			url : getUrl('api/cp'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};
	
	/***
	 * 获取所有CP列表
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} params
	 */
	exports.getType = function(params){
		params = params || {};
		params.url = getUrl('api/type');
		return baseRest(params);
	};
	
	/**
	 * 插入需求数据
	 * @param {Object} data
	 */
	exports.addType = function(data) {
		var params = {
			data : data,
			url : getUrl('api/type'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};
	
	/***
	 * 
	 */
	exports.putTypeById = function(data){
		var params = {
			data : data,
			url : getUrl('api/type'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};
	
	/***
	 * 获取所有CP列表
	 */
	exports.getRank = function(params){
		params = params || {};
		params.url = getUrl('api/rank');
		return baseRest(params);
	};
	
	/**
	 * 插入需求数据
	 * @param {Object} data
	 */
	exports.addRank = function(data) {
		var params = {
			data : data,
			url : getUrl('api/rank'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};
	
	/***
	 * 
	 */
	exports.putRankById = function(data){
		var params = {
			data : data,
			url : getUrl('api/rank'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};
	
	/***
	 * 获取所有CP列表
	 */
	exports.getPrice = function(date,params){
		params = params || {};
		params.url = (typeof(date)!==undefined) ? getUrl('api/price/'+ date) : getUrl('api/price');
		
		return baseRest(params);
	};
	
	/**
	 * 仅获取价格 
	 */
	exports.getOnlyPrice = function(date,params){
		params = params || {};
		params.url = (typeof(date)!='undefined') ? getUrl('api/onily/price/'+ date) : getUrl('api/onily/price');
		return baseRest(params);
	}
	
	/**
	 * 插入需求数据
	 * @param {Object} data
	 */
	exports.addPrices = function(data) {
		var params = {
			data : data,
			url : getUrl('api/prices'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};
	
	exports.putPrices = function(data){
		var params = {
			data : data,
			url : getUrl('api/prices'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};

	/**
	 * 插入修改价格数据
	 * @param {Object} data
	 */
	exports.addEditPrices = function(data) {
		var params = {
			data : data,
			url : getUrl('api/editprices'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};


    /**
     * 批量更新价格数据
     * @param {Object} data
     */
    exports.updateEditPrices = function(data) {
        var params = {
            data : data,
            url : getUrl('api/editprices'),
            success : function(t_data){
                if(t_data.error){
                    alert(t_data.error.text);
                }
            }
        };
        return baseRest(params, 'PUT');
    };



    /**
     * 根据日期获取修改供应商的列表
     * @param date
     * @param params
     * @returns {*}
     */
    exports.getEditPriceByDate = function(date,params){
        params = params || {};
        params.url = getUrl('api/editprices/date/'+ date);
        return baseRest(params);
    }
	
	exports.putEditPrices = function(data){
		var params = {
			data : data,
			url : getUrl('api/editprices'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};

    exports.getEditPriceDates = function(params){
        params = params || {};
        params.url = getUrl('api/editprices/dates');
        return baseRest(params);
    };

    /**
     * 审核通过
     * @param data
     * @returns {*}
     */
    exports.putCheckByDate = function(data){
        var params = {
            data : data,
            url : getUrl('api/editprices/check'),
            success : function(t_data){
                if(t_data.error){
                    alert(t_data.error.text);
                }
            }
        };
        return baseRest(params,'PUT');
    };

    /**
     * 财务确认 批量更新价格
     * @param data
     * @returns {*}
     */
    exports.putPriceConfirm = function(data){
        var params = {
            data : data,
            url : getUrl('api/prices/check/confirm'),
            success : function(t_data){
                if(t_data.error){
                    alert(t_data.error.text);
                }
            }
        };
        return baseRest(params,'PUT');
    }

	
	/**
	 * 插入需求数据
	 * @param {Object} data
	 */
	exports.addUser = function(data) {
		var params = {
			data : data,
			url : getUrl('api/user')
		};
		return baseRest(params, 'POST');
	};
	
	/***
	 * 发送RTX消息
	 * data = {
	 *		title:"RTX标题",
	 *		receiver:"接收方",
	 *		msginfo:"信息主体"
	 *	}
	 */
	exports.sendRtxMsg = function(data) {
		var params = {
			data : {
				data : data
			},
			url : getUrl("api/send_msg.php?act=sendrtx")
		};
		return baseRest(params, "POST");
	};
	/***
	 * 发送Email消息
	 * data = {
	 *		subject:"subject",  //主题
	 *		sender:		//发送者
	 *		receiver:receivers,			//接受者
	 *		msg:content	//内容
	 *	}
	 */
	exports.sendEmail = function(data) {
		var url = getUrl("api/send_msg.php?act=sendemail");
		// if(location.hostname.indexOf(c.yixun) !== -1){
			// url = getUrl("api/send_msg.php?act=sendmailer");
		// }
		var params = {
			data : {
				data : data
			},
			url : url
		};
		return baseRest(params, "POST");
	};
	
	/**
	 * 搜索需求数据
	 * @param {Object} data
	 */
	exports.searchRequire = function(data) {
		var params = {
			data : data,
			url : getUrl('api/search/require'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params, 'POST');
	};
	
	/**
	 * 导出excel数据
	 * @param {Object} data
	 */
	exports.exportRequire = function(data) {
		var params = {
			data : data,
			url : getUrl('api/download_excel.php')
		};
		return baseRest(params, 'POST');
	};
	
	/**
	 * 导出excel数据 用于付费系统对接
	 * @param {Object} data
	 */
	exports.exportRequirePay = function(data) {
		var params = {
			data : data,
			url : getUrl('api/download_excel_pay.php')
		};
		return baseRest(params, 'POST');
	};
	
	/**
	 * 导出excel数据
	 * @param {Object} data
	 */
	exports.exportRankData = function(data) {
		var params = {
			data : data,
			url : getUrl('api/download_excel_rank.php')
		};
		return baseRest(params, 'POST');
	};

	/**
	 * 导出excel数据
	 * @param {Object} data
	 */
	exports.exportCpData = function(data) {
		var params = {
			data : data,
			url : getUrl('api/download_excel_cp.php')
		};
		return baseRest(params, 'POST');
	};

	/**
	 * 导出excel数据
	 * @param {Object} data
	 */
	exports.exportCpWaiData = function(data) {
		var params = {
			data : data,
			url : getUrl('api/download_excel_cpwai.php')
		};
		return baseRest(params, 'POST');
	};
	
	/**
	 * 获取本周需求数
	 * @param {Object} data
	 */
	exports.checkReqType = function(start,end,params) {
		params = params || {};
		params.url = getUrl('api/check/require/type/' + start + '/' + end + '?=' + new Date().getTime());
		return baseRest(params);
	};

	/**
	 * 清除下周临时需求
	 * @param {Object} data
	 */
	exports.clearNextTempRequire = function(params) {
		var params = {
			data : {
				type:1
			},
			url : getUrl('api/change/require/type/next'),
			success : function(t_data){
				if(t_data.error){
					alert(t_data.error.text);
				}
			}
		};
		return baseRest(params,'PUT');
	};
	
	/**
	 * 获取本周需求数
	 * @param {Object} data
	 */
	exports.backupReqData = function(ids,params) {
		params = params || {};
		params.url = getUrl('api/require_bak/' + ids);
		return baseRest(params, 'POST');
	};
	
	/**
	 * 根据需求类型 获取数量
	 * @param {Object} data
	 */
	exports.getCountByState = function(state,params) {
		params = params || {};
		params.url = getUrl('api/require/summary/' + state);
		return baseRest(params);
	};
	
	/**
	 * 根据需求类型 获取数量
	 * @param {Object} data
	 */
	exports.getCountBakByState = function(state,params) {
		params = params || {};
		params.url = getUrl('api/require/summary_bak/' + state);
		return baseRest(params);
	};
	
	/**
	 * 下载设计稿
	 * @param {Object} data
	 */
	exports.downDesginZip = function(ids,excel,params) {
		params = params || {};
		params.url = getUrl('api/zip.php?ids=' + ids + '&excel=' + excel);
		return baseRest(params);
	};
	
	/**
	 * 检测用户登录 
 * @param {Object} params
	 */
	exports.checkLogin = function(params){
		params = params || {};
		params.url = getUrl('api/checkuser');
		return baseRest(params, 'POST');
	};
	
	/**
	 * 根据用户名 获取邮箱
	 * @param {Object} data
	 */
	exports.getUserInfoByName = function(user_name,params) {
		params = params || {};
		params.url = getUrl('api/userinfo/' + user_name);
		return baseRest(params);
	};
	
	exports.deleteFile = function(require_id,filename,params){
		params = params || {};
		params.url = getUrl('api/delete/' + require_id + '/' + filename);
		return baseRest(params, 'DELETE');
	};
	
	/**
	 * 数据统计 
	 * s_type: 统计类型
	 * date : 日期
	 */
	exports.statisticsByDate = function(s_type,start,end,rank_id,params){
		rank_id = rank_id || 0;
		params = params || {};
		params.url = getUrl('api/statistics/' + s_type + '/' + start  + '/' + end + '/' + rank_id );
		return baseRest(params);
	};

	exports.getCpPrices = function(start,end,params){
		params = params || {};
		params.url = getUrl('api/statistics/cpprice' + '/' + start  + '/' + end);
		return baseRest(params);
	};
	
	/**
	 * 判断是否是内部PM 和 外包PM 
	 */
	exports.checkPowerPm = function(){
		$.ajax({
			url:'http://et.oa.com/api/user/getpm'
		})
	};
	
	/**
	 * 获取远程易讯服务器图片 
 * @param {Object} $img_url
	 */
	exports.sysIcsonImg = function(require_id,img_url){
		$.get('api/get_img.php?id=' + require_id + '&url=' + img_url);
	};
	
	/**
	 * 获取上月待评分状态需求数
	 * @param {Object} data
	 */
	exports.statisticsRankByDate = function(start,end,params) {
		params = params || {};
		params.url = getUrl('api/statistics/rank2/type/' + start  + '/' + end );
		return baseRest(params);
	};

	/**
	 * 获取上月待评分状态需求数
	 * @param {Object} data
	 */
	exports.statisticsCpByDate = function(start,end,params) {
		params = params || {};
		params.url = getUrl('api/statistics/cp2/type/' + start  + '/' + end );
		return baseRest(params);
	};

	/**
	 * 获取上月待评分状态需求数
	 * @param {Object} data
	 */
	exports.checkStatePdm = function(name,params) {
		params = params || {};
		params.url = getUrl('api/check/require/pdm/' + name);
		return baseRest(params);
	};

	/***
	 * 获取CP价格
 	 * @param {Object} start
 	 * @param {Object} end
 	 * @param {Object} type cp类型
 	 * @param {Object} params
	 */
	exports.getCpPrice = function(start,end,type,params){
		params = params || {};
		params.url = (typeof(cp_type) =='undefined') ? getUrl('api/cp/price/' + start  + '/' + end) 
													 : getUrl('api/cp/price/' + start  + '/' + end + '/' + type );
		return baseRest(params);
	};

    /***
     * 根据rank id 获取归类的子分类
     */
    exports.getRankCateById = function(id,params){
        params = params || {};
        params.url = getUrl('api/rankcate/id/' + id);
        return baseRest(params);
    };

    /***
     * 获取全部归类的子分类
     */
    exports.getRankCate = function(params){
        params = params || {};
        params.url = getUrl('api/rankcate');
        return baseRest(params);
    };

    /***
     * 获取全部归类的子分类
     */
    exports.putRankCateById = function(id,data){
        var params = {
            data : data,
            url : getUrl('api/rankcate/id/' + id),
            success : function(t_data){
                if(t_data.error){
                    alert(t_data.error.text);
                }
            }
        };
        return baseRest(params,'PUT');
    };

    /***
     * 删除
     */
    exports.delRankCateById = function(id,params){
        params = params || {};
        params.url = getUrl("api/rankcate/id/" + id);
        return baseRest(params,'DELETE');
    };

    /***
     * 新增
     */
    exports.addRankCate = function(data){
        var params = {
            data : data,
            url : getUrl('api/rankcate'),
            success : function(t_data){
                if(t_data.error){
                    alert(t_data.error.text);
                }
            }
        };
        return baseRest(params, 'POST');
    };


    /**
     * 获取所有已删除需求
     * @param type
     * @returns {*}
     */
    exports.getRequireByDel = function(type,params){
        params = params || {};
        params.url = getUrl('api/require/del/' + type);
        return baseRest(params);
    };

    /***
     * 更新多行CP记录 待排期状态
     * @param {Object} start
     * @param {Object} end
     * @param {Object} params
     */
    exports.changePassword = function(data){
        var params = {
            data : data,
            url : getUrl('api/password')
        };
        return baseRest(params,'PUT');
    };
	
})
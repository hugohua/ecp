/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		UserInfo = require('./ecp.user.info'),
		ReqFun = require('./ecp.require.func');
	
	require('jquery.tablesorter')($);	
	
	var initData = function(){
		var power = Fun.getUrlParam('p') || 10,
			$a = $('#js_filter_type a[data-power="'+ power +'"]');
		$a.addClass('current');
		$('#js_user_type').text( $a.text() );
		getUserListData(power);
		$('#js_add_user_btn').attr('data-power',power);
	};
	
	/**
	 * 获取用户列表 
	 */
	var getUserListData = function(power){
		RestApi.getUsersByPower(power).success(function(data){
			listUser(power,data);
		})
	};
	
	/**
	 * 修改data数据 
	 */
	var changeData = function(data){
		for (var i in data.users){
			if(!data.users[i].full_name){
				data.users[i].full_name = data.users[i].english_name;
			}
			if(data.users[i].department_id == 1000){
				data.users[i].department_name = "易迅";
			}
    	};
    	return data;
	};
	
	var listUser = function(power,data){
		var tpl = $('#js_list_tmpl_' + power).html(),
			listHtml = Mustache.to_html(tpl,changeData(data));
			console.info(data,'changedata')
		$('tbody','#js_list_table_' + power).html(listHtml).parent().show().siblings('table').hide();
		$(".js_tablesorter").trigger("update", [true]); 
		
	};
	
	/**
	 * 删除最后字符 
	 */
	var removeLastChart = function(str){
		var str = str.replace(";", "");
		return str;
	};
	
	/**
	 * 清除表单 
	 */
	var clearForm = function(){
		$('#js_form input').val('');
	};
	
	/**
	 * 新增CP到表格 
 	 * @param {Object} data
	 */
	var addUserToTable = function(data){
		var power = data.users.user_power;
		var tpl = $('#js_list_tmpl_' + power).html(),
			listHtml = Mustache.to_html(tpl,data);
		$('tbody','#js_list_table_' + power).append(listHtml);
		$(".js_tablesorter").trigger("update", [true]); 
	};
	
	/**
	 * 获取用户信息 
	 */
	var getUserInfo = function(){
		var e_name = removeLastChart($('#js_user_name').val());
		var obj = {
			users:{
				full_name:$('#js_user_nameValue').val(),
				login_name:e_name,
				english_name:e_name,
				user_email:e_name,
				user_power:$('#js_add_user_btn').attr('data-power')
			}
		};
		return obj;
	};
	
	
	var Events = {
		filterUser:function(){
			$('#js_filter_type a').on('click',function(){
				var $this = $(this),
					power = parseInt($this.attr('data-power'));
				$this.addClass('current').siblings().removeClass('current');
				Fun.setUrlParam("p",power);
				$('#js_user_type').text( $this.text() );
				$('#js_add_user_btn').attr('data-power',power);
				getUserListData(power);	
				return false;
			})
		},
		/**
		 * 添加用户 
		 */
		addUser:function(){
			$('#js_add_user_btn').on('click',function(){
				var obj = getUserInfo();
				if($('#js_user_name').val()){
					RestApi.addUser(obj).success(function(data){
						if(data && data.users){
							console.info(data);
							addUserToTable(data)
							Fun.alert(1,'添加用户成功！')
						}else{
							Fun.alert(0,'用户已存在 无需再次添加！');
						};
						clearForm();
					});
				}else{
					Fun.alert(0,'请输入公司内的用户！');
				}
			});
		},
		updateUser:function(){
			$('#js_update_btn').on('click',function(){
				
			});
		},
		checkBox:function(){
			$('#js_admin_list').on('change','input[type="checkbox"]')
		},
		/**
		 * 修改用户权限 
		 */
		changePower:function(){
			$('#js_admin_list').on('change','.js_change_power',function(){
				var $this = $(this),
					obj = {
					users:{
						user_power:$this.getValue(),
						id:$this.attr('data-id')
					}
				};
				RestApi.putUserByIds(obj).success(function(data){
					$this.closest('tr').remove();
					Fun.alert(1,'修改权限成功！');
				})
			});
		},
		init:function(){
			this.filterUser();
			this.addUser();
			this.changePower();
			// this.tableSorter();
		}
	};
	
	var getUserPower = function(){
		var user = Fun.getUserName();
		if(!user){
			window.location = 'index.php';
			return;
		};
		
		RestApi.getUserPower(user).success(function(data){
			if(data && data.users){
				var power = parseInt(data.users.user_power,10);
				//产品经理视图  或者管理员
				if(power === 40){
					initData();
					Events.init();
					//设置登录信息 和 退出事件
					UserInfo.init();
					Fun.navLink(power);
					$('.js_tablesorter').tablesorter()
				}else{
					window.location = 'error.html';
				};;
			};
		});
	}
	
	exports.init = function(){
		getUserPower();
		//Events.init();
	};
	
	
});

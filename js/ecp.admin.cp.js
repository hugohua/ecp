/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		Mustache = require('mustache'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		UserInfo = require('./ecp.user.info'),
		localStore = require('./ecp.localstore');
	
	require('jquery.ui')($);
	
	/**
	 * 二次重组数据 
	 */
	var changeData = function(data){
		for(var i in data.cp){
			localStore.setCpDataById(data.cp[i].cp_id,data.cp[i]);
			console.info(data.cp[i].cp_id,data.cp[i])
		};
		return data;
	}
	
	var listCp = function(){
		RestApi.getCp().success(function(data){
			var tpl = $('#js_list_tmpl').html(),
			listHtml = Mustache.to_html(tpl,changeData(data));
			$('tbody','#js_list_table').html(listHtml);
		});
	};
	
	/**
	 *  获取cp数据
	 */
	var getCpData = function(){
		var data = {
			cp:{
				cp_name:$('#js_cp_name').val(),
				cp_phone:$('#js_cp_phone').val(),
				cp_email:$('#js_cp_email').val(),
				cp_qq:$('#js_cp_qq').val(),
				cp_city:$('#js_cp_city').val(),
				cp_contract:$('#js_cp_contract').val(),
				cp_contract_link:$('#js_cp_contract_link').val(),
				cp_id:$('#js_edit_cp_btn').attr('data-id')
			}
		};
		return data;
	};
	
	/**
	 * 设置CP数据 
 	 * @param {Object} data
	 */
	var setCpData = function(data){
		$('#js_cp_name').val(data.cp_name);
		$('#js_cp_phone').val(data.cp_phone);
		$('#js_cp_email').val(data.cp_email);
		$('#js_cp_qq').val(data.cp_qq);
		$('#js_cp_city').val(data.cp_city);
		$('#js_edit_cp_btn').attr('data-id',data.cp_id);
		$('#js_cp_contract').val(data.cp_contract);
		$('#js_cp_contract_link').val(data.cp_contract_link)
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
	var addCpToTable = function(data){
		console.info(data)
		var tpl = $('#js_list_tmpl').html(),
			listHtml = Mustache.to_html(tpl,data);
		$('tbody','#js_list_table').append(listHtml);
	};
	
	/**
	 * 更新表格 
 * @param {Object} data
	 */
	var updateToTable = function(data){
		var data = data.cp;
		console.info(data,$('#js_list_table tbody tr[data-id="'+ data.cp_id +'"]'))
		var $tr = $('#js_list_table tbody tr[data-id="'+ data.cp_id +'"]');
		$tr.find('.js_cp_name').text(data.cp_name);
		$tr.find('.js_cp_phone').text(data.cp_phone);
		$tr.find('.js_cp_qq').text(data.cp_qq);
		$tr.find('.js_cp_email').text(data.cp_email);
		$tr.find('.js_cp_city').text(data.cp_city);
		$tr.find('.js_cp_contract').text(data.cp_contract);
		$tr.find('.js_cp_contract_link').text(data.cp_contract_link);
		$tr.effect("highlight",1000);
	};
	
	var Events = {
		addCp:function(){
			$('#js_add_cp_btn').on('click',function(){
				var obj = getCpData(),
					validate = Fun.validate('#js_form');
				delete obj.cp.cp_id;	
				if(validate){
					RestApi.addCp(obj).success(function(data){
						// clearForm();
						addCpToTable(data);
						Fun.alert(1,'新增CP成功！');
						// console.info(data)
					})
				}else{
					Fun.alert(0,'所有输入框不能为空!');
				}
				
			});
		},
		editCp:function(){
			//show
			$('#js_list_table').on('click','.js_edit',function(){
				var $this = $(this),
					cp_id = $this.attr('data-id'),
					cp_data = localStore.getCpDataById(cp_id);
				setCpData(cp_data);
				$('#js_edit_cp_btn').show();
				$('#js_add_cp_btn').hide();
				console.info(cp_data);
				return false;	
			});
			//edit
			$('#js_edit_cp_btn').on('click',function(){
				var $this = $(this),
					obj = getCpData(),
					validate = Fun.validate('#js_form');
				if(validate){
					RestApi.putCpById(obj).success(function(data){
						clearForm();
						updateToTable(data);
						localStore.setCpDataById(data.cp.cp_id,data.cp);
						$('#js_edit_cp_btn').hide();
						$('#js_add_cp_btn').show();
						// console.info(data)
					})
				}else{
					Fun.alert(0,'所有输入框不能为空!');
				}	
			});
		},
		delCp:function(){
			$('#js_list_table').on('click','.js_del',function(){
				var $this = $(this),
					cp_id = $this.attr('data-id');
				if(confirm('确定要删除这个CP吗？删除后无法恢复')){
					var obj = {
						cp:{
							cp_id:cp_id,
							cp_state:0
						}
					}
					RestApi.putCpById(obj).success(function(data){
						$this.closest('tr').hide('highlight',function(){
							$(this).remove();
						})
					})
				};	
			});
		},
		init:function(){
            //初始化
            for(var i in this) {
                if (this.hasOwnProperty(i) && i !== 'init') {
                    this[i]();
                }
            }
		}
	}
	
	var getUserPower = function(){
		var user = Fun.getUserName();
		if(!user){
			window.location = 'index.php';
			return;
		};
		
		RestApi.getUserPower(user).success(function(data){
			if(data && data.users){
				var power = parseInt(data.users.user_power,10);
				// 者管理员
				if(power === 40){
					listCp();
					Events.init();
					//设置登录信息 和 退出事件
					UserInfo.init();
					Fun.navLink(power);
				}else{
					window.location = 'error.html';
				};
			};
		});
	}
	
	exports.init = function(){
		getUserPower();
		//Events.init();
	};
	
	
});

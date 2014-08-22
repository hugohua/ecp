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
		for(var i in data.type){
			var check = data.type[i]['type_check'],
				num = data.type[i]['type_show_num'];
			localStore.setTypeDataById(data.type[i].type_id,data.type[i]);
			data.type[i]['type_check_' + check] = true;
			data.type[i]['type_show_num_' + num] = true;
		};
		return data;
	};
	
	var listType = function(){
		RestApi.getType().success(function(data){
			var tpl = $('#js_list_tmpl').html(),
			listHtml = Mustache.to_html(tpl,changeData(data));
			$('tbody','#js_list_table').html(listHtml);
		});
	};
	
	/**
	 *  获取cp数据
	 */
	var getTypeData = function(){
		var data = {
			type:Fun.getDbData('#js_form')
		};
		return data;
	};
	
	/**
	 * 设置CP数据 
 	 * @param {Object} data
	 */
	var setTypeData = function(data){
		Fun.setDbData(data,'#js_form');
	};
	
	/**
	 * 清除表单 
	 */
	var clearForm = function(){
		$('#js_form :input').clearForm();
	};
	
	/**
	 * 新增CP到表格 
 	 * @param {Object} data
	 */
	var addTypeToTable = function(data){
		data.type['type_check_' + data.type.type_check] = true;
		var tpl = $('#js_list_tmpl').html(),
			listHtml = Mustache.to_html(tpl,data);
		$('tbody','#js_list_table').append(listHtml);
	};
	
	/**
	 * 更新表格 
 * @param {Object} data
	 */
	var updateToTable = function(data){
		var data = data.type;
		var $tr = $('#js_list_table tbody tr[data-id="'+ data.type_id +'"]');
		$tr.find('.js_type_name').text(data.type_name);
		$tr.find('.js_type_check').attr('data-check',data.type_check).text(changeText(data.type_check));
		$tr.find('.js_type_show_num').attr('data-num',data.type_show_num).text(changeText(data.type_show_num));
		$tr.effect("highlight",1000);
	};
	
	var changeText = function(check){
		var text = '否';
		if(check === '1'){
			text = '是';
		};
		return text;
	};
	
	var Events = {
		addType:function(){
			$('#js_add_type_btn').on('click',function(){
				var obj = getTypeData(),
					validate = Fun.validate('#js_form');
				delete obj.type.type_id;	
				if(validate){
					RestApi.addType(obj).success(function(data){
						clearForm();
						addTypeToTable(data);
						Fun.alert(1,'新增需求类型成功！');
					})
				}else{
					Fun.alert(0,'所有输入框不能为空!');
				}
				
			});
		},
		editType:function(){
			//show
			$('#js_list_table').on('click','.js_edit',function(){
				var $this = $(this),
					type_id = $this.attr('data-id'),
					type_data = localStore.getTypeDataById(type_id);
				setTypeData(type_data);
				$('#js_edit_type_btn').show();
				$('#js_add_type_btn').hide();
				console.info(type_data);
				return false;	
			});
			//edit
			$('#js_edit_type_btn').on('click',function(){
				var $this = $(this),
					obj = getTypeData(),
					validate = Fun.validate('#js_form');
				if(validate){
					RestApi.putTypeById(obj).success(function(data){
						clearForm();
						updateToTable(data);
						localStore.setTypeDataById(data.type.type_id,data.type);
						$('#js_edit_type_btn').hide();
						$('#js_add_type_btn').show();
						// console.info(data)
					})
				}else{
					Fun.alert(0,'所有输入框不能为空!');
				}	
			});
		},
		delType:function(){
			$('#js_list_table').on('click','.js_del',function(){
				var $this = $(this),
					type_id = $this.attr('data-id');
				if(confirm('确定要删除这个需求类型吗？删除后无法恢复')){
					var obj = {
						type:{
							type_id:type_id,
							type_state:0
						}
					}
					RestApi.putTypeById(obj).success(function(data){
						$this.closest('tr').hide('highlight',function(){
							$(this).remove();
						})
					})
				};	
			});
		},
		init:function(){
			this.addType();
			this.editType();
			this.delType();
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
					listType();
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

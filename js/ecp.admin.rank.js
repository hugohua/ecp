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
		for(var i in data.rank){
			localStore.setRankDataById(data.rank[i].rank_id,data.rank[i]);
			console.info(data.rank[i].rank_id,data.rank[i])
		};
		return data;
	}
	
	var listRank = function(){
		RestApi.getRank().success(function(data){
			var tpl = $('#js_list_tmpl').html(),
			listHtml = Mustache.to_html(tpl,changeData(data));
			$('tbody','#js_list_table').html(listHtml);
		});
	};
	
	/**
	 *  获取cp数据
	 */
	var getRankData = function(){
		var data = {
			rank:Fun.getDbData('#js_form')
		};
		return data;
	};
	
	/**
	 * 设置CP数据 
 	 * @param {Object} data
	 */
	var setRankData = function(data){
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
	var addRankToTable = function(data){
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
		var data = data.rank;
		var $tr = $('#js_list_table tbody tr[data-id="'+ data.rank_id +'"]');
		Fun.updateView(data,$tr);
		$tr.effect("highlight",1000);
	};
	
	var Events = {
		addRank:function(){
			$('#js_add_rank_btn').on('click',function(){
				var obj = getRankData(),
					validate = Fun.validate('#js_form');
				delete obj.rank.rank_id;	
				console.info(obj)
				if(validate){
					RestApi.addRank(obj).success(function(data){
						clearForm();
						addRankToTable(data);
						Fun.alert(1,'新增需求类型成功！');
						// console.info(data)
					})
				}else{
					Fun.alert(0,'所有输入框不能为空!');
				}
				
			});
		},
		editRank:function(){
			//show
			$('#js_list_table').on('click','.js_edit',function(){
				var $this = $(this),
					rank_id = $this.attr('data-id'),
					rank_data = localStore.getRankDataById(rank_id);
				setRankData(rank_data);
				$('#js_edit_rank_btn').show();
				$('#js_add_rank_btn').hide();
				console.info(rank_data);
				return false;	
			});
			//edit
			$('#js_edit_rank_btn').on('click',function(){
				var $this = $(this),
					obj = getRankData(),
					validate = Fun.validate('#js_form');
				if(validate){
					RestApi.putRankById(obj).success(function(data){
						clearForm();
						updateToTable(data);
						localStore.setRankDataById(data.rank.rank_id,data.rank);
						$('#js_edit_rank_btn').hide();
						$('#js_add_rank_btn').show();
						// console.info(data)
					})
				}else{
					Fun.alert(0,'所有输入框不能为空!');
				}	
			});
		},
		delRank:function(){
			$('#js_list_table').on('click','.js_del',function(){
				var $this = $(this),
					rank_id = $this.attr('data-id');
				if(confirm('确定要删除这个需求类型吗？删除后无法恢复')){
					var obj = {
						rank:{
							rank_id:rank_id,
							rank_state:0
						}
					}
					RestApi.putRankById(obj).success(function(data){
						$this.closest('tr').hide('highlight',function(){
							$(this).remove();
						})
					})
				};	
			});
		},
		init:function(){
			this.addRank();
			this.editRank();
			this.delRank();
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
					listRank();
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

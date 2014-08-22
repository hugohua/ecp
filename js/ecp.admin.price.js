/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		c = require('./ecp.config.user'),
		UserInfo = require('./ecp.user.info'),
		localStore = require('./ecp.localstore');
	
	require('jquery.ui')($);
	
	$price_date = $('#js_price_date');

	var listData = function(date){
		// debugger;
		RestApi.getPrice(date).success(function(data){
			drawHeader(data);
			drawBody(data);
			showData(data);
			//设置URL参数
			setUrlParam(date);
			
		});
	};
	
	
	/**
	 * 创建表头 
 * @param {Object} data
	 */
	var drawHeader = function(data){
		//先创建行
		var tdata = data.prices.type,
			t_name ='<th>供应商名称</th>';
		
		for(var i in tdata){
			t_name += '<th>'+ tdata[i]['type_name'] +'</th>';
		};
		t_name += '<th>固定费用</th>';
		$('#js_list_table thead').html(t_name);
	};
	
	var drawBody = function(data){
		var tdata = data.prices.type,
			t_length = tdata.length,		//列数
			cdata = data.prices.cp,
			c_length = cdata.length;		//行数
		//rows:行数
	 	//* cols:列数
	 	var body = '';
		for (var r = 0; r < c_length; r++) {
            //var trow = $("<tr>");
            var trow = '<tr><td>'+ cdata[r]['cp_name'] + '<br /><a href="'+ cdata[r]['cp_contract_link']  +'" target="_blank">'+ cdata[r]['cp_contract']  +'</a>' +'</td>';
            //循环输出列
            for (var c = 0; c < t_length; c++) {
            	var input = '';
            	//是否需要打分
            	if(tdata[c]['type_check'] == 1){
            		input += '<label class="bg_price">A:<input data-type="insert" type="text" id="js_'+ tdata[c]['type_id'] + cdata[r]['cp_id'] +'_A" data-price-rating="A" data-cp-id="'+ cdata[r]['cp_id'] +'" data-type-id="'+ tdata[c]['type_id'] +'" /></label>';
	            	input += '<label class="bg_price">B:<input data-type="insert" type="text" id="js_'+ tdata[c]['type_id'] + cdata[r]['cp_id'] +'_B" data-price-rating="B" data-cp-id="'+ cdata[r]['cp_id'] +'" data-type-id="'+ tdata[c]['type_id'] +'" /></label>';
	            	input += '<label class="bg_price">C:<input data-type="insert" type="text" id="js_'+ tdata[c]['type_id'] + cdata[r]['cp_id'] +'_C" data-price-rating="C" data-cp-id="'+ cdata[r]['cp_id'] +'" data-type-id="'+ tdata[c]['type_id'] +'" /></label>';
            	}else{
            		input += '<p><input data-type="insert" type="text" id="js_'+ tdata[c]['type_id'] + cdata[r]['cp_id'] +'_B" data-price-rating="B" data-cp-id="'+ cdata[r]['cp_id'] +'" data-type-id="'+ tdata[c]['type_id'] +'" /></p>';
            	}
            	
            	trow += '<td>'+ input +'</td>'
            }
            //最后一列 固定费用
            //由于固定费用不涉及需求类型和归类，则需求类型默认给为0，归类为H
            trow += '<td><p><input data-type="insert" type="text" id="js_0'+ cdata[r]['cp_id'] +'_H" data-type-id="0" data-price-rating="H" data-cp-id="'+ cdata[r]['cp_id'] +'" data-cp-type="'+ cdata[r]['cp_type'] +'" /></p></td>'
            trow += '</tr>';
            body += trow;
        };
        $('#js_list_table tbody').html(body);
	};
	
	var showData = function(data){
		var price = data.prices.price;
		for(var i in price){
			// console.info(price[i]['price_name'])
			$('#js_'+ price[i]['price_type_id'] + price[i]['price_cp_id'] +'_' + price[i]['price_rating'] ).attr({
				'data-type':'update',
				'data-id':price[i]['price_id'],
				'data-old':price[i]['price_name']
			})
			.val( price[i]['price_name'] );
		}
	};
	
	var getPriceData = function(){
		var arr_i = [],	//插入数据
			arr_u = [];//更新数据

		//更新有修改的数据 输入框有变化后更新	
		$('#js_list_table').find('tbody tr input').each(function(){
			var $input = $(this),
				type = $input.attr('data-type'),
				price_type_id = $input.attr('data-type-id'),
				price_cp_id = $input.attr('data-cp-id'),
				price_rating = $input.attr('data-price-rating'),
				price_name = $input.val(),
				price_month = $('#js_price_date').val() + '-01';//组成日期格式yyy-mm-dd
			//输入框没有数据的话 跳过
			if(price_name){
				//新增 type === 'insert'
                //TODO: 如果要新增价格 则将if语句改成true即可  新增完后 记得 改 type === 'insert'
				if(type === 'insert'){
					arr_i.push({
						price_type_id:price_type_id,
						price_cp_id:price_cp_id,
						price_name:price_name,
						price_rating:price_rating,
						price_month:price_month
					});
				}else{
					//更新
					arr_u.push({
						price_type_id:price_type_id,
						price_cp_id:price_cp_id,
						price_name:price_name,
						price_rating:price_rating,
						price_id:$input.attr('data-id'),
						price_month:price_month
					});
				};
			};//price_name
		});
		var obj = {
			insert:arr_i,
			update:arr_u
		};
		return obj;
	}
	
	var Events = {
		save:function(){
			$('.js_save_btn').on('click',function(){
				var obj = getPriceData(),
					i_length = obj.insert.length;
					u_length = obj.update.length;
				//插入	
				if(i_length){
					var obj_i = {
						price:obj.insert
					};
					RestApi.addPrices(obj_i).success(function(data){
						console.info(data)
					});
				};
				//更新	
				if(u_length){
					var obj_u = {
						price:obj.update
					};
					RestApi.putPrices(obj_u).success(function(data){
						console.info(data)
					});
				};
				Fun.alert(1,'价格已保存！');
				
			});
		},
		change:function(){
			$('#js_list_table').on('input','input',function(){
				var $this = $(this),
					val = $this.val();
				if(val){
					$(this).addClass('js_edit');
				}else{
					$(this).removeClass('js_edit');
				}	
			});
		},

		/**
		 * 查看供应商报价
		 */
		viewPrice:function(){
			$('#js_price_btn').on('click',function(){
				var date = $price_date.val() + '-01'; //yyy-MM-dd
				listData(date);
			})
		},

		init:function(){
			this.save();
			this.change();
			this.viewPrice();
		}
	};
	
	var checkPower = function(url_power,real_power){
		if(url_power == 50){
			$('#js_list_table input').prop('disabled',true);
			$('.js_save_btn').hide();
			$('#js_confirm_btn').show().one('click',function(){
				if(real_power == 50){
					var user = Fun.getUserName(),
						$this = $(this);
					if(confirm('您确定这些价格没有问题吗？')){
						RestApi.sendRtxMsg({
							title:'ECP财务价格确认提醒',
							receiver:c.pm_list,
							msginfo:user + '提醒您，CP价格已确认，请登录：'+ c.root +' 查看'
						}).success(function(){
							alert('价格已确认！');
							$this.remove();
						});
					};
				}else{
					Fun.alert(0,'您没有财务权限，无法进行确认操作!')
				}
			});
		};
	};

	/**
	 * 设置URL参数  和下载链接参数
	 */
	var setUrlParam = function(date){
		Fun.setUrlParam('date',date);
		var vdate = Fun.dateFormat(new Date(date),'yyyy-MM')
		$price_date.val(vdate);
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
				// 者管理员  财务人员
				if(power === 40 || power === 50){
					var date = Fun.getUrlParam('date') || Fun.getMonthStartDate();
					var _power = Fun.getUrlParam('power') || power;
//					checkPower(_power,power);
					//获取数据
					listData(date);
					//初始化事件
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

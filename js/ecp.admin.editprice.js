/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		RestApi = require('./ecp.rest'),
		Fun = require('./ecp.func'),
		UserInfo = require('./ecp.user.info');
	
	require('jquery.ui')($);

	var cpData;

	var m = {
		$cps : $('select[data-db-name="edit_cp_id"]'),
		$types : $('select[data-db-name="edit_type_id"]'),
		$addRow : $('#js_add_row'),
		$table :$('#js_table_editprice'),
		$save : $('#js_save_btn'),
        $confirm : $('#js_confirm_btn'),
		$date : $('input[data-db-name="edit_date"]')
	}

	var getCp = function(){
		var aCp = RestApi.getCp().success(function(data){
			var str = '';
			data.cp.forEach(function(item){
				str += '<option value="'+ item.cp_id +'">'+ item.cp_name +'</option>';
			})
			m.$cps.html(str);
		});

		var aType = RestApi.getType().success(function(data){
			var str = '';
			data.type.forEach(function(item){
				str += '<option value="'+ item.type_id +'">'+ item.type_name +'</option>';
			})
			m.$types.html(str);
		});
        /**
         * 只有2个数据全部加载完成后 才触发
         */
        $.when(aCp,aType).done(function(d1,d2){
        	cpData = d1[0].cp;
            //加载页面数据
            initPage();
        })
	};

    /**
     * 获取表格数据
     * @returns {{insert: {editprices: Array}, update: {editprices: Array}, all: {editprices: Array}}|*}
     */
	var getData = function(){
		var updateArr = [],         //更新时的数据
            insertArr = [],         //新增时的数据
            allArr = [],            //所有数据
            date = Fun.getUrlParam('date');
		m.$table.find('tbody tr').each(function(){
			var $this = $(this),
				o;
			//判断是否有数据
			if($this.find('input[data-db-name="edit_date"]').val() != '' && $this.find('input[data-db-name="edit_new_price"]').val() != ''){
                o = Fun.getDbData($(this));
                allArr.push(o);
                if($this.attr('data-id')){
                    updateArr.push(o);
                }else{
                    date && (o['edit_add_date'] = date);
                    insertArr.push(o);
                }
			};
		});

		obj = {
            insert:{
                editprices:insertArr
            },
            update:{
                editprices:updateArr
            },
            all:{
                editprices:allArr
            }
		}

		return obj;
	}

	/**
	 * 日期选择
	 */
	var setDatePicker = function($dom){
		
		$dom.datepicker({
			changeMonth: true,
			onSelect: function( selectedDate ) {
				var select_day = new Date(selectedDate),
					year = select_day.getFullYear();
					month = select_day.getMonth();
					monthStartDate = new Date(year, month, 1);    
				$(this).val(Fun.dateFormat(monthStartDate,'yyyy-MM-dd'));  
			}
		});
	};

    /**
     * 检测页面状态
     */
    var checkPageStatus = function(){
        var _readOnly = function(){
            m.$table.find(':input').prop('disabled',true).end()
                .find('.js_del').remove();
            m.$addRow.hide();
            m.$save.hide();
            m.$table.find('tbody tr:not([data-id])').remove();
        }
        //仅查看状态
        var status = Fun.getUrlParam('status');
        if(status && status === "view"){
            _readOnly();
        }else if(status === 'confirm'){
            _readOnly();
            m.$confirm.show();
        }
    };

    /**
     * 设置CP链接等
     */
    var setCpComLink = function(cp_id){
    	var str = '';
    	cpData.forEach(function(item){
    		if(item.cp_id == cp_id){
    			str += '<a href="'+ item.cp_contract_link +'" target="_blank">'+ item.cp_contract +'</a> ';
    			return;
    		}
    		console.info('iiii')
    	})
    	return str;
    }

    var initPage = function(){
        var date = Fun.getUrlParam('date')
        date && RestApi.getEditPriceByDate(date).success(function(data){
                    data.editprices.forEach(function(item){
                        var $tr =  m.$table.find('tbody tr:last').clone(),
                        	cp_id = item.edit_cp_id,
                        	cp_link = setCpComLink(cp_id);
                        Fun.setDbData(item,$tr);
                        $tr.attr('data-id',item.edit_id);
                        $tr.find('input[data-db-name="edit_date"]').removeAttr("id class")
                        $tr.find('.js_action').append(cp_link);
                        $tr.prependTo(m.$table.find('tbody'));
                        setDatePicker( $('input[data-db-name="edit_date"]',$tr) )

                    })
                    checkPageStatus();
                });
    }

	var Event = {
		/**
		 * 新增一行
		 */
		addRow:function(){
			m.$addRow.on('click',function(){
				var $tr = m.$table.find('tbody tr:last').clone();
                $tr.appendTo(m.$table.find('tbody'));
                $tr.find('input[data-db-name="edit_date"]').removeAttr("id class")
                setDatePicker( $('input[data-db-name="edit_date"]',$tr) )
				return false;
			})
		},

		/**
		 * 保存数据
		 */
		save:function(){
			m.$save.on('click',function(){
				var data = getData(),
                    date = Fun.getUrlParam('date'),
                    submited = 0;
                //存在值
                if(data.insert.editprices.length){
                    RestApi.addEditPrices(data.insert).success(function(d){
                        console.info('data',d)
                        submited++;
                        if(submited === 2 || !data.update.editprices.length){
                            alert('修改报价成功！');
                            window.location.href = 'view_admin_12.html';
                        }
                    });
                };
                //存在值
                if(data.update.editprices.length){
                    RestApi.updateEditPrices(data.update).success(function(d){
                        submited++;
                        if(submited === 2 || !data.insert.editprices.length){
                            alert('修改报价成功！');
                            window.location.href = 'view_admin_12.html';
                        }
                    });
                };


			});
		},

		/**
		 * 删除数据
		 */
		del:function(){
			m.$table.on('click','.js_del',function(){
				if(confirm('确定要删除这行吗？')){
					$(this).closest('tr').remove();
				}
				return false;
			})
		},

        /**
         * 确认本次供应商调价
         */
        confirm:function(){
            m.$confirm.on('click',function(){
                if(confirm('本次调价确认无误，审核通过吗？')){
                    //更新调整状态
                    var data = {
                            edit_check : 1,
                            edit_add_date : Fun.getUrlParam('date'),
                            edit_confirm_user:Fun.getUserName()
                        },
                        priceData = getData();
                    //更新审核状态
                    var a1 = RestApi.putCheckByDate(data);

                    //更新到价格区域
                    var a2 = RestApi.putPriceConfirm(priceData.all);

                    $.when(a1,a2).done(function(){
                        alert('审核已通过！');
                        window.location.href = 'view_admin_12.html';
                    });
                };
            })
        },


		/**
		 * 初始化 
		 */
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
				if(power === 40 || power === 50){
					//设置登录信息 和 退出事件
					UserInfo.init();
					Fun.navLink(power);
					Event.init();
					setDatePicker(m.$date);
					//获取CP
					getCp();
				}else{
					window.location = 'error.html';
				};
			};
		});
	}
	
	exports.init = function(){
		getUserPower();
	};
	
	
});

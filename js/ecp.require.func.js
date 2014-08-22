/**
 * 模块新增
 */
define(function(require, exports, module) {  
	
	var $ = require('jquery'),
		c = require('./ecp.config.user'),
		Mustache = require('mustache'),
		Fun = require('./ecp.func'),
		RestApi = require('./ecp.rest'),
		localStore = require('./ecp.localstore');
	
	require('jquery.field')($);
	require('jquery.ui')($);
	
	var model = {
		id_list_table:'#js_list_table_',
		id_req_list_tmpl : '#js_req_list_tmpl', //表内容 模板
		id_pop_task:'#js_pop_task',			//右侧弹窗容器
		id_tapd_tab : '#js_tapd_tab', //表头id
		id_req_list : '#js_req_list' //表内容id 用于放置需求列表
	};
	
	/**
	 * 显示弹出层 
	 */
	exports.showRequirePop = function(is_edit){
		//可编辑状态
		if(is_edit){
			$('#js_require_info :input:not(:button)').prop('disabled',false);
			$('#js_pop_ft_btns,#js_attr_cont button').show();
		}else{
			$('#js_require_info :input:not(:button)').prop('disabled',true);
			$('#js_pop_ft_btns,#js_attr_cont button').hide();
		}
		$('#js_require_info,#js_ui_mask').show();
		//显示管理员字段
		var user_info = localStore.getSingleUserData(),
			power = parseInt(user_info.users.user_power,10);
		if(power ===30 || power ===40){
			$('.js_pm_list').show();
		}else{
			$('.js_pm_list').hide();
		};
	};
	
	/**
	 * 隐藏弹出层 
	 */
	exports.hideRequirePop = function(){
		$('#js_require_info,#js_ui_mask').hide();
		Fun.hideCheckUserPop();
		// $('tr.current',model.id_list_table).removeClass('current');
	};
	
	/**
	 * 删除上传文件 
	 */
	exports.delFileEvent = function(id){
		$(id).on('click','.js_del_file',function(){
			var $li = $(this).closest('li'),
				require_id = $('#js_pop_require_id').val(),
				filename = $li.attr('data-filename');
			$li.remove();	
			//删除文件
			RestApi.deleteFile(require_id,filename);
		});
	};
	
	/**
	 * 动态创建表格 
	 * tbody 表格ID 
	 * rows:行数
	 * cols:列数
	 */
	exports.createTable = function(rows, week_obj) {
		var cols = week_obj.week_day.length;
        for (var r = 1; r <= rows; r++) {
            var trow = $("<tr>");
            for (var c = 1; c <= cols; c++) {
                $("<td>").attr({
                        	'data-num':c,
                        	'data-day':week_obj.week_day[c-1],
                        	'data-week-name':week_obj.week_name[c-1]
                        	
                        })
                        .appendTo(trow);
            }
            trow.appendTo($(model.id_req_list));
        };
        //表格高度同步
        // $('#js_table_view').height($(model.id_req_list).height());
   };
   
   exports.setTaskDrag = function($div){
		$div.draggable({ opacity: 0.5, 
			helper: 'clone', 
			cursor: 'move',
			revert:'invalid',
	        start:function(ev,ui){
	        	var workload = parseFloat(ui.helper.attr('data-workload')) ;
	        	var w = $('#js_table_view tbody td').eq(0).width() - 20;
	        	ui.helper.width(w).children('div').width(w*workload);
	        	//更新缓存时间截
				$('#js_toggle_page').attr('data-list-reload',true);
	        }
        }) 
	};
	
	/**
	 *  获取目标td
	 * $td 目标td
	 * wday工作量 
	 * week_obj 一周对象
	 * start_date 目标td的时间
	 */
	var $ntd;
	exports.getDropTd = function($td,wday,week_obj,start_date){
		console.info($td,start_date,'getDropTd')
		var index = $td.index();
		$ntd =  $td;
		//找到隔壁列
		var $nexts = $td.nextAll().slice(0,wday - 1);
		//存在的话 说明隔壁单元格已有数据
		//隔壁单元格不为空
		if($nexts.has('div').length || $td.has('div').length){
			var $tr = $td.parent().next();
			$ntd = $tr.find('td[data-day="'+ start_date +'"]');
			if($tr.length && $ntd.length){
				exports.getDropTd($ntd,wday,week_obj,start_date);
			}else{
				// console.info('else===',$otd)
				//不存在 则创建一行
				exports.createTable(1, week_obj);
				$otd = $('#js_req_list tr:last td[data-day="'+ start_date +'"]');//.eq(index);
				exports.getDropTd($otd,wday,week_obj,start_date);
			};
		};
		return $ntd;
	};	
	
	/**
	 * 设置弹出层 信息 
	 */
	exports.setPopInfo = function(data){
        var date = new Date(),
            nowDay = date.getDay(),
            nextWeek = Fun.getWeeks(date,1)['week_day'],
            thisWeek = Fun.getWeeks(date,0)['week_day'],
            type_name = '',
            tempreq = false;

		$('#js_require_start_date').val(data.day);
		$('#js_pop_day').text(data.day);
		$('#js_pop_wname').text(data.week_name);
		$('#js_pop_name').text(data.type);
        /**
         * 判断是否是临时需求
         * 本周提本周需求
         * 本周五提下周需求
         */
        if( ($.inArray(data.day,thisWeek) !== -1) || (nowDay >= 5 && $.inArray(data.day,nextWeek) !== -1) ){
            type_name = '[临时需求]';
            tempreq = true;
            alert('此为临时需求，请确保已走邮件申请临需的流程，感谢配合!\n 临时需求判断：\n 周一到周日提交本周的需求;\n 周五到周日提交下周的需求');
        }

        $('#js_req_type').text(type_name);
        $('#js_table_view').data('tempreq',tempreq);

		//易讯
		// if(data.rank_id && data.rank_id == 1){
			// $('.js_v_dev').show();
		// }else{
			// $('.js_v_dev').hide();
		// };
		
		// console.info(data,temp_req,'setPopInfo')
	};
	
	
	/**
	 * 获取列数 
	 */
	exports.getTdNum = function($td){
		var $td_p = $td.prevAll(),
			num = 0;
		$td_p.each(function(index) {
		  var i = parseInt($(this).attr('colspan') || 1);
		  num += i;
		});
		return num;
	}
	
	/**
	 * 合并单元格 
	 * wday:天数
	 */
	exports.mergeCell = function($td,wday){
		if(!wday) return false;
		var num = exports.getTdNum($td),
			weekend = $('#js_table_view').hasClass('weekend'),
			workload = parseFloat($div.attr('data-workload')),
			week_days = weekend ? 5 : 7;
		
			
			
		//如果单元格不够	
		if(week_days - num <= wday){
			wday = week_days - num;
		};
		$td.attr('colspan',wday).nextAll().slice(0, wday - 1).remove();
		return $td;
	};
	
	/**
	 * 拆分单元格 
	 */
	exports.splitCell = function($td){
		var colspan = $td.attr('colspan');		//单元格个数
		if(!colspan || colspan == 1) return false;		//只有1天的需求 直接返回
		var day = $td.attr('data-day'),
			num = $td.attr('data-num'),
			str = '';
		
		var week_obj = Fun.getWeekRange(new Date(day),colspan);
		for(var i = 1;i<week_obj.week_day.length;i++){
			num++;
			str += '<td  data-num="'+ num +'" data-week-name="'+ week_obj.week_name[i] +'" data-day="'+ week_obj.week_day[i] +'"></td>';
		}
		$td.removeAttr('colspan').after(str);
		// $td.remove();
	};
	
	exports.addColumn = function(num,date){
		var week_obj = Fun.getWeekRange(date,num),
			str = '';
		for(var i = 1;i<week_obj.week_day.length;i++){
			str += '<td data-week-name="'+ week_obj.week_name[i] +'" data-day="'+ week_obj.week_day[i] +'"></td>';
		}
		$('#js_req_list td:last-child').after(str);
	};
	
	/**
	 * 获取空的td 
	 */
	var getEmptyTd = function(start_date,week_obj){
		// console.info(start_date,week_obj,'week_objweek_obj')
		var $td = $('#js_req_list td[data-day="'+ start_date +'"]:empty').eq(0);		//第一个空td
		//不存在表格行数时
		if(!$td.length){
			var length = week_obj.week_day.length;
			//创建1行
			exports.createTable(1, week_obj);
			$td = $('#js_req_list td[data-day="'+ start_date +'"]:empty').eq(0);
		};
		return $td;
	};
	
	/**
	 * 新增需求到表格 
	 * fast表示 第一次加载时，可以不必执行 getDropTd
	 */
	exports.appendRequire = function(data,week_obj,fast){
		var tpl = $(model.id_req_list_tmpl).html(),		//获取需求模板
			start_date = data['require_start_date'],
			//week_obj = Fun.getWeeks($('#js_ui_view').data('date')),
			listHtml = Mustache.to_html(tpl, data),
			workload = parseFloat(data['require_workload']),			//工作量
			colspan = Math.ceil(workload);								//向上取整
		
		if(fast){
			var $ntd = getEmptyTd(start_date,week_obj);		//第一个空td
		}else{
			//console.info(week_obj,'week_objweek_obj')
			var $td = getEmptyTd(start_date,week_obj),		//第一个空td
				$ntd = exports.getDropTd($td,colspan,week_obj,start_date);
		}
		$div = $(listHtml);
		//合并单元格
		exports.mergeCell($ntd,colspan);
		$ntd.append($div);
		//有小数
		if(colspan > workload && parseFloat($ntd.attr('colspan')) == colspan){
			$div.css('width',workload/colspan*100 + '%');
		};
		//console.info(parseFloat($ntd.attr('colspan')) , colspan,workload,$div)
		localStore.setRequireDataById(data.require_id,data);
		//需求类型
		if(data.require_type == 1){
			//正常需求
			$div.addClass('tapd_style1');	
		}else{
			//临时需求
			$div.addClass('tapd_style2');	
		}
		
		//需求状态 待排期 待邮件 状态下可拖 可改
		if(data.require_state == 1 || data.require_state == 5){
			
			$div.addClass('js_drag_edit');	
			//设置div可拖曳
			exports.setTaskDrag($div);
		}else{
			//不可修改需求
			$div.removeClass('tapd_style1').addClass('tapd_style3 js_type');	
		};
	};
	
	/**
	 * 设置rank显示 (需求进度) 
	 */
	exports.setUiRank = function($container){
		var now = new Date();
		$('.js_ui_range',$container).each(function(){
			var $this = $(this),
				day = new Date($this.attr('data-date')),
				workload =  Math.ceil(parseInt($this.attr('data-workload'))),
				diff = Fun.diffDate(now,day),									//天数相差
				pre = diff/workload;		//用于计算
			if(pre>1){
				 pre = 1;
			}else if(pre < 0){
				pre = 0;
			}

			// setTimeout(function(){
				// $this.find('i').animate({ 
			    // width: (pre * 100) +'%'
			  // },2000 );
// 
			// },100);

			$this.find('.ui_range_num').text(parseInt(pre * 100,10) +'%');

			$this.find('i').css({
				//'-webkit-transition:':'width 0.35s linear 4.58s',
				'width': (pre * 100) +'%'
			});
			
			//$this.html('<div class="ui_range_inner"><i style="width:'+ (pre * 100) +'%;"></i></div><div class="ui_range_num">'+ parseInt(pre * 100,10) +'%</div>')
			//$this.html('<span style="width:'+ (pre * 100) +'%"></span><i style="display:none">'+ (diff/workload) +'</i>');
		});
	};
	
	/**
	 *  第一个输入框获得焦点
	 */
	exports.setPopFocus = function(){
		$('#js_require_name').focus();	
	};
	
	/**
	 * 隐藏右侧弹窗 
	 */
	exports.showRightPop = function(){
		$(model.id_pop_task).addClass('pop_task_show');
	};
	
	/**
	 * 隐藏右侧弹窗 
	 */
	exports.hideRightPop = function(){
		$(model.id_pop_task).removeClass('pop_task_show');
		$('tr.current','.js_tablesorter').removeClass('current');
		Fun.hideCheckUserPop();
	};
	
	/**
	 * 移除所有cache ，因添加需求 和 需求列表在同一个页面，故需要清除现有缓存 然后拉取新的数据 
	 */
	exports.removeListCache = function(){
		$(model.id_list_table).data('cache',false).removeData();
	};
	
	/**
	 * 根据开始时间 和工作天数 、是否工作日 获取结束时间 
 	 * @param {Object} start
 	 * @param {Object} workload
 	 * @param {Object} iswork  为true时 说明是不包括周末的 正常工作日
	 */
	exports.getEndDate = function(start,workload,iswork){
		var s = new Date(start).getTime(),
			workload = Math.ceil(workload) - 1,						//工作量向上取整
			oneDayTime = 24 * 3600 * 1000,
			end_date = s + workload*oneDayTime,				//结束时间
			weeken = 0;					//周末天数
		//工作天数
		for(var i = 1;i<workload;i++){
			var day = new Date(s + i*oneDayTime).getDay();
			//周日 和 周六 （中国day 需要加1）
			if( day === 0 || day === 6 ){
				weeken++;
			};
		};
		//如果只是工作日
		if(iswork){
			end_date = end_date + weeken * oneDayTime;
		};
		
		return Fun.dateFormat(new Date(end_date),"yyyy-MM-dd");
	};
	
	// exports.checkAttr = function(){
		// var $trs = $('#js_attr_cont').find('tbody tr'),
			// length = $trs.length,
			// check = false;
		// //存在	
		// if(length){
			// $('#js_attr_cont').find('tbody tr').find('input')
		// }	
	// }
	/**
	 * 检测用户联系方式是否存在 
	 */
	exports.checkUserContact = function(user){
		if(!user.user_qq || !user.user_phone){
			$('#js_user_pop').show();
		}
	};
	
	/***
     * 显示相应的 表格
     */
    exports.showTableByState = function(state){
    	$(model.id_list_table + state).show().siblings('.js_ui_page').hide();
    	//需求概述
    	if(state == 10){
    		$('#js_header_2').show();
    		$('#js_header_1').hide();
    	}else{
    		$('#js_header_1').show();
    		$('#js_header_2').hide();
    	}
    };
    
    /**
     * 显示开始时间和结束时间 
 	 * @param {Object} start
     * @param {Object} end
     */
    exports.showStartEndDate = function(start,end){
    	var today = Fun.today();
    	$('#js_tapd_tab tr th[data-day="'+ today +'"]').addClass('today');
    	$('#js_page_start_date').text(Fun.dateFormat(new Date(start),'yyyy年MM月dd日 '));
    	$('#js_page_end_date').text(Fun.dateFormat(new Date(end),'yyyy年MM月dd日 '));
    	
    	console.info(new Date(start),'==============');
    };
    
    /**
     * 待排期状态 
     */
    exports.triggerState = function(){
    	var $a = $('#js_filter_state li a.current'),
    		state = $a.attr('data-state');
    	//待排期状态
    	if(state == 6){
    		$('#js_list_table_6').removeData();
    		$a.trigger('click');
    	};
    };
    
//    /**
//     * 检测需求是正常需求  还是临时需求
//     */
//    exports.setRequireType = function(start,end){
//        var tempreq = new Date().getDay();
//        if(tempreq >=5 ){
//            //临时需求
//            $('#js_table_view').data('tempreq',true)
//        }else{
//            //正常需求
//            $('#js_table_view').data('tempreq',false)
//        }
////    	RestApi.checkReqType(start,end).success(function(data){
////    		if(data && data.require && ( data.require != 0 )){
////
////    		}
////
////    	})
//    };
    
    /**
	 *  修改广告数量 和 是否显示审核设计师
	 */
	exports.changeAdText = function(is_show,type_check){
		if(is_show == 0){
			$('#js_require_ads,#js_pop_require_ads').hide();
		}else{
			$('#js_require_ads,#js_pop_require_ads').css('display','inline-block');
		};
		//是否需要显示审核设计师
		if(type_check == 1){
			$('.js_verify_user').show().find('input').attr('data-validate','true');
		}else{
			$('.js_verify_user').hide().find('input').removeAttr('data-validate');
		};
	};
	
	exports.changeAdTextEvent = function($input,$ads){
		$input.on('change',function(){
			var $selected = $(this).find('option:selected'),
				is_show = $selected.attr('data-show-num'),
				type_check = $selected.attr('data-check'),
				type_id = $(this).getValue(),
				old_value = $ads.attr('old-value');
			//是否显示修改数量	
			if(is_show == 0){
				$ads.hide().val('1');
			}else{
				$ads.css('display','inline').val(old_value);
			};
			console.info(type_id)
			//是否需要显示审核设计师  重构需求都需要审核设计师
			if(type_check == 1 || type_id ==24  || type_id ==25  || type_id ==26 ){
				console.info('g')
				$('.js_verify_user').show().find('input').attr('data-validate','true');
			}else{
				$('.js_verify_user').hide().find('input').removeAttr('data-validate');
			};
			
		});
	};
	
	/**
	 * 获取需求属性列表 
	 */
    exports.getAttrByReqId = function(require_id){
        $('#js_attr_cont tbody').empty();
        var req = RestApi.getAttributeById(require_id).success(function(data){
            if(data && data.attribute){
                for(var i in data.attribute){
                    var str = $('#js_attr_clone tbody').html(),
                        a_data = data.attribute[i],
                        $tr = $(str);
                    $tr.attr({
                        'data-id':a_data.att_id,
                        'data-type':'update'
                    })
                        .find('.js_attr_type_id').setValue(a_data.attr_type_id)
                        .end().find('.js_att_text').val(a_data.att_text)
                        .end().appendTo($('#js_attr_cont tbody'));
                }
            };
        });
        return req;
    };
	
	/**
	 * 获取需求属性列表 
	 */
	exports.getAttrByReqTextId = function(require_id){
		//清空需求属性设置
		Fun.clearAttrPop();
		var req = RestApi.getAttributeById(require_id).success(function(data){

			if(data && data.attribute){
				for(var i in data.attribute){
					console.info(data.attribute[i],'data.attribute[i]')
					var a_data = data.attribute[i],
						$tr = $('#js_pop_tapd label[data-type-id="'+ a_data.attr_type_id +'"]');
					$tr.attr({
						'data-id':a_data.att_id,
						'data-type':'update'
						})
					   .find('input').val(a_data.att_text);
				}
			};
		});
		return req;
	};
    
    /**
	 * 需求被中止或 驳回 则会发送Email周知 
	 */
	exports.actionEmail = function(data,action_type){
		//Email邮件通知
		data.require.turn_user = Fun.getUserName();
		data.require.action_type = action_type;
		var tpl =  $('#js_email_turn').html(),					//邮件HTML模板结构
			listHtml = Mustache.to_html(tpl, data.require);
		var email_obj = {
			subject			:"【ECD TASK】"+ data.require.require_creator +  " 您的外包需求被" + action_type,
			sender			:Fun.getUserName(),			//发送者
			receiver		:data.require.require_creator,		//接受者
			cc				:c.email_cp_cc,				//抄送
			msg				:listHtml 
		};
		RestApi.sendEmail(email_obj);
	};

    /**
     * 触发rank联动，用于归类与归类细分的联动
     * @param id
     */
    exports.triggerRankEvent = function(id){
        var $id = $(id),
            $triggerId = $('#'+$id.attr('data-trigger')),
            $bdRankCate = $('#js_bd_rank_cate'),
            rank_id;
        $id.on('change',function(){
            rank_id = $(this).getValue();
            $triggerId.find('option.trigger').remove();
            $bdRankCate.find('option.trigger[data-rank_id="'+ rank_id +'"]').clone().appendTo($triggerId);
            $triggerId.prop('selectedIndex',-1);
        })
    };

    exports.triggerRank = function(id){
        var $id = $(id),
            rank_id = $(id).getValue(),
            $bdRankCate = $('#js_bd_rank_cate'),
            $triggerId = $('#'+$id.attr('data-trigger'));
        $triggerId.find('option.trigger').remove();
        console.info(rank_id,id,'=======')
        $bdRankCate.find('option.trigger[data-rank_id="'+ rank_id +'"]').clone().appendTo($triggerId);
    };

    /**
     * 获取需求状态名称
     * @param state
     * @param data
     * @returns {string}
     */
    exports.getStateDetailName = function(state,data){
        var name = '',
            finish_date = new Date(data.require_finish_date).getTime(),
            now = new Date().getTime();

        if(state == 1){
            name = '待排期';
        }else if(state == 5){
            name = '待邮件';
        }else if(state == 3){
            name = '已打分';
        }if(state == 9){
            name = '待启动';
        }if(state == 11){
            name = '待结算';
        }if(state == 12){
            name = '已结算';
        }else if(state == 4){
            if(finish_date > now){
                name = '进行中';
            }else{
                //待评分
                if(data.require_mark_pdm == 0){
                    name = '产品待评分';
                }else{
                    name = '设计待评分'
                }
            }
        }
        return name;
    };
	
});

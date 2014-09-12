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


    var getRankCate = function(){
        $.when(RestApi.getRankCate(),RestApi.getRank()).done(function(rankCate,rank){
            var tplRank = $('#js_rank_tmpl').html(),
                tplRankCate = $('#js_list_tmpl').html(),
                rankHtml = Mustache.to_html(tplRank, rank[0]),
                rankCateHtml = Mustache.to_html(tplRankCate, rankCate[0]);
            $('#js_rank').html(rankHtml);
            $('#js_list_table').html(rankCateHtml);
        });
    };

    /**
     * 修改归类
     */
    var event = function(){
        var $table = $('#js_list_table'),
            $rank = $('#js_rank'),
            $rankCate = $('#js_rank_cate'),
            $editBtn = $('#js_edit_rankcate_btn'),
            $addBtn = $('#js_add_rankcate_btn');

        function _getData(){
            return {
                rankcate:{
                    rank_id:$rank.getValue(),
                    rank_cate_id : $rankCate.attr('data-rank-cate-id'),
                    rank_cate_name : $rankCate.val()
                }
            };
        }

        $table.on('click','.js_edit',function(){
            var $tr = $(this).closest('tr'),
                rankCateId = $tr.attr('data-id'),
                rankId = $tr.attr('data-rank-id'),
                rankCateName = $tr.find('.js_rankcate_name').text();

            $rank.setValue(rankId);
            $rankCate.val(rankCateName).attr('data-rank-cate-id',rankCateId);
            $editBtn.show();
            $addBtn.hide();
            return false;
        });
        //修改细分归类
        $editBtn.click(function(){
            var data = _getData();
            RestApi.putRankCateById(data.rankcate.rank_cate_id,data).done(function(data){
                var $tr = $table.find('tr[data-id="' + data.rankcate.rank_cate_id +'"]');
                $tr.find('.js_rankcate_name').text(data.rankcate.rank_cate_name);
                $tr.effect("highlight",1000);
            })
        });
        //删除
        $table.on('click','.js_del',function(){
            if(confirm('确定要删除这个细分归类吗？删除后无法恢复')){
                var $this = $(this),
                    delId = $this.attr('data-id'),
                    $tr = $this.closest('tr');
                RestApi.delRankCateById(delId).done(function(data){
                    $tr.effect("highlight",1000,function(){
                        $(this).remove();
                    });
                })
            }
        });
        //新增
        $addBtn.click(function(){
            var data = _getData();
            //删除cate 因为是新增 不需要这个值
            delete data.rankcate.rank_cate_id;
            RestApi.addRankCate(data).done(function(data){
                var $tr = $table.find('tr[data-rank-id="' + data.rankcate.rank_id +'"]').last(),
                    rankName = $tr.find('.js_rank_name').text(),
                    tplRankCate = $('#js_list_tmpl').html(),
                    rankCateHtml;

                data.rankcate.rank_name = rankName;
                rankCateHtml = Mustache.to_html(tplRankCate, data);
                $tr.after(rankCateHtml);
            })
        })
    };


	var getUserPower = function(){
		var user = Fun.getUserName();
		if(!user){
			window.location = 'index.php';
			return;
		}
		
		RestApi.getUserPower(user).success(function(data){
			if(data && data.users){
				var power = parseInt(data.users.user_power,10);
				// 者管理员
				if(power === 40){
					//设置登录信息 和 退出事件
					UserInfo.init();
					Fun.navLink(power);
                    getRankCate();
                    event();
				}else{
					window.location = 'error.html';
				}
			}
		});
	};
	
	exports.init = function(){
		getUserPower();
	};
	
	
});

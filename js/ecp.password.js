/**
 *  用户登录
 */
define(function(require, exports, module) {  
   var $ = require('jquery'),
    	Fun = require('./ecp.func'),
    	RestApi = require('./ecp.rest');
   
   /**
    * 获取修改密码数据
    */
   var getData = function(){
       return {
			users:{
				login_name : $.trim($('#js_english_name').val()) ,
				user_password : $.trim($('#js_user_password').val())
			}
		};
   };


    /**
     * 修改密码事件
     */
    var changeEvent = function(){
        $('#js_form').on('submit',function(){
            var data = getData();
            if(!data.users.user_password){
                alert('密码不能为空');
            }else if(!data.users.login_name){
                alert('英文名不能为空');
            }else{
                RestApi.changePassword(data).done(function(data){
                    if(data && data.error){
                        alert(data.error.msg);
                    }else{
                        alert('密码修改成功！')
                    }
                });
            }
            return false;
        })
    };

    /**
     * 检测用户权限
     */
    var checkPower = function(){
        var user = Fun.getUserName();
        if(!user){
            window.location = 'index.php';
            return;
        }

        RestApi.getUserApp(user).success(function(data){
            if(data && data.app && data.app.user){
                var power = parseInt(data.app.user.user_power,10);
                //管理员
                if(power !==40){
                    window.location = 'error.html';
                }else{
                    changeEvent();
                }
            }else{
                window.location = 'error.html'
            }
        })
    };
   

   exports.init = function(){
       checkPower();
   };
   
});  
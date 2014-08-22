/**
 * Created by p_jdyghua on 14-6-20.
 */
define(function(require, exports, module) {
    var $ = require('jquery');

    require('jquery.cookie')($);

    exports.init = function(){

        $('#J_clear').on('click',function(){
            $.cookie("login_user_ecp",'',{expires:-1,path: '/'});
            alert('成功修复！')
            window.location = 'index.php'
        });


    }

});
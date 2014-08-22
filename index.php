<?php
ob_start();
require_once 'api/TOF_Client.class.php';
require_once 'api/functions.php';

//http://ecp.jd.me/task/index.php
if($_SERVER['HTTP_HOST'] == 'shyw.ecc.icson.com' || $_SERVER['HTTP_HOST'] == 'ecp.jd.me'){
	//判断是否是易迅登录
	if (isset($_COOKIE['login_user_ecp'])) {
		$english_name =  $_COOKIE['login_user_ecp'];
		header("location: view_pdm.html");
	}else{
		header("location: login.html");
	};
}else{
//    exit;
	//公司内部
	$tof = new TOF_Client();
	$english_name = $tof->getUser();
}

//exit;

//$tof = new TOF_Client();
//$english_name = $tof->getUser();

$urlf="http://".$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
$po= strripos($urlf,"/");
$LPATH = substr($urlf,0,$po+1);


if(isset($english_name)){
	
	$sql = "SELECT `user_power`,`login_name`,`department_id` FROM `tb_users` WHERE `login_name` = '". $english_name ."'";
	$sql_2 = "UPDATE  `tb_users` SET  `user_login_time` =  `user_login_time` + 1 ,`user_last_login` = '". date('Y-m-d H:i:s') ."'  WHERE `login_name` = '". $english_name ."'";
	$db = connectDB();
	$result = mysql_query($sql,$db);
	//echo $sql_2;
	mysql_query($sql_2,$db);
	//存在数据
	$data = mysql_fetch_array($result,MYSQL_ASSOC);
	$power = $data['user_power'];
	$department_id = $data['department_id'];
	mysql_close($db);
	//获取数据
//	try{
//		$pm  = file_get_contents('http://et.oa.com/api/user/getpm');
//		$task_pm = is_int(strpos($pm,$english_name));
//	}catch(Exception $e){
//		$task_pm = false;
//	}

    //之前是判断内部task的双重访问权限
    $task_pm = false;
	
	
	$last_url =  $LPATH ."/index.php";
	
	//判断用户权限
	switch($power){
		case 50:
		$last_url =  $LPATH ."view_admin_4.html";	
		break;
		case 40:
		$last_url =  $LPATH ."view_pm.html";	
		break;
		case 30:
		$last_url =  $LPATH ."view_pm.html";	
		break;
		case 20:
		$last_url =  $LPATH ."view_designer.html";	
		break;
		case 10:
		$last_url =  $LPATH ."view_pdm.html";	
		break;
		case 1:
        default:
		$last_url =  $LPATH ."error.html";	
		break;
	};
	
	//判断是否是设计部的游客权限
	if($power == 1 && $department_id == 8677){
		$last_url = 'http://et.oa.com/';
	};
	
	//判断是否同时具有2种权限
	if($task_pm){
		$last_url = 'http://et.oa.com/';
		if(($power == 30 || $power == 40 || $power == 20 || $power == 10)){
			$last_url = $LPATH .'view_switch.html';
		}
	};
	
//	echo $power;// . $english_name . $last_url;
	header("location: ".$last_url);
	exit();
}
ob_end_flush();
?>
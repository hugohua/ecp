<?php
date_default_timezone_set("Asia/Shanghai");
require_once 'KLogger.php';

function dbInfo(){
	$host = $_SERVER['HTTP_HOST'];
	if($host == 'ecd.oa.com' || $host == 'localhost'|| $host == 'ecp.jd.me'){
		$arr = array(
	            'dbhost'=>"localhost",
	            'dbuser'=>"media",
	            'dbpass'=>"media",
	            'dbname'=>"db_ecp"
	    );
	}else{
		$arr = array(
            'dbhost'=>"10.198.2.45",
            'dbuser'=>"vanesshe",
            'dbpass'=>"root@ecc",
            'dbname'=>"db_ecp"
    	);
	}
	return $arr;
}

/**
 *  数据库连接 PDO
 */
function getConnection() {
	$dbi = dbInfo();
	$dbhost=$dbi['dbhost'];
	$dbuser=$dbi['dbuser'];
	$dbpass=$dbi['dbpass'];
	$dbname=$dbi['dbname'];
	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);	
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$dbh->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
	$dbh->exec("SET NAMES 'utf8';"); 
	return $dbh;
};

/**
 *  数据库连接
 */
function connectDB(){
	$dbi = dbInfo();
	$conn=mysql_connect($dbi['dbhost'],$dbi['dbuser'],$dbi['dbpass']);
	mysql_select_db($dbi['dbname'], $conn);
	
	if (!$conn)
	{
		die('Could not connect: ' . mysql_error());
	}
	
	mysql_query("set names 'utf8'");
	return $conn;
}

/**
 * 拼凑insert sql
 * $data: json 数据
 */
function buildSqlInsert($table, $data)
{
    $key = array_keys($data);
    $val = array_values($data);
    $sql = "INSERT INTO $table (" . implode(', ', $key) . ") "
         . "VALUES ('" . implode("', '", $val) . "')";
 
    return($sql);
}
 
/* function to build SQL UPDATE string */
function buildSqlUpdate($table, $data, $where)
{
    $cols = array();
    foreach($data as $key=>$val) {
        $cols[] = "$key = '$val'";
    }
    $sql = "UPDATE $table SET " . implode(', ', $cols) . " WHERE $where";
 
    return($sql);
}

/**
 * 创建需求查询语句
 */
function buildReqSelect($base = 'tb_require',$table = '',$condition = ''){
	$select = 'select '. $base .'.*,tb_rank.*,tb_type.*,tb_cp.* '. $table .' from '. $base .'  
			INNER JOIN  tb_rank  ON '. $base .'.require_rank_id=tb_rank.rank_id  
			INNER JOIN tb_type ON tb_type.type_id='. $base .'.require_type_id 
			LEFT  JOIN tb_cp ON tb_cp.cp_id='. $base .'.require_cp_id ' . $condition;
	return 	$select;	
}

/**
 *  根据state值  返回 state sql语句
 */
function buildStateSql($state){
	$where_state = '';
	//需求状态筛选
	switch ($state) {
		//待排期
		case '1':
			$where_state = " `require_state` = 1 ";
			break;
		//待邮件
		case '5':
			$where_state = " `require_state` = 5 ";
			break;
		//进行中
		case '4':
			$where_state = " `require_state` = 4 and `is_email` IS NOT NULL and  DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') > date(now())  ";
			break;	
		//PDM进行中
		case '24':
			$where_state = " `require_state` = 4 and `is_email` IS NOT NULL and `require_mark_pdm`  = 0 and  DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') > date(now()) ";
			break;
		//PM待评分
		case '8':
			$where_state = " `require_state` = 4  and `require_mark_pdm`  = 0 and DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()) ";
			break;
		//所有待评分	
		case '7':
			$where_state = " `require_state` = 4  and DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()) ";
			break;
		//设计师待评分	
		case '15':
			$where_state = " `require_state` = 4  and `require_mark_desgin`  = 0  and `require_mark_pdm`  != 0 and DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()) ";
			break;	
		//已打分
		case '3':
			$where_state = " `require_state` = 3 ";
			break;	
		//待开始
		case '9':
			//$where_state .= " `require_state` = 4 and `is_email` IS NULL ";
			$where_state = " `require_state` = 9 ";
			break;	
		//待排期 + 待邮件
		case '6':
			$where_state = " `require_state` in (1,5) ";
			break;
		//待结算
		case '11':
			$where_state = " `require_state` = 11 ";
			break;
		//已结算
		case '12':
			$where_state = " `require_state` = 12 ";
			break;	
		//产品经理 已完成
		case '13':
			$where_state = " (`require_state` in (3,11,12) or (`require_mark_pdm`  != 0 and `require_state` = 4)) ";
			break;
		//设计师 已完成
		case '16':
			$where_state = " (`require_state` in (3,11,12)  or (`require_mark_pdm`  != 0 and `require_state` = 4)) ";
			break;
		//PM 已完成
		case '17':
			$where_state = " `require_state` in (3,11,12)";
			break;		
		//概况		
		case '30':
			$where_state = " (`require_state` in (1,9,5)  or (`require_state` = 4  and `require_mark_pdm`  = 0 and DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()))) ";
			break; 	
		default:
			$where_state = " 1 = 1 ";
			break;	
	};
	return $where_state;
}

function buildDateSql($type){
	$where_type = '';
	switch ($type) {
		case 'day':
			$where_type = "and date(require_start_date) = date(now())";
			break;
		case 'week':
			$where_type = "and YEARWEEK(date_format(require_start_date,'%Y-%m-%d'),1) = YEARWEEK(now(),1)";
			break;
		case 'next':
			$where_type = "and YEARWEEK(date_format(require_start_date,'%Y-%m-%d'),1) = YEARWEEK(date_add(now(), interval 1 week),1)";
			break;	
		case 'prev':
			$where_type = "and YEARWEEK(date_format(require_start_date,'%Y-%m-%d'),1) = YEARWEEK(date_add(now(), interval -1 week),1)";
			break;		
		case 'month':
			$where_type = "and date_format(require_start_date,'%Y-%m')=date_format(now(),'%Y-%m')";
			break;
		case 'pmonth':
			$where_type = "and date_format(require_start_date,'%Y-%m')=date_format(DATE_SUB(curdate(), INTERVAL 1 MONTH),'%Y-%m')";
			break;	
		case 'ppmonth':
			$where_type = "and date_format(require_start_date,'%Y-%m')=date_format(DATE_SUB(curdate(), INTERVAL 2 MONTH),'%Y-%m')";
			break;		
		case '1':
			$where_type = "and month(require_start_date)=1 AND YEAR( NOW( ) ) ";
			break;
		case '2':
			$where_type = "and month(require_start_date)=2 AND YEAR( NOW( ) ) ";
			break;
		case '3':
			$where_type = "and month(require_start_date)=3 AND YEAR( NOW( ) ) ";
			break;
		case '4':
			$where_type = "and month(require_start_date)=4 AND YEAR( NOW( ) ) ";
			break;
		case '5':
			$where_type = "and month(require_start_date)=5 AND YEAR( NOW( ) ) ";
			break;
		case '6':
			$where_type = "and month(require_start_date)=6 AND YEAR( NOW( ) ) ";
			break;
		case '7':
			$where_type = "and month(require_start_date)=7 AND YEAR( NOW( ) ) ";
			break;
		case '8':
			$where_type = "and month(require_start_date)=8 AND YEAR( NOW( ) ) ";
			break;
		case '9':
			$where_type = "and month(require_start_date)=9 AND YEAR( NOW( ) ) ";
			break;
		case '10':
			$where_type = "and month(require_start_date)=10 AND YEAR( NOW( ) ) ";
			break;
		case '11':
			$where_type = "and month(require_start_date)=11 AND YEAR( NOW( ) ) ";
			break;
		case '12':
			$where_type = "and month(require_start_date)=12 AND YEAR( NOW( ) ) ";
			break;			
	};
	return $where_type;
};

function buildUserSql($user,$power,$power_rank){
	$where_user = '';
	//all时 表示项目经理 可查看全部
	if($user != 'all'){
		//产品经理
		if($power == 10){
			//非高级产品经理 只需要管理自己的权限
			$where_user = " and `require_creator` =  '". $user ."'";
		}
		//设计师
		else if($power == 20){
			//非高级设计师 只需要管理自己的权限
			$where_user = " and `require_verify_user` like  '%". $user ."%'";
		};
	};
	
	if($power_rank != 0){
		//有管理权限的用户
		$where_user = " and `require_rank_id` in  (". $power_rank .")";
	};
	return $where_user;
};

/**
 *  搜索页面sql组装
 */
function buildSearchSql($data){
	$sql = ' and `is_del` = 0 ';
	if($data['require_id'] != ''){
		$sql.= " and `require_id` in( " . $data['require_id'] .")";
	};
	
	if( $data['require_name'] != '' ){
		$sql.= " and `require_name` LIKE  '%".$data['require_name']."%' ";
	};
	
	if(  $data['require_rank_id'] != ''){
        $sql.= " and `require_rank_id` in( " . $data['require_rank_id'] . ")";
//		if( $data['require_rank_id'] == 200 ){
//
//        }else{
//            $sql.= " and `require_rank_id` = " . $data['require_rank_id'] ;
//        }
	};
	
	if(  $data['require_type_id'] != ''){
		$sql.= " and `require_type_id` = " . $data['require_type_id'] ;
	};
	
	if(  $data['require_workload'] != ''){
		$sql.= " and `require_workload` = " . $data['require_workload'] ;
	};
	
	if(  $data['require_creator'] != ''){
		$sql.= " and '".$data['require_creator']."' LIKE CONCAT('%',require_creator,'%')";//`require_creator` in (
	};
	
	if(  $data['require_verify_user'] != ''){
		$sql.= " and `require_verify_user` LIKE  '%".$data['require_verify_user']."%' ";
	};
	
	if(  $data['require_cp_id'] != ''){
		$sql.= " and `require_cp_id` in( " . $data['require_cp_id'] .")";
	};
	
	if(  $data['require_state'] != ''){
		$sql.=  " and " . buildStateSql($data['require_state']) ;
	};
	
	if(  $data['require_rating'] != ''){
		$sql.= " and `require_rating` = '" . $data['require_rating'] . "'";
	};

    if(  $data['require_type'] != ''){
        $sql.= " and `require_type` = " . $data['require_type'];
    };

    if(  $data['require_rank_cate_id'] != ''){
        $sql.= " and `require_rank_cate_id` = " . $data['require_rank_cate_id'];
    };
	
	if(  $data['require_pm_cost'] != ''){
		$pm_change = $data['require_pm_cost'];
		if($pm_change == 0){
			$sql.= " and `require_pm_cost` = 0";
		}else{
			$sql.= " and `require_pm_cost` != 0";
		}
		
	};
	
	if(  $data['require_start_date'] != '' && $data['require_finish_date'] != ''){
		$sql.= " and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') >= '". $data['require_start_date'] ."' and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') <= '". $data['require_finish_date'] ."' ";
	};
	
	if(  $data['is_modify_attr'] != ''){
		$sql.= " and `is_modify_attr` = " . $data['is_modify_attr'];
	};
	//echo $sql;
	return $sql;
}

function u2utf8($str){
	return preg_replace("/\\\u([\da-f]{4})/ie", 'iconv("UCS-2BE","utf-8",pack("H4","\\1"))', $str);
};

//输出日志
function elog($logstr,$type = 'info',$dir = "../logs/"){
	$startweek = date('Y-m-d',time());
	$log = new KLogger ( $dir.$startweek .".txt", KLogger::INFO );
	$user = getSessionUser();
	$str = u2utf8('(' . $user . ') ' . $logstr);
	switch ($type) {
		case 'error':
			$log->LogError($str);
			break;
		default:
			$log->LogInfo($str);
			break;
	}
	
}

/**
 * 输出变量的内容，通常用于调试
 *
 * @package Core
 *
 * @param mixed $vars 要输出的变量
 * @param string $label
 * @param boolean $return
*/
function dump($vars, $label = '', $return = false)
{
	if (ini_get('html_errors')) {
		$content = "<pre>\n";
		if ($label != '') {
			$content .= "<strong>{$label} :</strong>\n";
		}
		$content .= htmlspecialchars(print_r($vars, true));
		$content .= "\n</pre>\n";
	} else {
		$content = $label . " :\n" . print_r($vars, true);
	}
	if ($return) { return $content; }
	echo $content;
	return null;
}

//获取用户名
function getSessionUser(){
	$user = '';
	if(isset($_COOKIE['login_user_ecp'])){
		$user = $_COOKIE['login_user_ecp'];
	}
	//return 'hugohua';
	return $user;
	
}

/**
 *
 *根据缓存用户名 获取用户权限
 */
function getUserPower(){
	$loginName = getSessionUser();
	$sql = "SELECT `user_power`,`login_name` FROM `tb_users` WHERE `login_name` = '". $loginName ."'";
	$result = mysql_query($sql,connectDB());
	if(!is_bool($result)) {
		//存在数据
		$user_power = mysql_fetch_array($result,MYSQL_ASSOC);
		
		return $user_power;
	} else {
		//不存在数据 返回 0
		return NULL;
	}
}

/**
 *  获取用户列表数组
 */
function getUserList($arr){
	$length = count($arr);
	$user = array();
	if($length){
		foreach ($arr as $id => $ordinal) {
			array_push($user,getEnglish($ordinal[0]));
		};
	};
	return $user;
};

/**
 *  全名转英文名
 */
function getEnglish($user){
	$end = strpos($user,'(');
	$e_name = $user;
	if($end){
		$e_name = substr($user,0,$end);
	};
	return $e_name;
};

/**
 *  删除设计稿
 */
function delDesginAtt($file){
	if (file_exists($file)) {
		$result=unlink ($file);
		return $result;
	};
	return false;
};

/**
 * Goofy 2011-11-30
 * getDir()去文件夹列表，getFile()去对应文件夹下面的文件列表,二者的区别在于判断有没有“.”后缀的文件，其他都一样
 */

//获取文件目录列表,该方法返回数组
function getDir($dir) {
	$dirArray[]=NULL;
	if (false != ($handle = opendir ( $dir ))) {
		$i=0;
		while ( false !== ($file = readdir ( $handle )) ) {
			//去掉"“.”、“..”以及带“.xxx”后缀的文件
			if ($file != "." && $file != ".."&&!strpos($file,".")) {
				$dirArray[$i]=$file;
				$i++;
			}
		}
		//关闭句柄
		closedir ( $handle );
	}
	return $dirArray;
}

//获取文件列表
function getFile($dir) {
	$fileArray[]=NULL;
	if (false != ($handle = opendir ( $dir ))) {
		$i=0;
		while ( false !== ($file = readdir ( $handle )) ) {
			//去掉"“.”、“..”以及带“.xxx”后缀的文件
			if ($file != "." && $file != ".."&&strpos($file,".")) {
				$fileArray[$i]= $file;
				if($i==100){
					break;
				}
				$i++;
			}
		}
		//关闭句柄
		closedir ( $handle );
	}
	return $fileArray;
}

//调用方法getDir("./dir")……

/**
 * 格式化金额
 *
 * @param int $money
 * @param int $len
 * @param string $sign
 * @return string
 */
function format_money($money, $len=0, $sign=''){
    $negative = $money >= 0 ? '' : '-';
    $int_money = intval(abs($money));
    $len = intval(abs($len));
    $decimal = '';//小数
    $format_money = '';
    if ($len > 0) {
     $decimal = '.'.substr(sprintf('%01.'.$len.'f', $money),-$len);
    }
    $tmp_money = strrev($int_money);
    $strlen = strlen($tmp_money);
    for ($i = 3; $i < $strlen; $i += 3) {
        $format_money .= substr($tmp_money,0,3).',';
        $tmp_money = substr($tmp_money,3);
    }
    $format_money .= $tmp_money;
    $format_money = strrev($format_money);
    return $sign.$negative.$format_money.$decimal;
}

/**
 * 数组相加
 */
function array_add($a,$b){ 
	//根据键名获取两个数组的交集 
	$arr=array_intersect_key($a, $b); 
	//遍历第二个数组，如果键名不存在与第一个数组，将数组元素增加到第一个数组 
	foreach($b as $key=>$value){ 
		if(!array_key_exists($key, $a)){ 
			$a[$key]=$value; 
		} 
	} 
	//计算键名相同的数组元素的和，并且替换原数组中相同键名所对应的元素值 
	foreach($arr as $key=>$value){ 
	$a[$key]=$a[$key]+$b[$key]; 
	} 
	//返回相加后的数组 
	return $a; 
}

/**
 * 数组排序
 */
function array_sort($arr,$keys,$type='asc'){ 
	$keysvalue = $new_array = array();
	foreach ($arr as $k=>$v){
		$keysvalue[$k] = $v[$keys];
		// echo $v[$keys] . '==';
	}
	if($type == 'asc'){
		asort($keysvalue);
	}else{
		arsort($keysvalue);
	}
	reset($keysvalue);
	foreach ($keysvalue as $k=>$v){
		array_push($new_array,$arr[$k]);
	}

	return $new_array; 
} 

?>
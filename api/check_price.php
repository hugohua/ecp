<?php

date_default_timezone_set("Asia/Shanghai");
require_once 'functions.php';
header("Content-type: text/html; charset=utf-8"); 

if(empty($_GET["start"]) || empty($_GET["end"]) )
{
	die('请先选择起始日期和结束日期');
	exit;
}

$start = $_GET["start"] ;
$end = $_GET["end"] ;

$sql = "SELECT require_id,require_mark_pdm,require_final_cost,require_state,require_start_date,`att_text`,att_is_parent, attr_type_id, `type_id`,`type_name`,require_ads,require_cp_id,require_pm_cost_change,require_pm_cost,require_rating,type_check
FROM  `tb_require` 
INNER JOIN tb_attribute ON tb_require.`require_id` = tb_attribute.att_require_id
INNER JOIN  `tb_type` ON  `tb_type`.`type_id` =  `tb_require`.`require_type_id` 
WHERE DATE_FORMAT(require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(require_start_date,'%Y-%m-%d') <= '". $end ."'
AND  `tb_type`.`type_state` =1
AND tb_require.require_state in (3,11,12)";


$sql_2 = "select require_id from tb_require 
WHERE DATE_FORMAT(require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(require_start_date,'%Y-%m-%d') <= '". $end ."'
AND require_state in(3,11,12)";

$sql_price = 'SELECT * FROM  `tb_price`';

//////get type 
$sql_type = 'SELECT * FROM  `tb_type` where type_state = 1 order by type_sort';



$db = getConnection();
//类型
$stmt = $db->prepare($sql);  
$stmt->execute();
$att_data = $stmt->fetchAll(PDO::FETCH_OBJ);

$stmt = $db->prepare($sql_2);  
$stmt->execute();
$req_obj = $stmt->fetchAll(PDO::FETCH_OBJ);

//价格
$stmt = $db->prepare($sql_price);  
$stmt->execute();
$obj_price = $stmt->fetchAll(PDO::FETCH_OBJ);

$stmt = $db->prepare($sql_type);  
$stmt->execute();
$obj_type = $stmt->fetchAll(PDO::FETCH_OBJ);
		
$db = null;

//dump($req_id);

$objects = array();

$s_obj = array();
//将需求ID存入数组
foreach ($req_obj as $obj) {
	$req_id = $obj->require_id;
	$objects[$req_id] = array();
};

foreach ($att_data as $obj) {
	$req_id = $obj->require_id;
	//如果array存在
	array_push($objects[$req_id],$obj);
};

$ids = '';//有问题的ID列表
$type_error = '';//需求类型及评分有误的列表

//开始计算价格
foreach ($objects as $objs) {
	$require_id = $objs[0]->require_id;					//需求ID
	$final_cost = $objs[0]->require_final_cost;			//需求总价
	$prices = 0;	 									//需求计算出的价格
	//检测需求是否需要评分
	$check1 = getTypeCheck($obj_type,$objs[0]->attr_type_id);
	//如果需求类型及评分不一致,即： 存在分数 同时 不需要打分
	if( $objs[0]->require_mark_pdm !=0 && $check1 == 0 ){
		$type_error = $type_error . $require_id .',';
	}
	foreach ($objs as $obj) {
		$change_price = $obj->require_pm_cost_change == 1 ? $obj-> require_pm_cost : -$obj-> require_pm_cost;	//是否手动调整了价格
		$require_rating = 'B';
		$att_rating = 'B';
		//如果需要评分
		if($obj->require_rating){
			//需求评级
			$require_rating = $obj->require_rating;
		};

		//需求所在的月份
		$date = date('Y-m-01',strtotime($obj->require_start_date)) ;
		
		//主需求
		if($obj -> att_is_parent == 1){
			$num = (int)$obj->require_ads;//需求数量
			$price = getPrice($obj_price,$obj->type_id,$obj->require_cp_id,$require_rating,$date) ;
			$final_price = $price * $num + (int)$change_price;
		}else{
			//配套需求
			$num = (int)$obj->att_text;
			//判断是否需要评分 1是需要
			//判断是否需要评分
			$att_check = getTypeCheck($obj_type,$obj->attr_type_id);
			if($att_check == 1){
				$att_rating = $require_rating;
			}
			$price = getPrice($obj_price,$obj->attr_type_id,$obj->require_cp_id,$att_rating,$date);
			$final_price = $price * $num;
		};
		//echo $final_price . '<br>';
		$prices += $final_price;
	};
	
	if($prices != $final_cost){
		echo $require_id . '= 计算价格是： ' . $prices  . ' 表格总价是：' . $final_cost . ' <br/>';
		$ids = $ids . $require_id .',';
	};
};

if($type_error){
	echo '需求类型与评分不一致的需求id是:' . $type_error .'<br/><br/>';
}else{
	echo '需求类型全部正确！<br/><br/>';
}

if($ids){
	echo '价格有误差的需求id是:' . $ids .'<br/><br/>';
}else{
	echo '价格全部正确！<br/><br/>';
}

/**
 *  判断需求是否需要评分
 */
function getTypeCheck($obj_type,$type_id){
	foreach ($obj_type as $obj) {
		if($type_id == $obj->type_id){
			return $obj->type_check;
		}
	}
};

/**
 *  获取需求价格
 */
function getPrice($obj_price,$type_id,$cp_id,$rating = 'B',$date){
	foreach ($obj_price as $obj) {
		if(($type_id == $obj->price_type_id) && ($cp_id == $obj->price_cp_id) && $rating == $obj->price_rating && $date == $obj->price_month){
			return (int)$obj->price_name;
		}
	}
};


?>


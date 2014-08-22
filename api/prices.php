<?php
/**
 * 计算需求价格
 */
require_once 'functions.php';

//最大执行时间，防止处理时间过长导致出错
set_time_limit(0);
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
 *  根据CP、需求类型、需求评级 及 日期 获取需求价格
 */
function getPrice($obj_price,$type_id,$cp_id,$rating,$date){
	foreach ($obj_price as $obj) {
		if(($type_id == $obj->price_type_id) && ($cp_id == $obj->price_cp_id) && $rating == $obj->price_rating && $date == $obj->price_month){
			return (int)$obj->price_name;
		}
	}
};

/**
 * 获取需求类型名称
 */
function getTypeName($obj_type,$type_id){
	foreach ($obj_type as $obj) {
		if($type_id == $obj->type_id){
			return u2utf8($obj->type_name);
		}
	}
};

/**
 * 获取需求归类名称
 */
function getRankName($obj_rank,$rank_id){
	foreach ($obj_rank as $obj) {
		if($rank_id == $obj->rank_id){
			return u2utf8($obj->rank_name);
		}
	}
};

/**
 * 获取CP名称
 */
function getCpName($obj_cp,$cp_id){
	foreach ($obj_cp as $obj) {
		if($cp_id == $obj->cp_id){
			return u2utf8($obj->cp_name);
		}
	}
};

/**
 * 根据需求类型计算价格和总数 
 * $obj_type 需求类型
 * $obj_price 需求价格
 */
function countAndPrice($datas,$obj_type,$obj_price){
	$sums = 0;
	$prices = 0;
	foreach ($datas as $obj) {
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
			$att_check = getTypeCheck($obj_type,$obj->attr_type_id);
			if($att_check == 1){
				$att_rating = $require_rating;
			}
			$price = getPrice($obj_price,$obj->attr_type_id,$obj->require_cp_id,$att_rating,$date);
			$final_price = $price * $num;
            if($obj->require_id == '12091' && $obj->attr_type_id == '10'){
                //echo('111111111111111=========='.$att_check);
                //exit;
            }
		};
		
		$prices += $final_price;
		$sums += $num;
	};
	
	$statistics = array('price' => $prices,
						'fmt_price' => format_money($prices),
						'count' => $sums
						);
							
	return $statistics;
};


?>
<?php
/***
 * 导出财务付费系统对接模板API
 * */
//最大执行时间，防止处理时间过长导致出错
set_time_limit(0);
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);
date_default_timezone_set("Asia/Shanghai");

if (PHP_SAPI == 'cli')
	die('This example should only be run from a Web Browser');

/** Include PHPExcel */
require_once '../Classes/PHPExcel.php';
require_once 'functions.php';

// Create new PHPExcel object
global $objPHPExcel;
$objPHPExcel = new PHPExcel();

$user_name = getSessionUser();
if(!$user_name){
	die('please login download excel!');
	exit;
}else{
	$power = getUserPower($user_name);
	if($power['user_power'] != 30 && $power['user_power'] != 40){
		die('only admin and pm can download excel!');
		exit;
	}
}


// Set document properties
$objPHPExcel->getProperties()->setCreator($user_name)
							 ->setLastModifiedBy($user_name)
							 ->setTitle("ECD TASK DATA")
							 // ->setSubject("Office 2007 XLSX Test Document")
							 // ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
							 ->setKeywords("ECD TASK DATA")
							 ->setCategory("ECD TASK DATA");



//设置统一样式


$default_style = array( 
	'font' => array( 
		'size' => 10,
		'name' => '微软雅黑') ,
);

$objPHPExcel->getDefaultStyle()->applyFromArray($default_style);
//$objPHPExcel->getDefaultStyle()->getAlignment()->setWrapText(TRUE);		//自动换行

//拼装sql
$where = 'where 1 = 1 ';

if (isset ( $_POST ['data'] )){
 	$data =  $_POST ['data'];
	$where .= buildSearchSql($data);
};


$table = ',tb_attribute.*';
$condition = ' LEFT JOIN tb_attribute ON tb_attribute.att_require_id = tb_require.require_id ';
$select = buildReqSelect('tb_require',$table,$condition);
$sql = $select . $where . ' order by tb_require.require_start_date asc';

$db = getConnection();
$stmt = $db->prepare($sql);  
$stmt->execute();
$obj_require = $stmt->fetchAll(PDO::FETCH_OBJ);

$obj_require = changeRequire($obj_require);

// dump($obj_require);

// exit();

//////get type 
$sql_type = 'SELECT * FROM  `tb_type` where type_state = 1 order by type_sort';
$stmt = $db->prepare($sql_type);  
$stmt->execute();
global $obj_type;
$obj_type = $stmt->fetchAll(PDO::FETCH_OBJ);

////////get price
$sql_price = 'SELECT * FROM  `tb_price`';
$stmt = $db->prepare($sql_price);  
$stmt->execute();
global $obj_price;
$obj_price = $stmt->fetchAll(PDO::FETCH_OBJ);



$db = null;
drawSheet($obj_require,0,'全部');


function getTypeName($type_id){
	global $obj_type;
	foreach ($obj_type as $obj) {
		if($type_id == $obj->type_id){
			return $obj->type_name;
		}
	}
};

/**
 *  判断需求是否需要评分
 */
function getTypeCheck($type_id){
	global $obj_type;
	foreach ($obj_type as $obj) {
		if($type_id == $obj->type_id){
			return $obj->type_check;
		}
	}
};

/**
 *  获取需求价格
 */
function getPrice($type_id,$cp_id,$rating,$date){
	global $obj_price;
	foreach ($obj_price as $obj) {
		if(($type_id == $obj->price_type_id) && ($cp_id == $obj->price_cp_id) && $rating == $obj->price_rating && $date == $obj->price_month){
			return (int)$obj->price_name;
		}
	}
};

/**
 * 根据需求类型获取二级子类
 */
function getSecondaryItem($type_id){
	$item = '';
	switch ($type_id) {
		case '1':
		case '2':	
		case '24':
		case '25':
		case '26':
			$item = '单个页面/EDM/多页面成套服务';
			break;
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '10':
		case '23':
			$item = '其他网页素材';
			break;
		default:
			$item = '其他';
			break;
	};
	return $item;
};

/**
 * 重组需求
 */
function changeRequire($obj_require){
	$obj_require2 = array();
	//重组需求
	foreach( $obj_require as $obj ){
		$ischange = $obj->require_pm_cost;
		array_push($obj_require2, $obj);
		//主需求 并且 调整了价格 
		if(($obj -> att_is_parent == 1) && $ischange != 0){
			$obj2 = clone $obj;
			$obj2->att_is_parent = 2;
			array_push($obj_require2, $obj2);
		}
	}
	return $obj_require2;

};

function drawSheet($obj_require,$num,$name){
	global $objPHPExcel;
	if($num != 0){
		$objPHPExcel->createSheet($num);
	}
	// Add some data
	$objPHPExcel->setActiveSheetIndex($num)
			->setCellValue('A1', 'ID')
            ->setCellValue('B1', '报价1级用途')
			->setCellValue('C1', '报价2级用途')
            ->setCellValue('D1', 'Item')
            ->setCellValue('E1', '★计价单位')
			->setCellValue('F1', '规格/品牌/型号')
            ->setCellValue('G1', '★单价（人民币）')
			->setCellValue('H1', '★数量')
			->setCellValue('I1', '折扣金额')
			->setCellValue('J1', '合计（人民币）')
			->setCellValue('K1', '备注');
	//获取当前sheet;		
	$objActSheet = $objPHPExcel->getActiveSheet();
	
	$row = 2; // 1-based index
	foreach( $obj_require as $obj )
	{
		$type_name = $obj->type_name;
		$require_mark_pdm = '';
		$require_mark_desgin = '';
		
		$num = (int)$obj->require_ads;//需求数量
		//折扣金额  = 价格调整
		//这里导出的是折扣价 也就是和实际的相反数
		$change_price = $obj->require_pm_cost_change == 1 ? $obj-> require_pm_cost : -$obj-> require_pm_cost;	//是否手动调整了价格
		//评级
		$require_rating = 'B';
		$att_rating = 'B';
		
		if($obj->require_rating){
			$require_rating = $obj->require_rating;
		}

		//需求所在的月份
		$date = date('Y-m-01',strtotime($obj->require_start_date)) ;
		
		//主需求
		if($obj -> att_is_parent == 1){
			$price = getPrice($obj->type_id,$obj->cp_id,$require_rating,$date) ;
			
			$final_price = $price * $num;
			//需求类型为非其他
			if($obj->attr_type_id == 9){

				//财务报表导入时 会过滤单价为0的数据 故需要将单价改成最终价
				//财务系统无法计算负数价格
				$price = $final_price;
				$num = 1;
				$change_price = 0;
				

			}
			// echo $final_price .'==' .$price .'==' .$obj->type_id .'==' . $obj->cp_id .'==' . $require_rating .'==' . $num;
		}else if($obj -> att_is_parent == 0){
			//配套需求
			$type_name = getTypeName($obj->attr_type_id);
			$num = (int)$obj->att_text;
			//判断是否需要评分
			$att_check = getTypeCheck($obj->attr_type_id);
			//需要
			if($att_check == 1){
				$att_rating = $require_rating;
			}
			$price = getPrice($obj->attr_type_id,$obj->cp_id,$att_rating,$date);
			$final_price = $price * (int)$obj->att_text;
			$change_price = 0;
			
		}else{
			//调整价格的需求
			$type_name = '价格调整';
			$price = $change_price;		//单价等于调整的价格
			$num = 1;					//数量为1
			$final_price = $change_price;	//最终价格等于调整的价格
			$change_price = 0 ;			//调整价格归零
		};


		
		//二级子类
		$sub_item = getSecondaryItem($obj->require_type_id);
		
		$objActSheet->getRowDimension($row)->setRowHeight(24);				//行高

		$objActSheet
				->setCellValue('A' . $row,$obj->rank_short . $obj->require_id)
				->setCellValue('B' . $row,'网媒设计')
				->setCellValue('C' . $row, $sub_item)					//二级子类
	            ->setCellValue('D'. $row, $type_name)					//类型 item
	            ->setCellValue('E'. $row, '个')							//计价单位
	            ->setCellValue('F'. $row, $obj->require_rating)			//规格/品牌/型号
	            ->setCellValue('G'. $row, $price)						//单价
				->setCellValue('H'. $row, $num)							//数量
				->setCellValue('I'. $row, 0)							//折扣金额		(由于调整金额另起一行记录，故折扣不需要了)
				->setCellValue('J'. $row, $final_price)					//小计
				->setCellValue('K'. $row, $obj->require_cost_comment);	//备注
		//echo $final_price .'==' .$price .'==' .$obj->type_id .'==' . $obj->cp_id .'==' . $require_rating .'==' . $num.'-------' ;		
		$row ++;

	}

	$last_row = $row -1;
	
	//设置列宽
	$objActSheet->getColumnDimension('A')->setWidth(10);
	$objActSheet->getColumnDimension('B')->setWidth(25);
	$objActSheet->getColumnDimension('C')->setWidth(15);
	$objActSheet->getColumnDimension('D')->setWidth(12);
	$objActSheet->getColumnDimension('E')->setWidth(15);
	$objActSheet->getColumnDimension('F')->setWidth(9);
	$objActSheet->getColumnDimension('G')->setWidth(13);
	$objActSheet->getColumnDimension('H')->setWidth(9);
	$objActSheet->getColumnDimension('I')->setWidth(12);
	$objActSheet->getColumnDimension('J')->setWidth(40);
	//设置sheet名称
	$objActSheet->setTitle($name);  	
};



// Set active sheet index to the first sheet, so Excel opens this as the first sheet
$objPHPExcel->setActiveSheetIndex(0);

$e_name = 'ecd_task_' . time().'.xlsx';
// Redirect output to a client’s web browser (Excel5)
$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
$objWriter->save('../excel/'.$e_name);
$result = array(
	'success' => true,
	'filename' => $e_name
);
echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);


exit;

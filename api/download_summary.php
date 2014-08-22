<?php
//最大执行时间，防止处理时间过长导致出错
set_time_limit(0);
/** Error reporting */
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);
date_default_timezone_set("Asia/Shanghai");

if (PHP_SAPI == 'cli')
	die('This example should only be run from a Web Browser');

/** Include PHPExcel */
require_once '../Classes/PHPExcel.php';
require_once 'functions.php';


if(empty($_GET["date"]))
{
	exit;
}

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
							 ->setKeywords("ECD TASK DATA")
							 ->setCategory("ECD TASK DATA");



//设置统一样式


$default_style = array( 
	'alignment' => array( 
		'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
		'vertical' => PHPExcel_Style_Alignment::VERTICAL_CENTER
	  ), 	
	'font' => array( 
		'size' => 9,
		'name' => '微软雅黑') ,
);

$objPHPExcel->getDefaultStyle()->applyFromArray($default_style);
$objPHPExcel->getDefaultStyle()->getAlignment()->setWrapText(TRUE);		//自动换行

/**
 *  获取月份
 */
function getMonth($date){
	$time = strtotime($date);
	return date("m月",$time);
};

/**
 *  根据时间和cp 和部门 获取数据
 */
function getDataByDateCp($cp_id,$rank_id){
	$date = $_GET["date"];
	$sql = "SELECT IF(count IS NULL , 0, count) as count,  tb_type.`type_name`
			FROM 
			(select require_type_id ,tb_type.type_name,sum(`att_text`) as count 
			FROM tb_require 
			INNER JOIN tb_attribute ON tb_require.`require_id` = tb_attribute.att_require_id
			INNER JOIN  `tb_type` ON  `tb_type`.`type_id` =  `tb_require`.`require_type_id`
			WHERE DATE_FORMAT(  tb_require.`require_start_date` ,  '%Y-%m' ) = DATE_FORMAT( '". $date ."',  '%Y-%m' ) 
			AND tb_require.require_cp_id = ". $cp_id ."
			AND tb_require.require_rank_id = ". $rank_id ."
			GROUP BY require_type_id) indTable
			RIGHT JOIN tb_type on indTable.require_type_id = tb_type.type_id
			where  `tb_type`.`type_state` =1
			ORDER BY  `tb_type`.`type_sort` ASC ,  `tb_type`.`type_check` DESC"	;
			
	$db = getConnection();
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$obj_require = $stmt->fetchAll(PDO::FETCH_OBJ);
	$db = null;
	return $obj_require;
};

/**
 *  根据CP ID 获取部门开销金额
 */
function getPriceRankByCp($cp_id){
	$date = $_GET["date"];
	$sql = "SELECT IF( price IS NULL , 0, price ) AS price, tb_rank.`rank_name`,tb_rank.`rank_id` 
			FROM (
			SELECT SUM(  `require_final_cost` ) AS price, require_rank_id, tb_rank.`rank_name` ,tb_rank.`rank_id` 
			FROM  `tb_require` 
			INNER JOIN  `tb_rank` ON  `tb_rank`.`rank_id` =  `tb_require`.`require_rank_id` 
			WHERE DATE_FORMAT(  `tb_require`.`require_start_date` ,  '%Y-%m' ) = DATE_FORMAT('". $date ."',  '%Y-%m' ) 
			AND  `require_cp_id` =". $cp_id ."
			GROUP BY  `require_rank_id`
			)indTable
			RIGHT JOIN tb_rank ON indTable.require_rank_id = tb_rank.rank_id
			where tb_rank.rank_state = 1
			ORDER BY  `rank_sort` ASC";
	$db = getConnection();
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$obj_require = $stmt->fetchAll(PDO::FETCH_OBJ);
	$db = null;
	return $obj_require;		
};


//////get type 
$sql_type = 'SELECT type_id,type_name FROM  `tb_type` where type_state = 1 ORDER BY  `type_sort` ASC , `type_check` DESC';
$db = getConnection();
$stmt = $db->prepare($sql_type);  
$stmt->execute();
global $obj_type;
$obj_type = $stmt->fetchAll(PDO::FETCH_OBJ);



///////get Rank
$sql_rank = "SELECT rank_id,rank_name  FROM `tb_rank` WHERE `rank_state` = 1  ORDER BY  `rank_sort` ASC";
$stmt = $db->prepare($sql_rank);  
$stmt->execute();
global $obj_rank;
$obj_rank = $stmt->fetchAll(PDO::FETCH_OBJ);

///////get cp
$sql_cp = "SELECT * FROM `tb_cp` WHERE `cp_state` = 1";
$stmt = $db->prepare($sql_cp);  
$stmt->execute();
global $obj_cp;
$obj_cp = $stmt->fetchAll(PDO::FETCH_OBJ);
$db = null;
//drawSheet(0,1,'全部');

$num = 0;
foreach ($obj_cp as $obj) {
	$cp_id = $obj->cp_id;
	$cp_name = $obj->cp_name;
	drawSheet($num,$cp_id,$cp_name);
	$num++;
};

// $obj_price = getPriceRankByCp($cp_id);
// dump($obj_price);
// exit;



// drawSheet($obj_require,$num);
//exit;
function drawSheet($num,$cp_id,$cp_name){
	global $objPHPExcel;
	global $obj_type;	//需求类型列表
	global $obj_rank;	//部门列表
	if($num != 0){
		$objPHPExcel->createSheet($num);
	};
	// Add some data
	
	$objPHPExcel->setActiveSheetIndex($num);
	$objActSheet = $objPHPExcel->getActiveSheet();
	
	//设置表头
	$col = 'C';			//表格列名  ABCD
	foreach ($obj_type as $obj) {
		//设置excel 表头名称
		$objActSheet->setCellValue($col . '1', $obj->type_name);
		$col++;
	};
	$objActSheet->setCellValue('A1', '时间');		//时间
	$objActSheet->setCellValue('B1', '分类');		//时间
	$objActSheet->setCellValue($col .'1', '金额');	//金额
	
	//绘制内容数据
	$index = 2;
	foreach ($obj_rank as $obj) {
		$obj_require = getDataByDateCp($cp_id,$obj->rank_id);
		//设置excel B列名称
		$objActSheet->setCellValue('B'.$index, $obj->rank_name);			//部门分类名称
		$col = 'C';
		foreach ($obj_require as $req) {
			//设置excel 内容
			$objActSheet->setCellValue($col . $index, $req->count);
			$col++;
		}
		$index++;
	};
	
	//绘制表格底部合计数据
	$objActSheet->setCellValue('B' . $index, '合计：');		//底部统计数据
	$tj = 'C';			//表格列名  ABCD
	foreach ($obj_type as $obj) {
		///末行
		$objActSheet->setCellValue($tj . $index, '=SUM('. $tj. '2:'. $tj. ($index-1) .')');
		$tj++;
	};
	
	//绘制价格总额
	$obj_price = getPriceRankByCp($cp_id);
	$index = 2;
	foreach ($obj_price as $obj) {
		$objActSheet->setCellValue($tj . $index,$obj->price );
		//设置行高
		$objActSheet->getRowDimension($index)->setRowHeight(24);				//行高
		$index++;
	};
	//末行计算总价
	$objActSheet->setCellValue($tj . $index, '=SUM('. $tj. '2:'. $tj. ($index-1) .')');
	
	//合并单元格  
	$objActSheet->mergeCells('A2:A'.$index); 
	$objActSheet->setCellValue('A2',getMonth($_GET["date"]));
	
	//设备标题
	$objActSheet->setTitle($cp_name);  
	
	//设置默认行宽高
	$objActSheet->getDefaultColumnDimension()->setWidth(11.5);
	$objActSheet->getDefaultRowDimension()->setRowHeight(-1);				//行高auto
	
	//首行样式
	$style_first = array( 
		'fill' => array( 
			'type' => PHPExcel_Style_Fill::FILL_SOLID, 
			'color' => array('rgb'=>'FFFF00'), ), 
		'font' => array( 
			'bold' => true, 
			'color' => array('rgb'=>'000000'),) 
	);
	$objActSheet->getStyle('A1:'. $tj .'1')->applyFromArray($style_first);
	$objActSheet->getStyle($tj . $index)->applyFromArray($style_first);
	//月份列宽
	$objActSheet->getColumnDimension('A')->setWidth(8);
	//设置标题加粗
	$objActSheet->getStyle('A1:B'.$index)->getFont()->setBold(true);
	//设置首行行高
	$objActSheet->getRowDimension(1)->setRowHeight(40);				//行高
	//设置末行行高
	$objActSheet->getRowDimension($index)->setRowHeight(24);				//行高
	//单元格边框样式
	$default_border = array(
	    'style' => PHPExcel_Style_Border::BORDER_THIN,
	    'color' => array('rgb'=>'999999')
	);
	$style_border = array( 
		'borders' => array(
        'allborders' => $default_border
    	),
	);
	$objActSheet->getStyle('A1:'. $tj .$index)->applyFromArray($style_border);
	
	//dump($obj_require);
	//dump($obj_type);
	//dump($obj_rank);
	
};




// Set active sheet index to the first sheet, so Excel opens this as the first sheet
$objPHPExcel->setActiveSheetIndex(0);

$e_name = 'ecd_task_' . time().'.xlsx';

//Redirect output to a client’s web browser (Excel5)
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="'. $e_name .'"');
header('Cache-Control: max-age=0');

$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
$objWriter->save('php://output');
exit;

?>


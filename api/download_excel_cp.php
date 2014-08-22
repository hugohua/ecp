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

if (!isset ( $_POST ['data'] )){
 	exit;
};

$data =  $_POST ['data'];

// dump($data);
// exit;

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

$objActSheet = $objPHPExcel->getActiveSheet();

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

//首行样式
$style_first = array( 
	'fill' => array( 
		'type' => PHPExcel_Style_Fill::FILL_SOLID, 
		'color' => array('rgb'=>'BAE18F'), ), 
	'font' => array( 
		'bold' => true, 
		'color' => array('rgb'=>'000000'),) 
);

//首列样式
$style_row = array( 
	'font' => array( 
		'bold' => true, 
		'color' => array('rgb'=>'000000'),) 
);

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

/**
 *  获取月份
 */
function getMonth($date){
	$time = strtotime($date);
	return date("m月",$time);
};

$num = 0;
//循环CP列表
foreach ($data as $obj) {
	$cp_name = $obj['name'];
	$sdata = $obj['data'];
	//创建worksheet
	if($num != 0){
		$objPHPExcel->createSheet($num);
	};
	// Add some data
	
	$objPHPExcel->setActiveSheetIndex($num);
	$objActSheet = $objPHPExcel->getActiveSheet();
	//设置默认行宽高
	$objActSheet->getDefaultColumnDimension()->setWidth(11.5);
	$objActSheet->getDefaultRowDimension()->setRowHeight(24);				//行高auto
	//设备标题
	$objActSheet->setTitle($cp_name);  
	//新增事件列
	$objActSheet->setCellValue('A1', '时间');		//时间

	$i = 0;	//行数 excel的一行 循环
	//单个CP数据
	foreach ($sdata as $key) {
		$i++;
		$j = 'a';  //excel 列
		//一行数据
		$length = count($key) + 1;
		foreach($key as $k=>$v)
		{
			$j++;
			$objActSheet->setCellValue($j . $i, $v);
		}
		//设置行高
		$objActSheet->getRowDimension($i)->setRowHeight(24);				//行高
		// $objActSheet->setCellValue('A2',getMonth($_GET["date"]));
		
	}
	$num++;

	//合并单元格  
	$objActSheet->mergeCells('A2:A'.$i); 
	//月份列宽
	$objActSheet->getColumnDimension('A')->setWidth(8);

	//设置样式
	//首行样式
	$objActSheet->getStyle('A1:'. $j .'1')->applyFromArray($style_first);
	$objActSheet->getStyle($j . $i)->applyFromArray($style_first);
	//首列样式
	$objActSheet->getStyle('A1:B' . $i)->applyFromArray($style_row);
	//设置首行行高
	$objActSheet->getRowDimension(1)->setRowHeight(40);				//行高
	//设置边框
	$objActSheet->getStyle('A1:'. $j .$i)->applyFromArray($style_border);
};




//exit;
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

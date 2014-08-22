<?php
/***
 * 导出派驻CP数据
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


$i = 0;	//行数 excel的一行 循环


foreach ($data as $obj) {
	//$cp_name = $obj['name'];
	$sdata = $obj['data'];
	//单个部门数据
	foreach ($sdata as $key) {
		$j = 'a';  //列数
		$jj = 0;	//用于清除多出的最后一列
		$i++;
		$length = count($key);
		//一行数据
		foreach($key as $k=>$v)
		{
			$objActSheet->setCellValue($j . $i, $v);
			$objActSheet->getRowDimension($i)->setRowHeight(24);				//行高
			//说明：$J最后会多出一个空列
			$jj++;
			if($length != $jj){
				$j++;
			}
		}
		
	}
	//设置列宽
};
//设置统一样式


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

//设置默认行宽高
$objActSheet->getDefaultColumnDimension()->setWidth(11.5);
$objActSheet->getDefaultRowDimension()->setRowHeight(24);				//行高
//设置首行行高
$objActSheet->getRowDimension(1)->setRowHeight(40);				//行高

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

$objActSheet->getStyle('A1:'. $j .$i)->applyFromArray($style_border);

//首行样式
$style_first = array( 
	'fill' => array( 
		'type' => PHPExcel_Style_Fill::FILL_SOLID, 
		'color' => array('rgb'=>'E6B9B8'), ), 
	'font' => array( 
		'bold' => true, 
		'color' => array('rgb'=>'000000'),) 
);
$objActSheet->getStyle('A1:' . $j .'1')->applyFromArray($style_first);
$objActSheet->getStyle($j . $i)->applyFromArray($style_first);

//首列样式
$style_row = array( 
	'font' => array( 
		'bold' => true, 
		'color' => array('rgb'=>'000000'),) 
);
$objActSheet->getStyle('A1:A' . $i)->applyFromArray($style_row);



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

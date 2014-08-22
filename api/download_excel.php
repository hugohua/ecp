<?php
/**
 * PHPExcel
 *
 * Copyright (C) 2006 - 2012 PHPExcel
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * @category   PHPExcel
 * @package    PHPExcel
 * @copyright  Copyright (c) 2006 - 2012 PHPExcel (http://www.codeplex.com/PHPExcel)
 * @license    http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt	LGPL
 * @version    1.7.8, 2012-10-12
 */
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

// Create new PHPExcel object
global $objPHPExcel;
$objPHPExcel = new PHPExcel();

$user_name = getSessionUser();
if(!$user_name){
    die('please login download excel!');
    exit;
}else{
    $power = getUserPower($user_name);
    if($power['user_power'] != 30 && $power['user_power'] != 40 && $power['user_power'] != 10){
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
// $objPHPExcel->getDefaultStyle()->getFont()->setSize(10);
// $objPHPExcel->getDefaultStyle()->getFont()->setName('微软雅黑');
// $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

//设置统一样式


$default_style = array(
    'alignment' => array(
        'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
        'vertical' => PHPExcel_Style_Alignment::VERTICAL_CENTER
    ),
    'font' => array(
        'size' => 10,
        'name' => '微软雅黑') ,
);

$objPHPExcel->getDefaultStyle()->applyFromArray($default_style);
//$objPHPExcel->getDefaultStyle()->getAlignment()->setWrapText(TRUE);		//自动换行

//拼装sql
$where = 'where 1 = 1 ';
$group_data = 0;
$group_pf = 1;		//是否显示评分

if (isset ( $_POST ['data'] )){
    $data =  $_POST ['data'];
    $where .= buildSearchSql($data);

    if($data['group'] != ''){
        $group_data = $data['group'];
    };

};


$table = ',tb_attribute.*';
$condition = ' LEFT JOIN tb_attribute ON tb_attribute.att_require_id = tb_require.require_id ';
$select = buildReqSelect('tb_require',$table,$condition);
$sql = $select . $where . ' order by tb_require.require_start_date asc';
$db = getConnection();
$stmt = $db->prepare($sql);
// echo $sql;
$stmt->execute();
$obj_require = $stmt->fetchAll(PDO::FETCH_OBJ);

//////get type 
$sql_type = 'SELECT * FROM  `tb_type` where type_state = 1 order by type_sort';
$stmt = $db->prepare($sql_type);
$stmt->execute();
global $obj_type;
$obj_type = $stmt->fetchAll(PDO::FETCH_OBJ);


////////get price
$sql_price = 'SELECT * FROM  `tb_price`';
$start_date = $date = date('Y-m-01',strtotime($data['require_start_date'])) ;
if(  $data['require_start_date'] != '' && $data['require_finish_date'] != ''){
    $sql_price.= "WHERE  DATE_FORMAT(price_month,'%Y-%m-%d') >= '". $start_date ."' and DATE_FORMAT(price_month,'%Y-%m-%d') <= '". $data['require_finish_date'] ."' ";
};

$stmt = $db->prepare($sql_price);
$stmt->execute();
global $obj_price;
$obj_price = $stmt->fetchAll(PDO::FETCH_OBJ);

///////get Rank
$sql_rank = "SELECT *  FROM `tb_rank` WHERE `rank_state` = 1  ORDER BY  `rank_sort` ASC";
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
drawSheet($obj_require,0,'全部');
switch ($group_data) {
    case '1':
        groupByRank($obj_require);
        break;
    case '2':
        groupByCp($obj_require);
        break;
}

//dump($obj_type);
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




function groupByRank($obj_require){
    //构造 rank object
    $objects = array();
    global $obj_rank;
    foreach ($obj_rank as $ranks) {
        $rank_id = $ranks->rank_id;
        $objects[$rank_id] = array();

    }//foreach

    //构造需求数据
    foreach ($obj_require as $obj) {
        $rank_id = $obj->rank_id;
        //如果array存在
        array_push($objects[$rank_id],$obj);
    };
    $num =1;
    foreach ($objects as $obj) {
        //drawSheet($obj,$num);
        if($obj){
            $name = $obj[0]->rank_name;
            // dump($obj);
            drawSheet($obj,$num,$name);
            $num++;
        }
    }
};

function groupByCp($obj_require){
    //构造 rank object
    $objects = array();
    global $obj_cp;
    foreach ($obj_cp as $cps) {
        $cp_id = $cps->cp_id;
        $objects[$cp_id] = array();

    }//foreach

    //构造需求数据
    foreach ($obj_require as $obj) {
        $cp_id = $obj->cp_id;
        if($cp_id){
            //如果array存在
            array_push($objects[$cp_id],$obj);
        }
    };
    $num =1;
    foreach ($objects as $obj) {
        if($obj){
            $name = $obj[0]->cp_name;
            drawSheet($obj,$num,$name);
            $num++;
        }
    }
};

function getRequireIds($obj_require){
    $arr = array();
    $str = '';
    //构造需求数据
    foreach ($obj_require as $obj) {
        $req_id = $obj->require_id;
        $att = $obj->require_desgin_attachment;
        if($att){
            array_push($arr,$req_id);
            $str .= $req_id . ',';
        }
    };
    $newstr = substr($str,0,strlen($str)-1);
    return $newstr;
};

// drawSheet($obj_require,$num);
//exit;
function drawSheet($obj_require,$num,$name){
    global $objPHPExcel;
    if($num != 0){
        $objPHPExcel->createSheet($num);
    }
    // Add some data
    $objPHPExcel->setActiveSheetIndex($num)
        ->setCellValue('A1', '需求编号')
        ->setCellValue('B1', '需求名称')
        ->setCellValue('C1', '需求类型')
        ->setCellValue('D1', '需求提出人')
        ->setCellValue('E1', '需求时间')
        ->setCellValue('F1', '产品打分')
        ->setCellValue('G1', '设计打分')
        ->setCellValue('H1', '评级')
        ->setCellValue('I1', '合同单价(元)')
        ->setCellValue('J1', '数量(个)')
        ->setCellValue('K1', '计算金额(元)')
        ->setCellValue('L1', '备注');
    //获取当前sheet;
    $objActSheet = $objPHPExcel->getActiveSheet();

    $row = 2; // 1-based index
    foreach( $obj_require as $obj )
    {
        $type_name = $obj->type_name;
        $require_mark_pdm = '';
        $require_mark_desgin = '';

        $num = (int)$obj->require_ads;//需求数量
        $change_price = $obj->require_pm_cost_change == 1 ? $obj-> require_pm_cost : -$obj-> require_pm_cost;	//是否手动调整了价格
        $require_rating = 'B';
        $att_rating = 'B';
        //需求评级
        if($obj->require_rating){
            $require_rating = $obj->require_rating;
        }

        //需求所在的月份
        $date = date('Y-m-01',strtotime($obj->require_start_date)) ;

        //主需求
        if($obj -> att_is_parent == 1){
            //计算价格
            $price = getPrice($obj->type_id,$obj->cp_id,$require_rating,$date) ;
            //主需求加上 调整价格
            $final_price = $price * $num +  (int)$change_price;
            //需求类型为非其他
            // if($obj->attr_type_id != 9){
            // $final_price = $price * $num;
            // }else{
            // //如果是其他的话 则把调整的价格算在其他类型上
            // $final_price = (int)$change_price;
            // }
        }else{
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
            //配套需求价格
            $final_price = $price * (int)$obj->att_text;

            //配套需求类型为非其他
            // if($obj->attr_type_id != 9){
            // $final_price = $price * (int)$obj->att_text;
            // }else{
            // //如果是其他的话 则把调整的价格算在其他类型上
            // $final_price = (int)$change_price;
            // }
        }

        //打分
        if($obj->require_mark_pdm != 0){
            $require_mark_pdm = $obj->require_mark_pdm;
        }
        if($obj->require_mark_desgin != 0){
            $require_mark_desgin = $obj->require_mark_desgin;
        };

        //评级
        if($obj->require_rating == 'A' || $obj->require_rating == 'C'){
            $style_color = array(
                'font' => array(
                    'color' => array('rgb'=>'FC031C'),)
            );
            $objActSheet->getStyle('H' . $row)->applyFromArray($style_color);
        };

        //价格有调整
        if($obj->require_pm_cost){
            $style_color = array(
                'font' => array(
                    'color' => array('rgb'=>'FC031C'),)
            );
            $objActSheet->getStyle('K' . $row)->applyFromArray($style_color);
        };


        $objActSheet->getRowDimension($row)->setRowHeight(24);				//行高

        $objActSheet
            ->setCellValue('A' . $row, $obj->rank_short . $obj->require_id)
            ->setCellValue('B' . $row, $obj->require_name)			//需求名称
            ->setCellValue('C'. $row, $type_name)					//类型
            ->setCellValue('D'. $row, $obj->require_creator )
            ->setCellValue('E'. $row, $obj->require_start_date)
            ->setCellValue('F'. $row, $require_mark_pdm)			//产品打分
            ->setCellValue('G'. $row, $require_mark_desgin)			//设计师打分
            ->setCellValue('H'. $row, $obj->require_rating)			//评级
            ->setCellValue('I'. $row, $price)						//合同价格
            ->setCellValue('J'. $row, $num)
            ->setCellValue('K'. $row, $final_price)						//结算价格
            ->setCellValue('L'. $row, $obj->require_cost_comment);						//价格调整说明
        //添加链接
        $objActSheet->getCell('A'.$row)->getHyperlink()->setUrl("design/" . $obj->require_id);

        $row ++;

        //是否需要下载设计稿
        // if($_POST['data']['downzip'] == 1){
// 			
        // };

    }

    $last_row = $row -1;
    ///末行
    $objActSheet->setCellValue('I' . $row, '=SUM(I2:I'. $last_row .')')
        ->setCellValue('K' . $row, '=SUM(K2:K'. $last_row .')');
    //合并单元格
    $objActSheet->mergeCells('A' . $row .':J'.$row);
    $objActSheet->setCellValue('A' . $row,'总计');
    //设置样式
    $currencyFormat = '\￥#,#0';
    $objActSheet->getStyle('K' . $row)->getNumberFormat()->setFormatCode($currencyFormat);

    //首行样式
    $style_last = array(
        'fill' => array(
            'type' => PHPExcel_Style_Fill::FILL_SOLID,
            'color' => array('rgb'=>'99CCFF'), ),
        'font' => array(
            'bold' => true,
            'color' => array('rgb'=>'FC031C'),)
    );
    $objActSheet->getStyle('A' . $row .':K'.$row)->applyFromArray($style_last);
    $objActSheet->getStyle('A' . $row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);
    //需求名称左对齐
    $objActSheet->getStyle('A1' . ':B'.$row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
    $objActSheet->getStyle('L1' . ':L'.$row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
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
    $objActSheet->getStyle('A2' . ':L'.$row)->applyFromArray($style_border);
    //显式指定内容类型

    $objActSheet->setTitle($name);  										//名称
    $objActSheet->getStyle('A1:L1')->getFont()->setBold(true);			//字体加粗
    $objActSheet->getDefaultRowDimension()->setRowHeight(24);				//行高

    //设置列宽
    $objActSheet->getColumnDimension('A')->setWidth(10);
    $objActSheet->getColumnDimension('B')->setWidth(40);
    $objActSheet->getColumnDimension('C')->setWidth(15);
    $objActSheet->getColumnDimension('D')->setWidth(12);
    $objActSheet->getColumnDimension('E')->setWidth(15);
    $objActSheet->getColumnDimension('F')->setWidth(9);
    $objActSheet->getColumnDimension('G')->setWidth(9);
    $objActSheet->getColumnDimension('H')->setWidth(8);
    $objActSheet->getColumnDimension('I')->setWidth(12);
    $objActSheet->getColumnDimension('J')->setWidth(10);
    $objActSheet->getColumnDimension('K')->setWidth(12);
    $objActSheet->getColumnDimension('L')->setWidth(60);

    //$objPHPExcel->getActiveSheet()->getColumnDimension('C')->setVisible(false);
    //$objActSheet->getColumnDimension('B')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);

    /////////设置首行
    //首行固定
    $objActSheet->freezePane('A2');
    //首行样式
    $style_header = array(
        'fill' => array(
            'type' => PHPExcel_Style_Fill::FILL_SOLID,
            'color' => array('rgb'=>'333399'), ),
        'font' => array(
            'color' => array('rgb'=>'FFFFFF'),)
    );
    $objActSheet->getStyle('A1:L1')->applyFromArray($style_header);

    //是否需要下载设计稿
    if($_POST['data']['downzip'] == 1){
        //链接样式
        $style_link = array(
            'font' => array(
                'underline' => PHPExcel_Style_Font::UNDERLINE_SINGLE,
                'color' => array('rgb'=>'0000FF'),)
        );
        $objActSheet->getStyle('A2' . ':A'.$row)->applyFromArray($style_link);
    };


    //首行设置筛选功能
    $objActSheet->getAutoFilter();
    $objActSheet->setAutoFilter($objActSheet->calculateWorksheetDimension());

    //删除 评分 2列
    if($_POST['data']['pingfen'] == 0){
        $objActSheet->removeColumn('F', 2);
    }
};


// Rename worksheet
//$objActSheet->setTitle('Simple');
$require_ids = '';
//是否需要下载设计稿
if($_POST['data']['downzip'] == 1){
    $require_ids = getRequireIds($obj_require);
};


// Set active sheet index to the first sheet, so Excel opens this as the first sheet
$objPHPExcel->setActiveSheetIndex(0);

$e_name = 'ecd_task_' . time().'.xlsx';
// Redirect output to a client’s web browser (Excel5)
$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
$objWriter->save('../excel/'.$e_name);
$result = array(
    'success' => true,
    'filename' => $e_name,
    'ids' => $require_ids
);
echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);


exit;

<?php 

//shell_exec('zip -r abc.zip task/design');
//echo 'good=';
/**
 * 通过调用linux 命令来完成压缩
 */


$ids = '';
$filename = 'ecd_task.zip';
//设置最大执行时间
ini_set('max_execution_time', 600);
//先删除之前的下载文件
$old_file = '../download/'.$filename;
if (file_exists($old_file)) {
	unlink ($old_file);
};

if (isset ( $_GET ['ids'] )){
	$ids = $_GET ['ids'];
};

$excel_name = '';
if (isset ( $_GET ['excel'] )){
	$excel_name = $_GET ['excel'];
	//添加excel文件到压缩包里
	shell_exec('zip -j ../download/'. $filename .' ../excel/'. $excel_name);
};
//开始构建 设计稿的 shell
$path = '../design/';
$shell = 'zip -r ../download/' . $filename . ' ';
$require_ids=explode(',',$ids);
foreach ($require_ids as $id) {
	$shell .= $path.$id .' ';
};
//执行shell命令
shell_exec($shell);

$result = array(
	'success' => true,
	'filename' => $filename
);
echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);

?>
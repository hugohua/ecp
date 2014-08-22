<?php
/***
 * 该文件用于获取Case设计稿
 */

require_once '../api/functions.php';

/***
 * 创建文件夹
 */
function mkdirs($dir, $mode = 0777) {
	if (is_dir ( $dir ) || @mkdir ( $dir, $mode ))
		return true;
	if (! mkdirs ( dirname ( $dir ), $mode ))
		return false;
	return @mkdir ( $dir, $mode );
}

//检查数据库用户是否存在，存在返回记录数
function getData(){
	//echo $loginName;
	$sql = "SELECT `require_id`,`require_desgin_attachment` FROM `tb_require` WHERE `require_desgin_attachment` IS NOT NULL and require_id = 1769 ";
	$db = getConnection();
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
	
	return $req_data;
};

function saveFile(){
	$req_data = getData();
	//dump($req_data);
	foreach ($req_data as $obj) {
		//获取字段 并转为对象
		$data = json_decode($obj->require_desgin_attachment);
		//获取需求ID
		$require_id = $obj->require_id;
		//创建需求ID文件夹
		mkdirs($require_id);
		
		$arr = $data->attachment;
		foreach ($arr as $d) {
			$url = $d->url;
			$file = file_get_contents($url);
			$filename = basename($url);
			$state = file_put_contents($require_id .'/' .basename($url),file_get_contents($url));
			if($state){
				echo 'success. id = ' . $require_id . ' file=' .$filename .'<br />';
			}
		};
		
	};
	// mkdirs(22);
	// $obj = json_decode($req_data[0]->require_desgin_attachment);
	// dump($obj);
	// $url = $obj->attachment[0]->url;
	// //echo $url;
// 	
	// $file = file_get_contents($url);
	// $state = file_put_contents(basename($url),file_get_contents($url));
	// echo $state . '==';
}

saveFile();
	
?>

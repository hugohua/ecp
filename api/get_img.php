<?php

if(!empty($_GET["url"]) )
{
	$url=$_GET["url"];
	$id = $_GET["id"];
	// 图片名称
	$imgname = basename($url);
	
	//腾讯内网需要代理才能访问外部页面
	$proxyContext = array(
	    'http' => array(
	        'proxy' => 'tcp://172.27.28.234:8080',
	        'request_fulluri' => true,
	    ),
	);
	$proxy = stream_context_create($proxyContext);
	
	//path
	$path = '../design/' . $id . '/' ;
	
	mkdirs($path);
	
	$response = file_put_contents($path . $imgname, file_get_contents($url,FALSE,$proxy));
	
	echo $response;

}

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

?>

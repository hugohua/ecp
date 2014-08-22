<!DOCTYPE HTML>
<html>
<head>
	<meta charset="utf-8" />
	<title>ECD-文件查看器</title>
    <link rel="shortcut icon" type="image/x-icon" href="http://est.oa.com/img/favicon.ico"/>
</head>
<body>
<?php 

 if (isset($_GET['url'])) {  
 	$url = $_GET['url'];
	$size = getimagesize($url);
	
?>

<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="<?php echo $size[0] ?>" height="<?php echo $size[1] ?>">
    <param name="movie" value="<?php echo $url ?>" />
    <param name="bgcolor" value="#FFFFFF" />
    <param name="wmode" value="transparent" />
    <param name="allowScriptAccess" value="always" />
    <param name="allowNetWorking" value="all" />
    <param name="scale" value="noscale" />
    <param name="flashvars" value="" />
    <embed src="<?php echo $url ?>" flashvars="" bgcolor="#FFFFFF" wmode="transparent" width="<?php echo $size[0] ?>" height="<?php echo $size[1] ?>"  allowScriptAccess="always" allowNetWorking="all" scale="noscale" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer"/>				
</object>

<?php	
 }

?>
</body>
</html?
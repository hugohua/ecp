<?php

	// 这边服务器采用的是phantomjs 来生成网页快照<http://sjolzy.cn>
$cd = 'phantomjs cut.js http://www.baidu.com/ baidu.png';

exec($cd);
?>

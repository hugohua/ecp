<?php

require 'Slim/Slim.php';
require_once 'functions.php';
require_once 'prices.php';


$app = new Slim();


/**
 * 创建需求查询sel数据
 */
function buildReqSql($sql){
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		$response = '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		$response  = '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	};
	return $response;
};



/**
 * 插入一条数据
 */
$app->post('/require', function () use ($app) {
	$req_data = $app->request()->post();
	$data = $req_data['require'];
	$data['require_add_time'] = date('Y-m-d H:i:s');
	$sql = buildSqlInsert('tb_require',$data);
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$data['require_id'] = $db->lastInsertId();
		//插入tb_attribute表
		$att = array(
			'att_require_id' => $data['require_id'],
			'att_text' => $data['require_ads'],
			'attr_type_id' => $data['require_type_id'],
			'att_rank_id' => $data['require_rank_id'],
			'att_is_parent' => 1,
		);
		$sql2 = buildSqlInsert('tb_attribute',$att);
		$stmt = $db->prepare($sql2);
		$stmt->execute();
		
		
		$db = null;
		echo '{"require":'. json_encode($data) .'}'; 
		elog(" post require success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post require error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});

/**
 * 根据id 获取用户数据
 */
$app->get('/require/id/:id', function($id) use ($app){
	$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
	$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require.require_creator ';
	
	$select = buildReqSelect('tb_require',$tb_user,$tb_join);
	$sql = $select . ' where require_id=' . $id;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchObject();
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 根据id 获取用户数据
 */
$app->get('/require_bak/id/:id', function($id) use ($app){
	$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
	$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require_bak.require_creator ';
	
	$select = buildReqSelect('tb_require_bak',$tb_user,$tb_join);
	$sql = $select . ' where require_id=' . $id;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchObject();
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 获取一段时间的 需求
 */
$app->get('/require/pdm/:start/:end', function($start,$end) use ($app){
	$sql = "select tb_require.*,tb_rank.*,tb_type.* from tb_require  INNER JOIN  tb_rank  ON tb_require.require_rank_id=tb_rank.rank_id  INNER JOIN tb_type ON tb_type.type_id=tb_require.require_type_id Where `require_workload` !=0 and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') <= '". $end ."' order by tb_require.require_start_date and `is_del` = 0";
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 更新CP列表
 */
$app->put('/require/cp', function () use ($app) {
	$req_data = $app->request()->put();
	$display_order = $req_data['require'];
	//echo '===11==';
	//dump($display_order);
	$ids = implode(',', array_keys($display_order));
	$sql = "UPDATE tb_require SET require_cp_id = CASE require_id ";
	foreach ($display_order as $id => $ordinal) {
	    $sql .= sprintf("WHEN %d THEN %d ", $id, $ordinal);
	};
	$sql .= "END, require_state =  CASE require_id ";
	foreach ($display_order as $id => $ordinal) {
	    $sql .= sprintf("WHEN %d THEN 2 ", $id);
	}
	$sql .= " END WHERE require_id IN ($ids)";
	//echo '==='.$sql;
	
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"require":'. json_encode($display_order) .'}'; 
		elog(" put require cp success. msg = " .json_encode($display_order) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put require cp error. data = ". json_encode($display_order) ." msg = " . $e->getMessage() ,'error');
	}
});

/**
 * 根据ID 修改需求 
 */
$app->put('/require/:id', function ($id) use ($app) {
	$req_data = $app->request()->put();
	$data = $req_data['require'];
	$where = '`require_id` =' . $id;
	$sql = buildSqlUpdate('tb_require',$data,$where);
	$select = buildReqSelect();
	$sql2 = $select .' WHERE  `require_id` =' .$id;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		//更新需要后获取这条需求的所有信息
		$stmt2 = $db->prepare($sql2);  
		$stmt2->execute();
		$req_data2 = $stmt2->fetchObject();
		
		//更新数量
		if(isset($data['require_ads'])){
			$att = array(
				'att_require_id' => $id,
				'att_text' => $data['require_ads'],
				'attr_type_id' => $data['require_type_id'],
				'att_rank_id' => $data['require_rank_id'],
			);
			$sql3 = buildSqlUpdate('tb_attribute',$att,'`att_is_parent` = 1 and `att_require_id` =' . $id);
			$stmt = $db->prepare($sql3);  
			$stmt->execute();
		}
		
		$db = null;
		
		echo '{"require":'. json_encode($req_data2) .'}'; 
		elog(" put require id ". $id ." success. msg = " .json_encode($req_data2) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put require id ". $id ." error. data = ". json_encode($req_data2) ." msg = " . $e->getMessage() ,'error');
	}
});

$app->put('/del/require/:id',function ($id) use ($app) {
	$loginName = getSessionUser();
	// $sql = "DELETE FROM tb_require WHERE require_id=". $id;
	// $sql2 = "DELETE FROM tb_attribute WHERE att_require_id=". $id;

	$sql = "UPDATE  `tb_require` SET  `is_del` = '1',  `require_del_user` =  '". $loginName ."' WHERE  `require_id` = ". $id;
	$sql2 = "UPDATE  `tb_attribute` SET  `att_is_del` =  '1'  WHERE  `att_require_id` =". $id;
	// echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		
		//删除记录
		$stmt = $db->prepare($sql2);  
		$stmt->execute();
		
		$db = null;
		echo '{"require":{"require_id":'. $id .'}}'; 
		elog(" delete require id ". $id ." success. msg = require_id:" .$id );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" delete require id ". $id ." error. msg = " . $e->getMessage() ,'error');
	}
});


/**
 * 根据是否为派驻设计师 获取cp数据
 * type可选，可 1 是外派  0是正式 2是全部
 */
$app->get('/cp(/:type)', function($type = 2) use ($app){
	$where = '';
	switch ($type) {
		case '1':
			$where = ' AND cp_type = 1';
			break;
		
		case '0':
			$where = ' AND cp_type = 0';
			break;
	};
	$sql = "SELECT * FROM `tb_cp`
			LEFT JOIN `tb_rank` ON `tb_cp`.`cp_rank_id` = `tb_rank`.`rank_id` 
			WHERE `cp_state` = 1 ". $where ." ORDER BY cp_type ASC , cp_id ASC";
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"cp":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});


/**
 * 根据用户名获取用户信息 需求
 */
$app->get('/power/:user', function($user) use ($app){
	$sql = "SELECT * FROM `tb_users` WHERE `login_name` = '". $user ."'";
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchObject();
		$db = null;
		echo '{"users":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 根据用户名 获取 权限信息 及初始化页面所需数据
 */
$app->get('/app/:user', function($user) use ($app){
	$sql = "SELECT * FROM `tb_users` WHERE `login_name` = '". $user ."'";
	$sql_type = "SELECT *  FROM `tb_type` WHERE `type_state` = 1 ORDER BY  `type_sort` ASC ,  `type_check` DESC ";
	$sql_rank = "SELECT *  FROM `tb_rank` WHERE `rank_state` = 1  ORDER BY  `rank_sort` ASC";
	$sql_cp = "SELECT *  FROM `tb_cp` WHERE `cp_state` = 1 ORDER BY cp_type ASC";
	$sql_rank_cate = "SELECT * FROM  `tb_rank_cate` WHERE  `rank_cate_state` = 1 ORDER BY `rank_id` ASC";
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchObject();
		
		$stmt = $db->prepare($sql_type);  
		$stmt->execute();
		$type_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$stmt = $db->prepare($sql_rank);  
		$stmt->execute();
		$rank_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$stmt = $db->prepare($sql_cp);  
		$stmt->execute();
		$cp_data = $stmt->fetchAll(PDO::FETCH_OBJ);

		$stmt = $db->prepare($sql_rank_cate);  
		$stmt->execute();
		$rankcate_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$data = new StdClass;
		$data->cp = $cp_data;
		$data->type = $type_data;
		$data->rank = $rank_data;
		$data->rankcate = $rankcate_data;
		$data->user = $req_data;
		$db = null;
		echo '{"app":'. json_encode($data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 根据id 获取用户数据
 */
$app->get('/user/:id', function($id) use ($app){
	$sql = "SELECT * FROM `tb_users` WHERE `user_id` = '". $id ."' order by id desc";
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchObject();
		$db = null;
		echo '{"users":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 根据id 修改用户
 */
$app->put('/user/:id', function ($id) use ($app) {
	$req_data = $app->request()->put();
	$data = $req_data['users'];
	$where = '`id` =' . $id;
	$sql = buildSqlUpdate('tb_users',$data,$where);
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"users":'. json_encode($data) .'}'; 
		elog(" put user id ". $id ." success. msg = :" .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put user id ". $id ." error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});

/**
 *  删除用户
 */
$app->delete('/user/:id',function ($id) use ($app) {
    $sql = "DELETE FROM tb_users WHERE id=". $id;
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
        echo '{"users":{"id":'. $id .'"}}';
        elog(" del user id ". $id ." success. msg = user_id:" .$id );
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
        elog(" del user id ". $id ." error. msg = " . $e->getMessage() ,'error');
    }
});

/**
 *  修改用户密码
 */
$app->put('/password',function () use ($app) {
    $req_data = $app->request()->put();
    $data = $req_data['users'];
    $user = $data['login_name'];
    $password = md5(md5($data['user_password']));
    $checkUserSql = "SELECT `id` FROM  `tb_users` WHERE `login_name` ='$user'";
    $sql = "UPDATE  `tb_users` SET  `user_password` =  '$password' WHERE  `login_name` ='$user'";

    try {
        $db = getConnection();
        $stmt = $db->prepare($checkUserSql);
        $stmt->execute();
        $check = $stmt->fetchColumn();
        //用户名不存在
        if(!$check){
            echo '{"error":{"msg":"'. $user .' 这个用户名不存在！"}}';
        }else{
            $stmt = $db->prepare($sql);
            $stmt->execute();
            echo '{"users":{"username":"'. $user .'"}}';
            elog(" update user name ". $user ." success. msg = user_name:" .$user );
        }
        $db = null;
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
        elog(" update user name ". $user ." error. msg = " . $e->getMessage() ,'error');
    }
});

//////////按类型进行筛选查找/////////////////




/**
 * 1是待排期
 * 获取一段时间的 需求
 */
$app->get('/require/list/:user/:power/:power_rank/:state/:type(/:cp_id)', function($user,$power,$power_rank,$state,$type,$cp_id = 'all') use ($app){
	$tb_user = '';
	$tb_join = '';
	//if($state == 5){
		$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
		$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require.require_creator ';
	//};
	
	$select = buildReqSelect('tb_require',$tb_user,$tb_join);
	if($cp_id != 'all'){
		$where_state = ' where cp_id = '. $cp_id . ' and `is_del` = 0 and ';
	}else{
		$where_state = ' where  `is_del` = 0 and';
	}
	
	//需求状态筛选
	$where_state .= buildStateSql($state);
	
	$where_type = buildDateSql($type);
	
	$where_user = buildUserSql($user,$power,$power_rank);

	//构造sql语句
	$sql = $select . $where_state . $where_type .$where_user . ' order by tb_require.require_start_date';
	//echo $sql;
	echo buildReqSql($sql);
});


/**
 * 获取一段时间的 需求 不包含 待排期
 */
$app->get('/require/date/:user/:power/:power_rank/:state/:start/:end', function($user,$power,$power_rank,$state,$start,$end) use ($app){
	
	$tb_user = '';
	$tb_join = '';
	if($state == 5){
		$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
		$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require.require_creator ';
	};
	
	$select = buildReqSelect('tb_require',$tb_user,$tb_join);
	
	$where_state = ' where `is_del` = 0 and ';
	$where_user = buildUserSql($user,$power,$power_rank);
	//需求状态筛选
	$where_state .= buildStateSql($state);
	
	$where_time = " and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') <= '". $end ."' ";
	
	//构造sql语句
	$sql = $select . $where_state . $where_time .$where_user . ' order by tb_require.require_start_date';
	//echo $sql;
	echo buildReqSql($sql);
	
});

/**
 *  批量更新需求状态
 *  PUT的内容是需求id 列表
 */
$app->put('/require/state/:state', function ($state) use ($app) {
	$req_data = $app->request()->put();
	$ids = $req_data['require'];
	$sql = "UPDATE tb_require SET require_state = ". $state ." WHERE require_id IN ($ids)";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"require":'. json_encode($ids) .'}'; 
		elog(" put require state ". $state ." success. msg = " .json_encode($ids) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put require state ". $state ." error. data = ". json_encode($ids) ." msg = " . $e->getMessage() ,'error');
	}
});

$app->post('/require/attribute/:requireid', function ($requireid) use ($app) {
	$req_data = $app->request()->post();
	$attribute = $req_data['attribute'];
	$sql = "INSERT INTO tb_attribute (att_require_id,att_text,attr_type_id) VALUES";
	$count = count($attribute);
	
	for($i = 0;$i < $count;$i++)
	{
	    $sql .= "(". $requireid .",'".$attribute[$i]['att_text']."','".$attribute[$i]['attr_type_id']."')";
	    if($i != $count - 1)
	    {
	        $sql .= ',';  //Will insert a comma after each except the last.  Count - 1 since $i will equal count - 1 on the last one, since it starts at 0 and not 1.
	    }
	}
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"require":'. json_encode($req_data) .'}'; 
		elog(" post require attribute by require id". $requireid ." msg = " .json_encode($req_data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post require attribute by require id". $requireid ." error. data = ". json_encode($req_data) ." msg = " . $e->getMessage() ,'error');
	}
});

/**
 * 获取需求属性
 */
$app->get('/require/attribute/:requireid', function($requireid) use ($app){
	$sql = "SELECT *  FROM `tb_attribute` INNER JOIN  tb_type  ON tb_attribute.attr_type_id=tb_type.type_id WHERE `att_is_parent` =0 and `att_require_id` = " . $requireid;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"attribute":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 批量获取需求属性
 */
$app->get('/require/attribute/list/:requireids', function($requireids) use ($app){
    $sql = "SELECT *  FROM `tb_attribute` INNER JOIN  tb_type  ON tb_attribute.attr_type_id=tb_type.type_id WHERE `att_is_parent` =0 and `att_require_id` in ( ". $requireids ." ) ";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"attribute":'. json_encode($req_data) .'}';
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

/**
 * 批量获取需求属性
 */
$app->get('/require_bak/attribute_bak/list/:requireids', function($requireids) use ($app){
    $sql = "SELECT *  FROM `tb_attribute_bak` INNER JOIN  tb_type  ON tb_attribute_bak.attr_type_id=tb_type.type_id WHERE `att_is_parent` =0 and `att_require_id` in ( ". $requireids ." ) ";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"attribute":'. json_encode($req_data) .'}';
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

/**
 * 批量更新需求属性
 */
$app->put('/require/attribute/ids', function () use ($app) {
	$req_data = $app->request()->put();
	$attribute = $req_data['attribute'];
	$count = count($attribute);
	//echo '===11==';
	//dump($display_order);
	$ids = '';
	$att_id = '';
	$att_txt = '';
	for($i = 0;$i < $count;$i++)
	{
		$ids .= $attribute[$i]['att_id'];
		$att_txt .= " WHEN " . $attribute[$i]['att_id'] ." THEN " . $attribute[$i]['att_text'];
		$att_id .= " WHEN " . $attribute[$i]['att_id'] ." THEN " . $attribute[$i]['attr_type_id'];
		
	    if($i != $count - 1)
	    {
	        $ids .= ',';  //Will insert a comma after each except the last.  Count - 1 since $i will equal count - 1 on the last one, since it starts at 0 and not 1.
	    }
	}
	
	$sql = "UPDATE tb_attribute SET attr_type_id = CASE att_id ";
	$sql .=$att_id ;
	$sql .= " END, att_text =  CASE att_id ";
	$sql .=$att_txt ;
	$sql .= " END WHERE att_id IN ($ids)";
	//echo '==='.$sql;
	
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"attribute":'. json_encode($attribute) .'}'; 
		elog(" put require attribute success. msg = " .json_encode($attribute) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put require attribute error. data = ". json_encode($attribute) ." msg = " . $e->getMessage() ,'error');
	}
});



/**
 * 更新广告数
 */
$app->put('/require/attribute/ads', function () use ($app) {
	
	$req_data = $app->request()->put();
	$data = $req_data['attribute'];
	$where = '`att_require_id` =' . $data['att_require_id'] .' and att_is_parent = 2 ';
	$sql = buildSqlUpdate('tb_attribute',$data,$where);
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"attribute":'. json_encode($data) .'}'; 
		elog(" put require attribute ads success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put require attribute ads error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});

/**
 *  删除需求属性
 */
$app->delete('/require/attribute/:id',function ($id) use ($app) {
	$sql = "DELETE FROM tb_attribute WHERE att_id=". $id;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		echo '{"attribute":{"att_id":'. $id .'"}}'; 
		elog(" del require attribute id ". $id ." success. msg = attribute:" .$id );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" del require attribute id ". $id ." error. msg = " . $e->getMessage() ,'error');
	}
});

/**
 * 获取需求概况
 */
$app->get('/require/summary/:user/:power', function($user,$power) use ($app){
	$select = "SELECT COUNT( * ) FROM tb_require";
	
	//待评分
	$state_8 = " where `require_state` = 4 and DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()) ";
	$pdm_state_8 = " where `require_state` = 4  and `require_mark_pdm`  = 0 and DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()) ";
	$desgin_state_8 = "  where `require_state` = 4  and `require_mark_desgin`  = 0 and DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()) ";
	
	//已完成
	$state_3 = " where `require_state`  in (3,11,12) ";
	//待排期
	$state_1 = " where `require_state` = 1 ";
	//待开始
	$state_9 = " where `require_state` = 9  ";
	//上周和本周
	$prev_week = " and YEARWEEK(date_format(require_start_date,'%Y-%m-%d'),1) = YEARWEEK(date_add(now(), interval -1 week),1) ";
	$this_week = " and YEARWEEK(date_format(require_start_date,'%Y-%m-%d'),1) = YEARWEEK(now(),1) ";
	$next_week = " and YEARWEEK(date_format(require_start_date,'%Y-%m-%d'),1) = YEARWEEK(date_add(now(), interval 1 week),1) ";
	$where_user = " and `is_del` = 0 ";
	//all时 表示项目经理 可查看全部
	if($user != 'all'){
		//产品经理
		if($power == 10){
			$where_user = "  and `is_del` = 0 and `require_creator` =  '". $user ."'";
			//待排期
			$state_1 = " where `require_state` IN (1,5) ";
			//产品经理待评分
			$state_8 = $pdm_state_8;
		}
		//设计师
		else if($power == 20){
			$where_user = "  and `is_del` = 0 and `require_verify_user` LIKE  '%". $user ."'%";
			$state_8 = $desgin_state_8;
		};
		$state_3 = " where `require_state` = 3 ";
	};
	
	//RTX提醒相关人员列表
	$select_2 = "SELECT require_creator FROM tb_require";

	//RTX提醒相关人员列表
	$select_3 = "SELECT require_verify_user FROM tb_require";
	
	//数据统计
	$select_4 = "SELECT COUNT(tb_require.require_id) as counts, tb_type.type_id as type_id ,tb_type.type_name as type_name
FROM  `tb_require` INNER JOIN tb_type ON tb_type.type_id=tb_require.require_type_id ";
	$groupby = " GROUP BY  `require_type_id`";
	
	/*********PDM视图**********/
	//上周
	$pre_sql_8 = $select . $state_8 .$prev_week .$where_user;
	$pre_sql_3 = $select . $state_3 .$prev_week .$where_user;
	$pre_sql_1 = $select . $state_1 .$prev_week .$where_user;
	
	//本周
	$this_sql_8 = $select . $state_8 .$this_week .$where_user;
	$this_sql_3 = $select . $state_3 .$this_week .$where_user;
	$this_sql_1 = $select . $state_1 .$this_week .$where_user;
	$this_sql_9 = $select . $state_9 .$this_week .$where_user;		//代开始
	
	//下周
	$next_sql_8 = $select . $state_8 .$next_week .$where_user;
	$next_sql_3 = $select . $state_3 .$next_week .$where_user;
	$next_sql_1 = $select . $state_1 .$next_week .$where_user;
	$next_sql_9 = $select . $state_9 .$next_week .$where_user;		//代开始
	
	/***********PM视图*************/
	//RTX弹窗提醒用户
	$pre_user_1 = $select_2 . $pdm_state_8 .$prev_week;
	$pre_user_2 = $select_3 . $desgin_state_8 .' and `require_mark_pdm`  != 0 ' .$prev_week;
	
	$this_user_1 = $select_2 . $pdm_state_8 .$this_week;
	$this_user_2 = $select_3 . $desgin_state_8 .' and `require_mark_pdm`  != 0 ' .$this_week;
	
	//数据概况统计
	$pre_statistics = $select_4 . " WHERE  `require_name` IS NOT NULL " . $prev_week .$where_user .$groupby;
	$this_statistics = $select_4 . " WHERE  `require_name` IS NOT NULL " . $this_week .$where_user .$groupby;
	$next_statistics = $select_4 . " WHERE  `require_name` IS NOT NULL " . $next_week .$where_user .$groupby;
	//临时需求
	$pre_lin = $select. " WHERE  `require_type` =0 " . $prev_week .$where_user ;
	$this_lin = $select. " WHERE  `require_type` =0 " . $this_week .$where_user ;
	$next_lin = $select. " WHERE  `require_type` =0 " . $next_week .$where_user ;
	
	try {
		$db = getConnection();
		$stmt = $db->prepare($pre_sql_8);  
		$stmt->execute();
		$pre_8 = $stmt->fetchColumn();
		
		$stmt = $db->prepare($pre_sql_3);  
		$stmt->execute();
		$pre_3 = $stmt->fetchColumn();
		
		$stmt = $db->prepare($pre_sql_1);  
		$stmt->execute();
		$pre_1 = $stmt->fetchColumn();
		
		$stmt = $db->prepare($this_sql_8);  
		$stmt->execute();
		$this_8 = $stmt->fetchColumn();
		
		$stmt = $db->prepare($this_sql_3);  
		$stmt->execute();
		$this_3 = $stmt->fetchColumn();
		
		$stmt = $db->prepare($this_sql_1);  
		$stmt->execute();
		$this_1 = $stmt->fetchColumn();
		
		//下周
		$stmt = $db->prepare($next_sql_8);  
		$stmt->execute();
		$next_8 = $stmt->fetchColumn();
		
		$stmt = $db->prepare($next_sql_3);  
		$stmt->execute();
		$next_3 = $stmt->fetchColumn();
		
		$stmt = $db->prepare($next_sql_1);  
		$stmt->execute();
		$next_1 = $stmt->fetchColumn();
		
		//统计
		$stmt = $db->prepare($pre_statistics);  
		$stmt->execute();
		$pre_s = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$stmt = $db->prepare($this_statistics);  
		$stmt->execute();
		$this_s = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$stmt = $db->prepare($next_statistics);  
		$stmt->execute();
		$next_s = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		//临时需求
		$stmt = $db->prepare($pre_lin);  
		$stmt->execute();
		$pre_l = $stmt->fetchColumn();
		
		$stmt = $db->prepare($this_lin);  
		$stmt->execute();
		$this_l = $stmt->fetchColumn();
		
		$stmt = $db->prepare($next_lin);  
		$stmt->execute();
		$next_l = $stmt->fetchColumn();
		
		
		$stmt = $db->prepare($this_sql_9);  
		$stmt->execute();
		$this_9 = $stmt->fetchColumn();
		
		
		$data = new StdClass;
		$data->pre_8 = $pre_8;
		$data->pre_3 = $pre_3;
		$data->pre_1 = $pre_1;
		$data->this_8 = $this_8;
		$data->this_3 = $this_3;
		$data->this_1 = $this_1;
		$data->this_9 = $this_9;
		//下周
		$data->next_8 = $next_8;
		$data->next_3 = $next_3;
		$data->next_1 = $next_1;
		//统计
		$data->total_pre = $pre_1 + $pre_3 + $pre_8 ;
		$data->total_this = $this_1 + $this_3 + $this_8 + $this_9;
		$data->total_next = $next_1 + $next_3 + $next_8 ;
		$data->pre_s = $pre_s;
		$data->this_s = $this_s;
		$data->next_s = $next_s;
		$data->pre_l = $pre_l;
		$data->this_l = $this_l;
		$data->next_l = $next_l;
		
		//PM
		if($user == 'all' && ($power >= 30 || $power == 40)){
			$stmt = $db->prepare($pre_user_1);  
			$stmt->execute();
			$pre_all_1 = $stmt->fetchAll(PDO::FETCH_NUM);
			
			$stmt = $db->prepare($pre_user_2);  
			$stmt->execute();
			$pre_all_2 = $stmt->fetchAll(PDO::FETCH_NUM);
			
			$stmt = $db->prepare($this_user_1);  
			$stmt->execute();
			$this_all_1 = $stmt->fetchAll(PDO::FETCH_NUM);
			
			$stmt = $db->prepare($this_user_2);  
			$stmt->execute();
			$this_all_2 = $stmt->fetchAll(PDO::FETCH_NUM);
			
			$data->user_create_pre = getUserList($pre_all_1);
			$data->user_desgin_pre = getUserList($pre_all_2);
			$data->user_create_this = getUserList($this_all_1);
			$data->user_desgin_this = getUserList($this_all_2);
		};
		
		$db = null;
		//echo $pre_lin;
		echo '{"summary":'. json_encode($data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 获取需求属性
 */
$app->get('/users/:power', function($power) use ($app){
	$sql = "SELECT * FROM  `tb_users` WHERE  `user_power` =" . $power;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"users":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 根据ID 修改需求 
 */
// $app->post('/user/', function ($id) use ($app) {
	// $req_data = $app->request()->post();
	// $data = $req_data['user'];
	// $sql = buildSqlInsert('tb_users',$data);
	// try {
		// $db = getConnection();
		// $stmt = $db->prepare($sql);  
		// $stmt->execute();
		// $data['require_id'] = $db->lastInsertId();
		// $db = null;
// 		
		// echo '{"require":'. json_encode($data) .'}'; 
	// } catch(PDOException $e) {
		// echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	// }
// });


$app->post('/cp', function () use ($app) {
	$req_data = $app->request()->post();
	$data = $req_data['cp'];
	$sql = buildSqlInsert('tb_cp',$data);
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$data['cp_id'] = $db->lastInsertId();
		$db = null;
		
		echo '{"cp":'. json_encode($data) .'}'; 
		elog(" post cp success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post cp error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});


$app->put('/cp', function () use ($app) {
	$req_data = $app->request()->put();
	$data = $req_data['cp'];
	$where = '`cp_id` =' . $data['cp_id'];
	$sql = buildSqlUpdate('tb_cp',$data,$where);
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"cp":'. json_encode($data) .'}'; 
		elog(" put cp id ". $data['cp_id'] ." success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put cp id ". $data['cp_id'] ." error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});


$app->get('/type', function() use ($app){
	$sql = "SELECT *  FROM `tb_type` WHERE `type_state` = 1 ORDER BY  `type_sort` ASC ,  `type_check` DESC ";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"type":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});


$app->post('/type', function () use ($app) {
	$req_data = $app->request()->post();
	$data = $req_data['type'];
	$sql = buildSqlInsert('tb_type',$data);
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$data['type_id'] = $db->lastInsertId();
		$db = null;
		
		echo '{"type":'. json_encode($data) .'}'; 
		elog(" post type success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post type error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});


$app->put('/type', function () use ($app) {
	$req_data = $app->request()->put();
	$data = $req_data['type'];
	$where = '`type_id` =' . $data['type_id'];
	$sql = buildSqlUpdate('tb_type',$data,$where);
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"type":'. json_encode($data) .'}'; 
		elog(" put type id ". $data['type_id'] ." success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put type id ". $data['type_id'] ." error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});


$app->get('/rank', function() use ($app){
	$sql = "SELECT *  FROM `tb_rank` WHERE `rank_state` = 1 ORDER BY  `rank_sort` ASC";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"rank":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});


$app->post('/rank', function () use ($app) {
	$req_data = $app->request()->post();
	$data = $req_data['rank'];
	$sql = buildSqlInsert('tb_rank',$data);
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$data['rank_id'] = $db->lastInsertId();
		$db = null;
		
		echo '{"rank":'. json_encode($data) .'}'; 
		elog(" post rank success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post rank error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});


$app->put('/rank', function () use ($app) {
	$req_data = $app->request()->put();
	$data = $req_data['rank'];
	$where = '`rank_id` =' . $data['rank_id'];
	$sql = buildSqlUpdate('tb_rank',$data,$where);
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"rank":'. json_encode($data) .'}'; 
		elog(" put rank id ". $data['rank_id'] ." success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put rank id ". $data['rank_id'] ." error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});

/**
 * 清除临时需求
 */
$app->put('/change/require/type/next', function () use ($app) {
	$req_data = $app->request()->put();
	$type = $req_data['type'];
	$sql = 'UPDATE `tb_require` SET `require_type`=' . $type . ' WHERE 1=1 ' . buildDateSql('next');
	// echo $sql;
	//exit;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"require":"success"}'; 
		elog(" put tb_require require_type = ". $type ." success. msg = " .json_encode($type) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put tb_require require_type = ". $type ." data = ". json_encode($type) ." msg = " . $e->getMessage() ,'error');
	}
});

$app->get('/price(/:date)', function($date = null) use ($app){
	$s = '';
	if(isset($date)){
		$s = " WHERE price_month = '" . $date . "'";
	}
	$sql = "SELECT *  FROM `tb_price`" . $s;
	$sql_type = "SELECT *  FROM `tb_type` WHERE `type_state` = 1  ORDER BY  `type_sort` ASC ,  `type_check` DESC ";
	$sql_cp = "SELECT *  FROM `tb_cp` WHERE `cp_state` = 1  ORDER BY cp_type ASC";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$stmt = $db->prepare($sql_type);  
		$stmt->execute();
		$req2_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$stmt = $db->prepare($sql_cp);  
		$stmt->execute();
		$cp_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$data = new StdClass;
		$data->price = $req_data;
		$data->type = $req2_data;
		$data->cp = $cp_data;
		
		$db = null;
		echo '{"prices":'. json_encode($data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 *  批量更新价格
 */
$app->post('/prices', function () use ($app) {
	$req_data = $app->request()->post();
	$attribute = $req_data['price'];
	$sql = "INSERT INTO tb_price (price_type_id,price_cp_id,price_name,price_rating,price_month) VALUES";
	$count = count($attribute);
	
	for($i = 0;$i < $count;$i++)
	{
	    $sql .= "(". $attribute[$i]['price_type_id'] .",'".$attribute[$i]['price_cp_id']."','".$attribute[$i]['price_name']."','".$attribute[$i]['price_rating'] ."','".$attribute[$i]['price_month'] ."')";
	    if($i != $count - 1)
	    {
	        $sql .= ',';  //Will insert a comma after each except the last.  Count - 1 since $i will equal count - 1 on the last one, since it starts at 0 and not 1.
	    }
	}
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"price":'. json_encode($req_data) .'}'; 
		elog(" post prices success. msg = " .json_encode($req_data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post prices error. data = ". json_encode($req_data) ." msg = " . $e->getMessage() ,'error');
	}
});


/**
 * 批量更新需求属性
 */
$app->put('/prices', function () use ($app) {
	$req_data = $app->request()->put();
	$attribute = $req_data['price'];
	$count = count($attribute);
	//echo '===11==';
	//dump($display_order);
	$ids = '';
	$price_type_id = '';
	$price_cp_id = '';
	$price_name = '';
	$price_month = '';
	for($i = 0;$i < $count;$i++)
	{
		$ids .= $attribute[$i]['price_id'];
		$price_type_id .= " WHEN " . $attribute[$i]['price_id'] ." THEN " . $attribute[$i]['price_type_id'];
		$price_cp_id .= " WHEN " . $attribute[$i]['price_id'] ." THEN " . $attribute[$i]['price_cp_id'];
		$price_month .= " WHEN " . $attribute[$i]['price_id'] ." THEN '" . $attribute[$i]['price_month'] ."'";
		$price_name .= " WHEN " . $attribute[$i]['price_id'] ." THEN " . $attribute[$i]['price_name'];
		
	    if($i != $count - 1)
	    {
	        $ids .= ',';  //Will insert a comma after each except the last.  Count - 1 since $i will equal count - 1 on the last one, since it starts at 0 and not 1.
	    }
	}
	
	$sql = "UPDATE tb_price SET price_type_id = CASE price_id ";
	$sql .=$price_type_id ;
	$sql .= " END, price_cp_id =  CASE price_id ";
	$sql .=$price_cp_id ;
	$sql .= " END, price_name =  CASE price_id ";
	$sql .=$price_name ;
	$sql .= " END, price_month =  CASE price_id ";
	$sql .=$price_month ;
	$sql .= " END WHERE price_id IN ($ids)";
	//echo '==='.$sql;
	
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"price":'. json_encode($attribute) .'}'; 
		elog(" put prices success. msg = " .json_encode($req_data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put prices error. data = ". json_encode($req_data) ." msg = " . $e->getMessage() ,'error');
	}
});

$app->get('/price/:typeid/:cpid', function($typeid,$cpid) use ($app){
	$sql = "SELECT *  FROM `tb_price` WHERE `price_type_id` = ". $typeid ." AND `price_cp_id` = " .$cpid;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchObject();
		
		$db = null;
		echo '{"prices":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 插入一条数据
 */
$app->post('/user', function () use ($app) {
	$req_data = $app->request()->post();
	$data = $req_data['users'];
	//如果密码存在
	if(isset($data['user_password'])){
		$data['user_password'] = md5(md5($data['user_password'])) ;
	};
	
	$sql = buildSqlInsert('tb_users',$data);
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$data['id'] = $db->lastInsertId();
		$db = null;
		
		echo '{"users":'. json_encode($data) .'}'; 
		elog(" post user success. msg = " .json_encode($data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post user error. data = ". json_encode($data) ." msg = " . $e->getMessage() ,'error');
	}
});


/**
 *  获取价格表
 */
$app->get('/onily/price(/:date)', function($date = null) use ($app){
	$s = '';
	if(isset($date)){
		$s = " WHERE price_month = '" . $date . "'";
	}
	$sql = "SELECT *  FROM `tb_price` WHERE `price_rating` IS NOT NULL" . $s;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$db = null;
		echo '{"prices":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

$app->post('/search/require', function () use ($app) {
	$data = $app->request()->post();
	$sql = buildReqSelect() . 'where 1=1 ';
	
	$sql .= buildSearchSql($data);
	
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 *  判断是否存在临时需求
 */
$app->get('/check/require/type/:start/:end', function($start,$end) use ($app){
	$sql = "select count(require_id) as count from tb_require Where `require_workload` !=0 and `require_state` in(3,4,9,11,12) ";
	$sql .= " and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(tb_require.require_start_date,'%Y-%m-%d') <= '". $end ."' ";
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchColumn();
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 *  判断某个用户是否有需求处于待评分状态
 */
$app->get('/check/require/pdm/:name', function($name) use ($app){
	$sql = "select count(require_id) as count from tb_require Where require_creator = '". $name ."' and 
	DATE_FORMAT(tb_require.require_finish_date,'%Y-%m-%d') <= date(now()) and
	date_format(require_start_date,'%Y-%m') <= date_format(DATE_SUB(curdate(), INTERVAL 1 MONTH),'%Y-%m') and `is_del` = 0 and ".
	buildStateSql(8);//产品待评分
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchColumn();
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 *  获取价格表
 */
$app->get('/require/list/:ids', function($ids) use ($app){
	$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
	$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require.require_creator ';
	$select = buildReqSelect('tb_require',$tb_user,$tb_join);
	$sql = $select . ' where require_id in('. $ids .')';
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 *  备份数据
 */
$app->post('/require_bak/:ids', function ($ids) use ($app) {
	$data = $app->request()->post();
	$sql = 'INSERT INTO tb_require_bak SELECT * FROM tb_require WHERE require_id IN ( '. $ids  .' );INSERT INTO tb_attribute_bak SELECT * FROM tb_attribute WHERE att_require_id IN ( '.$ids .' );';
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		//$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"require":"'. $ids .'"}';
		elog(" backup require success. msg = " .$ids );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post user error. data = ". $ids ." msg = " . $e->getMessage() ,'error');
	}
});


/**
 * 1是待排期
 * 获取一段时间的 需求
 */
$app->get('/require_bak/list/:user/:power/:power_rank/:state/:type(/:cp_id)', function($user,$power,$power_rank,$state,$type,$cp_id = 'all') use ($app){
	$tb_user = '';
	$tb_join = '';
	//if($state == 5){
		$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
		$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require_bak.require_creator ';
	//};
	
	$select = buildReqSelect('tb_require_bak',$tb_user,$tb_join);
	if($cp_id != 'all'){
		$where_state = ' where cp_id = '. $cp_id . ' and ';
	}else{
		$where_state = ' where';
	}
	
	$where_user = buildUserSql($user,$power,$power_rank);
	//需求状态筛选
	$where_state .= buildStateSql($state);
	
	$where_type = buildDateSql($type);
	//构造sql语句
	$sql = $select . $where_state . $where_type .$where_user . '  and `is_del` = 0  order by tb_require_bak.require_start_date';
	//echo $sql;
	echo buildReqSql($sql);
});


/**
 * 获取一段时间的 需求 不包含 待排期
 */
$app->get('/require_bak/date/:user/:power/:power_rank/:state/:start/:end', function($user,$power,$power_rank,$state,$start,$end) use ($app){
	
	$tb_user = '';
	$tb_join = '';
	if($state == 5){
		$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
		$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require_bak.require_creator ';
	};
	
	$select = buildReqSelect('tb_require_bak',$tb_user,$tb_join);
	
	$where_state = ' where ';
	$where_user = buildUserSql($user,$power,$power_rank);
	//需求状态筛选
	$where_state .= buildStateSql($state);
	
	$where_time = " and DATE_FORMAT(tb_require_bak.require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(tb_require_bak.require_start_date,'%Y-%m-%d') <= '". $end ."' ";
	
	//构造sql语句
	$sql = $select . $where_state . $where_time .$where_user . '  and `is_del` = 0 order by tb_require_bak.require_start_date';
	//echo $sql;
	echo buildReqSql($sql);
	
});

/**
 * 获取需求属性
 */
$app->get('/require_bak/attribute_bak/:requireid', function($requireid) use ($app){
	$sql = "SELECT *  FROM `tb_attribute_bak` INNER JOIN  tb_type  ON tb_attribute_bak.attr_type_id=tb_type.type_id WHERE `att_is_parent` =0 and `att_require_id` = " . $requireid;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"attribute":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 *  获取价格表
 */
$app->get('/require_bak/list/:ids', function($ids) use ($app){
	$tb_user = ',tb_users.english_name,tb_users.user_qq,tb_users.user_phone ';
	$tb_join = ' LEFT  JOIN tb_users ON tb_users.login_name=tb_require_bak.require_creator ';
	$select = buildReqSelect('tb_require_bak',$tb_user,$tb_join);
	$sql = $select . ' where require_id in('. $ids .')';
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"require":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 *  获取数量总数
 */
$app->get('/require/summary/:state', function($state) use ($app){
	//buildDateSql();
	if($state != 60){
		$sql = 'select count(require_id) from tb_require where  ' . buildStateSql($state) . ' and `is_del` = 0 ';
	}else{
		$sql = 'select count(require_id) from tb_require where `is_del` = 1 ';
	}
	
	try {
		$db = getConnection();
		//上周
		$stmt = $db->prepare($sql . buildDateSql('day'));  
		$stmt->execute();
		$day = $stmt->fetchColumn();
		//上周
		$stmt = $db->prepare($sql . buildDateSql('prev'));  
		$stmt->execute();
		$prev = $stmt->fetchColumn();
		//本周
		$stmt = $db->prepare($sql . buildDateSql('week'));  
		$stmt->execute();
		$week = $stmt->fetchColumn();
		//下周
		$stmt = $db->prepare($sql . buildDateSql('next'));  
		$stmt->execute();
		$next = $stmt->fetchColumn();
		//上上月
		$stmt = $db->prepare($sql . buildDateSql('ppmonth'));  
		$stmt->execute();
		$ppmonth = $stmt->fetchColumn();
		//上月
		$stmt = $db->prepare($sql . buildDateSql('pmonth'));  
		$stmt->execute();
		$pmonth = $stmt->fetchColumn();
		//本月
		$stmt = $db->prepare($sql . buildDateSql('month'));  
		$stmt->execute();
		$month = $stmt->fetchColumn();
		//所有
		$stmt = $db->prepare($sql . buildDateSql('all'));  
		$stmt->execute();
		$all = $stmt->fetchColumn();
		$db = null;
		
		$data = array(
		'day' => $day, 
		'prev' => $prev, 
		'week' => $week, 
		'next' => $next, 
		'month' => $month, 
		'pmonth' => $pmonth, 
		'ppmonth' => $ppmonth,
		'all' => $all
		);
		echo '{"summary":'. json_encode($data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});


/**
 *  获取数量总数
 */
$app->get('/require/summary_bak/:state', function($state) use ($app){
	//buildDateSql();
	$sql = 'select count(require_id) from tb_require_bak where  ' . buildStateSql($state) . ' and `is_del` = 0 ';
	try {
		$db = getConnection();
		//上周
		$stmt = $db->prepare($sql . buildDateSql('day'));  
		$stmt->execute();
		$day = $stmt->fetchColumn();
		//上周
		$stmt = $db->prepare($sql . buildDateSql('prev'));  
		$stmt->execute();
		$prev = $stmt->fetchColumn();
		//本周
		$stmt = $db->prepare($sql . buildDateSql('week'));  
		$stmt->execute();
		$week = $stmt->fetchColumn();
		//下周
		$stmt = $db->prepare($sql . buildDateSql('next'));  
		$stmt->execute();
		$next = $stmt->fetchColumn();
		//上上月
		$stmt = $db->prepare($sql . buildDateSql('ppmonth'));  
		$stmt->execute();
		$ppmonth = $stmt->fetchColumn();
		//上月
		$stmt = $db->prepare($sql . buildDateSql('pmonth'));  
		$stmt->execute();
		$pmonth = $stmt->fetchColumn();
		//本月
		$stmt = $db->prepare($sql . buildDateSql('month'));  
		$stmt->execute();
		$month = $stmt->fetchColumn();
		//所有
		$stmt = $db->prepare($sql . buildDateSql('all'));  
		$stmt->execute();
		$all = $stmt->fetchColumn();
		$db = null;
		
		$data = array(
		'day' => $day, 
		'prev' => $prev, 
		'week' => $week, 
		'next' => $next, 
		'month' => $month, 
		'pmonth' => $pmonth, 
		'ppmonth' => $ppmonth,
		'all' => $all
		);
		
		echo '{"summary":'. json_encode($data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});


/**
 * 插入一条数据
 */
$app->post('/checkuser', function () use ($app) {
	$data = $app->request()->post();
	$user = $data['user'];
	$password = md5(md5($data['password']));
	try {
		$db = getConnection();
		$sql = 'select login_name, user_power from tb_users where login_name = "' . $user .'" and user_password = "' . $password .'" and user_password IS NOT NULL';
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$results = $stmt->fetch(PDO::FETCH_ASSOC);
		if (!empty($results)){
			echo '{"users":'. json_encode($results) .'}'; 
		}else{
			echo '{"error":"no user"}'; 
		}
		$db = null;
		
		elog( $user . " login success. msg = " .json_encode($results) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog( $user . " login error. data = ". json_encode($results) ." msg = " . $e->getMessage() ,'error');
	}
});

/**
 * 根据id 获取用户email
 */
$app->get('/userinfo/:username', function($username) use ($app){
	$names=explode(';',$username);
	$user = "";
	foreach ($names as $n) {
		$user .= "'". $n ."',";
	};
	$user = substr($user,0,strlen($user)-1);
	$sql = "SELECT english_name,user_email,department_id,chinese_name,user_qq FROM `tb_users` WHERE `english_name` in ( ". $user .")";
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"users":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

$app->delete('/delete/:id/:file',function ($id,$file) use ($app) {
	//删除设计稿
	$path = '../design/' . $id . '/' . $file;
	$state = delDesginAtt($path);
	$result = array('state' => $state,'file' =>$file,'id' => $id );
	echo '{"result":'. json_encode($result) .'}';
});


////////////////////////////////////////统计/////////////////////////////

/**
 * 获取统计所需的需求数据
 */
function getStatisticsData($start,$end,$rank_id = 0){
	$rank_sel = '';
	$rank_id && $rank_sel = '  AND require_rank_id = '.$rank_id;
	//查询出来的数据 不包含外派设计师
	$sql_require = "SELECT `att_text`,`att_is_parent`,`require_rank_id`, `require_start_date` , `require_id`,`attr_type_id`, `type_id`,`type_name`,`require_ads`,
				   `require_cp_id`,`cp_type`,`require_pm_cost_change`,`require_pm_cost`,`require_rating`,`type_check`
			FROM  `tb_require` 
			INNER JOIN `tb_attribute` ON `tb_require`.`require_id` = `tb_attribute`.`att_require_id`
			INNER JOIN  `tb_type` ON  `tb_type`.`type_id` =  `tb_require`.`require_type_id` 
			INNER JOIN  `tb_cp` ON  `tb_cp`.`cp_id` =  `tb_require`.`require_cp_id` 
			WHERE DATE_FORMAT(require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(require_start_date,'%Y-%m-%d') <= '". $end ."'
			AND `tb_cp`.`cp_type` = 0 " . $rank_sel ." AND  `is_del` = 0";

	$sql_price = "SELECT `tb_price`.*,`tb_cp`.cp_rank_id FROM  `tb_price`
				INNER JOIN `tb_cp` ON `tb_cp`.`cp_id` = `tb_price`.`price_cp_id`
				WHERE DATE_FORMAT(price_month,'%Y-%m-%d') >= '". date('Y-m-01',strtotime($start)) ."' and DATE_FORMAT(price_month,'%Y-%m-%d') <= '". date('Y-m-01',strtotime($end)) ."'
				";
	//echo $sql_price;			

	$sql_type = "SELECT *  FROM `tb_type` WHERE `type_state` = 1 ORDER BY  `type_sort` ASC ,  `type_check` DESC ";
	$sql_rank = "SELECT *  FROM `tb_rank` WHERE `rank_state` = 1  ORDER BY  `rank_sort` ASC";
	//排除外派设计师
	$sql_cp = "SELECT *  FROM `tb_cp` WHERE `cp_state` = 1 AND `cp_type` = 0 ORDER BY cp_type ASC";
	// echo $sql_require;
	try {
		$db = getConnection();

		//需求数据
		$stmt = $db->prepare($sql_require);  
		$stmt->execute();
		$obj_require = $stmt->fetchAll(PDO::FETCH_OBJ);

		//价格
		$stmt = $db->prepare($sql_price);  
		$stmt->execute();
		$obj_price = $stmt->fetchAll(PDO::FETCH_OBJ);

		//类型
		$stmt = $db->prepare($sql_type);  
		$stmt->execute();
		$obj_type = $stmt->fetchAll(PDO::FETCH_OBJ);

		//部门
		$stmt = $db->prepare($sql_rank);  
		$stmt->execute();
		$obj_rank = $stmt->fetchAll(PDO::FETCH_OBJ);

		//CP
		$stmt = $db->prepare($sql_cp);  
		$stmt->execute();
		$obj_cp = $stmt->fetchAll(PDO::FETCH_OBJ);

		$db = null;
		$data = array(
			'require' => $obj_require, 
			'price' => $obj_price,
			'type' => $obj_type,
			'rank' => $obj_rank,
			'cp' => $obj_cp

		);

		return $data;


	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}

};

/**
 * 根据日期 按月份获取需求分类占比数据
 */
$app->get('/statistics/type/:start/:end/:rank_id', function($start,$end,$rank_id = 0) use ($app){
	$data = getStatisticsData($start,$end,$rank_id);
	$data_req = $data['require'];
	$data_type = $data['type'];
	$data_rank = $data['rank'];
	$data_price = $data['price'];
	$data_cp = $data['cp'];
	//重新组合数据 
	//$objects为最终的数据形式
	$objects = array();
	//构造价格和数量Object
	$s_obj = array();

	//按部门组成数组
	foreach ($data_type as $type) {
		$type_id = $type->type_id;
		$objects[$type_id] = array();
	};



	//构造需求数据
	foreach ($data_req as $obj) {
		$type_id = $obj->attr_type_id;
		$rank_id = $obj->require_rank_id;
		$cp_id = $obj->require_cp_id;
		if($cp_id != 0){
			//如果array存在
			array_push($objects[$type_id],$obj);
		}
	};

	// dump($objects);
	// dump($data_price);
	//数据统计
	foreach ($objects as $val => $obj) {
		if($obj){
			$data = countAndPrice($obj,$data_type,$data_price);
			$data['type_id'] = $obj[0]->attr_type_id;
			$data['name'] = getTypeName($data_type,$obj[0]->attr_type_id);
			array_push($s_obj,$data);
			// dump($data);
		}else{
			//补全归类
			$nodata = array(
				'type_id' => $val,
				'name' => getTypeName($data_type,$val),
				'price' => 0,
				'fmt_price' => 0,
				'count' => 0
			);
			array_push($s_obj,$nodata);
		}
	}

	$arr = array_sort($s_obj,'price','desc');


	echo '{"statistics":'. u2utf8(json_encode($arr)) .'}';
});


/**
 * 根据日期 按月份获取需求归档占比数据
 */
$app->get('/statistics/rank/:start/:end(/:rank_id)', function($start,$end,$rank_id = 0) use ($app){

	$data = getStatisticsData($start,$end);
	$data_req = $data['require'];
	$data_type = $data['type'];
	$data_rank = $data['rank'];
	$data_price = $data['price'];
	$data_cp = $data['cp'];
	//重新组合数据 
	//$objects为最终的数据形式
	$objects = array();
	//构造价格和数量Object
	$s_obj = array();

	//按部门组成数组
	foreach ($data_rank as $rank) {
		$rank_id = $rank->rank_id;
		$objects[$rank_id] = array();
	};

	//构造需求数据
	foreach ($data_req as $obj) {
		$type_id = $obj->attr_type_id;
		$rank_id = $obj->require_rank_id;
		$cp_id = $obj->require_cp_id;
		if($cp_id != 0){
			//如果array存在
			array_push($objects[$rank_id],$obj);
		}
	};
	
	$rank_obj = array_keys($objects);
	$db = getConnection();

	//总金额
	$total_ping_price = 0;//平台总金额
	$total_wai_price = 0;//派驻总金额
	$total_all_price = 0;//平台+派驻
	//数据统计
	foreach ($objects as $val => $obj) {
		//$val 为 rank id
		//计算派驻设计师金额
		$sql = "SELECT  price_name  FROM `tb_cp` 
				left JOIN `tb_price` ON `tb_cp`.`cp_id` = `tb_price`.`price_cp_id`
				WHERE `cp_state` = 1 AND `cp_type` = 1 AND  `price_rating` = 'H' AND `cp_rank_id` = ". $val ." AND
				DATE_FORMAT(price_month,'%Y-%m-%d') >= '". date('Y-m-01',strtotime($start)) ."' and DATE_FORMAT(price_month,'%Y-%m-%d') <= '". date('Y-m-01',strtotime($end)) ."'";
		// echo $sql;
		
		//派驻金额
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$obj_waipai = $stmt->fetchAll(PDO::FETCH_OBJ);
		$prices = 0;//派驻金额
		$t_price = 0;//总金额
		//不为空
		if(!empty($obj_waipai)){
			foreach ($obj_waipai as $wai) {
				 $prices += (int)$wai->price_name;
			};
			// echo $prices;
		}
		
		$total_wai_price += $prices;
		// dump($obj_waipai);
		
		if($obj){
			$data = countAndPrice($obj,$data_type,$data_price);
			$data['rank_id'] = $obj[0]->require_rank_id;
			$data['name'] = getRankName($data_rank,$obj[0]->require_rank_id);
			$data['wai_price'] = $prices;
			$data['fmt_wai_price'] = format_money($prices);
			$data['total_price'] = $prices + (int)$data['price'];
			$data['fmt_total_price'] = format_money($prices + (int)$data['price']);
			$total_ping_price += (int)$data['price'];
			array_push($s_obj,$data);
		}else{
			//补全归类
			$nodata = array(
				'rank_id' => $val,
				'name' => getRankName($data_rank,$val),
				'price' => 0,
				'fmt_price' => 0,
				'count' => 0,
				'wai_price' => $prices,
				'fmt_wai_price' => format_money($prices),
				'total_price' => $prices,
				'fmt_total_price' => format_money($prices)
			);
			array_push($s_obj,$nodata);
		}
	};
	$db = null;

	$total_all_price = $total_ping_price + $total_wai_price;
	
	

	echo '{"statistics":'. json_encode($s_obj) .',
			"total_ping_price": '. $total_ping_price .',
			"total_wai_price": '. $total_wai_price .',
			"total_all_price": '. $total_all_price .
			'}';


});

/**
 * 根据日期 按月份获取需求归档占比数据
 */
$app->get('/statistics/cp/:start/:end/:rank_id', function($start,$end,$rank_id = 0) use ($app){
	$data = getStatisticsData($start,$end,$rank_id);
	$data_req = $data['require'];
	$data_type = $data['type'];
	$data_rank = $data['rank'];
	$data_price = $data['price'];
	$data_cp = $data['cp'];
	

	//重新组合数据 
	//$objects为最终的数据形式
	$objects = array();
	//构造价格和数量Object
	$s_obj = array();

	//将CP组成数组
	foreach ($data_cp as $cp) {
		$cp_id = $cp->cp_id;
		$objects[$cp_id] = array();
	};

	// dump($data_req);
	//构造需求数据
	foreach ($data_req as $obj) {
		$cp_id = $obj->require_cp_id;
		if($cp_id != 0){
			//如果array存在
			array_push($objects[$cp_id],$obj);
		}
	};
	//数据统计
	foreach ($objects as $obj) {
		if($obj){
			$data = countAndPrice($obj,$data_type,$data_price);
            //dump($obj);
			$data['cp_id'] = $obj[0]->require_cp_id;
			$data['name'] = getCpName($data_cp,$obj[0]->require_cp_id);
			array_push($s_obj,$data);
		}
	};
 	
 	$rank_sel = '';
 	$rank_id && $rank_sel = ' AND cp_rank_id = '. $rank_id;
	//新增派驻设计师价格
	$sql = "SELECT  `tb_cp`.`cp_id` , `tb_cp`.`cp_name`,`tb_price`.`price_name`,price_month  FROM `tb_cp` 
			left JOIN `tb_price` ON `tb_cp`.`cp_id` = `tb_price`.`price_cp_id`
			WHERE `cp_state` = 1 AND `cp_type` = 1 AND  `price_rating` = 'H' AND
			DATE_FORMAT(price_month,'%Y-%m-%d') >= '". date('Y-m-01',strtotime($start)) ."' and DATE_FORMAT(price_month,'%Y-%m-%d') <= '". date('Y-m-01',strtotime($end)) ."'". $rank_sel ."
			";
	//echo $sql;
	$db = getConnection();

	//需求数据
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$obj_waipai = $stmt->fetchAll(PDO::FETCH_OBJ);
	$db = null;
	$waipai_price = 0;
	foreach ($obj_waipai as $waipai) {
		$price = $waipai->price_name;
		$waipai_price += (int)$price;
	};
	$data_w = array(
		'cp_id' => 999,
		'name' => '派驻设计师',
		'price' => $waipai_price,
		'fmt_price' => format_money($waipai_price)
	);
	//外派设计师
	array_push($s_obj,$data_w);

	echo '{"statistics":'. json_encode($s_obj) .'}';
});


/**
 * 根据日期 按月份和部门统计需求个数及金额
 */
$app->get('/statistics/cp2/type/:start/:end', function($start,$end) use ($app){
	
	$data = getStatisticsData($start,$end);
	$data_req = $data['require'];
	$data_type = $data['type'];
	$data_rank = $data['rank'];
	$data_price = $data['price'];
	$data_cp = $data['cp'];
	//重新组合数据 
	//$objects为最终的数据形式
	$objects = array();
	//构造价格和数量Object
	$s_obj = array();

	//将三维表格用数字表示 先是类型 后是部门
	foreach ($data_type as $type) {
		$type_id = $type->type_id;
		foreach ($data_rank as $rank) {
			$rank_id = $rank->rank_id;
			foreach ($data_cp as $cp) {
				$cp_id = $cp->cp_id;
				$objects[$type_id.'|'.$rank_id .'|'.$cp_id] = array();
				// echo $type_id.'|'.$rank_id .'|'.$cp_id .'<br/>';
			};
		};
	};

	// dump($data_req);
	//构造需求数据
	foreach ($data_req as $obj) {
		$type_id = $obj->attr_type_id;
		$rank_id = $obj->require_rank_id;
		$cp_id = $obj->require_cp_id;
		// echo $type_id.'|'.$rank_id .'|'.$cp_id .'<br/>';
		if($cp_id != 0){
			//if($cp_id == 1 && $type_id == 1 && $rank_id == 3)
			//如果array存在
			array_push($objects[$type_id.'|'.$rank_id .'|'.$cp_id],$obj);
		}
	};
	//数据统计
	foreach ($objects as $obj) {
		if($obj){
			//dump($obj);
			$data = countAndPrice($obj,$data_price,$data_type);
			$data['rank_id'] = $obj[0]->require_rank_id;
			$data['type_id'] = $obj[0]->attr_type_id;
			$data['cp_id'] = $obj[0]->require_cp_id;
			//echo $obj['require_rank_id'];
			array_push($s_obj,$data);
		}
	}

	$response = array(
		'rank' => $data_rank,
		'type' => $data_type,
		'cp' => $data_cp,
		'statistics' => $s_obj
	);

	echo '{"data":'. json_encode($response) .'}';

	
});


/**
 * 根据日期 按月份和部门统计需求个数及金额
 */
$app->get('/statistics/rank2/type/:start/:end', function($start,$end) use ($app){
	
	$data = getStatisticsData($start,$end);
	$data_req = $data['require'];
	$data_type = $data['type'];
	$data_rank = $data['rank'];
	$data_price = $data['price'];
	$data_cp = $data['cp'];
	//重新组合数据 
	//$objects为最终的数据形式
	$objects = array();
	//构造价格和数量Object
	$s_obj = array();

	//将三维表格用数字表示 先是类型 后是部门
	foreach ($data_type as $type) {
		$type_id = $type->type_id;
		foreach ($data_rank as $rank) {
			$rank_id = $rank->rank_id;
			$objects[$type_id.'|'.$rank_id] = array();
		};
	};

	// dump($data_req);
	//构造需求数据
	foreach ($data_req as $obj) {
		$type_id = $obj->attr_type_id;
		$rank_id = $obj->require_rank_id;
		$cp_id = $obj->require_cp_id;
		if($cp_id != 0){
			//if($cp_id == 1 && $type_id == 1 && $rank_id == 3)
			//如果array存在
			array_push($objects[$type_id.'|'.$rank_id],$obj);
		}
	};
	//数据统计
	foreach ($objects as $obj) {
		if($obj){
			//dump($obj);
			$data = countAndPrice($obj,$data_price,$data_type);
			$data['rank_id'] = $obj[0]->require_rank_id;
			$data['type_id'] = $obj[0]->attr_type_id;
			// $data['cp_id'] = $obj[0]->require_cp_id;
			//echo $obj['require_rank_id'];
			array_push($s_obj,$data);
		}
	}

	$response = array(
		'rank' => $data_rank,
		'type' => $data_type,
		'cp' => $data_cp,
		'price' => $data_price,
		'statistics' => $s_obj
	);

	echo '{"data":'. json_encode($response) .'}';

	
});

/**
 * 根据日期 按月份和部门统计需求个数及金额
 */
function getCpPrice($start,$end,$rank_id = 0){
	$rank_sel = $rank_id ? (' AND `require_rank_id` = '.$rank_id) : '';
	$rank_sel2 = $rank_id ? (' AND `cp_rank_id` = '.$rank_id) : '';
	//平台数据 从 2012-09开始
	$sql = "SELECT SUM(require_final_cost) as price, CAST(year(require_start_date) as CHAR(50)) as year , 
			CAST(month(require_start_date) as CHAR(50)) as month FROM tb_require
			LEFT JOIN `tb_cp` ON `tb_cp`.`cp_id` = `tb_require`.`require_cp_id` 
			WHERE `require_final_cost` !=0 AND `tb_cp`.`cp_type` = 0 AND
			DATE_FORMAT(require_start_date,'%Y-%m-%d') >= '". $start ."' AND DATE_FORMAT(require_start_date,'%Y-%m-%d') <= '". $end ."'
			". $rank_sel ." 
			GROUP BY year(require_start_date),month(require_start_date)";
	// echo $sql;		

	//派驻数据 从 2012-10开始
	$sql2 = "SELECT SUM(price_name) as price, CAST(year(price_month) as CHAR(50)) as year , 
			CAST(month(price_month) as CHAR(50)) as month FROM `tb_price` 
			LEFT JOIN `tb_cp` ON `tb_cp`.`cp_id` = `tb_price`.`price_cp_id` 
			WHERE `price_cp_type` = 0 AND  `price_rating` = 'H' AND
			DATE_FORMAT(price_month,'%Y-%m-%d') >= '". date('Y-m-01',strtotime($start)) ."' and DATE_FORMAT(price_month,'%Y-%m-%d') <= '". date('Y-m-01',strtotime($end)) ."'
			". $rank_sel2 ." 
			GROUP BY year(price_month),month(price_month)";	
	// if($rank_id == 1){
	// 	//echo $sql2;
	// }		
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$ping_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		
		$stmt2 = $db->prepare($sql2);  
		$stmt2->execute();
		$wai_data = $stmt2->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		// dump($wai_data);
		//没有数据 则补齐数据
		$nodata = new StdClass;
		$nodata->price = 0;
		//计算差值
		$diff = count($ping_data) - count($wai_data);
		//存在差值 则补齐数据
		if($diff > 0){
			for ($i=0; $i < $diff; $i++) { 
				array_unshift($wai_data, $nodata);
			}
		}else if($diff < 0){
			for ($i=0; $i < -$diff; $i++) { 
				array_unshift($ping_data, $nodata);
			}
		}

		$length = count($ping_data);
		// if($rank_id == 1){
		// 	//echo $sql2;
		// 	echo $length;
		// }
		$months = array();
		$prices = array();
		$allprices = 0;		//总金额
		for ($i=0; $i < $length; $i++) {
			// dump($wai_data[$i]);
			$ping_price = (int)$ping_data[$i]->price;
			$wai_price = (int)$wai_data[$i]->price;
			$total_price = $ping_price + $wai_price;
			
			if(isset($ping_data[$i]->year)){
				$year = $ping_data[$i]->year;
				$month = $ping_data[$i]->month;
			}else{
				$year = $wai_data[$i]->year;
				$month = $wai_data[$i]->month;
			}


			$month = $year . '-' . $month;
			
			$allprices += $total_price;	//总金额

			array_push($months, $month);
			array_push($prices, $total_price);
		};

		$arr = array('price' => $prices,
					 'month' => $months,
					 'total_price' => $allprices
			);



		return $arr;
		// echo '{"data":'. json_encode($arr) .'}';
	} catch(PDOException $e) {
		// echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		return $e->getMessage();
	}	

};


/**
 * 根据日期 按月份和部门统计需求个数及金额
 */
$app->get('/statistics/cpprice/:start/:end', function($start,$end) use ($app){
	$sql = "SELECT rank_id,rank_name  FROM `tb_rank` WHERE `rank_state` = 1  ORDER BY  `rank_sort` ASC";

	$db = getConnection();
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$rank_data = $stmt->fetchAll(PDO::FETCH_OBJ);
	$db = null;
	$data = array();
	//全部
	$price_data = getCpPrice($start,$end,0);
	$price_data['rank_name'] = '全部';
	array_push($data, $price_data);

	foreach ($rank_data as $obj) {
		$rank_id = $obj->rank_id;
		$rank_name = $obj->rank_name;
		$price_data = getCpPrice($start,$end,$rank_id);
		$price_data['rank_name'] = $rank_name;
		// dump($price_data);
		array_push($data, $price_data);
	};

	//数组排序
	$data = array_sort($data,'total_price','desc');
	
	echo '{"data":'. json_encode($data) .'}';
});



/**
 * 获取远程图片
 */
$app->get('/icson/:url', function($url) use ($app){
	file_put_contents(basename($url), file_get_contents($url));
});

/**
 * 检测服务器图片是否和数据库一致
 * 目前已校正2013年4月19日之前的所有设计稿
 */
$app->get('/check/design/:start/:end', function($start,$end) use ($app){
	$sql = "select require_id,require_desgin_attachment from tb_require where 
	`require_desgin_attachment` IS NOT NULL and
	DATE_FORMAT(require_start_date,'%Y-%m-%d') >= '". $start ."' and DATE_FORMAT(require_start_date,'%Y-%m-%d') <= '". $end ."' 
	";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		// header("Content-type: text/html; charset=utf-8");
		foreach ($data as $req) {
			$id =  $req->require_id;
			// dump($design->attachment);
			//dump($desg_arr);
			//echo $id;
			//获取文件夹文件数组
			$dir = '../design/' . $id;
			if(is_dir ( $dir )){
				$design = json_decode($req->require_desgin_attachment);
				$files = getFile($dir);
				
				//组成新的数组
				$desg_arr = array();
				//dump($design);
				//echo $id;
				foreach ($design->attachment as $d) {
					array_push($desg_arr,$d->filedesc);
				}
				//差
				$diff = array_diff($files,$desg_arr);
				
				foreach ($diff as $key => $value) {
					if($value){
						//删除多余文件
						echo '已删除多余文件：' . $dir . '/' . $value . '<br/>';
						unlink ($dir . '/' . $value);
					}
					
				}
			}
		}
		
		echo '清理完成！';
		// foreach ($files as $f) {
// 			
		// }
		
		//echo $sql;
		//echo '{"statistics":'. json_encode($data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});



/**
 * 获取CP价格根据时间 和 CP类型
 */
$app->get('/cp/price/:start/:end(/:type)', function($start,$end,$type = 2) use ($app){
	$where = '';
	switch ($type) {
		case '1':
			$where = ' AND price_cp_type = 1 ';
			break;
		
		case '0':
			$where = ' AND price_cp_type = 0 ';
			break;
	};
	
	$sql = "SELECT *  FROM `tb_price` 
			WHERE `price_rating` = 'H' AND ". $where ."
			DATE_FORMAT(price_month,'%Y-%m-%d') >= '". date('Y-m-01',strtotime($start)) ."' and DATE_FORMAT(price_month,'%Y-%m-%d') <= '". date('Y-m-01',strtotime($end)) ."'
			";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"prices":'. json_encode($data) .'}';

	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}		
	
});


/**
 *  批量新增价格
 */
$app->post('/editprices', function () use ($app) {
	$req_data = $app->request()->post();
	$attribute = $req_data['editprices'];
	$sql = "INSERT INTO tb_price_edit (edit_cp_id,edit_type_id,edit_old_price,edit_new_price,edit_price_type,edit_date,edit_add_date) VALUES";
	$count = count($attribute);
	
	for($i = 0;$i < $count;$i++)
	{
		if( isset($attribute[$i]['edit_add_date']) ){
			$date = date("Y-m-d",strtotime($attribute[$i]['edit_add_date']));
			// $date = date("Y-m-d",$attribute[$i]['edit_add_date']);
		}else{
			$date =  date("Y-m-d");
		}
	    $sql .= "(". $attribute[$i]['edit_cp_id'] .",".$attribute[$i]['edit_type_id'].",'".$attribute[$i]['edit_old_price']."','".$attribute[$i]['edit_new_price'] ."','".$attribute[$i]['edit_price_type'] ."','".$attribute[$i]['edit_date'] ."','". $date ."')";
	    if($i != $count - 1)
	    {
	        $sql .= ',';  //Will insert a comma after each except the last.  Count - 1 since $i will equal count - 1 on the last one, since it starts at 0 and not 1.
	    }
	}
	//echo $sql;
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"editprices":'. json_encode($attribute) .'}'; 
		elog(" post editprices success. msg = " .json_encode($req_data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" post editprices error. data = ". json_encode($req_data) ." msg = " . $e->getMessage() ,'error');
	}
});



/**
 * 批量更新价格
 */
$app->put('/editprices', function () use ($app) {
	$req_data = $app->request()->put();
	$attribute = $req_data['editprices'];
	$count = count($attribute);
	//echo '===11==';
	//dump($display_order);
	$ids = '';
	$edit_cp_id = '';
	$edit_type_id = '';
	$edit_price_type = '';
	$edit_old_price = '';
	$edit_new_price = '';
	$edit_date = '';
	for($i = 0;$i < $count;$i++)
	{
		$ids .= $attribute[$i]['edit_id'];
		$edit_cp_id .= " WHEN " . $attribute[$i]['edit_id'] ." THEN " . $attribute[$i]['edit_cp_id'];
		$edit_type_id .= " WHEN " . $attribute[$i]['edit_id'] ." THEN " . $attribute[$i]['edit_type_id'];
		$edit_price_type .= " WHEN " . $attribute[$i]['edit_id'] ." THEN '" . $attribute[$i]['edit_price_type'] ."'";
		$edit_old_price .= " WHEN " . $attribute[$i]['edit_id'] ." THEN '" . $attribute[$i]['edit_old_price'] ."'";
		$edit_new_price .= " WHEN " . $attribute[$i]['edit_id'] ." THEN '" . $attribute[$i]['edit_new_price'] ."'";
		$edit_date .= " WHEN " . $attribute[$i]['edit_id'] ." THEN '" . $attribute[$i]['edit_date'] ."'";
		
	    if($i != $count - 1)
	    {
	        $ids .= ',';  //Will insert a comma after each except the last.  Count - 1 since $i will equal count - 1 on the last one, since it starts at 0 and not 1.
	    }
	}
	
	$sql = "UPDATE tb_price_edit SET edit_cp_id = CASE edit_id ";
	$sql .=$edit_cp_id ;
	$sql .= " END, edit_type_id =  CASE edit_id ";
	$sql .=$edit_type_id ;
	$sql .= " END, edit_old_price =  CASE edit_id ";
	$sql .=$edit_old_price ;
	$sql .= " END, edit_new_price =  CASE edit_id ";
	$sql .=$edit_new_price ;
	$sql .= " END, edit_price_type =  CASE edit_id ";
	$sql .=$edit_price_type ;
	$sql .= " END, edit_date =  CASE edit_id ";
	$sql .=$edit_date ;
	$sql .= " END WHERE edit_id IN ($ids)";
	
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$db = null;
		
		echo '{"editprices":'. json_encode($attribute) .'}'; 
		elog(" put editprices success. msg = " .json_encode($req_data) );
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
		elog(" put editprices error. editprices = ". json_encode($req_data) ." msg = " . $e->getMessage() ,'error');
	}
});



/**
 * 根据日期 获取价格表
 */
$app->get('/editprices/date/:date', function($date) use ($app){
	
	$sql = "SELECT * FROM  `tb_price_edit` WHERE  `edit_add_date` =  '". $date . "'";
	$db = getConnection();
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
	$db = null;

	echo '{"editprices":'. json_encode($req_data) .'}';
});

// 

/**
 * 根据日期 获取价格表
 */
$app->get('/editprices/dates', function() use ($app){
	
	$sql = "SELECT *  FROM tb_price_edit GROUP BY `edit_add_date` ORDER BY `edit_add_date` DESC";
	$db = getConnection();
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
	$db = null;

	echo '{"editprices":'. json_encode($req_data) .'}';
});

/**
 * 根据日期 获取价格表
 */
$app->put('/editprices/check', function() use ($app){
	$req_data = $app->request()->put();
	$check = $req_data['edit_check'];
	$date = $req_data['edit_add_date'];
	$edit_confirm_user = $req_data['edit_confirm_user'];

	$sql = "UPDATE `tb_price_edit` SET `edit_check` = ". $check .", 
									   `edit_confirm_user` = '". $edit_confirm_user ."', 
									   `edit_confirm_date` = '". date("Y-m-d H:i:s") ."' 
									   WHERE `edit_add_date` = '" . $date ."'";
	$db = getConnection();
	$stmt = $db->prepare($sql);  
	$stmt->execute();
	$db = null;
	echo '{"editprices": "SUCCESS"}';
});

/**
 * 批量更新价格
 */
$app->put('/prices/check/confirm', function() use ($app){
	$req_data = $app->request()->put();
	$attribute = $req_data['editprices'];
	$count = count($attribute);
	
	$db = getConnection();
	for($i = 0;$i < $count;$i++)
	{
		$price_name = $attribute[$i]['edit_new_price'];
		$price_type_id = $attribute[$i]['edit_type_id'];
		$price_cp_id = $attribute[$i]['edit_cp_id'];
		$price_rating = $attribute[$i]['edit_price_type'];
		$price_month = $attribute[$i]['edit_date'];

		$sql = "UPDATE tb_price SET price_name = " . $price_name . "  WHERE price_type_id = ". $price_type_id .
			" AND price_cp_id = ". $price_cp_id .
			" AND  price_rating = '". $price_rating .
			"' AND DATE_FORMAT(price_month,'%Y-%m-%d') >= '". date('Y-m-01',strtotime($price_month)) ."' ";
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		// echo $sql;
	}
	$db = null;
	echo '{"price":'. json_encode($attribute) .'}'; 
	elog(" put prices success. msg = " .json_encode($req_data) );

});

/**
 * 获取全部归类的子分类
 */
$app->get('/rankcate', function() use ($app){
	$sql = "SELECT `tb_rank_cate`.rank_id,`tb_rank_cate`.rank_cate_id,`tb_rank_cate`.rank_cate_name,`tb_rank`.rank_name FROM  `tb_rank_cate` LEFT JOIN tb_rank  ON `tb_rank_cate`.`rank_id` = `tb_rank`.`rank_id`  WHERE  `rank_cate_state` = 1  ORDER BY `rank_id` ASC ";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo '{"rankcate":'. json_encode($req_data) .'}';
	} catch(PDOException $e) {
		echo '{"error":{"text":"'. $e->getMessage() .'"}}'; 
	}
});

/**
 * 根据rank id 获取归类的子分类
 */
$app->get('/rankcate/id/:id', function($id) use ($app){
    $sql = "SELECT * FROM  `tb_rank_cate` WHERE  `rank_id` = $id AND `rank_cate_state` = 1";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $req_data = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo '{"rankcate":'. json_encode($req_data) .'}';
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

/**
 * 新增
 */
$app->post('/rankcate', function() use ($app){
     $req_data = $app->request()->post();
     $data = $req_data['rankcate'];
     $sql = buildSqlInsert('tb_rank_cate',$data);
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $data['rank_cate_id'] = $db->lastInsertId();
        $db = null;
        echo '{"rankcate":'. json_encode($data) .'}';
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

/**
 * 根据rank id 获取归类的子分类
 */
$app->put('/rankcate/id/:id', function($id) use ($app){
    $req_data = $app->request()->put();
    $data = $req_data['rankcate'];
    $where = '`rank_cate_id` =' . $id;
    $sql = buildSqlUpdate('tb_rank_cate',$data,$where);
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;
        echo '{"rankcate":'. json_encode($data) .'}';
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

/**
 * 根据rank id 获取归类的子分类
 */
$app->delete('/rankcate/id/:id', function($id) use ($app){
    $sql = "UPDATE `tb_rank_cate` SET  `rank_cate_state` =  '0' WHERE  `rank_cate_id` =$id";
    try {
        $db = getConnection();
        $db->query($sql);
        $db = null;
        $data['rank_cate_id'] = $id;
        echo '{"rankcate":'. json_encode($data) .'}';
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});



/**
 * 获取一段时间 已删除的需求
 */
$app->get('/require/del/:type', function($type) use ($app){

    $select = buildReqSelect('tb_require');

    $where = 'WHERE  `is_del` = 1 ';

    $where_type = buildDateSql($type);

    //构造sql语句
    $sql = $select . $where . $where_type . ' order by tb_require.require_start_date';
    //echo $sql;
    echo buildReqSql($sql);
});

///**
// * 获取归类细分
// */
//$app->get('/require_cate', function() use ($app){
//
//    $sql = "SELECT * FROM tb_rank_cate "
//});


$app->run();





?>
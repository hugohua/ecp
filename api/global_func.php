<?php
require_once 'KLogger.php';

	function u2utf8($str){
   	 return preg_replace("/\\\u([\da-f]{4})/ie", 'iconv("UCS-2BE","utf-8",pack("H4","\\1"))', $str);
	}
	
	//输出日志
	function mmrp_log($logstr,$dir = "../logs/"){
		$startweek = date('Y-m-d', mktime(1, 0, 0, date('m'), date('d')-date('w')+1, date('Y')));
		$log = new KLogger ( $dir.$startweek .".txt", KLogger::INFO );
		$log->LogInfo($logstr);
	}
	
	//获取用户名
	function getSessionUser(){
		$user = '';
		if(isset($_COOKIE['login_user_music'])){
			$user = $_COOKIE['login_user_music'];
		}
		//return 'hugohua';
		return $user;
		
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
	
	function escape($str){
	    preg_match_all("/[\x80-\xff].|[\x01-\x7f]+/",$str,$newstr);
	    $ar = $newstr[0];
	    foreach($ar as $k=>$v){
	        if(ord($ar[$k])>=127){
	            $tmpString=bin2hex(iconv("GBK","ucs-2",$v));
	            if (!eregi("WIN",PHP_OS)){
	                $tmpString = substr($tmpString,2,2).substr($tmpString,0,2);
	            }
	            $reString.="%u".$tmpString;
	        } else {
	            $reString.= rawurlencode($v);
	        }
	    }
	    return $reString;
	} 
	
	/**
	* 输出变量的内容，通常用于调试
	*
	* @package Core
	*
	* @param mixed $vars 要输出的变量
	* @param string $label
	* @param boolean $return
	*/
	function dump($vars, $label = '', $return = false)
	{
		if (ini_get('html_errors')) {
			$content = "<pre>\n";
			if ($label != '') {
				$content .= "<strong>{$label} :</strong>\n";
			}
			$content .= htmlspecialchars(print_r($vars, true));
			$content .= "\n</pre>\n";
		} else {
			$content = $label . " :\n" . print_r($vars, true);
		}
		if ($return) { return $content; }
		echo $content;
		return null;
	}
	
	/**
	 * 调用OA SOAP登陆
	 * Enter description here ...
	 */
	function login() {  
        global $db;
        $LPATH = "http://";
		$LPATH .= $_SERVER["HTTP_HOST"];//主机名
		$LPATH .= dirname($_SERVER["REQUEST_URI"]);//路径
		$loginoa_url = $LPATH ."/oa_test.php";
		
		$last_url =  $LPATH ."/index.php";
		if(isset($_COOKIE['last_login_page'])){
			$last_url = $_COOKIE['last_login_page'];
		}
		
        //存在ticker，ticker为api返回值
        if (isset($_GET['ticket'])) {  
            try {
            	//oa login api  
                $soap = new SoapClient("http://passport.oa.com/services/passportservice.asmx?WSDL");  
                $result = $soap->DecryptTicket(array("encryptedTicket" => $_GET['ticket']));  
                
                if (!$result->DecryptTicketResult->LoginName) { 
                	echo "error ticker";
                } else {  
                    $soap = new SoapClient("http://ws.tof.oa.com/orgservice.svc?wsdl");  
                    $result = $soap->GetStaffInfoByLoginName(array('loginName' => $result->DecryptTicketResult->LoginName));  
                    if ($result->GetStaffInfoByLoginNameResult) {  
                        $user_id        = (int) $result->GetStaffInfoByLoginNameResult->Id;  
                        $login_name     = $result->GetStaffInfoByLoginNameResult->LoginName;  
                        $english_name   = $result->GetStaffInfoByLoginNameResult->EnglishName;  
                        $chinese_name   = $result->GetStaffInfoByLoginNameResult->ChineseName;  
                        $full_name      = $result->GetStaffInfoByLoginNameResult->FullName;  
                        $gender         = $result->GetStaffInfoByLoginNameResult->Gender;  
                        $id_card_number = $result->GetStaffInfoByLoginNameResult->IDCardNumber;  
                        if (!preg_match('/^\d+$/', $id_card_number)) {  
                            $id_card_number = 0;  
                        }  
                        //$pinyin_name    = pinyin($chinese_name);  
                        $department_id = (int) $result->GetStaffInfoByLoginNameResult->DepartmentId;  
                        $department_name = $result->GetStaffInfoByLoginNameResult->DepartmentName;  
                        $group_id = $result->GetStaffInfoByLoginNameResult->GroupId;  
                        $group_name = $result->GetStaffInfoByLoginNameResult->GroupName;  
                        try {  
                           // $this->insertUser(array($user_id, $login_name, $english_name, $chinese_name, $full_name, $pinyin_name, $gender, $id_card_number, $department_id, $department_name, $group_id, $group_name));  
//                            $_SESSION['user_id'] = $user_id;  
							//保存5天
                            setcookie("login_user",$english_name, time()+3600*24*5);
							
							echo "good==".$english_name;
//                            $_COOKIE['login_user'] = $english_name;
                            //$_COOKIE['login_user'] = $chinese_name ."=" .$english_name ."=" . $login_name ."=" . $full_name ."=" .$id_card_number."=" . "=" .$department_id . "=" .$department_name ."=" .$group_id."=" .$group_name;
                            echo  $_COOKIE['login_user'];
							
							mmrp_log("$english_name user login oa_login page.","logs/");
                            
							
							header("location: ".$last_url);
//	                        if(isset()){
//	                        	
//	                        }else{
//	                        	header("location: ./index.php");
//	                        }
//	                        header("location: ".$last_url); 
                            
                        } catch (User_Exception $e) {  
//                            msg($e->getMessage());  
                        }  
                    } else {  
                        echo "OA上没有您的个人信息，请联系管理员!";
                    }  
                }  
            } catch (SoapFault $s) {  
                echo "PASSPORT连接失败!";  
            }  
        } else {  
            $login_url = "http://passport.oa.com/modules/passport/signin.ashx?url=" . urlencode($loginoa_url);  
//            echo $login_url;
//			$login_url = "http://passport.oa.com/modules/passport/signin.ashx?url=" . urlencode("http://localhost/media_svn/html/mmrp/oa_test.php");  
//            echo $login_url;
            exit("<script type=\"text/javascript\">top.location.href = '$login_url';</script>");  
            
//            exit("<script type=\"text/javascript\">top.location.href = '$login_url';</script>");  
//        if(!isset($_COOKIE['login_user'])){
//			exit("<script type=\"text/javascript\">top.location.href = '$login_url';</script>");  
//		}else{
//			header("location: ./index.php"); 
//		}
            
        }  
    }


?>
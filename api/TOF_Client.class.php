<?php
/**
 * @description TOF客户端(Tencent OA Framework Client)
 * @author mikeliang
 * @version 1.0
 * @usage IP: 172.25.32.17(内网) IP: 10.130.1.178(外网)
 *
 * $tof = new TOF_Client();
 * $ret = $tof->SendMail('mikeliang', 'mikeliang', 'test mail', '<h1>mail body mail body</h1>');
 *
 */
require("functions.php");

class TOF_Client {
	private $client;

	public function __construct() {
	}

	public function __destruct() {
		unset($this->client);
	}

	private function _initClient($service) {
		$wsURL = "http://ws.tof.oa.com/".$service.".svc?wsdl";
		$appkey = "558811cb01b746cbab939ce4fc023402";//旧APPKEY：558811cb01b746cbab939ce4fc023402;新：91c2be0c55f347b2b14608f1b320b5bb
		$ns = "http://www.w3.org/2001/XMLSchema-instance";
		$nsnode = "http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Context";

		$appkeyvar = new SoapVar("<Application_Context xmlns:i=\"{$ns}\"><AppKey xmlns=\"{$nsnode}\">{$appkey}</AppKey></Application_Context>",XSD_ANYXML);
		$this->client = new SoapClient($wsURL);
		$header = new SoapHeader($ns, 'Application_Context',$appkeyvar);
		$this->client->__setSoapHeaders(array($header));
	}

	public function SendRTX($Sender, $Receiver, $Title, $MsgInfo, $Priority='Normal') {
		$this->_initClient('MessageService');
		$msg = (object) array(
			'Sender'		=> $Sender,
			'Receiver'		=> $Receiver,
			'Title'			=> $Title,
			'MsgInfo'		=> $MsgInfo,
			'Priority'		=> $Priority
		);
		$param = array('message' => $msg);
		$result = $this->client->SendRTX($param);

		return $result->SendRTXResult;
	}

	public function SendSMS($Receiver, $MsgInfo) {
		$this->_initClient('MessageService');
		// 对于短信，我们不太在意发送者、标题等信息
		$Sender = 'mikeliang';
		$Title = 'TOF_Client';
		$Priority='Normal';
		$msg = (object) array(
			'Sender'		=> $Sender,
			'Receiver'	=> $Receiver,
			'Title'			=> $Title,
			'MsgInfo'		=> $MsgInfo,
			'Priority'		=> $Priority
		);
		$param = array('message' => $msg);
		$result = $this->client->SendSMS($param);

		return $result->SendSMSResult;
	}
	
	
	
	public function SendMail($Sender, $Receiver,$cc = '', $Subject, $Msg, $Priority='Normal',$attachment_obj = NULL) {
		
		// $attachments = array();
		// $attachments[] = (object)array(
			// 'FileContent' => file_get_contents('aa111.docx'),
			// 'FileName' => 'good.docx'
		// );
		if(isset($attachment_obj))
		{
			$attachments = array();
			for($i=0 ; $i<count($attachment_obj) ; $i++)
			{
				$t_file = $attachment_obj[$i];
				$t_fname = $t_file['name'];
				$t_fcont= file_get_contents('../' . $t_file['url']);
				//$t_fcont = false;
				//防止file_get_contents获取远程地址有时失败
				// $try_count = 10;
				// for($i=0; $i<$try_count and $t_fcont === false; $i++){
					// $t_fcont = file_get_contents($t_file['url']);
				// }
				// while(true){
					// $t_fcont= file_get_contents($t_file['url']);
					// if($t_fcont) break;
				// }
				
				$attachments[] = (object)array(
					'FileContent' => $t_fcont,
					'FileName' => $t_fname
				);
			}
		};
		//如果是不是腾讯游戏 并且不是腾讯员工邮件发出
		if((stripos($Sender,'@tencent.com') === false) && (stripos($Sender,'@') !== false )){
                $real_sender = $Sender;
                $Sender = 'uedecp@tencent.com';//uedecp@tencent.com
                if(stripos($Receiver,$Sender) === false)
                        $Receiver .= ';'.$Sender.';';
                $Msg .= "<p style='font-size:14px;color:#000'><br /><br />此邮件由 京东UED ECP平台代发, 接口人 email: <b>".$real_sender .'</b></P>';
        };
		
		$this->_initClient('MessageService');
		$msg = (object) array(
			'Attachments'	=> (isset($attachment_obj)?$attachments:NULL),
			// 'Attachments'	=> $attachments,
			'Bcc'			=> '',
			'BodyFormat'	=> 'Html',
			'CC'			=> $cc,
			'Content'		=> stripslashes($Msg),
			'EmailType'		=> 'SEND_TO_ENCHANGE',
			'EndTime'		=> date('c', strtotime('2019-12-25')),
			'From'			=> $Sender,
			'Location'		=> NULL,
			'Priority'		=> $Priority,
			'StartTime'		=> date('c'),
			'Title'			=> $Subject,
			'To'			=> $Receiver,
		);

		$param = array('mail' => $msg);
		//dump($param);
		$result = $this->client->SendMail($param);
		
		return $result->SendMailResult;
	}

	public function getUser() {
		$auth_key = 'login_user_ecp';
		if (isset($_COOKIE[$auth_key])) {
			return $_COOKIE[$auth_key];
		}
//        echo($_COOKIE[$auth_key]);
//        exit;
		if (isset($_GET['ticket'])) {
			//setcookie('ecp_ticket',$_GET['ticket'],time()+3600*24*30,"/");
			try{
				echo "3==>";
				$ticket = $_GET['ticket'];
				$et = new eTicket();
				$et->encryptedTicket = $ticket;
				$mySoap = new SoapClient("http://passport.oa.com/services/passportservice.asmx?WSDL"); 
				echo "4==>";
				$soapResult = $mySoap->DecryptTicket($et);
				$LoginName = $soapResult->DecryptTicketResult->LoginName;
				if ($LoginName) {
					echo "1==>";
					setcookie($auth_key,$LoginName,time()+3600*24*30,"/");
					//查询插入数据
					$this->getUserInfo($LoginName);
					echo "2==>";
					return $LoginName;
				}
			}catch (SoapFault $s) {   
                echo $s->getMessage();  
            }  
			
		}
		$in_url = 'http://passport.oa.com/modules/passport/signin.ashx';
		$out_url = 'http://passport.oa.com/modules/passport/signout.ashx';
		$myurl = "http://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
		$title = 'ECP';
		$post_url = "$in_url?url=".urlencode($myurl)."&title=".urlencode($title);

		header("Location: $post_url");
		exit();
	}
	
	function getUserInfo($loginName){
		$ticket = $_GET['ticket'];
		
		$soap = new SoapClient("http://passport.oa.com/services/passportservice.asmx?WSDL"); 
		$result = $soap->DecryptTicket(array("encryptedTicket" => $ticket));
		
		if (!$result->DecryptTicketResult->LoginName) {  
                 echo "error";
        } else {  
			$soap = new SoapClient("http://ws.oa.com/orgservice.asmx?wsdl");  
			$result = $soap->GetStaffInfoByLoginName(array('loginName' => $result->DecryptTicketResult->LoginName));  
			if ($result->GetStaffInfoByLoginNameResult) {  
				$db = array(
					"user_id"        => (int) $result->GetStaffInfoByLoginNameResult->Id, 
					"login_name"     =>$result->GetStaffInfoByLoginNameResult->LoginName,  
					"user_email"     =>$result->GetStaffInfoByLoginNameResult->LoginName,  
					"english_name"   =>$result->GetStaffInfoByLoginNameResult->EnglishName,  
					"chinese_name"   =>$result->GetStaffInfoByLoginNameResult->ChineseName, 
					"full_name"      =>$result->GetStaffInfoByLoginNameResult->FullName, 
					"gender"         =>$result->GetStaffInfoByLoginNameResult->Gender, 
					"id_card_number" =>$result->GetStaffInfoByLoginNameResult->IDCardNumber,  
					"department_id" => (int) $result->GetStaffInfoByLoginNameResult->DepartmentId,  
					"department_name" => $result->GetStaffInfoByLoginNameResult->DepartmentName,  
					"group_id" => $result->GetStaffInfoByLoginNameResult->GroupId,
					"group_name" => $result->GetStaffInfoByLoginNameResult->GroupName,
					"user_first_login" =>   date ("Y-m-d H:m:s")
				);
				//检查数据库用户是否存在，存在返回记录数
				$num = $this->checkDBUser($loginName);
				echo '===' . $num . '===';
				if($num == 0){
					$this->insertDB("tb_users",$db);
				}else if($num != -1){
					//第一次登录 需要更新
					$this->updateDB("tb_users",$db,'id='.$num);
				}
				
			}
		}
			
	}//end getUserInfo
	
	//插入
	function insertDB($table,$dataArray){
		$field = "";
		$value = "";
		$db = connectDB();
		if( !is_array($dataArray) || count($dataArray)<=0) {
			$this->halt('没有要插入的数据');
			return false;
		}
		while(list($key,$val)=each($dataArray)) {
			$field .="$key,";
			$value .="'$val',";
		}
		$field = substr( $field,0,-1);
		$value = substr( $value,0,-1);
		$sql = "insert into $table($field) values($value)";
		//echo $sql;
		if (!mysql_query($sql,$db))
		{
			die('Error: ' . mysql_error());
		}
		
		mysql_close($db);
		return true;
	}
	
	//更新
	function updateDB( $table,$dataArray,$condition="") {
		if( !is_array($dataArray) || count($dataArray)<=0) {
			$this->halt('没有要更新的数据');
			return false;
		}
		$db = connectDB();
		$value = "";
		while( list($key,$val) = each($dataArray))
		$value .= "$key = '$val',";
		$value .= substr( $value,0,-1);
		$sql = "update $table set $value where $condition";
		//echo $sql;
		if (!mysql_query($sql,$db))
		{
			die('Error: ' . mysql_error());
		}
		return $sql;
	}
	
	//检查数据库用户是否存在，存在返回记录数
	function checkDBUser($loginName){
		//echo $loginName;
		$sql_s = "SELECT `id`,`user_id` FROM `tb_users` WHERE `login_name` = '". $loginName ."'";
		$db = connectDB();
		$result = mysql_query($sql_s,$db);
		$type = 0;
		//存在数据
		if(!is_bool($result)) {
			
			$num = mysql_fetch_array($result);
			//存在user id
			if($num[1]){
				$type = -1;
			}else{
				//oa第一次登录
				$type = $num[0];
			};
		};
		mysql_close($db);
		return $type;

	}

	public function logout() {
		$auth_key = 'login_user_ecp';
		$out_url = 'http://passport.oa.com/modules/passport/signout.ashx';
		$myurl = "http://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";
		$title = 'ECP';
		$post_url = "$out_url?url=".urlencode($myurl)."&title=".urlencode($title);

		setcookie($auth_key, "", 10);
		header("Location: $post_url");
		exit();
	}

	private function decode($str) {
		return json_decode($str);
	}

	private function encode($obj) {
		return json_encode($obj);
	}
}

class eTicket {
  public $encryptedTicket;
  function eTicket() {
  }
}


?>
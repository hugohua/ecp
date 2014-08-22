<?php
require_once 'TOF_Client.class.php';
require_once 'functions.php';
require_once('class.phpmailer.php');


if(!empty($_GET["act"]))
{
	$act=$_GET["act"];
	switch($act){
		case "sendrtx":
			sendRtxApi();
			break;
		case "sendemail":
			sendEmailApi();
			break;
		case 'sendmailer':
			sendMailer();
			break;	
	}
}

function sendRtxApi(){
	$arr=$_POST["data"];
	$Title=$arr["title"];
	$Receiver=$arr["receiver"];
	$MsgInfo=$arr["msginfo"];
	$tof = new TOF_Client();
	echo $tof ->SendRTX("ECP System", $Receiver, $Title, $MsgInfo);
	elog(" send rtx success. msg = " .json_encode($_POST["data"]) );
}

function sendEmailApi(){
	$arr=$_POST["data"];
	$Subject=$arr["subject"];
	$Receiver=$arr["receiver"];
	$cc=$arr["cc"];
	$Msg=$arr["msg"];
	$Sender = $arr["sender"];
	$attachment_obj = NULL;
	if(isset($arr["attachment"])){
		$attachment_obj = $arr["attachment"];
	};
	
	//dump($attachment_obj);
	$tof = new TOF_Client();
	echo $tof ->SendMail($Sender, $Receiver,$cc, $Subject, $Msg,'Normal',$attachment_obj);
	elog(" send email success. msg = " .json_encode($_POST["data" ]) );
}
		
function sendMailer(){
	$arr=$_POST["data"];
	$Subject=$arr["subject"];
	$Receiver=$arr["receiver"];
	$cc=$arr["cc"];
	$Msg=$arr["msg"];
	$Sender = $arr["sender"];
	$attachment_obj = NULL;
	
	error_reporting(E_STRICT);
	//include("class.smtp.php"); // optional, gets called from within class.phpmailer.php if not already loaded
	$mail             = new PHPMailer();
	$body             = $Msg;
	$mail->IsSMTP(); 							// telling the class to use SMTP
	$mail->Host       = "smtp.qq.com"; 			// SMTP server
	$mail->CharSet    = "utf-8";
	//$mail->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
	// 1 = errors and messages
	// 2 = messages only
	$mail->SMTPAuth   = true;                  // enable SMTP authentication
	$mail->SMTPSecure = "ssl";                 // sets the prefix to the servier
	$mail->Host       = "smtp.qq.com";      // sets GMAIL as the SMTP server
	$mail->Port       = 465;                   // set the SMTP port for the GMAIL server
	$mail->Username   = "280509126@qq.com";  // GMAIL username
	$mail->Password   = "13964332.";            // GMAIL password
	$mail->SetFrom('280509126@qq.com', '外包邮件发送通知');
	$mail->Subject    = $Subject;
	//$mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
	$mail->MsgHTML($body);
	//发件人也改成收件人
	//$mail->AddAddress($Sender,'需求接口人');
	//收件人
	$Receiver = explode(';',$Receiver);
	foreach ($Receiver as $key => $value) {
		if(strlen($value) > 3){
			$mail->AddAddress($value);
			//echo $value . '=bb=';
		}
		
	};
	//抄送人
	$cc = explode(';',$cc);
	foreach ($Receiver as $key => $value) {
		if(strlen($value) > 3){
			$mail->AddCC($value);
			//echo $value . '=cc=';
		}
		
	};
	//附件
	if(isset($arr["attachment"])){  
		$attachment_obj = $arr["attachment"];
		for($i=0 ; $i<count($attachment_obj) ; $i++)
		{
			$t_file = $attachment_obj[$i];
			$mail->AddAttachment('../' . $t_file['url']);      // attachment
		}
	};
	if(!$mail->Send()) {
	echo "Mailer Error: " . $mail->ErrorInfo;
	} else {
	echo "1";
	}
}
	?>
<?php
$host="localhost:3306";
$db_user="root";
$db_pass="root";
$db_name="mcadmin";

$PDOinstance = new PDO('mysql:host='.$host.'; dbname='.$db_name.';', $db_user, $db_pass);
$PDOinstance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$PDOinstance->query("set names utf8");

function pdo_query($mysqlCMD, $key = []){
	global $PDOinstance;
	$result = $PDOinstance->prepare($mysqlCMD);
	$result->execute($key);
	return $result;
}

date_default_timezone_set("Asia/Shanghai");
?>
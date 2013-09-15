<?php 

$to = $_GET["email"];
$subject = "Expenses Backup";
// $expenses = json_decode($_GET["expenses"])
$message = "Your backup is in the attachment";

mail ( $to , $subject , $message );

?>
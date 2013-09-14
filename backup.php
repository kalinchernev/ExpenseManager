<?php 
	$to = $_GET('email');
	echo $to;
	// $to = "kalata@shtrak.eu";
	$subject = "Expenses backup";
	$message = "Hello there, your expenses are in the attachment";

	mail ($to, $subject, $message);

	return "Backup successful";

?>
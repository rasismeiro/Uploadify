<?php
	move_uploaded_file( $_FILES['Filedata']['tmp_name'], "uploads/".$_FILES['Filedata']['name']);
	
	$test = isset($_POST['t'])?$_POST['t']:'';
	
	echo "Uploaded!".$test;
	die;
?>
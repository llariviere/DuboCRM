<?php
// client.php

error_reporting(0);

extract($_REQUEST);

require '../inc/db.inc';

@mysqli_query($link, "SET NAMES utf8");

if ($do == "save") {
	$champs = array('resultat','texte');
	foreach($champs as $champ) {
		if (isset(${$champ})) {
			if (is_array(${$champ})) {
				$set[] = "`$champ`='".addslashes(implode(",",${$champ}))."'";
			} else {
				$set[] = "`$champ`='".addslashes(${$champ})."'";
			}
		}
	}
	
	
	if ($sid) {
		$query = "UPDATE crm_sva SET ".implode(", ",$set)." WHERE id='$sid'";
		@mysqli_query($link, $query);
		
		$res['response'] = "<br>Enregistre";
	} else {
		$query = "INSERT INTO crm_sva SET sva='$id', client='$cid', admin='".($admin ? $admin : 0)."'";
		@mysqli_query($link, $query);
		$sid = @mysqli_insert_id($link);
		
		$res['sid'] = $sid;
		
	}
		
	
} elseif ($sid) {
	
	$query = "SELECT resultat,texte FROM crm_sva WHERE id='$sid'";
	$res = @mysqli_fetch_assoc(@mysqli_query($link, $query));
	
}

header('Content-Type: application/json');

print json_encode($res);

?>
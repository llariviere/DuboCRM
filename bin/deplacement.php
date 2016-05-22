<?php
error_reporting(0);

extract($_REQUEST);

require '../inc/db.inc';

@mysqli_query($link, "SET NAMES utf8");

if ($ids) {
	$ids = explode(",",$ids); $i = 0;
	foreach ($ids as $id) {
		//print "<br>UPDATE crm_deplacements SET ordre=$i WHERE id=$id";
		@mysqli_query($link, "UPDATE crm_deplacements SET ordre=$i WHERE id=$id");
		$i++;
	}
	die();
}

$res['deplacements'] = array();

if ($do == 'save') {
	
	$deplacement = @mysqli_fetch_assoc(@mysqli_query($link,"SELECT MAX(ordre) AS max_ordre FROM crm_deplacements WHERE jour = '$jour'"));
	
	$champs = array('depart_add','depart_latlng','arrivee_add','arrivee_latlng','distance','jour','client','detail','vendeur');
	foreach($champs as $champ) {
		if (isset(${$champ})) {
			if (is_array(${$champ})) {
				$set[] = "`$champ`='".addslashes(implode(",",${$champ}))."'";
			} else {
				$set[] = "`$champ`='".addslashes(${$champ})."'";
			}
		}
	}
	
	$set[] = "`ordre`='".($deplacement["max_ordre"]+1)."'";
	
	if ($did) {
		$query = "UPDATE crm_deplacements SET ".implode(", ",$set)." WHERE id=$did";
		$result = mysqli_query($link, $query);
		
		$res['response'] = $query."<br>Enregistre";
	} else {
		$query = "INSERT INTO crm_deplacements SET ".implode(", ",$set);
		$result = mysqli_query($link, $query);
		
		$did = mysqli_insert_id($link);
		
		$res['did'] = $did;
		$res['response'] = "<br>Enregistre";
	}
	
	header('Content-Type: application/json');
	print json_encode($res);
	die();
}

if ($jour) {
	$WHERE[] = "`jour`='$jour'";
	$ORDER	 = " ORDER BY id DESC LIMIT 1";
}
if ($client) $WHERE[] = "`client`='$client'";

$query = "SELECT * FROM crm_deplacements WHERE ".implode(" AND ",$WHERE).$ORDER;

$result = @mysqli_query($link, $query);

while ($d = @mysqli_fetch_object($result)) $res['deplacements'] = $d;

header('Content-Type: application/json');

print json_encode($res);
die();
?>
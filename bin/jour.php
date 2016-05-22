<?php
// jour.php
error_reporting(0);

extract($_REQUEST);

require '../inc/db.inc';

if ($do=='save') {
	
	$query = "INSERT INTO crm_taches SET vendeur='$uid', jour='$jour', details='".addslashes($details)."'";
	@mysqli_query($link, $query);
	die('Ajoute!');
}

@mysqli_query($link, "SET NAMES utf8");


$query = "SELECT v1.id, v1.client, c1.nomentreprise AS nomclient 
FROM crm_visites v1 LEFT JOIN listeclients c1 ON v1.client=c1.nclient
WHERE jour = '$jour' AND v1.vendeur = '$uid' ORDER BY nomclient";

$result = @mysqli_query($link, $query);

$res['visites'] = array();

if (@mysqli_num_rows($result)>0) {
	while ($r = @mysqli_fetch_object($result)) $res['visites'][$r->id] = $r;
} else {
	$res['visites'][0] = (object) ["nomclient" => "Aucune visite pour cette date."];
}



$query = "SELECT id, arrivee_add, distance 
FROM crm_deplacements WHERE jour = '$jour' AND vendeur = '$uid' ORDER BY ordre,id;";

$result = @mysqli_query($link, $query);

$res['deplacements'] = array();

if (@mysqli_num_rows($result)>0) {
	while ($r = @mysqli_fetch_object($result)) $res['deplacements'][] = $r;
} else {
	$res['deplacements'][0] = (object) ["id" => "0" ,"arrivee_add" => "Aucune deplacements pour cette date.", "distance" => ""];
}



$query = "SELECT id, details 
FROM crm_taches WHERE jour = '$jour' AND vendeur = '$uid' ORDER BY id;";

$result = @mysqli_query($link, $query);

$res['taches'] = array();

if (@mysqli_num_rows($result)>0) {
	while ($r = @mysqli_fetch_object($result)) $res['taches'][] = $r;
} else {
	$res['taches'][0] = (object) ["id" => "0" ,"details" => "Aucune taches pour cette date."];
}


     
header('Content-Type: application/json');
print json_encode($res);


?>
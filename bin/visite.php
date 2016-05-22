<?php
// client.php

error_reporting(0);

extract($_REQUEST);

require '../inc/db.inc';

@mysqli_query($link, "SET NAMES utf8");

$champs = array('id','client','vendeur','fournisseur','adresse','latlng','avenir','actions','detaille','sommaire','timestmp','jour','heure','duree','suivi','nomclient','nomfournisseur');

if ($do == "save") {
	
	foreach($champs as $champ) {
		if (isset(${$champ})) {
			if (is_array(${$champ})) {
				$set[] = "`$champ`='".addslashes(implode(",",${$champ}))."'";
			} elseif ($champ=='fournisseur') {
				list($fourn,$dum) = explode(":",${$champ});
				$set[] = "`$champ`='$fourn'";
			} else {
				$set[] = "`$champ`='".addslashes(${$champ})."'";
			}
		}
	}
	if ($vid) {
		$query = "UPDATE crm_visites SET ".implode(", ",$set)." WHERE id='$vid'";
		@mysqli_query($link, $query);
		print "<br>Enregistre";
	} else {
		$query = "INSERT INTO crm_visites SET ".implode(", ",$set);
		@mysqli_query($link, $query);
		$vid = @mysqli_insert_id($link);
		print "vid=$vid";
	}
		
	die();
}


if ($vid) {
	$query = "SELECT v1.*, c1.NomEntreprise AS nomclient , f1.NomFournisseur AS nomfournisseur FROM crm_visites v1 
LEFT JOIN listeclients c1 ON v1.client=c1.NClient 
LEFT JOIN listefournisseurs f1 ON v1.fournisseur=f1.NoFournisseur WHERE id = $vid";
} else {
	$query = "SELECT v1.*, c1.NomEntreprise AS nomclient , f1.NomFournisseur AS nomfournisseur FROM crm_visites v1 
LEFT JOIN listeclients c1 ON v1.client=c1.NClient 
LEFT JOIN listefournisseurs f1 ON v1.fournisseur=f1.NoFournisseur WHERE `client` = $cid AND jour = '$jour'";
}

$result = @mysqli_query($link, $query);

if (@mysqli_num_rows($result) > 0) {
	
	$r = @mysqli_fetch_assoc($result);
	
	foreach($champs as $champ) $res['visite'][$champ] = null2empty($r[$champ]);
	
}

if ($cid) {
	$query = "SELECT l1.*, s1.id AS sid, s1.resultat AS rid, r1.nom AS resultat
FROM crm_liste_sva l1 
LEFT JOIN crm_sva s1 ON l1.id=s1.sva AND s1.client=".$cid."
LEFT JOIN crm_liste_resultat r1 ON s1.resultat=r1.id
ORDER BY l1.nom";
} else {
	$query = "SELECT l1.*, s1.id AS sid, s1.resultat AS rid, '' AS resultat
FROM crm_liste_sva l1 
LEFT JOIN crm_sva s1 ON l1.id=s1.sva
ORDER BY l1.nom";
}
	
$result = @mysqli_query($link, $query);

while ($r = mysqli_fetch_assoc($result)) {
	$sva[$r['id']] = array_map("null2empty",$r);
}

$res['svas'] = $sva;
	
header('Content-Type: application/json');
print json_encode($res);
     

?>
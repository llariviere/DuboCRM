<?php
// index_init.php

error_reporting(0);

require '../inc/db.inc';

@mysqli_query($link, "SET NAMES utf8");

$uid = $_REQUEST['uid'];

$res = $competitions = $cibles = $sva = array();

$result = mysqli_query($link, "SELECT NClient, NoClient, NomEntreprise
FROM vendeurs v1 
INNER JOIN listeclients l1 ON v1.Vendeur=l1.Vendeur
LEFT JOIN clients_cible c1 ON l1.NClient=c1.cid 
WHERE v1.NoVendeur=$uid AND c1.cid IS NOT NULL
ORDER BY l1.NomEntreprise");

while ($r = mysqli_fetch_assoc($result)) $cibles[$r['NClient']] = $r['NoClient'] .' - ' . $r['NomEntreprise'];

$res['cibles'] = $cibles;

$result = @mysqli_query($link, "SELECT * FROM listedistributeurs ORDER BY NomEntreprise;");
while ($r = @mysqli_fetch_assoc($result)) $competitions[$r['No']] = $r['NomEntreprise'];
$res['competitions'] = $competitions;


$result = @mysqli_query($link, "SELECT * FROM crm_liste_resultat ORDER BY nom;");
while ($r = @mysqli_fetch_assoc($result)) $resultats_sva[$r['id']] = $r['nom'];
$res['resultats_sva'] = $resultats_sva;


$result = @mysqli_query($link, "SELECT * FROM crm_termes ORDER BY cat, terme;");
while ($r = @mysqli_fetch_object($result)) $termes[$r->id] = $r;
$res['termes'] = $termes;


$i = 0;
$result = @mysqli_query($link, "SELECT latlng, add FROM crm_favorits WHERE vendeur='$uid' ORDER BY add;");
if (@mysqli_num_rows($result)) {
	$favorits[] = (object) ["id" => "0" ,"add" => "&bull; Choisissez une adresse."];
	while ($r = @mysqli_fetch_object($result)) {
		$favorits[$i++] = $r;
	}
} else {
	$favorits[] = (object) ["id" => "0" ,"add" => "Aucun favorit pour l'instant."];
}

$res['favorits'] = $favorits;



$result = @mysqli_query($link, "SELECT DISTINCT jour FROM crm_visites WHERE vendeur = '$uid' AND jour IS NOT NULL ORDER BY jour");
while ($r = @mysqli_fetch_assoc($result)) $events[] = $r['jour'];
$result = @mysqli_query($link, "SELECT DISTINCT jour FROM crm_deplacements WHERE vendeur = '$uid' AND jour IS NOT NULL ORDER BY jour");
while ($r = @mysqli_fetch_assoc($result)) $events[] = $r['jour'];
$events = array_unique($events);
$res['events'] = $events;

     
header('Content-Type: application/json');
print json_encode($res);


?>
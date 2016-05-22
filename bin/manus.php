<?php
// manus.php

extract($_REQUEST);

require '../inc/db.inc';

@mysqli_query($link, "SET NAMES utf8");

$query = "SELECT nofournisseur AS id, nomfournisseur AS nom, noshims FROM listefournisseurs WHERE nomfournisseur LIKE '%$q%' ORDER BY nom";

$result = @mysqli_query($link, $query);
$res['manus'] = array();

while ($r = @mysqli_fetch_object($result)) {
	$res['manus'][$r->id] = $r->nom;
}
     
header('Content-Type: application/json');
print json_encode($res);


?>
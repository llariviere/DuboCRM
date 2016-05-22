<?php
// clients.php

extract($_REQUEST);

require '../inc/db.inc';

@mysqli_query($link, "SET NAMES utf8");

$query = "SELECT nclient AS id, nomentreprise, noclient FROM listeclients WHERE nomentreprise LIKE '%$q%' OR  noclient LIKE '$q%' ORDER BY nomentreprise LIMIT 20";

$result = @mysqli_query($link, $query);

$res['clients'] = array();

if (@mysqli_num_rows($result)>0) {
	
	while ($r = @mysqli_fetch_object($result)) {
		$res['clients'][] = $r;
	}
	
} elseif (strlen($q)>4) {
	
	$query = "SELECT '0' AS id, name AS nomentreprise, cust AS noclient, contact, phone AS notel, ADDR2 AS adresse,
ADDR3 AS ville, ADDR4 AS codepostal, email, slsm
FROM ec.customer c1
WHERE shipto='0000' AND cust=master_account AND name NOT LIKE 'COD%' AND
( name LIKE '%$q%' OR cust LIKE '$q%' )
ORDER BY nomentreprise LIMIT 20";

	$result = @mysqli_query($link, $query);
	
	if (@mysqli_num_rows($result)>0) {
		
		while ($r = @mysqli_fetch_object($result)) {
			$res['clients'][] = $r;
		}
		
	}
	
}

header('Content-Type: application/json');
print json_encode($res);


?>
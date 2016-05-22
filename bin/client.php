<?php
// client.php

error_reporting(0);

extract($_REQUEST);

require '../inc/db.inc';

@mysqli_query($link, "SET NAMES utf8");

if ($do == "save") {
	$champs = array('strategie','typeclient','segments','budget','competition','manufacturier');
	$pre_client = @mysqli_fetch_assoc(@mysqli_query($link, "SELECT budget FROM listeclients WHERE nclient='$cid'"));
	foreach($champs as $champ) {
		if (isset(${$champ})) {
			if (is_array(${$champ})) {
				$set[] = "`$champ`='".addslashes(implode(",",${$champ}))."'";
			} elseif ($champ=='manufacturier') {
				$v = explode(":",${$champ});
				$set[] = "`$champ`='".$v[0]."'";
			} elseif ($champ=='budget') {
				if ($pre_client['budget']!=addslashes(${$champ})) {
					$query = "INSERT INTO historique_modifications 
					(champ_table,champ,valeur,qui_table,qui_id) VALUES 
					('listeclients','budget','".$pre_client['budget']."','vendeurs','$uid')";
					
					@mysqli_query($link, $query);
				}
				$set[] = "`$champ`='".addslashes(${$champ})."'";
			} else {
				$set[] = "`$champ`='".addslashes(${$champ})."'";
			}
		}
	}
	$query = "UPDATE listeclients SET ".implode(", ",$set)." WHERE nclient='$cid'";
	@mysqli_query($link, $query) or print mysqli_error();
	print "<br>Enregistre";
	die();
}

if ($do == "add") {
	$champs = array("nomentreprise","noclient","contact","notel","adresse","ville","codepostal","email","slsm");
	
	foreach($champs as $champ) {
		if ($champ == "slsm" && $slsm>0) {
			$vendeur = @mysqli_fetch_assoc(@mysqli_query($link,"SELECT vendeur FROM vendeurs WHERE novendeur='$slsm'"));
			if ($vendeur['vendeur']) $pars[] = "`vendeur`='".addslashes($vendeur['vendeur'])."'";
		} else {
			$pars[] = "`$champ`='".addslashes(${$champ})."'";
		}
	}
	
	
	$query = "INSERT INTO listeclients SET ".implode(", ",$pars);
	
	@mysqli_query($link, $query);
	
	$cid = @mysqli_insert_id($link);
	
	die("cid=$cid|<br>ajoute!");
}


$champs = array('nclient','noclient','nomclient','notel','adresseclient','strategie','vendeur','typeclient','segments','lytd_sale','ytd_sales','budget','competition','manufacturier');

$query = "SELECT nclient,noclient,nomentreprise AS nomclient,lc.notel,strategie,vendeur,typeclient,segments,lytd_sale,ytd_sales,budget,competition,CONCAT(manufacturier,': ',lf.nomfournisseur) AS manufacturier, CONCAT(ADDR2,', ',ADDR3,', ',ADDR4) AS adresseclient 
FROM soumissions.listeclients lc 
LEFT JOIN ec.customer cu ON lc.noclient=cu.cust AND cu.shipto='0000' AND cu.cust=cu.master_account
LEFT JOIN listefournisseurs lf ON lc.manufacturier=lf.nofournisseur
WHERE nclient = $cid";

$result = mysqli_query($link, $query);

$r = mysqli_fetch_assoc($result);

foreach($champs as $champ) $res['client'][$champ] = null2empty($r[$champ]);

$plaintes = $visites = $sva = array();
$noclient = $r['noclient'];


// les plaintes du client dans la derniere annee...
$query = "SELECT id_pc, w1.writer_name AS requerant, no_commande, nos_de_produit, plainte1, commentaire,
code_non_conformite, action_corrective, `date` AS jour
FROM pc.pc pc 
LEFT JOIN ec.writers w1 ON pc.requerant=w1.writer
WHERE no_client = '$noclient' AND `date` > '".date("Y-m-d", mktime(0,0,0,date('m'),date('d'),date('Y')-1))."'";

$result = mysqli_query($link, $query);

if (@mysqli_num_rows($result)>0) {
	while ($r = mysqli_fetch_assoc($result)) {
		$r['code_non_conformite'] = $code_non_conformite[$r['code_non_conformite']];
		$plaintes[$r['id_pc']] = array_map("null2empty",$r);
	}
} else {
	$plaintes[0] = array("id_pc"=>"0","jour"=> date("Y-m-d"),"code_non_conformite"=>"Aucune plainte dans les 12 derniers mois");
}

$res['plaintes'] = $plaintes;




$result = mysqli_query($link, "SELECT l1.*, s1.id AS sid, s1.resultat AS rid, r1.nom AS resultat
FROM crm_liste_sva l1 
LEFT JOIN crm_sva s1 ON l1.id=s1.sva AND s1.client=$cid
LEFT JOIN crm_liste_resultat r1 ON s1.resultat=r1.id
ORDER BY l1.nom");

while ($r = mysqli_fetch_assoc($result)) {
	$sva[$r['id']] = array_map("null2empty",$r);
}

$res['sva'] = $sva;


$result = mysqli_query($link, "SELECT id, jour FROM crm_visites WHERE client='$cid' ORDER BY jour DESC");

if (@mysqli_num_rows($result)>0) {
	while ($r = mysqli_fetch_assoc($result)) $visites[$r['id']] = array_map("null2empty",$r);
} else {
	$visites[0] = ["0" ,"Aucune visite pour cette date."];
}

$res['visites'] = $visites;


     
header('Content-Type: application/json');

print json_encode($res);
?>
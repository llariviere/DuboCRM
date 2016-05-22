<?php
$link = mysqli_connect("localhost","php02","php02");
mysqli_select_db($link, "soumissions");

$nomMois_fr = Array("mois","janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre");


$code_non_conformite = array(
	"BTR" => "Bris-transport ",
	"CAN" => "Cancell&eacute, ",
	"CLI" => "Erreur du client",
	"EPR" => "Erreur de prix",
	"FRN" => "Erreur du fournisseur",
	"REC" => "Erreur de r&eacute,ception",
	"PUT" => "Erreur mise en localisation",
	"VEN" => "Erreur de vendeur",
	"MAU" => "Mauvais materiel",
	"MLI" => "Manquant a la livraison",
	"DEF" => "Mat&eacute,riel d&eacute,fectueux",
	"NOF" => "Erreur de Facturation",
	"DAT" => "Panne informatique",
	"TRT" => "Retard-transport",
	"QSU" => "Quantit&eacute, en trop",
	"CHA" => "Erreur de chargement",
	"ACH" => "Erreur d'achat",
	"ZZZ" => "Autre");

function null2empty($str) {
	return (is_null($str) ? '' : $str);
}

function removeaccents($string) {
	$string = utf8_decode($string);
    return strtr(preg_replace('/\s\s+/',' ',$string),
        "ŠŒŽšœžŸ¥µÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåæçèéêëìíîïðñòóôõöøùúû",
        "SOZsozYYuAAAAAAACEEEEIIIIDNOOOOOOUUUUYsaaaaaaaceeeeiiiionoooooouuu");
}

?>
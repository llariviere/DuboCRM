<?php
// admin.php

//error_reporting(0);

extract($_REQUEST);

require '../inc/db.inc';

if ($do == 'save') {
	@mysqli_query($link, "UPDATE $table SET `$champ`='".addslashes($value)."' WHERE $cible");
	list($champ_id,$champ_id_valeur) = explode("=", $cible);
	mysqli_query($link, "INSERT INTO historique_modifications 
		(champ_table,champ_id,champ_id_valeur,champ,valeur,qui_table,qui_id)
		VALUE ('$table','$champ_id','$champ_id_valeur','$champ','".addslashes($tempvalue)."','writers','$uid')");
	die("Enregistre!");
}

if ($do=="load") {
	
	switch ($table) {
		case "clients_cible":
			$champs = array("cid", "Nom", "Vendeur", "Cible");
			$query = "SELECT cid, l1.NomEntreprise AS Nom, l1.Vendeur, c1.Cible FROM clients_cible c1 LEFT JOIN listeclients l1 ON c1.cid=l1.nclient ORDER BY NomEntreprise";
			$modifiables = array("Cible");
			$alignright = array("Cible");
			break;
		case "listeclients":
			$champs = array("nclient", "nomentreprise", "budget");
			$query = "SELECT nclient, nomentreprise, budget FROM listeclients ORDER BY nomentreprise";
			$modifiables = array("budget");
			$alignright = array("budget");
			break;
		case "listedistributeurs":
			$champs = array("No", "NomEntreprise");
			$query = "SELECT `No`,`NomEntreprise` FROM listedistributeurs ORDER BY NomEntreprise";
			$modifiables = array("");
			$alignright = array("");
			break;
		case "listefournisseurs":
			$champs = array("NoFournisseur", "NomFournisseur", "noshims");
			$query = "SELECT NoFournisseur,NomFournisseur,noshims FROM listefournisseurs ORDER BY NomFournisseur";
			$modifiables = array("noshims");
			$alignright = array("noshims");
			break;
		case "crm_liste_resultat":
			$champs = array("id", "nom", "texte");
			$query = "SELECT `id`,`nom`,`texte` FROM crm_liste_resultat ORDER BY `nom`";
			$modifiables = array("nom","texte");
			$alignright = array("");
			break;
		case "crm_liste_sva":
			$champs = array("id","idx","nom","doc","texte","image");
			$query = "SELECT `id`,`idx`,`nom`,`doc`,`texte`,`image` FROM crm_liste_sva ORDER BY `nom`";
			$modifiables = array("idx","nom","doc","texte","image");
			$alignright = array("idx");
			break;
		case "crm_sva":
			$champs = array("id","Vendeur","NomEntreprise","service","resultat","texte","demande");
			$query = "SELECT s1.id,c1.Vendeur,c1.NomEntreprise,l1.nom AS service,r1.nom AS resultat,s1.texte,demande
FROM crm_sva s1
LEFT JOIN crm_liste_sva l1 ON s1.sva=l1.id
LEFT JOIN listeclients c1 ON s1.client=c1.NClient
LEFT JOIN crm_liste_resultat r1 ON s1.resultat=r1.id
ORDER BY c1.NomEntreprise,l1.nom";
			$modifiables = array("texte");
			$alignright = array("id");
			break;
		case "crm_termes":
			$champs = array("id","cat","terme");
			$query = "SELECT `id`,`cat`,`terme` FROM `crm_termes` ORDER BY `cat`,`terme`";
			$modifiables = array("terme");
			$alignright = array("");
			break;
		case "vendeurs":
			$champs = array("NVendeur","Vendeur","NoVendeur","Succursale","email","cell");
			$query = "SELECT `NVendeur`,`Vendeur`,`NoVendeur`,`Succursale`,`email`,`cell` FROM `vendeurs` WHERE visible=0 ORDER BY `Vendeur`";
			$modifiables = array("cell");
			$alignright = array("NoVendeur","Succursale","cell");
			break;
	}
		
	$result = mysqli_query($link, $query);
	
	$html = '<table cellpadding="0" border="0" cellspacing="0" id="'.$table.'" class="tablesorter"><thead><tr>';	
	foreach($champs as $champ) $html.= "<th>$champ</th>";
	$html.= "</tr></thead><tbody>";
	
	while ($r = @mysqli_fetch_assoc($result)) {
		$html.= "<tr id=\"".$champs[0].'='.$r[$champs[0]]."\">";
		foreach($champs as $champ) {
			$align = (in_array($champ,$alignright) ? " droit" : "");
			if (in_array($champ,$modifiables)) {
				$html.= "<td><div data-champ=\"$champ\" class=\"editable$align\" contenteditable=\"true\">".$r[$champ]."</div></td>";
			} else {
				$html.= "<td class=\"$align\">".$r[$champ]."</td>";
			}
			
		}
		$html.= "</tr>";
	}
	
	$html.= "</tbody></table><script>init_editable();</script>";
	
	/*$html.= "<td><select data-champ=\"$champ\" class=\"editable\" >
					<option ".($r[$champ]=="segment" ? "selected" : "").">segment</option>
					<option ".($r[$champ]=="strategie" ? "selected" : "").">strategie</option>
					<option ".($r[$champ]=="typeclient" ? "selected" : "").">typeclient</option>
				</select></td>";
	*/
	
	print $html;
	
	die();
}


?>

CREATE TABLE `historique_modifications` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`champ_table` VARCHAR(50) NOT NULL DEFAULT '0',
	`champ_id` VARCHAR(50) NOT NULL DEFAULT '0',
	`champ_id_valeur` VARCHAR(50) NOT NULL DEFAULT '0',
	`champ` VARCHAR(50) NOT NULL DEFAULT '0',
	`valeur` VARCHAR(250) NULL DEFAULT NULL,
	`qui_table` VARCHAR(250) NULL DEFAULT NULL,
	`qui_id` SMALLINT(6) NULL DEFAULT NULL,
	`timestmp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DEFAULT
AUTO_INCREMENT=5
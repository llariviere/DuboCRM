<?php

//error_reporting(0);

extract($_REQUEST);

require '../inc/db.inc';

$vendeurs = @mysqli_query($link, "SELECT nvendeur, vendeur FROM vendeurs WHERE visible=0 ORDER BY vendeur");

?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name = "format-detection" content = "telephone=no">
	<meta name="apple-mobile-web-app-title" content="DuboCRM">
	<!-- ICONS -->
 
    <!-- iPad retina icon -->
    <link href="../img/icon-152x152.png"
          sizes="152x152"
          rel="apple-touch-icon-precomposed">
 
    <!-- iPad retina icon (iOS < 7) -->
    <link href="../img/icon-144x144.png"
          sizes="144x144"
          rel="apple-touch-icon-precomposed">
 
    <!-- iPad non-retina icon -->
    <link href="../img/icon-76x76.png"
          sizes="76x76"
          rel="apple-touch-icon-precomposed">
 
    <!-- iPad non-retina icon (iOS < 7) -->
    <link href="../img/icon-72x72.png"
          sizes="72x72"
          rel="apple-touch-icon-precomposed">
 
    <!-- iPhone 6 Plus icon -->
    <link href="../img/icon-180x180.png"
          sizes="120x120"
          rel="apple-touch-icon-precomposed">
 
    <!-- iPhone retina icon (iOS < 7) -->
    <link href="../img/icon-114x114.png"
          sizes="114x114"
          rel="apple-touch-icon-precomposed">
 
    <!-- iPhone non-retina icon (iOS < 7) -->
    <link href="../img/icon-57x57.png"
          sizes="57x57"
          rel="apple-touch-icon-precomposed">
          
          
	<link rel="apple-touch-startup-image" href="../img/startup.png">
	
    <link href="../img/icon-48x48.png"
          sizes="48x48"
          rel="shortcut icon">
    <link href="../img/icon-48x48.png"
          sizes="48x48"
          rel="icon">

    <title>DuboCRM : admin</title>
    
    <link rel="stylesheet" href="../css/crm.css">
    
<style>
   	html {
	font-family: Arial;
}

table, thead {
    border: 1px solid;
    border-color: ThreeDShadow ThreeDHighlight ThreeDShadow ThreeDShadow;
}

td, th {
	padding: 2px 5px;
    font-size:12px ;
}

tr:nth-child(even) {
    background: #eeeeee;
}

thead {
    background-color: ThreeDFace;
}

th {
  border: 1px solid;
  vertical-align: bottom;
  border-color: ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight;
}

td {
	border-right: solid 1px ThreeDShadow;
    white-space: nowrap;
    vertical-align: top;
    text-align:left;
}

table.tablesorter #body1 tr.even td  {
	background-color:#F1F1F1;
}
table.tablesorter #body1 tr.odd td {
    background-color: #FFF;
}

table.fixed {
    table-layout:fixed;
    width: 400px;
}
table.fixed td,th {
    overflow: hidden;
}
table.fixed td {
    text-align:right;
}

td.end {
	border-top: solid 1px ThreeDShadow;
}

.editable {
	width: 150px;
	overflow: hidden;
}
.editable:hover {
	background-color: #ffffaa;
}

.droit {
	text-align: right;
}

#admin_msg {
	position: fixed;
	top: 20px;
	left: 50%;
	margin-left: -50px;
	padding: 10px;
	background-color: rgba(255,255,200,.8);
	border: solid #ddd 3px;
	display: none;
	border-radius: 6px;
}
    	
    </style>
    
  </head>
  <body>
  <div class="views">
  
  	<div id="admin_tools" class="view view-main">
  	
  		<select id="admin_table">
  			
  			<option value="">-- Choisir la table --</option>
  			<option value="clients_cible">Cibles</option>
			<option value="listeclients">Clients</option>
			<option value="listedistributeurs">Distributeurs</option>
			<option value="listefournisseurs">Fournisseurs</option>
			<option value="crm_liste_resultat">Resultats</option>
			<option value="crm_liste_sva">Services</option>
			<option value="crm_sva">Services assignes</option>
			<option value="crm_termes">Termes</option>
			<option value="vendeurs">Vendeurs</option>

  		</select>
  		
  		<select id="admin_vendeurs">
  			
  			<option value="">-- Choisir le vendeur --</option>
<?php
while ($v = @mysqli_fetch_object($vendeurs)) print '<option value="'.$v->nvendeur.'">'.$v->vendeur.'</option>';
?>
  			
  		</select>
  		
  		<input type="button" value="Go" id="admin_go"/>
  		
  	</div>
  	<p></p>
  	<div id="admin_results"></div>
  	
  	<div id="admin_msg"></div>
  	
  </div>
    
<script type="text/javascript" src="../js/framework7.min.js"></script>
<!--script type="text/javascript" src="../js/jquery.tablesorter.min.js"></script>
<script type="text/javascript" src="//maps.google.com/maps/api/js?language=fr&region=CA"></script-->

<script>

var myApp = new Framework7({
	cache: false,
	modalTitle: 'DuboCRM',
	modalButtonCancel: 'Annule...',
	modalPreloaderTitle: 'Un instant...',
	scrollTopOnStatusbarClick: true
});

var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
	dynamicNavbar: true,
	domCache: true
});

var uid = '<?=$uid;?>';

var loadtable = function(){
	if ($$("#admin_table").val()=='') {
		$$("#admin_results").html('');
		return;
	}
	$$.post("../bin/admin.php", {"do":"load",uid:uid,"table":$$("#admin_table").val(),vendeur:$$("#admin_vendeurs").val()}, function(data){
		$$("#admin_results").html(data);
		init_editable();
	});
}
	
$$("#admin_table").on("change", loadtable);
$$("#admin_go").on("click", loadtable);

var tempvalue;

function init_editable() {
	$$(".editable").on("click", function(){
		tempvalue = $$(this).text();
	});
	
	$$(".editable").on("blur keydown change", function(e){
		
		var div = $$(this);
		
		if(tempvalue==div.text()) return;
		
		if( e.type === 'blur' || (e.type === 'keydown' && e.which === 13) ){
	    	e.preventDefault();
		    $$.post("../bin/admin.php", {
			    	"do":"save",
			    	uid:uid,
			    	"table":$$("#admin_results").find("table").attr("id"),
			    	"cible":div.parent().parent().attr("id"),
			    	"champ":div.data("champ"),
			    	"value":div.text(),
			    	"tempvalue":tempvalue
		    	}, function(data){
				$$("#admin_msg").html(data).show();
				setTimeout(function(){$$("#admin_msg").hide();},3000)
			});
			tempvalue = div.text();
	    	div.blur();
		}
	});
	
}

init_editable();

//    $$("#sommaire").tablesorter({headers: {8:{sorter:false},9:{sorter:false}}}); 



</script>

</body>
</html>
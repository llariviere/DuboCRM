// Initialize your app
	var myApp = new Framework7({
		cache: false,
		modalTitle: 'DuboCRM',
		modalButtonCancel: 'Annule...',
		modalPreloaderTitle: 'Un instant...',
		scrollTopOnStatusbarClick: true
	});

	var $$ = Dom7;

	var crm = {};
	
	var aujourdhui = '';

	var mainView = myApp.addView('.view-main', {
	    dynamicNavbar: true,
	    domCache: true
	});




// Section login - >>>

	function storageAvailable(){
	    var test = 'test';
	    try {
	        localStorage.setItem(test, test);
	        localStorage.removeItem(test);
	        return true;
	    } catch(e) {
	        return false;
	    }
	}
	
	function logoff() {
		$$("#login_usr").val('').focus();
		$$("#login_pwd").val('');
		$$("#login_frm").show();
		if (storageAvailable()===true) {
			window.localStorage.setItem("crm_user","");
			window.localStorage.setItem("crm_pwd","");
		}
		myApp.loginScreen();
	}

	if (storageAvailable()===true) {
		
		var crm_user = window.localStorage.getItem("crm_user");
		var crm_pwd  = window.localStorage.getItem("crm_pwd");
		if (crm_user && crm_pwd) {
			login_ajax(crm_user,crm_pwd);
		}
		else {
			$$("#login_usr").val('').focus();
			$$("#login_pwd").val('');
			$$("#login_frm").show();
		}
	} 
	else {
		$$("#login_usr").val('').focus();
		$$("#login_pwd").val('');
		$$("#login_frm").show();
	}

	$$("#login_submit").on("click", function(){
		login_ajax($$("#login_usr").val(), $$("#login_pwd").val());
	});

	function login_ajax(crm_user,crm_pwd) {
		
		$$("#login_loader").show();
		
		$$("#login_msg").html('');
		
		$$.post('bin/login.php',{"crm_user":crm_user, "crm_pwd":crm_pwd}, function(data){
			if (storageAvailable()===true) {
				if(Number.isInteger(parseInt(data))) {
					window.localStorage.setItem("crm_user",crm_user);
					window.localStorage.setItem("crm_pwd",crm_pwd);
					window.localStorage.setItem("crm_uid",data);
				} 
				else if(data=='err_usr') {
					window.localStorage.removeItem("crm_user");
					window.localStorage.removeItem("crm_pwd");
					window.localStorage.removeItem("crm_uid");
				}
				else if(data=='err_pwd') {
					window.localStorage.removeItem("crm_pwd");
					window.localStorage.removeItem("crm_uid");
				}
			}
			if(Number.isInteger(parseInt(data))) {
				crm.uid = parseInt(data);
				/*
				crm.u.br = 1;
				crm.u.prenom = "Mario";
				crm.u.nom = "Lanoix";
				crm.u.email = "mlanoix@dubo.qc.ca";
				crm.u.phone = "514-255-7711";
				*/
				crm_init();
				myApp.closeModal();
			} 
			else if(data=='err_usr') {
				$$("#login_usr").val('').focus();
				$$("#login_pwd").val('');
				$$("#login_msg").html('Votre nom d\'usager est incorrect!');
				$$("#login_frm").show();
			}
			else if(data=='err_pwd') {
				$$("#login_pwd").val('').focus();
				$$("#login_msg").html('Votre mot de passe est incorrect!');
				$$("#login_frm").show();
			}
			else {
				$$("#login_usr").val('').focus();
				$$("#login_pwd").val('');
				$$("#login_msg").html('Erreur inconnue : '+data);
				$$("#login_frm").show();
			}
			$$("#login_loader").hide();
		});
	}

// Section login - fin <<<




// Section geo - debut >>>

	var geocoder;
	
	var latlng, latlng_br1 = '45.501689,-73.567256', add_br1 = 'DUBO Mtl, 5780, Ontario, Montreal, QC';

	function nav2geoloc() {
		
		if (!navigator.geolocation){
			myApp.alert("La Geolocation nest pas supporte par votre navigateur");
			return false;
		}

		function success(position) {
			latlng = [position.coords.latitude,position.coords.longitude];
		};

		function error() {
			myApp.alert("Impossible de determiner votre location");
			return false;
		};
		
		navigator.geolocation.getCurrentPosition(success, error);
	}
	
	function geoloc2add(lat,lng,sel) {
		
		geocoder = new google.maps.Geocoder();
		
		var latlng = new google.maps.LatLng(lat, lng);
		
		return geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK && results[1]) {
				$$(sel).val( results[1].formatted_address ).trigger("change");
			} else {
				$$(sel).val( status );
			}
		});
	}

	function add2geoloc(add,sel) {
		
		geocoder = new google.maps.Geocoder();

		geocoder.geocode( { 'address':add }, function(results, status) {
			
			if (status == google.maps.GeocoderStatus.OK) {
				if (sel=="adresseclient") {
					
				} else {
					var lat = results[0].geometry.location.lat();
					var lng = results[0].geometry.location.lng();
					$$(sel).val(lat+','+lng);
					//myApp.alert('Adresse confirmee!');
					geoloc2img(lat,lng)
				}
				
				if (sel == "#deplacement_depart_latlng" || sel == "#deplacement_arrivee_latlng") {
					geoloc2dst($$("#deplacement_depart_latlng").val(),$$("#deplacement_arrivee_latlng").val(),"#deplacement_distance");
				}
			} else {
				myApp.alert('Adresse introuvable! Veuillez re-ecrire.');
			}
			
		});
		
	}
	
	function geoloc2dst(lla,llb,sel) {
		
		if (!lla || !llb) {
			return false;
		}
		
		var a = lla.split(",");
		var b = llb.split(",");
		var origin = new google.maps.LatLng(a[0], a[1]);
		var destination = new google.maps.LatLng(b[0], b[1]);
		
		var service = new google.maps.DistanceMatrixService();
		service.getDistanceMatrix(
		  {
		    origins: [origin],
		    destinations: [destination],
		    travelMode: google.maps.TravelMode.DRIVING
		  }, callback);
		function callback(response, status) {
		  $$(sel).val( response.rows[0].elements[0].distance.value );
		  //myApp.alert("Distance = "+ $$(sel).val());
		}
	}

	function geoloc2img(lat,lng) {
		
		var modal = myApp.modal({
			title: 'Adresse confirmee!',
			afterText:  '<div class="swiper-container" style="width: auto; margin:5px -15px -15px">'+
			              '<div class="swiper-pagination"></div>'+
			              '<div class="swiper-wrapper">'+
			                '<div class="swiper-slide"><img src="//maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=11&size=280x180&markers=color:red%7C' + lat + ',' + lng + '" height="180" style="display:block"></div>' +
			              '</div>'+
			            '</div>',
			buttons: [
			  {
			    text: 'Voir',
			    bold: true,
		        onClick: function () {
		          var w = $$("body").width();
		          var h = $$("body").height();
		          document.open("http://maps.apple.com/?q="+lat+","+lng, "map", "width="+w+",height="+h+",resizable");
		        }
			  },
			  {
			    text: 'OK',
			    bold: true
			  }
			]
		});
		
		$$(modal).find("img").on("click", function(e){
			$$(this).attr("src", $$(this).attr("src").replace(/[&?]zoom=\d+/, function(attr) {
			  return attr.replace(/\d+/, function(val) { return parseInt(val)+1; });
			}));
		});
	}
	

// Section geo - fin <<<



			
// section accueil >>>

function crm_init() {
	
	if (crm.uid==120 || crm.uid==223) {
		$$("#admin_link").show();
		$$("#admin_iframe").attr("src","admin/index.php?uid="+crm.uid);
	}
	
	$$.getJSON('bin/init.php',{uid:crm.uid},function(data){
		// la liste des clients cibles du vendeur...
		$$.each(data.cibles, function(key, value){
			$$('#crm_cibles').append('<option value="'+key+'">'+value+'</option>');
		});
		// la liste des visites du vendeur...
		crm.visites = data.visites;
		// les resultats de sva...
		crm.resultats_sva = data.resultats_sva;
		$$('#visite_sva_resultat').append('<option value="0">&bull; Choisir le resultat...</option>');
		$$.each(data.resultats_sva, function(key, value){
			$$('#visite_sva_resultat').append('<option value="'+key+'">'+value+'</option>');
		});
		// la liste des competiteurs...
		$$.each(data.competitions, function(key, value){
			$$('#competition').append('<option value="'+key+'">'+value+'</option>');
		});
		// la liste des evenements au calendrier
		crm.events = [];
		$$.each(data.events, function(key, value){
			crm.events.push(new Date(value.split('-').join(',')));
		});
		
		crm.segments = []; i = 0;
		$$.each(data.termes, function(id, v){
			if(v.cat=='segment') {
				crm.segments[i]=v.terme; i++;
			} else {
				$$("#"+v.cat).append('<option value="'+id+'">'+v.terme+'</option>');
			}		
		});
	});
	
	var today = new Date();
	var annee = parseInt(today.getFullYear());
	var mois  = parseInt(today.getMonth());
	var jour  = parseInt(today.getDate());
	
	aujourdhui = annee+'-'+str_pad((mois+1), 2, '0')+'-'+str_pad(jour, 2, '0');
	
	$$("#crm_cibles").change(function(){		
		clientOpen(parseInt($$("#crm_cibles").val()));
		$$("#crm_cibles").val('');
	});
	
	var ac_clients = myApp.autocomplete({
	    opener: $$('#autocomplete-clients'),
	    openIn: 'popup',
	    popupCloseText: 'Back',
	    searchbarPlaceholderText: 'Chercher...',
	    notFoundText: 'Aucun client trouv&eacute;',
	    limit: 20,
	    backOnSelect: true,
	    onChange: function(autocomplete, value){
			if (value=='' || !value.length) return;
			
			var noclient = parseInt(value[0].split(':')[0].trim());
			var nomclient = value[0].split(':')[1].trim();
			
			if (noclient>0) {
				clientOpen(noclient);
				$$("#autocomplete-clients").val('');
			} else if (noclient==0) {
				crm.clients = crm.rec;
				$$('#autocomplete-clients').find('.item-after').text(nomclient);
				$$('#autocomplete-clients').find('input').val(nomclient);
				$$("#client_add").show();
			}
		},
	    source: function (autocomplete, query, render) {
	        var results = [];
	        if (query.length < 2) {
	            render(results);
	            return;
	        }
	        $$.getJSON('bin/clients.php', {uid:crm.uid,q:query}, function(data){
	        	$$("#client_add").hide();
	        	if (query.length > 5 && data.clients.length==0) {
	        		// on presente un bouton pour ajouter manuellement le client...
	        		$$("#client_add").show();
				}
	        	crm.rec = data.clients
				$$.each(crm.rec, function(key, v){
					results.push(v.id+': '+v.noclient+' - '+v.nomentreprise);
				});
				render(results);
			});
				        
	    }
	});
	
	var ac_manus = myApp.autocomplete({
	    input: '#visite_fournisseur',
	    openIn: 'dropdown',
	    limit: 20,
	    source: function (autocomplete, query, render) {
	        var results = [];
	        if (query.length < 2) {
	            render(results);
	            return;
	        }
	        $$.getJSON('bin/manus.php', {uid:crm.uid,q:query}, function(data){
				$$.each(data.manus, function(key, value){
					results.push(key+': '+value);
				});
				render(results);
			});
				        
	    }
	});
	
	var ac_manufacturier = myApp.autocomplete({
	    input: '#manufacturier',
	    openIn: 'dropdown',
	    limit: 20,
	    source: function (autocomplete, query, render) {
	        var results = [];
	        if (query.length < 2) {
	            render(results);
	            return;
	        }
	        $$.getJSON('bin/manus.php', {uid:crm.uid,q:query}, function(data){
				$$.each(data.manus, function(key, value){
					results.push(key+': '+value);
				});
				render(results);
			});
				        
	    }
	});
	
	var ac_visites = myApp.autocomplete({
	    input: '#autocomplete-visites',
	    limit: 20,
	    openIn: 'dropdown',
	    notFoundText: 'Aucune visite correspondante',
	    source: function (autocomplete, query, render) {
	        var results = [];
	        if (query.length === 0) {
	            render(results);
	            return;
	        }
	        
	        $$.each(crm.visites, function(key,value){
	        	if (value.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(value);
			});
			
	        render(results);
	    },
	    onChange: function(autocomplete, value){
			if (value=='') return;
			mainView.router.load({pageName: 'visite'});
				
			var ac_manus = myApp.autocomplete({
			    input: '#autocomplete-manus',
			    openIn: 'dropdown',
			    source: function (autocomplete, query, render) {
			        var results = [];
			        if (query.length === 0) {
			            render(results);
			            return;
			        }
			        // Find matched items
			        for (var i = 0; i < manus.length; i++) {
			            if (manus[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(manus[i]);
			        }
			        // Render items by passing array with result items
			        render(results);
			    }
			});
			var calendarDateFormat = myApp.calendar({
			    input: '#calendar-date-format',
			    dateFormat: 'yyyy-mm-dd'
			});    	
				
		}
	});
	
	nav2geoloc();
		
// section accueil <<<



// section taches >>>
	
	$$("#tache_add").on("click", function(e){
		
		$$("#tache_jour").val('');
		$$("#tache_details").val('');
		
		var tache_calendar = myApp.calendar({
		    input: '#tache_jour',
		    dateFormat: 'yyyy-mm-dd',
	    	closeOnSelect: true	
		});    
		
		mainView.router.load({pageName: 'tache'});
		
		$$("#tache_save").on("click", function(){
			if ($$("#tache_jour").val().trim()=="") {
				myApp.alert("Le champ 'jour' est obligatoire");
				return;
			}
			if ($$("#tache_details").val().trim()=="") {
				myApp.alert("Le champ 'details' est obligatoire");
				return;
			}
			
		
			$$.post("bin/jour.php", {"do":"save", "uid":crm.uid, "jour":$$("#tache_jour").val(), "details":$$("#tache_details").val()}, function(data){
				
				myApp.alert(data);
			});
		});
		
	});

// section taches <<<



// section deplacement >>>

	var ac_deplacement_client = myApp.autocomplete({
	    input: '#deplacement_client',
	    openIn: 'dropdown',
	    limit: 20,
	    source: function (autocomplete, query, render) {
	        var results = [];
	        if (query.length < 2) {
	            render(results);
	            return;
	        }
	        $$.getJSON('bin/clients.php', {uid:crm.uid,q:query}, function(data){
				$$.each(data.clients, function(key, value){
					results.push(key+': '+value);
				});
				render(results);
			});      
	    }
	});
	
	var deplacementCalendar = myApp.calendar({
	    input: '#deplacement_jour',
	    closeOnSelect: true
	});
	
	$$("#deplacement_add").on("click", function(e){
		
		crm.cid = '';
		
		mainView.router.load({pageName: 'deplacement'});
		
		var ici = latlng;
		
		$$("#deplacement_jour").val(aujourdhui);
		$$('#deplacement_client').val('').show();
		$$('#deplacement_detail').val('');
		$$("#deplacement_depart_latlng").val('');
		$$("#deplacement_depart_add").val('');
		$$("#deplacement_arrivee_latlng").val(ici.join(','));
		$$('.deplacement_client').show();
		geoloc2add(ici[0],ici[1],"#deplacement_arrivee_add");
		
		$$.getJSON('bin/deplacement.php',{uid:crm.uid, jour:aujourdhui},function(data){
			
			var dernier = data.deplacements;
			
			if (dernier.arrivee_latlng) {
				var llb = dernier.arrivee_latlng.split(',');
				var diff = Math.abs((llb[0]-ici[0]) + (llb[1]-ici[1]));
				
				if (diff>0.001) { // si pas egal a ici...
					$$("#deplacement_depart_latlng").val(dernier.arrivee_latlng);
					$$("#deplacement_depart_add").val(dernier.arrivee_add);
				} else {
					$$("#deplacement_swap").trigger("click");
				}
			}
		});
	});

	$$("#deplacement_depart_add").change(function(){
		$$("#deplacement_depart_latlng").val('');
		add2geoloc($$('#deplacement_depart_add').val(), "#deplacement_depart_latlng");
	});

	$$("#deplacement_arrivee_add").change(function(){
		$$("#deplacement_arrivee_latlng").val('');
		add2geoloc($$('#deplacement_arrivee_add').val(), "#deplacement_arrivee_latlng");
	});
		
	$$("#deplacement_geoloc").on("click", function(){
		$$("#deplacement_depart_latlng").val(latlng.join(','));
		geoloc2add(latlng[0],latlng[1],"#deplacement_depart_add");
	});

	$$("#deplacement_geoloc_br1").on("click", function(){
		$$("#deplacement_depart_latlng").val(latlng_br1);
		$$("#deplacement_depart_add").val(add_br1).trigger("change");
	});
		
	$$("#deplacement_swap").on("click", function(){
		var latlng 	= $$("#deplacement_depart_latlng").val();
		var add 	= $$("#deplacement_depart_add").val();
		$$("#deplacement_depart_latlng").val($$("#deplacement_arrivee_latlng").val());
		$$("#deplacement_depart_add").val($$("#deplacement_arrivee_add").val());
		$$("#deplacement_arrivee_latlng").val(latlng);
		$$("#deplacement_arrivee_add").val(add);
	});
	
	// on enregistre...
	$$("#deplacement_save").on("click", function(){
		
		$$(".jaune").removeClass("jaune");
		
		var jaunes ='';
		
		var champs = ['depart_add','depart_latlng','arrivee_add','arrivee_latlng','distance','jour','client','detail','vendeur'];
		$$.each(champs, function(i,v){
			if (!$$("#deplacement_"+v).val() && v!='distance' && v!='vendeur' && v!='client') {
				$$("#deplacement_"+v).addClass('jaune');
				jaunes = v;
				$$("#deplacement_"+v).focus();
				return false;
			}
		});
		
		if(jaunes) {
			myApp.alert("Le champ "+jaunes+" est obligatoire!");
			return;
		}
		
		champs = {
			'do':'save',
			'did':crm.did,
			'depart_add':$$('#deplacement_depart_add').val(),
			'depart_latlng':$$('#deplacement_depart_latlng').val(),
			'arrivee_add':$$('#deplacement_arrivee_add').val(),
			'arrivee_latlng':$$('#deplacement_arrivee_latlng').val(),
			'distance':$$('#deplacement_distance').val(),
			'jour':$$('#deplacement_jour').val(),
			'client':$$('#deplacement_client').val().split(':')[0],
			'detail':$$('#deplacement_detail').val(),
			'vendeur':crm.uid};
		
		$$.getJSON('bin/deplacement.php', champs, function(data){
			crm.did = 0;
			$$("#depart_add,#depart_latlng,#arrivee_add,#arrivee_latlng,#distance,#jour,#client,#detail,#vendeur").val('');
			myApp.alert(data.response);
			if ($$("#calendrier_vendeur").val()==$$('#deplacement_jour').val()) {
				vendeurCalendarClose();
				myApp.hidePreloader();
			}
			mainView.router.back()
		});
	});
	
// section deplacement <<<
	



// section client >>>

	var clientOpen = function(id){
		
		crm.cid = id;
		
		if (!crm.cid) return;
		
		$$("#client .jaune").removeClass("jaune");
		
		$$.getJSON('bin/client.php', {uid:crm.uid,cid:crm.cid}, function(data){
			
			var segments = [];
			
			$$.each(data.client, function(key, value){
				if (value===0 || value==='0') value='';
				switch(key) {
					case 'nclient':
						crm.cid = value;
						break;
					case 'adresseclient':
						$$("#adresseclient").val(value);
						$$("#mapclient").find("a").attr("href","http://maps.apple.com/?q="+encodeURIComponent(value));
						break;
					case 'notel':
						if (value) $$('#'+key).html('<a href="tel:'+phone_format(value)+'" class="external" style="color:#333366;">'+phone_format(value)+'</a>');
						break;
					case 'nomclient':
						crm.nomclient = value;
					case 'vendeur':
						$$('#'+key).text(value);
						break;
					case 'lytd_sale':
						$$('#'+key).html('<b>'+(annee-1) + '</b> : $' + number_format(value,2));
						break;
					case 'ytd_sales':
						$$('#'+key).html('<b>'+annee + '</b> : $' + number_format(value,2));
						break;
					case 'segments': 
						segments = value.split(', ');
						break;
					case 'budget': 
						$$('#'+key).val(number_format(value, 0, ".", ",", true));
						break;
					default: 
						$$('#'+key).val(value);
						break;
				}				
			});
			
			$$(".smart-select select").html('<option style="display:none;" value="">...</option>');
			
			for(var i = 0; i<crm.segments.length; i++) {
				
				myApp.smartSelectAddOption(".smart-select select", '<option value="'+crm.segments[i]+'" '+(segments.includes(crm.segments[i])?'selected':'')+'>'+crm.segments[i]+'</option>', i);
				
			}
			
			// on signale les champs a completer...
			$$("#client .obligatoire").filter(function() {
			    return !this.value;
			}).addClass("jaune").change(function(e){
				$$(this).removeClass("jaune");
				if ($$(this).attr('id')=="segments") $$("#segments").closest("ul").removeClass("jaune");
			});
			if ($$("#segments").hasClass('jaune')) $$("#segments").closest("ul").addClass("jaune");
			
			
			// la liste des plaintes relies au client...
			$$("#plaintes_liste").html('');
			crm.plaintes = data.plaintes;
			$$.each(crm.plaintes, function(id, v){
				$$("#plaintes_liste").append('<li>' +
							'<a href="#" class="item-link item-content plainte" id="'+v.id_pc+'">' +
								'<div class="item-inner">' +
									'<div class="item-title">'+v.jour+' : '+v.code_non_conformite+'</div>' +
									'<div class="item-after"></div>' +
								'</div>' +
							'</a>' +
						'</li>');
			});
			
			$$(".plainte").on("click", function(e) {
				
				$$("div.plainte").html('');
				
				var id = $$(this).attr("id");
				
				$$.each(crm.plaintes, function(i, v) {
					if (id==v.id_pc) {
						$$.each(v, function(k, c) {
							$$("#plainte_"+k).html(c.replace("\n","<br>"));
							console.log(k+' = '+c)
						});
					}
					return true;
				});
				mainView.router.load({pageName: 'plainte'});
				
			});
			
			
			// la liste des visites relies au client...
			$$("#visites_liste").html('');
			crm.visites = data.visites;
			$$.each(crm.visites, function(id, v){
				$$("#visites_liste").append('<li>' +
							'<a href="#" class="item-link item-content" id="'+v.id+'">' +
								'<div class="item-inner">' +
									'<div class="item-title">'+v.jour+'</div>' +
									'<div class="item-after"></div>' +
								'</div>' +
							'</a>' +
						'</li>');
			});
			
			$$("#budget").on("change", function(){
				$$(this).val(number_format($$(this).val(), 0, ".", ",", true))
			});
			
			$$("#visites_liste").find("a").on("click", function(e){
				visiteOpen($$(this).attr("id"));
			});
				
			// la liste des sva relies au client...
			$$("#infos_client li.sva.liste").remove()
			crm.svas = data.sva;		
			$$.each(crm.svas, function(id, sva){
				$$("#infos_client").append('<li class="sva liste close-panel" id="'+id+'">'+sva.nom+'</li>');
			});
				
			$$("li.sva.liste").on("click", function(e){
				serviceOpen($$(this).attr("id"));
			});
		});
		mainView.router.load({pageName: 'client'});
	}

	$$("#client_add_btn").on("click", function(){
		
		var champs = ["nomentreprise","noclient","contact","notel","adresse","ville","codepostal","email","slsm"];
		
		var noclient = parseInt($$("#autocomplete-clients").find("input").val().split(" - ")[0]);
		
		if (noclient>20000 && Number.isInteger(noclient)) {
			
			var client = '';
			
			$$.each(crm.clients, function(i,v){
				if (noclient == v.noclient) {
					client = v;
					return true;
				}
			});
			
			$$.each(champs, function(i,champ){
				$$("#fiche_"+champ).val(client[champ]);
			});
			
		} else {
			
			$$.each(champs, function(i,champ){
				$$("#fiche_"+champ).val('');
			});
			$$("#fiche_nomentreprise").val($$("#autocomplete-clients").val());
		}
		
		$$('#autocomplete-clients').find('.item-after').text('');
		$$('#autocomplete-clients').find('input').val('');
		
		mainView.router.load({pageName: 'fiche_client'});
		
		$$("#client_add_btn").hide();
	});
	
	$$("#fiche_save").on("click", function(){
		
		var champs = ["nomentreprise","noclient","contact","notel","adresse","ville","codepostal","email","slsm"];
		var obj = {"do":"add",uid:crm.uid};
		
		$$.each(champs, function(i,champ){
			obj[champ] = $$("#fiche_"+champ).val();
		});
		
		$$.post("bin/client.php", obj, function(data){
			if (data.substr(0,3)=="cid") {
				var cid = data.split("|")[0].split("=")[1];
				data = data.split("|")[1];
				clientOpen(cid);
				// on reset le formulaire...
				$$.each(champs, function(i,champ){
					$$("#fiche_"+champ).val('');
				});
			}
			myApp.alert(data);
		});
		
	});

	$$(".visite_open").click(function(e){
			
			var jaune = $$("#client .jaune").length;
			if (jaune>0) {
				myApp.alert('<b>Vous devez completer les champs obligatoire avant d\'ajouter une visite!</b>');
				return false;
			}
			
			visiteOpen(0);
			
		});

	$$("#client_save").click(function(){
			
			var jaune = $$("#client .jaune").length;
			if (jaune>0) {
				myApp.alert('<b>Vous devez completer les champs obligatoire avant d\'enregistrer!</b>');
				return false;
			}
			
			var segments = $$('#segments').parent().find("div.item-after").text().split(",");
			
			var obj = {
				'do':'save',
				'uid':crm.uid,
				'cid':crm.cid,
				'strategie':$$('#strategie').val(),
				'typeclient':$$('#typeclient').val(),
				'segments':segments,
				'budget':$$('#budget').val().replace(/[^0-9\-.]/g, ''),
				'competition':$$('#competition').val(),
				'manufacturier':$$('#manufacturier').val()};
			$$.post("bin/client.php",obj, function(data){
				myApp.alert(data);
			});
		});

// section client <<<




// section visite >>>

	function visiteOpen(vid) {
			
			crm.vid = vid;
			
			// on essais de trouver par la date...
			
	        $$.getJSON('bin/visite.php', {uid:crm.uid, cid:crm.cid, vid:crm.vid, jour:aujourdhui}, function(data){
	        	
	        	if (data.visite) {
	        		var visite_jour, visite_nomclient, visite_nofour, visite_nomfour;
	        		
					$$.each(data.visite, function(key, value){
						
						if (value===0 || value==='0') value='';
						switch(key) {
							case 'id':
								crm.vid = value;
								break;
							case 'fournisseur':
								visite_nofour = value;
								break;
							case 'nomfournisseur':
								visite_nomfour = value;
								break;
							case 'jour':
								$$('#visite_'+key).val(value);
								visite_jour = value;
								break;
							case 'nomclient':
								visite_nomclient = value;
								break;
							default: 
								$$('#visite_'+key).val(value)
								break;
						}				
					});
					
					if (visite_nofour) $$('#visite_fournisseur').val(visite_nofour+': '+visite_nomfour);
					
					$$("#visite_nom").text(visite_jour + ' - ' + visite_nomclient);
				} else {
					// Si on trouve rien on cree...
					$$("#visite_nom").text(aujourdhui+' - '+$$("#nomclient").text());
					$$("#visite_adresse").val($$("#adresseclient").val());
					$$("#visite_jour").val(aujourdhui);
					
					$$("#visite_latlng").val('');
					add2geoloc($$('#visite_adresse').val(), "#visite_latlng");
				}
				
				$$("#visite_sva li").remove();
				crm.svas = data.svas;
				$$.each(crm.svas, function(id, sva){
					if (sva.sid) {
						$$("#visite_sva").append('<li>' +
						'<a href="#" onClick="crm.sid=this.id;myApp.pickerModal(\'.picker-sva\')" class="item-link item-content" id="'+sva.sid+'">' +
							'<div class="item-media">'+sva.image+'</div>' +
							'<div class="item-inner">' +
								'<div class="item-title">'+sva.nom+'</div>' +
								'<div class="item-after">'+sva.resultat+'</div>' +
							'</div>' +
						'</a>' +
					'</li>');
					}
				});
				
				$$("#visite_add_sva").trigger("click");
				
			});
				
			mainView.router.load({pageName: 'visite'});
		}
	
	$$(".picker-sva").on("open",function(){ 
			$$.getJSON('bin/sva.php', {sid:crm.sid}, function(data){
				$$("#visite_sva_resultat").val(data.resultat);
				$$("#visite_sva_texte").val(data.texte);
			});
		});
	
	$$(".picker-sva").on("close",function(){
			var sel = document.getElementById("visite_sva_resultat");
			var txt = (sel.selectedIndex ? sel.options[sel.selectedIndex].text : '');
			
			$$("#"+crm.sid).find(".item-after").html(txt);
			
			$$.getJSON('bin/sva.php', {do:'save',sid:crm.sid,'resultat':$$("#visite_sva_resultat").val(),'texte':$$("#visite_sva_texte").val()}, function(data){
				myApp.alert(data.response);
			});
		});
	
	$$("#visite_add_sva").click(function(){
			
			var str = '<li>' +
				      '<div class="item-content">' +
				        '<div class="item-media"><img src="img/icon-add.png" id="visite_add_sva" alt="" height="20" style=""></div>' +
				        '<div class="item-inner">' +
				          '<div class="item-input">' +
				            '<select class="select-client" id="visite_add_sva_liste">' +	             
				             '<option>Ajouter un service...</option>';
				             
			$$.each(crm.svas, function(id, sva){
				if (!sva.sid) str +=		 '<option value="'+id+'">'+sva.nom+'</option>';
			});	             
			
			str +=	        '</select>' +
				          '</div>' +
				        '</div>' +
				      '</div>' +
				    '</li>';
			
			$$("#visite_sva").append(str);
			
			$$("#visite_add_sva_liste").on("change", function(e){
				var val = $$(this);
				$$.each(crm.svas, function(id, sva){
					if (id == val.val()) {
						// on enregistre l'ajout du sva...
					  $$.getJSON('bin/sva.php', {do:'save',uid:crm.uid,cid:crm.cid,id:id}, function(data){
					  	  
					  	  val.parent().parent().parent().parent().remove();
						  
						  $$("#visite_sva").append('<li>' +
							'<a href="#" onClick="crm.sid=this.id;myApp.pickerModal(\'.picker-sva\')" class="item-link item-content" id="'+data.sid+'">' +
								'<div class="item-media">'+sva.image+'</div>' +
								'<div class="item-inner">' +
									'<div class="item-title">'+sva.nom+'</div>' +
									'<div class="item-after">'+sva.resultat+'</div>' +
								'</div>' +
							'</a>' +
						  '</li>');
						  
						  crm.svas[id].sid = data.sid;
						  
						  $$("#visite_add_sva").trigger("click");
					  });
					  
					  return true;
					}
				});	
			});
		
		});
	
	$$("#visite_geoloc").click(function(){
			$$("#visite_latlng").val('');
			var ll = nav2geoloc();
			$$("#visite_latlng").val(ll[0]+','+ll[1]);
			$$("#visite_adresse").val(geoloc2add(ll[0],ll[1]));
		});
	
	$$("#visite_adresse").change(function(){
			$$("#visite_latlng").val('');
			var ll = add2geoloc($$('#visite_adresse').val());
			$$("#visite_latlng").val(ll[0]+','+ll[1]);
		});
	
	$$("#visite_save").click(function(){
			
			var jaune = $$("#visite .jaune").length;
			if (jaune>0) {
				myApp.alert('<b>Vous devez completer les champs obligatoire avant d\'enregistrer!</b>');
				return false;
			}
			//'client','vendeur','jour','heure','duree','fournisseur','adresse','latlng','avenir','actions','detaille','sommaire','suivi','timestmp','nomclient'
			
			
			var obj = {
				'do':'save',
				'vid':crm.vid,
				'client':crm.cid,
				'vendeur':crm.uid,
				'jour':$$('#visite_jour').val(),
				'heure':$$('#visite_heure').val(),
				'duree':$$('#visite_duree').val(),
				'fournisseur':$$('#visite_fournisseur').val(),
				'adresse':$$('#visite_adresse').val(),
				'latlng':$$('#visite_latlng').val(),
				'avenir':$$('#visite_avenir').val(),
				'actions':$$('#visite_actions').val(),
				'detaille':$$('#visite_detaille').val(),
				'sommaire':$$('#visite_sommaire').val(),
				'suivi':$$('#visite_suivi').val()};
				
			console.log(obj);
			
			$$.post("bin/visite.php",obj, function(data){
				if (data.substr(0,3)=='vid') {
					crm.vid = data.substr(4);
					myApp.alert('Enregistre!');
				} else {
					myApp.alert(data);
				}
				
			});
		});

	$$("#visite_deplacement_add").on("click", function(){
		
		deplacementOpen();
		
	});

	var suiviCalendar = myApp.calendar({
	    input: '#visite_suivi',
	    events: crm.events,
	    closeOnSelect: true
	});

	var jourCalendar = myApp.calendar({
	    input: '#visite_jour',
	    closeOnSelect: true
	});

	var vendeurCalendar = myApp.calendar({
	    input: '#calendrier_vendeur',
	    closeOnSelect: true,
	    events: crm.events,
	    onClose: vendeurCalendarClose
	});
	
	$$("#calendrier_choose").on("click", function(){
		$$("#calendrier_vendeur").trigger("click");
	});
		
	// on initialise la page calendrier avec la date du jour...
	
	$$("#calandrier_jour").html(aujourdhui);
	
	function vendeurCalendarClose() {
		    	
      myApp.showPreloader('Un instant...');
	  	
	  var jour = $$('#calendrier_vendeur').val();
		
	  $$.getJSON('bin/jour.php', {uid:crm.uid,jour:jour}, function(data){
	  	
	  	$$("#jour_visites_liste").html('');
	  	
		$$.each(data.visites, function(id, v){
			$$("#jour_visites_liste").append('<li>' +
					'<a href="#" class="item-link item-content" id="'+v.id+'">' +
						'<div class="item-inner">' +
							'<div class="item-title">'+v.nomclient+'</div>' +
							'<div class="item-after"></div>' +
						'</div>' +
					'</a>' +
				'</li>');
		});
		
		$$("#jour_visites_liste").find("a").on("click", function(e){
			visiteOpen($$(this).attr("id"));
		});
	  	
	  	$$("#jour_deplacements_liste").html('');
	  	
		$$.each(data.deplacements, function(id, v){
			$$("#jour_deplacements_liste").append('<li id="'+v.id+'">' +
			        '<div class="item-content">' +
			          '<div class="item-inner">' +
			            '<div class="item-title">'+v.arrivee_add+'</div>' +
			            '<div class="item-after">'+(v.distance ? (Math.round(v.distance/100)/10)+' Km' : '')+'</div>' +
			          '</div>' +
			        '</div>' +
			        '<div class="sortable-handler"></div>' +
			      '</li>');
		});
		
		$$("#jour_deplacements_liste").find("li").on("sort", function(){
			var ids = [];
			$$("#jour_deplacements_liste").find("li").each(function(e){
				ids.push($$(this).attr("id"));
			});
			$$.get("bin/deplacement.php",{uid:crm.uid,ids:ids.join(",")}, function(data){
				if(data)myApp.alert(data);
			});
			
		});
		
	  	$$("#jour_taches_liste").html('');
	  	
		$$.each(data.taches, function(id, v){
			$$("#jour_taches_liste").append('<li id="'+v.id+'">' +
			        '<div class="item-content">' +
			          '<div class="item-inner">' +
			            '<div class="item-title">'+v.details+'</div>' +
						'<div class="item-after"></div>' +
			          '</div>' +
			        '</div>' +
			      '</li>');
		});
	  	
	  	myApp.hidePreloader();
	  	
	  });
	  
	}
	
	// on initialise la page calendrier avec la date du jour...
	$$('#calendrier_vendeur').val(aujourdhui);
	vendeurCalendarClose();
	
// section visite <<<




// section deplacement >>>
	
	function deplacementOpen() {
		
		var ici = $$("#visite_latlng").val().split(",");
		
		$$("#deplacement_jour").val($$("#visite_jour").val());
		$$("#deplacement_depart_latlng").val('');
		$$("#deplacement_depart_add").val('');
		$$("#deplacement_arrivee_latlng").val($$("#visite_latlng").val());
		$$("#deplacement_arrivee_add").val($$("#visite_adresse").val());
		$$('.deplacement_client').show();
		$$('#deplacement_client').val(crm.cid);
		if (crm.cid) $$('.deplacement_client').hide();
		$$('#deplacement_detail').val('');
		
		$$.getJSON('bin/deplacement.php',{uid:crm.uid, jour:$$("#visite_jour").val()},function(data){
			
			var dernier = data.deplacements;
			
			if (dernier.arrivee_latlng) {
				var llb = dernier.arrivee_latlng.split(',');
				var diff = Math.abs((llb[0]-ici[0]) + (llb[1]-ici[1]));
				
				if (diff>0.001) { // si pas egal a ici...
					$$("#deplacement_depart_latlng").val(dernier.arrivee_latlng);
					$$("#deplacement_depart_add").val(dernier.arrivee_add);
					$$("#deplacement_arrivee_latlng").val($$("#visite_latlng").val());
					$$("#deplacement_arrivee_add").val($$("#visite_add").val());
					
					geoloc2dst($$("#deplacement_depart_latlng").val(),$$("#deplacement_arrivee_latlng").val(),"#deplacement_distance");
				}
			}
		});
		
		mainView.router.load({pageName: 'deplacement'});
		
	}
	
// section deplacement <<<



// section service >>>

	function serviceOpen(sid){
		
		$$.each(crm.svas, function(id, sva){
			if (id==sid) {
				$$("#service_nom").html("<h3>"+sva.nom+"</h3>");
				$$("#service_texte").html(sva.texte);	
				$$("#service_doc").on("click", function(){
					
					$$("#pdf_iframe").attr("src", "pdf/web/viewer.html?file=../"+sva.doc)
					
					mainView.router.load({pageName: 'pdf'});
					
				});
				return true;
			}
		});
		
		mainView.router.load({pageName: 'service'});	
	} 

// section service <<<

} // fin de crm_init <<<

function number_format(number, decimals, dec_point, thousands_sep, dollar) {
  number = (number + '')
    .replace(/[^0-9\-.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return (dollar ? '$' : '') + s.join(dec);
}

function str_pad(input, pad_length, pad_string, pad_type) {

  var half = '',
    pad_to_go

  var str_pad_repeater = function (s, len) {
    var collect = '',
      i

    while (collect.length < len) {
      collect += s
    }
    collect = collect.substr(0, len)

    return collect
  }

  input += ''
  pad_string = pad_string !== undefined ? pad_string : ' '

  if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') {
    pad_type = 'STR_PAD_LEFT'
  }
  if ((pad_to_go = pad_length - input.length) > 0) {
    if (pad_type === 'STR_PAD_LEFT') {
      input = str_pad_repeater(pad_string, pad_to_go) + input
    } else if (pad_type === 'STR_PAD_RIGHT') {
      input = input + str_pad_repeater(pad_string, pad_to_go)
    } else if (pad_type === 'STR_PAD_BOTH') {
      half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2))
      input = half + input + half
      input = input.substr(0, pad_length)
    }
  }

  return input
}

function phone_format(str) {
	reg = "";
	str.replace('/[^0-9]/','');
	if (str.substr(0,1)=='1') {
		reg = "1-"; 
		str = str.substr(1);
	}
	return reg+str.substr(0,3)+'-'+str.substr(3,3)+'-'+str.substr(6);
}
// ==UserScript==
// @name           Travian wave builder
// @namespace      https://github.com/adipiciu/Travian-scripts
// @description    Wave builder for Travian Legends and Travian Shores of War
// @author         adipiciu (based on Travian wave builder 0.5 by Serj_LV)
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=56E2JM7DNDHGQ&item_name=Travian+wave+builder+script&currency_code=EUR
// @match          https://*.travian.com/build.php*
// @match          https://*.travian.com/profile*

// @version        2.11
// ==/UserScript==

function allInOneOpera () {

var version = '2.11';
var scriptURL = 'https://github.com/adipiciu/Travian-scripts';
var defInterval = 200;
var sLang = detectLanguage();
var langStrings = ["Add attack", "Remove attack", "Move attack up", "Move attack down", "Add multiple attacks (1-12 attacks)", "Interval between attacks, in milliseconds. Minimum interval is 100 ms.", "Attack type", "Interval", "ms"];
var profileStrings = ["Attack profile", "Select", "Village", "Attack type", "Reinforcement", "Normal attack", "Raid", "Apply first row to selected villages", "Scout mode", "Resources and troops", "Defenses and troops", "Send selected attacks", "No village selected.", "No troops selected for", "Preparing", "Sent", "Failed", "Interval", "ms", "Close", "Hero", "Result", "No villages found on this profile."];
var fullName = window.location.origin + "/";
var a2bURL = "build.php?gid=16&tt=2";
var profileTroopInfo = null;

/*********************** localization ****************************/

switch(sLang) {
	case "ar-ae": //Arabic (U.A.E)
	case "ar-eg": //Arabic (Egypt)
	case "ar-sa": //Arabic (Saudi Arabia)
	case "ar-sy": //Arabic (Syria)
		langStrings = ["إضافة هجوم","إزالة الهجوم","تحريك الهجوم لأعلى","تحريك الهجوم لأسفل","إضافة هجمات متعددة (الهجمات من 1 إلى 12)","الفاصل الزمني بين الهجمات بالمللي ثانية. الحد الأدنى للفاصل الزمني هو 100 مللي ثانية.","نوع الهجوم","الفاصل الزمني","ملي ثانية"];
		break;
	case "fr-fr": //French
		langStrings = ["Ajouter une attaque", "Supprimer l'attaque", "Déplacer l'attaque vers le haut", "Déplacer l'attaque vers le bas", "Ajoutez plusieurs attaques (1-12 attaques).", "Intervalle entre les attaques, en millisecondes. L'intervalle minimum est de 100 ms.", "Type d'attaque", "Intervalle", "ms"];
		profileStrings = ["Attack profile", "Selection", "Village", "Type d'envoi", "Assistance", "Attaque normale", "Pillage", "Appliquer la premiere ligne aux villages selectionnes", "Mode espion", "Ressources et troupes", "Defenses/infrastructure et troupes", "Envoyer les attaques selectionnees", "Aucun village selectionne.", "Aucune troupe selectionnee pour", "Preparation", "Envoye", "Echec", "Intervalle", "ms", "Fermer", "Heros", "Resultat", "Aucun village trouve sur ce profil."];
		break;
	case "hu-hu": //Hungarian
		langStrings = ["Támadás hozzáadása", "Támadás törlése", "Támadás mozgatása fel", "Támadás mozgatása le", "Támadások hozzáadása (1-12 támadások)", "Támadások közötti intervallum (ms). Minimum intervallum 100 ms.", "Támadás típusa", "Intervallum", "ms"];
		break;
	case "it-it": //Italian
		langStrings = ["Aggiungi attacco", "Rimuovi l'attacco", "Sposta l'attacco in alto", "Sposta l'attacco in basso", "Aggiungi più attacchi (1-12 attacchi).", "Intervallo tra attacchi, in millisecondi. L'intervallo minimo è 100 ms.", "Tipo di attacco", "Intervallo", "ms"];
		break;
	case "pt-pt": //Portuguese
	case "pt-br": //Brazilian Portuguese
		langStrings = ["Adicionar ataque", "Remover ataque", "Mover ataque para cima", "Mover ataque para baixo", "Adicionar multiplos ataques (1-12 ataques)", "Intervalo entre ataques, em milisegundos. Intervalo mínimo de 100 ms.", "Tipo de ataque", "Intervalo", "ms"];
		break;
	case "ro-ro": //Romanian
		langStrings = ["Adaugă atac", "Șterge atacul", "Mută atacul în sus", "Mută atacul în jos", "Adaugă mai multe atacuri (1-12 atacuri)", "Intervalul dintre atacuri în milisecunde. Intervalul minim este de 100 ms.", "Tipul atacului", "Interval", "ms"];
		break;
	case "ru-ru": //Russian
		langStrings = ["Добавить атаку", "Удалите атаку", "Переместить атаки вверх", "Переместить атаку вниз", "Добавьте несколько атак (1-12 атаки)", "Интервал между атаками, в миллисекундах. Минимальный интервал составляет 100 мс.", "Тип атаки", "Интервал", "мс"];
		break;
	case "tr-tr": //Turkish
		langStrings = ["Saldırı ekle", "Saldırı çıkar", "saldırıyı yukarı kaydır", "saldırıyı asagı kaydır", "Çoklu saldırı ekle (1-12x saldırı)", "Saldırılar arasındaki aralık, milisaniye. en az aralık 100 ms'dir.", "Saldırı tipi", "aralık", "ms"];
		break;
	case "zh-cn": //Chinese
		langStrings = ["添加攻击","移除攻击","上移攻击","下移攻击","添加多个攻击 (1-12 次攻击)","攻击间隔 以毫秒为单位。最小间隔为 100 毫秒。","攻击类型","间隔","毫秒"];
		break;
	default: //English
}

/*********************** common library ****************************/

function RB_addStyle(css) {
	var head = document.getElementsByTagName('head')[0];
	if (head) {
	  var style = document.createElement("style");
	  style.appendChild($t(css));
	  head.appendChild(style);
	}
}

function ajaxRequest(url, aMethod, param, onSuccess, onFailure) {
	var aR = new XMLHttpRequest();
	param = encodeURI(param);
	aR.onreadystatechange = function() {
		if( aR.readyState == 4 && (aR.status == 200 || aR.status == 304)) { onSuccess(aR); }
		else if (aR.readyState == 4 && aR.status != 200) { onFailure(aR); }
	};
	aR.open(aMethod, url, true);
	if (aMethod == 'POST') aR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	aR.send(param);
}

Number.prototype.NaN0 = function(){return isNaN(this)?0:this;};
function $g(aID,m) {return (typeof m == 'undefined' ? document:m).getElementById(aID);}
function $gn(aID) {return (aID != '' ? document.getElementsByName(aID) : null);}
function $gt(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByTagName(str); }
function $gc(str,m) { return (typeof m == 'undefined' ? document:m).getElementsByClassName(str); }
function $at(aElem, att) {if (att !== undefined) {for (var xi = 0; xi < att.length; xi++) {aElem.setAttribute(att[xi][0], att[xi][1]); if (att[xi][0].toUpperCase() == 'TITLE') aElem.setAttribute('alt', att[xi][1]);}}}
function $t(iHTML) {return document.createTextNode(iHTML);}
function $e(nElem, att) {var Elem = document.createElement(nElem); $at(Elem, att); return Elem;}
function $ee(nElem, oElem, att) {var Elem = $e(nElem, att); if (oElem !== undefined) if( typeof(oElem) == 'object' ) Elem.appendChild(oElem); else Elem.innerHTML = oElem; return Elem;}
function $c(iHTML, att) { return $ee('TD',iHTML,att); }
function $a(iHTML, att) { return $ee('A',iHTML,att); }
function $am(Elem, mElem) { if (mElem !== undefined) for(var i = 0; i < mElem.length; i++) { if( typeof(mElem[i]) == 'object' ) Elem.appendChild(mElem[i]); else Elem.appendChild($t(mElem[i])); } return Elem;}
function $em(nElem, mElem, att) {var Elem = $e(nElem, att); return $am(Elem, mElem);}
function dummy() {return;}
var jsNone = 'return false;';

function trImg ( cl, et ) {
	var ecl = [['class', cl],['src', 'img/x.gif']];
	if( typeof et != 'undefined' ) ecl.push(['title',et]);
	return $e('IMG',ecl);
}

function getRandom ( x ) {
	x = Math.round(x*0.8);
	return x+Math.round(Math.random()*x*0.5);
}

function detectLanguage() {
	var lang = "en-us";
	try { 
		lang = $gn("content-language")[0].getAttribute("content").toLowerCase(); 
	} catch(e) { }
	try {
		lang = $g("mainLayout").getAttribute("lang").toLowerCase();
	} catch(e) { }
	return lang;
}

/********** begin of main code block ************/

function ok () {
	tFormFL = true;
	plus.textContent = '+';
	$g('twb_multi').disabled = false;
	wNr += 1;
	( wNr < $g('twb_multi').value && wNr < 12 ) ? addWave() : wNr = 0;
}

function addWave () {
	if( tFormFL ) {
		tFormFL = false;
		plus.textContent = 'x';
		$g('twb_multi').disabled = true;
	} else return;

	var tInputs = $gt('INPUT',tForm);
	var sParams = '';
	var cDescr = '';

	for( var i=0; i<tInputs.length; i++ ) {
		var t = tInputs[i].name;
		if( /redeployHero/.test(t) ) {
			if( tInputs[i].checked ) {
				sParams += "redeployHero=1&";
			}
		} else if ( t == "eventType" ) {
			if( tInputs[i].checked ) {
				sParams += "eventType=" + tInputs[i].value + "&";
				cDescr = tInputs[i].parentNode.textContent.trim();
			}
		} else if ( /^t\d/.test(t) || /x|y/.test(t) ) {
			sParams += t + "=" + $gn(t)[0].value + "&";
		} else {
			sParams += t + "=" + tInputs[i].value + "&";
		}
	}
	var okBtn = $g('ok');
	sParams += okBtn.name + "=" + okBtn.value;

	ajaxRequest(fullName + a2bURL, "POST", sParams, function(ajaxResp) {
		var parser = new DOMParser();
		var rpPage = parser.parseFromString(ajaxResp.responseText, "text/html");
		var bld = $g('build',rpPage);
		var err = $gc('error',bld);
		if( err.length > 0 && err[0].textContent.length > 1 ) {
			ok();
			alert( err[0].textContent );
			return;
		}
		err = $gc('alert',bld);
		if( err.length > 0 ) {
			for( i=0; i<err.length; i++ ) {
				if (err[i].hasAttribute("id") && err[i].getAttribute("id")=="l4") {
				} else {
					if( ! confirm(err[i].textContent) ) {
						ok();
						return;
					}
				}
			}
		}
		tInputs = $gt('INPUT',bld);
		var sParams = '';
		var tc = new Array(12);
		for( i=0; i<tInputs.length; i++ ) {
			var t = tInputs[i].name;
			if( /\[t\d/.test(t) ) {
				tc[t.match(/\[t(\d+)/)[1]] = tInputs[i].value;
			} if (tInputs[i].className == "radio") continue;
			if ( /useShip/.test(t) ) continue;
			sParams += t + "=" + tInputs[i].value + "&";
		}

		var okBtn = $gc('rallyPointConfirm',rpPage);
		var sOnclick = okBtn[0].getAttribute('onclick');
		var checkSum = sOnclick.split(';')[1].split('value = \'')[1].split('\'')[0];
		sParams += "checksum=" + checkSum;

		var remBtn = $a('-',[['href','#'],['title',langStrings[1]],['onclick',jsNone]]);
		remBtn.addEventListener('click',remWave,false);

		var moveUpBtn = $a('&uarr;',[['href','#'],['title',langStrings[2]],['onclick',jsNone],['style','margin:0 15px;']]);
		moveUpBtn.addEventListener('click',moveWaveUp,false);

		var moveDownBtn = $a('&darr;',[['href','#'],['title',langStrings[3]],['onclick',jsNone]]);
		moveDownBtn.addEventListener('click',moveWaveDown,false);

		var firstCol = $c(remBtn,[['rowspan',2],['style','text-align:center;user-select:none;']]);
		firstCol.appendChild(moveUpBtn);
		firstCol.appendChild(moveDownBtn);
		firstCol.appendChild($e('INPUT',[['type','hidden'],['value',sParams]]));

		var nrow = $ee('TR',firstCol);
		for( i=1; i<12; i++ ) {
			nrow.appendChild($c(tc[i]));
		}
		nrow.appendChild($c(cDescr,[['title',cDescr]]));
		var nbody = $ee('TBODY',nrow);
		tInputs = $gt('SELECT',bld);
		var tSpy = $gc('radio',bld);
		var ships = $gc('useShip',bld);
		nrow = $e('TR');
		if (tInputs.length>0) {
			nrow.appendChild($c(tInputs[0],[['colspan',6]]));
		} else if (tSpy.length>0) {
			tSpy[0].name = tSpy[0].name+"twb"+tbl.tBodies.length;
			if (tSpy.length>1) tSpy[1].name = tSpy[1].name+"twb"+tbl.tBodies.length;
			tSpy[0].parentNode.parentNode.colSpan = 6;
			nrow.appendChild(tSpy[0].parentNode.parentNode);
		} else {
			nrow.appendChild($c('-',[['colspan',6]]));
		}
		nrow.appendChild($c(tInputs.length>0 ? tInputs[0]: '-',[['colspan',5]]));
		if (ships.length>0) {
			var shipsRow = $gc('shipAvailability',bld)[0].cloneNode(true);
			var shipsDiv = ships[0].cloneNode(true);
			shipsDiv.style.margin = "0px";
			var shipsInp = $gt('input',shipsDiv);
			shipsInp[0].name = shipsInp[0].name+"twb"+tbl.tBodies.length;
			shipsInp[0].removeAttribute("onchange");
			shipsRow.appendChild(shipsDiv.cloneNode(true));
			nrow.appendChild($c(shipsRow,[['style','text-align:right;']]));
		} else {
			nrow.appendChild($e('TD'));
		}
		nbody.appendChild(nrow);
		tbl.appendChild(nbody);
		setTimeout(ok, getRandom(1200));
		}, function() {setTimeout(ok, getRandom(1200));} 
	);
}

function remWave () {
	var tb = this.parentNode.parentNode.parentNode;
	tb.parentNode.removeChild(tb);
}

function moveWaveUp () {
	var wave = this.parentNode.parentNode.parentNode;
    var previousElem = wave.previousElementSibling;
    if (previousElem && previousElem.tagName!='TFOOT') {
        wave.parentNode.insertBefore(wave, previousElem);
    }
}

function moveWaveDown () {
	var wave = this.parentNode.parentNode.parentNode;
    var nextElem = wave.nextElementSibling;
    if (nextElem && nextElem.tagName!='TFOOT') {
        wave.parentNode.insertBefore(wave, nextElem.nextElementSibling);
    }
}

function sendTroops (x) {
	var wBody = tbl.tBodies[x];
	var sParams = $gt('INPUT',wBody)[0].value;
	var	tInputs = $gt('SELECT',wBody);
	sParams += tInputs.length>0 ? "&" + tInputs[0].name + "=" + tInputs[0].value : '';
	sParams += tInputs.length>1 ? "&" + tInputs[1].name + "=" + tInputs[1].value : '';
	var tSpy = $gc('radio',wBody);
	sParams += tSpy.length>0 ? "&" + tSpy[0].name.substring(0, tSpy[0].name.indexOf('twb')) + "=" + (tSpy[0].checked ? '1' : '2') : '';
	var ShipsInp = $gc('useShips',wBody);
	sParams += (ShipsInp.length>0 && ShipsInp[0].checked) ? "&" + ShipsInp[0].name.substring(0, ShipsInp[0].name.indexOf('twb')) + "=1" : '';

	function logWaves (a,b) {
		wlog += "<span style='color:"+(b?'green':'red')+"'> "+a+" </span>";
		cLog.innerHTML = wlog;
	}

	if( x == wCount-1 ) {
		setTimeout(function(){ document.location.href = fullName +'build.php?gid=16&tt=1'; }, getRandom(2000));
	}
	ajaxRequest(fullName + a2bURL, "POST", sParams, function() { return function(x) { return logWaves(x,1); }(x+1); }, 
		function() { return function(x) { return logWaves(x,0); }(x+1); } );
}

function sendWaves () {
	cLog = $c(wlog,[['colspan',13],['style','background-color: transparent;']]);
	tbl.tFoot.appendChild($ee('TR',cLog));
	wCount = tbl.tBodies.length;
	var nextWave = 10;
	var intWave = parseInt(interval.value).NaN0();
	if( intWave < 100 ) intWave = defInterval;
	for( var i=0; i<wCount; i++ ) {
		setTimeout(function(x){return function(){ sendTroops(x); };}(i), nextWave);
		nextWave += getRandom(intWave);
	}
}

function getTargetMapIdFromHref(href) {
	if( ! href ) return 0;
	var match = href.match(/[?&](?:targetMapId|[zd])=(\d+)/i);
	if( match ) return parseInt(match[1]);
	try {
		var url = new URL(href, fullName);
		var targetId = url.searchParams.get('targetMapId') || url.searchParams.get('d') || url.searchParams.get('z');
		if( targetId ) return parseInt(targetId);
	} catch(e) { }
	return 0;
}

function getProfileVillageTable() {
	var content = $g('playerProfile') || $g('content') || document;
	var table = $g('villages');
	if( table && table.tagName && table.tagName.toUpperCase() == 'TABLE' ) return table;
	var tables = $gc('villages',content);
	for( var i=0; i<tables.length; i++ ) {
		if( tables[i].tagName && tables[i].tagName.toUpperCase() == 'TABLE' ) return tables[i];
	}
	return null;
}

function getProfileVillageCoords(row) {
	var text = row.textContent.replace(/[\u2000-\u20ff]/g,'');
	var match = text.match(/\((-?\d+)\s*\|\s*(-?\d+)\)/);
	if( ! match ) match = text.match(/(-?\d+)\s*\|\s*(-?\d+)/);
	if( ! match ) return null;
	return {x: parseInt(match[1]), y: parseInt(match[2])};
}

function parseProfileVillages() {
	var table = getProfileVillageTable();
	var villages = [];
	var known = {};
	if( ! table || ! table.tBodies || table.tBodies.length < 1 ) return villages;
	var rows = table.tBodies[0].rows;
	for( var i=0; i<rows.length; i++ ) {
		var links = $gt('A',rows[i]);
		var villageLink = null;
		var targetId = 0;
		for( var j=0; j<links.length; j++ ) {
			targetId = getTargetMapIdFromHref(links[j].getAttribute('href'));
			if( targetId > 0 ) {
				villageLink = links[j];
				break;
			}
		}
		if( targetId < 1 || known[targetId] ) continue;
		known[targetId] = true;
		var nameNode = $gc('name',rows[i]);
		var name = '';
		if( nameNode.length > 0 ) name = nameNode[0].textContent.onlyText ? nameNode[0].textContent.onlyText().trim() : nameNode[0].textContent.trim();
		if( name == '' && villageLink ) name = villageLink.textContent.trim();
		if( name == '' ) name = '#' + targetId;
		villages.push({id: targetId, name: name, coords: getProfileVillageCoords(rows[i])});
	}
	return villages;
}

function appendProfileAttackButton(villages) {
	if( $g('twb_profile_attack_btn') ) return;
	var content = $g('content') || $g('playerProfile') || document.body;
	var target = $g('playerProfile') || content;
	var btn = $e('INPUT',[['id','twb_profile_attack_btn'],['type','button'],['value',profileStrings[0]],['style','margin:6px 0;']]);
	btn.addEventListener('click', function(){ showProfileAttackPanel(parseProfileVillages()); }, false);
	if( target.firstChild ) target.insertBefore(btn,target.firstChild);
	else content.appendChild(btn);
}

function initProfileAttack() {
	RB_addStyle(profile_css);
	loadProfileTroopInfo();
	function tryInit() {
		var villages = parseProfileVillages();
		if( villages.length > 0 ) {
			appendProfileAttackButton(villages);
			return true;
		}
		return false;
	}
	if( tryInit() ) return;
	var target = $g('playerProfile') || $g('content') || document.body;
	if( ! target || ! window.MutationObserver ) return;
	var observer = new MutationObserver(function() {
		if( tryInit() ) observer.disconnect();
	});
	observer.observe(target,{childList:true,subtree:true});
}

function getDefaultProfileTroopInfo() {
	var troops = [];
	for( var i=1; i<11; i++ ) troops[i] = {label:'t' + i, className:'', title:'t' + i};
	troops[11] = {label:profileStrings[20], className:'unit uhero', title:profileStrings[20]};
	return troops;
}

function getTroopIdFromUnitClass(className) {
	if( ! className ) return 0;
	if( className.indexOf('uhero') > -1 ) return 11;
	var match = className.match(/(?:^|\s)u(\d+)(?:\s|$)/);
	if( ! match ) return 0;
	var troopId = parseInt(match[1]) % 10;
	return troopId == 0 ? 10 : troopId;
}

function getTroopIdFromInputName(name) {
	if( ! name ) return 0;
	var match = name.match(/(?:^|\[)t(\d+)(?:\]|$)/);
	if( ! match ) return 0;
	var troopId = parseInt(match[1]);
	return troopId >= 1 && troopId <= 11 ? troopId : 0;
}

function readProfileTroopInfo(doc) {
	var troops = getDefaultProfileTroopInfo();
	var troopBox = $g('troops',doc) || doc;
	var imgs = $gt('IMG',troopBox);
	for( var i=0; i<imgs.length; i++ ) {
		var className = imgs[i].getAttribute('class') || '';
		if( className.indexOf('unit') == -1 ) continue;
		var troopId = getTroopIdFromUnitClass(className);
		if( troopId < 1 || troopId > 11 ) continue;
		var title = imgs[i].getAttribute('title') || imgs[i].getAttribute('alt') || troops[troopId].label;
		troops[troopId] = {
			label: title || troops[troopId].label,
			className: className,
			title: title || troops[troopId].title
		};
	}
	return troops;
}

function loadProfileTroopInfo(callback) {
	if( profileTroopInfo ) {
		if( callback ) callback(profileTroopInfo);
		return;
	}
	ajaxRequest(fullName + a2bURL, "GET", "", function(ajaxResp) {
		var parser = new DOMParser();
		var rpPage = parser.parseFromString(ajaxResp.responseText, "text/html");
		profileTroopInfo = readProfileTroopInfo(rpPage);
		if( callback ) callback(profileTroopInfo);
	}, function() {
		profileTroopInfo = getDefaultProfileTroopInfo();
		if( callback ) callback(profileTroopInfo);
	});
}

function buildProfileTroopHeader(troopId) {
	var troops = profileTroopInfo || getDefaultProfileTroopInfo();
	var info = troops[troopId] || {label:'t' + troopId, className:'', title:'t' + troopId};
	var holder = $e('SPAN',[['class','twb_profile_unit_header'],['title',info.title || info.label]]);
	if( info.className ) holder.appendChild(trImg(info.className,info.title || info.label));
	else holder.appendChild($t(info.label));
	var label = $ee('SPAN',info.label,[['class','twb_profile_unit_label']]);
	holder.appendChild(label);
	return holder;
}

function showProfileAttackPanel(villages) {
	var old = $g('twb_profile_panel');
	if( old ) old.parentNode.removeChild(old);
	if( ! villages || villages.length < 1 ) {
		alert(profileStrings[22]);
		return;
	}
	if( ! profileTroopInfo ) {
		loadProfileTroopInfo(function(){ showProfileAttackPanel(villages); });
		profileTroopInfo = getDefaultProfileTroopInfo();
	}
	var wrapper = $e('DIV',[['id','twb_profile_panel']]);
	var title = $e('DIV',[['class','twb_profile_title']]);
	title.appendChild($t(profileStrings[0]));
	var close = $a('x',[['href','#'],['onclick',jsNone],['title',profileStrings[19]],['class','twb_profile_close']]);
	close.addEventListener('click', function(){ wrapper.parentNode.removeChild(wrapper); }, false);
	title.appendChild(close);
	wrapper.appendChild(title);

	var controls = $e('DIV',[['class','twb_profile_controls']]);
	var copyBtn = $e('INPUT',[['type','button'],['value',profileStrings[7]]]);
	copyBtn.addEventListener('click', copyFirstProfileAttackRow, false);
	var intLabel = $ee('SPAN',profileStrings[17] + ' ',[['style','margin-left:12px;']]);
	var profileInterval = $e('INPUT',[['id','twb_profile_interval'],['type','text'],['value',defInterval],['size',4],['maxlength',4],['style','text-align:right']]);
	controls.appendChild(copyBtn);
	controls.appendChild(intLabel);
	controls.appendChild(profileInterval);
	controls.appendChild($t(' ' + profileStrings[18]));
	wrapper.appendChild(controls);

	var table = $e('TABLE',[['id','twb_profile_table']]);
	var hrow = $e('TR');
	hrow.appendChild($c(profileStrings[1]));
	hrow.appendChild($c(profileStrings[2]));
	hrow.appendChild($c(profileStrings[3]));
	for( var i=1; i<12; i++ ) hrow.appendChild($c(buildProfileTroopHeader(i)));
	hrow.appendChild($c(profileStrings[8]));
	hrow.appendChild($c(profileStrings[21]));
	table.appendChild($ee('THEAD',hrow));
	var tbody = $e('TBODY');
	for( i=0; i<villages.length; i++ ) tbody.appendChild(buildProfileAttackRow(villages[i],i));
	table.appendChild(tbody);
	table.appendChild(buildProfileTotalsFooter());
	wrapper.appendChild(table);

	var send = $e('INPUT',[['type','button'],['value',profileStrings[11]],['style','margin-top:8px;']]);
	send.addEventListener('click', function(){ sendProfileAttacks(send); }, false);
	wrapper.appendChild(send);
	document.body.appendChild(wrapper);
	updateProfileTroopTotals();
}

function buildProfileAttackRow(village,index) {
	var row = $e('TR',[['data-target-id',village.id],['data-target-name',village.name]]);
	if( village.coords ) {
		row.setAttribute('data-target-x',village.coords.x);
		row.setAttribute('data-target-y',village.coords.y);
	}
	var checkbox = $e('INPUT',[['type','checkbox'],['checked','checked']]);
	checkbox.addEventListener('change', updateProfileTroopTotals, false);
	row.appendChild($c(checkbox));
	row.appendChild($c(village.name));
	var typeSelect = $e('SELECT',[['class','twb_profile_type']]);
	typeSelect.appendChild($ee('OPTION',profileStrings[5],[['value','3']]));
	typeSelect.appendChild($ee('OPTION',profileStrings[6],[['value','4']]));
	typeSelect.appendChild($ee('OPTION',profileStrings[4],[['value','5']]));
	row.appendChild($c(typeSelect));
	for( var i=1; i<12; i++ ) {
		var troopInput = $e('INPUT',[['type','number'],['min','0'],['class','twb_profile_troop'],['data-troop',i],['style','width:78px;']]);
		troopInput.addEventListener('input', updateProfileTroopTotals, false);
		troopInput.addEventListener('change', updateProfileTroopTotals, false);
		row.appendChild($c(troopInput)); 
	}
	var spyBox = $e('DIV');
	var spyName = 'twb_profile_spy_' + index;
	spyBox.appendChild($e('INPUT',[['type','radio'],['name',spyName],['value','1'],['checked','checked']]));
	spyBox.appendChild($t(' ' + profileStrings[9]));
	spyBox.appendChild($e('BR'));
	spyBox.appendChild($e('INPUT',[['type','radio'],['name',spyName],['value','2']]));
	spyBox.appendChild($t(' ' + profileStrings[10]));
	row.appendChild($c(spyBox));
	row.appendChild($c('',[['class','twb_profile_result']]));
	return row;
}

function buildProfileTotalsFooter() {
	var foot = $e('TFOOT');
	var row = $e('TR',[['class','twb_profile_totals_row']]);
	row.appendChild($c('Total',[['colspan','3'],['style','font-weight:bold;text-align:right;']]));
	for( var i=1; i<12; i++ ) row.appendChild($c('0',[['class','twb_profile_total'],['data-troop',i]]));
	row.appendChild($c(''));
	row.appendChild($c(''));
	foot.appendChild(row);
	return foot;
}

function updateProfileTroopTotals() {
	var table = $g('twb_profile_table');
	if( ! table || table.tBodies.length < 1 || table.tFoot == null ) return;
	var totals = [];
	for( var i=1; i<12; i++ ) totals[i] = 0;
	var rows = table.tBodies[0].rows;
	for( i=0; i<rows.length; i++ ) {
		var inputs = $gt('INPUT',rows[i]);
		if( inputs.length < 1 || ! inputs[0].checked ) continue;
		var troopInputs = $gc('twb_profile_troop',rows[i]);
		for( var j=0; j<troopInputs.length; j++ ) {
			var troopId = parseInt(troopInputs[j].getAttribute('data-troop'));
			var troopValue = parseInt(troopInputs[j].value);
			if( ! isNaN(troopValue) && troopValue > 0 ) totals[troopId] += troopValue;
		}
	}
	var totalCells = $gc('twb_profile_total',table.tFoot);
	for( i=0; i<totalCells.length; i++ ) {
		var id = parseInt(totalCells[i].getAttribute('data-troop'));
		totalCells[i].textContent = totals[id] > 0 ? totals[id] : '0';
	}
}

function copyFirstProfileAttackRow() {
	var table = $g('twb_profile_table');
	if( ! table || table.tBodies.length < 1 || table.tBodies[0].rows.length < 2 ) return;
	var rows = table.tBodies[0].rows;
	var first = rows[0];
	var firstTroops = $gc('twb_profile_troop',first);
	var firstType = $gc('twb_profile_type',first)[0].value;
	var firstSpy = getCheckedProfileSpy(first);
	for( var i=1; i<rows.length; i++ ) {
		var rowChecks = $gt('INPUT',rows[i]);
		if( rowChecks.length > 0 && ! rowChecks[0].checked ) continue;
		var rowInputs = $gc('twb_profile_troop',rows[i]);
		$gc('twb_profile_type',rows[i])[0].value = firstType;
		for( var j=0; j<firstTroops.length; j++ ) rowInputs[j].value = firstTroops[j].value;
		setCheckedProfileSpy(rows[i],firstSpy);
	}
	updateProfileTroopTotals();
}

function getCheckedProfileSpy(row) {
	var inputs = $gt('INPUT',row);
	for( var i=0; i<inputs.length; i++ ) {
		if( inputs[i].type == 'radio' && inputs[i].name.indexOf('twb_profile_spy_') == 0 && inputs[i].checked ) return inputs[i].value;
	}
	return '1';
}

function setCheckedProfileSpy(row,value) {
	var inputs = $gt('INPUT',row);
	for( var i=0; i<inputs.length; i++ ) {
		if( inputs[i].type == 'radio' && inputs[i].name.indexOf('twb_profile_spy_') == 0 ) inputs[i].checked = inputs[i].value == value;
	}
}

function collectProfileAttackTasks() {
	var table = $g('twb_profile_table');
	var tasks = [];
	if( ! table || table.tBodies.length < 1 ) return tasks;
	var rows = table.tBodies[0].rows;
	for( var i=0; i<rows.length; i++ ) {
		var inputs = $gt('INPUT',rows[i]);
		if( inputs.length < 1 || ! inputs[0].checked ) continue;
		var troops = new Array(12);
		var hasTroops = false;
		for( var t=1; t<12; t++ ) troops[t] = 0;
		var troopInputs = $gc('twb_profile_troop',rows[i]);
		for( var j=0; j<troopInputs.length; j++ ) {
			var troopId = parseInt(troopInputs[j].getAttribute('data-troop'));
			var troopValue = parseInt(troopInputs[j].value);
			if( isNaN(troopValue) || troopValue < 1 ) troopValue = 0;
			troops[troopId] = troopValue;
			if( troopValue > 0 ) hasTroops = true;
		}
		var result = $gc('twb_profile_result',rows[i])[0];
		if( ! hasTroops ) {
			result.innerHTML = '<span style="color:red;">' + profileStrings[13] + '</span>';
			continue;
		}
		tasks.push({
			row: rows[i],
			targetId: parseInt(rows[i].getAttribute('data-target-id')),
			targetName: rows[i].getAttribute('data-target-name'),
			targetX: parseInt(rows[i].getAttribute('data-target-x')),
			targetY: parseInt(rows[i].getAttribute('data-target-y')),
			eventType: $gc('twb_profile_type',rows[i])[0].value,
			troops: troops,
			spyMode: getCheckedProfileSpy(rows[i])
		});
	}
	return tasks;
}

function sendProfileAttacks(button) {
	var tasks = collectProfileAttackTasks();
	if( tasks.length < 1 ) {
		alert(profileStrings[12]);
		return;
	}
	button.disabled = true;
	var intWave = parseInt($g('twb_profile_interval').value).NaN0();
	if( intWave < 100 ) intWave = defInterval;
	var nextWave = 10;
	for( var i=0; i<tasks.length; i++ ) {
		setTimeout(function(task){return function(){ sendProfileAttackTask(task,button); };}(tasks[i]),nextWave);
		nextWave += getRandom(intWave);
	}
	setTimeout(function(){ button.disabled = false; },nextWave + 1000);
}

function setProfileAttackResult(task,text,success) {
	var result = $gc('twb_profile_result',task.row)[0];
	result.innerHTML = '<span style="color:' + (success ? 'green' : 'red') + ';">' + text + '</span>';
}

function getBuildMessage(bld,className) {
	if( ! bld ) return '';
	var nodes = $gc(className,bld);
	var message = '';
	for( var i=0; i<nodes.length; i++ ) {
		if( nodes[i].hasAttribute('id') && nodes[i].getAttribute('id') == 'l4' ) continue;
		if( nodes[i].textContent.trim().length > 0 ) message += nodes[i].textContent.trim() + "\n";
	}
	return message.trim();
}

function confirmProfileAlerts(task,bld) {
	var message = getBuildMessage(bld,'alert');
	if( message == '' ) return true;
	return confirm(task.targetName + "\n" + message);
}

function sendProfileAttackTask(task,button) {
	setProfileAttackResult(task,profileStrings[14],true);
	ajaxRequest(fullName + a2bURL + "&targetMapId=" + task.targetId, "GET", "", function(ajaxResp) {
		profileAttackPrepare(ajaxResp,task,button);
	}, function() {
		setProfileAttackResult(task,profileStrings[16],false);
	});
}

function profileAttackPrepare(ajaxResp,task,button) {
	var parser = new DOMParser();
	var rpPage = parser.parseFromString(ajaxResp.responseText, "text/html");
	var bld = $g('build',rpPage);
	var err = getBuildMessage(bld,'error');
	if( ! bld ) {
		setProfileAttackResult(task,profileStrings[16],false);
		return;
	}
	if( err != '' ) {
		setProfileAttackResult(task,err,false);
		return;
	}
	if( ! confirmProfileAlerts(task,bld) ) {
		setProfileAttackResult(task,profileStrings[16],false);
		return;
	}
	var inputs = $gt('INPUT',bld);
	var sParams = 'action=troopsSend&';
	var needEventType = true;
	for( var i=0; i<inputs.length; i++ ) {
		var name = inputs[i].name;
		if( ! name ) continue;
		var troopId = getTroopIdFromInputName(name);
		if( troopId > 0 ) {
			if( inputs[i].disabled == true ) continue;
		} else if( name == 'eventType' ) {
			if( needEventType ) {
				sParams += "eventType=" + task.eventType + "&";
				needEventType = false;
			}
		} else if( name == 'action' ) {
			continue;
		} else if( name == 'x' && ! isNaN(task.targetX) ) {
			sParams += name + "=" + task.targetX + "&";
		} else if( name == 'y' && ! isNaN(task.targetY) ) {
			sParams += name + "=" + task.targetY + "&";
		} else if( name == 'redeployHero' ) {
			if( inputs[i].checked ) sParams += name + "=" + inputs[i].value + "&";
		} else if( inputs[i].type == 'radio' || inputs[i].type == 'checkbox' ) {
			if( inputs[i].checked ) sParams += name + "=" + inputs[i].value + "&";
		} else {
			sParams += name + "=" + inputs[i].value + "&";
		}
	}
	for( var t=1; t<12; t++ ) if( task.troops[t] > 0 ) sParams += "troop[t" + t + "]=" + task.troops[t] + "&";
	sParams += "ok=ok";
	ajaxRequest(fullName + a2bURL, "POST", sParams, function(confirmResp) {
		profileAttackConfirm(confirmResp,task,button);
	}, function() {
		setProfileAttackResult(task,profileStrings[16],false);
	});
}

function getRallyPointChecksum(doc) {
	var okBtn = $gc('rallyPointConfirm',doc);
	if( okBtn.length > 0 ) {
		var sOnclick = okBtn[0].getAttribute('onclick');
		var match = sOnclick ? sOnclick.match(/value = '([^']+)'/) : null;
		if( match ) return match[1];
	}
	var checksum = doc.getElementsByName('checksum');
	if( checksum && checksum.length > 0 ) return checksum[0].value;
	return '';
}

function profileAttackConfirm(ajaxResp,task,button) {
	var parser = new DOMParser();
	var rpPage = parser.parseFromString(ajaxResp.responseText, "text/html");
	var bld = $g('build',rpPage);
	var err = getBuildMessage(bld,'error');
	if( ! bld ) {
		setProfileAttackResult(task,profileStrings[16],false);
		return;
	}
	if( err != '' ) {
		setProfileAttackResult(task,err,false);
		return;
	}
	if( ! confirmProfileAlerts(task,bld) ) {
		setProfileAttackResult(task,profileStrings[16],false);
		return;
	}
	var checkSum = getRallyPointChecksum(rpPage);
	if( checkSum == '' ) {
		setProfileAttackResult(task,profileStrings[16],false);
		return;
	}
	var sParams = '';
	var selects = $gt('SELECT',bld);
	for( var i=0; i<selects.length; i++ ) {
		if( selects[i].name ) sParams += selects[i].name + "=" + selects[i].value + "&";
	}
	var inputs = $gt('INPUT',bld);
	var spySent = false;
	for( i=0; i<inputs.length; i++ ) {
		var name = inputs[i].name;
		if( ! name ) continue;
		if( /spy/.test(name) ) {
			if( ! spySent ) {
				sParams += name + "=" + task.spyMode + "&";
				spySent = true;
			}
		} else if( name == 'checksum' ) {
			sParams += "checksum=" + checkSum + "&";
		} else if( inputs[i].type == 'radio' || inputs[i].type == 'checkbox' ) {
			if( inputs[i].checked ) sParams += name + "=" + inputs[i].value + "&";
		} else {
			sParams += name + "=" + inputs[i].value + "&";
		}
	}
	if( sParams.charAt(sParams.length - 1) == '&' ) sParams = sParams.slice(0,-1);
	ajaxRequest(fullName + a2bURL, "POST", sParams, function() {
		setProfileAttackResult(task,profileStrings[15],true);
	}, function() {
		setProfileAttackResult(task,profileStrings[16],false);
	});
}

twb_css = "table#twbtable { background-color: transparent; border-collapse: collapse; } " +
"table#twbtable thead td, table#twbtable tbody td, table#twbtable tfoot td { border: 1px solid silver; } "

var profile_css = "div#twb_profile_panel { position: fixed; z-index: 9999; top: 55px; left: 30px; right: 30px; max-height: 82vh; overflow: auto; background: #f4f1e8; border: 2px solid #8f6f3c; padding: 8px; box-shadow: 0 2px 12px #333; } " +
"div#twb_profile_panel table { border-collapse: collapse; width: 100%; } " +
"div#twb_profile_panel td { border: 1px solid silver; padding: 2px 4px; text-align: center; white-space: nowrap; } " +
"div#twb_profile_panel thead td { font-weight: bold; background: #ded7c6; } " +
"div#twb_profile_panel input[type=number] { width: 78px; } " +
"div#twb_profile_panel .twb_profile_title { font-weight: bold; margin-bottom: 6px; } " +
"div#twb_profile_panel .twb_profile_close { float: right; font-weight: bold; } " +
"div#twb_profile_panel .twb_profile_controls { margin-bottom: 6px; } " +
"div#twb_profile_panel .twb_profile_unit_header { display: inline-block; min-width: 54px; } " +
"div#twb_profile_panel .twb_profile_unit_header img { display: block; margin: 0 auto 2px auto; } " +
"div#twb_profile_panel .twb_profile_unit_label { display: block; max-width: 78px; overflow: hidden; text-overflow: ellipsis; font-size: 10px; } " +
"div#twb_profile_panel .twb_profile_totals_row td { font-weight: bold; background: #e9e0cc; } ";

if( window.location.pathname.indexOf('/profile') == 0 ) {
	initProfileAttack();
	return;
}

var build = $g('build');
if( ! build ) return;
if( build.getAttribute('class').indexOf('gid16') == -1 ) return;

var snd = $gc('a2b');
if( $gc('a2b').length != 1 ) return;

if( ! $g('troops') ) return;

var nation = Math.floor(parseInt($gc('unit')[0].getAttribute('class').match(/\d+/)[0])/10);
if( nation < 0 ) return;

RB_addStyle(twb_css);

var wCount = 0;
var wNr = 0;
var wlog = '';
var cLog;
var tForm = snd[0];
var tFormFL = true;

// build table header
var tbl = $e('TABLE',[['id','twbtable']]);
var plus = $a('+',[['href','#'],['onclick',jsNone],['title',langStrings[0]]]);
plus.addEventListener('click',addWave,false);
var multi = $e('INPUT',[['id','twb_multi'],['type','number'],['value',1],['title',langStrings[4]],['min',1],['max',12],['style','width:40px;margin:0 8px;']]);
var hrow = $ee('TR',$am($e('TD',[['style','white-space:nowrap;']]),[multi,plus]));
for( var i=1; i<11; i++ ) {
	hrow.appendChild($c(trImg('unit u'+(nation*10+i))));
}
$am(hrow,[$c(trImg('unit uhero')),$c(langStrings[6])]);
tbl.appendChild($ee('THEAD',hrow));

var sendBtn = $g('ok').cloneNode(true);
sendBtn.removeAttribute('name');
sendBtn.removeAttribute('id');
sendBtn.addEventListener('click',sendWaves,false);

var interval = $e('INPUT',[['type','text'],['value',defInterval],['title',langStrings[5]],['size',4],['maxlength',4],['style','text-align:right']]);
var intervaltxt = $ee('SPAN',langStrings[7],[['style','display:inline-block;padding:0 5px;']]);
var unitTimetxt = $ee('SPAN',langStrings[8],[['style','display:inline-block;padding:0 5px;']]);
tbl.appendChild($ee('TFOOT',$ee('TR',$em('TD',[intervaltxt,interval,unitTimetxt,sendBtn,
	$a(' (v'+version+') ',[['href',scriptURL],['target','_blank']])],
	[['colspan',13],['style','background-color: transparent;text-align:center !important;padding:3px;']]))));

build.appendChild(tbl);

/********** end of main code block ************/
}

allInOneOpera();

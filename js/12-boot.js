/* ---------- PIN lock ---------- */
function openOnb(){let st=0;const draw=()=>{const steps=[
  `<div class="onb-hero" aria-hidden="true"><i class="o1"></i><i class="o2"></i><i class="o3"></i><i class="o4"></i><i class="o5"></i><span class="onb-pn">${penny('plus',96)}</span></div><h2>Hallo, ich bin Penny. Willkommen bei CashFlow!</h2><p>Diese App hilft dir, dein Vier-Konten-Prinzip im Alltag zu steuern und Impulskäufe zu bremsen. Die Einrichtung dauert eine Minute.</p><div class="group"><div class="cell plain"><label for="onbName">Wie heißt du?</label><input id="onbName" autocomplete="given-name" placeholder="Vorname" value="${esc(uName())}"></div></div>`,
  `<h2>Deine Monatsbudgets</h2><div class="group">${S.accts.filter(a=>a.kind=='budget').map(a=>`<div class="cell plain"><label>${esc(a.n)}${isStock(a.n)?' · Zufluss pro Monat':''}</label><input class="onbB" data-b="${esc(a.n)}" inputmode="decimal" value="${S.budgets[a.n]||0}"></div>`).join('')}</div><p class="note" style="padding:0">Rest aus Flow und ${esc(GN())} wandert am Monatsende in ${esc(SN())}.</p>`,
  `<h2>Dein Eingangskonto</h2><div class="group">${S.accts.filter(a=>a.kind=='konto').map(a=>`<div class="cell plain"><label>${esc(a.n)} heute</label><input class="onbK" data-b="${esc(a.n)}" inputmode="decimal" value="${Math.round(calc(a.n).rest*100)/100}"></div>`).join('')||'<div class="empty">Kein Konto angelegt.</div>'}</div><p class="note" style="padding:0">Der Kontostand ist dein Puffer. Ziel bis 1.000 €, alles darüber gehört in den Vermögensaufbau.</p>`,
  `<h2>Deine Regeln</h2><div class="anchor">${I('lock',16)}<span>${ANCHOR}</span></div><ul class="steps"><li>Jeder Wunsch wartet 14 Tage auf der Wunschliste.</li><li>Konsum nur aus ${esc(GN())} oder angesparten ${esc(SN())}.</li><li>Ist ${esc(GN())} leer, gibt es keinen Nachschub.</li><li>Der Vermögensaufbau ist tabu.</li></ul><div class="group"><div class="cell plain"><label for="onbL">Netto pro Stunde</label><input id="onbL" inputmode="decimal" value="${String(S.lohn).replace('.',',')}"></div></div><p class="note" style="padding:0">Damit zeigt die Wunschliste Preise auch in Arbeitszeit.</p>`,
  `<h2>Deine Daten</h2><p>Die App zeigt gerade Beispieldaten. Wie möchtest du starten?</p><button class="btn" id="onbSync">Ich nutze CashFlow schon auf einem anderen Gerät</button><button class="btn soft" id="onbImp">Aus MoneyControl importieren</button><button class="btn soft" id="onbClean">Leer starten</button><button class="btn soft" id="onbKeep">Mit Beispieldaten weiter ausprobieren</button>`];
  $('sheetRoot').innerHTML=`<div class="scrim"></div><div class="sheet onb" role="dialog" aria-label="Einrichtung"><div class="sheet-h"><button id="onbBack" ${st?'':'style="visibility:hidden"'}>Zurück</button><span class="onb-dots">${steps.map((_,i)=>`<i class="${i==st?'on':''}"></i>`).join('')}</span><button id="onbSkip">${st==steps.length-1?'':'Überspringen'}</button></div>
   <div class="sheet-b">${steps[st]}${st<steps.length-1?'<button class="btn" id="onbNext">Weiter</button>':''}</div></div>`;
  const keep=()=>{if($('onbName'))S.uname=$('onbName').value.trim();if($('onbL'))S.lohn=pNum($('onbL').value)||S.lohn;document.querySelectorAll('.onbB').forEach(i=>S.budgets[i.dataset.b]=pNum(i.value)||0);if(sinkAcc()&&$('sheetRoot').querySelector('.onbB'))S.sinkExtra=Math.max(Math.round(((S.budgets[sinkAcc()]||0)-sinkSum())*100)/100,0);document.querySelectorAll('.onbK').forEach(i=>{const a=acc(i.dataset.b),v=pNum(i.value);if(!isNaN(v))a.start=(a.start||0)+v-calc(a.n).rest})};
  const fin=()=>{S.onb=true;save();$('sheetRoot').innerHTML='';render()};
  if($('onbNext'))$('onbNext').onclick=()=>{keep();st++;draw()};$('onbBack').onclick=()=>{keep();st--;draw()};$('onbSkip').onclick=()=>{keep();fin()};
  if($('onbSync'))$('onbSync').onclick=()=>{fin();tab='more';setView='sync';render()};
  if($('onbImp'))$('onbImp').onclick=()=>{S.exp=[];S.wish=[];S.goals=[];S.gespart=0;S.gespartAdj=0;S.ex=false;S.rec=[];fin();tab='more';setView='import';render()};
  if($('onbClean'))$('onbClean').onclick=()=>{S.exp=[];S.wish=[];S.goals=[];S.gespart=0;S.gespartAdj=0;S.ex=false;S.rec=[];S.accts.forEach(a=>{if(a.kind=='konto')a.start=a.start});fin();tell('Los geht’s. Tippe auf +, um zu buchen.')};
  if($('onbKeep'))$('onbKeep').onclick=fin};draw();renderAsst()}
const BIOK='cf_bio',bioName=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)?'Face ID':/Mac/.test(navigator.userAgent)?'Touch ID':'Fingerabdruck / Windows Hello';
const bioGet=()=>{try{return JSON.parse(localStorage.getItem(BIOK)||'null')}catch(e){return null}};
const waE=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),waD=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));
async function bioAvail(){try{return CANFILE&&window.PublicKeyCredential&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()}catch(e){return false}}
async function bioSetup(){const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
  const c=await navigator.credentials.create({publicKey:{challenge:rnd(32),rp:{name:'CashFlow'},user:{id:rnd(16),name:'CashFlow',displayName:'CashFlow'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'discouraged'},timeout:60000,attestation:'none'}});
  localStorage.setItem(BIOK,JSON.stringify({id:waE(c.rawId),t:Date.now()}))}
async function bioCheck(){const b=bioGet();if(!b)return false;const r=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:'public-key',id:waD(b.id),transports:['internal','hybrid']}],userVerification:'required',timeout:60000}});
  if(!r||!r.response||!r.response.authenticatorData)return false;const f=new Uint8Array(r.response.authenticatorData)[32];return !!(f&4)}
let hidAt=0;document.addEventListener('visibilitychange',()=>{const bioQuiet=window.__bioRun||Date.now()-(window.__bioOkAt||0)<5000;if(document.visibilityState==='hidden'){hidAt=bioQuiet?0:Date.now()}else if(hidAt&&!bioQuiet&&pinActive()&&!$('lockRoot').innerHTML){const m=S.lockAfter==null?5:S.lockAfter;if(m>=0&&Date.now()-hidAt>=m*6e4)lock()}});
const PINK='cf_pin';function pinGet(){try{return JSON.parse(localStorage.getItem(PINK)||'null')}catch(e){return null}}
async function pinHash(v,salt){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+'|'+v));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function pinSet(v){if(!v){try{localStorage.removeItem(PINK)}catch(e){}S.pin='';save();return}const salt=Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('');try{localStorage.setItem(PINK,JSON.stringify({s:salt,h:await pinHash(v,salt)}))}catch(e){}S.pin='';save()}
async function pinOk(v){const p=pinGet();if(p)return (await pinHash(v,p.s))===p.h;return !!S.pin&&S.pin!=='set'&&v===S.pin}
const pinActive=()=>!!pinGet()||(!!S.pin&&S.pin!=='set');
(async()=>{if(S.pin&&S.pin!=='set'&&!pinGet()){await pinSet(S.pin)}})();
const IOSDEV=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1);
function lock(){if(!pinActive())return;if($('lockRoot').innerHTML)return;try{tcHide()}catch(e){}let v='';const hasBio=!!bioGet()&&CANFILE&&!!window.PublicKeyCredential,tapMode=IOSDEV();
  /* iOS erlaubt Face ID in Web-Apps nur direkt nach einem Tipp – sonst schiebt es das Passkey-Fenster davor. Daher dort kein Auto-Start; ein Tipp irgendwo startet Face ID. Nie zwei Aufrufe gleichzeitig. */
  const tryBio=async(auto)=>{if(window.__bioRun||!hasBio||!$('lockRoot').innerHTML)return;window.__bioRun=true;try{if(await bioCheck()){window.__bioOkAt=Date.now();hidAt=0;$('lockRoot').innerHTML='';notifFlush();return}draw(bioName()+' hat nicht geklappt')}catch(e){if(!auto||e.name!='NotAllowedError'||Date.now()-t0>1500)draw(e.name=='NotAllowedError'&&auto?'':bioName()+' abgebrochen. '+(tapMode?'Tippe erneut':'Nochmal tippen')+' oder PIN eingeben.')}finally{window.__bioRun=false}};const t0=Date.now();
  /* Rechner (Maus/Trackpad): Windows-Anmeldung mit Penny-Avatar und PIN-Feld; iPhone/iPad: Penny statt Face-ID-Symbol, Ziffernfeld bleibt */
  const win=!tapMode&&matchMedia('(pointer:fine)').matches;let showPad=!win;
  const pn=()=>`<div class="lk-av">${penny('ausgeglichen',win?104:70)}</div>`,
    pad=()=>`<div class="pad">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k=>k?`<button data-k="${k}">${k=='⌫'?I('backspace',24):k}</button>`:'<span></span>').join('')}</div>`,
    dots=()=>`<div class="dots">${[0,1,2,3].map(i=>`<i class="${i<v.length?'f':''}"></i>`).join('')}</div>`;
  const press=k=>{v=k=='⌫'?v.slice(0,-1):(v+k).slice(0,4);
    if(v.length==4){const tryV=v;pinOk(tryV).then(ok=>{if(ok){$('lockRoot').innerHTML='';notifFlush();return}v='';draw('Falsche PIN')});return}draw()};window.__lockKey=press;
  const draw=(msg)=>{$('lockRoot').innerHTML=win?`<div class="lock lk-win">${pn()}<div class="lk-name">CashFlow</div>
  <div class="lk-pin${msg?' err':''}" role="textbox" aria-label="PIN">${v.length?dots():'<span>PIN</span>'}</div><div class="note" style="min-height:18px;margin-top:-14px;color:var(--bad)">${msg||''}</div>
  ${showPad?pad():''}<div class="lk-opt"><span>Anmeldeoptionen</span><div>${hasBio?`<button id="bioGo" title="Mit ${bioName()} entsperren" aria-label="Mit ${bioName()} entsperren">${I('face',22)}</button>`:''}<button id="padGo" class="${showPad?'on':''}" title="Ziffernblock" aria-label="Ziffernblock">${I('grid',20)}</button></div></div></div>`
  :`<div class="lock">${hasBio?`<button class="biobtn lk-bio ${tapMode?'tap':''}" id="bioGo" aria-label="Mit ${bioName()} entsperren">${pn()}<span>${tapMode?'Tippen für '+bioName():'Mit '+bioName()+' entsperren'}</span></button>`:pn()}<div style="font-size:17px;font-weight:600">${hasBio?'oder PIN eingeben':'PIN eingeben'}</div><div class="note kbhint" style="margin-top:-14px">Auch über die Tastatur</div>
  ${dots()}<div class="note" style="min-height:18px;color:var(--bad)">${msg||''}</div>${pad()}</div>`;
  document.querySelectorAll('.lock .pad button').forEach(b=>b.onclick=()=>press(b.dataset.k));if($('padGo'))$('padGo').onclick=e=>{e.stopPropagation();showPad=!showPad;draw(msg)};if($('bioGo'))$('bioGo').onclick=e=>{e.stopPropagation();tryBio(false)};const lk=document.querySelector('.lock');if(lk&&tapMode&&hasBio)lk.onclick=e=>{if(e.target.closest('.pad,input,textarea'))return;tryBio(false)}};draw();if(hasBio&&!tapMode)setTimeout(()=>tryBio(true),250)}
if(ALL.includes('Alltag')&&!ALL.includes('Flow'))renameAcct('Alltag','Flow');
if(!S.debts){S.debts=[];const r=(S.rec||[]).find(x=>/anyfin/i.test(x.n||''));if(r)S.debts.push({id:'d1',n:'Anyfin Umschuldungskredit',total:1482,interest:228,rate:r.a||60,start:r.start||'2026-12-30',match:'Anyfin',note:'iPhone 16 Pro (PayPal), Garmin Fenix 9 Pro (Advanzia)'});save()}
if(S.iconV!==2){remapIcons(false);S.iconV=2;save()}
if(!S.vaultHideV){S.vaultHide=true;S.vaultHideV=1;save()}
function applyTheme(){const t=S.theme||'system';if(t=='system')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);document.body.classList.toggle('bigcal',!!S.bigCal)}
applyTheme();
{const m=location.hash.match(/^#ab-gehalt=(.+)$/);if(m){history.replaceState(null,'',location.pathname);let o=null;try{o=JSON.parse(decodeURIComponent(m[1]))}catch(e){}tab='dash';setTimeout(()=>abGehalt(o),400)}}
if(/^#(sync|einrichtung)$/i.test(location.hash)){history.replaceState(null,'',location.pathname);S.onb=true;tab='more';setView='sync'}
if(/access_token=|error=|error_code=/.test(location.hash)){const ok=/access_token=/.test(location.hash);history.replaceState(null,'',location.pathname);S.onb=true;tab='more';setView='sync';setTimeout(()=>toast(ok?'E-Mail bestätigt. Jetzt unten „Anmelden“ tippen.':'Der Bestätigungslink ist abgelaufen oder wurde schon benutzt. Versuch einfach „Anmelden“.'),600)}

/* Plus & Assistent: beim Scrollen (hoch und runter) ganz ausblenden, sobald der Bildschirm steht wieder einblenden */
(()=>{let t=null;const show=()=>document.body.classList.remove('fabaway');
  let ly=0;addEventListener('scroll',e=>{const el=e.target;if(asstOpen){clearTimeout(t);show();return}
    if(tab=='list'&&!setView&&!curB){const y=el&&el.nodeType==1&&el.scrollHeight>el.clientHeight+1?el.scrollTop:(window.scrollY||document.body.scrollTop||0);if(Math.abs(y-ly)>4){document.body.classList.toggle('pn-down',y>ly&&y>40);ly=y}}
    if(el&&el.nodeType==1){if(el.closest('#asstRoot,.sheet,#sheetRoot'))return;if(el.scrollHeight<=el.clientHeight+1)return}
    document.body.classList.add('fabaway');clearTimeout(t);t=setTimeout(show,350)},{passive:true,capture:true})})();

/* ---------- Browser-Zurück (Web-App, Maus, Trackpad) ---------- */
(()=>{let inFrame=false;try{inFrame=window.top!==window}catch(e){inFrame=true}if(inFrame||!history.pushState||(STANDALONE&&IOSDEV()))return;
  try{history.replaceState({cf:0},'');history.pushState({cf:1},'')}catch(e){return}
  addEventListener('popstate',()=>{let done=false;
    if($('lockRoot').innerHTML)done=true;
    else if($('sheetRoot').innerHTML){$('sheetRoot').innerHTML='';renderAsst();done=true}
    else if(asstOpen){asstOpen=false;renderAsst();done=true}
    else done=goBack();
    if(done){try{history.pushState({cf:1},'')}catch(e){}}else history.back()})})();
/* ---------- Zurück-Wischen vom linken Rand ---------- */
const NAVS=[],RST=[];/* RST: Standbilder der vorigen Ansichten fürs Zurück-Wischen */
function backTarget(){return document.querySelector('#app .hc-row > button.hc-ic[aria-label="Zurück"],#app .hback,#app button.back')}
function goBack(){const b=backTarget();if(b){b.click();return true}while(NAVS.length){const st=NAVS.pop();if(st.tab==tab&&st.repV==repV&&st.wishV==wishV)continue;render.popping=true;tab=st.tab;repV=st.repV;wishV=st.wishV;setView=null;curB=null;posView=null;render();return true}return false}
(()=>{if(IOSDEV()&&!STANDALONE)return;/* im Safari-Tab hat iOS seine eigene Geste */let x0=null,y0=null,dx=0,act=false,v=null,ok=false,u=null,shade=null;const W=()=>innerWidth;
  const mkUnder=()=>{const s=RST[RST.length-1];if(!s||!s.html)return;u=document.createElement('div');u.id='swUnder';u.setAttribute('aria-hidden','true');u.innerHTML=`<div class="swu-in" style="transform:translateY(${-s.y}px)">${s.html}</div>`;u.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));shade=document.createElement('div');shade.className='swu-sh';u.appendChild(shade);document.body.appendChild(u);u.style.transform=`translateX(${-W()*.28}px)`};
  const rmUnder=()=>{if(u){u.remove();u=null;shade=null}};
  document.addEventListener('touchstart',e=>{if($('sheetRoot').innerHTML||$('lockRoot').innerHTML||asstOpen)return;const t=e.touches[0];if(t.clientX>28)return;x0=t.clientX;y0=t.clientY;dx=0;act=false;ok=!!backTarget()||NAVS.length>0;v=document.querySelector('#app .view')},{passive:true});
  document.addEventListener('touchmove',e=>{if(x0==null||!ok)return;const t=e.touches[0];dx=t.clientX-x0;const dy=t.clientY-y0;if(!act){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){x0=null;return}if(dx>10){act=true;mkUnder()}}
    if(act&&v){const f=Math.min(1,Math.max(0,dx)/W());v.style.transition='none';v.style.transform=`translateX(${Math.max(0,dx)}px)`;v.style.boxShadow='-12px 0 24px rgba(0,0,0,.25)';document.body.classList.add('swback');if(u){u.style.transition='none';u.style.transform=`translateX(${-W()*.28*(1-f)}px)`;if(shade)shade.style.opacity=String(.35*(1-f))}}},{passive:true});
  const end=()=>{if(x0==null)return;x0=null;if(!act||!v){act=false;rmUnder();return}const go=dx>Math.min(110,W()*.3);v.style.transition='transform .2s ease';if(u){u.style.transition='transform .2s ease';if(shade)shade.style.transition='opacity .2s ease'}
    if(go){v.style.transform=`translateX(${W()}px)`;if(u){u.style.transform='translateX(0)';if(shade)shade.style.opacity='0'}setTimeout(()=>{document.body.classList.remove('swback');render.noAnim=true;goBack();render.noAnim=false;requestAnimationFrame(()=>requestAnimationFrame(rmUnder))},190)}
    else{v.style.transform='';if(u){u.style.transform=`translateX(${-W()*.28}px)`;if(shade)shade.style.opacity='.35'}setTimeout(()=>{v.style.boxShadow='';document.body.classList.remove('swback');rmUnder()},210)}act=false};
  document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true})})();
/* Tageswechsel erkennen: "heute" neu setzen, wenn die App aus dem Hintergrund kommt oder Mitternacht vorbei ist */
function dayRefresh(){const d=new Date();if(d.toDateString()===now.toDateString()){now=d;NOWT=d.getTime();return false}DV++;now=d;NOWT=d.getTime();try{applyRec();closeMonths()}catch(e){}if(!$('sheetRoot').innerHTML)render();else renderAsst();return true}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')dayRefresh()});setInterval(()=>{if(document.visibilityState==='visible')dayRefresh()},60000);
/* v299: Farbliste beginnt jetzt mit „Dunkel“ – gewählte Farben behalten ihren Ton */if(!S.gr2){Object.values(S.bg||{}).forEach(x=>{if(x&&typeof x.g=='number')x.g++});S.bg=S.bg||{};S.bg.Gesamt={g:0};S.gr2=true;save()}
closeMonths();render();lock();setTimeout(()=>pushPlan(false),3000);if(!S.onb)openOnb();
/* v230: nach einem Update kurz melden, welche Version jetzt läuft */try{const lv=localStorage.getItem('cfVer'),cv=APP_VER.split(' ')[0];if(lv&&lv!==cv)setTimeout(()=>toast('Aktualisiert auf Version '+cv),1200);localStorage.setItem('cfVer',cv)}catch(e){}
if(syOn())sync();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync()});setInterval(()=>{if(document.visibilityState==='visible')sync()},60000);window.addEventListener('online',()=>sync())
/* v253: Ruhezustand für Penny */let PNRT=null;function pnRest(){document.body.classList.remove('pn-rest');clearTimeout(PNRT);PNRT=setTimeout(()=>document.body.classList.add('pn-rest'),3500)}pnRest();new MutationObserver(()=>{if(document.body.dataset.pr)pnRest()}).observe(document.body,{attributes:true,attributeFilter:['data-pr']});
/* v230: Penny weicht beim Runterscrollen aus, damit sie keine Zeilen verdeckt */(()=>{let y0=0;addEventListener('scroll',()=>{const y=scrollY||document.documentElement.scrollTop||0,d=y-y0;if(Math.abs(d)<6)return;document.body.classList.toggle('pn-hide',d>0&&y>40);y0=y},{passive:true})})();
/* Belege: alte Fotos aus der Buchung nach IndexedDB umziehen, offene Uploads nachholen */setTimeout(()=>{docMigrate().catch(()=>{}).then(()=>docFlush())},3000);
/* v289: Desktop-Breakpoint 1280 px – Heute neu zeichnen (großes Diagramm) */(()=>{let w0=innerWidth>=1280,t=null;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>{const w=innerWidth>=1280;if(w===w0)return;w0=w;if(tab=='dash'&&!setView&&!curB&&!$('sheetRoot').innerHTML)render()},150)})})();

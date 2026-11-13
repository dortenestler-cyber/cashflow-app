/* ---------- Assistent: Höhe (⅓ · ½ · fast voll) und Eingabevorschläge ---------- */
let ASH='third';const ASHV={third:'36vh',half:'54vh',full:'94dvh'};
function chipUse(t){S.chipUse=S.chipUse||{};S.chipUse[t]=(S.chipUse[t]||0)+1;save()}
function asstChips(q){q=String(q||'').trim().toLowerCase();const out=[],add=(t,m,s)=>{if(!out.some(x=>x.t==t))out.push({t,m,s})};const hr=new Date().getHours(),P=period(0),dow=new Date().getDay();
  // häufigste Buchungen mit üblichem Betrag
  const fr={};S.exp.filter(e=>e.type=='out'&&!isPlan(e)&&!e.rid&&e.n&&e.t>Date.now()-120*864e5).forEach(e=>{const k=e.n.trim();if(k.length<2||k.length>24)return;(fr[k]=fr[k]||[]).push(e.a)});
  const top=Object.entries(fr).sort((a,b)=>b[1].length-a[1].length).slice(0,12).map(([n,L])=>{const s=L.slice().sort((a,b)=>a-b),med=s[Math.floor(s.length/2)];return{n,a:med,c:L.length}});
  if(q){const Q=[...ASKS.map(x=>({t:x,m:'ask'})),...top.map(x=>({t:x.n+' '+String(Math.round(x.a*100)/100).replace('.',','),m:'fill'})),...FILLS.map(x=>({t:x,m:'fill'}))];
    Q.filter(x=>x.t.toLowerCase().startsWith(q)||x.t.toLowerCase().split(/\s+/).some(w=>w.startsWith(q)&&q.length>=2)).slice(0,6).forEach(x=>add(x.t,x.m,0));return out}
  const B=BUDG.filter(b=>!isK(b)).map(b=>calc(b)),tight=B.some(c=>c.rest<0||c.rest/Math.max(P.left||1,1)<5);
  if(tight)add('Was darf ich heute noch ausgeben?','ask',90);
  if(S.urge&&Date.now()-(S.urge.t||0)<3600e3)add('Kaufimpuls','ask',95);
  if(hr>=18)add('Wie war mein Tag?','ask',70),add('Journal: ','fill',65);
  if(P.left<=3)add('Monatsbilanz','ask',75);if(aiOn()&&P.left<=5)add('KI-Rückblick','ask',74);
  if((S.wish||[]).some(w=>w.s=='offen'&&w.t+wait(w.p)<Date.now()))add('Wunsch entscheiden','ask',72);
  if(dow==0)add('Wochen-Check-in','ask',68);
  const last=AQ.msgs.length?String(AQ.msgs[AQ.msgs.length-1].q||'').toLowerCase():'';
  if(/ausgegeben|wofür|kategorie|wie viel/.test(last))add('Vergleich zum Vormonat','ask',85);
  if(/depot|aktie|etf|krypto/.test(last))add('Krypto-News','ask',80);
  ['Was darf ich heute noch ausgeben?','Wie steht mein Puffer?','Wie steht mein Depot?','Was kommt diese Woche?','Wofür habe ich diesen Monat am meisten ausgegeben?','Welche Abos habe ich?'].forEach((t,i)=>add(t,'ask',40-i));
  top.slice(0,3).forEach((x,i)=>add(x.n+' ','fill',36-i));
  ['Journal: ','Wunsch  Euro','auf die Einkaufsliste'].forEach((t,i)=>add(t,'fill',30-i));
  const U=S.chipUse||{},H=S.chipHide||[];return out.filter(x=>!H.includes(x.t)).map(x=>Object.assign(x,{s:x.s+Math.min(25,(U[x.t]||0)*3)})).sort((a,b)=>b.s-a.s).slice(0,10)}
const ASKS=['Was darf ich heute noch ausgeben?','Wie steht mein Puffer?','Wie steht mein Depot?','Was kommt diese Woche?','Wofür habe ich diesen Monat am meisten ausgegeben?','Welche Abos habe ich?','Wie viel habe ich für Café ausgegeben?','Wie war mein Tag?','Monatsbilanz','Vergleich zum Vormonat','Krypto-News','Wochen-Check-in','Kaufimpuls'];
const FILLS=['Journal: ','Wunsch  Euro','auf die Einkaufsliste','Umbuchen 50 Euro von Flow nach Sinking Funds'];
const chipLab=x=>x.t.replace(/^Wunsch  Euro$/,'Wunsch … Euro').replace(/^auf die Einkaufsliste$/,'… auf die Einkaufsliste').replace(/ $/,' …');
function chipsHtml(q){const L=asstChips(q);return L.map((x,i)=>`<button type="button" class="achip ${x.m}" data-chip="${i}">${x.m=='fill'?I('pen',12):''}${esc(chipLab(x))}</button>`).join('')}
function bindChips(){const box=$('aChips');if(!box)return;const L=asstChips($('aqI')&&$('aqI').value);
  box.querySelectorAll('[data-chip]').forEach(b=>{const x=L[+b.dataset.chip];if(!x)return;let lp=null,long=false;
    b.addEventListener('touchstart',()=>{long=false;lp=setTimeout(()=>{long=true;S.chipHide=[...new Set([...(S.chipHide||[]),x.t])];save();box.innerHTML=chipsHtml();bindChips();tell('Vorschlag ausgeblendet.',()=>{S.chipHide=(S.chipHide||[]).filter(t=>t!=x.t);save();renderAsst()})},550)},{passive:true});
    b.addEventListener('touchend',()=>clearTimeout(lp));b.addEventListener('touchmove',()=>clearTimeout(lp),{passive:true});
    b.onclick=e=>{e.stopPropagation();if(long)return;chipUse(x.t);const I0=$('aqI');
      if(x.m=='ask'){const t=x.t=='Wochen-Check-in'?null:x.t;if(!t){asstOpen=false;renderAsst();openCheckin();return}if(t=='KI-Rückblick'){I0.value='';aiReview();return}if(t=='Notbremse'||t=='Kaufimpuls'){asstOpen=false;renderAsst();openUrge(S.urge&&S.urge.jid);return}if(t=='Wunsch entscheiden'){asstOpen=false;renderAsst();tab='wish';wishV='Wünsche';render();return}I0.value='';asstAsk(t);return}
      let v=x.t;if(v=='Wunsch  Euro'){I0.value='Wunsch  Euro';I0.focus();I0.setSelectionRange(7,7);return}if(v=='auf die Einkaufsliste'){I0.value=' auf die Einkaufsliste';I0.focus();I0.setSelectionRange(0,0);return}
      I0.value=v;I0.focus();try{I0.setSelectionRange(v.length,v.length)}catch(_){}box.innerHTML=chipsHtml(v);bindChips()}})}
function asstDrag(){const g=$('aGrab'),p=document.querySelector('#asstRoot .apop');if(!g||!p)return;let y0=null,h0=0;
  g.onclick=e=>{e.stopPropagation();ASH=ASH=='third'?'half':ASH=='half'?'full':'third';p.style.height=ASHV[ASH]};
  g.addEventListener('touchstart',e=>{y0=e.touches[0].clientY;h0=p.getBoundingClientRect().height;p.style.transition='none'},{passive:true});
  g.addEventListener('touchmove',e=>{if(y0==null)return;const h=Math.max(80,Math.min(innerHeight*.92,h0+(y0-e.touches[0].clientY)));p.style.height=h+'px'},{passive:true});
  g.addEventListener('touchend',()=>{if(y0==null)return;y0=null;p.style.transition='';const r=p.getBoundingClientRect().height/innerHeight;if(r<.22){asstOpen=false;renderAsst();return}ASH=r<.45?'third':r<.72?'half':'full';p.style.height=ASHV[ASH]})}

/* Penny-Chatverlauf (nur lokal) */
/* Wiederaufbau von Knopf-Aktionen beim Öffnen aus dem Verlauf (Funktionen lassen sich nicht speichern) */const ACTREB={};
const chatsGet=()=>{try{return JSON.parse(localStorage.getItem('cfChats')||'[]')}catch(e){return[]}},chatsPut=l=>{try{localStorage.setItem('cfChats',JSON.stringify(l.slice(0,30)))}catch(e){}};
const chatTitle=ms=>{const q=(ms.find(m=>m.q)||{}).q;return q?(q.length>28?q.slice(0,27)+'…':q):ms.length?'Tagesbrief':'Neuer Chat'};
function chatSync(){if(!AQ.msgs.length)return;AQ.msgs.forEach(m=>{if(!m.t)m.t=Date.now()});if(!AQ.id)AQ.id=Date.now();const l=chatsGet().filter(c=>c.id!=AQ.id);l.unshift({id:AQ.id,t:Date.now(),ti:chatTitle(AQ.msgs),msgs:AQ.msgs.map(m=>({q:m.q||'',h:m.h,t:m.t,ad:m.ad}))});chatsPut(l)}
let asstHist=false;
/* v240: ein Hinweis-Kanal – Penny erzeugt, Badge und Heute zeigen nur Pennys Hinweise */let PNN=0,PNTOP=null;let asstAll=false,asstTips=false,asstPlus=false,asstOpTip=0;let asstWas=false;function renderAsst(){pnTick();pnPage();const r=$('asstRoot');if(!r)return;/* v: Penny öffnet immer groß */if(asstOpen&&!asstWas)ASH='full';asstWas=!!asstOpen;chatSync();const hl=asstOpen?chatsGet():[],hc=hl.length;if(!asstOpen)asstHist=false;document.body.classList.toggle('asst-open',!!asstOpen&&!$('sheetRoot').innerHTML);const clip=typeof clipAsk!='undefined'&&clipAsk&&featOn('shopclip'),t0=tipsList(),hide=!!$('sheetRoot').innerHTML||setView=='import';
  if(hide){r.innerHTML='';return}
  const tkey0=0;const tkey=x=>x.sev+'|'+String(x.ttl).replace(/[\d.,]+\s*(€|×|Tage|Raten)?/g,'#');S.dismTips=(S.dismTips||[]).filter(k=>t0.some(x=>tkey(x)==k));const t=t0.filter(x=>!S.dismTips.includes(tkey(x)));S.seenTips=(S.seenTips||[]).filter(k=>t.some(x=>tkey(x)==k));const top=t.length?t[0].sev:'calm',hr=new Date().getHours(),/* v253: Zähler nur für Warnungen, Tipps erscheinen ohne Zahl */loud=x=>x.ttl=='Von Siri übernehmen?'||x.sev=='bad'||(x.sev=='warn'&&hr>=7&&hr<22),n=t.filter(x=>!S.seenTips.includes(tkey(x))&&loud(x)).length+(clip?1:0);PNN=n;PNTOP=t.find(x=>x.sev=='bad')||t.find(x=>x.sev=='warn'&&!S.seenTips.includes(tkey(x)))||null;if(!asstOpen||!t.length)asstTips=false;if(!asstOpen)asstPlus=false;
  document.body.classList.toggle('shopv',setView=='shop');
  r.innerHTML=`<div class="abar ${top}${t.length?'':' calm'}${asstOpen?' open':''}"><button class="abub" id="abub" aria-label="Penny öffnen${t.length?', '+t.length+' Hinweise':''}" aria-expanded="${asstOpen}"><span class="abar-r">${penny(pMood(),46)}</span>${n?`<span class="acnt">${n}</span>`:''}</button></div>
   ${asstOpen?`<div class="adim" id="aDim"></div><div class="apop" role="dialog" aria-label="Assistent" style="height:${ASHV[ASH]}"><button class="agrab" id="aGrab" aria-label="Höhe ändern"><i></i></button><div class="apop-h"><button id="aHist" class="ah-menu" aria-label="Verlauf"><svg class="i" viewBox="0 0 24 24" style="width:22px;height:22px" aria-hidden="true"><path d="M4 8h16M4 15h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>${AQ.msgs.length?`<button class="ah-pill" id="aPill" aria-label="Verlauf öffnen">${penny(pMood(),30)}<span>${esc(chatTitle(AQ.msgs))}</span></button>`:'<span></span>'}<button id="aClose" aria-label="Schließen">${I('close',18)}</button></div>
    <div class="apop-b">${AQ.msgs.length?'':pennyWelcome(t)}${AQ.msgs.length&&t.length?`<button class="pw-c hot pw-mini" id="pwTips"><span class="pw-i">${I('bell',16)}<i class="pw-dot"></i></span><span><b>${t.length==1?'1 Hinweis':t.length+' Hinweise'}</b></span></button>`:''}${asstTips?`<div class="atsh-dim" id="atDim"></div><div class="atsh" role="dialog" aria-label="Hinweise"><div class="atsh-h"><b>Hinweise</b><button id="atX" aria-label="Hinweise schließen">${I('close',16)}</button></div><div class="atsh-b">`+(asstAll?t:t.slice(0,3)).map((x,i)=>`<div class="atip ${x.sev}${i==asstOpTip?' op':''}" data-tk="${esc(tkey(x))}" data-ti="${i}"><button class="atip-x0" data-adis="${i}" aria-label="Hinweis ausblenden" title="Ausblenden">${I('close',14)}</button><div class="atip-t" data-atog="${i}" role="button" tabindex="0" aria-expanded="${i==asstOpTip}">${asstNew.includes(tkey(x))?'<span class="newdot">Neu</span>':''}${I(x.sev=='bad'?'alert':x.sev=='warn'?'up':x.sev=='ok'?'check':'sparkle',15)}<b>${esc(x.ttl)}</b></div><div class="atip-x">${x.txt}</div>
     ${x.b||x.tab||x.sv||x.act||x.btns?`<div class="choices" style="margin-top:6px">${(x.btns||[]).map((bt,j)=>`<button data-afn="${i}|${j}">${esc(bt.l)}</button>`).join('')}${x.b?`<button data-ago="${i}">Ansehen</button>`:''}${x.act=='puf'?`<button data-apuf="${i}">Überschuss umbuchen</button>`:''}${x.act=='chk'?`<button data-achk="${i}">Check-in starten</button>`:''}${x.act=='shop'?`<button data-ashop="${i}">Zettel öffnen</button>`:''}${x.act=='shopP'?`<button data-ashopp="${i}">Preise nachtragen</button>`:''}${x.act=='rg'?`<button data-arg="${i}|0">Hat sich gelohnt</button><button data-arg="${i}|1">Bereue ich</button>`:''}${x.act=='urge'?`<button data-aurge="${i}">Antworten</button>`:''}${x.act=='rk'?`<button data-ark="${i}">Jetzt einrichten</button>`:''}${x.act=='pst'?`<button data-apst="${i}">Zustellung öffnen</button>`:''}${x.act=='abg'?`<button data-aabg="${i}">Jetzt abgleichen</button>`:''}${x.act=='sub'?`<button data-asub="${i}">In die Fixkosten</button><button data-asubn="${i}">Kein Abo</button>`:''}${x.act=='review'?`<button data-arev="${i}">Rückblick öffnen</button>`:''}${x.act=='bak'?`<button data-abak="${i}">Jetzt sichern</button>`:''}${x.act=='ctr'?`<button data-actr="${i}">Vertrag bearbeiten</button><button data-actv="${i}">Alle Verträge</button>`:''}${(x.tab||x.sv)&&!x.b?`<button data-ago="${i}">Öffnen</button>`:''}</div>`:''}</div>`).join('')+(!asstAll&&t.length>3?`<button class="link" id="aMore" style="font-size:13px;padding:2px 6px 8px">${t.length-3} weitere Hinweise</button>`:'')+((S.dismTips||[]).length?`<button class="link" id="aUndis" style="font-size:13px;padding:6px">${S.dismTips.length} ausgeblendete anzeigen</button>`:'')+`</div></div>`:''}${asstHist?`<div class="atsh-dim" id="ahDim"></div><div class="atsh" role="dialog" aria-label="Verlauf"><div class="atsh-h"><b>Verlauf</b><button id="ahX" aria-label="Verlauf schließen">${I('close',16)}</button></div><div class="atsh-b"><button class="ah-new" id="ahNew">${I('plus',18)}<span>Neuer Chat</span></button>${hl.length?hl.map(c=>`<div class="ah-it${c.id==AQ.id?' on':''}" data-hc="${c.id}" role="button" tabindex="0"><div class="ah-t"><b>${esc(c.ti)}</b><span>${new Date(c.t).toLocaleDateString('de-DE',{day:'numeric',month:'short'})} · ${new Date(c.t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})} · ${c.msgs.length} ${c.msgs.length==1?'Nachricht':'Nachrichten'}</span></div><button data-hdel="${c.id}" aria-label="Chat löschen">${I('trash',16)}</button></div>`).join(''):'<p class="a-s" style="text-align:center;padding:16px">Noch keine Chats.</p>'}</div></div>`:''}
    ${AQ.msgs.map((m,mi)=>`${m.q?`<div class="aq-q">${esc(m.q)}</div>`:''}<div class="aq-a">${m.t&&new Date(m.t).toDateString()!==new Date().toDateString()?`<p class="a-s aq-ts">Stand ${dmy(new Date(m.t))} · Zahlen können sich geändert haben</p>`:''}${m.h}${(m.a||[]).map((x,xi)=>`<button class="chip" data-aact="${mi}|${xi}">${x[0]}</button>`).join('')}${mi==AQ.msgs.length-1&&(m.f||[]).length?`<div class="aq-fu">${m.f.map((x,fi)=>`<button class="achip fu" data-afu="${fi}">${I('fwd',12)}${esc(x.replace(/ $/,' …'))}</button>`).join('')}</div>`:''}</div>`).join('')}</div>
    <div class="achips" id="aChips">${chipsHtml()}</div>
    ${asstPlus?`<div class="aplus" id="aPlus">${clip?`<button type="button" id="aClip">${I('copy',18)}<span>Von Siri übernehmen</span><i class="pw-dot"></i></button>`:`<button type="button" id="aClip">${I('copy',18)}<span>Von Siri übernehmen</span></button>`}</div>`:''}<form class="aq-in" id="aqForm"><div class="aq-pill"><input id="aqI" placeholder="Frag Penny oder sag eine Buchung …" autocomplete="off" enterkeyhint="send"><div class="aq-row"><button type="button" class="aq-plus${asstPlus?' on':''}" id="aqPlus" aria-label="Mehr" aria-expanded="${asstPlus}">${I('plus',18)}${clip?'<i class="pw-dot"></i>':''}</button><span style="flex:1"></span><button type="button" class="aq-mic" id="aqMic" aria-label="Sprechen">${I('mic',20)}</button><button type="submit" class="aq-go" aria-label="Senden"><svg class="i" viewBox="0 0 24 24" style="width:18px;height:18px" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div></form>
    ${AQ.msgs.length?`<div class="apop-f">${AQ.msgs.length?`<button class="link" id="aClr" style="font-size:11px">Chat löschen</button>`:''}</div>`:''}</div>`:''}`;
  if($('aMore'))$('aMore').onclick=e=>{e.stopPropagation();asstAll=true;renderAsst()};
  {const ab=$('abub');ab.addEventListener('touchstart',()=>{clearTimeout(ab._lp);ab._lp=setTimeout(()=>{pnLP=true;pnReact('tickle')},550)},{passive:true});['touchend','touchmove','touchcancel'].forEach(v=>ab.addEventListener(v,()=>clearTimeout(ab._lp),{passive:true}))}
  $('abub').onclick=e=>{e.stopPropagation();if(pnLP){pnLP=false;return}{const t=Date.now();pnTaps=pnTaps.filter(x=>t-x<1500);pnTaps.push(t)}asstOpen=!asstOpen;if(asstOpen){ASH='full';asstNew=t.filter(x=>!(S.seenTips||[]).includes(tkey(x))).map(tkey);S.seenTips=[...new Set([...(S.seenTips||[]),...t.map(tkey)])];save()}renderAsst();if(pnTaps.length>=4){pnTaps=[];pnReact('dizzy')}else pnOpenFx(asstOpen)};
  if(asstOpen){r.querySelectorAll('.atip .choices button').forEach(b=>b.addEventListener('click',()=>{const k=b.closest('.atip').dataset.tk;S.dismTips=[...new Set([...(S.dismTips||[]),k])];save()},true));$('aClose').onclick=()=>{asstOpen=false;renderAsst();pnReact('bye')};{const pf=r.querySelector('.pw-face');if(pf)pf.onclick=pnPoke}r.querySelectorAll('[data-adis]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>pnReact('salute'),60),true));r.querySelectorAll('[data-adis]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=t[b.dataset.adis];S.dismTips=[...new Set([...(S.dismTips||[]),tkey(x)])];save();renderAsst()});if($('aUndis'))$('aUndis').onclick=e=>{e.stopPropagation();S.dismTips=[];save();renderAsst()};r.querySelector('.apop').onclick=e=>e.stopPropagation();
    if($('aClr'))$('aClr').onclick=e=>{e.stopPropagation();chatsPut(chatsGet().filter(c=>c.id!=AQ.id));AQ.msgs=[];AQ.id=0;renderAsst()};
    {const ho=()=>{asstHist=true;asstTips=false;asstPlus=false;renderAsst()},hx=()=>{asstHist=false;renderAsst()};$('aHist').onclick=ho;if($('aPill'))$('aPill').onclick=ho;if($('ahX'))$('ahX').onclick=hx;if($('ahDim'))$('ahDim').onclick=hx;
     if($('ahNew'))$('ahNew').onclick=()=>{AQ.msgs=[];AQ.id=0;AQ.ctx=null;asstHist=false;renderAsst()};
     r.querySelectorAll('[data-hdel]').forEach(b=>b.onclick=e=>{e.stopPropagation();const id=+b.dataset.hdel;chatsPut(chatsGet().filter(c=>c.id!=id));if(id==AQ.id){AQ.msgs=[];AQ.id=0}renderAsst()});
     r.querySelectorAll('[data-hc]').forEach(b=>{const f=()=>{const c=chatsGet().find(x=>x.id==+b.dataset.hc);if(!c)return;AQ.msgs=c.msgs.map(m=>{const x={...m};if(x.ad&&ACTREB[x.ad.k])x.a=ACTREB[x.ad.k](x.ad);return x});AQ.id=c.id;asstHist=false;renderAsst();aiScroll()};b.onclick=f;b.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();f()}}})}
    $('aqForm').onsubmit=e=>{e.preventDefault();const v=$('aqI').value;$('aqI').value='';document.body.classList.remove('pn-ty');pnReact('nod');asstAsk(v)};$('aqI').addEventListener('input',pnType);
    $('aqMic').onclick=()=>pnReact('ear')||listen(v=>asstAsk(v),$('aqI'),'Ich höre zu …');
    bindChips();asstDrag();if($('aDim'))$('aDim').onclick=e=>{e.stopPropagation();asstOpen=false;renderAsst()};$('aqI').oninput=()=>{const b=$('aChips');if(b){b.innerHTML=chipsHtml($('aqI').value);bindChips()}};
    r.querySelectorAll('[data-aq]').forEach(b=>b.onclick=()=>asstAsk(b.dataset.aq));if($('pwTips'))$('pwTips').onclick=()=>{asstTips=true;asstPlus=false;asstOpTip=0;renderAsst()};const tc=()=>{asstTips=false;renderAsst()};if($('atX'))$('atX').onclick=tc;if($('atDim'))$('atDim').onclick=tc;
    r.querySelectorAll('[data-atog]').forEach(b=>{const f=()=>{const i=+b.dataset.atog;asstOpTip=asstOpTip==i?-1:i;renderAsst()};b.onclick=f;b.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();f()}}});
    $('aqPlus').onclick=()=>{asstPlus=!asstPlus;renderAsst()};if($('aClip'))$('aClip').onclick=()=>{asstPlus=false;asstOpen=false;renderAsst();TIPFN.clipGo()};
    {const ap=r.querySelector('.apop'),qi=$('aqI');qi.onfocus=()=>ap.classList.add('typing');qi.onblur=()=>setTimeout(()=>{if(document.activeElement!==qi)ap.classList.remove('typing')},250)}
    r.querySelectorAll('[data-afu]').forEach(b=>b.onclick=e=>{e.stopPropagation();const m=AQ.msgs[AQ.msgs.length-1],t=m&&m.f&&m.f[+b.dataset.afu];if(t)fuGo(t)});document.querySelectorAll('[data-aact]').forEach(b=>b.onclick=()=>{const[mi,xi]=b.dataset.aact.split('|').map(Number);const m=AQ.msgs[mi],f=m&&m.a&&m.a[xi];if(f){if(f[2]){m.a=null;delete m.ad}asstOpen=false;renderAsst();f[1]()}});
    r.querySelectorAll('[data-jr]').forEach(b=>b.onclick=()=>openJournal(b.dataset.jr));
    r.querySelectorAll('[data-aex]').forEach(b=>b.onclick=()=>{const e=S.exp.find(x=>x.id==b.dataset.aex);if(e)openSheet(e)});
    r.querySelectorAll('.atip').forEach(el=>{let x0=null,y0=null,dx=0,drag=false;
      el.addEventListener('touchstart',e=>{if(e.target.closest('button'))return;x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0;drag=false;el.style.transition='none'},{passive:true});
      el.addEventListener('touchmove',e=>{if(x0==null)return;dx=e.touches[0].clientX-x0;const dy=e.touches[0].clientY-y0;if(!drag&&Math.abs(dy)>Math.abs(dx)){x0=null;return}if(Math.abs(dx)>8)drag=true;if(drag){el.style.transform=`translateX(${dx}px)`;el.style.opacity=String(Math.max(.2,1-Math.abs(dx)/220))}},{passive:true});
      el.addEventListener('touchend',()=>{if(x0==null)return;x0=null;el.style.transition='transform .2s ease,opacity .2s ease';if(Math.abs(dx)>90){el.style.transform=`translateX(${dx>0?400:-400}px)`;el.style.opacity='0';const x=t[+el.dataset.ti];setTimeout(()=>{S.dismTips=[...new Set([...(S.dismTips||[]),tkey(x)])];save();renderAsst();tell('Hinweis ausgeblendet.',()=>{S.dismTips=(S.dismTips||[]).filter(k=>k!==tkey(x));save();renderAsst()})},180)}else{el.style.transform='';el.style.opacity=''}},{passive:true})});
    r.querySelectorAll('[data-ago]').forEach(b=>b.onclick=()=>{const x=t[b.dataset.ago];asstOpen=false;if(x.b){tab='dash';setView=null;curB=x.b}else if(x.sv){curB=null;setView=x.sv}else{tab=x.tab;curB=null;setView=null}render();scrollTo(0,0)});
    r.querySelectorAll('[data-apuf]').forEach(b=>b.onclick=()=>{asstOpen=false;renderAsst();maybeAskPuf(true)});
    r.querySelectorAll('[data-actr]').forEach(b=>b.onclick=()=>{const x=t[b.dataset.actr];asstOpen=false;renderAsst();openContract((S.contracts||[]).findIndex(c=>c.id==x.cid))});
    r.querySelectorAll('[data-actv]').forEach(b=>b.onclick=()=>{asstOpen=false;tab='rep';repV='Verträge';drill=null;curB=null;setView=null;render();scrollTo(0,0)});
    r.querySelectorAll('[data-abak]').forEach(b=>b.onclick=()=>{asstOpen=false;prevTab=tab;tab='more';setView='export';render();scrollTo(0,0)});
    r.querySelectorAll('[data-afn]').forEach(b=>b.onclick=()=>{const[i,j]=b.dataset.afn.split('|').map(Number),bt=t[i]&&t[i].btns&&t[i].btns[j];if(!bt)return;if(!['pwIgn','unIgn','clipNo','pwTake','why','askQ','qkOk'].includes(bt.fn)){asstOpen=false;renderAsst()}TIPFN[bt.fn](bt.arg);if(asstOpen)renderAsst()});
    r.querySelectorAll('[data-arev]').forEach(b=>b.onclick=()=>{asstOpen=false;prevTab=tab;tab='more';setView='review';S.revOff=-1;render();scrollTo(0,0)});
    r.querySelectorAll('[data-arg]').forEach(b=>b.onclick=()=>{const[i,v]=b.dataset.arg.split('|');const x=t[+i];rgSet(x.eid,v=='1');renderAsst()});
    r.querySelectorAll('[data-aurge]').forEach(b=>b.onclick=()=>{asstOpen=false;renderAsst();openUrge(S.urge&&S.urge.jid)});
    r.querySelectorAll('[data-apst]').forEach(b=>b.onclick=()=>goPst());r.querySelectorAll('[data-ark]').forEach(b=>b.onclick=()=>{asstOpen=false;prevTab=tab;tab='more';setView='export';render();scrollTo(0,0);setTimeout(openRkSetup,100)});
    r.querySelectorAll('[data-aabg]').forEach(b=>b.onclick=()=>{asstOpen=false;renderAsst();openAbgleich()});
    r.querySelectorAll('[data-asub]').forEach(b=>b.onclick=()=>{const x=t[b.dataset.asub];asstOpen=false;renderAsst();subAdopt(x.sk)});
    r.querySelectorAll('[data-asubn]').forEach(b=>b.onclick=()=>{const x=t[b.dataset.asubn];S.subNo=[...new Set([...(S.subNo||[]),x.sk])];save();renderAsst();tell('Alles klar, wird nicht mehr vorgeschlagen.')});
    r.querySelectorAll('[data-ashopp]').forEach(b=>b.onclick=()=>{asstOpen=false;S.shop.unkTip=Date.now();save();prevTab=tab;setView='shop';render();scrollTo(0,0);setTimeout(openShopPrices,50)});
    r.querySelectorAll('[data-ashop]').forEach(b=>b.onclick=()=>{asstOpen=false;prevTab=tab;setView='shop';render();scrollTo(0,0)});
    r.querySelectorAll('[data-achk]').forEach(b=>b.onclick=()=>{asstOpen=false;renderAsst();openCheckin()})}}
document.addEventListener('click',()=>{if(asstOpen){asstOpen=false;renderAsst()}});

function viewDash(){const P=period(0),soll=(P.idx-.5)/P.len;



  const tot=TOTM.reduce((s,b)=>s+calc(b).rest,0),k=pkey(P);
  window._up=null;const up=[...S.rec.filter(r=>!r.paused).map(r=>({r,d:recDue(r,P)})).filter(x=>x.d&&x.d>now&&!S.exp.some(e=>e.rid==x.r.id&&e.pk==k)),...S.exp.filter(e=>isPlan(e)&&e.t-NOWT<30*864e5).map(e=>({r:Object.assign({},e,{n:e.n||e.c}),d:new Date(e.t),pl:true}))].sort((a,b)=>a.d-b.d).slice(0,3);window._up=up;
  const fw=fcWarn();
  const pt=fw?null:(()=>{try{const tkey=x=>x.sev+'|'+String(x.ttl).replace(/[\d.,]+\s*(€|×|Tage|Raten)?/g,'#');const t=tipsList().filter(x=>!(S.dismTips||[]).includes(tkey(x)));const r=t.find(x=>x.sev=='bad')||t.find(x=>x.sev=='warn'&&!(S.seenTips||[]).includes(tkey(x)));return r?Object.assign({},r,{_k:tkey(r)}):null}catch(e){return null}})();
  return `<h1 class="sr">Budget ${P.label}</h1>
  <div class="minis mtop" style="grid-template-columns:repeat(${BUDG.filter(b=>b!=sinkAcc()).length||1},minmax(0,1fr))">${BUDG.filter(b=>b!=sinkAcc()).map(b=>{const c=calc(b),s=stat(c);return `<button class="mini st-${s.k}" data-b="${b}" style="--c:${COL[b]}">
    <div class="mini-n"><span class="dotc"></span>${esc(SHORT[b])}</div>${gauge(c.pct,COL[b],0,0,s.col,gData(b,c))}<div class="mini-r ${s.k=='bad'?'out':''}">${s.k=='bad'?eur0(c.rest):eur(c.tag)}</div>
    <div class="mini-s">${s.k=='bad'?'aufgebraucht':'pro Tag · '+(s.k=='warn'?eur0(s.over)+' über Plan':eur0(c.rest)+' übrig')}</div></button>`}).join('')}</div>
  ${pt?`<button class="fcwarn ${pt.sev=='bad'?'':'warn'}" id="pnCard" data-act="${pt.act||''}" data-tk="${esc(pt._k)}"><span class="vault-ic">${I('alert',20)}</span><div class="t"><b>${esc(pt.ttl)}</b><div class="s">${String(pt.txt||'').replace(/<[^>]*>/g,'').replace(/^„[^“]*“\s*/,'').slice(0,140)}</div></div><span class="chev">›</span></button>`:''}${fw?`<div class="fcwarn" id="fcWarnBtn" role="button" tabindex="0" data-fwk="${esc(fcWarnKey(fw))}"><span class="vault-ic">${I('alert',20)}</span><div class="t"><b>${esc(SHORT[fw.n]||fw.n)} reicht im ${period(fw.o).s.toLocaleDateString('de-DE',{month:'long'})} nicht</b><div class="s">Laut Prognose ${eur0(fw.v)}${fw.puf?' nach allen geplanten Abgängen':''}. Tippen für Details.</div></div><button class="fcx" id="fcWarnX" aria-label="Hinweis ausblenden">×</button></div>`:''}
  ${carousel(tot,P)}
  
  <div class="quick"><button class="btn soft" id="shopBtn2" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('cart',18)}Einkauf${(S.shop&&S.shop.items.length)?` <span class="cnt">${S.shop.items.length}</span>`:''}</button><button class="btn soft" id="umBtn" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('swap',18)}Umbuchen</button><button class="btn soft" id="accBtn" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('wallet',18)}Konten</button></div>

  ${up.length?`<div class="sec"><div class="sh">Demnächst geplant</div><div class="group">${up.map((x,ui)=>`<button class="cell" data-up="${ui}"><div class="ico" style="background:color-mix(in srgb,${COL[x.r.b]} 16%,transparent);color:${COL[x.r.b]}">${icoOf(x.r.b,x.r.c)}</div><div class="t"><div>${esc(x.r.n)}</div><div class="s">${x.d.toLocaleDateString('de-DE',{day:'numeric',month:'long'})} · ${SHORT[x.r.b]}</div>${x.pl?'':adjTag({adj:adjOf(x.r,P)})}</div><div class="v ${x.r.type=='in'?'in':''}">${x.r.type=='in'?'+':x.r.type=='tr'?'':'−'}${eur(x.pl?x.r.a:recA(x.r,P))}</div><span class="chev">›</span></button>`).join('')}</div></div>`:''}
  <div class="sec"><div class="sh">Sicherheit</div><div class="vault puf ${pufVal()<0?'neg':''}">
   <button id="pufBtn" class="puf-b"><div class="vault-h"><span class="vault-ic">${I('wallet',20)}</span><div class="t"><b>${pufAcc()?'Puffer auf '+esc(pufAcc().n):'Puffer'}</b><div class="s">${pufAcc()?(()=>{const o=pufOpen();return `Kontostand ${eur0(pufBal())} − offene Fixkosten ${eur0(o.sum)}`})():'Kein Eingangskonto festgelegt (Einstellungen › Konten)'}</div></div><div class="puf-v"><b class="${pufVal()<0?'out':''}">${eur0(pufVal())}</b><small>${showPuf?'weniger':'Details'}</small></div></div>
    <div class="bar" style="height:8px"><i style="width:${Math.max(0,Math.min(pufVal()/pufZiel()*100,100))}%;background:${pufVal()<0?'var(--bad)':'var(--ok)'}"></i></div>
    <div class="vault-f"><span>${pufVal()>pufZiel()?eur0(pufVal()-pufZiel())+' über dem Ziel':'Ziel '+eur0(pufZiel())+' · noch '+eur0(Math.max(pufZiel()-pufVal(),0))}</span><span>${pufAcc()?(()=>{const o1=usedSum([pufAcc().n],0,'Einmalig');return o1?eur0(o1)+' Einmaliges diesen Monat':''})():''}</span></div>
    ${showPuf&&pufAcc()?`<div class="pufl">${pufOpen().list.map(x=>`<span>${x.d.getDate()}.${x.d.getMonth()+1}. ${esc(x.n)}</span><b>−${eur(x.a)}</b>`).join('')||'<span>Alle Fixkosten dieses Monats sind schon gebucht.</span><b></b>'}<span><b>Puffer</b></span><b>${eur(pufVal())}</b></div>`:''}</button>
   ${showPuf&&pufAcc()&&pufVal()>0?`<button class="btn soft" id="pufMove">${I('swap',16)} Überschuss verschieben${pufExcess()?' · '+eur0(pufExcess()):''}</button>`:''}
  </div>${vaultHtml(true)}</div>
  <button class="btn soft" id="shareBtn">Mit Penny besprechen</button>`}

function miniCum(){const{p,v}=dayVals(TOTM,0),lim=budOf(TOTM),n=p.len,W=300,H=54;let c=0;const pts=[];v.forEach((x,i)=>{c+=x;if(i<p.idx)pts.push([i/(n-1)*W,H-4-c/lim*(H-8)])});
  const ideal=`M0 ${H-4} L${W} 4`,d=pts.length?'M0 '+(H-4)+' L'+pts.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' L'):'';const L=pts[pts.length-1]||[0,H-4];
  return `<svg viewBox="-4 0 ${W+8} ${H}" width="100%" height="54" aria-label="Ausgaben im Monatsverlauf" role="img" style="margin-top:6px"><path d="${ideal}" stroke="currentColor" stroke-opacity=".45" stroke-dasharray="3 4" fill="none"/>${d?`<path d="${d} L${L[0]} ${H-4}Z" fill="currentColor" fill-opacity=".18"/><path d="${d}" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="${L[0]}" cy="${L[1]}" r="4" fill="currentColor"/>`:''}</svg>
   <div style="display:flex;justify-content:space-between;font-size:11px;opacity:.8"><span>${p.s.getDate()}.${p.s.getMonth()+1}.</span><span>Linie: so viel ausgegeben · gestrichelt: Plan</span><span>${new Date(p.e-864e5).getDate()}.</span></div>`}
function viewKonto(b){if(WH(b))return `${appbar({title:esc(b),back:'back',noGear:true})}<div class="mmcard"><div class="empty">${esc(b)} ist tabu und dein Vermögen ist ausgeblendet. Einblenden unter Einstellungen › Buchen & Kategorien › Sparkonten.</div></div>`;const c=calc(b),by={};c.list.filter(e=>e.type=='out'&&e.b==b).forEach(e=>by[e.c]=(by[e.c]||0)+e.a);const cs=Object.entries(by).sort((x,y)=>y[1]-x[1]);
  const hist=[];for(let o=-5;o<=0;o++)hist.push(calc(b,o).rest);
  return `<div class="hero onbg ${swipeDir}" style="${bgStyle(b)};align-items:flex-start"><button class="hback" id="back" aria-label="Zurück zur Übersicht">‹</button>
   <div class="lbl" style="font-size:17px;font-weight:700;margin-left:40px">${esc(b)}</div><div class="bal">${eur(c.rest)}</div><div class="gsub">Kontostand heute</div>
   <div style="width:100%;color:#fff">${lineChart({n:6,series:[{pts:hist,col:'#fff',area:true,dot:true}],labels:hist.map((_,i)=>({i,t:period(i-5).s.toLocaleDateString('de-DE',{month:'short'}),on:i==5})),h:120,tipLab:i=>period(i-5).s.toLocaleDateString('de-DE',{month:'long',year:'numeric'})})}</div>
   <div style="font-size:12px;opacity:.75">‹ Wischen zum Kontowechsel ›</div></div>
  <div class="seg" id="accSw">${swL().map(x=>`<button class="${x==b?'on':''}" data-f="${x}">${esc(SHORT[x])}</button>`).join('')}</div>
  <button class="btn soft" id="kAbg" data-kb="${esc(b)}" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('check',18)}Kontostand mit Bank abgleichen</button>
  <div class="kpis"><div class="kpi">Rein<b class="in">${eur0(c.inc)}</b></div><div class="kpi">Raus<b>${eur0(c.out)}</b></div><div class="kpi">Umb. rein<b>${eur0(c.trI)}</b></div><div class="kpi">Umb. raus<b>${eur0(c.trO)}</b></div></div>
  <button class="btn soft" id="umBtn2" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('swap',18)}Von ${esc(b)} umbuchen</button>
  ${cs.length?`<div class="sec"><div class="sh">Ausgaben nach Kategorie</div><div class="group">${cs.map(([k,v])=>`<button class="cell" data-cat="${esc(k)}"><div class="ico" style="background:color-mix(in srgb,${COL[b]} 16%,transparent);color:${COL[b]}">${icoOf(b,k)}</div><div class="t"><div>${esc(k)}</div><div class="bar"><i style="width:${(v/c.out*100).toFixed(0)}%;background:${COL[b]}"></i></div></div><div class="v">${eur(v)}</div></button>`).join('')}</div></div>`:''}
  <div class="sec"><div class="sh">Buchungen diesen Monat</div></div>${txList(c.list,false)}`}
function viewDetail(b){if(isK(b))return viewKonto(b);const c=calc(b),byCat={};c.list.filter(e=>e.type=='out'&&e.b==b).forEach(e=>byCat[e.c]=(byCat[e.c]||0)+e.a);
  const cs=Object.entries(byCat).sort((x,y)=>y[1]-x[1]);
  return `<div class="hero onbg ${swipeDir} ${stat(c).k=="bad"?"sl-bad":""}" style="${bgStyle(b)}"><button class="hback" id="back" aria-label="Zurück zur Übersicht">‹</button>
   <div class="lbl" style="font-size:17px;font-weight:700;align-self:flex-start;margin-left:40px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">${b}${badge(stat(c),1)}</div>${c.stock?`<div class="grest" style="margin-top:26px">${eur(c.rest)}</div><div class="gsub">Bestand · wird nicht pro Monat gerechnet</div>`:`${gauge(c.pct,'#fff',true,c.total,stat(c).k=='bad'?'#fff':stat(c).k=='warn'?'#ffd36a':'#7dfca8',gData(b,c))}<div class="grest" style="${stat(c).k=='bad'?'color:#ffd9d6':''}">${eur(c.rest)}</div><div class="gsub">übrig · ${Math.round(c.pct*100)} % verbraucht · Strich = Plan · Tacho antippen</div>`}
   <div style="font-size:12px;opacity:.75;margin-top:4px">‹ Wischen zum Kontowechsel ›</div></div>
  <div class="seg" id="accSw">${swL().map(x=>`<button class="${x==b?'on':''}" data-f="${x}">${esc(SHORT[x])}</button>`).join('')}</div>
  ${c.stock?(()=>{const SP=sinkPot();return `<div class="kpis"><div class="kpi">Zufluss im Monat<b class="in">${eur0(c.total-c.carry-(c.st||0))}</b></div><div class="kpi">Ausgegeben im Monat<b>${eur0(c.used)}</b></div><div class="kpi">Für Ziele gebunden<b>${eur0(SP.alloc)}</b></div><div class="kpi">${SP.free<0?'Fehlt':'Frei für Sonstiges'}<b class="${SP.free<0?'out':''}">${eur0(Math.abs(SP.free))}</b></div></div>`})():`<div class="kpis"><div class="kpi">Budget<b>${eur0(c.total)}</b></div><div class="kpi">Ausgegeben<b>${eur0(c.used)}</b></div><div class="kpi">Pro Tag<b>${eur(c.tag)}</b></div><div class="kpi">Pro Woche<b>${eur0(c.woche)}</b></div></div>`}
  ${c.stock?'':`<div class="sec"><div class="sh">Verlauf diesen Monat</div>${cumChart([b],0,COL[b])}</div>`}
  ${c.inc||c.trI||c.trO||c.carry||c.st?`<div class="note">Enthält ${[c.carry&&eur(c.carry)+' Übertrag aus dem Vormonat',c.st&&eur(c.st)+' Anfangsbestand',c.inc&&eur(c.inc)+' Einnahmen',c.trI&&eur(c.trI)+' Umbuchung rein',c.trO&&eur(c.trO)+' Umbuchung raus'].filter(Boolean).join(' · ')}.</div>`:''}
  ${cs.length?`<div class="sec"><div class="sh">Nach Kategorie</div><div class="group">${cs.map(([k,v])=>`
    <button class="cell" data-cat="${esc(k)}"><div class="ico" style="background:color-mix(in srgb,${COL[b]} 16%,transparent);color:${COL[b]}">${icoOf(b,k)}</div>
    <div class="t"><div>${esc(k)}</div><div class="bar"><i style="width:${(v/c.out*100).toFixed(0)}%;background:${COL[b]}"></i></div></div>
    <div class="v">${eur(v)}<div class="s">${Math.round(v/c.out*100)} %</div></div></button>`).join('')}</div></div>`:''}
  ${b=='Sinking Funds'?goalsHtml():''}
  <div class="sec"><div class="sh">Buchungen</div></div>${txList(c.list,false)}`}

let listV='Täglich',calDay=null,wk=null,tflt='Alle';const LV=['Täglich','Woche','Monat','Summe'];
const WDS=['So','Mo','Di','Mi','Do','Fr','Sa'];
function mmRow(e){if(ruHide(e))return '';return swWrap(e.id,mmRow0(e))}
function mmRow0(e){const col=COL[e.b],tr=e.type=='tr',cls=e.type=='in'?'in':tr?'trc':'out';
  return `<button class="mmrow" data-id="${e.id}"><span class="mmcat">${(!tr&&bTile(e,'span',catCol(e.c),icoOf(e.b,e.c)))||`<span class="ico" style="background:color-mix(in srgb,${tr?col:catCol(e.c)} 20%,transparent);color:${tr?col:catCol(e.c)}">${tr?I('swap'):icoOf(e.b,e.c)}</span>`}<span class="mmcl" style="--cc:${tr?col:catCol(e.c)}">${esc(tr?'Umbuchung':e.c)}${e.sc?'<br><small>'+esc(e.sc)+'</small>':''}</span></span>
   <span class="mmnote"><span>${isPlan(e)?`<span class="pl">${new Date(e.t).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}</span>`:''}${esc(e.n||e.c||'Umbuchung')}${e.img||e.doc?' '+I('export',12):''}</span><small>${tr?esc(SHORT[e.b])+' → '+esc(SHORT[e.to]):esc(e.b)+(e.p?' · mit '+esc(e.p):'')+(e.rid?' · wiederkehrend':'')}${ruA(e)?` · ${eur(e.a)} + ${eur(ruA(e))} Wechselgeld → ${esc((t=>t?ruLab(t.to,t.dep):'')(S.exp.find(x=>x.id==e.ru)))}`:''}</small>${adjTag(e)}${e.ovr?`<span class="ovrb">${I('lock',11)} Notfallbremse gelöst: „${esc(e.ovr.reason)}“</span>`:''}${e.tg&&e.tg.length?`<span class="tags">${e.tg.map(t=>'#'+esc(t)).join(' ')}</span>`:''}</span>
   <span class="amt ${cls}">${e.type=='in'?'':tr?'':'−'}${eur(e.a+ruA(e))}</span></button>`}
function recVirt(fromT,toT){const out=[],nowT=Date.now();for(let k=-1;k<=13;k++){const p=period(k);if(p.e.getTime()<=fromT||p.s.getTime()>=toT)continue;const pk=pkey(p);
  (S.rec||[]).forEach(r=>{if(r.paused)return;const d=recDue(r,p);if(!d)return;const t=d.getTime();if(t<=nowT||t<fromT||t>=toT)return;if(S.exp.some(e=>e.rid==r.id&&e.pk==pk))return;
   const v=recView(r,p);out.push({id:'v_'+r.id+'_'+pk,type:r.type,b:r.b,to:r.to,c:r.c||'',a:v.a,n:r.n,t,rid:r.id,pk,virt:true,alloc:r.alloc,adj:v.kind?v:null})})}return out}
const expV=(fromT,toT)=>S.exp.concat(recVirt(fromT,toT));
function openVirt(id){const v=recVirt(0,9e15).find(x=>x.id==id);if(!v)return;openSheet(null,{type:v.type,b:v.b,to:v.to||ALL.find(a=>a!=v.b),c:v.c,amt:String(v.a),n:v.n,dt:ymd(v.t),rid:v.rid,pk:v.pk,alloc:v.alloc,adj:v.adj})}
/* v244: Geplante Buchungen eingeklappt, Liste startet oben (kein Sprung, der den Kopf abschneidet) */let planOpen=false;
function dayBlocks(L,parts){const fut=L.filter(isPlan);L=L.filter(e=>!isPlan(e));const planH=fut.length?`<div class="mmcard plan"><div class="dayh"><span class="dnum" style="font-size:15px">Geplant</span><span></span><span class="my">${fut.length} zukünftige Buchungen${fut.some(e=>e.virt)?' inkl. wiederkehrender':''} · zählen erst am Tag selbst</span><span class="in">${eur(fut.filter(e=>e.type=='in').reduce((s,e)=>s+e.a,0))}</span><span class="out">${eur(fut.filter(e=>e.type=='out').reduce((s,e)=>s+e.a,0))}</span></div>${planOpen?fut.sort((a,b)=>b.t-a.t).map(e=>e.virt?mmRow0(e):mmRow(e)).join(''):''}<button class="link" id="planTg" style="padding:8px 16px 12px">${planOpen?'Geplante einklappen':'Geplante anzeigen ›'}</button></div>`:'';
  const td=new Date(),noToday=tab=='list'&&off==0&&!L.some(e=>new Date(e.t).toDateString()==td.toDateString()),todayH=noToday?`<div class="mmcard"><div class="dayh"><span class="dnum">${td.getDate()}</span><span class="wd ${td.getDay()==0?'sun':td.getDay()==6?'sat':''}">${WDS[td.getDay()]}</span><span class="my">${String(td.getMonth()+1).padStart(2,'0')}.${td.getFullYear()} · Heute</span><span></span><span></span></div><div class="empty" style="padding:10px 16px">Heute noch nichts gebucht.</div></div>`:'';
  const rest=todayH+(L.length||!fut.length?dayBlocks0(L):'');return parts?[planH,rest]:planH+rest}
function dayBlocks0(L){if(!L.length)return '<div class="mmcard"><div class="empty">Keine Buchungen.</div></div>';
  const by={};L.slice().sort((a,b)=>b.t-a.t).forEach(e=>{const k=new Date(e.t).toDateString();(by[k]=by[k]||[]).push(e)});
  let hs=false;const ht=histT();return Object.entries(by).map(([k,es])=>{const d=new Date(k),inc=es.filter(e=>e.type=='in').reduce((s,e)=>s+e.a,0),out=es.filter(e=>e.type=='out').reduce((s,e)=>s+e.a+ruA(e),0),we=d.getDay();
    const hh=d.getTime()<ht,sep=hh&&!hs?(hs=true,`<div class="histsep">Vor dem ${new Date(ht).toLocaleDateString('de-DE')} · historisch, zählt nicht in Auswertungen</div>`):'';
    return sep+`<div class="mmcard${hh?' hist':''}"><div class="dayh"><span class="dnum">${d.getDate()}</span><span class="wd ${we==0?'sun':we==6?'sat':''}">${WDS[we]}</span><span class="my">${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}${d.toDateString()==now.toDateString()?' · Heute':''}</span>
     <span class="in">${inc?eur(inc):''}</span><span class="out">${out?eur(out):''}</span></div>${es.map(mmRow).join('')}</div>`}).join('')}
const kw=d=>{const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y)/864e5+1)/7)};
function viewSumme(p){const L=S.exp.filter(e=>inP(e,p)),pp=period(off-1),LP=S.exp.filter(e=>inP(e,pp));
  const s=(A,t)=>A.filter(e=>e.type==t).reduce((q,e)=>q+e.a,0),ci=s(L,'in'),co=s(L,'out'),pi=s(LP,'in'),po=s(LP,'out');
  const ch=(a,b)=>b?Math.round((a-b)/b*100):0,byA={},trs={};L.filter(e=>e.type=='out').forEach(e=>byA[e.b]=(byA[e.b]||0)+e.a);
  L.filter(e=>e.type=='tr').forEach(e=>{const k=e.b+' → '+e.to;trs[k]=(trs[k]||0)+e.a});const mxA=Math.max(...Object.values(byA),1);
  return `<div class="sec"><div class="sh">Budgetstatus</div><div class="mmcard">${BUDG.map(b=>{const c=calc(b,off),st=stat(c);return `<div class="srow"><div class="srow-h"><span>${esc(b)}</span>${badge(st)}<span class="${st.k=='bad'?'out':''}">${eur(c.used)} / ${eur0(c.total)}</span></div>
    <div class="bar" style="height:8px"><i style="width:${Math.min(c.pct*100,100).toFixed(0)}%;background:${st.k=='bad'?'var(--bad)':st.k=='warn'?'var(--warn)':COL[b]}"></i></div></div>`}).join('')}</div></div>
  <div class="sec"><div class="sh">Vergleich zum Vormonat</div><div class="mmcard"><div class="cmp"><span></span><b>${p.s.toLocaleDateString('de-DE',{month:'short'})}</b><b>${pp.s.toLocaleDateString('de-DE',{month:'short'})}</b><b>Änderung</b>
    <span>Einnahmen</span><span class="in">${eur0(ci)}</span><span>${eur0(pi)}</span><span>${pi?(ch(ci,pi)>0?'+':'')+ch(ci,pi)+' %':'–'}</span>
    <span>Ausgaben</span><span class="out">${eur0(co)}</span><span>${eur0(po)}</span><span class="${ch(co,po)>0?'out':'in'}">${po?(ch(co,po)>0?'+':'')+ch(co,po)+' %':'–'}</span></div></div>
    ${off==0?'<div class="note">Der laufende Monat ist noch nicht vorbei.</div>':''}</div>
  <div class="sec"><div class="sh">Ausgaben nach Konto</div><div class="mmcard">${Object.entries(byA).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="srow"><div class="srow-h"><span>${esc(k)}</span><span></span><span class="out">${eur(v)}</span></div><div class="bar" style="height:6px"><i style="width:${(v/mxA*100).toFixed(0)}%;background:${COL[k]||'var(--muted)'}"></i></div></div>`).join('')||'<div class="empty">Keine Ausgaben.</div>'}</div></div>
  ${Object.keys(trs).length?`<div class="sec"><div class="sh">Umbuchungen</div><div class="mmcard">${Object.entries(trs).map(([k,v])=>`<div class="srow"><div class="srow-h"><span>${esc(k)}</span><span></span><span>${eur(v)}</span></div></div>`).join('')}</div></div>`:''}
  <button class="btn soft" id="csvMonth">Diesen Monat als CSV kopieren</button><div class="note" id="csvMsg"></div><textarea class="box" id="csvOut" hidden readonly></textarea>`}
function viewCal(){const p=period(off),ALLX=expV(p.s.getTime()-8*864e5,p.e.getTime()+15*864e5),L=ALLX.filter(e=>inP(e,p)&&(off>0||!isPlan(e))&&(flt=='Alle'||e.b==flt||e.to==flt)),tflt='Alle';
  const out=L.filter(e=>e.type=='out'&&!e.corr).reduce((s,e)=>s+e.a,0),inc=L.filter(e=>e.type=='in'&&!e.corr).reduce((s,e)=>s+e.a,0);
  const sum=(i,o)=>`<div class="mmsum strip"><div>Einnahmen<b class="in">${eur(i)}</b></div><div>Ausgaben<b class="out">${eur(o)}</b></div><div>Einnahmen − Ausgaben<b class="${i-o<0?'out':''}">${eur(i-o)}</b></div></div>`;
  const head=appbar({title:'Kalender',month:true,left:`<button class="ab-ic ${showF||flt!='Alle'?'act':''}" id="fBtn" aria-label="Konto filtern">${I('filter',21)}</button><button class="ab-ic vsw" data-tabgo="list" aria-label="Listenansicht" title="Liste">${I('list',21)}</button>`});
const DOTC=['#3b8fd9','#f25c54','#a06bf2','#2fc4a3','#f0a12d','#e56bb0','#5fb35a','#8a8f98'];
    const dc=s=>{let x=0;for(const ch of s)x=(x*31+ch.charCodeAt(0))>>>0;return DOTC[x%DOTC.length]};
    const lead=(p.s.getDay()+6)%7,tot=Math.ceil((lead+p.len)/7)*7,cells=[];
    const nf=v=>{const A=Math.abs(v);return A>=1e4?Math.round(v/1e3).toLocaleString('de-DE')+'\u00a0T':v.toLocaleString('de-DE',A>=100?{maximumFractionDigits:0}:{minimumFractionDigits:2,maximumFractionDigits:2})};
    for(let i=0;i<tot;i++){const d=new Date(p.s.getFullYear(),p.s.getMonth(),p.s.getDate()-lead+i),ds=d.toDateString(),inM=d>=p.s&&d<p.e;
      const es=ALLX.filter(e=>new Date(e.t).toDateString()==ds&&(flt=='Alle'||e.b==flt||e.to==flt)&&(tflt=='Alle'||e.type==tflt));
      const ci=es.filter(e=>e.type=='in').reduce((s,e)=>s+e.a,0),co=es.filter(e=>e.type=='out').reduce((s,e)=>s+e.a,0),wd=d.getDay();
      const cs=[...new Set(es.filter(e=>e.type!='tr').map(e=>e.c))],dots=cs.slice(0,4).map(c=>`<i style="background:${dc(c)}"></i>`).join('')+(cs.length>4?`<em>+${cs.length-4}</em>`:'')+(es.some(e=>e.type=='tr')?`<i class="trd"></i>`:'');
      const lab=d.getDate()==1||i==0?`${d.getDate()}.${d.getMonth()+1}.`:d.getDate();
      const ovd=es.some(e=>e.ovr),fut=es.length&&es.every(isPlan),jd=(S.journal||[]).filter(j=>new Date(j.t).toDateString()==ds);
      cells.push(`<button class="cc2 ${fut?'futd':''} ${ovd?'ovd':''} ${inM?'':'out-m'} ${ds==now.toDateString()?'today':''} ${calDay==ds?'sel':''}" data-day="${ds}" aria-label="${d.toLocaleDateString('de-DE')}">
        <span class="cd ${wd==0?'sun':wd==6?'sat':''}">${lab}</span>${ovd?`<span class="ovi" title="Notfallbremse gelöst">${I('lock',10)}</span>`:''}${inM&&!fut&&nsDay(d)?'<span class="nsd" title="Ausgabenfreier Tag"></span>':''}${jd.length?`<span class="jdi ${jd.some(j=>j.out=='bought')?'b':''}" title="Journal">${I('pen',9)}</span>`:''}<span class="dots">${dots}</span>
        <span class="nums">${ci?`<span class="in">${nf(ci)}</span>`:''}${co?`<span class="out">${nf(co)}</span>`:''}${ci&&co?`<span class="tt">${nf(ci-co)}</span>`:''}</span></button>`)}
    const sel=calDay?ALLX.filter(e=>new Date(e.t).toDateString()==calDay&&(flt=='Alle'||e.b==flt||e.to==flt)&&(tflt=='Alle'||e.type==tflt)):null;
    return head+sum(inc,out)+`${showF||flt!='Alle'?`${fltSeg()}`:''}
    <div class="cal2"><div class="calh2">${['Mo','Di','Mi','Do','Fr','Sa','So'].map((w,i)=>`<span class="${i==6?'sun':i==5?'sat':''}">${w}</span>`).join('')}</div><div class="calg2">${cells.join('')}</div></div>
    <div class="legend"><span><i style="background:var(--in)"></i>Einnahmen</span><span><i style="background:var(--out)"></i>Ausgaben</span><span><i style="background:var(--fg)"></i>Einnahmen − Ausgaben</span><span>Punkte = Kategorien</span><span style="font-style:italic">kursiv = geplant</span><span style="color:var(--bad)">${I('lock',11)} = Notfallbremse gelöst</span><span style="color:var(--accent)">${I('pen',11)} = Journal</span></div>
    ${sel?`<button class="btn soft" id="calAdd" data-dt="${calDay}">+ Buchung am ${new Date(calDay).toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'})}</button>`+(()=>{const jd=(S.journal||[]).filter(j=>new Date(j.t).toDateString()==calDay).sort((a,b)=>a.t-b.t);return jd.length?`<div class="sec"><div class="sh">Journal</div><div class="mmcard">${jd.map(jRow).join('')}</div></div>`:''})()+dayBlocks(sel):''}`}
function viewList(){const p=period(off);let L=expV(p.s.getTime(),p.e.getTime()).filter(e=>inP(e,p));
  if(flt!='Alle')L=L.filter(e=>e.b==flt||e.to==flt);
  if(q){const s=q.toLowerCase().replace(/^#/,'');L=L.filter(e=>[e.n,e.c,e.p,e.b,e.sc,(e.tg||[]).join(' ')].join(' ').toLowerCase().includes(s)||String(e.a).includes(s.replace(',','.')))}
  if(tflt!='Alle')L=L.filter(e=>e.type==tflt);
  const nH=L.filter(isHistE).length;if(!S.histShow)L=L.filter(e=>!isHistE(e));const hbar=nH?`<button class="chip histtg" id="histTg">${I('calendar',13)} ${S.histShow?'Historie ausblenden':'Historie zeigen ('+nH+')'}</button>`:'';
  const LW=wk?L.filter(e=>e.t>=wk[0]&&e.t<wk[1]):L;
  const LA=off>0?LW:LW.filter(e=>!isPlan(e)),out=LA.filter(e=>e.type=='out').reduce((s,e)=>s+e.a,0),inc=LA.filter(e=>e.type=='in').reduce((s,e)=>s+e.a,0);
  const fAct=flt!='Alle'||tflt!='Alle'||!!q||!!wk;
  const bal=inc-out;const head=appbar({title:'Buchungen',month:true,right:`<span class="hc-cx ${bal<0?'out':'in'}" title="Einnahmen − Ausgaben">${eur(bal)}</span>`,left:`<button class="ab-ic ${showF||fAct?'act':''}" id="fBtn" aria-label="Suchen und filtern">${I('search',21)}</button>${featOn('cal')?`<button class="ab-ic vsw" data-tabgo="cal" aria-label="Kalenderansicht" title="Kalender">${I('calendar',21)}</button>`:''}`,tabs:{id:'listV',cur:listV,items:LV.map(x=>[x,x])}});
  const sum=(i,o)=>`<div class="mmsum strip"><div>Einnahmen${off>0?' geplant':''}<b class="in">${eur(i)}</b></div><div>Ausgaben${off>0?' geplant':''}<b class="out">${eur(o)}</b></div><div>Einnahmen − Ausgaben<b class="${i-o<0?'out':''}">${eur(i-o)}</b></div></div>`;
  const filt=!(showF||fAct)?'':`<div class="fpanel"><label class="search" for="q">${I('search',17)}<input id="q" type="search" placeholder="Suchen: Notiz, Kategorie, Person, Betrag" value="${esc(q)}"></label>
  ${fltSeg()}
  <div class="seg" id="tflt">${[['Alle','Alle Arten'],['out','Ausgaben'],['in','Einnahmen'],['tr','Umbuchungen']].map(x=>`<button class="${tflt==x[0]?'on':''}" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>
  ${wk?`<button class="chip" id="wkClr" style="align-self:flex-start">Woche ${new Date(wk[0]).toLocaleDateString('de-DE',{day:'numeric',month:'short'})} – ${new Date(wk[1]-864e5).toLocaleDateString('de-DE',{day:'numeric',month:'short'})} ✕</button>`:''}${fAct?'<button class="link" id="fClr" style="align-self:flex-start">Filter zurücksetzen</button>':''}</div>`;
  if(listV=='Woche'){const ws=[];let s=new Date(p.s);s=new Date(s.getFullYear(),s.getMonth(),s.getDate()-((s.getDay()+6)%7));
    while(s<p.e){const e=new Date(s.getFullYear(),s.getMonth(),s.getDate()+7),a0=Math.max(s,p.s),a1=Math.min(e,p.e),LL=L.filter(x=>x.t>=a0&&x.t<a1);
      ws.push({a0,a1,i:LL.filter(x=>x.type=='in').reduce((q,x)=>q+x.a,0),x:LL.filter(x=>x.type=='out').reduce((q,x)=>q+x.a,0),cur:now>=s&&now<e});s=e}
    const mx=Math.max(...ws.map(w=>Math.max(w.i,w.x)),1),wb=budOf(TOTM)*7/p.len;
    return head+sum(inc,out)+`<div class="mmcard">${ws.map(w=>`<button class="mrow ${w.cur?'curw':''}" data-wk="${w.a0},${w.a1}"><span class="mlab"><b>${new Date(w.a0).getDate()}.–${new Date(w.a1-864e5).getDate()}.</b><small>${w.cur?'diese Woche':'KW '+kw(new Date(w.a0))}</small></span>
     <span class="mbars"><i class="in" style="width:${(w.i/mx*100).toFixed(1)}%"></i><i class="out" style="width:${(w.x/mx*100).toFixed(1)}%"></i></span>
     <span class="mval"><span class="in">${eur0(w.i)}</span><span class="out">${eur0(w.x)}</span></span></button>`).join('')}</div>
    `}
  if(listV=='Summe')return head+viewSumme(p);
  if(listV=='Monat'){const rows=[];for(let i=0;i<12;i++){const o=off-i,pp=period(o),LL=S.exp.filter(e=>inP(e,pp)&&(flt=='Alle'||e.b==flt));
      rows.push({o,pp,i:LL.filter(e=>e.type=='in').reduce((s,e)=>s+e.a,0),x:LL.filter(e=>e.type=='out').reduce((s,e)=>s+e.a,0)})}
    const mx=Math.max(...rows.map(r=>Math.max(r.i,r.x)),1);
    return head+`${fltSeg()}
    <div class="mmcard">${rows.map(r=>`<button class="mrow" data-mo="${r.o}"><span class="mlab"><b>${r.pp.s.toLocaleDateString('de-DE',{month:'short'})}</b><small>${r.pp.s.getFullYear()}</small></span>
     <span class="mbars"><i class="in" style="width:${(r.i/mx*100).toFixed(1)}%"></i><i class="out" style="width:${(r.x/mx*100).toFixed(1)}%"></i></span>
     <span class="mval"><span class="in">${eur0(r.i)}</span><span class="out">${eur0(r.x)}</span><span class="${r.i-r.x<0?'out':''}" style="font-weight:600">${eur0(r.i-r.x)}</span></span></button>`).join('')}</div>`}
  const [ph,rest]=dayBlocks(LW,1);return head+`<div class="lsplit"><aside class="lside">${sum(inc,out)+filt+hbar+ph}</aside><div class="days">${rest}</div></div>${toolBar(['shop','refund','docs','tax'])}`}
function donut(parts){const tot=parts.reduce((s,x)=>s+x.v,0);if(!tot)return '<div class="empty">Keine Ausgaben in diesem Zeitraum.</div>';
  let a=-Math.PI/2,paths='';const R=70,r=44,c=90;
  parts.forEach(x=>{const f=x.v/tot,a2=a+f*Math.PI*2-.0001,lg=f>.5?1:0;
    const p=(ang,rr)=>`${(c+rr*Math.cos(ang)).toFixed(2)} ${(c+rr*Math.sin(ang)).toFixed(2)}`;
    paths+=`<path d="M${p(a,R)} A${R} ${R} 0 ${lg} 1 ${p(a2,R)} L${p(a2,r)} A${r} ${r} 0 ${lg} 0 ${p(a,r)}Z" fill="${x.col}" stroke="var(--card)" stroke-width="1.5" style="cursor:pointer" data-tip="${esc(tcHead(esc(x.k||''))+tcRow('',x.v,'')+`<span class="tr">${Math.round(f*100)} %</span>`)}"/>`;a=a2});
  return `<svg viewBox="0 0 180 180" style="max-width:220px;display:block;margin:0 auto" role="img" aria-label="Ausgaben nach Kategorie">${paths}
   <text x="90" y="86" text-anchor="middle" font-size="11" style="fill:var(--muted)">Ausgaben</text><text x="90" y="104" text-anchor="middle" font-size="16" font-weight="700">${eur0(tot)}</text></svg>`}
const nice=v=>{v=Math.max(v,1);const m=Math.pow(10,Math.floor(Math.log10(v)));const f=v/m;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*m};
const eyeBtn=()=>S.showWealth?'':`<button class="eyeb" data-eye aria-label="${depShow?'Werte verbergen':'Werte anzeigen'}" title="${depShow?'Werte verbergen':'Werte für diesen Besuch anzeigen'}">${I(depShow?'eyeoff':'eye',18)}</button>`;
const axf=v=>(Math.abs(v)>=1e6?(v/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio':Math.abs(v)>=1000?(v/1000).toLocaleString('de-DE',{maximumFractionDigits:1})+'k':Math.round(v).toLocaleString('de-DE'))+' €';
/* Doppeltipp an den oberen Bildschirmrand → nach oben scrollen (Seite bzw. offenes Fenster) */
(()=>{let lastT=0,lastY=0;const sa=()=>{const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat'))||0;return Math.max(v,0)},zone=()=>Math.max(sa(),20)+16;
  const toTop=()=>{const top=[...document.querySelectorAll('#sheetRoot .sheet-b,#asstRoot .ash-b,.asst-b')].filter(el=>el.scrollTop>0),main=[...document.querySelectorAll('.mm,#app,main')].filter(el=>el.scrollTop>0);(top.length?top:main).forEach(el=>el.scrollTo({top:0,behavior:'smooth'}));if(!top.length)window.scrollTo({top:0,behavior:'smooth'});try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}};
  document.addEventListener('touchend',e=>{const t=e.changedTouches&&e.changedTouches[0];if(!t||t.clientY>zone()){lastT=0;return}const now0=Date.now();if(now0-lastT<380&&Math.abs(t.clientY-lastY)<30){lastT=0;toTop()}else{lastT=now0;lastY=t.clientY}},{passive:true});
  document.addEventListener('dblclick',e=>{if(e.clientY<=zone())toTop()})})();
/* Zwei-Finger-Zoom sperren (iOS) */
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});
const kfmt=v=>Math.abs(v)>=1e6?(v/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio':Math.abs(v)>=1000?(v/1000).toLocaleString('de-DE',{maximumFractionDigits:1})+'k':Math.round(v);
const TCR={};let tcN=0,tcCur=null,tcDrag=false;
const tcHead=t=>t?`<span class="th">${t}</span>`:'',tcRow=(n,v,c,mask)=>`<span class="tr">${c?`<i style="background:${c}"></i>`:''}${n?esc(n)+' ':''}<b>${mask?'•••':(typeof v=='number'?eur(v):v)}</b></span>`;
function tcWrap(svg,o){const id='tc'+(++tcN);TCR[id]=o;const k=Object.keys(TCR);if(k.length>400)delete TCR[k[0]];return `<div class="tc" data-tc="${id}">${svg}<div class="tc-g"></div></div>`}
function tcPill(){let p=document.getElementById('tcPill');if(!p){p=document.createElement('div');p.id='tcPill';p.setAttribute('role','status');document.body.appendChild(p)}return p}
function tcPlace(html,x,y,yb){const p=tcPill();p.innerHTML=html;p.style.display='flex';const w=p.offsetWidth,h=p.offsetHeight;let l=Math.max(8,Math.min(innerWidth-w-8,x-w/2)),t=y-h-10;if(t<8)t=(yb||y)+(yb?8:18);p.style.left=l+'px';p.style.top=t+'px'}
function tcHide(){const p=document.getElementById('tcPill');if(p)p.style.display='none';document.querySelectorAll('.gmk').forEach(k=>k.style.display='none');document.querySelectorAll('.tc-g').forEach(g=>g.style.display='none');tcCur=null}
function tcShow(el,cx,cy){const o=TCR[el.dataset.tc];if(!o)return;const svg=el.querySelector('svg');if(!svg)return;const r=svg.getBoundingClientRect(),sc=Math.min(r.width/o.W,r.height/o.H),ox=r.left+(r.width-o.W*sc)/2,oy=r.top+(r.height-o.H*sc)/2,vx=(cx-ox)/sc,vy=(cy-oy)/sc,P=o.ys||o.xs,vv=o.ys?vy:vx;
  let bi=-1,bd=1e9;P.forEach((x,i)=>{if(typeof o.tips!='function'&&o.tips[i]==null)return;const d=Math.abs(x-vv);if(d<bd){bd=d;bi=i}});if(bi<0){tcHide();return}
  document.querySelectorAll('.tc-g').forEach(g=>{if(!el.contains(g))g.style.display='none'});
  const g=el.querySelector('.tc-g'),er=el.getBoundingClientRect(),bw=(o.bw||0)*sc;let px,py;
  if(o.ys){const gy=oy+o.ys[bi]*sc;g.style.cssText=`display:block;left:${ox-er.left}px;width:${o.W*sc}px;top:${gy-er.top-bw/2-3}px;height:${bw+6}px`;g.className='tc-g band';px=cx;py=gy-bw/2}
  else{const gx=ox+o.xs[bi]*sc;g.style.cssText=`display:block;left:${gx-er.left-(bw?bw/2+2:1)}px;width:${bw?bw+4:2}px;top:${oy+o.y1*sc-er.top}px;height:${(o.y0-o.y1)*sc}px`;g.className='tc-g'+(bw?' band':'');px=gx;py=oy+o.y1*sc}
  tcPlace(typeof o.tips=='function'?o.tips(bi):o.tips[bi],px,py);tcCur=el;if(o.pick)try{o.pick(bi)}catch(e){}}
function barTip(bar){if(bar.dataset.tip)return bar.dataset.tip;const row=bar.closest('.cell,.srow,.dep,.slide,.card,button,li')||bar.parentElement;
  const lab=row.querySelector('.t>div:first-child,.srow-h>span:first-child,.lbl,.t b,b,strong');const lt=lab?lab.textContent.trim().slice(0,40):'';
  let am='';const walk=n=>{if(am||n===bar||bar.contains(n))return;if(n.nodeType==3){const m=n.textContent.match(/[−+-]?\s?\d[\d.]*(,\d+)?\s?€/);if(m&&!(lab&&lab.contains(n)))am=m[0]}else n.childNodes.forEach(walk)};walk(row);
  const i=bar.querySelector('i');const pc=i?parseFloat(i.style.width||i.dataset.to||'0'):0;
  return tcHead(esc(lt))+(am?`<span class="tr"><b>${esc(am)}</b></span>`:'')+`<span class="tr">${Math.round(pc)} %</span>`}
function tcInit(){if(window.__tc)return;window.__tc=1;
  const hit=(x,y)=>{for(const dy of [0,-7,7,-13,13]){const e=document.elementFromPoint(x,y+dy);const b=e&&e.closest&&e.closest('.bar,.sbar');if(b)return b}return null};
  document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.tc');if(t){tcDrag=true;tcShow(t,e.clientX,e.clientY);return}
    const gg=e.target.closest&&e.target.closest('svg.gg');if(gg){const g=JSON.parse(gg.dataset.g),m=gg.getScreenCTM().inverse(),pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(m),dx=pt.x-100,dy=92-pt.y,rr=Math.hypot(dx,dy);
      const again=window.__gOpen===gg&&document.getElementById('tcPill')&&document.getElementById('tcPill').style.display!='none';
      let f=rr<38?null:Math.max(0,Math.min(1,1-Math.atan2(Math.max(dy,0),dx)/Math.PI));const today=g.idx>0&&g.idx<=g.len?g.idx:g.len,d=f==null?today:Math.max(1,Math.min(g.len,Math.ceil((1-f)*g.len)));
      if(again&&f==null){window.__gOpen=null;window.__tcBar=null;tcHide();return}
      tcHide();const k=gg.querySelector('.gmk');if(k){const a=Math.PI*(d-.5)/g.len,r1=60,r2=96;k.setAttribute('x1',(100+r1*Math.cos(a)).toFixed(1));k.setAttribute('y1',(92-r1*Math.sin(a)).toFixed(1));k.setAttribute('x2',(100+r2*Math.cos(a)).toFixed(1));k.setAttribute('y2',(92-r2*Math.sin(a)).toFixed(1));k.style.display=''}
      const br=gg.getBoundingClientRect();tcPlace(gTip(g,d),br.left+br.width/2,br.top+4,br.bottom);tcCur=gg;window.__gOpen=gg;window.__tcBar=gg;return}
    const d=e.target.closest&&e.target.closest('[data-tip]:not(.bar)');if(d&&d.closest('svg')){tcHide();tcPlace(d.dataset.tip,e.clientX,e.clientY);tcCur=d;return}
    const b=hit(e.clientX,e.clientY);if(b){const r=b.getBoundingClientRect();tcHide();tcPlace(barTip(b),Math.max(r.left,Math.min(r.right,e.clientX)),r.top);tcCur=b;window.__tcBar=b;return}tcHide()},true);
  document.addEventListener('click',e=>{if(window.__tcBar&&(window.__tcBar.classList.contains('gg')?e.target.closest&&e.target.closest('svg.gg'):hit(e.clientX,e.clientY))){e.stopPropagation();e.preventDefault()}window.__tcBar=null},true);
  document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.tc');if(t&&(tcDrag||e.pointerType=='mouse'))tcShow(t,e.clientX,e.clientY);else if(e.pointerType=='mouse'&&tcCur&&tcCur.classList&&tcCur.classList.contains('tc')&&!tcDrag)tcHide()},{passive:true});
  document.addEventListener('pointerup',()=>tcDrag=false);document.addEventListener('pointercancel',()=>tcDrag=false);
  addEventListener('scroll',()=>{if(tcCur)tcHide()},{passive:true,capture:true});addEventListener('resize',tcHide)}
function lineChart({series,n,labels,refs=[],h=170,w=330,top,tipLab,tips,marks,pick,tipAdd,fit}){const W=w,H=h,x0=34,x1=W-10,y0=H-22,yt=14;
  const allv=series.flatMap(s=>s.pts.filter(v=>v!=null)),mn0=Math.min(0,...allv);let mn=mn0<0?-nice(-mn0*1.05):0,mx=top||nice(Math.max(1,...allv,...refs.map(r=>r.v))*1.05),fst=0;
  if(fit&&allv.length){const lo=Math.min(...allv),hi=Math.max(...allv),sp=(hi-lo)||Math.abs(hi)*.1||1;fst=nice(sp/2)||1;mn=Math.floor((lo-sp*.08)/fst)*fst;mx=Math.ceil((hi+sp*.08)/fst)*fst;if(lo>=0&&mn<0)mn=0;if(mx<=mn)mx=mn+fst}
  const yl=v=>fit?(fst<1?v.toLocaleString('de-DE',{maximumFractionDigits:2})+' €':axf(v)):kfmt(v);
  const sx=i=>x0+(n<=1?0:i/(n-1)*(x1-x0)),sy=v=>y0-(v-mn)/(mx-mn)*(y0-yt);let g='';
  (fit?Array.from({length:Math.round((mx-mn)/fst)+1},(_,j)=>mn+j*fst):mn<0?[mn,0,mx]:[0,.5*mx,mx]).forEach(v=>{g+=`<line x1="${x0}" x2="${x1}" y1="${sy(v).toFixed(1)}" y2="${sy(v).toFixed(1)}" stroke="var(--sep)" stroke-width=".7"/><text x="${x0-5}" y="${(sy(v)+3).toFixed(1)}" text-anchor="end" font-size="9" style="fill:var(--muted)">${yl(v)}</text>`});
  refs.forEach(r=>g+=`<line x1="${x0}" x2="${x1}" y1="${sy(r.v).toFixed(1)}" y2="${sy(r.v).toFixed(1)}" stroke="${r.col}" stroke-dasharray="4 3" stroke-width="1.2"/><text x="${x1}" y="${(sy(r.v)-4).toFixed(1)}" text-anchor="end" font-size="9" style="fill:${r.col}">${r.label}</text>`);
  series.forEach(s=>{const P=s.pts.map((v,i)=>v==null?null:[sx(i),sy(v)]).filter(Boolean);if(!P.length)return;
    const d='M'+P.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
    if(s.area)g+=`<path d="${d} L${P[P.length-1][0].toFixed(1)} ${sy(Math.max(0,mn)).toFixed(1)} L${P[0][0].toFixed(1)} ${sy(Math.max(0,mn)).toFixed(1)}Z" fill="${s.col}" opacity=".16"/>`;
    g+=`<path d="${d}" fill="none" stroke="${s.col}" stroke-width="${s.w||2.2}" stroke-linejoin="round" stroke-linecap="round" ${s.dash?`stroke-dasharray="${s.dash}"`:''} opacity="${s.op||1}"/>`;
    if(s.dot){const L=P[P.length-1];g+=`<circle cx="${L[0].toFixed(1)}" cy="${L[1].toFixed(1)}" r="4" fill="${s.col}" stroke="var(--card)" stroke-width="2"/>`}});
  (marks||[]).forEach(m=>{const cx=sx(m.i),cy=sy(m.v);g+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${m.r||5}" fill="${m.col}" stroke="var(--card)" stroke-width="2"/>`;if(m.n>1)g+=`<text x="${cx.toFixed(1)}" y="${(cy-9).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" style="fill:${m.col}">${m.n}</text>`});
  labels.forEach(l=>g+=`<text x="${sx(l.i).toFixed(1)}" y="${H-6}" text-anchor="${n>1&&l.i==0?'start':n>1&&l.i==n-1?'end':'middle'}" font-size="10" style="fill:${l.on?'var(--fg)':'var(--muted)'}" font-weight="${l.on?700:400}">${l.t}</text>`);
  const TL=i=>tipLab?tipLab(i):((labels.find(l=>l.i==i)||{}).t||''),named=series.filter(s=>s.name),main=series.find(s=>s.dot||s.area)||series[series.length-1];
  const tp=tips||Array.from({length:n},(_,i)=>{const rows=(named.length?named:[main]).filter(s=>s.pts[i]!=null).map(s=>tcRow(s.name||'',s.pts[i],named.length>1?s.col:''));return rows.length?tcHead(TL(i))+rows.join('')+(tipAdd?tipAdd(i)||'':''):null});
  return tcWrap(`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${g}</svg>`,{W,H,xs:Array.from({length:n},(_,i)=>sx(i)),tips:tp,y0,y1:yt,pick})}
function barChart({vals,labels,ref,col,hi,h=150,top,flat,tipLab,tipName}){const W=330,H=h,x0=34,x1=W-6,y0=H-20,yt=12,n=vals.length;
  const mx=top||nice(Math.max(1,...vals,ref?ref.v:0)*1.08),sy=v=>y0-v/mx*(y0-yt),gw=(x1-x0)/n,bw=Math.max(2,gw*.62);let g='';
  [0,.5,1].forEach(f=>{const v=mx*f;g+=`<line x1="${x0}" x2="${x1}" y1="${sy(v).toFixed(1)}" y2="${sy(v).toFixed(1)}" stroke="var(--sep)" stroke-width=".7"/><text x="${x0-5}" y="${(sy(v)+3).toFixed(1)}" text-anchor="end" font-size="9" style="fill:var(--muted)">${kfmt(v)}</text>`});
  vals.forEach((v,i)=>{if(v<=0)return;const x=x0+i*gw+(gw-bw)/2,over=ref&&!flat&&v>ref.v;g+=`<rect x="${x.toFixed(1)}" y="${sy(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y0-sy(v)).toFixed(1)}" rx="${Math.min(3,bw/2)}" fill="${over?'var(--bad)':col}" opacity="${hi==null||hi==i?1:.6}"/>`});
  if(ref)g+=`<line x1="${x0}" x2="${x1}" y1="${sy(ref.v).toFixed(1)}" y2="${sy(ref.v).toFixed(1)}" stroke="var(--fg)" stroke-dasharray="4 3" stroke-width="1"/><text x="${x1}" y="${(sy(ref.v)-4).toFixed(1)}" text-anchor="end" font-size="9" style="fill:var(--fg)">${ref.label}</text>`;
  labels.forEach(l=>g+=`<text x="${(x0+l.i*gw+gw/2).toFixed(1)}" y="${H-5}" text-anchor="middle" font-size="10" style="fill:var(--muted)">${l.t}</text>`);
  const TL=i=>tipLab?tipLab(i):((labels.find(l=>l.i==i)||{}).t||'');
  return tcWrap(`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${g}</svg>`,{W,H,xs:vals.map((_,i)=>x0+i*gw+gw/2),bw:gw*.9,y0,y1:yt,tips:vals.map((v,i)=>tcHead(TL(i))+tcRow(tipName||'',v||0,'')+(ref&&!flat&&v>ref.v?`<span class="tr" style="color:var(--bad)">über ${esc(ref.label)}</span>`:''))})}
const isRecE=e=>!!(e.rid||e.tpl);
let repK='Alle';const kOk=(e,kf)=>!kf||kf=='Alle'||(kf=='Wiederkehrend')==isRecE(e);
const used=(e,bs,kf)=>!e.corr&&kOk(e,kf)&&((e.type=='out'&&bs.includes(e.b))||(e.type=='tr'&&!e.alloc&&bs.includes(e.b)&&!bs.includes(e.to)))?e.a:0;
function recPlan(bs,o){const p=period(o);return (S.rec||[]).filter(r=>!r.paused&&bs.includes(r.b)&&(r.type=='out'||(r.type=='tr'&&!r.alloc&&!bs.includes(r.to)))&&recDue(r,p)).reduce((s,r)=>s+recA(r,p),0)}
function kindLim(bs,o,kf){const b=budOf(bs),rp=recPlan(bs,o),hasB=bs.some(x=>!isK(x));
  if(kf=='Wiederkehrend'){if(bs===ALL||bs.length==ALL.length){const F=fixInfo(o),lv=F.rw+F.perSum;return{v:lv,label:'Richtwert '+eur0(lv)}}return{v:rp,label:'Geplant '+eur0(rp)}}
  if(!hasB)return kf=='Einmalig'?null:{v:rp,label:'Fixkosten geplant '+eur0(rp)};
  if(kf=='Einmalig')return{v:Math.max(b-rp,0),label:'Frei für Einmaliges '+eur0(Math.max(b-rp,0))};return{v:b,label:'Budget '+eur0(b)}}
const usedSum=(bs,o,kf)=>{const p=period(o);return RX().reduce((s,e)=>s+(inP(e,p)&&!isPlan(e)?used(e,bs,kf):0),0)};
const budOf=bs=>bs.reduce((s,b)=>s+(S.budgets[b]||0),0);
function dayVals(bs,o,kf){const p=period(o),v=Array(p.len).fill(0);RX().forEach(e=>{if(inP(e,p)&&!isPlan(e)){const i=Math.floor((e.t-p.s)/864e5);if(i>=0&&i<p.len)v[i]+=used(e,bs,kf)}});return{p,v}}
function cumChart(bs,o,col,kf){const{p,v}=dayVals(bs,o,kf),pr=dayVals(bs,o-1,kf),L0=kf===undefined?{v:budOf(bs),label:'Budget '+eur0(budOf(bs))}:kindLim(bs,o,kf),lim=L0?L0.v:0,n=p.len;
  let c=0,cum=v.map((x,i)=>(c+=x,o==0&&i>=p.idx?null:c));let c2=0,cum2=pr.v.map(x=>c2+=x).slice(0,n);while(cum2.length<n)cum2.push(c2);
  const ideal=Array.from({length:n},(_,i)=>lim*(i+1)/n);
  const lab=[0,Math.floor(n/2),n-1].map(i=>({i,t:new Date(p.s.getTime()+i*864e5).getDate()+'.'}));
  const last=cum.filter(x=>x!=null).pop()||0,exp=o==0?last/Math.max(p.idx,1)*n:last;
  return `<div class="chartbox">${lineChart({n,labels:lab,refs:L0&&lim?[{v:lim,col:kf=='Wiederkehrend'||!bs.some(x=>!isK(x))?'var(--muted)':'var(--bad)',label:L0.label}]:[],series:[
    ...(lim?[{pts:ideal,col:'var(--muted)',dash:'3 4',w:1.4,name:'Plan'}]:[]),{pts:cum2,col:col,w:1.6,op:.35,name:'Vormonat'},{pts:cum,col:col,area:true,dot:true,name:'Dieser Monat'}],tipLab:i=>new Date(p.s.getTime()+i*864e5).toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'})})}
    <div class="legend"><span><i style="background:${col}"></i>Dieser Monat</span><span><i style="background:${col};opacity:.35"></i>Vormonat</span><span><i style="background:var(--muted)"></i>Plan</span></div>
    ${o==0&&p.idx>=7&&lim?`<div class="note" style="padding:6px 4px 0">Hochrechnung bis Monatsende: <b style="color:${exp>lim?'var(--bad)':'var(--ok)'}">${eur0(exp)}</b> von ${eur0(lim)}</div>`:''}</div>`}
let rpP='Monat',rpFrom='',rpTo='',rpList=true,rpOpen=null;
function rpDet(R,c){if(rpOpen!=c.type+'|'+c.c)return'';const L=R.L.filter(x=>x.type==c.type&&x.c==c.c).reverse();return L.map(x=>`<tr class="sub"><td>${new Date(x.t).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})} · ${esc(x.n||x.sc||x.c)}</td><td></td><td class="${c.type=='in'?'in':''}">${eur(x.a)}</td><td></td></tr>`).join('')}
function rpRange(){const p=period(off);if(rpP=='Monat')return[p.s.getTime(),p.e.getTime(),p.label];
  if(rpP=='Quartal'){const q=Math.floor(p.s.getMonth()/3),s=new Date(p.s.getFullYear(),q*3,S.start),e=new Date(p.s.getFullYear(),q*3+3,S.start);return[s.getTime(),e.getTime(),`${q+1}. Quartal ${s.getFullYear()}`]}
  if(rpP=='Jahr'){const s=new Date(p.s.getFullYear(),0,S.start),e=new Date(p.s.getFullYear()+1,0,S.start);return[s.getTime(),e.getTime(),'Jahr '+s.getFullYear()]}
  const s=rpFrom?new Date(rpFrom+'T00:00').getTime():p.s.getTime(),e=rpTo?new Date(rpTo+'T00:00').getTime()+864e5:p.e.getTime();return[s,e,new Date(s).toLocaleDateString('de-DE')+' – '+new Date(e-864e5).toLocaleDateString('de-DE')]}
function reportData(bs){const[s,e,label]=rpRange(),L=RX().filter(x=>x.t>=s&&x.t<e&&(bs.includes(x.b)||bs.includes(x.to))).sort((a,b)=>a.t-b.t);
  const inc=L.filter(x=>x.type=='in').reduce((q,x)=>q+x.a,0),out=L.filter(x=>x.type=='out').reduce((q,x)=>q+x.a,0),cat={};
  L.filter(x=>x.type!='tr').forEach(x=>{const k=x.type+'|'+x.c;cat[k]=cat[k]||{type:x.type,c:x.c,b:x.b,v:0,n:0,sub:{}};cat[k].v+=x.a;cat[k].n++;if(x.sc){cat[k].sub[x.sc]=(cat[k].sub[x.sc]||0)+x.a}});
  const months={};L.forEach(x=>{const d=new Date(x.t),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');months[k]=months[k]||{i:0,o:0};if(x.type=='in')months[k].i+=x.a;if(x.type=='out')months[k].o+=x.a});
  const days=Math.max(1,Math.round((Math.min(e,Date.now())-s)/864e5));return{s,e,label,L,inc,out,cat:Object.values(cat).sort((a,b)=>b.v-a.v),months,days}}
function reportText(R){let t=`Finanzbericht ${R.label}\nKonten: ${repB=='Alle'?'alle':repB}\n\nEinnahmen: ${eur(R.inc)}\nAusgaben: ${eur(R.out)}\nSaldo: ${eur(R.inc-R.out)}\nØ Ausgaben pro Tag: ${eur(R.out/R.days)}\n\nAusgaben nach Kategorie\n`;
  R.cat.filter(c=>c.type=='out').forEach(c=>{t+=`- ${c.c}: ${eur(c.v)} (${Math.round(c.v/R.out*100)} %, ${c.n}×)\n`;Object.entries(c.sub).forEach(([k,v])=>t+=`    ${k}: ${eur(v)}\n`)});
  t+=`\nEinnahmen nach Kategorie\n`;R.cat.filter(c=>c.type=='in').forEach(c=>t+=`- ${c.c}: ${eur(c.v)}\n`);
  if(rpList){t+=`\nBuchungen\n`;R.L.forEach(x=>t+=`${new Date(x.t).toLocaleDateString('de-DE')}\t${x.type=='in'?'+':x.type=='out'?'−':'⇄'}${eur(x.a)}\t${x.type=='tr'?x.b+' → '+x.to:x.c+(x.sc?' / '+x.sc:'')}\t${x.n||''}\n`)}return t}
function viewReport(bs,head){const R=reportData(bs),outs=R.cat.filter(c=>c.type=='out'),ins=R.cat.filter(c=>c.type=='in');
  const parts=outs.map((c,i)=>({k:c.c,v:c.v,ico:icoOf(c.b,c.c),col:`color-mix(in srgb,${HEX[c.b]||'#888'} ${100-Math.min(i,6)*12}%,var(--card))`}));
  return head+`<div class="seg" id="rpP">${['Monat','Quartal','Jahr','Frei'].map(x=>`<button class="${rpP==x?'on':''}" data-f="${x}">${x}</button>`).join('')}</div>
  ${rpP=='Frei'?`<div class="group"><div class="cell plain"><label for="rpFrom">Von</label><input id="rpFrom" type="date" value="${rpFrom||ymd(R.s)}"></div><div class="cell plain"><label for="rpTo">Bis</label><input id="rpTo" type="date" value="${rpTo||ymd(R.e-864e5)}"></div></div>`:''}
  <button class="btn soft" id="toYear" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('gauge',18)}Jahresübersicht ${period(off).s.getFullYear()}</button>
  <div class="report"><div class="rp-h"><div><div class="rp-k">Finanzbericht</div><div class="rp-t">${R.label}</div></div><div class="rp-k" style="text-align:right">Konten<br><b>${repB=='Alle'?'Alle Budgets':esc(repB)}</b></div></div>
   <div class="mmsum" style="box-shadow:none;background:var(--fill)"><div>Einnahmen<b class="in">${eur(R.inc)}</b></div><div>Ausgaben<b class="out">${eur(R.out)}</b></div><div>Saldo<b class="${R.inc-R.out<0?'out':''}">${eur(R.inc-R.out)}</b></div></div>
   <div class="rp-kv"><span>Buchungen</span><b>${R.L.length}</b><span>Ø Ausgaben pro Tag</span><b>${eur(R.out/R.days)}</b><span>Größte Ausgabe</span><b>${(()=>{const m=R.L.filter(x=>x.type=='out').sort((a,b)=>b.a-a.a)[0];return m?esc(m.n||m.c)+' · '+eur(m.a):'–'})()}</b></div>
   <div class="rp-s">Ausgaben nach Kategorie</div>${donut(parts)}
   <table class="rp-tab"><thead><tr><th>Kategorie</th><th>Anz.</th><th>Betrag</th><th>%</th></tr></thead><tbody>${outs.map(c=>`<tr class="rp-dc" data-rpc="out|${esc(c.c)}"><td>${esc(c.c)} ${rpOpen=='out|'+c.c?'⌄':'›'}</td><td>${c.n}</td><td>${eur(c.v)}</td><td>${Math.round(c.v/R.out*100)}</td></tr>${rpDet(R,c)}${rpOpen=='out|'+c.c?'':Object.entries(c.sub).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr class="sub"><td>${esc(k)}</td><td></td><td>${eur(v)}</td><td>${Math.round(v/R.out*100)}</td></tr>`).join('')}`).join('')||'<tr><td colspan="4">Keine Ausgaben</td></tr>'}</tbody></table>
   ${ins.length?`<div class="rp-s">Einnahmen nach Kategorie</div><table class="rp-tab"><tbody>${ins.map(c=>`<tr class="rp-dc" data-rpc="in|${esc(c.c)}"><td>${esc(c.c)} ${rpOpen=='in|'+c.c?'⌄':'›'}</td><td>${c.n}</td><td class="in">${eur(c.v)}</td><td>${Math.round(c.v/R.inc*100)}</td></tr>${rpDet(R,c)}`).join('')}</tbody></table>`:''}
   ${Object.keys(R.months).length>1?`<div class="rp-s">Nach Monat</div><table class="rp-tab"><thead><tr><th>Monat</th><th>Ein</th><th>Aus</th><th>Saldo</th></tr></thead><tbody>${Object.entries(R.months).map(([k,m])=>`<tr><td>${new Date(k+'-01T12:00').toLocaleDateString('de-DE',{month:'short',year:'numeric'})}</td><td class="in">${eur0(m.i)}</td><td class="out">${eur0(m.o)}</td><td>${eur0(m.i-m.o)}</td></tr>`).join('')}</tbody></table>`:''}
   ${rpList?`<div class="rp-s">Buchungen</div><table class="rp-tab rp-list"><tbody>${R.L.slice().reverse().map(x=>`<tr><td>${new Date(x.t).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}</td><td>${esc(x.n||x.c||'Umbuchung')}<br><small>${x.type=='tr'?esc(x.b)+' → '+esc(x.to):esc(x.c)+(x.sc?' / '+esc(x.sc):'')}</small></td><td class="${x.type=='in'?'in':x.type=='out'?'out':''}">${x.type=='out'?'−':''}${eur(x.a)}</td></tr>`).join('')}</tbody></table>`:''}
   <div class="rp-f">Erstellt am ${new Date().toLocaleDateString('de-DE')}</div></div>
  <div class="group"><div class="cell plain"><label for="rpList">Einzelbuchungen anhängen</label><span style="flex:1"></span><input id="rpList" type="checkbox" class="switch" ${rpList?'checked':''}></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn soft" id="rpCopy">Bericht kopieren</button><button class="btn soft" id="rpCsv">Als CSV kopieren</button></div>
  <div class="note" id="rpMsg"></div><textarea class="box" id="rpOut" hidden readonly></textarea>`}
let drill=null,yOff=0;
const MN=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
function monthOff(Y,m){const c=period(0).s;return (Y*12+m)-(c.getFullYear()*12+c.getMonth())}
function yearHead(Y,title,sub){return `<div><button class="back" id="drBack">‹ Auswertung</button><h1 class="lt" style="font-size:28px">${title}</h1>${sub?`<div class="date">${sub}</div>`:''}</div>
  <div class="ynav"><button id="yPrev" aria-label="Voriges Jahr">‹</button><span><b>${Y}</b> <small>${new Date(Y,0,S.start).toLocaleDateString('de-DE',{day:'2-digit',month:'short'})} – ${new Date(Y+1,0,S.start-1).toLocaleDateString('de-DE',{day:'2-digit',month:'short'})}</small></span><button id="yNext" aria-label="Nächstes Jahr" ${yOff>=0?'disabled':''}>›</button></div>`}
function viewYear(bs){const Y=period(0).s.getFullYear()+yOff,ms=[];
  for(let m=0;m<12;m++){const o=monthOff(Y,m),pp=period(o),fut=o>0,L=fut?[]:RX().filter(e=>inP(e,pp)&&!e.corr&&bs.includes(e.b));
    ms.push({m,o,fut,i:L.filter(e=>e.type=='in').reduce((s,e)=>s+e.a,0),x:L.filter(e=>e.type=='out').reduce((s,e)=>s+e.a,0)})}
  let cum=0;const pts=ms.map(r=>r.fut?null:(cum+=r.i-r.x));const ti=ms.reduce((s,r)=>s+r.i,0),tx=ms.reduce((s,r)=>s+r.x,0),n=ms.filter(r=>!r.fut&&(r.i||r.x)).length||1;
  return yearHead(Y,'Jahressaldo '+Y,repB=='Alle'?'Alle sichtbaren Konten':repB)+`<div class="chartbox">${lineChart({n:12,series:[{pts,col:'var(--in)',area:true,dot:true,w:2.4}],labels:ms.map((r,i)=>({i,t:MN[i].slice(0,3),on:r.o==0})),h:190,tipLab:i=>MN[i]+' '+Y+' · Saldo'})}
   </div>
  <div class="mmcard"><div class="srow"><div class="srow-h"><span>Einnahmen</span><span></span><span class="in">${eur(ti)}</span></div></div><div class="srow"><div class="srow-h"><span>Ausgaben</span><span></span><span class="out">${eur(tx)}</span></div></div>
   <div class="srow"><div class="srow-h"><span><b>Saldo</b></span><span></span><b class="${ti-tx<0?'out':'in'}">${eur(ti-tx)}</b></div></div><div class="srow"><div class="srow-h"><span>Ø Ausgaben pro Monat</span><span></span><span>${eur(tx/n)}</span></div></div></div>
  <div class="mmcard">${ms.map(r=>`<button class="yrow" ${r.fut?'disabled':''} data-ym="${r.o}"><span>${MN[r.m]}</span><span class="ym"><small class="in">${r.i?eur0(r.i):''}</small><small class="out">${r.x?eur0(r.x):''}</small></span><b class="${r.i-r.x<0?'out':''}">${r.fut?'':eur(r.i-r.x)}</b><span class="chev">›</span></button>`).join('')}</div>`}
function viewCatYear(d){const Y=period(0).s.getFullYear()+yOff,ms=[];
  for(let m=0;m<12;m++){const o=monthOff(Y,m),pp=period(o),L=o>0?[]:RX().filter(e=>inP(e,pp)&&e.b==d.b&&e.c==d.c&&e.type==d.type&&(!d.sc||e.sc==d.sc));ms.push({m,o,fut:o>0,v:L.reduce((s,e)=>s+e.a,0),n:L.length,L})}
  const tot=ms.reduce((s,r)=>s+r.v,0),el=ms.filter(r=>!r.fut).length||1,avg=tot/el,col=COL[d.b]||'var(--blue)',subs={};
  ms.forEach(r=>r.L.forEach(e=>{if(e.sc)subs[e.sc]=(subs[e.sc]||0)+e.a}));const cur=ms.find(r=>r.o==0);
  return yearHead(Y,esc(d.c)+(d.sc?' › '+esc(d.sc):'')+` (${Y})`,esc(d.b)+(d.type=='in'?' · Einnahmen':' · Ausgaben'))+`<div class="chartbox">${barChart({vals:ms.map(r=>r.v),col:'var(--blue)',flat:true,hi:cur?cur.m:null,tipLab:i=>MN[i]+' '+Y,ref:avg?{v:avg,label:'Ø '+eur0(avg)}:null,labels:ms.map((r,i)=>({i,t:MN[i][0]})),h:190})}</div>
  <div class="mmcard"><div class="srow"><div class="srow-h"><span>Gesamt</span><span></span><b style="color:var(--in)">${eur(tot)}</b></div></div><div class="srow"><div class="srow-h"><span>Durchschnitt pro Monat</span><span></span><b style="color:var(--in)">${eur(avg)}</b></div></div>
   <div class="srow"><div class="srow-h"><span>Buchungen</span><span></span><span>${ms.reduce((s,r)=>s+r.n,0)}</span></div></div></div>
  ${Object.keys(subs).length&&!d.sc?`<div class="sec"><div class="sh">Unterkategorien</div><div class="mmcard">${Object.entries(subs).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<button class="yrow" data-dsub="${esc(k)}"><span>${esc(k)}</span><span class="ym"></span><b>${eur(v)}</b><span class="chev">›</span></button>`).join('')}</div></div>`:''}
  <div class="mmcard">${ms.map(r=>`<button class="yrow" ${r.fut?'disabled':''} data-cm="${r.o}"><span>${MN[r.m]}</span><span class="ym"><small style="color:var(--muted)">${r.n?r.n+'×':''}</small></span><b>${r.fut?'':eur(r.v)}</b><span class="chev">›</span></button>`).join('')}</div>`}
function catTrend(bs){
  const ds0=dataStart(),ms=[];for(let i=5;i>=0;i--){const o=off-i;if(period(o).e.getTime()>ds0||i<2)ms.push(o)}const M=ms.length,rows=[],PC=period(off),run=off==0&&PC.idx<PC.len,fr=run?Math.max(PC.idx,1)/PC.len:1;
  bs.forEach(b=>cats(b).forEach(c=>{const vals=ms.map(o=>{const pp=period(o);return RX().filter(e=>inP(e,pp)&&!isPlan(e)&&!e.corr&&e.type=='out'&&e.b==b&&e.c==c[0]).reduce((s,e)=>s+e.a,0)});
    if(vals.some(x=>x>0)){const prev=vals.slice(0,-1),avg=prev.reduce((a,x)=>a+x,0)/prev.length,cur=vals[M-1];rows.push({b,c,vals,avg,cur,ch:avg?(cur-avg*fr)/(avg*fr):0,wait:run&&!cur})}}));
  rows.sort((a,b)=>b.cur-a.cur||b.avg-a.avg);
  const spark=(vals,col)=>{const mx=Math.max(...vals,1),pts=vals.map((v,i)=>`${(i/(vals.length-1)*76+2).toFixed(1)},${(26-v/mx*22).toFixed(1)}`);
    return `<svg viewBox="0 0 80 30" width="80" height="30" aria-hidden="true"><polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="2.8" fill="${col}"/></svg>`};
  return `
   <div class="group">${rows.map(r=>`<button class="cell" data-dc="${esc(r.b)}|${esc(r.c[0])}"><div class="ico" style="background:color-mix(in srgb,${COL[r.b]} 16%,transparent);color:${COL[r.b]}">${I(r.c[1])}</div>
   <div class="t"><div>${esc(r.c[0])}</div><div class="s">${SHORT[r.b]} · Ø ${eur0(r.avg)}</div></div>${spark(r.vals,COL[r.b])}
   <div class="v" style="min-width:64px">${eur0(r.cur)}${r.wait?'<div class="s">noch nichts</div>':`<div class="s" style="color:${r.ch>.15?'var(--bad)':r.ch<-.15?'var(--ok)':'var(--muted)'}">${I(r.ch>0?'up':r.ch<0?'down':'flat',12)} ${Math.abs(Math.round(r.ch*100))} %</div>`}</div></button>`).join('')||'<div class="empty">Noch keine Daten.</div>'}</div>`}
let DSC={k:-1,v:0};function dataStart(){if(DSC.k===DV)return DSC.v;const t=(S.exp||[]).filter(e=>!isPlan(e)&&!e.corr).reduce((m,e)=>Math.min(m,e.t),Infinity);const d=new Date(isFinite(t)?t:Date.now());d.setHours(0,0,0,0);DSC={k:DV,v:Math.max(d.getTime(),histT())};return DSC.v}
const recKind=r=>r.type=='out'?'fix':r.type=='tr'?(acc(r.to).kind=='budget'&&!isTabu(r.to)?'bud':'spar'):'fix';
function dupRecs(){const G={};(S.rec||[]).filter(r=>!r.paused&&r.type!='in').forEach(r=>{const k=r.type=='tr'?['tr',r.b,r.to,r.a].join('|'):['out',r.b,r.a,subKey(r.n||r.c)].join('|');(G[k]=G[k]||[]).push(r)});return Object.values(G).filter(L=>L.length>1)}
function fcRec(an,o,open){const p=period(o),k=pkey(p);let inn=0,out=0;const items=[];
  (S.rec||[]).forEach(r=>{if(r.paused)return;const d=recDue(r,p);if(!d)return;if(open&&S.exp.some(e=>e.rid==r.id&&e.pk==k))return;
    const ra=recA(r,p);if((r.type=='in'&&r.b==an)||(r.type=='tr'&&r.to==an))inn+=ra;else if((r.type=='out'||r.type=='tr')&&r.b==an){out+=ra;items.push({n:r.n||r.c,a:ra,d,b:an,every:r.every||1,k:recKind(r)})}});
  S.exp.forEach(e=>{if(!isPlan(e)||!inP(e,p)||e.rid)return;if((e.type=='in'&&e.b==an)||(e.type=='tr'&&e.to==an))inn+=e.a;else if(e.b==an&&(e.type=='out'||e.type=='tr')){out+=e.a;items.push({n:e.n||e.c,a:e.a,d:new Date(e.t),b:an,plan:1,k:'plan'})}});
  if(!open){const rf=refundIn(an,p);if(rf)inn+=rf}
  return{inn,out,items}}
/* ---------- Budget-Simulator ---------- */
/* v242: Ø einmalig nur aus Buchungen ab Stichtag (Standard 01.10.2026, nie vor „Aktiv ab“); angebrochene Monate werden hochgerechnet */
const oneFromD=()=>{const a=S.oneFrom||'2026-10-01',h=HISTD();return a>h?a:h};
/* v243: Prognose nur aus tatsächlichen Buchungen (erfasst, wiederkehrend, geplant) – keine Durchschnittswerte */
function fcOne(pa){return{one:0,info:'',from:0}}
const simBud=()=>BUDG.filter(b=>!isK(b)&&!isTabu(b));
const simSav=pa=>(S.rec||[]).filter(r=>r.type=='tr'&&pa&&r.b==pa.n&&!r.paused&&recKind(r)=='spar'&&(r.every||1)==1&&!(r.end&&r.end<today()));
const simAlloc=(pa,b)=>(S.rec||[]).filter(r=>r.type=='tr'&&pa&&r.b==pa.n&&r.to==b&&!r.paused&&(r.every||1)==1);
let SIM=null;
function simInit(mo){const pa=pufAcc();mo=mo||(SIM&&SIM.mo)||1;const P=period(mo);SIM={b:{},r:{},inc:null,when:SIM&&SIM.when||'next',mo};simBud().forEach(b=>SIM.b[b]=budFor(b,P));simSav(pa).forEach(r=>SIM.r[r.id]=recA(r,P))}
const simBase=(t,k)=>{const P=period(SIM.mo||1);if(t=='b')return budFor(k,P);const x=(S.rec||[]).find(q=>q.id==k);return x?recA(x,P):0};
function simAvgSpend(b){const from=new Date(HISTD()+'T00:00').getTime();let s=0,n=0;for(let o=-1;o>=-3;o--){const p=period(o);if(p.s.getTime()<from)continue;s+=S.exp.reduce((q,e)=>q+(inP(e,p)&&!isPlan(e)&&!e.corr&&e.type=='out'&&e.b==b?e.a:0),0);n++}
  if(n)return s/n;const P0=period(0);if((P0.idx||0)>=7){return S.exp.reduce((q,e)=>q+(inP(e,P0)&&!isPlan(e)&&!e.corr&&e.type=='out'&&e.b==b?e.a:0),0)/P0.idx*P0.len}return null}
function simCalc(sim){const pa=pufAcc();if(!pa)return null;const one=fcOne(pa).one,B=simBud(),R=simSav(pa);
  const month=(o,useSim)=>{const r=fcRec(pa.n,o);let inn=r.inn,fix=0,plan=0,bud=0,spar=0,other=0;
    r.items.forEach(it=>{if(it.k=='fix')fix+=it.a;else if(it.k=='plan')plan+=it.a;else if(it.k=='bud')bud+=it.a;else if(it.k=='spar')spar+=it.a;else other+=it.a});
    if(useSim){B.forEach(b=>{const al=simAlloc(pa,b).filter(x=>recDue(x,period(o)));if(al.length){const cur=al.reduce((s,x)=>s+recA(x,period(o)),0);bud+=(sim.b[b]-cur)}else bud+=(sim.b[b]-budFor(b,period(o)))});
      R.forEach(x=>{if(recDue(x,period(o)))spar+=(sim.r[x.id]-recA(x,period(o)))});if(sim.inc!=null&&o>=1)inn+=sim.inc}
    return{inn,fix:fix+other,plan,bud,spar,one,out:fix+other+plan+bud+spar+one}};
  const run=useSim=>{const o0=fcRec(pa.n,0,true);let E=pufBal()+o0.inn-o0.out,over=0;const x0=Math.max(0,E-1000);over+=x0;E-=x0;const L=[],NM=Math.max(6,sim.mo||1);for(let o=1;o<=NM;o++){const m=month(o,useSim);E+=m.inn-m.out;const x=Math.max(0,E-1000);E-=x;over+=x;L.push({o,E,x,m})}return{L,over}};
  const mi=(sim.mo||1)-1,cur=run(false),sm=run(true),m1=sm.L[mi].m,m1c=cur.L[mi].m,Pm=period(sim.mo||1),budSum=B.reduce((s,b)=>s+(sim.b[b]||0),0),budCur=B.reduce((s,b)=>s+budFor(b,Pm),0),savSum=R.reduce((s,x)=>s+(sim.r[x.id]||0),0),savCur=R.reduce((s,x)=>s+recA(x,Pm),0);
  return{pa,B,R,cur,sm,m1,m1c,mi,budSum,budCur,savSum,savCur,one}}
function simBar(c){const m=c.m1,inn=Math.max(1,m.inn),parts=[['Fixkosten',m.fix+m.plan,'#9A93AD'],...c.B.map(b=>[SHORT[b]||b,SIM.b[b]||0,COL[b]||'#6b7280']),['Sparen',c.savSum,'#2FB36B'],['Ø einmalig',m.one,'#c99a2e']];const used=parts.reduce((s,p)=>s+p[1],0),rest=inn-used;
  return `<div class="simbar">${parts.filter(p=>p[1]>0).map(p=>`<i style="flex:${p[1]};background:${p[2]}" title="${esc(p[0])} ${eur0(p[1])}"></i>`).join('')}${rest>0?`<i style="flex:${rest};background:repeating-linear-gradient(45deg,color-mix(in srgb,var(--accent) 35%,transparent) 0 6px,transparent 6px 12px)" title="Rest ${eur0(rest)}"></i>`:''}</div>
   <div class="legend">${parts.filter(p=>p[1]>0).map(p=>`<span><i style="background:${p[2]}"></i>${esc(p[0])} ${eur0(p[1])}</span>`).join('')}<span><i style="background:var(--accent)"></i>${rest>=0?'Rest '+eur0(rest):'<b style="color:var(--bad)">fehlen '+eur0(-rest)+'</b>'}</span></div>`}
function simLine(c){const W=330,H=120,a=c.cur.L.slice(0,6).map(x=>x.E),b=c.sm.L.slice(0,6).map(x=>x.E),mn=Math.min(0,...a,...b),mx=Math.max(1200,...a,...b),Y=v=>8+(mx-v)/(mx-mn)*(H-26),X=i=>16+i*(W-32)/5,pl=(L,col,dash)=>`<polyline points="${L.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)).join(' ')}" fill="none" stroke="${col}" stroke-width="2.4" ${dash?'stroke-dasharray="5 4"':''} stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Puffer heute und simuliert"><line x1="0" x2="${W}" y1="${Y(1000)}" y2="${Y(1000)}" stroke="var(--ok)" stroke-dasharray="3 4" opacity=".6"/><text x="${W-4}" y="${Y(1000)-4}" font-size="10" text-anchor="end" fill="var(--muted)">1.000 € Puffer</text>${mn<0?`<line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--bad)" opacity=".5"/>`:''}${pl(a,'var(--muted)',1)}${pl(b,'var(--accent)')}${c.cur.L.slice(0,6).map((x,i)=>`<text x="${X(i)}" y="${H-4}" font-size="10" text-anchor="middle" fill="var(--muted)">${period(x.o).s.toLocaleDateString('de-DE',{month:'short'}).replace('.','')}</text>`).join('')}</svg>
   <div class="legend"><span><i style="background:var(--muted)"></i>heute</span><span><i style="background:var(--accent)"></i>simuliert</span></div>`}
function simTop(c){const e0=c.cur.L[c.mi].E,e1=c.sm.L[c.mi].E,inn=Math.max(1,c.m1.inn),q0=c.savCur/Math.max(1,c.m1c.inn)*100,q1=c.savSum/inn*100,free=c.budSum,d=(v,w,inv)=>{const x=v-w;return Math.abs(x)<.5?'':`<small style="color:${(inv?-x:x)>=0?'var(--ok)':'var(--bad)'}">${x>0?'+':'−'}${eur0(Math.abs(x))}</small>`};
  const n0=c.m1c.inn-c.m1c.out,n1=c.m1.inn-c.m1.out;return `<div class="kpi"><span>Plus im Monat</span><b style="color:${n1<0?'var(--bad)':'var(--ok)'}">${n1<0?'−':'+'}${eur0(Math.abs(n1))}</b>${d(n1,n0)}<small style="color:${e1<1000?'var(--bad)':'var(--muted)'};font-weight:500">Puffer Ende ${period(SIM.mo||1).s.toLocaleDateString('de-DE',{month:'short'}).replace('.','')}: ${eur0(e1)}</small></div><div class="kpi"><span>Sparquote</span><b>${q1.toFixed(0)} %</b>${Math.abs(q1-q0)>=.5?`<small style="color:${q1>=q0?'var(--ok)':'var(--bad)'}">${q1>=q0?'+':'−'}${Math.abs(q1-q0).toFixed(0)} Pkt.</small>`:''}</div><div class="kpi"><span>Budgets</span><b>${eur0(free)}</b>${d(free,c.budCur,true)}</div>`}
function simHints(c){const H=[];c.B.forEach(b=>{const avg=simAvgSpend(b),v=SIM.b[b]||0;if(avg!=null&&v<avg*.95)H.push(`${esc(SHORT[b]||b)}: Im Schnitt gibst du ${eur0(avg)} aus – mit ${eur0(v)} wird es knapp.`)});
  const neg=c.sm.L.find(x=>x.E<0),low=c.sm.L.find(x=>x.E<1000);if(neg)H.push(`Im ${period(neg.o).label} rutscht ${esc(c.pa.n)} ins Minus (${eur0(neg.E)}).`);else if(low)H.push(`Ab ${period(low.o).label} liegt der Puffer unter 1.000 €.`);
  const q=c.savSum/Math.max(1,c.m1.inn)*100;if(q<20&&c.m1.inn>0)H.push(`Sparquote ${q.toFixed(0)} % – Ziel sind mindestens 20 %.`);
  const nob=c.B.filter(b=>!simAlloc(c.pa,b).length);if(nob.length)H.push(`Für ${nob.map(b=>esc(SHORT[b]||b)).join(', ')} ist keine monatliche Umbuchung von ${esc(c.pa.n)} angelegt. Ich rechne Änderungen trotzdem gegen ${esc(c.pa.n)} – beim Übernehmen ändert sich dort nur das Budget.`);
  return H.length?H.map(h=>`<div class="tip">${I('alert',14)} ${h}</div>`).join(''):`<div class="note" style="color:var(--ok)">${I('check',14)} Passt: Puffer bleibt über 1.000 €, Budgets decken deinen bisherigen Schnitt.</div>`}
function simSlider(id,label,val,cur,max,col,sub){return `<div class="simrow"><div class="simrow-h"><span><i style="background:${col}"></i>${esc(label)}</span><span class="simd" id="sd-${id}">${Math.abs(val-cur)>=.5?(val>cur?'+':'−')+eur0(Math.abs(val-cur)):''}</span><input class="simv" data-sv="${id}" inputmode="decimal" value="${String(Math.round(val*100)/100).replace('.',',')}"><span>€</span></div><input type="range" class="simr" data-sr="${id}" min="0" max="${max}" step="10" value="${val}" style="accent-color:${col}">${sub?`<div class="a-s" style="font-size:12px">${sub}</div>`:''}</div>`}
function simHtml(){const pa=pufAcc();if(!pa)return `<div class="tip">Lege zuerst unter Einstellungen › Konten ein Eingangskonto fest.</div>`;if(!SIM)simInit();const c=simCalc(SIM),m=c.m1;
  const sc=S.simScen||[];
  return `<div class="group" style="margin-bottom:8px"><div class="cell plain"><label for="simMo">${I('calendar',16)} Monat</label><select id="simMo" style="margin-left:auto;font-weight:600">${[1,2,3,4,5,6,7,8,9,10,11,12].map(o=>`<option value="${o}" ${(SIM.mo||1)==o?'selected':''}>${period(o).label}</option>`).join('')}</select></div></div>
   <div class="simtop" id="simTop">${simTop(c)}</div>
   <div class="sec"><div class="sh">So verteilt sich dein Einkommen · ${period(SIM.mo||1).label}</div><div class="mmcard" style="padding:12px 14px"><div class="simbar-h"><span>Einnahmen</span><b>${eur0(m.inn)}</b></div><div id="simBar">${simBar(c)}</div>
     <div class="cell plain" style="padding:8px 0 0"><label for="simInc" style="font-size:13px">Gehalt anders? (± pro Monat)</label><input id="simInc" inputmode="decimal" placeholder="0" value="${SIM.inc?String(SIM.inc).replace('.',','):''}" style="max-width:90px;text-align:right;margin-left:auto"><span>€</span></div></div></div>
   <div class="sec"><div class="sh">Fest (nur zur Info)</div><div class="mmcard">${[['Fixkosten',m.fix],['Bereits geplante Einzelbuchungen',m.plan],['Ø einmalige Ausgaben (ab 11/2026)',m.one]].filter(x=>x[1]).map(x=>`<div class="srow"><div class="srow-h"><span>${x[0]}</span><span></span><b>${eur0(x[1])}</b></div></div>`).join('')||'<div class="srow"><span class="a-s">Keine festen Abgänge geplant.</span></div>'}</div></div>
   <div class="sec"><div class="sh">Monatsbudgets</div><div class="mmcard simgrp">${c.B.map(b=>{const avg=simAvgSpend(b);return simSlider('b:'+b,SHORT[b]||b,SIM.b[b]||0,simBase('b',b),Math.max(1500,Math.ceil(((S.budgets[b]||0)*2.5)/100)*100),COL[b]||'var(--accent)',avg!=null?'Im Schnitt ausgegeben: '+eur0(avg):'')}).join('')}</div></div>
   <div class="sec"><div class="sh">Sparen</div><div class="mmcard simgrp">${c.R.map(r=>simSlider('r:'+r.id,(r.n||'Sparrate')+' → '+(SHORT[r.to]||r.to),SIM.r[r.id]||0,simBase('r',r.id),Math.max(1000,Math.ceil(r.a*3/100)*100),'#2FB36B','')).join('')||'<div class="srow"><span class="a-s">Keine monatlichen Sparraten von '+esc(pa.n)+' gefunden. Lege sie im Depot oder als wiederkehrende Umbuchung an.</span></div>'}</div></div>
   <div class="sec"><div class="sh">Puffer auf ${esc(pa.n)} · nächste 6 Monate</div><div class="chartbox" id="simLine">${simLine(c)}</div><div class="note" id="simGrow">${simGrow(c)}</div></div>
   <div class="sec" id="simHints">${simHints(c)}</div>
   <div class="sec"><div class="sh">Übernehmen</div><div class="seg" id="simWhen"><button class="${SIM.when=='now'?'on':''}" data-v="now">Ab sofort</button><button class="${SIM.when=='next'?'on':''}" data-v="next">Ab ${period(1).label.split(' ')[0]}</button><button class="${SIM.when=='once'?'on':''}" data-v="once">Nur ${period(SIM.mo||1).label.split(' ')[0]}</button></div>
    ${SIM.when=='once'?`<div class="note">Gilt nur im <b>${period(SIM.mo||1).label}</b> (Monat oben wählen). Danach gelten automatisch wieder deine normalen Werte.</div>`:''}
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn soft" id="simReset" style="flex:1;margin:0">Zurücksetzen</button><button class="btn" id="simApply" style="flex:2;margin:0">Übernehmen</button></div>
    ${Object.keys(S.monthOv||{}).length?`<div class="sec" style="margin-top:6px"><div class="sh">Nur für einen Monat</div><div class="group">${Object.entries(S.monthOv).sort().map(([pk,o])=>`<div class="cell plain"><div class="t" style="flex:1"><div>${esc(o.label||pk)}</div><div class="s">${[...Object.entries(o.b||{}).map(([b,v])=>esc(SHORT[b]||b)+' '+eur0(v)),...Object.entries(o.r||{}).map(([id,v])=>{const x=(S.rec||[]).find(q=>q.id==id);return esc(x?(x.n||'Sparrate'):'Sparrate')+' '+eur0(v)})].join(' · ')}</div></div><button class="del" data-ovx="${esc(pk)}" aria-label="Entfernen">${I('minus',20)}</button></div>`).join('')}</div></div>`:''}
    ${S.planNext?`<div class="note">Vorgemerkt ab ${esc(S.planNext.label||'')}: ${Object.keys(S.planNext.b||{}).length} Budgets, ${Object.keys(S.planNext.r||{}).length} Sparraten. <button class="link" id="simPendX">Verwerfen</button></div>`:''}
    </div>
   <div class="sec"><div class="sh">Szenarien</div><div class="group">${sc.map((x,i)=>`<div class="cell plain"><button class="link" data-sl="${i}" style="flex:1;text-align:left">${esc(x.n)}</button><span class="a-s" style="font-size:12px">${eur0(Object.values(x.b||{}).reduce((s,v)=>s+v,0))} Budgets · ${eur0(Object.values(x.r||{}).reduce((s,v)=>s+v,0))} Sparen</span><button class="del" data-sx="${i}" aria-label="Löschen">${I('minus',20)}</button></div>`).join('')}<div class="cell plain"><input id="simScN" placeholder="Name, z. B. „Urlaub sparen“" style="flex:1;text-align:left"><button class="link" id="simScS">Speichern</button></div></div></div>`}
function simGrow(c){const g6=c.sm.L.reduce((s,x)=>s+x.m.spar+x.x,0),g6c=c.cur.L.reduce((s,x)=>s+x.m.spar+x.x,0);return `Sparen + Puffer-Überschuss in 6 Monaten: <b>${eur0(g6)}</b>${Math.abs(g6-g6c)>=1?` (${g6>g6c?'+':'−'}${eur0(Math.abs(g6-g6c))} ggü. heute)`:''} · in 12 Monaten etwa <b>${eur0(g6*2)}</b>.`}
function simPaint(){const c=simCalc(SIM);if(!c)return;$('simTop').innerHTML=simTop(c);$('simBar').innerHTML=simBar(c);$('simLine').innerHTML=simLine(c);$('simGrow').innerHTML=simGrow(c);$('simHints').innerHTML=simHints(c)}
function simApplyNow(b,r,from){Object.entries(b).forEach(([k,v])=>{S.budgets[k]=v;simAlloc(pufAcc(),k).forEach(x=>{if(x.a!==v){recSetA(x,v);if(from)x.hist[x.hist.length-1].ab=from}})});
  Object.entries(r).forEach(([id,v])=>{const x=(S.rec||[]).find(q=>q.id==id);if(x&&x.a!==v){recSetA(x,v);if(from)x.hist[x.hist.length-1].ab=from}})}
function simPending(){if(S.monthOv){const cur=pkey(period(0)),ks=Object.keys(S.monthOv);ks.forEach(k=>{if(k<cur&&!/[^0-9-]/.test(k))delete S.monthOv[k]})}const pn=S.planNext;if(!pn)return;if(pkey(period(0))!==pn.pk)return;simApplyNow(pn.b||{},pn.r||{},ymd(period(0).s.getTime()));delete S.planNext;save();try{tell('Neue Budgets und Sparraten aus dem Simulator gelten ab jetzt.')}catch(e){}}
function bindSim(){if(!$('simTop'))return;
  const set=(id,v)=>{v=Math.max(0,Math.round((+v||0)*100)/100);const[t,k]=[id.slice(0,1),id.slice(2)];if(t=='b')SIM.b[k]=v;else SIM.r[k]=v;const cur=simBase(t,k);const dd=$('sd-'+id);if(dd)dd.textContent=Math.abs(v-cur)>=.5?(v>cur?'+':'−')+eur0(Math.abs(v-cur)):'';simPaint()};
  document.querySelectorAll('[data-sr]').forEach(r=>r.oninput=()=>{const id=r.dataset.sr,f=document.querySelector(`[data-sv="${CSS.escape(id)}"]`);if(f)f.value=r.value;set(id,r.value)});
  document.querySelectorAll('[data-sv]').forEach(f=>f.onchange=()=>{const id=f.dataset.sv,v=pNum(f.value)||0,r=document.querySelector(`[data-sr="${CSS.escape(id)}"]`);if(r){if(v>+r.max)r.max=Math.ceil(v/100)*100;r.value=v}set(id,v)});
  if($('simInc'))$('simInc').onchange=()=>{const v=$('simInc').value.trim();SIM.inc=v?(String(v).trim().startsWith('-')||String(v).trim().startsWith('−')?-1:1)*(pNum(v.replace(/^[-−+]/,''))||0):null;simPaint()};
  document.querySelectorAll('#simWhen button').forEach(b=>b.onclick=()=>{SIM.when=b.dataset.v;render()});if($('simMo'))$('simMo').onchange=()=>{const w=SIM.when;simInit(+$('simMo').value);SIM.when=w;render()};
  document.querySelectorAll('[data-ovx]').forEach(b=>b.onclick=()=>{const k=b.dataset.ovx,o=S.monthOv[k];delete S.monthOv[k];save();render();tell('Einmal-Änderung für '+(o.label||k)+' entfernt.',()=>{S.monthOv[k]=o;save();render()})});
  $('simReset').onclick=()=>{const w=SIM.when;simInit(SIM.mo);SIM.when=w;render()};
  $('simApply').onclick=()=>{const once=SIM.when=='once',ch={b:{},r:{}};Object.entries(SIM.b).forEach(([k,v])=>{if(v!==(once?simBase('b',k):(S.budgets[k]||0)))ch.b[k]=v});Object.entries(SIM.r).forEach(([k,v])=>{const x=(S.rec||[]).find(q=>q.id==k);if(x&&v!==(once?simBase('r',k):x.a))ch.r[k]=v});
    const n=Object.keys(ch.b).length+Object.keys(ch.r).length;if(!n){tell('Keine Änderungen.');return}const snap0=JSON.stringify({b:S.budgets,rec:S.rec,pn:S.planNext||null});
    if(SIM.when=='now'){simApplyNow(ch.b,ch.r,null);tell(n+' Änderung'+(n>1?'en':'')+' übernommen.',()=>{const o=JSON.parse(snap0);S.budgets=o.b;S.rec=o.rec;save();simInit();render()})}
    else if(SIM.when=='once'){Object.entries(ch.b).forEach(([b,v])=>simAlloc(pufAcc(),b).forEach(x=>{ch.r[x.id]=v}));const pk=pkey(period(SIM.mo||1)),lab=period(SIM.mo||1).label;S.monthOv=S.monthOv||{};const prev=S.monthOv[pk]?JSON.parse(JSON.stringify(S.monthOv[pk])):null;S.monthOv[pk]={label:lab,b:Object.assign({},(prev||{}).b,ch.b),r:Object.assign({},(prev||{}).r,ch.r)};simInit();tell('Nur im '+lab+' übernommen.',()=>{if(prev)S.monthOv[pk]=prev;else delete S.monthOv[pk];save();render()})}
    else{S.planNext={pk:pkey(period(1)),label:period(1).label,b:ch.b,r:ch.r};tell('Vorgemerkt ab '+period(1).label+'.',()=>{const o=JSON.parse(snap0);if(o.pn)S.planNext=o.pn;else delete S.planNext;save();render()})}
    save();render()};
  if($('simPendX'))$('simPendX').onclick=()=>{delete S.planNext;save();render()};
  $('simScS').onclick=()=>{const n=$('simScN').value.trim()||('Szenario '+((S.simScen||[]).length+1));S.simScen=[...(S.simScen||[]),{n,b:Object.assign({},SIM.b),r:Object.assign({},SIM.r),inc:SIM.inc}];save();render();tell('Szenario „'+n+'“ gespeichert.')};
  document.querySelectorAll('[data-sl]').forEach(b=>b.onclick=()=>{const x=S.simScen[+b.dataset.sl];simInit();Object.assign(SIM.b,x.b||{});Object.keys(x.r||{}).forEach(k=>{if(k in SIM.r)SIM.r[k]=x.r[k]});SIM.inc=x.inc||null;render();tell('Szenario „'+x.n+'“ geladen – noch nicht übernommen.')});
  document.querySelectorAll('[data-sx]').forEach(b=>b.onclick=()=>{S.simScen.splice(+b.dataset.sx,1);save();render()})}

/* ---------- Prognose: alle Konten, Budgets und Vermögen im Verlauf (eine Quelle: fcRec/recA, budFor, fcOne, posVal) ---------- */
let fcOff={},fcVault=false,fcMo=6;
function fcAccModel({N,M,E0,x0,avg3,pa}){const lab=['jetzt',...Array.from({length:N},(_,k)=>period(k+1).s.toLocaleDateString('de-DE',{month:'short'}).replace('.',''))];
  const VA=[...new Set(vaultAccs().concat(depAccs()))],rows=[],col=(n,k)=>(acc(n).col||COL[n]||PCOL[k%PCOL.length]),rate=S.fcRate==null?7:S.fcRate,g=r=>Math.pow(1+r/100,1/12);
  // Konten (ohne Vermögen)
  S.accts.filter(a=>!VA.includes(a.n)).forEach((a,k)=>{const n=a.n;
    if(pa&&n==pa.n){rows.push({n,kind:'puf',col:col(n,k),vals:[E0,...M.map(m=>m.end)],sub:'Puffer, Überschuss über 1.000 € → Vermögensaufbau'});return}
    if(isK(n)){const o0=fcRec(n,0,true),one=fcOne(a).one||0;let v=calc(n).rest+o0.inn-o0.out;const vals=[v];for(let o=1;o<=N;o++){const r=fcRec(n,o);v+=r.inn-r.out-one;vals.push(v)}
      if(vals.some(x=>Math.abs(x)>0.5)||fcRec(n,1).inn)rows.push({n,kind:'konto',col:col(n,k),vals,sub:one?'inkl. Ø '+eur0(one)+' einmalig/Monat':'geplante Ein- und Ausgänge'});return}
    const exp=Math.max(budFor(n,period(1)),recPlan([n],1)),carry=isCarry(a);let v=calc(n).rest;const vals=[v];
    for(let o=1;o<=N;o++){const P=period(o),bud=budFor(n,P);v=(carry?Math.max(v,0):0)+bud-exp;vals.push(v)}
    rows.push({n,kind:'bud',col:col(n,k),vals,sub:`Budget ${eur0(budFor(n,period(1)))} · wird voll eingeplant${carry?' · Rest wird übertragen':''}`,exp})});
  // Vermögen
  const vr=[],depA=Array(N+1).fill(0),grA=Array(N+1).fill(0);
  const vaN=(S.accts.find(x=>x.n==S.vermZiel)||S.accts.find(x=>x.n=='Vermögensaufbau')||{}).n,ovIn=o=>M[o-1]?M[o-1].x||0:0;
  VA.forEach((n,k)=>{const D=depot().filter(x=>posAcc(x)==n),isDep=D.length>0,r=isDep?rate:(rateNow(n)||0);let v=isDep?D.reduce((s,x)=>s+posVal(x),0):calc(n).rest;const vals=[v];
    for(let o=1;o<=N;o++){const inn=fcRec(n,o).inn+(n==vaN?ovIn(o):0),gr=v*(g(r)-1);v+=gr+inn;grA[o]+=gr;depA[o]+=inn;vals.push(v)}
    if(vals.some(x=>Math.abs(x)>0.5))vr.push({n,kind:'vault',col:col(n,k+3),vals,sub:isDep?`Depot · Annahme ${String(r).replace('.',',')} % p. a.`:r?`Zinsen ${String(r).replace('.',',')} % p. a.`:'ohne Zinsen',r,mon:fcRec(n,1).inn})});
  const loose=depot().filter(x=>!VA.includes(posAcc(x)));if(loose.length){let v=loose.reduce((s,x)=>s+posVal(x),0);const vals=[v],mon=loose.reduce((s,x)=>s+(x.plan&&!x.paused&&!x.rid?(x.rate||0):0),0);for(let o=1;o<=N;o++){const gr=v*(g(rate)-1);v+=gr+mon;grA[o]+=gr;depA[o]+=mon;vals.push(v)}vr.push({n:'Depot',kind:'vault',col:PCOL[6],vals,sub:`ohne Sparkonto · Annahme ${rate} % p. a.`,r:rate,mon})}
  if(!(vaN&&VA.includes(vaN))&&M.some(m=>m.x)){let v=0;const vals=[0];for(let o=1;o<=N;o++){const inn=ovIn(o);v+=inn;depA[o]+=inn;vals.push(v)}vr.push({n:'Puffer-Überschuss',kind:'vault',col:PCOL[2],vals,sub:'noch ohne Zielkonto · über 1.000 € Puffer',r:0,mon:0})}
  return{lab,rows,vr,depA,grA,rate}}
function fcAccHtml(ctx){const N=ctx.N,F=fcAccModel(ctx),mi=Math.min(Math.max(1,fcMo),N),V=F.vr,showV=fcVault,all=F.rows.concat(showV?V:[]);
  if(!all.length)return '';const vis=all.filter(r=>!fcOff[r.n]);
  const tot=V.length?V[0].vals.map((_,i)=>V.reduce((s,r)=>s+r.vals[i],0)):[];
  const chart=vis.length?lineChart({n:N+1,series:vis.map(r=>({pts:r.vals,col:r.col,name:SHORT[r.n]||r.n,w:r.kind=='vault'?2.4:1.8,dash:r.kind=='bud'?'4 3':undefined})),labels:F.lab.map((t,i)=>({i,t,on:i==mi})),h:190,tipLab:i=>i?period(i).label:'Ende dieses Monats'}):'<div class="empty">Alle Linien ausgeblendet.</div>';
  const row=r=>{const v0=r.vals[0],v=r.vals[mi],d=v-v0,neg=r.vals.slice(1).some(x=>x<0)&&r.kind!='vault';return `<div class="cell plain fcrow"><i class="fcdot" style="background:${r.col}"></i><div class="t"><div>${esc(SHORT[r.n]||r.n)}${r.kind=='bud'?' <span class="histb">Budget</span>':''}</div><div class="s">${esc(r.sub)}${neg?' · <b class="out">rutscht ins Minus</b>':''}</div></div><div class="v ${v<0?'out':''}">${eur0(v)}<div class="s ${r.kind=='bud'?(v<0?'out':''):d<0?'out':'in'}">${r.kind=='bud'?(v<0?'fehlt am Monatsende':'Rest am Monatsende'):(d>=0?'+':'−')+eur0(Math.abs(d))+' ggü. jetzt'}</div></div></div>`};
  const moSeg=`<div class="seg" id="fcMo">${F.lab.slice(1).map((l,i)=>`<button class="${mi==i+1?'on':''}" data-fm="${i+1}">${l}</button>`).join('')}</div>`;
  const tv=tot.length?tot[mi]:0,y10=(()=>{const T=tresorProj(10,{});return T.tot[T.tot.length-1]})();
  return `<div class="sec"><div class="sh"><span>Konten & Budgets · nächste ${N} Monate</span></div>
   <div class="chartbox">${chart}
    <div class="dlg">${all.map(r=>`<button class="dlg-i ${fcOff[r.n]?'off':''}" data-fcl="${esc(r.n)}"><i style="background:${r.col}"></i><span>${esc(SHORT[r.n]||r.n)}</span><b>${eur0(r.vals[mi])}</b><small class="${r.kind=='bud'?(r.vals[mi]<0?'out':''):r.vals[mi]-r.vals[0]<0?'out':'in'}">${r.kind=='bud'?'Rest':(r.vals[mi]-r.vals[0]>=0?'+':'−')+eur0(Math.abs(r.vals[mi]-r.vals[0]))}</small></button>`).join('')}</div></div>
   ${moSeg}
   <div class="note" style="padding:2px 4px 6px">Stand Ende ${period(mi).label}.</div>
   <div class="group">${F.rows.map(row).join('')}</div>
   ${V.length?`<div class="fcv ${showV?'on':''}"><div class="fcv-h"><div><b>Vermögen</b><div class="s">${showV?'Einzahlungen und angenommene Wertentwicklung':'ausgeblendet – zum Ansehen tippen'}</div></div><button class="eyeb" id="fcVault" aria-label="${showV?'Vermögen ausblenden':'Vermögen einblenden'}">${I(showV?'eyeoff':'eye',18)}</button></div>
    ${showV?`<div class="pos-kpi k4"><div><span>Vermögen Ende ${F.lab[mi]}</span><b>${eur0(tv)}</b></div><div><span>Einzahlung</span><b class="in">+${eur0(F.depA.slice(1,mi+1).reduce((s,x)=>s+x,0))}</b></div><div><span>Wertzuwachs</span><b class="in">+${eur0(F.grA.slice(1,mi+1).reduce((s,x)=>s+x,0))}</b><small>angenommen</small></div><div><span>in 10 Jahren</span><b class="in">${eur0(y10)}</b><small>bei gleicher Rate</small></div></div>
     <div class="group">${V.map(row).join('')}</div>
     <div class="sec" style="margin-top:12px"><div class="sh"><span>Entwicklung</span></div><div class="seg" id="fcY">${[1,5,10,20].map(y=>`<button class="${fcYears==y?'on':''}" data-fy="${y}">${y} J.</button>`).join('')}</div><div id="fcTC">${tresorChartHtml()}</div>${tresorSliders()}</div>
     <div class="fcrate"><span>Angenommene Rendite fürs Depot</span><div class="seg" id="fcRate">${[3,5,7,9].map(r=>`<button class="${F.rate==r?'on':''}" data-fr="${r}">${r} %</button>`).join('')}</div></div>
     <div class="note" style="padding:4px 4px 0">Motivations-Rechnung, keine Garantie: Depotwerte wachsen mit der gewählten Rendite pro Jahr, Sparkonten mit ihrem Zinssatz. Dazu kommen deine geplanten Sparraten und der erwartete Puffer-Überschuss. Kurse können auch fallen.</div>`:''}</div>`:''}
  </div>`}
function fcCore(N){N=N||6;const pa=pufAcc(),mn=o=>period(o).s.toLocaleDateString('de-DE',{month:'short'}).replace('.','');
  const ds=dataStart(),outSum=(bs,o,kf)=>{const p=period(o);return S.exp.reduce((s,e)=>s+(inP(e,p)&&!isPlan(e)&&!e.corr&&e.type=='out'&&bs.includes(e.b)&&kOk(e,kf)?e.a:0),0)};
  const avg3=(bs,kf)=>{let s=0,n=0;for(let o=-1;o>=-3;o--){if(period(o).s.getTime()<ds)continue;s+=outSum(bs,o,kf);n++}if(n)return s/n;const P0=period(0),f=Math.max(P0.idx,1)/P0.len;return f>=.25?outSum(bs,0,kf)/f:outSum(bs,0,kf)};
  const M=[];let E=null,over=0;
  let x0=0;if(pa){const o0=fcRec(pa.n,0,true);E=pufBal()+o0.inn-o0.out;x0=Math.max(0,E-1000);over+=x0;E-=x0}const E0=E;
  const FO=fcOne(pa),oneFrom=FO.from,oneInfo=FO.info,one=pa?FO.one:0;
  for(let o=1;o<=N;o++){const r=pa?fcRec(pa.n,o):{inn:0,out:0,items:[]};let x=0;if(pa){E+=r.inn-r.out-one;x=Math.max(0,E-1000);E-=x;over+=x}const kk=k=>r.items.filter(it=>it.k==k).reduce((s,it)=>s+it.a,0);M.push({o,l:mn(o),inn:r.inn,fix:r.out,fx:kk('fix'),bud:kk('bud'),spar:kk('spar'),plan:kk('plan'),items:r.items,one,end:E,x})}
  return{N,pa,mn,ds,avg3,M,E0,x0,over,oneFrom,oneInfo,one}}
/* v230: frühestes drohendes Minus (Puffer oder Konto) in den nächsten 12 Monaten, für die Übersicht */
function fcWarn(){try{const C=fcCore(12),out=[];if(C.pa){const m=C.M.find(m=>m.end<0);if(m)out.push({n:C.pa.n,o:m.o,v:m.end,puf:true})}
  const F=fcAccModel(C);F.rows.filter(r=>r.kind=='konto'&&(!C.pa||r.n!=C.pa.n)).forEach(r=>{const i=r.vals.findIndex((x,i)=>i>0&&x<-0.5);if(i>0)out.push({n:r.n,o:i,v:r.vals[i]})});
  out.sort((x,y)=>x.o-y.o);const w=out.find(x=>!(S.fcWarnOff||[]).includes(fcWarnKey(x)));return w||null}catch(e){return null}}
const fcWarnKey=w=>w.n+'|'+pkey(period(w.o))+'|'+Math.round(w.v/50);
function forecastHtml(){const{N,pa,mn,ds,avg3,M,E0,x0,over,oneFrom,oneInfo,one}=fcCore(6);
  const neg=M.filter(m=>m.end!=null&&m.end<0);
  // Chart
  const W=330,H=170,top=10,bot=24,ch=H-top-bot,mx=Math.max(1,...M.map(m=>Math.max(m.inn,m.fix+m.one,m.end||0))),mnv=Math.min(0,...M.map(m=>m.end||0)),rng=mx-mnv,Y=v=>top+(mx-v)/rng*ch,cw=(W-10)/N,bw=Math.min(16,cw/3);
  let g=`<line x1="0" x2="${W}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="var(--line)"/>`;
  M.forEach((m,i)=>{const cx=5+cw*i+cw/2;g+=`<rect x="${(cx-bw-1).toFixed(1)}" y="${Y(m.inn).toFixed(1)}" width="${bw}" height="${Math.max(0,Y(0)-Y(m.inn)).toFixed(1)}" rx="2" fill="var(--ok)"></rect>
    <rect x="${(cx+1).toFixed(1)}" y="${Y(m.fix+m.one).toFixed(1)}" width="${bw}" height="${Math.max(0,Y(0)-Y(m.fix+m.one)).toFixed(1)}" rx="2" fill="var(--bad)" opacity=".85"></rect>
    <text x="${cx.toFixed(1)}" y="${H-6}" font-size="11" text-anchor="middle" fill="var(--muted)">${m.l}</text>`});
  if(pa){const pts=M.map((m,i)=>`${(5+cw*i+cw/2).toFixed(1)},${Y(m.end).toFixed(1)}`);g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round"/>`+pts.map((q,i)=>`<circle cx="${q.split(',')[0]}" cy="${q.split(',')[1]}" r="3" fill="var(--blue)"></circle>`).join('')}
  // Budgets
  const B=BUDG.filter(b=>!isK(b)&&!isTabu(b)).map(b=>{const bud=S.budgets[b]||0,exp=Math.max(bud,recPlan([b],1));return{b,bud,exp,d:bud-exp}});
  // Sparen
  const sav=S.accts.filter(a=>isVerm(a)||isTabu(a.n)||/etf/i.test(a.n)).map(a=>{let s=0;for(let o=1;o<=N;o++)s+=fcRec(a.n,o).inn;return{n:a.n,s}}).filter(x=>x.s>0);
  // Große Posten
  const big=[];S.accts.forEach(a=>{for(let o=1;o<=N;o++)fcRec(a.n,o).items.forEach(it=>{if(it.plan||it.every>1||it.a>=250&&!(S.rec||[]).some(r=>r.n==it.n&&(r.every||1)==1))big.push(it)})});
  (S.rec||[]).forEach(r=>{if(r.end&&!r.paused){const d=new Date(r.end+'T12:00');if(d>new Date()&&d<period(N).e)big.push({n:(r.n||r.c)+' endet',a:0,d,b:r.b,end:1})}});
  big.sort((x,y)=>x.d-y.d);
  return `<div class="note">Vorschau auf die nächsten 6 Monate: nur tatsächliche Buchungen: wiederkehrende Ein- und Ausgänge, Budget-Verteilung, Sparraten und bereits erfasste zukünftige Buchungen. Keine Schätzwerte. Alles über 1.000 € Puffer wird als Umbuchung in den Vermögensaufbau gerechnet.</div>
  ${pa?`<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Puffer-Verlauf ${M[N-1].l}<b class="${M[N-1].end<0?'out':''}">${eur0(M[N-1].end)}</b></div><div class="kpi">Tiefster Stand<b class="${Math.min(...M.map(m=>m.end))<0?'out':''}">${eur0(Math.min(...M.map(m=>m.end)))}</b></div><div class="kpi">Überschuss<b class="in">${eur0(over)}</b></div></div>
  ${neg.length?`<div class="note" style="color:var(--bad)">Achtung: Im ${neg[0].l} reicht ${esc(pa.n)} voraussichtlich nicht für alle geplanten Abgänge (${eur0(neg[0].end)}).</div>`:''}
  ${(()=>{const D=dupRecs();return D.length?`<div class="tip">${I('alert',14)} <b>Vermutlich doppelt angelegt:</b> ${D.map(L=>L.map(r=>'„'+esc(r.n||r.c)+'“').join(' und ')+' ('+eur0(L[0].a)+')').join(' · ')}. Prüfe das unter Planen › Fixkosten.</div>`:''})()}
  <div class="sec"><div class="sh">${esc(pa.n)} Monat für Monat</div><div class="chartbox">${tcWrap(`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Prognose Eingänge, Ausgaben und Puffer">${g}</svg>`,{W,H,xs:M.map((m,i)=>5+cw*i+cw/2),bw:cw*.85,y0:H-bot,y1:top,tips:M.map(m=>tcHead(period(m.o).s.toLocaleDateString('de-DE',{month:'long',year:'numeric'}))+tcRow('Eingänge',m.inn,'var(--ok)')+tcRow('Fixkosten',m.fx,'var(--bad)')+(m.one?tcRow('Ø einmalig',m.one,'var(--bad)'):'')+(m.bud?tcRow('Budgets',m.bud,'var(--bad)'):'')+(m.spar?tcRow('Sparen',m.spar,'var(--bad)'):'')+(m.plan?tcRow('Geplant',m.plan,'var(--bad)'):'')+(pa?tcRow(SHORT[pa.n]||pa.n,m.end,'var(--blue)'):''))})}
   <div class="legend"><span><i style="background:var(--ok)"></i>Eingänge</span><span><i style="background:var(--bad)"></i>Geplante Abgänge${one?' + Ø Einmaliges':''}</span><span><i style="background:var(--blue)"></i>Puffer-Verlauf</span></div></div>
   <div class="group">${M.map(m=>`<div class="cell plain"><div class="t"><div>${period(m.o).label}</div><div class="s">+${eur0(m.inn)} Eingänge · −${eur0(m.fx)} Fixkosten${m.bud?` · −${eur0(m.bud)} Budgets`:''}${m.spar?` · −${eur0(m.spar)} Sparen`:''}${m.plan?` · −${eur0(m.plan)} geplant`:''}${m.one?` · −${eur0(m.one)} Ø einmalig`:''}${m.x?` · ${eur0(m.x)} → Vermögensaufbau`:''}</div></div><div class="v ${m.end<0?'out':''}">${eur0(m.end)}</div></div>`).join('')}</div>
   <div class="note">Fixkosten = echte wiederkehrende Ausgaben. Budgets = Monatsverteilung auf deine Budgetkonten. Sparen = Sparraten und Umbuchungen in den Vermögensaufbau. Gerechnet wird mit Geplantem: Einnahmen, Fixkosten, Budget-Verteilung, Sparraten und bereits erfasste zukünftige Buchungen.</div></div>`:`<div class="note">Lege in den Einstellungen ein Eingangskonto fest, dann wird auch dein Puffer vorausberechnet.</div>`}
  ${fcAccHtml({N,M,E0,x0,avg3,pa})}
  ${B.length?`<div class="sec"><div class="sh">Budgets im Schnitt</div><div class="group">${B.map(r=>`<div class="cell plain"><div class="ico" style="background:color-mix(in srgb,${COL[r.b]} 16%,transparent);color:${COL[r.b]}">${I('wallet')}</div><div class="t"><div>${esc(SHORT[r.b]||r.b)}</div><div class="s">Budget ${eur0(r.bud)} · erwartet Ø ${eur0(r.exp)}/Monat</div></div><div class="v ${r.d<0?'out':'in'}">${r.d<0?'−':'+'}${eur0(Math.abs(r.d*N))}<div class="s">in 6 Monaten</div></div></div>`).join('')}</div><div class="note">Minus heißt: Bleibt es beim bisherigen Tempo, reicht das Budget nicht.</div></div>`:''}
  ${sav.length||over?`<div class="sec"><div class="sh">Sparen bis ${M[N-1].l}</div><div class="group">${sav.map(x=>`<div class="cell plain"><div class="t">${esc(SHORT[x.n]||x.n)}<div class="s">feste Sparraten</div></div><div class="v in">+${eur0(x.s)}</div></div>`).join('')}${over?`<div class="cell plain"><div class="t">Puffer-Überschuss<div class="s">geht in den Vermögensaufbau</div></div><div class="v in">+${eur0(over)}</div></div>`:''}</div></div>`:''}
  <button class="btn soft" id="toSim2" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('gauge',16)} Mit Simulator ausprobieren</button>
  <div class="sec"><div class="sh">Kommt auf dich zu</div><div class="group">${big.slice(0,15).map(it=>`<div class="cell plain"><div class="t"><div>${esc(it.n)}</div><div class="s">${it.d.toLocaleDateString('de-DE',{day:'numeric',month:'short'})} · ${esc(SHORT[it.b]||it.b)}${it.plan?' · geplant':it.every>1?` · alle ${it.every} Monate`:''}</div></div><div class="v ${it.end?'':'out'}">${it.end?'':'−'+eur(it.a)}</div></div>`).join('')||'<div class="empty">Keine besonderen Posten in den nächsten 6 Monaten.</div>'}</div></div>
  <div class="sec"><div class="sh">Altersvorsorge</div>${penCard(x=>S.showWealth||depShow?x:'•••')}</div>`}
/* ---------- Entwicklung: Kategorien/Begriffe über Zeit, Ladepreis, Einkaufszettel ---------- */
const DEVR={'3m':['3M',3],'6m':['6M',6],'1y':['1J',12],'2y':['2J',24],'all':['Alles',0]};
function devRange(r){const n=new Date();if(r=='all'){const t0=Math.min(...S.exp.map(e=>e.t),Date.now());const d=new Date(t0);return{s:new Date(d.getFullYear(),d.getMonth(),1).getTime(),e:Date.now()+1,m:(n.getFullYear()-d.getFullYear())*12+n.getMonth()-d.getMonth()+1}}const m=DEVR[r][1];return{s:new Date(n.getFullYear(),n.getMonth()-m+1,1).getTime(),e:Date.now()+1,m}}
function devHtml(){const D=S.devSel=S.devSel||{r:'1y',c:'',q:''},R=devRange(D.r),q=(D.q||'').toLowerCase().trim();
  const inR=e=>e.t>=R.s&&e.t<R.e&&!isPlan(e)&&!e.corr&&e.type=='out'&&!WH(e.b),match=e=>(!D.c||e.c==D.c)&&(!q||[e.n,e.c,e.sc,e.p].join(' ').toLowerCase().includes(q));
  const L=RX().filter(e=>inR(e)&&match(e)),sum=L.reduce((s,e)=>s+e.a,0),len=R.e-R.s,prevL=RX().filter(e=>e.t>=R.s-len&&e.t<R.s&&!isPlan(e)&&!e.corr&&e.type=='out'&&!WH(e.b)&&match(e)),prev=prevL.reduce((s,e)=>s+e.a,0);
  const catSums={};RX().filter(inR).forEach(e=>{if(e.c)catSums[e.c]=(catSums[e.c]||0)+e.a});const cats=Object.entries(catSums).sort((a,b)=>b[1]-a[1]);
  const ms=[];const n=new Date();for(let i=R.m-1;i>=0;i--){const d=new Date(n.getFullYear(),n.getMonth()-i,1);ms.push({s:d.getTime(),e:new Date(d.getFullYear(),d.getMonth()+1,1).getTime(),l:d.toLocaleDateString('de-DE',{month:R.m>12?'narrow':'short'}),ll:d.toLocaleDateString('de-DE',{month:'long',year:'numeric'})})}
  const vals=ms.map(m=>L.filter(e=>e.t>=m.s&&e.t<m.e).reduce((s,e)=>s+e.a,0)),avg=vals.length?sum/vals.length:0;
  const byN={};L.forEach(e=>{const k=(e.n||e.c||'–').trim();byN[k]=byN[k]||{v:0,n:0};byN[k].v+=e.a;byN[k].n++});const top=Object.entries(byN).sort((a,b)=>b[1].v-a[1].v).slice(0,6);
  const step=Math.max(1,Math.ceil(ms.length/6)),lab=ms.map((m,i)=>({i,t:m.l})).filter((x,i)=>i%step==0||i==ms.length-1);
  // charging
  const CH=RX().filter(e=>e.kwh>0&&e.t>=R.s&&e.t<R.e).sort((a,b)=>a.t-b.t),chK=CH.reduce((s,e)=>s+e.kwh,0),chE=CH.reduce((s,e)=>s+e.a,0);
  let chHtml='';if(CH.length){const pm=ms.map(m=>{const x=CH.filter(e=>e.t>=m.s&&e.t<m.e),k=x.reduce((s,e)=>s+e.kwh,0);return k?x.reduce((s,e)=>s+e.a,0)/k:null});
    const prov={};CH.forEach(e=>{const k=(e.n||'Unbekannt').replace(/^\s*(laden|ladung|strom)\s+/i,'').replace(/\b(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|\d{1,2}\.?\d{0,2}\.?\d{0,4})\b/gi,'').replace(/\s+/g,' ').trim()||'Unbekannt';prov[k]=prov[k]||{k:0,e:0,n:0};prov[k].k+=e.kwh;prov[k].e+=e.a;prov[k].n++});const PV=Object.entries(prov).map(([k,v])=>({k,p:v.e/v.k,kwh:v.k,n:v.n})).sort((a,b)=>a.p-b.p);
    chHtml=`<div class="sec"><div class="sh">Ladepreis E-Auto</div><div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Ø pro kWh<b>${(chE/chK).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:3})} €</b></div><div class="kpi">Geladen<b>${Math.round(chK).toLocaleString('de-DE')} kWh</b></div><div class="kpi">Kosten<b>${eur0(chE)}</b></div></div>
     ${pm.filter(x=>x!=null).length>1?`<div class="chartbox">${lineChart({n:ms.length,series:[{pts:pm,col:'var(--warn)',dot:true,name:'€/kWh'}],labels:lab,h:150,tipLab:i=>ms[i].ll,tips:pm.map((v,i)=>v==null?null:tcHead(ms[i].ll)+`<span class="tr"><b>${v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:3})} €/kWh</b></span>`)})}</div>`:''}
     <div class="mmcard">${PV.map((x,i)=>`<div class="srow"><div class="srow-h"><span>${i==0&&PV.length>1?'🏆 ':''}${esc(x.k)} <small style="color:var(--muted)">${x.n}× · ${Math.round(x.kwh)} kWh</small></span><span></span><b>${x.p.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:3})} €/kWh</b></div></div>`).join('')}</div>
     ${PV.length>1?`<div class="note">Bei ${esc(PV[0].k)} lädst du am günstigsten, ${((PV[PV.length-1].p-PV[0].p)*100).toFixed(0)} Cent pro kWh weniger als bei ${esc(PV[PV.length-1].k)}.</div>`:''}</div>`}
  else chHtml=`<div class="sec"><div class="sh">Ladepreis E-Auto</div><div class="mmcard"><div class="srow" style="color:var(--muted);font-size:13px">Trag beim Buchen einer Ladung die geladenen kWh ein (Feld erscheint bei Kategorie oder Notiz mit „Laden“). Dann siehst du hier deinen Preis pro kWh je Anbieter.</div></div></div>`;
  // shopping list
  const SB=RX().filter(e=>e.shop&&e.t>=R.s&&e.t<R.e),shX=e=>e.shop.est!=null?Math.round((e.a-e.shop.est)*100)/100:(e.shop.x||0),xs=SB.filter(e=>shX(e)>0.5),xsum=xs.reduce((s,e)=>s+shX(e),0),btot=SB.reduce((s,e)=>s+e.a,0),xi={};SB.forEach(e=>(e.shop.xi||[]).forEach(r=>{const k=r.n.toLowerCase();xi[k]=xi[k]||{n:r.n,c:0,v:0};xi[k].c++;xi[k].v+=r.p||0}));
  const ph=(S.shop&&S.shop.ph)||{},PH2=Object.entries(ph).filter(([k,L])=>L.length>=2).map(([k,L])=>{const f=L[0],l=L[L.length-1];return{k,f,l,ch:(l[1]/f[1]-1)*100}}).sort((a,b)=>Math.abs(b.ch)-Math.abs(a.ch)).slice(0,12);
  const shHtml=`<div class="sec"><div class="sh">Einkaufszettel</div>${SB.length?`<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Einkäufe<b>${SB.length}</b></div><div class="kpi">Spontan dazu<b class="${xsum?'out':''}">${eur0(xsum)}</b></div><div class="kpi">Anteil<b>${btot?Math.round(xsum/btot*100):0} %</b></div></div>
    <div class="note">${xs.length?`Bei ${xs.length} von ${SB.length} Einkäufen kam etwas dazu, im Schnitt ${eur(xsum/Math.max(xs.length,1))}.`:'Bisher hast du immer nur gekauft, was auf dem Zettel stand. Stark!'}${Object.keys(xi).length?' Häufigste Extras: '+Object.values(xi).sort((a,b)=>b.c-a.c).slice(0,4).map(x=>esc(x.n)+(x.c>1?' ('+x.c+'×)':'')).join(', ')+'.':''}</div>`:'<div class="mmcard"><div class="srow" style="color:var(--muted);font-size:13px">Buche Einkäufe über den Einkaufszettel mit dem Betrag vom Kassenbon. Dann siehst du hier, wie viel du spontan dazukaufst.</div></div>'}
    <div class="sh" style="margin-top:12px">Preisentwicklung</div><div class="mmcard">${PH2.map(x=>`<div class="srow"><div class="srow-h"><span>${esc(x.k.charAt(0).toUpperCase()+x.k.slice(1))} <small style="color:var(--muted)">${new Date(x.f[0]).toLocaleDateString('de-DE',{day:'numeric',month:'short'})} → ${new Date(x.l[0]).toLocaleDateString('de-DE',{day:'numeric',month:'short'})}</small></span><span style="font-size:12px;color:var(--muted)">${eur(x.f[1])} → ${eur(x.l[1])}</span><b class="${x.ch>0.5?'out':x.ch<-0.5?'in':''}">${x.ch>0?'+':''}${x.ch.toFixed(0)} %</b></div></div>`).join('')||'<div class="srow" style="color:var(--muted);font-size:13px">Sobald du für einen Artikel mindestens zweimal einen echten Preis einträgst (z. B. vom Bon), siehst du hier, ob er teurer oder günstiger wird.</div>'}</div></div>`;
  return `<div class="seg" id="devR">${Object.entries(DEVR).map(([k,v])=>`<button class="${D.r==k?'on':''}" data-v="${k}">${v[0]}</button>`).join('')}</div>
   <div class="group"><div class="cell plain"><label for="devC">Kategorie</label><select id="devC" style="margin-left:auto;max-width:60%"><option value="">Alle Ausgaben</option>${cats.map(([c,v])=>`<option value="${esc(c)}" ${D.c==c?'selected':''}>${esc(c)} · ${eur0(v)}</option>`).join('')}</select></div>
    <div class="cell plain"><label for="devQ">Suchbegriff</label><input id="devQ" value="${esc(D.q||'')}" placeholder="z. B. Laden, Amazon, Rewe" style="margin-left:auto;max-width:60%;text-align:right" enterkeyhint="search"></div></div>
   <div class="kpis"><div class="kpi">Summe<b>${eur0(sum)}</b></div><div class="kpi">Ø / Monat<b>${eur0(avg)}</b></div><div class="kpi">Buchungen<b>${L.length}</b></div><div class="kpi">Vorperiode<b class="${prev&&sum>prev?'out':prev?'in':''}">${prev?(sum>=prev?'+':'−')+Math.abs(Math.round((sum/prev-1)*100))+' %':'–'}</b></div></div>
   <div class="sec"><div class="sh">${esc(D.c||(q?'„'+D.q+'“':'Alle Ausgaben'))} pro Monat</div><div class="chartbox">${barChart({vals,col:'var(--accent)',labels:lab,ref:avg?{v:avg,label:'Ø '+eur0(avg)}:null,flat:true,h:170,tipLab:i=>ms[i].ll,tipName:''})}</div></div>
   ${top.length?`<div class="sec"><div class="sh">Wofür genau</div><div class="mmcard">${top.map(([k,v])=>`<div class="srow"><div class="srow-h"><span>${esc(k)} <small style="color:var(--muted)">${v.n}×</small></span><span></span><b>${eur(v.v)}</b></div><div class="bar" style="height:5px"><i style="width:${(v.v/top[0][1].v*100).toFixed(0)}%;background:var(--accent)"></i></div></div>`).join('')}</div></div>`:''}
   ${chHtml}${shHtml}`}
const REPG=[['Monat','Monat',[['Analyse','Analyse'],['Monat','Ausgaben']]],['Trends','Verlauf',[['Verlauf','Verlauf']]]];
const repGrp=v=>(REPG.find(g=>g[2].some(x=>x[0]==v))||REPG[0])[0];
function repSub(){const g=REPG.find(x=>x[0]==repGrp(repV));return g&&g[2].length>1?`<div class="seg subseg" id="repV">${g[2].map(([v,l])=>`<button class="${repV==v?'on':''}" data-f="${v}">${l}</button>`).join('')}</div>`:''}
/* ---------- Wiederkehrende Ausgaben aller Konten: bereinigter 12-Monats-Richtwert ---------- */
const recOut=()=>(S.rec||[]).filter(r=>r.type=='out');
function recSetA(r,a){if(r.a===a)return;r.hist=r.hist&&r.hist.length?r.hist:[{ab:r.start||'',a:r.a}];r.hist.push({ab:today(),a});r.a=a}
const near=(x,y)=>Math.abs(x-y)<=Math.max(.5,Math.abs(y)*.02);
function fixInfo(o=0){const P=period(o),act=r=>!r.paused&&!(r.end&&r.end<ymd(P.s.getTime())),M=[];for(let k=1;k<=12;k++)M.push(period(o-k));
  const pos=recOut().map(r=>{const ev=r.every||1,L=S.exp.filter(e=>e.rid==r.id&&e.type=='out'&&!e.corr&&!isPlan(e)&&e.t>=M[11].s.getTime()&&e.t<P.s.getTime()).sort((a,b)=>a.t-b.t),am=L.map(e=>e.a);
    const avg12=am.length?am.reduce((s,x)=>s+x,0)/(ev>1?am.length:Math.max(am.length,1)):r.a;let kind='stable',val=r.a,chg=null;
    const H=(r.hist||[]).filter(x=>x.ab&&x.ab>=ymd(M[11].s.getTime()));if(H.length){const h=H[H.length-1],prev=(r.hist||[])[r.hist.indexOf(h)-1];if(prev&&!near(prev.a,h.a))chg={from:prev.a,to:h.a,at:h.ab}}
    if(ev>1)kind='periodic';else if(!am.length)kind='new';else if(!chg){const last=am[am.length-1];let i=am.length-1;while(i>0&&near(am[i-1],last))i--;const before=am.slice(0,i);
      if(i>0){const stableBefore=before.every(x=>near(x,before[before.length-1]));if(stableBefore&&before.length>=1){chg={from:before[before.length-1],to:last,at:ymd(L[i].t)}}else kind='var'}}
    if(kind=='var')val=avg12;return{r,ev,L,avg12:am.length&&ev==1?am.reduce((s,x)=>s+x,0)/am.length:avg12,val,kind,chg,on:act(r)}}).filter(x=>x.on||x.L.length);
  const rw=pos.filter(x=>x.on&&x.kind!='periodic').reduce((s,x)=>s+x.val,0),perDue=pos.filter(x=>x.on&&x.kind=='periodic').map(x=>({x,d:recDue(x.r,P)})).filter(y=>y.d);
  const sumM=q=>RX().filter(e=>inP(e,q)&&!isPlan(e)&&e.type=='out'&&!e.corr&&isRecE(e)).reduce((s,e)=>s+e.a,0);
  const ist=sumM(P),hist12=M.slice().reverse().map(q=>({q,v:sumM(q)})),openPlan=pos.filter(x=>x.on).map(x=>({x,d:recDue(x.r,P)})).filter(y=>y.d&&!S.exp.some(e=>e.rid==y.x.r.id&&inP(e,P)&&!isPlan(e))).reduce((s,y)=>s+y.x.r.a,0);
  return{P,pos,rw,perDue,perSum:perDue.reduce((s,y)=>s+y.x.r.a,0),ist,hist12,openPlan}}
function viewFix(head,kseg){const F=fixInfo(off),lim=F.rw+F.perSum,mon=d=>new Date(d+'T12:00').toLocaleDateString('de-DE',{month:'long',year:'numeric'}),evL={1:'monatlich',2:'alle 2 Monate',3:'vierteljährlich',6:'halbjährlich',12:'jährlich'};
  const byAcc={};RX().filter(e=>inP(e,F.P)&&!isPlan(e)&&e.type=='out'&&!e.corr&&isRecE(e)).forEach(e=>byAcc[e.b]=(byAcc[e.b]||0)+e.a);const accs=Object.entries(byAcc).sort((a,b)=>b[1]-a[1]);
  const{v}=dayVals(ALL,off,'Wiederkehrend'),p=F.P,cum=[];let c=0;v.forEach(x=>{c+=x;cum.push(c)});
  const rows=F.pos.slice().sort((a,b)=>(b.on-a.on)||(a.kind=='periodic')-(b.kind=='periodic')||b.r.a-a.r.a);
  const row=x=>{const r=x.r,info=[esc(SHORT[r.b]||r.b),evL[x.ev]||('alle '+x.ev+' Monate')];if(x.kind=='periodic'){const d=recDue(r,F.P);info.push(d?'diesen Monat fällig':'nicht im Richtwert')}if(x.kind=='var')info.push('schwankt · Ø zählt');if(x.kind=='new')info.push('neu');if(!x.on)info.push(r.paused?'pausiert':'beendet');
    const chg=x.chg?`<div class="fx-chg ${x.chg.to>x.chg.from?'up':'down'}">${x.chg.to>x.chg.from?'+':'−'}${eur(Math.abs(x.chg.to-x.chg.from))} seit ${new Date(x.chg.at+'T12:00').toLocaleDateString('de-DE',{month:'long'})}</div>`:'';
    return `<button class="srow fx-r" data-recid="${esc(r.id)}" style="${x.on?'':'opacity:.55'}"><div class="srow-h"><span><b>${esc(r.n||r.c)}</b><br><small style="color:var(--muted)">${info.join(' · ')}</small>${chg}</span><span></span><span style="text-align:right"><b>${eur(r.a)}</b><br><small style="color:var(--muted)">${x.kind=='periodic'?'':'Ø 12 M '+eur(x.avg12)}</small></span></div></button>`};
  return head+kseg+`<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Bisher<b>${eur0(F.ist)}</b></div><div class="kpi">Richtwert<b>${eur0(lim)}</b></div><div class="kpi">Noch fällig<b>${eur0(F.openPlan)}</b></div></div>
   <div class="note">Alle Konten. Umbuchungen zwischen deinen Konten und Sparpläne zählen nicht. Richtwert: Ø der letzten 12 Monate, Preisänderungen wie eine Mieterhöhung mit dem neuen Betrag gerechnet.</div>
   ${F.perDue.length?`<div class="tip">${I('calendar',14)} Diesen Monat zusätzlich fällig: ${F.perDue.map(y=>esc(y.x.r.n||y.x.r.c)+' '+eur0(y.x.r.a)).join(' · ')}</div>`:''}
   <div class="sec"><div class="sh">Ausgabenkurve · Wiederkehrend</div>${cumChart(ALL,off,'var(--accent)','Wiederkehrend')}</div>
   <div class="sec"><div class="sh">Letzte 12 Monate</div><div class="chartbox">${barChart({vals:F.hist12.map(y=>y.v),col:'var(--accent)',labels:F.hist12.map((y,i)=>({i,t:y.q.s.toLocaleDateString('de-DE',{month:'narrow'})})),ref:F.rw?{v:F.rw,label:'Richtwert '+eur0(F.rw)}:null,flat:true,h:150,tipLab:i=>F.hist12[i].q.s.toLocaleDateString('de-DE',{month:'long',year:'numeric'}),tipName:'Wiederkehrend'})}</div></div>
   ${accs.length?`<div class="sec"><div class="sh">Nach Konto · diesen Monat</div><div class="mmcard">${accs.map(([b,val])=>`<div class="srow"><div class="srow-h"><span>${esc(SHORT[b]||b)}</span><span></span><b>${eur(val)}</b></div><div class="bar" style="height:5px"><i style="width:${(val/accs[0][1]*100).toFixed(0)}%;background:${COL[b]||'var(--accent)'}"></i></div></div>`).join('')}</div></div>`:''}
   <div class="sec"><div class="sh">Positionen · ${rows.filter(x=>x.on).length} aktiv</div><div class="mmcard">${rows.map(row).join('')||'<div class="srow"><span style="color:var(--muted)">Noch keine wiederkehrenden Ausgaben angelegt.</span></div>'}</div></div>`}

function viewRep(){if(drill)return drill.k=='year'?viewYear(repB=='Alle'?BN:[repB]):viewCatYear(drill);const p=period(off),bs=repB=='Alle'?TOT.filter(b=>!isStock(b)):[repB],col=repB=='Alle'?'var(--blue)':COL[repB],kf=repK,kseg=`<div class="seg kseg" id="repK">${[['Alle','Alle'],['Einmalig','Einmalig'],['Wiederkehrend','Wiederkehrend']].map(([v,l])=>`<button class="${repK==v?'on':''}" data-f="${v}">${l}</button>`).join('')}</div>`,seg=`<div class="seg" id="repV">${['Analyse','Monat','Verlauf','Prognose','Vermögen','Verträge'].map(x=>`<button class="${repV==x?'on':''}" data-f="${x}">${x}</button>`).join('')}</div>`;
  const head=appbar({title:'Rückblick',big:repV=='Verzicht'?'Verzicht':repV=='Journal'?'Journal':repV=='Entwicklung'?'Entwicklung':repV=='Simulator'?'Simulator':repV=='Prognose'?'Nächste 6 Monate':repV=='Verträge'?'Fixkosten':repV=='Vermögen'?'Vermögen':'Bericht',month:repV!='Verzicht'&&repV!='Journal'&&repV!='Verträge'&&repV!='Prognose'&&repV!='Simulator'&&repV!='Vermögen'&&repV!='Entwicklung'&&(repV!='Bericht'||rpP=='Monat'),right:repV=='Entwicklung'||repV=='Verzicht'||repV=='Journal'?'':repV=='Vermögen'&&!S.showWealth?'':repV=='Analyse'||repV=='Prognose'||repV=='Simulator'||repV=='Verträge'||repV=='Vermögen'?'':`<label class="ab-sel">${I('wallet',15)}<select id="repBsel" aria-label="Konto"><optgroup label="Budgets">${['Alle',...BUDG,...(sinkAcc()&&BN.includes(sinkAcc())?[sinkAcc()]:[])].map(b=>`<option value="${esc(b)}" ${repB==b?'selected':''}>${b=='Alle'?'Alle Budgets':esc(SHORT[b])}</option>`).join('')}</optgroup><optgroup label="Konten">${BN.filter(b=>isK(b)&&!WH(b)).map(b=>`<option value="${esc(b)}" ${repB==b?'selected':''}>${esc(SHORT[b])}</option>`).join('')}</optgroup></select></label>`,tabs:{id:'repG',cur:repGrp(repV),items:REPG.map(g=>[g[0],g[1]])}})+repSub();
  if(['Analyse','Monat','Budget'].includes(repV)&&period(off).e.getTime()<=histT())return head+`<div class="mmcard"><div class="empty">Dieser Monat liegt vor dem ${new Date(histT()).toLocaleDateString('de-DE')} und ist historisch. Er zählt nicht in Auswertungen. Den Stichtag änderst du unter Einstellungen › Finanzmonat.</div></div>`;
  if(repV=='Monat'){const{v}=dayVals(bs,off,kf),KL=kindLim(bs,off,kf),lim=KL?KL.v:0;
    const parts=[];bs.forEach(b=>{const by={};RX().filter(e=>inP(e,p)&&!isPlan(e)&&e.type=='out'&&e.b==b&&kOk(e,kf)).forEach(e=>by[e.c]=(by[e.c]||0)+e.a);
      Object.entries(by).sort((x,y)=>y[1]-x[1]).forEach(([k,val],i)=>parts.push({b,c:k,k:repB=='Alle'?k+' · '+SHORT[b]:k,v:val,ico:icoOf(b,k),col:`color-mix(in srgb,${HEX[b]} ${100-i*14}%,var(--card))`}))});
    parts.sort((a,b)=>b.v-a.v);const tot=parts.reduce((s,x)=>s+x.v,0);
    const pBy={};RX().filter(e=>inP(e,p)&&!isPlan(e)&&kOk(e,kf)&&e.p&&e.type=='out'&&bs.includes(e.b)).forEach(e=>pBy[e.p]=(pBy[e.p]||0)+e.a);
    const byN={};RX().filter(e=>inP(e,p)&&!isPlan(e)&&kOk(e,kf)&&e.type=='out'&&bs.includes(e.b)&&e.n).forEach(e=>{const k=e.n.trim();byN[k]=(byN[k]||{v:0,n:0});byN[k].v+=e.a;byN[k].n++});
    const topN=Object.entries(byN).sort((a,b)=>b[1].v-a[1].v).slice(0,6);
    const tU=usedSum(bs,off,'Alle'),tR=usedSum(bs,off,'Wiederkehrend');
    return head+kseg+`<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Einmalig<b>${eur0(tU-tR)}</b></div><div class="kpi">Wiederkehrend<b>${eur0(tR)}</b></div><div class="kpi">${repB=='Alle'||!isK(repB)?'Budget':'Fix geplant'}<b>${eur0(repB=='Alle'||!isK(repB)?budOf(bs):recPlan(bs,off))}</b></div></div>
    ${repB=='Alle'?`<div class="note">Nur deine Monatsbudgets. Fixkosten vom Eingangskonto und Sinking Funds (Bestand) zählen hier nicht mit. Wähle oben ein Konto, um sie zu sehen.</div>`:''}
    <div class="sec"><div class="sh">Ausgabenkurve${kf!='Alle'?' · '+kf:''}</div>${cumChart(bs,off,col,kf)}</div>
    <div class="sec"><div class="sh">Pro Tag</div><div class="chartbox">${barChart({vals:v,col,hi:off==0?p.idx-1:null,tipLab:i=>new Date(p.s.getTime()+i*864e5).toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'}),tipName:'Ausgaben',ref:lim&&kf!='Wiederkehrend'&&(repB=='Alle'||!isK(repB))?{v:lim/p.len,label:'Tagesbudget '+eur0(lim/p.len)}:null,labels:[0,9,19,p.len-1].filter(i=>i<p.len).map(i=>({i,t:new Date(p.s.getTime()+i*864e5).getDate()+'.'}))})}</div></div>
    ${repB=='Alle'?hgSection(p,kf):''}
    <div class="sec"><div class="sh">Nach Kategorie</div><div class="chartbox">${donut(parts)}</div>
     ${parts.length?`<div class="group">${parts.map(x=>`<button class="cell" data-dc="${esc(x.b)}|${esc(x.c)}"><div class="ico" style="background:${x.col};color:#fff">${x.ico}</div><div class="t"><div>${esc(x.k)}</div><div class="bar"><i style="width:${(x.v/tot*100).toFixed(0)}%;background:${x.col}"></i></div></div><div class="v">${eur(x.v)}<div class="s">${Math.round(x.v/tot*100)} %</div></div><span class="chev">›</span></button>`).join('')}</div>`:''}</div>
    ${topN.length?`<div class="sec"><div class="sh">Größte Ausgaben</div><div class="mmcard">${topN.map(([k,x],i)=>`<div class="srow"><div class="srow-h"><span>${i+1}. ${esc(k)}</span><span class="s" style="color:var(--muted);font-size:12px">${x.n}×</span><span class="out">${eur(x.v)}</span></div></div>`).join('')}</div></div>`:''}
    ${Object.keys(pBy).length?`<div class="sec"><div class="sh">Mit Personen</div><div class="group">${Object.entries(pBy).map(([k,val])=>`<div class="cell plain"><div class="t">${esc(k)}</div><div class="v">${eur(val)}</div></div>`).join('')}</div></div>`:''}`}
  if(repV=='Analyse'){S.revOff=off;let bud='';{const sv=repV;repV='Budget';const s=viewRep();repV=sv;const i=s.indexOf('<div class="sec"><div class="sh">Budget gegen Ist');if(i>=0)bud=s.slice(i)}
    /* v253: Werkzeuge stehen unter den Zahlen, nicht davor */return head+reviewBody(off).replace('<div class="sec"><div class="sh">Was gut lief</div>',bud+'<div class="sec"><div class="sh">Was gut lief</div>')+toolBar(['report','yearrev'])}
  if(repV=='Bericht'||repV=='Jahr0')repV='Analyse';
  if(repV=='Verzicht')return head+notBoughtHtml()+musterHtml();
  if(repV=='Journal')return head+journalHtml();
  if(repV=='Simulator')return head+simHtml();
  if(repV=='Bericht')return viewReport(bs,head);
  if(repV=='Vermögen'&&posView)return posHtml();
  if(repV=='Vermögen')return head+depotHtml();
  if(repV=='Verträge')return head+aboBody(true);
  if(repV=='Jahr'){drill={k:'year'};return viewYear(bs)}
  if(repV=='Budget'){const B=bs.filter(b=>!isK(b));const rows=B.map(b=>{const c=calc(b,off);let y=0,yb=0;for(let o=off-11;o<=off;o++){const cc=calc(b,o);y+=cc.used;yb+=cc.total}return{b,c,y,yb}});
    const mx=Math.max(...rows.map(r=>Math.max(r.c.used,r.c.total)),1),W=330,bh=14,gap=34,H=rows.length*gap+16;
    let g='';rows.forEach((r,i)=>{const y0=i*gap+8,wB=r.c.total/mx*(W-110),wA=r.c.used/mx*(W-110),st=stat(r.c);
      g+=`<text x="0" y="${y0+11}" font-size="11">${esc(SHORT[r.b])}</text><rect x="70" y="${y0}" width="${wB.toFixed(1)}" height="${bh}" rx="3" fill="var(--fill)"/>
      <rect x="70" y="${y0+3}" width="${wA.toFixed(1)}" height="${bh-6}" rx="2" fill="${st.k=='bad'?'var(--bad)':st.k=='warn'?'var(--warn)':COL[r.b]}"/><text x="${W}" y="${y0+11}" font-size="11" text-anchor="end">${Math.round(r.c.pct*100)} %</text>`});
    return head+`<div class="sec"><div class="sh">Budget gegen Ist, ${period(off).label}</div><div class="chartbox">${tcWrap(`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Budget gegen Ausgaben">${g}</svg>`,{W,H,ys:rows.map((r,i)=>i*gap+8+bh/2),bw:bh,tips:rows.map(r=>tcHead(esc(r.b))+tcRow('Ausgegeben',r.c.used,stat(r.c).k=='bad'?'var(--bad)':COL[r.b])+tcRow('Budget',r.c.total,'var(--fill)')+`<span class="tr">${Math.round(r.c.pct*100)} %</span>`)})}
      <div class="legend"><span><i style="background:var(--fill)"></i>Budget</span><span><i style="background:var(--blue)"></i>Ausgegeben</span></div></div></div>
     <div class="sec"><div class="sh">Woche · Monat · Jahr</div><div class="mmcard"><div class="cmp" style="grid-template-columns:1.2fr repeat(3,1fr)"><span></span><b>Woche</b><b>Monat</b><b>12 Monate</b>
     ${rows.map(r=>`<span>${esc(r.b)}</span><span>${eur0(r.c.total*7/r.c.p.len)}</span><span class="${stat(r.c).k=='bad'?'out':''}">${eur0(r.c.used)} / ${eur0(r.c.total)}</span><span class="${r.y>r.yb?'out':''}">${eur0(r.y)} / ${eur0(r.yb)}</span>`).join('')}</div></div>
     </div>`}
  if(repV=='Entwicklung')return head+devHtml();
  if(repV=='Verlauf'){const ds0=dataStart(),ms=[];for(let i=11;i>=0;i--){const o=off-i;if(period(o).e.getTime()>ds0||i<2)ms.push(o)}const N=ms.length;
    const lab=ms.map((o,i)=>({i,t:period(o).s.toLocaleDateString('de-DE',{month:'narrow'}),on:o==off}));
    const ser=bs.map(b=>({pts:ms.map(o=>usedSum([b],o,kf)),col:COL[b],dot:true,area:bs.length==1,name:bs.length>1?SHORT[b]||b:''}));const mlab=i=>period(ms[i]).s.toLocaleDateString('de-DE',{month:'long',year:'numeric'});
    const KL=kindLim(bs,off,kf),tots=ms.map(o=>usedSum(bs,o,kf)),lim=KL?KL.v:0,rests=ms.map((o,i)=>lim-tots[i]);
    const past=tots.slice(0,-1).filter(x=>x>0),avg=past.length?past.reduce((a,b)=>a+b,0)/past.length:0;
    const good=past.filter(x=>x<=lim).length;
    const wd=Array(7).fill(0),wc=Array(7).fill(0);{const D=864e5,endP=period(off),end0=Math.min(Date.now(),endP.e.getTime()),day0=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()},real=RX().filter(e=>!isPlan(e)&&!e.corr&&used(e,bs,kf)>0),first=real.reduce((m,e)=>Math.min(m,e.t),Infinity),from=day0(Math.max(first,end0-91*D)),sums={};
      real.forEach(e=>{if(e.t<from||e.t>end0)return;const k=day0(e.t);sums[k]=(sums[k]||0)+used(e,bs,kf)});if(isFinite(first))for(let t=from;t<=end0;t+=D){const k=day0(t),d=(new Date(k).getDay()+6)%7;wd[d]+=sums[k]||0;wc[d]++}}
    const wavg=wd.map((x,i)=>wc[i]?x/wc[i]:0),wmax=wavg.indexOf(Math.max(...wavg)),WD=['Mo','Di','Mi','Do','Fr','Sa','So'];
    return head+kseg+`<button class="btn soft" id="toYear2" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('gauge',18)}Jahressaldo ${period(off).s.getFullYear()} öffnen</button>${kf=='Wiederkehrend'||!bs.some(x=>!isK(x))?`<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Ø pro Monat<b>${eur0(avg)}</b></div><div class="kpi">Geplant/Monat<b>${eur0(lim)}</b></div><div class="kpi">Letzter Monat<b>${eur0(tots[tots.length-2]||0)}</b></div></div>`:`<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Ø pro Monat<b>${eur0(avg)}</b></div><div class="kpi">Im Budget<b>${good} von ${past.length}</b></div><div class="kpi">Ø übrig<b class="${lim-avg>=0?'in':''}">${eur0(lim-avg)}</b></div></div>`}
    <div class="sec"><div class="sh">Ausgaben, 12 Monate</div><div class="chartbox">${lineChart({n:N,labels:lab,tipLab:mlab,series:bs.length>1?[...ser,{pts:tots,col:'var(--fg)',w:1.6,dash:'2 3',name:'Zusammen'}]:ser,refs:lim?[{v:lim,col:'var(--bad)',label:KL.label}]:[]})}
     ${bs.length>1?`<div class="legend">${bs.map(b=>`<span><i style="background:${HEX[b]}"></i>${esc(b)}</span>`).join('')}<span><i style="background:var(--fg)"></i>Zusammen</span></div>`:''}</div></div>
    ${lim&&kf!='Wiederkehrend'?`<div class="sec"><div class="sh">Übrig am Monatsende</div><div class="chartbox">${barChart({vals:rests.map(x=>Math.max(x,0)),col:'var(--ok)',hi:N-1,tipLab:mlab,tipName:'Übrig',labels:lab.map(l=>({i:l.i,t:l.t}))})}<div class="note" style="padding:6px 4px 0">Das wandert jeweils in die Sinking Funds. Insgesamt ${eur0(rests.slice(0,-1).reduce((s,x)=>s+Math.max(x,0),0))} in 11 Monaten.</div></div></div>`:''}
    <div class="sec"><div class="sh">Typischer Wochentag</div><div class="chartbox">${barChart({vals:wavg,col,hi:wmax,labels:WD.map((t,i)=>({i,t})),h:130,tipLab:i=>['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'][i]+' · Ø',tipName:''})}<div class="note" style="padding:6px 4px 0">Am ${['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'][wmax]} gibst du im Schnitt am meisten aus (${eur(wavg[wmax])}).</div></div></div><div class="sec"><div class="sh">Kategorien im Trend</div>${catTrend(bs)}</div><div class="sec"><div class="sh">Entwicklung</div>${(()=>{try{return devHtml()}catch(e){return ''}})()}</div>`}
  return head+catTrend(bs)}
const fd=t=>new Date(t).toLocaleDateString('de-DE',{day:'numeric',month:'short',year:new Date(t).getFullYear()!=now.getFullYear()?'numeric':undefined});
function goalsHtml(){const act=S.goals.filter(g=>!g.done&&!g.dropped),fin=S.goals.filter(g=>g.done);
  const tot=act.reduce((s,g)=>s+g.dep.reduce((a,d)=>a+d.a,0),0),YS={};yplanStatus().forEach(x=>{if(x.g)YS[x.g.id]=x});
  return `${potHtml(sinkPot(),false)}<div class="sec"><div class="sh"><span>Sparziele</span><span>${eur0(tot)} zurückgelegt${S.sink3?' · '+eur0(sinkSum())+'/Monat':''}</span></div><div class="group">${act.map(g=>{const sv=g.dep.reduce((a,d)=>a+d.a,0),pc=Math.min(sv/g.ziel,1),rest=Math.max(g.ziel-sv,0),gr=S.sink3?Math.min(+g.rate||0,rest):Math.max(S.budgets['Sinking Funds']||100,1),mon=gr>0?Math.ceil(rest/gr):0,ys=YS[g.id],pj=g.proj&&projs().find(x=>x.id==g.proj);
   return `<div class="cell" style="align-items:flex-start"><div class="ico" style="background:color-mix(in srgb,var(--sink) 16%,transparent);color:var(--sink)">${I('target')}</div><div class="t">
    <div style="display:flex;align-items:center;gap:6px">${esc(g.n)}<button class="ed-ic" data-ged="${g.id}" aria-label="Sparziel bearbeiten">${I('pen',14)}</button></div><div class="s">Seit ${fd(g.t)} · ${g.from=='Wunsch'?'aus der Wunschliste':g.from=='Jahresplaner'?'aus dem Jahresplaner':g.from=='Projekt'?'für ein Projekt':'selbst angelegt'}${g.g?' · Gefühl damals: '+esc(g.g):''}</div>${g.m||pj?`<div class="gbad">${g.m?`<span>${I('calendar',11)} fällig ${MN[g.m-1]}${g.yearly?' · jährlich':''}</span>`:''}${pj?`<button data-pjgo="${esc(pj.id)}">${I('target',11)} Projekt ${esc(pj.n)} ›</button>`:''}</div>`:''}
    ${g.w?`<div class="s">„${esc(g.w)}“</div>`:''}
    <div class="bar" style="height:8px"><i class="grow" data-to="${(pc*100).toFixed(1)}" ${growFrom[g.id]!=null?`data-from="${(growFrom[g.id]*100).toFixed(1)}"`:''} style="width:${(pc*100).toFixed(0)}%;background:${pc>=1?'var(--ok)':'var(--sink)'}"></i></div>
    <div class="s">${eur(sv)} von ${eur(g.ziel)}${rest?(ys?` · noch ${eur(rest)} · ${eur(ys.need)} pro Monat bis ${MN[g.m-1]} · <b class="${ys.ok?'in':'out'}">${ys.ok?'auf Kurs':eur0(ys.behind)+' hinterher'}</b>`:(mon?` · noch ${eur(rest)}, bei ${eur0(gr)} im Monat ca. ${mon} Monat${mon>1?'e':''}`:` · noch ${eur(rest)} · <button class="ed-link" data-ged="${g.id}" style="color:var(--blue)">Monatsrate festlegen</button>`)):' · Ziel erreicht'}</div>
    ${g.dep.length?`<button class="s ed-link" style="color:var(--blue)" data-ged="${g.id}">${g.dep.length} Einzahlung${g.dep.length>1?'en':''} ansehen und bearbeiten ›</button>`:''}
    ${g.dep.length?`<div class="s">Zuletzt ${eur(g.dep[g.dep.length-1].a)} am ${fd(g.dep[g.dep.length-1].t)}${g.dep[g.dep.length-1].src?' aus '+esc(g.dep[g.dep.length-1].src):''}</div>`:''}
    <div class="choices" style="align-items:center">${rest?`<button data-gdep="${g.id}">${I('piggy',15)} Zurücklegen</button>`:`<button data-gbuy="${g.id}">Jetzt bewusst kaufen</button>`}<button data-gdrop="${g.id}" style="color:var(--muted)">Aufgeben</button></div>
   </div></div>`}).join('')||'<div class="empty">Noch keine Ziele. Ein Ziel entsteht aus einem Wunsch, im Jahresplan oder für ein Projekt.</div>'}</div>
   </div>
  ${fin.length?`<div class="sec"><div class="sh">Erreichte Sparziele</div><div class="group">${fin.map(g=>`<div class="cell plain"><div class="t"><div>${esc(g.n)}</div><div class="s">Angelegt ${fd(g.t)} · gekauft ${fd(g.done)}</div></div><div class="v in" style="display:flex;align-items:center;gap:4px">${I('check',16)}${eur(g.ziel)}</div></div>`).join('')}</div></div>`:''}`}
/* ---------- Wirkung der Impulsbremsen ---------- */
/* ---------- Konsum-Journal ---------- */
const JOUT={resist:['Widerstanden','check','var(--ok)'],wish:['Auf Wunschliste','heart','var(--accent)'],bought:['Gekauft','cart','var(--warn)'],note:['Nur Notiz','pen','var(--muted)']};
function jParse(v){const l=spoken(v).toLowerCase();let txt=String(v).replace(/^\s*(journal|tagebuch|konsum-?journal|notiz|eintrag)\s*[:,-]?\s*/i,'').replace(/,?\s*(\d+(?:[.,]\d{1,2})?)\s*(€|euro)\s*$/i,'').trim();txt=txt.charAt(0).toUpperCase()+txt.slice(1);
  const g=EMOALL.find(x=>l.includes(x.toLowerCase()))||(/stress/.test(l)?'gestresst':/langw?e?weil|langeweile|langweil/.test(l)?'gelangweilt':/belohn|verdient/.test(l)?'Belohnung':/traurig|frust|down/.test(l)?'traurig':/euphor|gute laune|happy/.test(l)?'euphorisch':'');
  const tr=TRIG.find(x=>l.includes(x.toLowerCase()))||(/insta/.test(l)?'Instagram':/tiktok/.test(l)?'TikTok':/werbung|anzeige/.test(l)?'Werbung':/laden|geschäft|schaufenster/.test(l)?'Im Laden':/scroll|online|handy/.test(l)?'Scrollen':/freund|kolleg/.test(l)?'Freunde':'');
  const out=/nicht gekauft|widerstanden|verzichtet|nicht nachgegeben|liegen ?gelassen|nein gesagt/.test(l)?'resist':/wunschliste|warte|merke/.test(l)?'wish':/gekauft|bestellt|nachgegeben|zugeschlagen|geholt/.test(l)?'bought':'note';
  const am=amtIn(l);const um=l.match(/(?:drang|lust|impuls)\D{0,12}(\d)\s*(?:\/|von)\s*5/);return{id:uid(),t:Date.now(),txt,g,tr,out,a:am||null,u:um?+um[1]:null}}
function jIcon(o){const x=JOUT[o]||JOUT.note;return `<span class="ico" style="background:color-mix(in srgb,${x[2]} 16%,transparent);color:${x[2]}">${I(x[1],16)}</span>`}
function jRow(j){return `<button class="jrow" data-jr="${j.id}">${jIcon(j.out)}<span class="jrow-t"><b>${esc(j.txt||JOUT[j.out][0])}</b><small>${new Date(j.t).toLocaleString('de-DE',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}${j.g&&j.g!='neutral'?' · '+esc(j.g):''}${j.tr?' · '+esc(j.tr):''}${j.u?' · Drang '+j.u+'/5':''}</small></span>${j.a?`<span class="jrow-v ${j.out=='resist'?'in':''}">${eur(j.a)}</span>`:''}</button>`}
function openJournal(id,pre){S.journal=S.journal||[];const ex=S.journal.find(x=>x.id==id),j=Object.assign({id:uid(),t:Date.now(),txt:'',g:'',tr:'',out:'resist',a:null,u:3},ex||{},pre||{});
  const draw=()=>{$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Journal"><div class="sheet-h"><button id="jX">Abbrechen</button><b>${ex?'Eintrag':'Neuer Eintrag'}</b><button id="jS" style="font-weight:600">Sichern</button></div>
   <div class="sheet-b"><textarea class="box" id="jT" placeholder="Was war los? Z. B. „Wollte nach dem Meeting Sneaker bestellen“" style="min-height:76px">${esc(j.txt)}</textarea>
   <div class="sh" style="padding:0">Wie ging es aus?</div><div class="seg" id="jO">${Object.entries(JOUT).map(([k,v])=>`<button class="${j.out==k?'on':''}" data-v="${k}">${v[0].replace('Auf ','')}</button>`).join('')}</div>
   <div class="group"><div class="cell plain"><label for="jA">Betrag (optional)</label><input id="jA" inputmode="decimal" value="${j.a?String(j.a).replace('.',','):''}" placeholder="0,00" style="max-width:110px;text-align:right;margin-left:auto"><span>€</span></div>
    <div class="cell plain"><span>Drang</span><span style="flex:1"></span><div class="seg" id="jU" style="width:200px">${[1,2,3,4,5].map(n=>`<button class="${j.u==n?'on':''}" data-v="${n}">${n}</button>`).join('')}</div></div>
    <div class="cell plain"><label for="jD">Wann</label><input id="jD" type="datetime-local" value="${new Date(j.t-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16)}" style="margin-left:auto"></div></div>
   <div class="sh" style="padding:0;display:flex;justify-content:space-between"><span>Wie hast du dich gefühlt?</span><span id="jVl" style="color:${vCol(jVal(j))};text-transform:none">${jVal(j)==null?'noch offen':VLAB[jVal(j)]}</span></div>
   <div class="group"><div class="cell plain" style="gap:10px"><span aria-hidden="true">☹︎</span><input id="jV" type="range" min="-3" max="3" step="1" value="${jVal(j)==null?0:jVal(j)}" aria-label="Stimmung von negativ bis positiv" style="flex:1;accent-color:${vCol(jVal(j)==null?0:jVal(j))}"><span aria-hidden="true">☺︎</span></div></div>
   <div class="chips wrap" id="jG">${[...new Set([...(EMOV[String(jVal(j)==null?0:jVal(j))]||[]),...jGs(j)])].map(x=>`<button class="chip ${jGs(j).includes(x)?'on':''}" data-v="${esc(x)}" ${jGs(j).includes(x)?`style="border-color:${vCol(jVal(j))}"`:''}>${esc(x)}</button>`).join('')}</div>
   <div class="sh" style="padding:0">Auslöser</div><div class="chips wrap" id="jTr">${TRIG.map(x=>`<button class="chip ${j.tr==x?'on':''}" data-v="${x}">${x}</button>`).join('')}</div>
   ${ex?'<button class="btn soft" id="jDel" style="color:var(--bad)">Eintrag löschen</button>':''}</div></div>`;
   const keep=()=>{j.txt=$('jT').value.trim();j.a=pNum($('jA').value)||null;const d=new Date($('jD').value);if(!isNaN(d))j.t=d.getTime()};
   $('scrim').onclick=$('jX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   document.querySelectorAll('#jO button').forEach(b=>b.onclick=()=>{keep();j.out=b.dataset.v;draw()});document.querySelectorAll('#jU button').forEach(b=>b.onclick=()=>{keep();j.u=+b.dataset.v;draw()});
   $('jV').oninput=()=>{const v=+$('jV').value;$('jVl').textContent=VLAB[v];$('jVl').style.color=vCol(v);$('jV').style.accentColor=vCol(v)};$('jV').onchange=()=>{keep();j.v=+$('jV').value;draw()};
   document.querySelectorAll('#jG .chip').forEach(b=>b.onclick=()=>{keep();const g=b.dataset.v,L=jGs(j).slice(),i=L.indexOf(g);if(i>=0)L.splice(i,1);else L.push(g);j.gs=L;j.g=L[0]||'';if(j.v==null)j.v=jVal({g:j.g});draw()});document.querySelectorAll('#jTr .chip').forEach(b=>b.onclick=()=>{keep();j.tr=j.tr==b.dataset.v?'':b.dataset.v;draw()});
   if($('jDel'))$('jDel').onclick=()=>{const ss=JSON.stringify(S.journal);S.journal=S.journal.filter(x=>x.id!=j.id);save();$('sheetRoot').innerHTML='';render();tell('Eintrag gelöscht.',()=>{S.journal=JSON.parse(ss);save();render()})};
   $('jS').onclick=()=>{keep();if(!j.txt&&!j.a){$('jT').focus();return}const i=S.journal.findIndex(x=>x.id==j.id);if(i>=0)S.journal[i]=j;else S.journal.push(j);save();$('sheetRoot').innerHTML='';render();if(!ex&&j.out=='note'&&(j.u||0)>=4){setTimeout(()=>openUrge(j.id),250);return}tell(j.out=='resist'?'Stark! Im Journal gespeichert.':'Im Journal gespeichert.');if(j.out=='wish'&&!ex&&j.a)setTimeout(()=>{openWish();setTimeout(()=>{if($('wname'))$('wname').value=j.txt.slice(0,40);if($('wpreis'))$('wpreis').value=String(j.a).replace('.',',')},60)},400)}};draw()}
function jStats(from){const J=(S.journal||[]).filter(j=>j.t>=from),cnt=(k)=>{const m={};J.forEach(j=>{if(j[k])m[j[k]]=(m[j[k]]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
  const res=J.filter(j=>j.out=='resist'),bou=J.filter(j=>j.out=='bought'),hrs=Array(4).fill(0);J.forEach(j=>{const h=new Date(j.t).getHours();hrs[h<12?0:h<17?1:h<21?2:3]++});
  return{J,res:res.length,resV:res.reduce((s,j)=>s+(j.a||0),0),bou:bou.length,bouV:bou.reduce((s,j)=>s+(j.a||0),0),g:(()=>{const m={};J.forEach(j=>jGs(j).forEach(x=>m[x]=(m[x]||0)+1));return Object.entries(m).sort((a,b)=>b[1]-a[1])})().filter(x=>x[0]!='neutral'),vRes:(()=>{const v=res.map(jVal).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null})(),vBou:(()=>{const v=bou.map(jVal).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null})(),gBou:(()=>{const m={};bou.forEach(j=>jGs(j).forEach(x=>m[x]=(m[x]||0)+1));return Object.entries(m).sort((a,b)=>b[1]-a[1])})(),tr:cnt('tr'),hrs,uAvg:J.filter(j=>j.u).length?J.filter(j=>j.u).reduce((s,j)=>s+j.u,0)/J.filter(j=>j.u).length:null}}
/* ---------- Gefühls-Kalender, Reue-Check, Kurz warten ---------- */
const EMOV={'-3':['wütend','verzweifelt','überfordert','einsam','beschämt'],'-2':['gestresst','traurig','ängstlich','frustriert','erschöpft','neidisch'],'-1':['gelangweilt','unruhig','leer','müde','genervt'],'0':['neutral','gelangweilt','müde','abgelenkt'],'1':['zufrieden','entspannt','Belohnung','dankbar'],'2':['glücklich','verbunden','stolz','Belohnung','motiviert'],'3':['euphorisch','aufgeregt','stolz','verliebt','in Feierlaune']};
const EMOALL=[...new Set(Object.values(EMOV).flat())],EMOOF=g=>{for(const k of ['-3','-2','-1','0','1','2','3'])if(EMOV[k].includes(g))return +k;return null};
const GEFV={neutral:0,gestresst:-2,gelangweilt:-1,Belohnung:1,traurig:-2,euphorisch:3};
const jVal=j=>j.v!=null?j.v:j.g?(GEFV[j.g]!=null?GEFV[j.g]:EMOOF(j.g)):null,jGs=j=>j.gs&&j.gs.length?j.gs:j.g?[j.g]:[];
const vCol=v=>v==null?'#9A93AD':v<0?`color-mix(in srgb,#E5484D ${Math.round(-v/3*100)}%,#9A93AD)`:v>0?`color-mix(in srgb,#2FB36B ${Math.round(v/3*100)}%,#9A93AD)`:'#9A93AD';
const VLAB={'-3':'sehr schlecht','-2':'schlecht','-1':'eher schlecht','0':'neutral','1':'eher gut','2':'gut','3':'sehr gut'};
const MOODC={gestresst:'#E5484D',gelangweilt:'#F0A12D',Belohnung:'#2FB36B',traurig:'#3B82C4',euphorisch:'#D946EF',neutral:'#9A93AD'};
let moodOff=0;
function moodCal(){const base=new Date();base.setDate(1);base.setMonth(base.getMonth()+moodOff);const y=base.getFullYear(),m=base.getMonth(),dim=new Date(y,m+1,0).getDate(),lead=(new Date(y,m,1).getDay()+6)%7;
  const J=S.journal||[],day=d=>new Date(y,m,d).toDateString(),spend=ds=>S.exp.filter(e=>e.type=='out'&&!isPlan(e)&&!isRecE(e)&&new Date(e.t).toDateString()==ds&&TOT.includes(e.b)).reduce((s,e)=>s+e.a,0);
  const cells=[],byMood={};let mx=1;const D=[];for(let d=1;d<=dim;d++){const ds=day(d),js=J.filter(j=>new Date(j.t).toDateString()==ds&&(j.g||j.v!=null||(j.gs&&j.gs.length))),cnt={};js.forEach(j=>jGs(j).forEach(x=>cnt[x]=(cnt[x]||0)+1));const g=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];const vs=js.map(jVal).filter(v=>v!=null),vv=vs.length?Math.round(vs.reduce((a,b)=>a+b,0)/vs.length):null;const sp=spend(ds);mx=Math.max(mx,sp);D.push({d,ds,g:g&&g[0],v:vv,sp,n:js.length});if(g&&new Date(y,m,d)<=new Date()){(byMood[g[0]]=byMood[g[0]]||[]).push(sp)}}
  for(let i=0;i<lead;i++)cells.push('<span></span>');D.forEach(x=>cells.push(`<button class="mcell ${x.ds==new Date().toDateString()?'today':''}" data-mday="${x.ds}" style="${x.g||x.v!=null?`background:color-mix(in srgb,${vCol(x.v)} 30%,var(--card));border-color:${vCol(x.v)}`:''}" title="${x.g||''}${x.v!=null?' · '+VLAB[x.v]:''}"><b>${x.d}</b>${x.sp?`<i style="height:${Math.max(8,x.sp/mx*100).toFixed(0)}%"></i>`:''}</button>`));
  const noMood=D.filter(x=>!x.g&&new Date(x.ds)<=new Date()).map(x=>x.sp),avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0,base0=avg(noMood);
  const ins=Object.entries(byMood).map(([g,a])=>({g,v:avg(a),n:a.length})).filter(x=>x.n>=1).sort((a,b)=>b.v-a.v);
  return `<div class="sec"><div class="sh"><span>Gefühls-Kalender</span><span class="mnav"><button class="link" id="moodP">‹</button> ${base.toLocaleDateString('de-DE',{month:'long',year:'numeric'})} <button class="link" id="moodN" ${moodOff>=0?'disabled':''}>›</button></span></div>
   <div class="mcal">${['Mo','Di','Mi','Do','Fr','Sa','So'].map(w=>`<span class="mh">${w}</span>`).join('')}${cells.join('')}</div>
   <div class="legend"><span><i style="background:${vCol(-3)}"></i>sehr schlecht</span><span><i style="background:${vCol(-1)}"></i>eher schlecht</span><span><i style="background:${vCol(0)}"></i>neutral</span><span><i style="background:${vCol(1)}"></i>eher gut</span><span><i style="background:${vCol(3)}"></i>sehr gut</span><span>Balken = Ausgaben aus Budgets</span></div>
   ${ins.length?`<div class="mmcard">${ins.map(x=>`<div class="srow"><div class="srow-h"><span><i class="mdot" style="background:${vCol(GEFV[x.g]!=null?GEFV[x.g]:EMOOF(x.g))}"></i>${esc(x.g)} <small style="color:var(--muted)">${x.n} Tag${x.n>1?'e':''}</small></span><span></span><b>Ø ${eur0(x.v)}</b></div></div>`).join('')}<div class="srow"><div class="srow-h"><span style="color:var(--muted)">Tage ohne Eintrag</span><span></span><b>Ø ${eur0(base0)}</b></div></div></div>
   ${(()=>{const t=ins[0];return t&&noMood.length>=3&&t.n>=2&&t.v>base0*1.3&&t.v-base0>10?`<div class="note">An Tagen mit „${esc(t.g)}“ gibst du im Schnitt ${eur0(t.v-base0)} mehr aus als sonst.</div>`:''})()}`:''}</div>`}
/* Reue-Check */
const isKonsum=e=>e.type=='out'&&!isRecE(e)&&!e.corr&&e.a>=10&&(/gönn/i.test(e.b)||KONSUM.some(k=>(e.c||'').includes(k)));
function rgDue(){if(!S.rgSince){S.rgSince=Date.now();save()}const n=Date.now();return S.exp.filter(e=>isKonsum(e)&&e.rg==null&&!isPlan(e)&&e.t>=S.rgSince-864e5&&n-e.t>=20*36e5&&n-e.t<7*864e5).sort((a,b)=>b.t-a.t).slice(0,2)}
function rgSet(id,v){const e=S.exp.find(x=>x.id==id);if(!e)return;e.rg=v;save();tell(v?'Notiert. Das nächste Mal hilft dir das beim Entscheiden.':'Schön, dass es sich gelohnt hat!');if(v)setTimeout(()=>openJournal(null,{txt:'Bereue Kauf: '+(e.n||e.c),out:'bought',a:e.a,t:e.t,g:''}),300)}
/* Kurz warten */
let urgeT=null;
function openUrge(jid){S.journal=S.journal||[];if(!jid){const r=S.journal.slice().reverse().find(x=>x.txt=='Kaufimpuls'&&!x.g&&!x.tr&&x.a==null&&Date.now()-x.t<30*6e4);if(r)jid=r.id}let j=S.journal.find(x=>x.id==jid);if(!j){j={id:uid(),t:Date.now(),txt:'Kaufimpuls',g:'',tr:'',out:'note',a:null,u:4};S.journal.push(j);save()}
  const g=(S.goals||[]).filter(x=>!x.done&&!x.dropped).map(x=>({x,ist:(x.dep||[]).reduce((s,d)=>s+d.a,0)})).sort((a,b)=>(b.ist/b.x.ziel)-(a.ist/a.x.ziel))[0];
  const draw=()=>{const left=S.urge&&S.urge.jid==j.id?Math.max(0,S.urge.until-Date.now()):null,mm=left!=null?Math.floor(left/6e4)+':'+String(Math.floor(left%6e4/1e3)).padStart(2,'0'):'10:00';
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Kurz warten"><div class="sheet-h"><button id="ugX">Schließen</button><b>Kurz warten</b><span style="width:60px"></span></div>
   <div class="sheet-b"><div class="urge-t">${left==null?'Kurz innehalten.':left>0?'Atmen. Warten. Weitergehen.':'Die 10 Minuten sind um.'}</div>
   <div class="urge-c ${left===0?'done':''}">${left===0?I('check',40):mm}</div>
   ${left==null?`<button class="btn" id="ugGo">10 Minuten warten</button>`:left>0?``:''}
   <div class="mmcard">${j.a?`<div class="srow"><div class="srow-h"><span>${I('briefcase',15)} Das sind</span><span></span><b>${std(j.a)}</b></div></div>`:''}
    ${g?`<div class="srow"><div class="srow-h"><span>${I('target',15)} ${esc(g.x.n)}</span><span></span><b>noch ${eur0(Math.max(g.x.ziel-g.ist,0))}</b></div></div>`:''}
    <div class="srow"><div class="srow-h"><span>${I('heart',15)} Auf die Wunschliste setzen</span><span></span><b>${j.a?Math.round(wait(j.a)/864e5)+' Tage':'Wartezeit'}</b></div></div>
    <div class="srow" style="color:var(--muted);font-size:13px">Was brauchst du gerade wirklich? Pause, Bewegung, jemanden anrufen, ein Glas Wasser?</div></div>
   <div class="sh" style="padding:0">Wie ist es ausgegangen?</div><div class="choices"><button data-ugo="resist">Widerstanden</button><button data-ugo="wish">Wunschliste</button><button data-ugo="bought">Doch gekauft</button></div></div></div>`;
   $('scrim').onclick=$('ugX').onclick=()=>{clearInterval(urgeT);$('sheetRoot').innerHTML='';render()};
   if($('ugGo'))$('ugGo').onclick=()=>{S.urge={jid:j.id,until:Date.now()+10*6e4};save();try{pushPlan(true)}catch(e){}draw()};
   document.querySelectorAll('[data-ugo]').forEach(b=>b.onclick=()=>{j.out=b.dataset.ugo;if(S.urge&&S.urge.jid==j.id)S.urge=null;save();clearInterval(urgeT);$('sheetRoot').innerHTML='';render();tell(j.out=='resist'?'Stark! Das zählt in deiner Verzicht-Bilanz.':j.out=='wish'?'Ab auf die Wunschliste.':'Okay. Ehrlich notiert ist auch ein Schritt.');
     if(j.out=='wish')setTimeout(()=>{openWish();setTimeout(()=>{if($('wname'))$('wname').value=(j.txt||'').slice(0,40);if(j.a&&$('wpreis'))$('wpreis').value=String(j.a).replace('.',',')},60)},350)})};
  clearInterval(urgeT);urgeT=setInterval(()=>{if(!document.querySelector('[aria-label="Kurz warten"]')){clearInterval(urgeT);return}if(S.urge&&S.urge.jid==j.id){const l=S.urge.until-Date.now();if(l<=0){clearInterval(urgeT);if(navigator.vibrate)navigator.vibrate([80,60,80])}draw()}},1000);draw()}
function journalHtml(){const J=(S.journal||[]).slice().sort((a,b)=>b.t-a.t),st=jStats(Date.now()-30*864e5),HL=['morgens','mittags','abends','nachts'],hm=st.hrs.indexOf(Math.max(...st.hrs));
  const RG=S.exp.filter(e=>e.rg!=null&&e.t>Date.now()-90*864e5),rgN=RG.filter(e=>e.rg).length;
  return `<div class="jbtns"><button class="btn" id="jUrge" style="display:flex;justify-content:center;gap:6px;align-items:center;background:var(--bad)">${I('alert',18)}Ich habe gerade einen Kaufimpuls</button><button class="btn soft" id="jNew" style="display:flex;justify-content:center;gap:6px;align-items:center">${I('plus',18)}Eintrag schreiben</button></div>
   
   ${st.J.length>=3?`<div class="sec"><div class="sh">Deine Muster · 30 Tage</div><div class="jins">
    <div><b>${st.res}</b><span>widerstanden${st.resV?' · '+eur0(st.resV):''}</span></div><div><b>${st.bou}</b><span>nachgegeben${st.bouV?' · '+eur0(st.bouV):''}</span></div>
    ${st.g[0]?`<div><b>${esc(st.g[0][0])}</b><span>häufigstes Gefühl (${st.g[0][1]}×)</span></div>`:''}${st.tr[0]?`<div><b>${esc(st.tr[0][0])}</b><span>häufigster Auslöser (${st.tr[0][1]}×)</span></div>`:''}
    <div><b>${HL[hm]}</b><span>die meisten Impulse</span></div>${st.vBou!=null||st.vRes!=null?`<div><b style="color:${vCol(st.vBou!=null?Math.round(st.vBou):null)}">${st.vBou!=null?(st.vBou>0?'+':'')+st.vBou.toFixed(1).replace('.',','):'–'}</b><span>Ø Stimmung beim Nachgeben</span></div><div><b style="color:${vCol(st.vRes!=null?Math.round(st.vRes):null)}">${st.vRes!=null?(st.vRes>0?'+':'')+st.vRes.toFixed(1).replace('.',','):'–'}</b><span>Ø Stimmung beim Widerstehen</span></div>`:''}${st.uAvg?`<div><b>${st.uAvg.toFixed(1).replace('.',',')}/5</b><span>Ø Drang</span></div>`:''}</div>
    ${st.tr[0]&&st.bou?`<div class="note">${(()=>{const t=st.tr[0][0],b=st.J.filter(j=>j.tr==t&&j.out=='bought').length;return b?`Bei „${esc(t)}“ gibst du ${b} von ${st.tr[0][1]} Malen nach. Vielleicht hilft es, diesen Auslöser gezielt zu meiden.`:`Bei „${esc(t)}“ bleibst du bisher standhaft. Weiter so!`})()}</div>`:''}</div>`:''}
   ${RG.length?`<div class="sec"><div class="sh">Reue-Check · 90 Tage</div><div class="jins"><div><b>${RG.length-rgN}</b><span>Käufe haben sich gelohnt</span></div><div><b>${rgN}</b><span>bereut · ${eur0(RG.filter(e=>e.rg).reduce((s,e)=>s+e.a,0))}</span></div></div>${rgN?`<div class="note">Bereut: ${RG.filter(e=>e.rg).slice(0,4).map(e=>esc(e.n||e.c)).join(', ')}${(()=>{const c={};RG.filter(e=>e.rg).forEach(e=>c[e.c]=(c[e.c]||0)+1);const t=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];return t&&t[1]>1?`. Am häufigsten in „${esc(t[0])}“.`:''})()}</div>`:''}</div>`:''}
   ${moodCal()}
   <div class="sec"><div class="sh">Einträge</div><div class="mmcard">${J.map(jRow).join('')||'<div class="empty">Noch keine Einträge. Schreib auf, wenn dich ein Kaufimpuls packt, egal ob du nachgibst oder nicht.</div>'}</div></div>`}
function wirkung(from){const W=S.wish||[],f=x=>(x||0)>=from;
  const dropped=W.filter(w=>w.s=='verworfen'&&f(w.dt||w.t)),saved=W.filter(w=>w.s=='Sparziel'&&f(w.dt||w.t)),bought=W.filter(w=>w.s=='gekauft'&&f(w.dt||w.t)),open=W.filter(w=>w.s=='offen');
  const goalsDone=(S.goals||[]).filter(g=>g.done&&f(g.done)),ovr=(S.ovrLog||[]).filter(x=>f(x.t)),blocked={length:Math.max(0,(S.brakeAtt||[]).filter(t=>f(t)).length-ovr.length)};
  const jr=(S.journal||[]).filter(j=>j.out=='resist'&&f(j.t));const decided=dropped.length+saved.length+bought.length;
  return{jr:jr.length,jrV:jr.reduce((s,j)=>s+(j.a||0),0),dropV:dropped.reduce((s,w)=>s+(w.p||0),0)+jr.reduce((s,j)=>s+(j.a||0),0),drop:dropped.length,saveV:saved.reduce((s,w)=>s+(w.p||0),0),save:saved.length,buy:bought.length,buyV:bought.reduce((s,w)=>s+(w.p||0),0),open:open.length,goals:goalsDone.length,ovr:ovr.length,blocked:blocked.length,rate:decided?Math.round((dropped.length+saved.length)/decided*100):null}}
function wirkungHtml(){const y=new Date(new Date().getFullYear(),0,1).getTime(),m=period(0).s.getTime(),Y=wirkung(y),M=wirkung(m);if(!Y.drop&&!Y.save&&!Y.buy&&!Y.ovr&&!Y.blocked&&!Y.jr)return '';
  return `<div class="wk"><div class="wk-h">${I('sparkle',16)}<b>Dein Verzicht wirkt</b></div>
   <div class="wk-big">${eur0(Y.dropV+Y.saveV)}<small>${new Date().getFullYear()} nicht spontan ausgegeben</small></div>
   <div class="wk-g"><div><b>${Y.drop}</b><span>Wünsche losgelassen</span></div><div><b>${Y.save}</b><span>in Sparziele umgewandelt</span></div><div><b>${Y.rate==null?'–':Y.rate+' %'}</b><span>Verzichtsquote</span></div><div><b>${Y.blocked}</b><span>Notfallbremse hat gestoppt</span></div>${Y.jr?`<div><b>${Y.jr}</b><span>Impulse widerstanden (Journal)</span></div>`:''}</div>
   <div class="wk-f">Diesen Monat: ${eur0(M.dropV+M.saveV)} gespart durch Warten${M.ovr?` · Bremse ${M.ovr}× gelöst`:''}${Y.buy?` · gekauft nach Wartezeit: ${Y.buy} (${eur0(Y.buyV)})`:''}</div></div>`}
function notBoughtHtml(){const nb=[...S.wish.filter(w=>w.s=='verworfen').map(w=>({n:w.n,p:w.p,t:w.dt||w.t,g:w.g,w:w.w,k:'Wunsch verworfen'})),
   ...S.goals.filter(g=>g.dropped).map(g=>({n:g.n,p:g.ziel,t:g.dropped,g:g.g,w:g.w,k:'Sparziel aufgegeben'}))].sort((a,b)=>b.t-a.t);
  const bought=S.wish.filter(w=>w.s=='gekauft'),bySt={};nb.forEach(x=>bySt[x.g||'–']=(bySt[x.g||'–']||0)+x.p);
  return `<div class="sec"><div class="sh"><span>Nicht gekauft</span><span>${nb.length} Wünsche</span></div>
  <div class="balance" style="background:linear-gradient(150deg,var(--ok),color-mix(in srgb,var(--ok) 60%,var(--blue)))"><div class="gsub" style="color:inherit;opacity:.85">Gespart durch Verzicht</div><div class="bal">${eur(gespartV())}</div>
   <div class="gsub" style="color:inherit;opacity:.85">Das sind ${std(gespartV())}${bought.length?` · ${bought.length} bewusst gekauft`:''}</div></div>
  <div class="group">${nb.map(x=>`<div class="cell plain"><div class="t"><div>${esc(x.n)}</div><div class="s">${fd(x.t)} · ${x.k}${x.g?' · '+esc(x.g):''}</div>${x.w?`<div class="s">„${esc(x.w)}“</div>`:''}</div><div class="v" style="color:var(--ok)">${eur(x.p)}</div></div>`).join('')||'<div class="empty">Noch nichts verworfen.</div>'}</div>
  ${Object.keys(bySt).length?`<div class="note">Verzichtet nach Gefühl: ${Object.entries(bySt).sort((a,b)=>b[1]-a[1]).map(([k,v])=>esc(k)+' '+eur0(v)).join(' · ')}</div>`:''}</div>`}
let wishV='Ziele',zukV='Prog',zielV='Liste',wishS='Offen';
const GEF=['neutral','gestresst','gelangweilt','Belohnung','traurig','euphorisch'],TRIG=['Instagram','TikTok','Newsletter','Werbung','Freunde','Im Laden','Scrollen','Bedarf','Sonstiges'];
const tod=t=>{const h=new Date(t).getHours();return h<11?'Morgens':h<15?'Mittags':h<19?'Nachmittags':h<23?'Abends':'Nachts'};
function wishRow(w,i){const left=w.t+wait(w.p)-Date.now(),d=Math.ceil(left/864e5),pc=Math.min(1,1-left/wait(w.p));
  return `<div class="wrow"><div class="wrow-h"><div class="t"><div style="display:flex;align-items:center;gap:6px"><b>${esc(w.n)}</b><button class="ed-ic" data-wed="${i}" aria-label="Wunsch bearbeiten">${I('pen',14)}</button></div><button class="hours ed-link" data-setgo="lohn" title="Stundenlohn ändern">${std(w.p)}</button>
   <div class="s">${esc(w.g)}${w.tr?' · '+esc(w.tr):''}${w.w?' · „'+esc(w.w)+'“':''}${w.l?` · <a href="${esc(w.l)}" target="_blank" rel="noopener" style="color:var(--blue)">Link</a>`:''}</div></div><div class="v"><b>${eur(w.p)}</b></div></div>
   <div class="bar" style="height:6px"><i style="width:${(pc*100).toFixed(0)}%;background:${left>0?'var(--muted)':'var(--ok)'}"></i></div>
   ${left>0?`<div class="s" style="display:flex;gap:4px;align-items:center">${I('hourglass',13)} Noch ${d} Tag${d>1?'e':''} Sperre · frei ab ${new Date(w.t+wait(w.p)).toLocaleDateString('de-DE',{day:'numeric',month:'short'})}</div>
     <div class="choices"><button data-i="${i}" data-s="Sparziel">Schon jetzt als Sparziel</button><button data-i="${i}" data-s="verworfen" style="color:var(--ok)">Verwerfen</button></div>`
    :`<div class="s">14 Tage vorbei. Willst du das immer noch?</div><div class="choices"><button data-kc="${i}">Aus ${esc(SHORT[GN()]||GN())} kaufen</button><button data-i="${i}" data-s="Sparziel">Als Ziel ansparen</button><button data-i="${i}" data-s="verworfen" style="color:var(--ok)">Verwerfen</button></div>`}</div>`}
function musterHtml(){const W=S.wish;if(!W.length)return '';const grp=f=>{const g={};W.forEach(w=>{const k=f(w)||'–';g[k]=g[k]||{n:0,v:0,no:0};g[k].n++;g[k].v+=w.p;if(w.s=='verworfen')g[k].no++});return Object.entries(g).sort((a,b)=>b[1].n-a[1].n)};
  const tbl=(t,rows)=>`<div class="sec"><div class="sh">${t}</div><div class="mmcard">${rows.map(([k,x])=>`<div class="srow"><div class="srow-h"><span>${esc(k)}</span><span class="s" style="font-size:12px;color:var(--muted)">${x.n} Wünsche · ${Math.round(x.no/x.n*100)} % verworfen</span><span>${eur0(x.v)}</span></div><div class="bar" style="height:5px"><i style="width:${(x.n/W.length*100).toFixed(0)}%;background:var(--blue)"></i></div></div>`).join('')}</div></div>`;
  const tr=grp(w=>w.tr),top=tr[0],hints=[];if(top&&['Instagram','TikTok','Scrollen'].includes(top[0]))hints.push('Die meisten Wünsche kommen beim Scrollen. Shopping-Accounts entfolgen oder Bildschirmzeit für die App begrenzen.');
  if(top&&top[0]=='Newsletter')hints.push('Newsletter sind dein häufigster Auslöser. Heute zwei davon abbestellen.');const g=grp(w=>w.g)[0];if(g&&g[0]!='neutral')hints.push(`Bei „${g[0]}“ entstehen die meisten Wünsche. Plane für solche Momente eine Alternative, zum Beispiel eine Runde Klettern oder ein Anruf.`);
  return `<div class="sec"><div class="sh">Deine Muster</div>${hints.map(x=>`<div class="tip">${x}</div>`).join('')}</div>${tbl('Nach Gefühl',grp(w=>w.g))}${tbl('Nach Auslöser',tr)}${tbl('Nach Tageszeit',grp(w=>tod(w.t)))}`}
/* v257: Reiter Geld – Geldfluss von Eingang über Ausgeben und Sparen bis Vermögen */
function viewGeld(){if(posView)return posHtml();
  const pa=pufAcc(),sa=sinkAcc(),sp=sa?sinkPot():null,B=BUDG.filter(b=>b!=sa),m=(n,v)=>WH(n)?MASK:v;
  const cell=(attr,col,ico,t,s,v,neg)=>`<button class="cell" ${attr}><div class="ico" style="background:color-mix(in srgb,${col} 16%,transparent);color:${col}">${I(ico,16)}</div><div class="t"><div>${t}</div><div class="s">${s}</div></div><div class="v${neg?' out':''}">${v}</div><span class="chev">›</span></button>`;
  const st=(t,body)=>body?`<div class="sec"><div class="sh"><span>${t}</span></div><div class="group">${body}</div></div>`:'';
  const pv=pufVal(),eing=pa?cell(`data-b="${esc(pa.n)}"`,COL[pa.n]||'var(--blue)','wallet',esc(SHORT[pa.n]||pa.n),`Gehalt und Fixkosten · noch ${eur0(pufOpen().sum)} offen`,m(pa.n,eur0(pufBal())))
    +cell(`data-b="${esc(pa.n)}"`,'var(--ok)','lock','Puffer',pv>=pufZiel()?`Ziel ${eur0(pufZiel())} erreicht`:`Ziel ${eur0(pufZiel())} · noch ${eur0(pufZiel()-pv)}`,m(pa.n,eur0(pv)),pv<0):'';
  const aus=B.map(b=>{const c=calc(b);return cell(`data-b="${esc(b)}"`,COL[b],'wallet',esc(SHORT[b]||b),`${eur(c.tag)} pro Tag`,eur0(c.rest),c.rest<0)}).join('');
  const spar=sa?cell(`data-tabgo="wish"`,COL[sa]||'var(--ok)','target',esc(SHORT[sa]||sa),`${eur0(sp.alloc)} für Ziele verplant · ${eur0(sp.free)} frei`,m(sa,eur0(sp.bal))):'';
  return appbar({title:'Geld',big:'Wo dein Geld steht'})+st('Eingang & Puffer',eing)+st('Ausgeben diesen Monat',aus)+st('Sparen für Wünsche & Reisen',spar)
   +depotHtml()+toolBar(['ng','ru','pension'])}
function viewWish(){const open=S.wish.map((w,i)=>[w,i]).filter(([w])=>w.s=='offen'),act=S.goals.filter(g=>!g.done&&!g.dropped).length;
  /* v232: Reiter Planen = Ziele (inkl. Jahresplan), Wünsche in Wartezeit, Fixkosten, Zukunft (Prognose + Was-wäre-wenn) */
  const big=wishV=='Wünsche'?(open.length?open.length+(open.length==1?' Wunsch offen':' Wünsche offen'):'Alles entschieden'):wishV=='Ziele'?(act?act+(act==1?' Ziel aktiv':' Ziele aktiv'):'Keine Ziele'):wishV=='Fixkosten'?'Fixkosten':wishV=='Monat'?'Monatswechsel':'Nächste 6 Monate';
  const head=appbar({title:'Planen',big,left:wishV=='Wünsche'?`<button class="ab-ic" id="wishNew" aria-label="Neuer Wunsch">${I('plus',22)}</button>`:'',tabs:{id:'wishV',cur:wishV,items:[['Ziele','Ziele',act],['Wünsche','Wünsche',open.length],['Fixkosten','Fixkosten'],['Zukunft','Zukunft'],['Monat','Monat',(S.closeDone||{})[pkey(period(closeTarget()))]?'':'!']]}});
  if(wishV=='Ziele'){/* v234: Schuldenfrei als eigener Abschnitt in Ziele – Tilgen ist ein Ziel mit Enddatum */const D=(S.debts||[]).filter(d=>!d.done);
   const zseg=`<div class="seg" id="zielV">${[['Liste','Liste'],['Zeit','Zeitachse']].map(([v,l])=>`<button class="${zielV==v?'on':''}" data-f="${v}">${l}</button>`).join('')}</div>`;if(zielV=='Zeit')return head+zseg+viewYplan(true)+toolBar(['proj']);
   return head+zseg+goalsHtml()+(D.length?`<div class="sec"><div class="sh"><span>Schuldenfrei</span><button class="link" data-set="debts">Alle</button></div>${D.map(debtCard).join('')}</div>`:'')+toolBar(D.length?['proj']:['proj','debts'])}
  if(wishV=='Monat')return head+viewClose(true);
  if(wishV=='Fixkosten')return head+viewSet('rec').replace(/^<div class="lthead">[\s\S]*?<\/h1><\/div>/,'');
  if(wishV=='Zukunft')return head+`<div class="seg" id="zukV">${[['Prog','Prognose'],['Sim','Was wäre, wenn …']].map(([v,l])=>`<button class="${zukV==v?'on':''}" data-f="${v}">${l}</button>`).join('')}</div>${zukV=='Sim'?simHtml():forecastHtml()}
`;
  const wseg=`<div class="seg" id="wishS">${[['Offen','Offen'],['Verzicht','Verzicht'],['Journal','Journal']].map(([v,l])=>`<button class="${wishS==v?'on':''}" data-f="${v}">${l}</button>`).join('')}</div>`;
  if(wishS=='Verzicht')return head+wseg+wirkungHtml()+notBoughtHtml()+musterHtml();
  if(wishS=='Journal')return head+wseg+journalHtml();
  return head+wseg+`<div class="anchor">${I('lock',16)}<span>${ANCHOR}</span></div><div class="mmcard">${open.map(([w,i])=>wishRow(w,i)).join('')||'<div class="empty">Keine offenen Wünsche. Neue Wünsche kommen zuerst für 14 Tage hierher.</div>'}</div>
    `}
function openDebt(i){const d=i>=0?Object.assign({},S.debts[i]):{n:'',total:'',interest:'',rate:'',start:ymd(Date.now()),match:'',note:''};
  $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Kredit"><div class="sheet-h"><button id="dX">Abbrechen</button><b>${i>=0?'Kredit bearbeiten':'Neuer Kredit'}</b><button id="dS" style="font-weight:600">Sichern</button></div>
  <div class="sheet-b"><div class="group">
   <div class="cell plain"><label for="dn">Name</label><input id="dn" value="${esc(d.n)}" placeholder="z. B. Anyfin Kredit"></div>
   <div class="cell plain"><label for="dt">Gesamtbetrag inkl. Zinsen</label><input id="dt" inputmode="decimal" value="${d.total??''}"></div>
   <div class="cell plain"><label for="dz">davon Zinsen</label><input id="dz" inputmode="decimal" value="${d.interest??''}"></div>
   <div class="cell plain"><label for="dr">Monatsrate</label><input id="dr" inputmode="decimal" value="${(debtRec(d)?debtRec(d).a:d.rate)??''}"></div>${debtRec(d)?`<div class="cell plain" style="padding-top:0"><div class="s" style="font-size:12px;color:var(--muted)">${I('repeat',11)} Verknüpft mit der wiederkehrenden Buchung „${esc(debtRec(d).n||'')}“. Eine Änderung der Rate gilt dort mit.</div></div>`:''}
   <div class="cell plain"><label for="dd">Erste Rate</label><input id="dd" type="date" value="${d.start}"></div>
   <div class="cell plain"><label for="dm">Erkennen an Notiz</label><input id="dm" value="${esc(d.match||'')}" placeholder="z. B. Anyfin"></div>
   <div class="cell plain"><label for="dno">Wofür</label><input id="dno" value="${esc(d.note||'')}" placeholder="optional"></div></div><div class="note" id="dErr" style="padding:0;color:var(--bad)"></div></div></div>`;
  $('scrim').onclick=$('dX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
  $('dS').onclick=()=>{const o={id:d.id||uid(),n:$('dn').value.trim(),total:pNum($('dt').value),interest:pNum($('dz').value)||0,rate:pNum($('dr').value),start:$('dd').value,match:$('dm').value.trim()||$('dn').value.trim().split(' ')[0],note:$('dno').value.trim()};
    if(!o.n||!o.total||!o.rate){$('dErr').textContent='Bitte Name, Gesamtbetrag und Rate eintragen.';return}S.debts=S.debts||[];const lr=debtRec(o);if(lr){o.rid=lr.id;if(lr.a!==o.rate)recSetA(lr,o.rate)}if(i>=0)S.debts[i]=o;else S.debts.push(o);save();$('sheetRoot').innerHTML='';render();tell('Gesichert.',0,'nod',1)};renderAsst()}
function openRec(i,pre){const r=i>=0?Object.assign({},S.rec[i]):Object.assign({id:uid(),type:'out',b:ALL.includes('Comdirect')?'Comdirect':ALL[0],c:'',a:0,n:'',day:new Date().getDate(),every:1,start:ymd(Date.now())},pre||{});
  const draw=()=>{const cs=cats(r.b)||[['Sonstiges','dot']];if(r.type!='tr'&&!cs.some(c=>c[0]==r.c))r.c=cs[0][0];
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Wiederkehrende Buchung"><div class="sheet-h"><button id="rX">Abbrechen</button><b>${i>=0?'Bearbeiten':'Neu'}</b><button id="rS" style="font-weight:600">Sichern</button></div>
   <div class="sheet-b"><div class="seg" id="rTyp">${[['out','Ausgabe'],['in','Einnahme'],['tr','Umbuchung']].map(t=>`<button class="${r.type==t[0]?'on':''}" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
   <div class="group"><div class="cell plain"><label for="rN">Name</label><input id="rN" value="${esc(r.n)}" placeholder="z. B. Miete"></div>
    <div class="cell plain"><label for="rA">Betrag</label><input id="rA" inputmode="decimal" value="${r.a?String(r.a).replace('.',','):''}"></div>
    <div class="cell plain"><label for="rB">${r.type=='tr'?'Von':'Konto'}</label><select id="rB">${ALL.map(a=>`<option ${r.b==a?'selected':''}>${esc(a)}</option>`).join('')}</select></div>
    ${r.type=='tr'?`<div class="cell plain"><label for="rT">Nach</label><select id="rT">${ALL.filter(a=>a!=r.b).map(a=>`<option ${r.to==a?'selected':''}>${esc(a)}</option>`).join('')}</select></div>`:
     `<div class="cell plain"><label for="rC">Kategorie</label><select id="rC">${cs.map(c=>`<option ${r.c==c[0]?'selected':''}>${esc(c[0])}</option>`).join('')}</select></div>`}
    <div class="cell plain"><label for="rD">Am Tag</label><select id="rD">${Array.from({length:31},(_,k)=>`<option value="${k+1}" ${r.day==k+1?'selected':''}>${k+1}.</option>`).join('')}</select></div>
    <div class="cell plain"><label for="rE">Rhythmus</label><select id="rE">${[[1,'monatlich'],[2,'alle 2 Monate'],[3,'vierteljährlich'],[6,'halbjährlich'],[12,'jährlich']].map(([v,l])=>`<option value="${v}" ${(r.every||1)==v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="cell plain"><label for="rSt">Ab</label><input id="rSt" type="date" value="${r.start||''}"></div>
    <div class="cell plain"><label for="rEn">Bis (optional)</label><input id="rEn" type="date" value="${r.end||''}"></div>
    ${r.type=='out'&&!isK(r.b)?`<div class="cell plain" style="background:color-mix(in srgb,var(--warn) 12%,var(--card))"><div class="t"><div>${esc(r.b)} ist ein Budget</div><div class="s">Diese Ausgabe geht dann jeden Monat von deinem ${esc(r.b)}-Budget ab. Fixkosten gehören aufs Eingangskonto.</div></div>${pufAcc()?`<button class="chip" id="rToK">Nach ${esc(pufAcc().n)}</button>`:''}</div>`:''}
    <div class="cell plain"><label for="rP">Pausieren</label><span style="flex:1"></span><input id="rP" type="checkbox" class="switch" ${r.paused?'checked':''}></div></div>
   <div class="note" style="padding:0">Änderungen gelten ab der nächsten Fälligkeit. Bereits gebuchte Einträge bleiben, wie sie sind.</div><div class="note" id="rErr" style="padding:0;color:var(--bad)"></div>
   ${i>=0?'<button class="btn danger" id="rDel">Wiederkehrende Buchung löschen</button>':''}</div></div>`;
   const keep=()=>{r.n=$('rN').value;r.a=pNum($('rA').value)||0;r.b=$('rB').value;if($('rT'))r.to=$('rT').value;if($('rC'))r.c=$('rC').value;r.day=+$('rD').value;r.every=+$('rE').value;r.start=$('rSt').value;r.end=$('rEn').value||undefined;r.paused=$('rP').checked};
   $('scrim').onclick=$('rX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   document.querySelectorAll('#rTyp button').forEach(b=>b.onclick=()=>{keep();r.type=b.dataset.v;if(r.type=='tr'&&(!r.to||r.to==r.b))r.to=ALL.find(a=>a!=r.b);draw()});
   $('rB').onchange=()=>{keep();if(r.to==r.b)r.to=ALL.find(a=>a!=r.b);draw()};
   if($('rToK'))$('rToK').onclick=()=>{keep();r.b=pufAcc().n;draw()};
   $('rS').onclick=()=>{keep();if(!r.n.trim()||!r.a){$('rErr').textContent='Bitte Name und Betrag eintragen.';return}if(r.type=='tr'&&isTabu(r.b)){$('rErr').textContent=r.b+' ist tabu.';return}
     if(r.type!='tr'){delete r.to;delete r.alloc}else r.c='';if(!r.end)delete r.end;if(!r.paused)delete r.paused;
     const s=JSON.stringify(S.rec);if(i>=0){const old=S.rec[i];if(old.a!==r.a&&r.type=='out'){r.hist=old.hist&&old.hist.length?old.hist.slice():[{ab:old.start||'',a:old.a}];r.hist.push({ab:today(),a:r.a})}S.rec[i]=r}else S.rec.push(r);save();applyRec();$('sheetRoot').innerHTML='';render();tell(i>=0?'Wiederkehrende Buchung geändert.':'Wiederkehrende Buchung angelegt.',()=>{S.rec=JSON.parse(s);save();render()})};
   if($('rDel'))$('rDel').onclick=()=>{const b=$('rDel');if(!b.dataset.arm){b.dataset.arm=1;b.textContent='Wirklich löschen?';return}const s=JSON.stringify(S.rec);S.rec.splice(i,1);save();$('sheetRoot').innerHTML='';render();tell('Gelöscht. Bereits gebuchte Einträge bleiben.',()=>{S.rec=JSON.parse(s);save();render()})}};draw();renderAsst()}
function openGoalEdit(gid){const g=S.goals.find(x=>x.id==gid);if(!g)return;const D=g.dep.map(d=>({...d,v:String(d.a).replace('.',','),del:false}));let n=g.n,z=String(g.ziel).replace('.',','),w=g.w||'',rt=g.rate||'';
  const draw=()=>{$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Sparziel bearbeiten"><div class="sheet-h"><button id="geX">Abbrechen</button><b>Sparziel bearbeiten</b><button id="geS" style="font-weight:600">Sichern</button></div>
   <div class="sheet-b"><div class="group"><div class="cell plain"><label for="geN">Name</label><input id="geN" value="${esc(n)}"></div>
    <div class="cell plain"><label for="geZ">Ziel</label><input id="geZ" inputmode="decimal" value="${esc(z)}"></div>
    <div class="cell plain"><label for="geW">Warum?</label><input id="geW" value="${esc(w)}" placeholder="optional"></div>${g.m?'':`<div class="cell plain"><label for="geR">Pro Monat</label><input id="geR" inputmode="decimal" value="${esc(String(rt).replace('.',','))}" placeholder="0"></div>`}</div>
   <div class="sh" style="padding:0">Einzahlungen</div>
   <div class="group">${D.map((d,k)=>`<div class="cell plain" style="${d.del?'opacity:.45':''}"><div class="t"><div>${fd(d.t)}</div><div class="s">${d.src?'aus '+esc(d.src):''}${d.eid?' · als Umbuchung gebucht':''}</div></div>
     <input data-gev="${k}" inputmode="decimal" value="${esc(d.v)}" ${d.del?'disabled':''} style="width:84px;text-align:right;background:var(--fill);border-radius:8px;padding:6px 8px"><span>€</span>
     <button class="ed-ic" data-gex="${k}" aria-label="${d.del?'Wiederherstellen':'Einzahlung löschen'}" style="color:${d.del?'var(--blue)':'var(--bad)'}">${I(d.del?'undo':'trash',16)}</button></div>`).join('')||'<div class="empty">Noch keine Einzahlungen.</div>'}</div>
   <div class="note" style="padding:0">Änderst oder löschst du eine Einzahlung, wird die zugehörige Umbuchung mit angepasst.</div><div class="note" id="geE" style="padding:0;color:var(--bad)"></div></div></div>`;
   const keep=()=>{n=$('geN').value;z=$('geZ').value;w=$('geW').value;if($('geR'))rt=$('geR').value;document.querySelectorAll('[data-gev]').forEach(i=>D[+i.dataset.gev].v=i.value)};
   $('scrim').onclick=$('geX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   document.querySelectorAll('[data-gex]').forEach(b=>b.onclick=()=>{keep();const d=D[+b.dataset.gex];d.del=!d.del;draw()});
   $('geS').onclick=()=>{keep();const zz=pNum(z);if(!n.trim()||!zz){$('geE').textContent='Bitte Name und Zielbetrag eintragen.';return}
     for(const d of D)if(!d.del&&!(pNum(d.v)>0)){$('geE').textContent='Jede Einzahlung braucht einen Betrag. Zum Entfernen den Papierkorb nutzen.';return}
     const sn=snap(),gs=JSON.stringify(S.goals);g.n=n.trim();g.ziel=zz;g.w=w.trim()||undefined;if(!g.m)g.rate=pNum(String(rt))||0;{const ws=g.wid&&(S.wish||[]).find(x=>x.id==g.wid);if(ws){ws.n=g.n;ws.p=zz;ws.w=g.w||''}}
     const keepD=[];D.forEach(d=>{const e=d.eid&&S.exp.find(x=>x.id==d.eid);if(d.del){if(e)S.exp.splice(S.exp.indexOf(e),1);return}const a=Math.round(pNum(d.v)*100)/100;if(e){e.a=a;e.n='Sparziel: '+g.n}keepD.push({a,t:d.t,src:d.src,eid:d.eid})});
     g.dep=keepD;save();$('sheetRoot').innerHTML='';render();tell('Sparziel geändert.',()=>{restore(sn);S.goals=JSON.parse(gs);save();render()})}};draw();renderAsst()}
function openDeposit(gid,amt0){const g=S.goals.find(x=>x.id==gid);if(!g)return;const tgt=g.acct&&ALL.includes(g.acct)?g.acct:(ALL.includes('Sinking Funds')?'Sinking Funds':ALL[0]);
  const srcs=ALL.filter(a=>!isTabu(a));let src=S.lastDepSrc&&srcs.includes(S.lastDepSrc)?S.lastDepSrc:(srcs.find(a=>a==GN())||srcs[0]),amt=amt0?String(amt0).replace('.',','):'';
  const saved=g.dep.reduce((s,d)=>s+d.a,0),rest=Math.max(g.ziel-saved,0);
  const draw=()=>{const c=calc(src),free=Math.max(c.rest,0),v=pNum(amt)||0,same=src==tgt;
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Zurücklegen"><div class="sheet-h"><button id="dpX">Abbrechen</button><b>Zurücklegen</b><button id="dpS" style="font-weight:600">Sichern</button></div>
   <div class="sheet-b"><div class="mmsum"><div>Sparziel<b style="font-size:13px">${esc(g.n)}</b></div><div>Gespart<b>${eur0(saved)}</b></div><div>Fehlt noch<b class="out">${eur0(rest)}</b></div></div>
   <div class="amount">${amt?amt.replace('.',','):'0'}<small> €</small></div>
   <div class="chips wrap" style="justify-content:center">${[10,20,50].filter(x=>x<rest).map(x=>`<button class="chip" data-dpq="${x}">${x} €</button>`).join('')}${rest?`<button class="chip" data-dpq="${rest}">Rest ${eur0(rest)}</button>`:''}</div>
   <div class="group"><div class="cell plain"><label for="dpA">Betrag</label><input id="dpA" inputmode="decimal" value="${esc(amt)}" placeholder="0,00"></div>
    <div class="cell plain"><label for="dpSrc">Von Konto</label><select id="dpSrc">${srcs.map(a=>`<option ${src==a?'selected':''}>${esc(a)}</option>`).join('')}</select></div>
    <div class="cell plain"><div class="t">Nach</div><b>${esc(tgt)}</b></div></div>
   <div class="note" style="padding:0">${same?`Das Geld liegt schon in ${esc(tgt)}. Es wird nur für „${esc(g.n)}“ reserviert, ohne Umbuchung.`:`Es wird eine Umbuchung von ${esc(src)} nach ${esc(tgt)} gebucht. ${esc(src)} hat gerade noch ${eur(free)} frei.`}</div>
   ${!same&&v>free?`<div class="tip bad">${esc(src)} hat nur ${eur(free)} frei. Ist es leer, ist es leer.</div>`:''}<div class="note" id="dpE" style="padding:0;color:var(--bad)"></div></div></div>`;
   $('scrim').onclick=$('dpX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   $('dpA').oninput=()=>{amt=$('dpA').value;const pos=$('dpA').selectionStart;draw();$('dpA').focus();$('dpA').setSelectionRange(pos,pos)};
   $('dpSrc').onchange=()=>{src=$('dpSrc').value;draw()};
   document.querySelectorAll('[data-dpq]').forEach(b=>b.onclick=()=>{amt=String(Math.round(+b.dataset.dpq*100)/100).replace('.',',');draw()});
   $('dpS').onclick=()=>{const a=Math.round((pNum(amt)||0)*100)/100;if(!a){$('dpE').textContent='Bitte einen Betrag eingeben.';return}
     if(!same&&a>free+0.004){$('dpE').textContent=`${src} hat nur ${eur(free)} frei. Wähle ein anderes Konto oder einen kleineren Betrag.`;return}
     const sn=snap(),gs=JSON.stringify(S.goals),before=saved;let eid=null;
     if(!same){eid=uid();S.exp.push({id:eid,type:'tr',b:src,to:tgt,c:'',a,n:'Sparziel: '+g.n,t:Date.now(),tg:['sparziel'],goal:g.id})}
     g.dep.push({a,t:Date.now(),src,eid});S.lastDepSrc=src;save();$('sheetRoot').innerHTML='';growFrom[g.id]=Math.min(before/g.ziel,1);render();
     tell(same?`${eur(a)} für ${g.n} reserviert.`:`${eur(a)} von ${src} nach ${tgt} gebucht.`,()=>{restore(sn);S.goals=JSON.parse(gs);save();render()});
     const after=before+a;if(S.cele!==false){if(before<g.ziel&&after>=g.ziel)celebrate('Sparziel erreicht: '+g.n,true);else celebrate(eur(a)+' zurückgelegt · noch '+eur(Math.max(g.ziel-after,0)))}}};draw();renderAsst()}
const PU={d:'Tage',w:'Wochen',m:'Monate',y:'Jahre'},pTxt=p=>p?p.n+' '+(p.n==1?{d:'Tag',w:'Woche',m:'Monat',y:'Jahr'}[p.u]:PU[p.u]):'–';
function ctrCost(c){if(c.cost)return{mon:c.cost/(c.every||1),src:'eigen'};const k=(c.n||'').toLowerCase().split(/\s+/)[0],r=(S.rec||[]).find(r=>r.type=='out'&&k.length>3&&(r.n||'').toLowerCase().includes(k));return r?{mon:r.a/(r.every||1),src:'dauerauftrag'}:null}
function contractsHtml(){const C=(S.contracts||[]).map((c,i)=>({c,i,x:contractNext(c),k:ctrCost(c)})).sort((a,b)=>(a.c.state=='cancelled')-(b.c.state=='cancelled')||((a.x.kd||a.x.d)-(b.x.kd||b.x.d)));
  const act=C.filter(o=>o.c.state!='cancelled'),mon=act.reduce((s,o)=>s+(o.k?o.k.mon:0),0),soon=act.filter(o=>o.x.kd&&(o.x.kd-now)/864e5<=60&&o.x.kd>now).length;
  return `<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi">Verträge<b>${act.length}</b></div><div class="kpi">Kosten/Monat<b>${eur0(mon)}</b></div><div class="kpi">Fristen in 60 T.<b class="${soon?'out':''}">${soon}</b></div></div>
  <div class="mmcard">${C.map(({c,i,x,k})=>{const dl=x.kd?Math.ceil((x.kd-now)/864e5):null,pc=x.kd?Math.max(0,Math.min(1,1-dl/90)):0,cn=c.state=='cancelled';
   return `<button class="ctr" data-ctr="${i}"><div class="ctr-h"><span class="ico" style="background:color-mix(in srgb,var(--blue) 14%,transparent);color:var(--blue)">${I(iconFor(c.n)||'receipt')}</span>
    <div class="t"><div><b>${esc(c.n)}</b></div><div class="s">${esc(c.prov||'')}${k?' · '+eur(k.mon)+'/Monat':''}</div></div>${cn?'<span class="badge" style="background:var(--fill);color:var(--muted)">gekündigt</span>':dl!=null&&dl<=30?`<span class="badge bad">${I('alert',11)}${dl} Tage</span>`:''}<span class="chev">›</span></div>
    ${cn?`<div class="s">Endet am ${x.d.toLocaleDateString('de-DE')}</div>`:`<div class="ctr-l"><span>${c.auto?'Verlängert sich':'Endet'} am <b>${x.d.toLocaleDateString('de-DE')}</b></span><span>${x.kd?'Kündigen bis <b>'+x.kd.toLocaleDateString('de-DE')+'</b>':'keine Frist'}</span></div>
    ${x.kd?`<div class="bar" style="height:6px"><i style="width:${(pc*100).toFixed(0)}%;background:${dl<=30?'var(--bad)':dl<=60?'var(--warn)':'var(--ok)'}"></i></div>`:''}`}</button>`}).join('')||'<div class="empty">Noch keine Verträge.</div>'}</div>
  <button class="btn soft" id="ctrAdd">Vertrag hinzufügen</button>
  `}
function openContract(i){const c=i>=0?JSON.parse(JSON.stringify(S.contracts[i])):{id:uid(),n:'',prov:'',start:ymd(Date.now()),term:{u:'y',n:1},auto:true,renew:{u:'y',n:1},notice:{u:'m',n:1},next:'',state:'active'};
  const per=(id,pp)=>`<span style="display:flex;gap:6px;align-items:center"><input id="${id}N" inputmode="numeric" value="${pp?pp.n:''}" placeholder="–" style="width:44px;background:var(--fill);border-radius:8px;padding:6px;text-align:center"><select id="${id}U" style="width:auto">${Object.entries(PU).map(([u,l])=>`<option value="${u}" ${pp&&pp.u==u?'selected':''}>${l}</option>`).join('')}</select></span>`;
  $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Vertrag"><div class="sheet-h"><button id="cX">Abbrechen</button><b>${i>=0?'Vertrag bearbeiten':'Neuer Vertrag'}</b><button id="cS" style="font-weight:600">Sichern</button></div>
  <div class="sheet-b"><div class="group">
   <div class="cell plain"><label for="cN">Name</label><input id="cN" value="${esc(c.n)}" placeholder="z. B. Handyvertrag"></div>
   <div class="cell plain"><label for="cP">Anbieter</label><input id="cP" value="${esc(c.prov||'')}" placeholder="z. B. Telekom"></div>
   <div class="cell plain"><label for="cK">Kosten</label><input id="cK" inputmode="decimal" value="${c.cost?String(c.cost).replace('.',','):''}" placeholder="aus Dauerauftrag"><select id="cKE" style="width:auto">${[[1,'/Monat'],[3,'/Quartal'],[12,'/Jahr']].map(([v,l])=>`<option value="${v}" ${(c.every||1)==v?'selected':''}>${l}</option>`).join('')}</select></div>
   <div class="cell plain"><label for="cSt">Beginn</label><input id="cSt" type="date" value="${c.start||''}"></div>
   <div class="cell plain"><label for="cNx">Nächstes Ende</label><input id="cNx" type="date" value="${c.next||''}"></div>
   <div class="cell plain"><label>Mindestlaufzeit</label>${per('cT',c.term)}</div>
   <div class="cell plain"><label for="cA">Verlängert sich automatisch</label><span style="flex:1"></span><input id="cA" type="checkbox" class="switch" ${c.auto?'checked':''}></div>
   <div class="cell plain"><label>Verlängerung um</label>${per('cR',c.renew)}</div>
   <div class="cell plain"><label>Kündigungsfrist</label>${per('cF',c.notice)}</div>
   <div class="cell plain"><label for="cC">Gekündigt</label><span style="flex:1"></span><input id="cC" type="checkbox" class="switch" ${c.state=='cancelled'?'checked':''}></div>
   <div class="cell plain"><label for="cNo">Notiz</label><input id="cNo" value="${esc(c.note||'')}" placeholder="z. B. Vertragsnummer"></div></div>
  <div class="note" id="cE" style="padding:0;color:var(--bad)"></div>${i>=0?'<button class="btn danger" id="cDel">Vertrag löschen</button>':''}</div></div>`;
  const rp=id=>{const n=parseInt($(id+'N').value);return n>0?{u:$(id+'U').value,n}:null};
  $('scrim').onclick=$('cX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
  $('cS').onclick=()=>{c.n=$('cN').value.trim();if(!c.n){$('cE').textContent='Bitte einen Namen eintragen.';return}c.prov=$('cP').value.trim();c.cost=pNum($('cK').value)||undefined;c.every=+$('cKE').value;c.start=$('cSt').value;c.next=$('cNx').value||c.start;
    c.term=rp('cT');c.renew=rp('cR');c.notice=rp('cF');c.auto=$('cA').checked;c.state=$('cC').checked?'cancelled':'active';c.note=$('cNo').value.trim();
    S.contracts=S.contracts||[];const s=JSON.stringify(S.contracts);if(i>=0)S.contracts[i]=c;else S.contracts.push(c);S.dismTips=(S.dismTips||[]).filter(k=>!k.includes(c.n));save();$('sheetRoot').innerHTML='';render();tell('Vertrag gesichert.',()=>{S.contracts=JSON.parse(s);save();render()})};
  if($('cDel'))$('cDel').onclick=()=>{const b=$('cDel');if(!b.dataset.arm){b.dataset.arm=1;b.textContent='Wirklich löschen?';return}const s=JSON.stringify(S.contracts);S.contracts.splice(i,1);save();$('sheetRoot').innerHTML='';render();tell('Vertrag gelöscht.',()=>{S.contracts=JSON.parse(s);save();render()})};renderAsst()}
function openWish(ei){const E=ei!=null?S.wish[ei]:null;const W=E?{n:E.n,p:String(E.p).replace('.',','),l:E.l||'',w:E.w||'',g:E.g||'neutral',tr:E.tr||''}:{n:'',p:'',l:'',w:'',g:'neutral',tr:''};const draw=()=>{$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Neuer Wunsch">
  <div class="sheet-h"><button id="wCancel">Abbrechen</button><b>${E?'Wunsch bearbeiten':'Neuer Wunsch'}</b><button id="wSave" style="font-weight:600">${E?'Sichern':'Merken'}</button></div>
  <div class="sheet-b"><div class="group">
   <div class="cell plain"><label for="wname">Was?</label><input id="wname" placeholder="z. B. Kletterschuhe" value="${esc(W.n)}"></div>
   <div class="cell plain"><label for="wpreis">Preis</label><input id="wpreis" inputmode="decimal" placeholder="0,00 €" value="${esc(W.p)}"></div>
   <div class="cell plain"><label for="wlink">Link</label><input id="wlink" placeholder="aus dem Shop einfügen" value="${esc(W.l)}"></div>
   <div class="cell plain"><label for="wwarum">Warum?</label><input id="wwarum" placeholder="Was erhoffe ich mir?" value="${esc(W.w)}"></div></div>
   <div class="hours" id="wstd" style="padding-inline:4px"></div>
   <div class="sh" style="padding:0">Wie fühle ich mich gerade?</div><div class="chips wrap">${GEF.map(x=>`<button class="chip ${W.g==x?'on':''}" data-wg="${x}">${x}</button>`).join('')}</div>
   <div class="sh" style="padding:0">Wo kam der Wunsch her?</div><div class="chips wrap">${TRIG.map(x=>`<button class="chip ${W.tr==x?'on':''}" data-wt="${x}">${x}</button>`).join('')}</div>
   ${E?'<button class="btn danger" id="wDel">Wunsch löschen</button>':''}<div class="note" id="wErr" style="padding:0;color:var(--bad)"></div></div></div>`;
  const keep=()=>{if($('eMore'))0;W.n=$('wname').value;W.p=$('wpreis').value;W.l=$('wlink').value;W.w=$('wwarum').value};
  const hrs=()=>{const v=pNum($('wpreis').value);$('wstd').textContent=v?'Das sind '+std(v)+'.':''};hrs();$('wpreis').oninput=hrs;
  $('scrim').onclick=$('wCancel').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
  if($('wDel'))$('wDel').onclick=()=>{const b=$('wDel');if(!b.dataset.arm){b.dataset.arm=1;b.textContent='Wirklich löschen?';return}const s=JSON.stringify(S.wish);S.wish.splice(ei,1);save();$('sheetRoot').innerHTML='';render();tell('Wunsch gelöscht.',()=>{S.wish=JSON.parse(s);save();render()})};
  document.querySelectorAll('[data-wg]').forEach(b=>b.onclick=()=>{keep();W.g=b.dataset.wg;draw()});document.querySelectorAll('[data-wt]').forEach(b=>b.onclick=()=>{keep();W.tr=W.tr==b.dataset.wt?'':b.dataset.wt;draw()});
  $('wSave').onclick=()=>{keep();const v=pNum(W.p);if(!W.n.trim()||!v){$('wErr').textContent='Bitte Name und Preis eintragen.';return}
    if(E){const un=E.t+wait(E.p),old=JSON.stringify(E);Object.assign(E,{n:W.n.trim(),p:v,l:W.l.trim(),w:W.w.trim(),g:W.g,tr:W.tr});if(E.t+wait(v)<un)E.t=un-wait(v);save();$('sheetRoot').innerHTML='';render();tell('Wunsch geändert.',()=>{Object.assign(E,JSON.parse(old));save();render()});return}
    S.wish.unshift({id:uid(),n:W.n.trim(),p:v,l:W.l.trim(),w:W.w.trim(),g:W.g,tr:W.tr,t:Date.now(),s:'offen'});save();$('sheetRoot').innerHTML='';wishV='Wünsche';render();tell('Auf der Wunschliste. Frei ab '+new Date(Date.now()+wait(v)).toLocaleDateString('de-DE',{day:'numeric',month:'long'})+'.')}};draw()}
function openKaufCheck(i){const w=S.wish[i],g=calc('Gönn dir'),goal=goalOfWish(w),gs=goal?goal.dep.reduce((a,d)=>a+d.a,0):0,A=[null,null,null];
  const draw=()=>{const fromG=g.rest>=w.p,fromS=gs>=w.p,ok=A.every(x=>x===true)&&(fromG||fromS);
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Kauf-Check"><div class="sheet-h"><button id="kcX">Abbrechen</button><b>Kauf-Check</b><span style="width:70px"></span></div>
   <div class="sheet-b"><div class="mmcard"><div class="srow"><div class="srow-h"><span><b>${esc(w.n)}</b></span><span class="hours">${std(w.p)}</span><b>${eur(w.p)}</b></div></div></div>
   <div class="anchor">${I('lock',16)}<span>${ANCHOR}</span></div>
   <div class="sh" style="padding:0">1 · Anker-Check: Wer bezahlt?</div>
   <div class="mmcard"><div class="srow"><div class="srow-h"><span>Gönn dir, noch frei</span>${fromG?badge({k:'ok',txt:''}):'<span class="badge bad">reicht nicht</span>'}<b class="${fromG?'in':'out'}">${eur(Math.max(g.rest,0))}</b></div></div>
    <div class="srow"><div class="srow-h"><span>Sparziel „${esc(w.n)}“</span>${goal?(fromS?'':'<span class="badge warn">noch nicht voll</span>'):'<span class="s" style="font-size:12px;color:var(--muted)">keins angelegt</span>'}<b>${goal?eur(gs):'–'}</b></div></div>
    <div class="srow"><div class="srow-h"><span>Vermögensaufbau</span><span class="badge bad">${I('lock',11)} tabu</span><span></span></div></div></div>
   <div class="sh" style="padding:0">2 · Ehrlich beantworten</div>
   ${['Brauche ich das wirklich, oder will ich nur das Gefühl?','Will ich es auch nach den 14 Tagen noch genauso?','Würde ich es auch nächsten Monat noch kaufen?'].map((q,j)=>`<div class="kq"><span>${q}</span><div class="seg" style="width:120px"><button class="${A[j]===true?'on':''}" data-kq="${j}|1">Ja</button><button class="${A[j]===false?'on':''}" data-kq="${j}|0">Nein</button></div></div>`).join('')}
   ${(S.debts||[]).some(d=>debtInfo(d).rest)?`<div class="tip">${I('target',14)} Du zahlst noch einen Kredit ab. Ratenzahlung oder „später bezahlen“ ist keine Option.</div>`:''}
   ${!fromG&&!fromS?`<div class="tip bad"><b>Ist es leer, ist es leer.</b> Weder ${esc(GN())} noch ein Sparziel decken den Kauf. Mach daraus ein Sparziel oder lass ihn los.</div>`:''}
   ${A.some(x=>x===false)?`<div class="tip">Mindestens ein Nein. Das ist ein gutes Zeichen, dass du ihn loslassen kannst.</div>`:''}
   <button class="btn" id="kcBuy" ${ok?'':'disabled style="opacity:.45"'}>Kauf aus ${fromS?'Sparziel':'Gönn dir'} buchen</button>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn soft" id="kcSave">Lieber sparen</button><button class="btn soft" id="kcDrop" style="color:var(--ok)">Loslassen</button></div></div></div>`;
   $('scrim').onclick=$('kcX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   document.querySelectorAll('[data-kq]').forEach(b=>b.onclick=()=>{const[j,v]=b.dataset.kq.split('|');A[j]=v=='1';draw()});
   $('kcBuy').onclick=()=>{if(!ok)return;w.s='gekauft';w.dt=Date.now();if(fromS){goal.done=Date.now();S.exp.push({id:uid(),type:'out',b:'Sinking Funds',c:'Sparziel',a:w.p,n:w.n,t:Date.now()})}
     else S.exp.push({id:uid(),type:'out',b:'Gönn dir',c:'Shopping',a:w.p,n:w.n,t:Date.now(),tg:['wunschliste']});save();$('sheetRoot').innerHTML='';render();tell('Bewusst gekauft und gebucht.')};
   $('kcSave').onclick=()=>{decideWish(i,'Sparziel');$('sheetRoot').innerHTML=''};$('kcDrop').onclick=()=>{decideWish(i,'verworfen');$('sheetRoot').innerHTML=''}};draw();renderAsst()}
function decideWish(i,s){const w=S.wish[i],prev=JSON.stringify({w,g:S.goals,gs:S.gespart});w.s=s;w.dt=Date.now();if(s=='verworfen')
  if(!w.id)w.id=uid();if(s=='Sparziel'&&!goalOfWish(w))S.goals.unshift({id:uid(),wid:w.id,n:w.n,ziel:w.p,t:Date.now(),from:"Wunsch",g:w.g,w:w.w,l:w.l,dep:[]});save();render();
  if(s=='verworfen'&&S.cele!==false)celebrate(eur(w.p)+' gespart');
  tell(s=='verworfen'?`Losgelassen: ${eur(w.p)} gespart.`:'Als Sparziel angelegt.',()=>{const o=JSON.parse(prev);Object.assign(S.wish[i],o.w);S.goals=o.g;S.gespart=o.gs;save();render()})}

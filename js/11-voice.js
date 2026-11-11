/* ---------- Sprachbefehle ---------- */
function showAnswer(title,html,acts){$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="${esc(title)}"><div class="sheet-h"><span style="min-width:70px"></span><b>${esc(title)}</b><button id="ansX" style="font-weight:600">Fertig</button></div>
  <div class="sheet-b"><div class="ans">${html}</div>${(acts||[]).map((a,i)=>`<button class="btn ${i?'soft':''}" data-ans="${i}">${a[0]}</button>`).join('')}</div></div>`;
  const close=()=>{$('sheetRoot').innerHTML='';renderAsst()};$('scrim').onclick=$('ansX').onclick=close;document.querySelectorAll('[data-ans]').forEach(b=>b.onclick=()=>{close();acts[+b.dataset.ans][1]()});renderAsst()}
const accIn=l=>{let best=null;ALL.forEach(a=>{const n=a.toLowerCase(),s=(SHORT[a]||'').toLowerCase();if(l.includes(n)||(s.length>2&&l.includes(s))||(/gönn/.test(l)&&/gönn/i.test(a))){if(!best||n.length>best.toLowerCase().length)best=a}});return best};
const amtIn=l=>{const m=spoken(l).match(/(\d+(?:[.,]\d{1,2})?)/);return m?pNum(m[1]):null};
function vNav(l){if(!/^(zeig|zeige|öffne|öffnen|geh|gehe|wechsel|wechsle|bring mich|navigier)/.test(l))return false;
  const go=(t,o)=>{$('sheetRoot').innerHTML='';tab=t;curB=null;setView=null;drill=null;Object.assign(window,{});if(o)o();render();scrollTo(0,0)};
  const M=[[/prognose|vorschau|zukunft/,()=>go('rep',()=>{repV='Prognose'})],[/vertr[aä]g/,()=>go('rep',()=>{repV='Verträge'})],[/vermögen|depot|etf|krypto|aktie/,()=>go('rep',()=>{repV='Vermögen'})],[/verlauf/,()=>go('rep',()=>{repV='Verlauf'})],
    [/analyse|monatsanalyse|rückblick/,()=>go('rep',()=>{repV='Analyse'})],[/bericht/,()=>{go('more');setView='report';render()}],[/ausgaben|auswertung|statistik/,()=>go('rep',()=>{repV='Monat'})],[/sparziel/,()=>go('wish',()=>{wishV='Sparziele'})],[/verzicht/,()=>go('wish',()=>{wishV='Verzicht'})],[/wunsch|wünsche|impuls/,()=>go('wish',()=>{wishV='Wünsche'})],
    [/einkauf|zettel/,()=>{$('sheetRoot').innerHTML='';prevTab=tab;setView='shop';render();scrollTo(0,0)}],[/kalender/,()=>go('cal')],[/buchungen|liste|umsätze/,()=>go('list')],[/einstellung/,()=>go('more')],
    [/assistent|hinweis/,()=>{$('sheetRoot').innerHTML='';asstOpen=true;renderAsst()}],[/übersicht|start|home/,()=>go('dash')]];
  for(const[re,f] of M)if(re.test(l)){f();return true}
  const a=accIn(l);if(a){go('dash',()=>{});curB=a;render();return true}return false}
function vQuestion(l){if(!/^(wie ?viel|was darf|was kann|was hab|was habe|hab ich|habe ich|reicht|wie steht|wie sieht|wo stehe|was ist|was kostet)|\?$/.test(l))return false;
  const P=period(0),days=Math.max(P.left,1),a=accIn(l);
  if(/einkauf|zettel/.test(l)){const sh=shopS(),ck=shopCheck(),est=sh.items.reduce((s,x)=>s+(x.p||0)*(x.q||1),0);showAnswer('Einkaufszettel',`<b>${sh.items.length} Artikel · ca. ${eur(est)}</b><p>${ck.txt}</p>`,[['Zettel öffnen',()=>{prevTab=tab;setView='shop';render()}]]);return true}
  if(/puffer|comdirect/.test(l)&&!/ausgegeben/.test(l)){const o=pufOpen();showAnswer('Puffer',`<b>${eur(pufVal())}</b><p>Kontostand ${eur(pufBal())} minus ${eur(o.sum)} offene Fixkosten.</p>`);return true}
  if(/ausgegeben|verbraucht|gekostet/.test(l)){const cat=catList().find(c=>l.includes(c.c.toLowerCase()));const bs=a?[a]:TOT;
    const v=S.exp.filter(e=>inP(e,P)&&!isPlan(e)&&e.type=='out'&&bs.includes(e.b)&&(!cat||e.c==cat.c)).reduce((s,e)=>s+e.a,0);
    showAnswer('Ausgaben',`<b>${eur(v)}</b><p>${cat?'für '+esc(cat.c):'insgesamt'}${a?' aus '+esc(a):' aus deinen Budgets'} im ${P.label}.</p>`);return true}
  if(a){const c=calc(a);showAnswer(a,isK(a)?`<b>${eur(c.rest)}</b><p>Kontostand.</p>`:c.stock?`<b>${eur(c.rest)} Bestand</b><p>Wird nicht pro Monat gerechnet. Frei für Sonstiges: ${eur(sinkPot().free)}.</p>`:`<b>${eur(c.rest)} übrig</b><p>Das sind ${eur(Math.max(c.rest,0)/days)} pro Tag für die restlichen ${days} Tage.${isLock(a)?' Notfallbremse aktiv: Ist es leer, ist es leer.':''}</p>`);return true}
  const rows=TOTM.map(b=>{const c=calc(b);return{b,r:c.rest}}),sum=rows.reduce((s,x)=>s+Math.max(x.r,0),0);
  showAnswer(/heute/.test(l)?'Heute':'Dein Stand',`<b>${eur(sum/days)} pro Tag</b><p>Insgesamt ${eur(sum)} übrig für ${days} Tage.</p><div class="ans-rows">${rows.map(x=>`<span>${esc(SHORT[x.b])}</span><b class="${x.r<0?'out':''}">${eur(x.r)}</b><span class="s">${eur(Math.max(x.r,0)/days)}/Tag</span>`).join('')}</div>`);return true}
function vWish(l,v){if(!/^(wunsch|ich wünsche mir|wunschliste|auf die wunschliste)|^ich (will|möchte|hätte gern)\b.*\b(haben|kaufen)\b/.test(l))return false;
  const p=amtIn(l);let g=GEF.find(x=>l.includes(x.toLowerCase()))||(/stress/.test(l)?'gestresst':/langweil/.test(l)?'gelangweilt':/belohn/.test(l)?'Belohnung':/traurig/.test(l)?'traurig':'neutral');
  const tr=TRIG.find(x=>l.includes(x.toLowerCase()))||'';
  let n=spoken(v).replace(/^(auf die )?wunschliste|^wunsch|^ich wünsche mir|^ich (will|möchte|hätte gern)/i,'').replace(/(\d+(?:[.,]\d{1,2})?)\s*(euro|€)?/i,'').replace(new RegExp('\\b('+GEF.join('|')+'|gestresst|stress|gelangweilt|belohnung|haben|kaufen|für|eine?n?|neue?[nrs]?|weil ich|bin|ich)\\b','gi'),' ').replace(new RegExp(tr,'i'),'').replace(/[,.]/g,' ').replace(/\s+/g,' ').trim();
  if(!n){tell('Was wünschst du dir? Sag z. B. „Wunsch Kopfhörer 89 Euro“.');return true}n=n.charAt(0).toUpperCase()+n.slice(1);
  if(!p){$('sheetRoot').innerHTML='';openWish();setTimeout(()=>{$('wname').value=n;$('wpreis').focus()},50);tell('Noch den Preis eintragen.');return true}
  const s=JSON.stringify(S.wish);S.wish.unshift({id:uid(),n,p,l:'',w:'',g,tr,t:Date.now(),s:'offen'});save();$('sheetRoot').innerHTML='';render();
  tell(`Wunsch „${n}“ (${eur(p)}) gemerkt. Frei ab ${new Date(Date.now()+wait(p)).toLocaleDateString('de-DE',{day:'numeric',month:'long'})}.`,()=>{S.wish=JSON.parse(s);save();render()});return true}
function vGoal(l){if(!/zurücklegen|zurück legen|sparziel|weglegen|beiseite/.test(l)&&!/\bfür (den |die |das |meinen |meine )?.+ sparen\b/.test(l))return false;
  const act=S.goals.filter(g=>!g.done&&!g.dropped);if(!act.length){tell('Du hast noch kein Sparziel.');return true}
  const g=act.find(g=>l.includes(g.n.toLowerCase()))||act.find(g=>g.n.toLowerCase().split(/\s+/).some(w=>w.length>3&&l.includes(w)))||(act.length==1?act[0]:null);
  if(!g){showAnswer('Welches Sparziel?',`<p>Ich habe „${esc(l)}“ keinem Sparziel zuordnen können.</p>`,act.map(x=>[esc(x.n),()=>openDeposit(x.id,amtIn(l))]));return true}
  $('sheetRoot').innerHTML='';openDeposit(g.id,amtIn(l));const sa=accIn(l);if(sa&&$('dpSrc')){$('dpSrc').value=sa;$('dpSrc').onchange()}return true}
function vShopDone(l){if(!/einkauf\w* (ist )?(fertig|erledigt|bezahlt|gemacht|vorbei|buchen)|einkaufszettel buchen/.test(l))return false;
  const sh=shopS();if(!sh.items.length){tell('Der Einkaufszettel ist leer.');return true}const a=amtIn(l);$('sheetRoot').innerHTML='';openShopBook();if(a&&$('sbA'))$('sbA').value=String(a).replace('.',',');return true}
function vFix(l){if(!/(letzte|vorige|eben|gerade)\w* buchung|buchung (eben|gerade)/.test(l))return false;
  const e=[...S.exp].filter(x=>!isRecE(x)&&!isPlan(x)).sort((a,b)=>(b.t||0)-(a.t||0))[0];if(!e){tell('Keine Buchung gefunden.');return true}
  const lbl=`${e.n||e.c||'Buchung'} (${eur(e.a)})`;
  if(/lösch|weg|entfern|storn/.test(l)){const s=snap();S.exp=S.exp.filter(x=>x.id!=e.id);save();$('sheetRoot').innerHTML='';render();tell('Gelöscht: '+lbl,()=>restore(s));return true}
  const a=amtIn(l),acc=accIn(l);if(a||acc){const s=snap();if(a)e.a=Math.round(a*100)/100;if(acc&&acc!=e.b)e.b=acc;save();$('sheetRoot').innerHTML='';render();tell(`Geändert: ${e.n||e.c} jetzt ${eur(e.a)}${acc?' aus '+acc:''}.`,()=>restore(s));return true}
  $('sheetRoot').innerHTML='';openSheet(e);return true}
const RHY=[[/jährlich|jedes jahr|pro jahr/,12],[/halbjährlich|alle sechs monate|alle 6 monate/,6],[/vierteljährlich|quartal/,3],[/alle (zwei|2) monate/,2],[/monatlich|jeden monat|pro monat|im monat|abo/,1]];
function vRecurring(l,v){const r=RHY.find(([re])=>re.test(l));if(!r)return false;
  const sv=E;E={type:'out',b:pufAcc()?pufAcc().n:ALL[0],c:null,amt:'',n:'',dt:today()};quickParse(v.replace(new RegExp(r[0].source,'i'),' '));const x=E;E=sv;
  const acc=accIn(l)||(x.type=='in'?(pufAcc()?pufAcc().n:x.b):(pufAcc()?pufAcc().n:x.b)),cs=cats(acc)||[];let c=x.c&&cs.some(k=>k[0]==x.c)?x.c:(cs.find(k=>/abo|vertr|fix|sonst/i.test(k[0]))||cs[0]||[''])[0];
  const d=new Date(x.dt+'T12:00');$('sheetRoot').innerHTML='';
  openRec(-1,{type:x.type=='in'?'in':'out',b:acc,c,a:pNum(x.amt)||0,n:x.n||x.c||(v.replace(/[\d.,]+|euro|€/gi,'').split(/\s+/).find(w=>w.length>2)||''),day:d.getDate(),every:r[1],start:x.dt});tell('Dauerauftrag vorbereitet. Kurz prüfen und sichern.');return true}
function vMulti(v){const parts=spoken(v).split(/,\s+|\s+(?:und|plus|sowie)\s+/).filter(Boolean);if(parts.length<2)return false;const withAmt=parts.filter(p=>/\d/.test(p));if(withAmt.length<2||withAmt.length!=parts.length)return false;
  const sv=E,sn=snap(),made=[];
  parts.forEach(p=>{E={type:'out',b:S.lastAcc&&ALL.includes(S.lastAcc)?S.lastAcc:BN[0],c:null,amt:'',n:'',dt:today(),accManual:false};qp(p);const a=Math.round((pNum(E.amt)||0)*100)/100;if(!a)return;
    if(!E.c)E.c=((cats(E.b)||[]).find(k=>/sonst/i.test(k[0]))||(cats(E.b)||[['Sonstiges']])[0])[0];if(isTabu(E.b))return;
    const[yy,mm,dd]=E.dt.split('-').map(Number);S.exp.push({id:uid(),type:E.type,b:E.b,c:E.c,a,n:E.n,t:E.dt==today()?Date.now():new Date(yy,mm-1,dd,12).getTime()});made.push(`${E.n||E.c} ${eur(a)} (${SHORT[E.b]})`)});
  E=sv;if(!made.length)return false;save();$('sheetRoot').innerHTML='';render();tell(made.length+' Buchungen: '+made.join(', '),()=>restore(sn));return true}

function voiceHelp(){const ex=[['Einzahlen','„Zahl 200 Euro in den Vermögensaufbau ein“ · „500 Euro Bonus einzahlen“'],['Buchen','„Kaffee 3,50“ · „gestern Tanken 65 Euro“ · „Friseur 25 Euro aus Gönn dir“'],['Mehrere auf einmal','„Rewe 23 Euro und dm 8 Euro“'],['Umbuchen','„50 Euro von Flow nach Sinking Funds“'],['Einnahme','„Erstattung 30 Euro“ · „Gehalt 3200 Euro“'],['Dauerauftrag','„Netflix 13 Euro monatlich“ · „Versicherung 120 Euro jährlich“'],
  ['Fragen','„Wie viel hab ich noch in Gönn dir?“ · „Was darf ich heute noch ausgeben?“ · „Wie viel hab ich für Café ausgegeben?“ · „Wie steht mein Puffer?“'],['Wunsch','„Wunsch Kopfhörer 89 Euro, gestresst“'],['Sparziel','„20 Euro für Reisekoffer zurücklegen“'],
  ['Einkaufszettel','„Einkaufsliste Milch, zwei Brot und Eier“ · „Einkauf fertig, 42 Euro“ · „Was kostet mein Einkauf?“'],['Korrigieren','„Letzte Buchung war 15 Euro“ · „Letzte Buchung löschen“'],['Navigieren','„Zeig mir die Prognose“ · „Öffne den Kalender“ · „Zeig Sparziele“']];
  showAnswer('Das kannst du sagen',`<div class="vhelp">${ex.map(([k,v])=>`<b>${k}</b><span>${v}</span>`).join('')}</div>`)}
/* Router: true = erledigt, false = normale Buchung */
function voiceCmd(v){const l=v.toLowerCase().trim();if(!l)return true;
  if(/^(hilfe|was kann ich (sagen|fragen)|welche befehle|was verstehst du)/.test(l)){voiceHelp();return true}
  if(vShopDone(l))return true;
  if(isShopVoice(v)){shopVoiceDone(shopVoice(v));return true}
  if(JRX.test(l)){$('sheetRoot').innerHTML='';asstAsk(v);return true}
  if(NEWSRX.test(l)||/^(such|find|zeig mir (alle |meine )?buchung|wie ?viel|was habe ich|was hab ich|kann ich mir|welche abos|was wird|wann habe ich|größte|teuerste)|\?$/.test(l)){$('sheetRoot').innerHTML='';asstAsk(v);return true}
  return vNav(l)||vDeposit(l)||vFix(l)||vQuestion(l)||vWish(l,v)||vGoal(l)||vRecurring(l,v)||vMulti(v)}

/* ---------- Siri & Kurzbefehle: Ablage abholen, Sätze übernehmen, ?sag= / ?frage= ---------- */
const SIRIK='cf_siri',siriGet=()=>{try{return JSON.parse(localStorage.getItem(SIRIK)||'null')}catch(e){return null}},siriSet=o=>{try{o?localStorage.setItem(SIRIK,JSON.stringify(o)):localStorage.removeItem(SIRIK)}catch(e){}};
const siriFnUrl=()=>(SY.url||SYDEF).replace(/\/$/,'')+'/functions/v1/push';
async function siriNewKey(){const b=crypto.getRandomValues(new Uint8Array(24)),k='cf_'+btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const hb=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(k))),h=[...hb].map(x=>x.toString(16).padStart(2,'0')).join('');
  await pushCall('siri_key',{h});siriSet({k,at:Date.now()});return k}
/* Einen gesprochenen Satz ohne Rückfrage übernehmen. Liefert {ok,lab} oder {ok:false,why} */
function siriApplyOne(txt){const v=String(txt||'').trim(),l=v.toLowerCase();if(!v)return{ok:false,why:'leer'};
  if(/^(notbremse|impuls|ich habe (gerade )?(einen )?(kauf)?impuls|hilfe,? ich will)/.test(l)){S.urgePend=Date.now();return{ok:true,lab:'Kurz warten beim Öffnen'}}
  if(isShopVoice(v)){const a=shopVoice(v);return a&&a.length?{ok:true,lab:'Einkaufsliste: '+a.join(', ')}:{ok:false,why:'Einkaufsliste nicht erkannt'}}
  if(JRX.test(l)){const j=jParse(v);S.journal=S.journal||[];S.journal.push(j);return{ok:true,lab:'Journal: '+(j.txt||'').slice(0,40)}}
  if(/^(wunsch|ich wünsche mir|wunschliste|auf die wunschliste)/.test(l)){const n0=(S.wish||[]).length,okW=vWish(l,v);if(okW&&(S.wish||[]).length>n0)return{ok:true,lab:'Wunsch: '+S.wish[0].n};$('sheetRoot').innerHTML='';return{ok:false,why:'Wunsch ohne Preis'}}
  if(/\?$|^(wie ?viel|was|wann|welche|kann ich|darf ich)\b/.test(l))return{ok:false,why:'Frage – bitte in der App stellen'}
  if(/monatlich|jährlich|vierteljährlich|wöchentlich|dauerauftrag/.test(l))return{ok:false,why:'Dauerauftrag – bitte prüfen'}
  const parts=spoken(v).split(/,\s+|\s+(?:und|plus|sowie)\s+/).filter(Boolean),sv=E,made=[],bad=[];
  (parts.length>1&&parts.every(p=>/\d/.test(p))?parts:[v]).forEach(p=>{E={type:'out',b:S.lastAcc&&ALL.includes(S.lastAcc)?S.lastAcc:BN[0],c:null,amt:'',n:'',dt:today(),accManual:false};qp(p);const a=Math.round((pNum(E.amt)||0)*100)/100;if(!a){bad.push(p+': kein Betrag');return}
    if(!E.c&&E.type=='out'){const g=E.n?clipGuess(E.n):null;if(g&&g.c){if(!(cats(E.b)||[]).some(k=>k[0]==g.c)&&g.b)E.b=g.b;E.c=g.c}else{bad.push(p+': Kategorie unklar, bitte zuordnen');return}}
    if(!E.c&&E.type!='tr')E.c=((cats(E.b)||[]).find(k=>/sonst/i.test(k[0]))||(cats(E.b)||[['Sonstiges']])[0])[0];
    if(E.type!='in'&&isTabu(E.b)){bad.push(p+': '+E.b+' ist tabu');return}
    if(E.type=='tr'&&isLock(E.to)){bad.push(p+': Notfallbremse '+E.to);return}
    if(E.type=='out'&&isLock(E.b)&&calc(E.b).rest-a<0){bad.push(p+': '+E.b+' reicht nicht (Notfallbremse)');return}
    const[yy,mm,dd]=E.dt.split('-').map(Number),rec={id:uid(),type:E.type,b:E.b,c:E.type=='tr'?'':E.c,a,n:E.n,t:E.dt==today()?Date.now():new Date(yy,mm-1,dd,12).getTime(),tg:['siri']};if(E.type=='tr')rec.to=E.to;S.exp.push(rec);try{if(ruFor(rec,'siri'))ruSync(rec,{on:true})}catch(e){}made.push(`${E.n||E.c||'Umbuchung'} ${eur(a)} (${SHORT[E.b]||E.b})`)});
  E=sv;if(made.length&&!bad.length)return{ok:true,lab:made.join(', ')};if(made.length)return{ok:true,lab:made.join(', '),part:bad.join('; ')};return{ok:false,why:bad.join('; ')||'nicht verstanden'}}
/* Von Siri & Apple Pay übernommene Buchungen: 48 h als Hinweis zum Nachbearbeiten */
function qkGet(){const q=S.qk;if(!q||!q.ids)return null;if(Date.now()-(q.t||0)>48*3600e3){delete S.qk;return null}q.ids=q.ids.filter(id=>S.exp.some(e=>e.id==id));if(!q.ids.length){delete S.qk;return null}q.ed=(q.ed||[]).filter(id=>q.ids.includes(id));return q}
function qkAdd(ids){ids=(ids||[]).filter(Boolean);if(!ids.length)return;const q=qkGet()||{ids:[],ed:[]};q.ids=[...new Set([...q.ids,...ids])];q.t=Date.now();S.qk=q}
function siriApplyAll(items){const before=JSON.stringify(S),done=[],pend=[],had=new Set(S.exp.map(e=>e.id));const _t=toast,_tl=tell,_r=render,_ra=renderAsst;toast=()=>{};tell=()=>{};render=()=>{};renderAsst=()=>{};
  try{items.forEach(it=>{let r;try{r=siriApplyOne(it.txt)}catch(e){r={ok:false,why:'Fehler: '+(e.message||e)}}if(r.ok){done.push(r.lab);if(r.part)pend.push({id:uid(),txt:it.txt,t:Date.parse(it.created_at)||Date.now(),why:r.part})}else pend.push({id:uid(),txt:it.txt,t:Date.parse(it.created_at)||Date.now(),why:r.why})})}
  finally{toast=_t;tell=_tl;render=_r;renderAsst=_ra}
  qkAdd(S.exp.filter(e=>!had.has(e.id)&&!e.ruOf&&!(e.tg||[]).includes('wechselgeld')).map(e=>e.id));
  if(pend.length)S.siriPend=[...(S.siriPend||[]),...pend];$('sheetRoot').innerHTML='';save();render();
  const n=items.length;tell(`${n} ${n==1?'Eintrag':'Einträge'} aus Siri übernommen${pend.length?' · '+pend.length+' bitte prüfen':''}`,()=>{S=JSON.parse(before);save();render()});
  if(S.urgePend){delete S.urgePend;save();setTimeout(()=>openUrge(),600)}return{done,pend}}
/* Beleg (Teilen-Menü, Text aus Bild) und Mitteilung (Mail/SMS-Automation) → „Buchung: Händler Betrag“ */
const SMARTRX=/^\s*(beleg|mitteilung|mail|sms)\s*:\s*/i;
function smartTxt(v){const raw=String(v||'').replace(SMARTRX,''),beleg=/^\s*beleg/i.test(v),L=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),flat=L.join(' ');
  const AM=/(?:€|eur)?\s*(-?\d{1,3}(?:\.\d{3})+,\d{2}|-?\d+[.,]\d{2})(?!\d)\s*(?:€|eur\b)?/gi,num=x=>pNum(x.replace(/\.(?=\d{3})/g,'')),all=l=>[...l.matchAll(AM)].map(m=>Math.abs(num(m[1]))).filter(a=>a>0&&a<1e5);
  let a=0;if(beleg){const tot=L.filter(l=>/summe|gesamt|total|zu zahlen|zahlbetrag|betrag|ec[- ]?karte|kartenzahlung|bar\b/i.test(l)&&!/mwst|ust|netto|steuer|rückgeld|gegeben/i.test(l)).flatMap(all);a=tot.length?Math.max(...tot):0;if(!a){const x=all(flat);a=x.length?Math.max(...x):0}}
  else{const m=flat.match(/(-?\d{1,3}(?:\.\d{3})+,\d{2}|-?\d+[.,]\d{2})\s*(?:€|eur\b)|(?:€|eur)\s*(-?\d{1,3}(?:\.\d{3})+,\d{2}|-?\d+[.,]\d{2})/i);a=m?Math.abs(num(m[1]||m[2])):0;if(!a){const x=all(flat);a=x.length?x[0]:0}}
  if(!a)return null;a=Math.round(a*100)/100;
  const inc=!beleg&&/gutschrift|geld erhalten|zahlung erhalten|hat dir .{0,40}gesendet|eingang|überweisung von|erstattung|rückzahlung/i.test(flat);
  let m='';const sm=flat.match(SUPRX);if(sm)m=sm[0].charAt(0).toUpperCase()+sm[0].slice(1).toLowerCase();
  if(!m&&!beleg){const x=flat.match(/([A-ZÄÖÜ][\wÄÖÜäöüß\-]+(?:\s+[A-ZÄÖÜ][\wÄÖÜäöüß\-]+){0,2})\s+hat dir/);if(x)m=x[1]}
  if(!m&&!beleg){const x=flat.match(/(?:zahlung an|an|bei|von|händler:?|empfänger:?)\s+([A-ZÄÖÜ0-9][\wÄÖÜäöüß&'\-]*(?:\s+[A-ZÄÖÜ][\wÄÖÜäöüß&'\-]*){0,2})/);if(x)m=x[1]}
  if(!m&&beleg){const x=L.find(l=>/[a-zäöü]{3}/i.test(l)&&!/\d{2}/.test(l)&&l.length<=30);if(x)m=x}
  if(!m&&/paypal/i.test(flat))m='PayPal';if(!m&&/amazon/i.test(flat))m='Amazon';
  m=m.replace(/[\d,.:;€]+/g,' ').replace(/\b(und|plus|sowie)\b/gi,' ').replace(/\s+/g,' ').trim().slice(0,30);
  const d=flat.match(/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/);
  return 'Buchung: '+(inc?'Gutschrift ':'')+(m||(beleg?'Beleg':inc?'':'Zahlung'))+' '+a.toFixed(2).replace('.',',')+(d?' · '+d[0]:'')}
let siriBusy=false;async function siriPull(force){if(siriBusy||!syOn()||!navigator.onLine)return;if(!force&&!siriGet())return;siriBusy=true;try{const j=await pushCall('inbox');const it=j.items||[];S.siriChk=Date.now();if(it.length){/* v255: Zeitpunkt der letzten angekommenen Zahlung bzw. Siri-Eingabe merken */const ts=x=>Date.parse(x.created_at)||Date.now(),SE=S.siriSeen=S.siriSeen||{};it.forEach(x=>{const k=CLIPPFX.test(String(x.txt||'').trim())?'pay':'siri';SE[k]=Math.max(SE[k]||0,ts(x))});const sm=it.filter(x=>SMARTRX.test(String(x.txt||''))),pay=it.filter(x=>!sm.includes(x)&&CLIPPFX.test(String(x.txt||'').trim())),rest=it.filter(x=>!pay.includes(x)&&!sm.includes(x));sm.forEach(x=>{const l=smartTxt(x.txt);if(l)pay.push({txt:l,created_at:x.created_at});else{S.siriPend=[...(S.siriPend||[]),{id:uid(),txt:String(x.txt).replace(SMARTRX,'').replace(/\s+/g,' ').slice(0,200),t:Date.parse(x.created_at)||Date.now(),why:'Kein Betrag im '+(/^\s*beleg/i.test(x.txt)?'Beleg':'Text')+' gefunden'}];save()}});if(rest.length)siriApplyAll(rest);await pushCall('inbox_del',{ids:it.map(x=>x.id)});if(pay.length)TIPFN.clipRun(pay.map(x=>{const v=String(x.txt).trim();return /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(v)?v:v+' · '+new Date(Date.parse(x.created_at)||Date.now()).toLocaleString('de-DE')}).join('\n'))}else if(force)toast('Keine neuen Einträge von Siri.')}catch(e){if(force)toast('Ablage nicht erreichbar: '+(e.message||e))}finally{siriBusy=false}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(()=>siriPull(),1500)});document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#siriChkNow')){siriPull(true).then(()=>{save();if(setView=='siri')render()})}});setTimeout(()=>siriPull(),3000);
/* ---------- Wechselgeld (Aufrunden wie bei Revolut) ---------- */
function ruS(){const R=S.ru=S.ru||{on:true,mult:1,apple:true,siri:true,manual:false,accs:[]};if(R.dep===undefined){const h=depot().find(x=>/robo/i.test((x.n||'')+' '+(x.sym||'')));R.dep=h?h.id:'';if(h&&!R.to)R.to=posAcc(h)}if(!R.to){const d=depAccs()[0];if(d)R.to=d}if(!R.accsV2&&typeof ALL!='undefined'&&ALL.length){const cash=b=>/^(cash|bargeld)/i.test(b),L=ALL.filter(b=>!isTabu(b));let a=(R.accs||[]).length?L.filter(b=>R.accs.includes(b)||!BUDG.includes(b)):L.slice();a=a.filter(b=>!cash(b));R.accs=a.length==L.length?[]:a;R.accsV2=true;try{save()}catch(e){}}return R}
const ruAccOk=b=>{const A=ruS().accs||[];return !A.length||A.includes(b)};
const ruAmt=a=>{const c=Math.round(a*100),u=Math.ceil(c/100)*100-c;return Math.round(u*(ruS().mult||1))/100};
const ruCard=c=>c&&(ruS().cards||{})[c];
function ruTo(rec){const cr=ruCard(rec.card);return cr&&cr.to&&cr.to!='-'?cr.to:ruS().to}
function ruFor(rec,src){const R=ruS(),cr=ruCard(rec.card);if(cr&&cr.to=='-')return false;if(!R.on||!ruTo(rec)||rec.type!='out'||rec.b==ruTo(rec))return false;if(!ruAccOk(rec.b))return false;if(src=='applepay')return !!R.apple;if(src=='siri')return !!R.siri;return true}
function ruDef(E){if(E.type!='out')return false;if(E.ruOn!=null)return E.ruOn;const old=E.id&&S.exp.find(e=>e.id==E.id);if(old&&old.ru)return ruAccOk(E.b);if(old&&Date.now()-old.t>7*864e5)return false;return ruFor({type:'out',b:E.b,card:E.card},E.src)}
function ruDepAdd(tr){const h=tr.dep&&depot().find(x=>x.id==tr.dep);if(!h)return;const a=tr.a;let q=0,pv=0;if(h.price){q=Math.round(a/h.price*1e8)/1e8;h.qty=Math.round(((h.qty||0)+q)*1e8)/1e8}else if(!h.qty){pv=a;h.pendVal=Math.round(((h.pendVal||0)+a)*100)/100}h.inv=Math.round(((h.inv||0)+a)*100)/100;h.tx=h.tx||[];h.tx.push({id:uid(),t:tr.t,type:'plan',q,p:h.price||0,fee:0,a,ru:tr.id,pv});try{h.avg=avgOf(h)}catch(e){}}
function ruDepDel(trId){depot().forEach(h=>{const i=(h.tx||[]).findIndex(t=>t.ru==trId);if(i<0)return;const t=h.tx[i];h.qty=Math.max(0,Math.round(((h.qty||0)-(t.q||0))*1e8)/1e8);h.inv=Math.max(0,Math.round(((h.inv||0)-t.a)*100)/100);if(t.pv)h.pendVal=Math.max(0,Math.round(((h.pendVal||0)-t.pv)*100)/100);h.tx.splice(i,1);try{h.avg=avgOf(h)}catch(e){}})}
/* Wechselgeld zu einer Ausgabe anlegen, anpassen oder entfernen. opt.on: an/aus (ohne Angabe: bestehendes nachführen) · opt.to: Zielkonto */
function ruSync(rec,opt){opt=opt||{};const R=ruS();let tr=rec.ru&&S.exp.find(e=>e.id==rec.ru);const on='on' in opt?opt.on:!!tr,want=on&&rec.type=='out'?ruAmt(rec.a):0,to=opt.to||(tr&&tr.to)||ruTo(rec),dep='dep' in opt?opt.dep:(tr&&tr.dep!=null?tr.dep:ruDepOf(rec));
 if(tr){ruDepDel(tr.id);if(!want){S.exp=S.exp.filter(e=>e.id!=tr.id);delete rec.ru;return null}Object.assign(tr,{a:want,b:rec.b,to,dep,t:rec.t,n:'Wechselgeld '+(rec.n||rec.c||'')});ruDepAdd(tr);return tr}
 if(!want||!to||to==rec.b)return null;tr={id:uid(),type:'tr',b:rec.b,to,dep,a:want,c:'',n:'Wechselgeld '+(rec.n||rec.c||''),t:rec.t,tg:['wechselgeld'],ruOf:rec.id};S.exp.push(tr);rec.ru=tr.id;ruDepAdd(tr);return tr}
function ruDepOf(rec){const cr=ruCard(rec&&rec.card);if(cr&&cr.to&&cr.to!='-')return cr.dep||'';return ruS().dep||''}
function ruLab(to,dep){const h=dep&&depot().find(x=>x.id==dep);return h?(h.n||h.sym||'ETF'):(SHORT[to]||to||'')}
function ruOpts(sel){const D=depot();return (D.length?`<optgroup label="ETF / Position">${D.map(h=>`<option value="pos:${esc(h.id)}" ${sel=='pos:'+h.id?'selected':''}>${esc(h.n||h.sym||'Position')}</option>`).join('')}</optgroup>`:'')+`<optgroup label="Nur Konto">${ALL.map(b=>`<option value="acc:${esc(b)}" ${sel=='acc:'+b?'selected':''}>${esc(SHORT[b]||b)}</option>`).join('')}</optgroup>`}
function ruPick(v){const R=ruS();if(!v)return {};if(v.startsWith('pos:')){const h=depot().find(x=>x.id==v.slice(4));return{dep:h?h.id:'',to:(h&&posAcc(h))||R.to}}if(v.startsWith('acc:'))return{to:v.slice(4),dep:''};return{}}
const ruSel=(to,dep)=>dep?'pos:'+dep:'acc:'+to;
const ruA=e=>{if(!e||e.type!='out'||!e.ru)return 0;const t=S.exp.find(x=>x.id==e.ru);return t?t.a:0};
const ruHide=e=>!!(e&&e.ruOf&&S.exp.some(x=>x.id==e.ruOf&&x.ru==e.id));
function exDel(id){const e=S.exp.find(x=>x.id==id);if(!e)return;if(e.ru)ruDepDel(e.ru);if(e.ruOf){ruDepDel(e.id);const p=S.exp.find(x=>x.id==e.ruOf);if(p)delete p.ru}S.exp=S.exp.filter(x=>x.id!=id&&x.ruOf!=id)}
const ruList=()=>S.exp.filter(e=>e.type=='tr'&&(e.tg||[]).includes('wechselgeld'));
function ruStats(o){const P=period(o||0),L=ruList().filter(e=>inP(e,P));return{n:L.length,a:Math.round(L.reduce((s,e)=>s+e.a,0)*100)/100}}
function ruMonthly(){const L=ruList();if(!L.length)return 0;const t0=Math.min(...L.map(e=>e.t)),mon=Math.max(1,(Date.now()-t0)/(30.44*864e5));return L.reduce((s,e)=>s+e.a,0)/mon}
function ruAvg(){const L=ruList().slice(-30);return L.length?L.reduce((s,e)=>s+e.a,0)/L.length:0.5*(ruS().mult||1)}
function viewRu(){const R=ruS(),st=ruStats(0),tot=ruList().reduce((s,e)=>s+e.a,0),D=depot();
 const sw=(id,l,s,on)=>`<div class="cell plain"><div class="t"><div>${l}</div>${s?`<div class="s">${s}</div>`:''}</div><input type="checkbox" class="switch" id="${id}" ${on?'checked':''}></div>`;
 return appbar({title:'Wechselgeld',back:'setBack',noGear:true,sub:'Aufrunden und anlegen wie bei Revolut'})+
 `<div class="sec"><div class="group">${sw('ruOn','Wechselgeld aufrunden','Jede passende Kartenzahlung erzeugt eine Umbuchung der Differenz',R.on)}<div class="cell plain"><div class="t"><div>Beispiel: Einkauf 21,37 €</div><div class="s">Umbuchung aus dem Budget des Einkaufs</div></div><div class="v in">+${eur(ruAmt(21.37))}</div></div></div></div>
 <div class="sec"><div class="sh">Multiplikator</div><div class="seg" id="ruMult">${[1,2,5,10].map(m=>`<button class="${(R.mult||1)==m?'on':''}" data-m="${m}">×${m}</button>`).join('')}</div><div class="note">Stell hier denselben Wert ein wie in Revolut.</div></div>
 <div class="sec"><div class="sh">Ziel</div><div class="group"><div class="cell plain"><label for="ruTo">Gebucht auf Konto</label><select id="ruTo" style="margin-left:auto;max-width:60%">${R.to?'':'<option value="">bitte wählen</option>'}${ALL.map(b=>`<option value="${esc(b)}" ${R.to==b?'selected':''}>${esc(SHORT[b]||b)}${depAccs().includes(b)?' · Depot':''}</option>`).join('')}</select></div>
 ${D.length?`<div class="cell plain"><label for="ruDep">In ETF / Position</label><select id="ruDep" style="margin-left:auto;max-width:60%"><option value="">keine</option>${D.map(h=>`<option value="${esc(h.id)}" ${R.dep==h.id?'selected':''}>${esc(h.n||h.sym||'Position')}</option>`).join('')}</select></div>`:''}</div><div class="note">Der gewählte ETF bekommt jede Umbuchung als Ausführung, sein Wert wächst wie bei einem Sparplan. Das Konto bestimmt, wohin das Geld in deinen Budgets fließt.</div></div>
 <div class="sec"><div class="sh">Gilt für</div><div class="group">${sw('ruApple','Apple-Pay-Zahlungen','aus der Wallet-Automation',R.apple)}${sw('ruSiri','Buchungen per Siri','aus dem Kurzbefehl „Buchung“',R.siri)}</div></div>
 <div class="sec"><div class="sh">Von diesen Konten und Budgets</div><div class="group">${ALL.filter(b=>!isTabu(b)).map(b=>`<label class="cell plain"><span style="flex:1">${esc(b)}</span><input type="checkbox" class="switch" data-rua="${esc(b)}" ${ruAccOk(b)?'checked':''}></label>`).join('')}</div><div class="note">Gilt für Apple Pay, Siri und manuelle Buchungen. Das Wechselgeld kommt immer aus dem Konto des Einkaufs. Die Buchungsmaske übernimmt diese Einstellung automatisch und zeigt nur eine Infozeile.</div></div>
 <div class="sec"><div class="sh">Karten</div><div class="group">${Object.keys(R.cards||{}).length?Object.entries(R.cards).map(([c,cr])=>`<div class="cell plain"><label style="flex:1">${esc(c)}</label><select data-ruc="${esc(c)}" style="max-width:55%"><option value="" ${!cr.to?'selected':''}>wie oben (${esc(SHORT[R.to]||R.to||'–')})</option><option value="-" ${cr.to=='-'?'selected':''}>kein Wechselgeld</option>${ruOpts(cr.to&&cr.to!='-'?ruSel(cr.to,cr.dep):'')}</select></div>`).join(''):'<div class="empty">Noch keine Karte erkannt. Ergänze im Apple-Pay-Kurzbefehl „Karte: “ + Transaktion › Karte, dann erscheinen deine Karten hier.</div>'}</div><div class="note">Je Karte ein eigenes Ziel oder kein Wechselgeld, z. B. nur die Revolut-Karten runden auf.</div></div>
 <div class="sec"><div class="sh">Bisher</div><div class="group"><div class="cell plain"><div class="t">Diesen Monat</div><div class="v">${eur(st.a)}<div class="s">${st.n} Zahlung${st.n==1?'':'en'}</div></div></div><div class="cell plain"><div class="t">Insgesamt angelegt</div><div class="v in">${eur(tot)}</div></div></div></div>`}
function bindRu(){const R=ruS(),sv=()=>{save();render()};
 const on=(id,k)=>{const el=$(id);if(el)el.onchange=()=>{R[k]=el.checked;sv()}};on('ruOn','on');on('ruApple','apple');on('ruSiri','siri');on('ruMan','manual');
 document.querySelectorAll('#ruMult [data-m]').forEach(b=>b.onclick=()=>{R.mult=+b.dataset.m;sv()});
 if($('ruTo'))$('ruTo').onchange=e=>{R.to=e.target.value;sv()};
 if($('ruDep'))$('ruDep').onchange=e=>{R.dep=e.target.value;const h=depot().find(x=>x.id==R.dep);if(h&&posAcc(h))R.to=posAcc(h);sv()};
 document.querySelectorAll('[data-ruc]').forEach(el=>el.onchange=()=>{const v=el.value,c=R.cards[el.dataset.ruc];if(!v||v=='-'){c.to=v;c.dep=''}else{const q=ruPick(v);c.to=q.to;c.dep=q.dep}sv()});
 document.querySelectorAll('[data-rua]').forEach(c=>c.onchange=()=>{const all=[...document.querySelectorAll('[data-rua]')],ch=all.filter(x=>x.checked).map(x=>x.dataset.rua);R.accs=ch.length==all.length?[]:ch;sv()})}
/* ---------- Siri & Apple Pay über die Zwischenablage: Assistent bietet beim Öffnen an ---------- */
let clipAsk=false,clipHidAt=0;
const CLIPTIP={sev:'ok',ttl:'Von Siri übernehmen?',txt:'Hast du gerade etwas diktiert oder mit Apple Pay bezahlt? Ein Tipp holt es aus der Zwischenablage: Einkauf, Buchung, Wunsch oder Frage.',btns:[{l:'Übernehmen',fn:'clipGo'},{l:'Nicht jetzt',fn:'clipNo'}]};
const SUPRX=/rewe|edeka|aldi|lidl|norma|netto|penny|kaufland|tegut|globus|real\b|denns|alnatura|bio company|\bdm\b|rossmann|müller/i;
function clipPrompt(){if(!featOn('shopclip')||clipAsk)return;clipAsk=true;S.seenTips=(S.seenTips||[]).filter(k=>!/^ok\|Von Siri/.test(k));renderAsst()}
function clipKind(v){const l=v.toLowerCase().trim();
 if(/(^|\n)\s*apple ?pay\b/.test(l))return 'pay';
 if(/^(buchung|ausgabe|einnahme|umbuchung)\b/.test(l))return 'book';
 if(/^(einkauf|einkaufsliste|einkaufszettel)\b/.test(l)||isShopVoice(v))return 'shop';
 if(/^(notbremse|impuls\b|hilfe,? ich will)/.test(l))return 'urge';
 if(/^(wunsch|ich wünsche mir|wunschliste|auf die wunschliste)/.test(l)||JRX.test(l))return 'misc';
 if(/\?$|^(wie ?viel|was|wann|welche|kann ich|darf ich|wo)\b/.test(l))return 'ask';
 if(/\d\s*(kg|g|gramm|l|liter|ml|stück|packung|pack|dose|dosen|flasche|flaschen)\b/i.test(l)&&!/€|euro/.test(l))return 'shop';
 if(/\d+[,.]\d{1,2}\b|\d+\s*(€|euro|eur)\b/i.test(l))return 'book';
 return 'unk'}
/* Text, der sicher nicht von einem Kurzbefehl stammt: lang, mehrere Sätze, Links, Mailadressen */
function clipJunk(v){v=String(v||'');return v.length>160||/https?:\/\/|www\.|\S+@\S+\.[a-z]{2,}/i.test(v)||(v.match(/[a-zäöüß]{2,}[.!?](\s|$)/gi)||[]).length>=2||v.split(/\s+/).length>20}
const CLIPMK=/^(cf|cashflow)\s*[:·]\s*/i;
function clipGuess(m){{const R=ruleFor(m);if(R&&R.c)return{c:R.c,b:R.b&&ALL.includes(R.b)?R.b:bestAcc(R.c)}}{const am=aiOn()&&(S.aiMer||{})[bKey(m)];if(am&&am.c)return{c:am.c,b:bestAcc(am.c)}}const ml=m.toLowerCase(),sv=E;let r=null;E={type:'out',b:S.lastAcc&&ALL.includes(S.lastAcc)?S.lastAcc:BN[0],c:null,amt:'',n:'',dt:today(),accManual:false};try{qp(m)}catch(e){}if(E.c&&!/sonst/i.test(E.c))r={c:E.c,b:E.b};E=sv;
 const w=ml.split(' ')[0],last=[...S.exp].reverse().find(e=>e.type=='out'&&e.n&&e.c&&!/sonst/i.test(e.c)&&e.n.toLowerCase().split(' ')[0]==w);if(last)return{c:last.c,b:last.b};if(r)return r;
 if(SUPRX.test(ml)){const L=catList().find(x=>/lebensmittel/i.test(x.c));if(L)return{c:L.c,b:bestAcc(L.c)}}aiMerchant(m);return null}
/* Datum/Uhrzeit aus einer Zeile lösen: 07.11.2026, 11:47 · 7. Nov. 2026 um 11:47 · 11:47 */
function clipWhen(x){let m,ts=null,s=x;
 if(m=s.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:,?\s*(?:um\s*)?(\d{1,2}):(\d{2})(?::\d{2})?)?/)){const y=+m[3]<100?2000+ +m[3]:+m[3];ts=new Date(y,+m[2]-1,+m[1],m[4]?+m[4]:12,m[5]?+m[5]:0).getTime();s=s.replace(m[0],' ')}
 else if(m=s.match(/(\d{1,2})\.\s*([A-Za-zÄÖÜäöüß]{3,})\.?\s*(\d{4})(?:,?\s*(?:um\s*)?(\d{1,2}):(\d{2})(?::\d{2})?)?/)){const mi=MONN.findIndex(n=>n.startsWith(m[2].toLowerCase().slice(0,3)));if(mi>=0){ts=new Date(+m[3],mi,+m[1],m[4]?+m[4]:12,m[5]?+m[5]:0).getTime();s=s.replace(m[0],' ')}}
 if(ts==null&&(m=s.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\s*(uhr)?\b/i))){const d=new Date();d.setHours(+m[1],+m[2],0,0);ts=d.getTime();s=s.replace(m[0],' ')}
 return{ts,s:s.replace(/\s+um\s*$/i,'').replace(/\s+/g,' ').trim()}}
function clipMerchant(t){return t.replace(/^apple ?pay\s*:?\s*/i,'').replace(/€|\beuro?\b|\beur\b/gi,' ').replace(/\s+sagt danke\b/i,' ').replace(/[.,]\s*$/,'').replace(/\s+/g,' ').trim()}
function clipPay(v){let card='';const cm=v.match(/karte\s*:\s*([^·\n\d]+)/i);if(cm){card=cm[1].trim();v=v.replace(cm[0],' ')}v=v.replace(/\s*·\s*/g,' ');if(card){const R=ruS();R.cards=R.cards||{};if(!R.cards[card])R.cards[card]={to:''}}const W=clipWhen(v);let t=W.s.replace(/^apple ?pay\s*:?\s*/i,'');const am=t.match(/[-+]?\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|[-+]?\d+(?:[.,]\d{1,2})?/g);if(!am)return null;const raw=am[am.length-1],a=Math.round(Math.abs(pNum(raw.replace(/\.(?=\d{3})/g,'')))*100)/100;if(!a)return null;
 const m=clipMerchant(t.replace(raw,' '))||'Apple Pay',g=clipGuess(m)||{c:((cats(BN[0])||[]).find(k=>/sonst/i.test(k[0]))||['Sonstiges'])[0],b:S.lastAcc&&ALL.includes(S.lastAcc)?S.lastAcc:BN[0]};
 const r={type:'out',b:g.b,c:g.c,a,n:m,dt:today(),tag:'applepay',key:v.trim().toLowerCase(),card};if(W.ts){r.t=W.ts;r.dt=ymd(W.ts)}return r}
function clipParse(v,tag){const sv=E,recs=[],bad=[];v=v.replace(/^(buchung)\s*:?\s*/i,'');const parts=spoken(v).split(/,\s+|\s+(?:und|plus|sowie)\s+/).filter(Boolean);
 (parts.length>1&&parts.every(p=>/\d/.test(p))?parts:[v]).forEach(p=>{E={type:'out',b:S.lastAcc&&ALL.includes(S.lastAcc)?S.lastAcc:BN[0],c:null,amt:'',n:'',dt:today(),accManual:false};qp(p);const a=Math.round((pNum(E.amt)||0)*100)/100;if(!a){bad.push(p);return}
  if(!E.n){const n=p.replace(/[-+]?\d+(?:[.,]\d+)?\s*(€|euro|eur)?/gi,'').replace(/\s+/g,' ').trim();if(n)E.n=n.charAt(0).toUpperCase()+n.slice(1)}
  if(!E.c&&E.type!='tr')E.c=((cats(E.b)||[]).find(k=>/sonst/i.test(k[0]))||(cats(E.b)||[['Sonstiges']])[0])[0];
  recs.push({type:E.type,b:E.b,to:E.to,c:E.type=='tr'?'':E.c,a,n:E.n,dt:E.dt||today(),tag})});E=sv;return{recs,bad}}
function clipCommit(recs){const sn=snap(),done=[],bad=[];let ruN=0;recs.forEach(r=>{if(r.type!='in'&&isTabu(r.b)){bad.push(r.b+' ist tabu');return}if(r.type=='tr'&&isLock(r.to)){bad.push('Notfallbremse '+r.to);return}if(r.type=='out'&&isLock(r.b)&&calc(r.b).rest-r.a<0){bad.push(r.b+' reicht nicht');return}
 const[yy,mm,dd]=r.dt.split('-').map(Number),rec={id:uid(),type:r.type,b:r.b,c:r.c,a:r.a,n:r.n,t:r.t||(r.dt==today()?Date.now():new Date(yy,mm-1,dd,12).getTime()),tg:[r.tag]};if(r.type=='tr')rec.to=r.to;if(r.card)rec.card=r.card;S.exp.push(rec);if(rec.type=='out'&&rec.n&&rec.c)try{ruleLearn(rec.n,rec.c,rec.b)}catch(e){}if(r.type=='out')S.lastAcc=r.b;if(rec.type=='out'&&ruFor(rec,r.tag)){const tr=ruSync(rec,{on:true});if(tr)ruN+=tr.a}done.push(rec)});
 qkAdd(done.map(r=>r.id));save();render();tell(done.length?`${done.length} Buchung${done.length>1?'en':''} gesichert${ruN?' · '+eur(ruN)+' Wechselgeld angelegt':''}${bad.length?' · '+bad.join(', '):''}`:'Nichts gebucht: '+bad.join(', '),done.length?()=>restore(sn):undefined);
 const gro=done.filter(isGro);if(gro.length)setTimeout(()=>shopRecon(gro),500)}
const clipLine=r=>`<div class="clipb"><b>${r.type=='in'?'+':r.type=='tr'?'':'−'}${eur(r.a)}</b> ${esc(r.n||r.c||'Umbuchung')}<div class="s">${r.type=='in'?'Einnahme':r.type=='tr'?'Umbuchung':'Ausgabe'}${r.c?' · '+esc(r.c):''} · ${r.type=='in'?'auf':'von'} ${esc(SHORT[r.b]||r.b)}${r.card?' · '+esc(r.card):''}${r.type=='out'&&ruFor({type:'out',b:r.b,card:r.card},r.tag)&&ruAmt(r.a)?' · +'+eur(ruAmt(r.a))+' Wechselgeld → '+esc(ruLab(ruTo(r),ruDepOf(r))):''}${r.type=='tr'?' → '+esc(SHORT[r.to]||r.to):''}${r.t?' · '+new Date(r.t).toLocaleString('de-DE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):r.dt!=today()?' · '+new Date(r.dt+'T12:00').toLocaleDateString('de-DE'):''}</div></div>`;
const clipPre=r=>({type:r.type,b:r.b,to:r.to,c:r.c,amt:String(r.a),n:r.n,dt:r.dt,src:r.tag,card:r.card||''});
/* ---------- Einkauf mit dem Einkaufszettel abgleichen ---------- */
const isGro=r=>r&&r.type=='out'&&(/lebensmittel|drogerie|haushalt|supermarkt/i.test(r.c||'')||SUPRX.test(r.n||''));
function shopRecon(recs){const sh=shopS(),D=sh.items.filter(x=>x.done);if(!D.length||!recs.length)return;
 const act=Math.round(recs.reduce((s,r)=>s+r.a,0)*100)/100,est=Math.round(D.reduce((s,x)=>s+(x.p||0)*(x.q||1),0)*100)/100,unk=D.filter(x=>!x.p),diff=Math.round((act-est)*100)/100,pct=est?diff/est*100:0,store=[...new Set(recs.map(r=>r.n||r.c))].join(' + ');
 const learn=unk.length==1&&diff>0?Math.round(diff/(unk[0].q||1)*100)/100:0;
 const close=spont=>{const id=uid(),sn=JSON.stringify(sh);sh.trips=sh.trips||[];const est2=Math.round(D.reduce((s,x)=>s+(x.p||0)*(x.q||1),0)*100)/100;sh.trips.unshift({id,t:Date.now(),store,bids:recs.map(r=>r.id),items:D.map(x=>({n:x.n,q:x.q||1,p:x.p||0})),est:est2,act,spont:spont||0,ru:Math.round(recs.reduce((s,r)=>{const e=S.exp.find(q=>q.id==r.id),t=e&&e.ru&&S.exp.find(q=>q.id==e.ru);return s+(t?t.a:0)},0)*100)/100});sh.trips=sh.trips.slice(0,60);
   recs.forEach(r=>{const e=S.exp.find(q=>q.id==r.id);if(e){e.shop=id;if(spont)e.tg=[...new Set([...(e.tg||[]),'ungeplant'])]}});
   const st=(recs[0].n||'').toLowerCase().split(' ')[0];if(recs.length==1&&st){sh.pricesBy=sh.pricesBy||{};sh.pricesBy[st]=sh.pricesBy[st]||{};D.forEach(x=>{if(x.p)sh.pricesBy[st][x.n.toLowerCase()]=x.p})}
   sh.items=sh.items.filter(x=>!x.done);save();render();return sn};
 const undo=sn=>()=>{S.shop=JSON.parse(sn);save();render()};
 const big=!est||Math.abs(diff)>=3||Math.abs(pct)>=10;
 if(!big&&!learn){const sn=close(0);tell(`Einkauf passt zum Zettel: ${eur(act)} statt ca. ${eur(est)}. Abgehakte Artikel entfernt.`,undo(sn));return}
 const h=`<p><b>${esc(store)} ${eur(act)}</b> · geplant ca. ${eur(est)} (${D.length} Artikel im Wagen)${est?` · <b class="${diff>0?'bad':'in'}">${diff>0?'+':'−'}${eur(Math.abs(diff))} (${diff>0?'+':'−'}${Math.abs(Math.round(pct))} %)</b>`:''}</p>${unk.length?`<p class="s">Ohne Preis: ${esc(unk.map(x=>x.n).join(', '))}</p>`:''}${learn?`<p>${esc(unk[0].n)} hat also ca. ${eur(learn)} gekostet?</p>`:''}`;
 const a=[];
 if(learn)a.push(['Preis merken und abschließen',()=>{const x=unk[0],k=x.n.toLowerCase();x.p=learn;x.est=false;x.unk=false;sh.prices[k]=learn;if(sh.unk)delete sh.unk[k];try{phAdd(k,learn)}catch(e){}const sn=close(0);tell(`${x.n}: ${eur(learn)} gemerkt. Abgehakte Artikel entfernt.`,undo(sn))}]);
 a.push(['Zettel abschließen',()=>{const sn=close(0);tell('Abgehakte Artikel entfernt.',undo(sn))}]);
 if(diff>=3&&!learn)a.push(['Mehr als geplant gekauft',()=>{const sn=close(diff);tell(`${eur(diff)} als ungeplant vermerkt. Abgehakte Artikel entfernt.`,undo(sn))}]);
 a.push(['Später',()=>{}]);
 AQ.msgs.push({q:'Einkauf abgleichen',h,a});asstOpen=true;renderAsst()}
function shopHistHtml(){const H=(shopS().trips||[]).filter(h=>h.est>0);if(!H.length)return '';const dev=h=>(h.act-h.est)/h.est*100,avg=H.reduce((s,h)=>s+dev(h),0)/H.length,by={};H.forEach(h=>{(by[h.store]=by[h.store]||[]).push(dev(h))});const f=v=>(v>=0?'+':'−')+Math.abs(Math.round(v))+' %';
 return `<div class="sec"><div class="sh"><span>Einkäufe im Vergleich zum Zettel</span><span>Ø ${f(avg)}</span></div><div class="mmcard">${H.slice(0,6).map(h=>{const d=h.act-h.est;return `<div class="cell plain"><div class="t"><div>${esc(h.store)}${h.spont?' · ungeplant':''}</div><div class="s">${new Date(h.t).toLocaleDateString('de-DE',{day:'numeric',month:'short'})} · ${h.items.length} Artikel · geplant ca. ${eur(h.est)}${h.ru?' · +'+eur(h.ru)+' angelegt':''}</div></div><div class="v ${d>0?'out':'in'}">${eur(h.act)}<div class="s">${d>=0?'+':'−'}${eur(Math.abs(d))}</div></div></div>`}).join('')}</div>
 ${Object.keys(by).length>1?`<div class="note">Ø Abweichung je Händler: ${Object.entries(by).map(([k,v])=>esc(k)+' '+f(v.reduce((a,b)=>a+b,0)/v.length)).join(' · ')}</div>`:''}<div class="note">${avg>=3?`Du kaufst im Schnitt ${Math.round(avg)} % mehr als geplant.`:'Du bleibst im Schnitt im Plan.'}</div></div>`}
/* Einzelner Text ohne Stichwort (alte Kurzbefehle): wie bisher erkennen */
function clipOne(t,say,trust){
  if(t===S.clipLast){say('<p>Das habe ich schon übernommen.</p>');return}
  S.clipLast=t;save();
  if(!trust&&clipJunk(t)){say('<p>In der Zwischenablage liegt ein Text, der nicht nach CashFlow aussieht. Ich habe nichts übernommen.</p>');return}
  let k=clipKind(t);if(k=='unk'&&trust)k='shop';
  if(k=='unk'){say(`<p>Das kann ich nicht sicher zuordnen:</p><p>„${esc(t.slice(0,120))}“</p>`,[['Auf den Einkaufszettel',()=>{const a=shopVoice(t);save();prevTab=tab;tab='more';setView='shop';render();scrollTo(0,0);shopVoiceDone(a)}],['Als Buchung',()=>openSheet(null,{type:'out',n:t.slice(0,40),src:'siri'})],['Verwerfen',()=>{}]]);return}
  if(k=='shop'){const a=shopVoice(t);save();prevTab=tab;tab='more';setView='shop';render();scrollTo(0,0);shopVoiceDone(a);return}
  if(k=='urge'){openUrge();return}
  if(k=='ask'){asstAsk(t);return}
  if(k=='misc'){const r=siriApplyOne(t);save();render();tell(r.ok?r.lab:'Nicht übernommen: '+r.why);return}
  const P=clipParse(t,'siri');
  if(!P.recs.length){say('<p>Ich habe keinen Betrag erkannt. Sag z. B. „12,50 Rewe“.</p>',[['Neue Buchung',()=>openSheet()]]);return}
  const one=P.recs.length==1,r0=P.recs[0];
  say(`<p>${one?'Buchung':'Buchungen'} erkannt:</p>${P.recs.map(clipLine).join('')}${P.bad.length?`<p class="s">Nicht erkannt: ${esc(P.bad.join(', '))}</p>`:''}`,
   [[one?'Buchen':'Alle buchen',()=>clipCommit(P.recs)],...(one?[['Bearbeiten',()=>openSheet(null,clipPre(r0))]]:[]),['Verwerfen',()=>{}]])}
const CLIPPFX=/^(apple ?pay\b|buchung\s*:|einkauf(?:sliste|szettel)?\s*:)/i;
Object.assign(TIPFN,{
 clipGo:async()=>{clipAsk=false;let t='';try{t=await navigator.clipboard.readText()}catch(e){}return TIPFN.clipRun((t||'').trim())},
 clipRun:t=>{
  const say=(h,a,q)=>{AQ.msgs.push({q:q!=null?q:(t?'Von Siri: „'+t.slice(0,80)+(t.length>80?'…':'')+'“':''),h,a:a||[]});asstOpen=true;renderAsst()};
  if(!t){say('<p>Die Zwischenablage ist leer oder das Einfügen wurde nicht erlaubt.</p>',[['Einkaufsliste einfügen',()=>{shopS().paste='';prevTab=tab;tab='more';setView='shop';render()}],['Neue Buchung',()=>openSheet()]]);return}
  const lines0=t.split(/\r?\n+/).map(x=>x.trim()).filter(Boolean),trust=new Set(),lines=lines0.map(x=>{if(CLIPMK.test(x)){x=x.replace(CLIPMK,'').trim();trust.add(x)}else if(CLIPPFX.test(x))trust.add(x);return x}).filter(Boolean);
  if(!lines.length){say('<p>Die Zwischenablage ist leer.</p>');return}
  if(lines.length==1&&!CLIPPFX.test(lines[0]))return clipOne(lines[0],say,trust.has(lines[0]));
  if(!trust.size){S.clipLast=t;save();say('<p>In der Zwischenablage liegt ein Text, der nicht von einem CashFlow-Kurzbefehl stammt. Ich habe nichts übernommen.</p>');return}
  const seen=new Set([...(S.clipSeen||[]),...(S.paySeen||[])]);
  const items=lines.map(x=>{const W=clipWhen(x.replace(/\s*·\s*/g,' ')),body=W.s.trim(),strip=body.replace(/^(apple ?pay|buchung|einkaufsliste|einkaufszettel|einkauf)\s*:?\s*/i,'').trim();
   let kind=/^apple ?pay\b/i.test(body)?'pay':/^buchung\b/i.test(body)?'book':/^einkauf/i.test(body)?'shop':clipKind(body);if(!trust.has(x)&&(clipJunk(body)||kind=='unk'))kind='skip';else if(kind=='unk')kind='shop';return{x,key:x.toLowerCase(),body,strip,ts:W.ts,kind:strip?kind:'empty',dd:!!W.ts||kind=='pay'}});
  const skipN=items.filter(o=>o.kind=='skip').length,oldN=items.filter(o=>o.kind!='skip'&&o.ts&&Date.now()-o.ts>3*864e5).length;
  const fresh=items.filter(o=>o.kind!='skip'&&!(o.ts&&Date.now()-o.ts>3*864e5)).filter(o=>o.dd?!seen.has(o.key):t!==S.clipLast);
  if(!fresh.length&&(skipN||oldN)){S.clipLast=t;save();say('<p>Nichts Neues übernommen'+(oldN?': '+oldN+' Einträge sind älter als 3 Tage':'')+(skipN?(oldN?', ':': ')+skipN+' Zeilen stammen nicht von einem Kurzbefehl':'')+'.</p>');return}
  if(!fresh.length){say('<p>Das habe ich schon alles übernommen.</p>');return}
  const mark=keys=>{S.clipSeen=[...(S.clipSeen||[]),...keys].slice(-400);save()};S.clipLast=t;
  const shopN=[];fresh.filter(o=>o.kind=='shop').forEach(o=>shopN.push(...(shopVoice(o.strip)||[])));
  const misc=fresh.filter(o=>o.kind=='misc').map(o=>{const r=siriApplyOne(o.body);return r.ok?r.lab:'Nicht übernommen: '+r.why});
  const asks=fresh.filter(o=>o.kind=='ask'),urge=fresh.some(o=>o.kind=='urge'),empty=fresh.filter(o=>o.kind=='empty');
  mark(fresh.filter(o=>!['pay','book'].includes(o.kind)).map(o=>o.key));
  const recs=[],open=[];fresh.filter(o=>o.kind=='pay'||o.kind=='book').forEach(o=>{
   if(o.kind=='pay'){const r=clipPay(o.x.replace(/\s*·\s*/g,' '));if(r){r.key=o.key;recs.push(r)}else{const m=clipMerchant(o.body)||'Apple Pay',g=clipGuess(m),pre={type:'out',n:m,dt:o.ts?ymd(o.ts):today(),src:'applepay'};if(g){pre.c=g.c;pre.b=g.b}open.push({key:o.key,pre,lab:'Apple Pay bei <b>'+esc(m)+'</b>'+(pre.c?' · '+esc(pre.c):'')+' · ohne Betrag'})}}
   else{const P=clipParse(o.strip,'siri');P.recs.forEach(r=>{r.key=o.key;if(o.ts){r.t=o.ts;r.dt=ymd(o.ts)}recs.push(r)});if(!P.recs.length)open.push({key:o.key,pre:{type:'out',n:o.strip,src:'siri'},lab:'„'+esc(o.strip)+'“ · kein Betrag erkannt'})}});
  const dups=[];{const pays=recs.filter(r=>r.tag=='applepay');for(let i=recs.length-1;i>=0;i--){const r=recs[i],ex=S.exp.find(e=>e.type=='out'&&Math.abs(e.a-r.a)<0.005&&Math.abs(e.t-(r.t||Date.now()))<36*3600e3&&((r.tag=='applepay')!==(e.tg||[]).includes('applepay'))),inb=r.tag!='applepay'&&pays.some(p=>Math.abs(p.a-r.a)<0.005);if(ex||inb){r.dupOf=ex?(ex.n||ex.c||'Buchung')+' '+new Date(ex.t).toLocaleDateString('de-DE',{day:'numeric',month:'short'}):'Apple-Pay-Zahlung oben';dups.unshift(r);recs.splice(i,1)}}}
  save();render();
  if(!recs.length&&!open.length&&!misc.length&&!empty.length&&!dups.length&&shopN.length){prevTab=tab;tab='more';setView='shop';render();scrollTo(0,0);shopVoiceDone(shopN)}
  else{const cnt=[shopN.length&&shopN.length+' Artikel',dups.length&&dups.length+' schon gebucht',recs.filter(r=>r.tag=='applepay').length&&recs.filter(r=>r.tag=='applepay').length+' Apple Pay',recs.filter(r=>r.tag!='applepay').length&&recs.filter(r=>r.tag!='applepay').length+' Buchung'+(recs.filter(r=>r.tag!='applepay').length>1?'en':''),open.length&&open.length+' offen'].filter(Boolean).join(' · ');
   const h=`${shopN.length?`<p>${I('cart',14)} Auf den Einkaufszettel: ${esc(shopN.join(', '))}</p>`:''}${misc.length?`<p>${misc.map(esc).join('<br>')}</p>`:''}${recs.length?`<p>Bitte bestätigen:</p>${recs.map(clipLine).join('')}`:''}${open.length?`<p>${open.map(o=>o.lab).join('<br>')}</p>`:''}${dups.length?`<p class="s">Schon gebucht, daher übersprungen: ${dups.map(r=>esc((r.n||r.c)+' '+eur(r.a))+' (wie '+esc(r.dupOf)+')').join(', ')}</p>`:''}${skipN||oldN?`<p class="s">Ignoriert: ${[skipN&&skipN+' fremde Zeile'+(skipN>1?'n':''),oldN&&oldN+' älter als 3 Tage'].filter(Boolean).join(', ')}.</p>`:''}${empty.length?`<p class="s">Leer übergeben: ${empty.map(o=>'„'+esc(o.body)+'“').join(', ')}. Prüfe im Kurzbefehl, ob die Variable <b>Diktierter Text</b> im Text steht.</p>`:''}`;
   const acts=[];if(recs.length)acts.push([recs.length==1?'Buchen':'Alle '+recs.length+' buchen',()=>{mark([...recs.map(r=>r.key),...dups.map(r=>r.key)]);clipCommit(recs)}]);
   recs.slice(0,3).forEach(r=>acts.push([recs.length==1?'Bearbeiten':'Bearbeiten: '+esc(r.n||r.c),()=>{mark([r.key]);openSheet(null,clipPre(r))}]));
   open.slice(0,3).forEach(o=>acts.push(['Eingeben: '+esc(o.pre.n).slice(0,24),()=>{mark([o.key]);openSheet(null,o.pre)}]));
   if(dups.length)acts.push(['Trotzdem buchen ('+dups.length+')',()=>{mark(dups.map(r=>r.key));clipCommit(dups)}]);
   if(recs.length||open.length||dups.length)acts.push(['Verwerfen',()=>mark([...recs.map(r=>r.key),...open.map(o=>o.key),...dups.map(r=>r.key)])]);
   if(shopN.length)acts.push(['Zettel öffnen',()=>{prevTab=tab;tab='more';setView='shop';render();scrollTo(0,0)}]);
   say(h,acts,'Von Siri & Apple Pay: '+(cnt||'nichts Neues'))}
  asks.forEach(o=>asstAsk(o.body));if(urge)openUrge()},
 clipNo:()=>{clipAsk=false;renderAsst()}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')clipHidAt=Date.now();else if(clipHidAt&&Date.now()-clipHidAt>30*60e3)setTimeout(clipPrompt,600)});setTimeout(clipPrompt,1500);
setTimeout(clipPrompt,1500);

/* Kurzbefehl öffnet die App mit ?sag=… oder ?frage=… */
setTimeout(()=>{try{const q=new URLSearchParams(location.search),sag=q.get('sag'),fr=q.get('frage');if(!sag&&!fr)return;history.replaceState(history.state,'',location.pathname);
  if(sag)siriApplyAll([{txt:sag,created_at:new Date().toISOString()}]);else if(fr){asstOpen=true;asstAsk(fr);renderAsst()}}catch(e){}},900);
/* Ausführliche Anleitung zum Einrichten der Kurzbefehle (ohne Schlüssel, der steckt in den Adressen) */
const SIRI_GUIDE=[
 ['So funktioniert es',[
  'Den Schlüssel tippst du nirgends ein. Er steckt schon in den Adressen unter Siri & Kurzbefehle. Du tippst dort nur auf *Kopieren* und fügst die Adresse im Kurzbefehl ein.',
  'Neue Aktionen fügst du unten über das Suchfeld *Aktion suchen* hinzu.',
  'Die Adresse kommt immer in eine eigene Aktion *Text*: ins Feld tippen, lange drücken › *Einsetzen*. Direkt dahinter, ohne Leerzeichen, in der Leiste über der Tastatur *URL-codierter Text* antippen.',
  'In *Inhalte von URL abrufen* (bzw. *URLs öffnen*) kommt dann nur die Variable *Text* ins URL-Feld. Die Adresse nie direkt dort einfügen, sonst meldet iOS „Keine Konvertierung von Formatierter Text in URL“.',
  'Umbenennen: oben auf den Namen tippen › *Umbenennen*. Der Name ist der Satz für Siri.',
  'Reihenfolge: zuerst 1, 7 und 4, den Rest später.']],
 ['Kurzbefehl 1 · „CashFlow“ – Buchung per Sprache',[
  'In CashFlow bei Kurzbefehl 1 auf *Kopieren* tippen.',
  'Kurzbefehle-App › *+* oben rechts.',
  'Aktion *Text diktieren*.',
  'Aktion *URL codieren* – nimmt den diktierten Text automatisch.',
  'Aktion *Text* – Adresse einsetzen, *URL-codierter Text* direkt dahinter.',
  'Aktion *Inhalte von URL abrufen* – ins URL-Feld nur die Variable *Text*.',
  'Aktion *Text sprechen*.',
  'Name: *CashFlow*. Test: „Hey Siri, CashFlow“ › „12 Euro Rewe“.']],
 ['Kurzbefehl 7 · „CashFlow Einkauf“',[
  'Genau wie Kurzbefehl 1, aber mit der Adresse von Kurzbefehl 7.',
  'Name: *CashFlow Einkauf*. Test: „Hey Siri, CashFlow Einkauf“ › „Milch und Brot“.']],
 ['Kurzbefehl 5 · „CashFlow leisten“',[
  'Genau wie Kurzbefehl 1, mit der Adresse von Kurzbefehl 5.']],
 ['Kurzbefehle 2 und 6 · „CashFlow Stand“ / „CashFlow Woche“',[
  'Aktion *Text* mit der Adresse von 2 bzw. 6 (ohne Variable).',
  'Aktion *Inhalte von URL abrufen* – ins URL-Feld die Variable *Text*.',
  'Aktion *Text sprechen*.',
  'Passend benennen.']],
 ['Kurzbefehl 3 · „CashFlow fragen“',[
  'Aktion *Text diktieren*.',
  'Aktion *URL codieren*.',
  'Aktion *Text* – Adresse von Kurzbefehl 3, *URL-codierter Text* direkt dahinter.',
  'Aktion *URLs öffnen* mit der Variable *Text*.']],
 ['Kurzbefehl 4 · Apple Pay (automatisch)',[
  'Kurzbefehle-App › Tab *Automation* › *+* › *Wallet*.',
  'Alle Karten wählen, *Sofort ausführen* an, „Bei Ausführung benachrichtigen“ aus › Weiter › *Neuer leerer Kurzbefehl*.',
  'Aktion *Text*: „Apple Pay “ tippen, dann über der Tastatur *Kurzbefehl-Eingabe* antippen, die blaue Marke antippen › *Händler*.',
  'Leerzeichen, wieder *Kurzbefehl-Eingabe* › *Betrag*.',
  '„ · Karte: “ tippen, *Kurzbefehl-Eingabe* › *Karte*.',
  '„ · “ tippen, Variable *Aktuelles Datum*.',
  'Aktion *URL codieren* – ins Feld nur die Variable *Text* (die Apple-Pay-Zeile), nie die Adresse.',
  'Zweite Aktion *Text* – Adresse von Kurzbefehl 4, *URL-codierter Text* direkt dahinter.',
  'Aktion *Inhalte von URL abrufen* – Variable auswählen › die zweite Text-Aktion (mit der Adresse) antippen.',
  'Alte Apple-Pay-Automation mit „In Zwischenablage kopieren“ löschen.']],
 ['Kurzbefehl 8 · Beleg teilen (optional)',[
  'Neuer Kurzbefehl *An CashFlow* › *ⓘ* › *Im Share-Sheet anzeigen* an, Eingabe: Bilder.',
  'Aktion *Text aus Bild extrahieren* (Kurzbefehl-Eingabe).',
  'Aktion *Text*: „Beleg: “ tippen, Variable *Text aus Bild*.',
  'Aktion *URL codieren* (ins Feld nur die Variable *Text*, nie die Adresse), dann zweite Aktion *Text* – Adresse von Kurzbefehl 8, *URL-codierter Text* direkt dahinter.',
  'Aktion *Inhalte von URL abrufen* – Variable auswählen › die zweite Text-Aktion antippen.',
  'Optional *Mitteilung anzeigen* mit „Inhalte der URL“.',
  'Benutzen: Bon fotografieren › Teilen › *An CashFlow*.']],
 ['Kurzbefehl 9 · Mail (optional)',[
  'Tab *Automation* › *+* › *E-Mail* › Absender wählen (z. B. PayPal) › *Sofort ausführen* › Neuer leerer Kurzbefehl.',
  'Aktion *Text*: „Mitteilung: “, dann *Kurzbefehl-Eingabe › Betreff*, Leerzeichen, *Kurzbefehl-Eingabe › Inhalt*.',
  'Aktion *URL codieren* (ins Feld nur die Variable *Text*, nie die Adresse), dann zweite Aktion *Text* – Adresse von Kurzbefehl 9, *URL-codierter Text* direkt dahinter.',
  'Aktion *Inhalte von URL abrufen* – Variable auswählen › die zweite Text-Aktion antippen.']],
 ['Aufräumen',[
  'Alte Kurzbefehle mit der Aktion „In Zwischenablage kopieren“ löschen.',
  'Klappt etwas nicht: unten auf dieser Seite „Stand abrufen“ testen. Kommt ein Text, laufen Schlüssel und Funktion.']]];
function siriGuideTxt(){return 'CashFlow · Siri & Kurzbefehle einrichten\n\n'+SIRI_GUIDE.map(([h,L],i)=>h+'\n'+L.map((x,j)=>(i&&L.length>1?(j+1)+'. ':'• ')+x.replace(/\*/g,'')).join('\n')).join('\n\n')}
/* Beispiel-Ansicht je Kurzbefehl (Index = Abschnitt in SIRI_GUIDE). [x] = blaue Variable, {n} = Adresse von Kurzbefehl n */
const SG_A={d:['🎙','#64d2ff'],u:['🔗','#8e8e93'],t:['≡','#ffd60a'],g:['⬇','#30d158'],s:['🔊','#ff453a'],o:['🧭','#0a84ff'],x:['🖼','#bf5af2'],m:['🔔','#ff9f0a'],w:['⚡','#5e5ce6']};
const SG_BASE=n=>[['d','Text diktieren'],['u','URL codieren [Diktierter Text]'],['t','Text\n{'+n+'}[URL-codierter Text]',1],['g','Inhalte von [Text] abrufen',2],['s','[Inhalt der URL] sprechen']];
const SIRI_MOCK={1:SG_BASE(1),2:SG_BASE(7),3:SG_BASE(5),
 4:[['t','Text\n{2 bzw. 6}',1],['g','Inhalte von [Text] abrufen',2],['s','[Inhalt der URL] sprechen']],
 5:[['d','Text diktieren'],['u','URL codieren [Diktierter Text]'],['t','Text\n{3}[URL-codierter Text]',1],['o','[Text] öffnen',2]],
 6:[['w','Automation: Wenn ich mit einer Karte bezahle · Sofort ausführen'],['t','Text\nApple Pay [Händler] [Betrag] · Karte: [Karte] · [Aktuelles Datum]'],['u','URL codieren [Text]'],['t','Text\n{4}[URL-codierter Text]',1],['g','Inhalte von [Text] abrufen',2]],
 7:[['w','Im Share-Sheet anzeigen · Eingabe: Bilder'],['x','Text aus [Kurzbefehl-Eingabe] extrahieren'],['t','Text\nBeleg: [Text aus Bild]'],['u','URL codieren [Text]'],['t','Text\n{8}[URL-codierter Text]',1],['g','Inhalte von [Text] abrufen',2],['m','[Inhalt der URL] als Mitteilung anzeigen']],
 8:[['w','Automation: E-Mail von PayPal · Sofort ausführen'],['t','Text\nMitteilung: [Betreff] [Inhalt]'],['u','URL codieren [Text]'],['t','Text\n{9}[URL-codierter Text]',1],['g','Inhalte von [Text] abrufen',2]]};
const SG_NOTE={1:'Adresse einmal einsetzen, die blaue Marke direkt dahinter (kein Leerzeichen).',2:'Ins URL-Feld nur die Variable „Text“, keine Adresse.'};
function siriMockHtml(L){const pill=v=>`<span style="display:inline-block;background:color-mix(in srgb,var(--blue) 18%,transparent);color:var(--blue);border-radius:7px;padding:0 7px;margin:1px 0;white-space:nowrap">${esc(v)}</span>`;
  const fmt=t=>esc(t).replace(/\{([^}]+)\}/g,(m,n)=>`<span style="font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--muted);word-break:break-all">https://…/push?op=siri&amp;k=…&amp;txt=</span><span style="font-size:11px;color:var(--muted)"> (Adresse ${n})</span>`).replace(/\[([^\]]+)\]/g,(m,v)=>pill(v.replace(/&amp;/g,'&'))).replace(/\n/g,'<br>');
  return `<div style="margin-top:10px;padding:12px 10px;border-radius:16px;background:color-mix(in srgb,var(--fg) 6%,transparent)"><div style="font-size:12px;color:var(--muted);margin:0 4px 8px;text-transform:uppercase;letter-spacing:.04em">So sieht es aus</div>${L.map(([k,t,n],i)=>{const[ic,col]=SG_A[k];return `${i?'<div style="width:2px;height:10px;background:var(--muted);opacity:.4;margin:0 auto"></div>':''}<div style="display:flex;gap:10px;align-items:flex-start;background:var(--card);border-radius:14px;padding:9px 11px;font-size:14.5px;line-height:1.55;${n==1?'outline:2px solid #ff9f0a;':''}"><span style="flex:none;width:24px;height:24px;border-radius:6px;background:${col};display:flex;align-items:center;justify-content:center;font-size:13px;color:#000">${ic}</span><span style="flex:1;min-width:0">${fmt(t)}</span></div>${n?`<div style="font-size:12.5px;color:#d98a00;margin:4px 6px 0">⬆ ${SG_NOTE[n]}</div>`:''}`}).join('')}</div>`}
function openSiriGuide(){const b=x=>esc(x).replace(/\*([^*]+)\*/g,'<b>$1</b>');
  $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Anleitung Kurzbefehle"><div class="sheet-h"><button id="sgX">Schließen</button><b>Anleitung</b><button id="sgSh" style="font-weight:600">Teilen</button></div>
   <div class="sheet-b">${SIRI_GUIDE.map(([h,L],i)=>`<div class="sec" style="margin:0"><div class="sh">${esc(h)}</div><div class="mmcard" style="padding:10px 14px">${i&&L.length>1?`<ol style="margin:0;padding-left:26px;line-height:1.5">${L.map(x=>`<li style="margin:4px 0">${b(x)}</li>`).join('')}</ol>`:L.map(x=>`<p style="margin:4px 0;line-height:1.5">${b(x)}</p>`).join('')}${SIRI_MOCK[i]?siriMockHtml(SIRI_MOCK[i]):''}</div></div>`).join('')}</div></div>`;
  $('scrim').onclick=$('sgX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst&&renderAsst()};
  $('sgSh').onclick=async()=>{const t=siriGuideTxt();try{if(navigator.share){await navigator.share({title:'CashFlow · Kurzbefehle einrichten',text:t});return}}catch(e){if(e&&e.name=='AbortError')return}try{await navigator.clipboard.writeText(t);toast('Anleitung kopiert. Z. B. in Notizen einfügen.')}catch(e){toast('Teilen ging nicht.')}}}
function siriHtml(){const sk=siriGet(),u=siriFnUrl(),app=location.origin+location.pathname,P=S.siriPend||[];
  const cp=(id,val)=>`<div class="cell plain" style="gap:8px"><code id="${id}" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px">${esc(val)}</code><button class="ed-link" data-cp="${id}" style="color:var(--blue)">Kopieren</button></div>`;
  const step=(n,t,b)=>`<div class="srow"><div style="display:flex;align-items:flex-start;gap:12px"><span class="setup-n" style="position:static;flex:none;margin:0">${n}</span><span style="flex:1;min-width:0"><b>${t}</b><br><small style="color:var(--muted);line-height:1.45">${b}</small></span></div></div>`;
  if(!syOn())return `<div class="tip">Siri braucht den Online-Sync. Bitte zuerst unter Einstellungen › Online-Sync verbinden.</div>`;
  const SE=S.siriSeen||{},ago=t=>{const d=Math.floor((Date.now()-t)/864e5),h=Math.floor((Date.now()-t)/36e5);return d>=1?`vor ${d} Tag${d==1?'':'en'}`:h>=1?`vor ${h} Std.`:'gerade eben'},when=t=>t?`${new Date(t).toLocaleString('de-DE',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · ${ago(t)}`:'noch nie',old=!SE.pay||Date.now()-SE.pay>5*864e5;
  const last=`<div class="sec"><div class="sh">Zuletzt angekommen</div><div class="mmcard"><div class="srow"><div class="srow-h"><span><b>Apple-Pay-Zahlung</b><br><small style="color:${old?'var(--warn)':'var(--muted)'}">${when(SE.pay)}</small></span></div></div><div class="srow"><div class="srow-h"><span><b>Siri-Eingabe</b><br><small style="color:var(--muted)">${when(SE.siri)}</small></span></div></div>${old?`<div class="note" style="padding:8px 0 0">${SE.pay?`Seit ${ago(SE.pay).replace('vor ','')} ist keine Zahlung angekommen.`:'Bisher ist keine Apple-Pay-Zahlung angekommen.'} Hast du seitdem mit Apple Pay bezahlt, prüfe die Wallet-Automation in der Kurzbefehle-App: Steht im Schritt mit der Adresse hinter <code>txt=</code> eine rote Variable, setze dort „URL-codierter Text“ neu ein.</div>`:''}<button class="btn soft" id="siriChkNow" style="margin:10px 0 0">Jetzt abrufen</button>${S.siriChk?`<div class="note" style="padding:6px 0 0;text-align:center">Zuletzt geprüft ${new Date(S.siriChk).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</div>`:''}</div></div>`;
  return `<div class="anchor">${I('mic',16)}<span>Mit Apple-Kurzbefehlen sprichst du mit CashFlow, ohne die App zu öffnen: „Hey Siri, CashFlow“ trägt ein, „Hey Siri, CashFlow Stand“ liest deine Budgets vor, „Hey Siri, CashFlow fragen“ öffnet den Assistenten mit deiner Frage.</span></div>${last}
   ${P.length?`<div class="sec"><div class="sh">Bitte prüfen · ${P.length}</div><div class="mmcard">${P.map(p=>`<div class="srow"><div class="srow-h"><span><b>„${esc(p.txt)}“</b><br><small style="color:var(--muted)">${esc(p.why)} · ${new Date(p.t).toLocaleString('de-DE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></span><span></span><span style="display:flex;gap:6px"><button class="btn soft" data-sp="${p.id}" style="padding:6px 10px;min-height:0">Öffnen</button><button class="ed-ic" data-spx="${p.id}" aria-label="Verwerfen">${I('minus',18)}</button></span></div></div>`).join('')}</div></div>`:''}
   <div class="group" style="margin:0 0 4px"><button class="cell plain" id="siGuide" style="color:var(--blue);gap:10px">${I('book',18)}<span style="flex:1;text-align:left">Schritt-für-Schritt-Anleitung</span>›</button></div>
   <div class="sec"><div class="sh">Dein Siri-Schlüssel</div><div class="group">${sk?cp('siK',sk.k):'<div class="cell plain"><span style="color:var(--muted)">Noch kein Schlüssel erzeugt.</span></div>'}${cp('siU',u)}</div>
    <button class="btn ${sk?'soft':''}" id="siGen">${sk?'Neuen Schlüssel erzeugen (alter wird ungültig)':'Schlüssel erzeugen'}</button>
    <div class="note">Der Schlüssel steckt schon in den Adressen unten. Er erlaubt nur: Sätze in deine Siri-Ablage legen, den Briefing-Stand vorlesen und den Kalender abrufen. Er liegt nur auf diesem Gerät und in deinen Kurzbefehlen. Bei Verlust einfach neu erzeugen – dann die Adressen in den Kurzbefehlen ersetzen.</div></div>
   ${sk?`<div class="sec"><div class="sh">Kurzbefehl 1 · „CashFlow“ – eintragen</div><div class="group">${cp('siA',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&txt=')}</div><div class="mmcard">
     ${step(1,'Kurzbefehle-App › + › „Text diktieren“','Sprache: Deutsch.')}
     ${step(2,'„Text URL-codieren“','Nimmt automatisch den diktierten Text.')}
     ${step(3,'Aktion „Text“','Adresse oben über „Kopieren“ einfügen, ohne Leerzeichen direkt dahinter die Variable „URL-codierter Text“.')}
     ${step(4,'„Inhalte von URL abrufen“','Feld leeren, „Variable auswählen“ › die Text-Aktion davor antippen. Im Feld steht nur „Text“.')}
     ${step(5,'„Text sprechen“','Ins Feld die Variable „Inhalt der URL“, nicht „Text“. Spricht die Antwort („Notiert: …“). Kurzbefehl „CashFlow“ nennen – fertig.')}${siriMockHtml(SIRI_MOCK[1])}</div>
     <div class="note">Beispiele: „Rewe 23,40“ · „Tanken 60 von Flow“ · „Milch und Eier auf die Einkaufsliste“ · „Wunsch Kopfhörer 89 Euro“ · „Journal: wollte Sneaker, gestresst, widerstanden“ · „Notbremse“. Übernommen wird beim nächsten Öffnen der App.</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 2 · „CashFlow Stand“ – vorlesen</div><div class="group">${cp('siB',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&m=stand')}</div><div class="mmcard">
     ${step(1,'„Inhalte von URL abrufen“','In eine Aktion „Text“: Adresse oben. Hier dann nur die Variable „Text“ einsetzen.')}
     ${step(2,'„Text sprechen“','Ins Feld die Variable „Inhalt der URL“, nicht „Text“. Siri liest Budgets, Tagesbudget, heutige Ausgaben, Vermögen, Termine und Depot vor – Stand deiner letzten App-Nutzung.')}${siriMockHtml(SIRI_MOCK[4])}</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 3 · „CashFlow fragen“ – Assistent</div><div class="group">${cp('siQ',app+'?frage=')}</div><div class="mmcard">
     ${step(1,'„Text diktieren“','Deine Frage, z. B. „Wie viel habe ich im Oktober bei Rewe ausgegeben?“')}
     ${step(2,'„URL codieren“','Ins Feld die Variable „Diktierter Text“.')}
     ${step(3,'„URLs öffnen“','In eine Aktion „Text“: Adresse oben, direkt dahinter „URL-codierter Text“. Hier dann nur die Variable „Text“ einsetzen.')}</div>
     <div class="group">${cp('siS',app+'?sag=')}${siriMockHtml(SIRI_MOCK[5])}</div><div class="note">Variante ohne Ablage: dieselben drei Schritte mit dieser Adresse – CashFlow öffnet sich kurz und trägt sofort ein.</div>
     <div class="note">Tipp: Wenn alles läuft, teile jeden Kurzbefehl einmal über „iCloud-Link kopieren“ und leg die Links z. B. in Notizen ab. Auf einem neuen iPhone reicht dann ein Tipp.</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 4 · Apple Pay (Automation)</div><div class="group">${cp('siP',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&txt=')}</div><div class="mmcard">
     ${step(1,'Kurzbefehle › Automation › + › Wallet','Alle Karten, „Sofort ausführen“ an, „Bei Ausführung benachrichtigen“ aus.')}
     ${step(2,'„Text“','Apple Pay [Transaktion › Händler] [Transaktion › Betrag] · Karte: [Transaktion › Karte] · [Aktuelles Datum]')}
     ${step(3,'„URL codieren“','Ins Feld nur die Variable „Text“ aus Schritt 2, nie die Adresse.')}
     ${step(4,'Zweite Aktion „Text“','Adresse oben über „Kopieren“ einfügen, ohne Leerzeichen direkt dahinter die Variable „URL-codierter Text“.')}
     ${step(5,'„Inhalte von URL abrufen“','Feld leeren, „Variable auswählen“ › die Text-Aktion aus Schritt 4 antippen. Im Feld steht dann nur „Text“, keine Adresse.')}${siriMockHtml(SIRI_MOCK[6])}</div>
     <div class="note">Die Zwischenablage wird beim Öffnen nicht mehr geprüft. Wer noch alte Kurzbefehle nutzt, schaltet das unter Einstellungen › Funktionen &amp; Ansicht › „Zwischenablage beim Öffnen prüfen“ wieder ein; dann werden nur Texte von Kurzbefehlen übernommen.</div>
     <div class="note">Ersetzt den alten Weg über die Zwischenablage: Jede Zahlung landet sicher in deiner Ablage, auch wenn du zwischendurch etwas kopierst. Mit eingeschalteten Mitteilungen kommt sofort ein Hinweis, wie viel im Budget noch übrig ist. Beim Öffnen der App bestätigst du alle Zahlungen auf einmal.</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 5 · „CashFlow leisten“</div><div class="group">${cp('siL',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&m=leisten&txt=')}</div><div class="mmcard">
     ${step(1,'„Text diktieren“','Zum Beispiel „80 Euro“ oder „120 aus Flow“.')}
     ${step(2,'„URL codieren“','Ins Feld die Variable „Diktierter Text“.')}
     ${step(3,'Aktion „Text“','Adresse oben über „Kopieren“ einfügen, ohne Leerzeichen direkt dahinter die Variable „URL-codierter Text“.')}
     ${step(4,'„Inhalte von URL abrufen“','Feld leeren, „Variable auswählen“ › die Text-Aktion davor antippen. Im Feld steht nur „Text“.')}
     ${step(5,'„Text sprechen“','Ins Feld die Variable „Inhalt der URL“, nicht „Text“. Siri sagt Ja, Ja aber oder Nein und was danach übrig bleibt.')}${siriMockHtml(SIRI_MOCK[3])}</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 6 · „CashFlow Woche“</div><div class="group">${cp('siW',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&m=woche')}</div><div class="mmcard">
     ${step(1,'„Inhalte von URL abrufen“','In eine Aktion „Text“: Adresse oben. Hier dann nur die Variable „Text“ einsetzen.')}
     ${step(2,'„Text sprechen“','Ins Feld die Variable „Inhalt der URL“, nicht „Text“. Abbuchungen, Einnahmen, Fristen und Wünsche der nächsten 7 Tage.')}${siriMockHtml(SIRI_MOCK[4])}</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 7 · „CashFlow Einkauf“</div><div class="group">${cp('siE',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&txt=Einkaufsliste%20')}</div><div class="mmcard">
     ${step(1,'„Text diktieren“','Zum Beispiel „Milch, zwei Brot und Eier“.')}
     ${step(2,'„URL codieren“','Ins Feld die Variable „Diktierter Text“.')}
     ${step(3,'Aktion „Text“','Adresse oben über „Kopieren“ einfügen, ohne Leerzeichen direkt dahinter die Variable „URL-codierter Text“.')}
     ${step(4,'„Inhalte von URL abrufen“','Feld leeren, „Variable auswählen“ › die Text-Aktion davor antippen. Im Feld steht nur „Text“.')}
     ${step(5,'„Text sprechen“','Ins Feld die Variable „Inhalt der URL“, nicht „Text“. Kurzbefehl „CashFlow Einkauf“ nennen.')}${siriMockHtml(SIRI_MOCK[2])}</div>
     <div class="note">Ersetzt den alten Einkaufs-Kurzbefehl über die Zwischenablage. Was du selbst kopierst, landet so nie mehr auf dem Zettel.</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 8 · Beleg teilen</div><div class="group">${cp('siS',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&txt=')}</div><div class="mmcard">
     ${step(1,'Neuer Kurzbefehl „An CashFlow“ › ⓘ › „Im Share-Sheet anzeigen“','Eingabe: Bilder und Text.')}
     ${step(2,'„Text aus Bild extrahieren“','Aus Kurzbefehl-Eingabe. Liest Bon-Fotos und Screenshots direkt auf dem iPhone.')}
     ${step(3,'„Text“','Beleg: [Text aus Bild]')}
     ${step(4,'„Text URL-codieren“ › „Inhalte von URL abrufen“','In eine Aktion „Text“: Adresse oben, direkt dahinter „URL-codierter Text“. Hier dann nur die Variable „Text“ einsetzen.')}${siriMockHtml(SIRI_MOCK[7])}</div>
     <div class="note">Bon fotografieren oder Bestellbestätigung als Screenshot › Teilen › „An CashFlow“. CashFlow sucht Summe, Händler und Datum und legt dir die Buchung beim Öffnen zum Bestätigen vor. Braucht die Funktion „push“ ab v8 (Einstellungen › Supabase-Einrichtung).</div></div>
   <div class="sec"><div class="sh">Kurzbefehl 9 · Mail & SMS (Automation)</div><div class="group">${cp('siM',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&txt=')}</div><div class="mmcard">
     ${step(1,'Automation › + › „E-Mail“ oder „Nachricht“','Absender z. B. PayPal, Amazon oder deine Bank; bei SMS „Nachricht enthält €“. „Sofort ausführen“ an.')}
     ${step(2,'„Text“','Mitteilung: [Kurzbefehl-Eingabe › Betreff] [Kurzbefehl-Eingabe › Inhalt]')}
     ${step(3,'„Text URL-codieren“ › „Inhalte von URL abrufen“','In eine Aktion „Text“: Adresse oben, direkt dahinter „URL-codierter Text“. Hier dann nur die Variable „Text“ einsetzen.')}${siriMockHtml(SIRI_MOCK[8])}</div>
     <div class="note">Erfasst Online-Käufe, Lastschriften und Gutschriften, die nicht über Apple Pay laufen. Nichts wird ohne deine Bestätigung gebucht. Beim Kontoauszug-Import gleicht CashFlow diese Buchungen ab.</div></div>
   <div class="sec"><div class="sh">Kalender-Abo</div><div class="group">${cp('siC',u+'?op=siri&k='+encodeURIComponent(sk.k)+'&m=ics')}</div><div class="mmcard">
     ${step(1,'iPhone-Einstellungen › Apps › Kalender › Kalenderaccounts','„Account hinzufügen“ › „Andere“ › „Kalenderabo hinzufügen“.')}
     ${step(2,'Adresse oben einfügen','Abbuchungen ab 20 €, Einnahmen, geplante Buchungen, Kündigungsfristen und Wunsch-Wartezeiten der nächsten 60 Tage erscheinen als ganztägige Termine. Aktualisiert sich alle paar Stunden.')}</div>
     <div class="note">Beträge stehen nur drin, wenn unter Mitteilungen „Beträge in Mitteilungen“ an ist.</div></div>
   <div class="sec"><div class="sh">Testen</div><div class="group"><button class="cell plain" id="siTst" style="color:var(--blue)">Stand abrufen, wie Siri ihn vorliest</button><button class="cell plain" id="siPull" style="color:var(--blue)">Siri-Ablage jetzt abholen</button></div><div class="note" id="siOut"></div></div>`:''}
   <div class="note">Datenschutz: Gesprochene Sätze liegen bis zum nächsten Öffnen der App unverschlüsselt in deiner Supabase-Ablage und werden danach gelöscht. Der „Stand“ nutzt nur die Daten, die für dein Daily Briefing ohnehin dort liegen.</div>`}
function bindSiri(){if($('siGuide'))$('siGuide').onclick=openSiriGuide;if(!$('siGen'))return;
  $('siGen').onclick=async()=>{const b=$('siGen');b.disabled=true;b.textContent='Erzeuge …';try{await siriNewKey();render();toast('Neuer Siri-Schlüssel erzeugt. Im Kurzbefehl eintragen.')}catch(e){b.disabled=false;b.textContent='Schlüssel erzeugen';toast('Fehler: '+(e.message||e)+'. Ist die Funktion „push“ v4 eingespielt und das SQL für Mitteilungen ausgeführt?')}};
  document.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{const t=$(b.dataset.cp).textContent;try{navigator.clipboard.writeText(t).then(()=>toast('Kopiert.'))}catch(e){toast(t)}});
  if($('siTst'))$('siTst').onclick=async()=>{const o=$('siOut');o.textContent='Frage an …';try{const r=await fetch(siriFnUrl()+'?op=siri&k='+encodeURIComponent(siriGet().k)+'&m=stand');const tx=await r.text();o.textContent=r.ok&&!/^\s*\{/.test(tx)?tx:(r.status==401?'Schlüssel ungültig oder „Verify JWT“ ist an.':/^\s*\{/.test(tx)?'Funktion „push“ ist älter als v6 – bitte neu einspielen.':'Fehler '+r.status+': '+tx.slice(0,120))}catch(e){o.textContent='Nicht erreichbar: '+(e.message||e)}};
  if($('siPull'))$('siPull').onclick=()=>siriPull(true);
  document.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{const p=(S.siriPend||[]).find(x=>x.id==b.dataset.sp);if(!p)return;S.siriPend=S.siriPend.filter(x=>x.id!=p.id);save();if(voiceCmd(p.txt))return;openSheet();qp(p.txt);drawSheet()});
  document.querySelectorAll('[data-spx]').forEach(b=>b.onclick=()=>{S.siriPend=(S.siriPend||[]).filter(x=>x.id!=b.dataset.spx);save();render()})}

/* ---------- Briefing-Zustellung überwachen ---------- */
const PSTK='cf_pstat';const pstGet=()=>{try{return JSON.parse(localStorage.getItem(PSTK)||'null')}catch(e){return null}};
function pstSave(j){if(!j||j.key===undefined)return;try{localStorage.setItem(PSTK,JSON.stringify({at:Date.now(),v:j.v||0,cron:j.cron||null,sm:j.sm||null,se:j.se||null,subs:j.subs,day:j.now||today()}))}catch(e){}}
let pstBusy=false;async function pstCheck(force){if(pstBusy||!pushOn()||!syOn()||!navigator.onLine)return;const o=pstGet();if(!force&&o&&Date.now()-o.at<20*60000)return;pstBusy=true;try{pstSave(await pushCall('key'));DV++;renderAsst()}catch(e){}finally{pstBusy=false}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(()=>pstCheck(),2500)});setTimeout(()=>pstCheck(),4000);
function pstState(){const o=pstGet();if(!o||!pushOn())return null;const d=new Date(),min=d.getHours()*60+d.getMinutes(),we=d.getDay()==0||d.getDay()==6,tm=we?pTimes().mw:pTimes().mt,td=today(),O=S.pushOpt||{};
  const cronAge=o.cron?(Date.now()-Date.parse(o.cron))/60000:null,cronOk=o.v>=5&&cronAge!=null&&cronAge<25;
  const brief=(sent,t0,on)=>!on?{k:'off',t:'aus'}:sent==td?{k:'ok',t:'heute gesendet'}:min<t0?{k:'wait',t:'kommt um '+String(Math.floor(t0/60)).padStart(2,'0')+':'+String(t0%60).padStart(2,'0')}:min<t0+90?(min>=t0+20||!cronOk?{k:'late',t:'überfällig'}:{k:'wait',t:'wird gerade verschickt'}):{k:'miss',t:'heute ausgefallen'};
  const m=brief(o.sm,tm,O.bm!==false),e=brief(o.se,pTimes().et,O.be!==false);
  return{o,cronAge,cronOk,m,e,jwt:(SETUP.st||{}).pushjwt,fresh:Date.now()-o.at<30*60000}}
function pstHtml(){const s=pstState();if(!pushOn())return '';if(!s)return `<div class="group"><div class="cell plain"><span style="color:var(--muted)">Zustellung noch nicht geprüft.</span><span style="flex:1"></span><button class="ed-link" id="pstChk" style="color:var(--blue)">Prüfen</button></div></div>`;
  const col=k=>k=='ok'?'var(--ok)':k=='miss'||k=='late'?'var(--bad)':'var(--muted)',ago=m=>m<1?'gerade eben':m<60?'vor '+Math.round(m)+' Min.':'vor '+Math.round(m/60)+' Std.';
  const cronT=s.o.v<5?'Funktion „push“ ist älter als v5 – Zeitplan-Meldung fehlt noch':s.cronAge==null?'Zeitplan hat sich noch nie gemeldet':s.cronOk?'Zeitplan lief zuletzt '+ago(s.cronAge):'Zeitplan läuft nicht (letzter Lauf '+ago(s.cronAge)+')';
  const why=s.jwt=='on'?'Bei der Funktion „push“ ist „Verify JWT“ eingeschaltet – der Zeitplan wird abgewiesen. In Supabase › Edge Functions › push › Details ausschalten.':s.o.subs===0?'Für dein Konto ist kein Gerät für Mitteilungen registriert. Mitteilungen einmal aus- und wieder einschalten.':(!s.cronOk&&s.o.v>=5)?'Prüfe in Supabase: Gibt es die Funktion genau mit dem Namen „push“? Ist „Verify JWT“ aus? Wurde das SQL „Tabellen & Zeitplan“ ausgeführt?':'';
  return `<div class="group"><div class="cell plain"><span style="color:${s.cronOk?'var(--ok)':'var(--bad)'}">●</span><div class="t" style="flex:1"><div>${cronT}</div><div class="s">Geprüft ${ago((Date.now()-s.o.at)/60000)}</div></div><button class="ed-link" id="pstChk" style="color:var(--blue)">Prüfen</button></div>
   <div class="cell plain"><span style="color:${col(s.m.k)}">●</span><div class="t" style="flex:1">Morgen-Briefing · ${s.m.t}</div>${s.m.k=='miss'||s.m.k=='late'?'<button class="ed-link" id="pstM" style="color:var(--blue)">Jetzt senden</button>':''}</div>
   <div class="cell plain"><span style="color:${col(s.e.k)}">●</span><div class="t" style="flex:1">Abend-Briefing · ${s.e.t}</div>${s.e.k=='miss'||s.e.k=='late'?'<button class="ed-link" id="pstE" style="color:var(--blue)">Jetzt senden</button>':''}</div>
   ${why?`<div class="cell plain"><div class="s" style="color:var(--bad);font-size:12.5px;line-height:1.45">${why}</div></div>`:''}</div>`}
function bindPst(){if($('pstChk'))$('pstChk').onclick=async()=>{$('pstChk').textContent='…';await pstCheck(true);try{const r2=await fetch(SY.url.replace(/\/$/,'')+'/functions/v1/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({op:'ping'})});SETUP.st=Object.assign(SETUP.st||{},{pushjwt:r2.status==401?'on':r2.ok?'off':'?'});localStorage.setItem('cf_setup',JSON.stringify(SETUP.st))}catch(e){}render()};
  [['pstM','m'],['pstE','e']].forEach(([id,k])=>{if($(id))$(id).onclick=async()=>{$(id).textContent='Sende …';try{await briefSend(true);const j=await pushCall('brieftest',{kind:k,data:briefData(),real:true});toast(j.sent?(k=='e'?'Abend':'Morgen')+'-Briefing gesendet.':'Kein Gerät erreicht. Mitteilungen einmal aus- und einschalten.');await pstCheck(true);render()}catch(e){toast('Fehler: '+(e.message||e))}}})}

/* ---------- Tipp auf eine Mitteilung ---------- */
function briefCard(t,b){const L=String(b||'').split('\n').map(x=>x.trim()).filter(Boolean);const ic=l=>/^Depot|Woche:/.test(l)?'chart':/Vermögen/.test(l)?'lock':/ausgegeben|Ausgaben/.test(l)?'cart':/^(Heute|Morgen|Mo|Di|Mi|Do|Fr|Sa|So|\d)/.test(l)?'calendar':'wallet';
  return `<div class="brf"><div class="brf-h">${esc(t||'Briefing')}</div>${L.map(l=>`<div class="brf-l"><span class="brf-i">${I(ic(l),14)}</span><span>${esc(l)}</span></div>`).join('')}</div>`}
/* Inhalt aus Benachrichtigungen erst nach dem Entsperren anzeigen */
let visSince=0;document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')visSince=Date.now()});
let notifPend=null;function notifFlush(){const n=notifPend;notifPend=null;if(n)setTimeout(()=>notifOpen(n),60)}
function notifOpen(n){if(!n)return;if(pinActive()&&$('lockRoot').innerHTML){notifPend=n;return}const tag=String(n.tag||'');$('sheetRoot').innerHTML='';setView=null;posView=null;
  if(/^brief/.test(tag)){AQ.msgs.push({q:'',h:briefCard(n.title,n.body),a:[['Buchungen von heute',()=>{tab='list';render()}],['Depot ansehen',()=>{tab='rep';repV='Vermögen';render()}],['Kalender',()=>{tab='cal';render()}]]});tab='dash';render();ASH='half';asstOpen=true;asstNew=[];renderAsst();setTimeout(()=>{const s=document.querySelector('#asstRoot .apop-b'),c=[...document.querySelectorAll('#asstRoot .brf')].pop();if(s&&c)s.scrollTop=c.getBoundingClientRect().top-s.getBoundingClientRect().top+s.scrollTop-8},80);return}
  const id=tag.replace(/^[a-z]+-/,'');
  if(/^due-/.test(tag)){const i=(S.rec||[]).findIndex(r=>r.id==id);tab='more';setView='rec';render();if(i>=0)setTimeout(()=>openRec(i),200);return}
  if(/^ctr-/.test(tag)){const i=(S.contracts||[]).findIndex(c=>c.id==id);tab='rep';repV='Verträge';render();if(i>=0)setTimeout(()=>openContract(i),200);return}
  if(/^wish-/.test(tag)){tab='wish';wishV='Wünsche';render();const i=(S.wish||[]).findIndex(w=>w.id==id);if(i>=0)setTimeout(()=>openKaufCheck(i),200);return}
  if(/^rg-/.test(tag)){const e=S.exp.find(x=>x.id==id);tab='list';render();if(e)setTimeout(()=>openSheet(e),200);return}
  if(tag=='chk'){tab='dash';render();setTimeout(()=>openCheckin(),200);return}
  if(tag=='pay'||tag=='stale'){tab='dash';render();setTimeout(()=>siriPull(true),200);return}
  if(/^sal-/.test(tag)&&salP().rows.length){tab='dash';render();setTimeout(()=>salGo(),250);return}
  if(/^(sal|close)-/.test(tag)){tab='more';setView='close';render();return}
  if(/^b80-/.test(tag)){const b=tag.split('-')[1];tab='dash';setView=null;curB=BUDG.includes(b)?b:null;render();setTimeout(()=>asstAsk('Was darf ich heute noch ausgeben?'),250);return}
  if(/^abo-/.test(tag)){tab='more';setView='abos';render();return}
  if(/^sub-/.test(tag)){tab='dash';render();setTimeout(()=>{asstOpen=true;renderAsst()},200);return}
  if(/^goal-/.test(tag)){tab='wish';render();return}
  if(tag=='urge'){tab='wish';render();setTimeout(()=>openUrge(),200);return}
  tab='dash';render();asstOpen=true;renderAsst()}
try{navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.cfNotif){const n=e.data.cfNotif;setTimeout(()=>{if(Date.now()-visSince<3000)lock();notifOpen(n)},450)}})}catch(e){}
setTimeout(()=>{try{const q=new URLSearchParams(location.search),n=q.get('n');if(!n)return;history.replaceState(history.state,'',location.pathname);notifOpen(JSON.parse(n))}catch(e){}},1000);
/* ---------- summary for Claude ---------- */
/* Übersicht und Rückblick direkt mit Penny besprechen */
function pennyTalk(kind){const ai=!!aiCfg().on,sr=(a,b,c)=>`<div class="srow"><div class="srow-h"><span>${esc(a)}</span><span></span><b>${b}</b></div>${c?`<div class="a-s" style="font-size:12px">${c}</div>`:''}</div>`;let q,h,f,ctx=null;
  if(kind=='rev'){const off=S.revOff??-1,R=reviewData(off),A=anaData(off),note=(($('rvG')||{}).value||'').trim();q='Rückblick '+R.p.label+' besprechen';
    h=`<p><b>Rückblick ${esc(R.p.label)}</b></p>`+R.bs.map(x=>sr(x.b,eur(x.c.used)+' von '+eur(x.c.total),x.c.rest>=0?'übrig '+eur(x.c.rest):'überzogen '+eur(-x.c.rest))).join('')
     +(R.good.length?`<p class="a-s">Gut: ${esc(R.good.join('; '))}</p>`:'')+(R.bad.length?`<p class="a-s">Nicht so gut: ${esc(R.bad.join('; '))}</p>`:'')
     +`<p class="a-s">Einnahmen ${eur(A.I1)} · Ausgaben ${eur(A.O1)} · Vermögen ${eur(A.saved)} (${Math.round(A.quote*100)} %)${R.top.length?' · Größte Posten: '+R.top.slice(0,3).map(([c,v])=>esc(c)+' '+eur(v)).join(', '):''}</p>`;
    ctx=`Monatsrückblick ${R.p.label}: `+R.bs.map(x=>`${x.b} ${eur(x.c.used)} von ${eur(x.c.total)}`).join('; ')+`. Gut: ${R.good.join('; ')||'–'}. Nicht so gut: ${R.bad.join('; ')||'–'}. Größte Posten: ${R.top.map(([c,v])=>c+' '+eur(v)).join(', ')}. Einnahmen ${eur(A.I1)}, Ausgaben ${eur(A.O1)}, Vermögen ${eur(A.saved)}, Fixkosten ${eur(A.fix)}.${note?' Notiz: '+note:''}`;
    f=ai?['KI-Rückblick','Was sollte ich nächsten Monat anders machen?','Vergleich zum Vormonat']:['Vergleich zum Vormonat','Monatsbilanz','Was kommt demnächst?']}
  else{const P=period(0),top=S.exp.filter(e=>e.type=='out'&&!isPlan(e)&&!e.corr&&inP(e,P)).sort((a,b)=>b.a-a.a).slice(0,3);q='Monat besprechen';
    h=`<p><b>${esc(P.label)} · noch ${P.left} Tage</b></p>`+BUDG.map(b=>{const c=calc(b);return sr(b,eur(c.rest)+' übrig',`von ${eur(c.total)} · ${eur(c.tag)} pro Tag`)}).join('')
     +(top.length?`<p class="a-s" style="margin-top:6px">Größte Ausgaben</p><div class="alist">${top.map(aRow).join('')}</div>`:'');
    f=ai?['Reicht es bis Monatsende?','Wo kann ich sparen?','Was ist auffällig?']:['Reicht es bis Monatsende?','Was kommt demnächst?','Vergleich zum Vormonat']}
  AQ.msgs=[{q,h,f}];AQ.id=0;AQ.ctx=ctx;asstHist=false;asstTips=false;try{AI.conv=[]}catch(e){}asstOpen=true;ASH='full';renderAsst();aiScroll()}


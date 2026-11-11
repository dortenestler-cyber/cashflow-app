/* ---------- state ---------- */
function sample(){const ex=[],P0=period(0,1);
  const at=(off,dd,h)=>{const p=period(off,1);return Math.min(new Date(p.s.getFullYear(),p.s.getMonth(),dd,h||12).getTime(),Date.now())};
  const add=(off,b,c,a,n,dd,h,type,extra)=>ex.push(Object.assign({id:uid(),type:type||'out',b,c,a,n,t:at(off,dd,h)},extra||{}));
  add(0,"Flow","Lebensmittel",54.2,"Edeka",1,10);add(0,"Flow","Drogerie",23.9,"DM",1,17);add(0,"Flow","Lebensmittel",32.2,"Rewe",2,18);
  add(0,"Flow","Mobilität",9.8,"VAG Tagesticket",3,8);add(0,"Gönn dir","Restaurant",42,"Italiener",1,20,'out',{p:"Anna"});
  add(0,"Gönn dir","Freizeit",65,"Konzertticket",2,12);add(0,"Gönn dir","Café",7.4,"Flat White",3,9);
  add(0,"Gönn dir","Freizeit",29.9,"Fitnessstudio",1,7,'out',{rid:'r1',pk:pkey(P0)});
  add(0,"Flow","Drogerie",6.5,"Rückgabe DM",2,15,'in');
  let sd=11;const rnd=(lo,hi)=>lo+((sd=(sd*9301+49297)%233280)/233280)*(hi-lo);
  for(let o=-1;o>=-11;o--){const L=period(o,1).len;
    for(let w=0;w<4;w++){add(o,"Flow","Lebensmittel",+rnd(48,78).toFixed(2),["Rewe","Edeka","Aldi","Lidl"][w],Math.floor(rnd(1,7))+w*7,17)}
    for(let k=0;k<2;k++)add(o,"Flow","Drogerie",+rnd(14,32).toFixed(2),"DM",Math.floor(rnd(1,L)),16);
    for(let k=0;k<3;k++)add(o,"Flow","Mobilität",9.8,"VAG Tagesticket",Math.floor(rnd(1,L)),8);
    if(o%2==0)add(o,"Flow","Friseur",48,"Friseur",Math.floor(rnd(5,25)),14);
    if(rnd(0,1)>.5)add(o,"Flow","Gesundheit",+rnd(8,25).toFixed(2),"Apotheke",Math.floor(rnd(1,L)),11);
    add(o,"Gönn dir","Freizeit",29.9,"Fitnessstudio",1,7);
    for(let k=0;k<Math.round(rnd(1,3.4));k++)add(o,"Gönn dir","Restaurant",+rnd(22,48).toFixed(2),"Essen gehen",Math.floor(rnd(1,L)),20,'out',rnd(0,1)>.5?{p:"Anna"}:null);
    for(let k=0;k<5;k++)add(o,"Gönn dir","Café",+rnd(3.5,7).toFixed(2),"Café",Math.floor(rnd(1,L)),10);
    add(o,"Gönn dir","Freizeit",+rnd(15,60).toFixed(2),"Kino & Co.",Math.floor(rnd(1,L)),19);
    if(rnd(0,1)>.35)add(o,"Gönn dir","Shopping",+rnd(20,85).toFixed(2),"Shopping",Math.floor(rnd(1,L)),15);
    if(rnd(0,1)>.6)add(o,"Gönn dir","Geschenke",+rnd(15,40).toFixed(2),"Geschenk",Math.floor(rnd(1,L)),13);
    if(o==-4)add(o,"Sinking Funds","Technik",120,"Neues Handycase & Ladegerät",12,12);
    if(o==-8)add(o,"Sinking Funds","Reise",240,"Wochenende Leipzig",20,9);}
  return ex.filter(e=>e.a>0)}
const DEF=()=>({ex:true,v5:true,start:1,budgets:{"Flow":400,"Gönn dir":300,"Sinking Funds":100},cats:structuredClone(DEFCATS),
  rec:[{id:'r1',type:'out',b:"Gönn dir",c:"Freizeit",a:29.9,n:"Fitnessstudio",day:1},{id:'r2',type:'out',b:"Flow",c:"Gesundheit",a:12.99,n:"Apotheke Vitamine",day:15}],
  fav:[{b:"Flow",c:"Lebensmittel",n:"Rewe"},{b:"Flow",c:"Drogerie",n:"DM"},{b:"Gönn dir",c:"Café",n:"Kaffee",a:4.2}],
  wish:[{n:"Kopfhörer",p:249,l:"",w:"Alte sind kaputt",g:"gestresst",t:Date.now()-3*864e5,s:"offen"},{n:"Sneaker",p:89,l:"",w:"Sale",g:"gelangweilt",t:Date.now()-3*864e5,s:"offen"}],
  puffer:650,gespart:0,lohn:19.4,pin:"",exp:[],goals:null});
let S,RAW0=null;try{RAW0=localStorage.getItem('dodo4');S=JSON.parse(RAW0)}catch(e){}
/* v233: Sicherung vor jeder Datenmigration. Der Rohstand wird vor allen Umbauten gelesen und in IndexedDB abgelegt (mehr Platz als localStorage). */
const SCHEMA=233;
function bakDB(){return new Promise((res,rej)=>{try{const r=indexedDB.open('cf-bak',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
function preBakPut(raw,from){return bakDB().then(db=>new Promise(res=>{const tx=db.transaction('s','readwrite');tx.objectStore('s').put({t:Date.now(),from:from||0,to:SCHEMA,data:raw},'pre');tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)})).catch(()=>false)}
/* v256: Ursprung vor dem Umbau – einmalig gesichert, wird nie automatisch überschrieben */
function baseBakGet(){return bakDB().then(db=>new Promise(res=>{const q=db.transaction('s').objectStore('s').get('base');q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})).catch(()=>null)}
function baseBakEnsure(raw){if(!raw)return;baseBakGet().then(b=>{if(b)return;bakDB().then(db=>{db.transaction('s','readwrite').objectStore('s').put({t:Date.now(),ver:'255',data:raw},'base')}).catch(()=>{})})}
function preBakGet(){return bakDB().then(db=>new Promise(res=>{const q=db.transaction('s').objectStore('s').get('pre');q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})).catch(()=>null)}
if(S&&RAW0)baseBakEnsure(RAW0);if(S&&RAW0&&(S.schema||0)<SCHEMA){preBakPut(RAW0,S.schema||0);S.schema=SCHEMA;try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){}}
if(S&&(S.fut||S.futPlan||S.futOff1||(S.featO&&'fut' in S.featO))){delete S.fut;delete S.futPlan;delete S.futOff1;if(S.featO)delete S.featO.fut;try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){}} /* v231: Future-Reiter entfernt, Altdaten aufgeräumt */
if(S&&S.exp&&S.exp.some(e=>e.sh&&e.sh.by!='me'&&e.a)){S.exp.forEach(e=>{if(e.sh&&e.sh.by!='me')e.a=0});try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){}} /* v229: Zahlungen anderer belasten kein eigenes Konto */
function period(off,start){const P=start||S.start;let s=new Date(now.getFullYear(),now.getMonth(),P);if(now.getDate()<P)s=new Date(now.getFullYear(),now.getMonth()-1,P);
  s=new Date(s.getFullYear(),s.getMonth()+off,P);const e=new Date(s.getFullYear(),s.getMonth()+1,P);
  const len=Math.round((e-s)/864e5),idx=off==0?Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate())-s)/864e5)+1:off<0?len:0;
  const label=P==1?s.toLocaleDateString('de-DE',{month:'long',year:'numeric'}):s.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' – '+new Date(e-864e5).toLocaleDateString('de-DE',{day:'numeric',month:'short'});
  return{s,e,len,idx,left:Math.max(len-idx+1,0),label}}
const pkey=p=>p.s.toISOString().slice(0,10);
if(!S){S=DEF();S.exp=sample()}
if(S.ex&&!S.v5){S.exp=sample();S.v5=true}
ensureAccts();
ALL.forEach(b=>(S.cats[b]||[]).forEach(c=>{if(!IC[c[1]])c[1]=EMO[c[1]]||'dot'}));
if(!S.goals){S.goals=[];if(S.ex){const D=864e5;
  S.goals.push({id:uid(),n:"Reisekoffer",ziel:160,t:Date.now()-24*D,from:"Wunsch",g:"Belohnung",w:"Für den Sommerurlaub",dep:[{a:50,t:Date.now()-20*D},{a:40,t:Date.now()-2*D}]});
  S.wish.push({n:"Reisekoffer",p:160,l:"",w:"Für den Sommerurlaub",g:"Belohnung",t:Date.now()-31*D,s:"Sparziel",dt:Date.now()-24*D},
    {n:"Dritte Winterjacke",p:139,l:"",w:"Influencer-Video",g:"gelangweilt",t:Date.now()-40*D,s:"verworfen",dt:Date.now()-33*D},
    {n:"Duftkerzen-Set",p:34.9,l:"",w:"Schlechter Tag",g:"traurig",t:Date.now()-18*D,s:"verworfen",dt:Date.now()-16*D},
    {n:"Laufschuhe",p:95,l:"",w:"Alte sind durch",g:"neutral",t:Date.now()-14*D,s:"gekauft",dt:Date.now()-12*D});
  S.gespart=(S.gespart||0)+139+34.9}}
function ensureFlags(){if(!S.lila){const C={'Flow':'#4F6BED','Gönn dir':'#F0657A','Sinking Funds':'#22A699','Comdirect':'#5C6B8A','Vermögensaufbau':'#1F9D6B','ETFs':'#D4A23A','ETF':'#D4A23A'},G={'Gesamt':0,'Flow':2,'Gönn dir':3,'Sinking Funds':4,'Comdirect':10,'Vermögensaufbau':5,'ETFs':6,'ETF':6};
  S.accts.forEach(a=>{if(C[a.n])a.col=C[a.n]});S.bg=S.bg||{};Object.keys(S.bg).forEach(k=>{if(!S.bg[k].img)delete S.bg[k]});Object.entries(G).forEach(([k,g])=>{if(!(S.bg[k]&&S.bg[k].img))S.bg[k]={g}});S.lila=true;setTimeout(()=>{try{save()}catch(e){}},0)}
  if(!S.flags3)S.accts.forEach(a=>{if((a.n=='Flow'||a.n=='Gönn dir')&&a.roll==null)a.roll=true;if(a.n=='Sinking Funds'&&a.carry==null)a.carry=true;if(a.n=='Gönn dir'&&a.lock==null)a.lock=true;if((a.verm||a.n=='Vermögensaufbau')&&a.tabu==null)a.tabu=true});
  if(!S.flags3&&!S.accts.some(a=>a.puffer)){const c=S.accts.find(a=>a.n=='Comdirect');if(c)c.puffer=true}
  migFlags(S);
  if(!S.since)S.since=period(0).s.getTime();S.closed=S.closed||[];if(S.rollTo===undefined)S.rollTo=ALL.includes('Sinking Funds')?'Sinking Funds':null;S.checkins=S.checkins||[]}
function ensureAccts(){if(S.accts){refreshA();ensureFlags();return}
  S.accts=[{n:"Flow",kind:'budget',col:'#4F6BED',vis:true,tot:true},{n:"Gönn dir",kind:'budget',col:'#F0657A',vis:true,tot:true},{n:"Sinking Funds",kind:'budget',col:'#22A699',vis:true,tot:true},
    {n:"Comdirect",kind:'konto',col:'#5C6B8A',vis:true,tot:false,start:S.ex?412:0}];
  S.cats=S.cats||{};S.cats["Comdirect"]=[["Gehalt","bolt"],["Fixkosten","home"],["Versicherung","lifebuoy"],["Abos","repeat"],["Budgets & Sparen","target"],["Sonstiges","dot"]];
  S.budgets=S.budgets||{};if(S.bg&&!S.bg.Comdirect)S.bg.Comdirect={g:8};
  if(S.ex){const p=period(0),t=(d,h)=>Math.min(new Date(p.s.getFullYear(),p.s.getMonth(),d,h).getTime(),Date.now());
    S.exp.push({id:uid(),type:'in',b:'Comdirect',c:'Gehalt',a:3200,n:'Gehalt',t:t(1,7)},{id:uid(),type:'out',b:'Comdirect',c:'Fixkosten',a:1180,n:'Miete & Nebenkosten',t:t(1,8)},
      {id:uid(),type:'out',b:'Comdirect',c:'Budgets & Sparen',a:1075,n:'Monatsverteilung auf Konten',t:t(1,9)},{id:uid(),type:'out',b:'Comdirect',c:'Abos',a:47.97,n:'Handy, Streaming, Cloud',t:t(2,10)},
      {id:uid(),type:'out',b:'Comdirect',c:'Versicherung',a:96.4,n:'Haftpflicht & Hausrat',t:t(3,9)})}
  refreshA();ensureFlags()}
let saveWarn=0,DV=0;const save=()=>{DV++;try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){if(Date.now()-saveWarn>6e4){saveWarn=Date.now();setTimeout(()=>{try{toast('Speicher voll: Änderungen konnten auf diesem Gerät nicht gesichert werden. Belegfotos entfernen oder Online-Sync nutzen.')}catch(_){}},0)}}try{syDirty()}catch(e){}try{pushSoon()}catch(e){}};

/* recurring entries become real bookings once due */
function recDue(r,p){const dim=(y,m)=>new Date(y,m+1,0).getDate(),mk=(y,m)=>new Date(y,m,Math.min(r.day,dim(y,m)),12);let d=mk(p.s.getFullYear(),p.s.getMonth());if(d<p.s){const n=new Date(p.s.getFullYear(),p.s.getMonth()+1,1);d=mk(n.getFullYear(),n.getMonth())}
  if(d>=p.e)return null;if(r.start){const s=new Date(r.start+'T00:00');if(d<s)return null;const md=(d.getFullYear()-s.getFullYear())*12+d.getMonth()-s.getMonth();if((r.every||1)>1&&md%(r.every)!==0)return null}
  if(r.end&&d>new Date(r.end+'T23:59'))return null;return d}
const budFor=(b,p)=>{if(S.sink3&&b==sinkAcc()&&p.s.getTime()>=S.sink3){/* v253: Zufluss vergangener Monate bleibt eingefroren, damit der Bestand sich nicht rückwirkend ändert */const k=pkey(p),past=p.e.getTime()<Date.now();if(past&&S.sinkIn&&S.sinkIn[k]!=null)return S.sinkIn[k];const v=sinkSum()+(+S.sinkExtra||0);if(!past&&p.s.getTime()<=Date.now())(S.sinkIn||(S.sinkIn={}))[k]=v;return v}const k=pkey(p),o=(S.monthOv||{})[k];if(o&&o.b&&o.b[b]!=null)return o.b[b];const pn=S.planNext;if(pn&&pn.b&&pn.b[b]!=null&&k>=pn.pk)return pn.b[b];return S.budgets[b]||0};
const monS=p=>p.s.toLocaleDateString('de-DE',{month:'short'}).replace('.','');
/* Eine Quelle für den Betrag einer wiederkehrenden Buchung in einem Monat: normal · Monats-Ausnahme · Vormerkung · neuer Betrag */
function recView(r,p){const k=pkey(p),o=(S.monthOv||{})[k],base=r.a;let a=r.a,kind=null,lab='',src=null;
  if(o&&o.r&&o.r[r.id]!=null){a=o.r[r.id];kind='once';lab='nur '+monS(p)}
  else{const pn=S.planNext;if(pn&&k>=pn.pk){let v=pn.r&&pn.r[r.id]!=null?pn.r[r.id]:null;src='r';if(v==null&&pn.b){const pa=pufAcc();Object.entries(pn.b).forEach(([b,x])=>{if(r.type=='tr'&&pa&&r.b==pa.n&&r.to==b&&(r.every||1)==1){v=x;src='b:'+b}})}if(v!=null){a=v;kind='next';lab='ab '+String(pn.label||'').split(' ')[0]}}}
  if(!kind&&r.hist&&r.hist.length>1){const L=r.hist[r.hist.length-1],pv=r.hist[r.hist.length-2];if(L.ab&&pv.a!==L.a&&L.ab>=ymd(p.s.getTime())&&L.ab<ymd(p.e.getTime()))return{a,base:pv.a,d:a-pv.a,kind:'new',lab:'neu seit '+new Date(L.ab+'T12:00').toLocaleDateString('de-DE',{day:'numeric',month:'numeric'})+'.'}}
  if(!kind||Math.abs(a-base)<.005)return{a,base,d:0,kind:null};return{a,base,d:a-base,kind,lab,pk:k,src}}
const recA=(r,p)=>recView(r,p).a,adjOf=(r,p)=>{const v=recView(r,p);return v.kind?v:null};
const eurS=v=>Math.abs(v%1)<.005?eur0(v):eur(v);
const adjTag=e=>{const v=e&&e.adj;return v?`<span class="adjb">${I('pen',10)} angepasst · ${esc(v.lab||'')} · ${v.d>0?'+':'−'}${eurS(Math.abs(v.d))} (statt ${eurS(v.base)})</span>`:''};
function recAdjNext(r){for(let o=0;o<=12;o++){const p=period(o);if(!recDue(r,p))continue;const v=recView(r,p);if(v.kind&&v.kind!='new')return 'angepasst · '+monS(p)+': '+eurS(v.a)+' (sonst '+eurS(v.base)+')'}return ''}
const periodAt=t=>{for(let k=-36;k<=24;k++){const p=period(k);if(t>=p.s.getTime()&&t<p.e.getTime())return p}return period(0)};
function adjReset(rid,v){if(!v)return;const r=(S.rec||[]).find(x=>x.id==rid);const snap=JSON.stringify({ov:S.monthOv||{},pn:S.planNext||null});
  if(v.kind=='once'){const o=(S.monthOv||{})[v.pk];if(o){if(o.r)delete o.r[rid];const pa=pufAcc();if(r&&o.b&&pa&&r.b==pa.n&&o.b[r.to]!=null)delete o.b[r.to];if(!Object.keys(o.r||{}).length&&!Object.keys(o.b||{}).length)delete S.monthOv[v.pk]}}
  else if(v.kind=='next'&&S.planNext){const pn=S.planNext;if(v.src&&v.src.startsWith('b:'))delete (pn.b||{})[v.src.slice(2)];else delete (pn.r||{})[rid];if(!Object.keys(pn.r||{}).length&&!Object.keys(pn.b||{}).length)delete S.planNext}
  save();render();tell('Anpassung entfernt – es gilt wieder '+eur(v.base)+'.',()=>{const o=JSON.parse(snap);S.monthOv=o.ov;if(o.pn)S.planNext=o.pn;else delete S.planNext;save();render()})}
function applyRec(){const p=period(0),k=pkey(p);S.rec.forEach(r=>{if(r.paused)return;const d=recDue(r,p);
  if(d&&d<=now&&!S.exp.some(e=>e.rid==r.id&&e.pk==k)){const v=recView(r,p),x={id:uid(),type:r.type,b:r.b,to:r.to,alloc:r.alloc,c:r.c,a:v.a,n:r.n,t:d.getTime()+12*36e5>Date.now()?Date.now():d.getTime()+12*36e5,rid:r.id,pk:k};if(v.kind)x.adj=v;S.exp.push(x)}});save()}
applyRec();

/* month close: leftovers of roll-accounts move to the roll target on the last minute of the month */
function closeMonths(){if(!S.rollTo||!ALL.includes(S.rollTo))return;const done=[];
  for(let o=-1;o>-25;o--){const p=period(o);if(p.s.getTime()<S.since)break;const k=pkey(p);if(S.closed.includes(k))continue;
    /* v236: Restgeld wird nicht mehr automatisch umgebucht, sondern im Monatsabschluss vorgeschlagen */
    const it=[];S.accts.filter(a=>isRoll(a)&&a.kind=='budget'&&a.n!=S.rollTo&&!isStock(a.n)).forEach(a=>{const c=calc(a.n,o);if(c.rest>0.004)it.push([a.n,Math.round(c.rest*100)/100])});
    if(it.length){S.restProp=(S.restProp||[]).filter(x=>x.pk!=k);S.restProp.push({pk:k,t:p.e.getTime()-60000,label:p.label,to:S.rollTo,items:it});done.push(k)}S.closed.push(k)}
  save()}
function restPropDo(i,take){const x=(S.restProp||[])[i];if(!x)return;if(take){const sn=snap();x.items.forEach(([b,v])=>{if(ALL.includes(b)&&ALL.includes(x.to))S.exp.push({id:uid(),type:'tr',b,to:x.to,c:'',a:v,n:'Monatsabschluss',t:x.t,roll:true,closeOf:x.pk})});
  S.restProp.splice(i,1);save();render();tell(eur(x.items.reduce((s,y)=>s+y[1],0))+' nach '+(SHORT[x.to]||x.to)+' umgebucht.',()=>{restore(sn);render()})}else{S.restProp.splice(i,1);save();render();tell('Vorschlag verworfen. Das Restgeld bleibt, wo es ist.')}}
const pufAcc=()=>S.accts.find(a=>a.rolle=='eingang');
function pufOpen(){const a=pufAcc();if(!a)return{list:[],sum:0};const P=period(0),k=pkey(P),L=[];
  (S.rec||[]).forEach(r=>{if(r.paused||r.b!=a.n||r.type=='in')return;const d=recDue(r,P);if(!d)return;if(S.exp.some(e=>e.rid==r.id&&e.pk==k))return;L.push({n:r.n,a:r.a,d})});
  S.exp.forEach(e=>{if(e.b==a.n&&isPlan(e)&&inP(e,P)&&(e.type=='out'||e.type=='tr')&&!L.some(x=>x.n==e.n&&Math.abs(x.a-e.a)<.01))L.push({n:e.n||e.c,a:e.a,d:new Date(e.t)})});
  L.sort((x,y)=>x.d-y.d);return{list:L,sum:L.reduce((s,x)=>s+x.a,0)}}
const pufBal=()=>{const a=pufAcc();return a?calc(a.n).rest:(S.puffer||0)};
/* v258: Puffer-Ziel einstellbar, Standard 1.000 € */
const pufZiel=()=>(+S.pufZiel>0?+S.pufZiel:1000);
const pufVal=()=>pufAcc()?pufBal()-pufOpen().sum:(S.puffer||0);
function vermAcc(){let a=S.vermZiel&&S.accts.find(x=>x.n==S.vermZiel);if(!a){a=S.accts.find(x=>x.n=='Vermögensaufbau');if(!a){a={n:'Vermögensaufbau',kind:'konto',col:'#2fb36b',vis:false,tot:false,start:0};S.accts.push(a);S.cats[a.n]=[["Sparen","target"],["Sonstiges","dot"]];S.bg=S.bg||{};S.bg[a.n]={g:5}}S.vermZiel=a.n;a.rolle='vermoegen';a.sperre={art:'tabu'};refreshA();save()}return a.n}
function streak(){const bs=TOTM;if(!bs.length)return 0;let n=0;
  for(let i=1;i<=90;i++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i),t=d.getTime();if(t<S.since&&!S.ex)break;
    let o=0;while(!inP({t},period(o))&&o>-30)o--;const p=period(o),lim=budOf(bs)/p.len,ds=d.toDateString();
    const sp=S.exp.filter(e=>new Date(e.t).toDateString()==ds&&e.type=='out'&&bs.includes(e.b)).reduce((s,e)=>s+e.a,0);if(sp<=lim)n++;else break}return n}
const cats=b=>S.sink3&&b==sinkAcc()?[['Sparziel','target'],['Sonstiges','dot']]:S.cats[b]||[];
const icoOf=(b,c)=>{const ok=x=>x&&x[0]==c&&x[1]&&x[1]!='dot';let k=((cats(b)||[]).find(ok)||(S.cats[b]||[]).find(ok)||[])[1];if(!k)for(const L of Object.values(S.cats||{})){const x=(L||[]).find(ok);if(x){k=x[1];break}}if(!k&&c&&typeof iconFor=='function')k=iconFor(c);return I(k||'dot')};
const std=p=>{const x=p/S.lohn;return x<1?Math.round(x*60)+' Min. Arbeit':x.toLocaleString('de-DE',{maximumFractionDigits:1})+' Std. Arbeit'};
const WAITD=14,wait=p=>WAITD*864e5;
const ANCHOR='Mein Geld hat bereits einen Job. Mein Gönn-dir-Budget ist mein bewusstes, erlaubtes Limit. Ist es leer, ist es leer.';
const KONSUM=['Restaurant','Café','Freizeit','Shopping','Beauty','Hobby','Geschenke','Restaurant/Café','Barbesuch','Veranstaltungen','Ausflüge','Klettergear','Sportkleidung','Schmuck','Accessoires','Taschen','Elektronik','Wellness','Essen bestellen','Kleidung','Schuhe'];
/* v235: Konto-Flags von sieben auf drei – sichtbar (vis), im Gesamt (tot), gesperrt (sperre:{art:'tabu'|'bremse',bis?,frei?}).
   Rolle (eingang | vermoegen) und Restgeld-Regel (rest: umbuchen | bleibt) sind eigene Felder. Umwandlung je Konto, wiederholbar (auch für Sync-Daten). */
function migAcct(a,S0){const OLDF=['tabu','untabu','lock','vault','verm','puffer','roll','carry'];if(!OLDF.some(k=>k in a))return false;const vh=a.vault!=null?!!a.vault:!!(a.verm||a.tabu||/etf/i.test(a.n||''));
  if(a.tabu)a.sperre=Object.assign({art:'tabu'},a.untabu?{frei:a.untabu}:{});else if(a.lock)a.sperre={art:'bremse'};else if('tabu' in a||'lock' in a)delete a.sperre;
  if(a.puffer)a.rolle='eingang';else if(vh)a.rolle='vermoegen';else if('puffer' in a||'vault' in a||'verm' in a||'tabu' in a)delete a.rolle;
  if(a.verm)S0.vermZiel=a.n;if(a.roll)a.rest='umbuchen';else if(a.carry)a.rest='bleibt';else if('roll' in a||'carry' in a)delete a.rest;
  OLDF.forEach(k=>delete a[k]);return true}
/* v258: Kontostufe (eingang | ausgeben | sparen | vermoegen) und Konsum-Topf als eigene Felder – Funktionen hängen nicht mehr am Namen. Ergänzend, alte Felder bleiben. */
function stufeOf(a){if(!a)return '';if(a.stufe)return a.stufe;if(a.rolle=='eingang')return 'eingang';if(a.rolle=='vermoegen')return 'vermoegen';return a.kind=='budget'?(/sinking/i.test(a.n||'')?'sparen':'ausgeben'):''}
function migStufe(S0){if(!S0||!S0.accts||S0.stufen1)return false;S0.accts.forEach(a=>{if(!a.stufe){const s=stufeOf(a);if(s)a.stufe=s}if(a.kind=='budget'&&/g[öo]nn/i.test(a.n||'')&&!S0.accts.some(x=>x.konsum))a.konsum=true});S0.stufen1=true;return true}
function migFlags(S0){if(!S0||!S0.accts)return;let ch=false;S0.accts.forEach(a=>{if(migAcct(a,S0))ch=true});if(migStufe(S0))ch=true;if(!S0.vermZiel){const v=S0.accts.find(x=>x.n=='Vermögensaufbau');if(v)S0.vermZiel=v.n}if(!S0.flags3){S0.flags3=true;ch=true}if(ch&&S0===S)setTimeout(()=>{try{save()}catch(e){}},0)}
const sperOf=a=>{const s=a&&a.sperre;if(!s)return null;const t=Date.now();if((s.frei&&t>=s.frei)||(s.bis&&t>=s.bis)){delete a.sperre;setTimeout(save,0);return null}return s};
const isTabu=n=>{const s=sperOf(acc(n));return !!(s&&s.art=='tabu')};const isLock=n=>{const s=sperOf(acc(n));return !!(s&&s.art=='bremse')};
const tabuFrei=a=>{const s=sperOf(a);return s&&s.art=='tabu'&&s.frei?s.frei:null};
const isCarry=a=>!!a&&a.rest=='bleibt',isRoll=a=>!!a&&a.rest=='umbuchen',isVerm=a=>!!a&&a.rolle=='vermoegen';
function setSperre(a,art,on){if(on){a.sperre=Object.assign({},a.sperre&&a.sperre.art==art?a.sperre:{},{art});delete a.sperre.frei}else if(a.sperre&&a.sperre.art==art)delete a.sperre}
const inP=(e,p)=>e.t>=p.s.getTime()&&e.t<p.e.getTime();
let NOWT=Date.now();const isPlan=e=>e.t>Date.now();
function calc(b,off=0){const p=period(off),L=S.exp.filter(e=>inP(e,p)&&!isPlan(e));
  if(isK(b)){const _a=acc(b),_an=ancD(_a)&&p.e.getTime()>_a.baseD,A=S.exp.filter(e=>e.t<p.e.getTime()&&!isPlan(e)&&(!_an||e.t>=_a.baseD)),sm=(f)=>A.filter(f).reduce((s,e)=>s+e.a,0);
    const bal=(typeof zinsAt=='function'?zinsAt(b,Math.min(p.e.getTime(),Date.now())):0)+(_an?+_a.baseVal:(_a.start||0))+sm(e=>e.type=='in'&&e.b==b)+sm(e=>e.type=='tr'&&e.to==b)-sm(e=>e.type=='out'&&e.b==b)-sm(e=>e.type=='tr'&&e.b==b);
    const ps=(f)=>L.filter(f).reduce((s,e)=>s+e.a,0);
    return{p,konto:true,list:L.filter(e=>e.b==b||e.to==b),out:ps(e=>e.type=='out'&&e.b==b),inc:ps(e=>e.type=='in'&&e.b==b),trO:ps(e=>e.type=='tr'&&e.b==b),trI:ps(e=>e.type=='tr'&&e.to==b),total:bal,used:0,rest:bal,tag:0,woche:0,pct:0}}
  const out=L.filter(e=>e.type=='out'&&e.b==b).reduce((s,e)=>s+e.a,0),inc=L.filter(e=>e.type=='in'&&e.b==b).reduce((s,e)=>s+e.a,0);
  const trO=L.filter(e=>e.type=='tr'&&e.b==b&&!e.alloc).reduce((s,e)=>s+e.a,0),trI=L.filter(e=>e.type=='tr'&&e.to==b&&!e.alloc).reduce((s,e)=>s+e.a,0);
  const stk=isStock(b);let carry=0;if(stk){if(p.s.getTime()>S.since)carry=calc(b,off-1).rest}else if(isCarry(acc(b))&&p.s.getTime()>S.since)carry=Math.max(calc(b,off-1).rest,0);const sa=acc(b),st=(sa.start&&sa.startT===p.s.getTime())?sa.start:0;
  const total=budFor(b,p)+inc+trI+carry+st,used=out+trO,rest=total-used,tag=stk?0:p.left?Math.max(rest,0)/p.left:0;
  return{p,stock:stk,list:L.filter(e=>e.b==b||e.to==b),out,inc,trO,trI,carry,st,total,used,rest,tag,woche:stk?0:Math.min(tag*7,Math.max(rest,0)),pct:stk?0:total?used/total:0}}
function isStock(b){if(!b||isK(b))return false;const a=S.accts.find(x=>x.n==b);return a&&a.stufe?a.stufe=='sparen':/sinking/i.test(b)}
const zone=p=>p<.6?'var(--ok)':p<.85?'var(--warn)':'var(--bad)';
/* budget state: ok, über Plan (more used than the plan allows by today), aufgebraucht (nothing left) */
function stat(c){const P=c.p,soll=c.total*Math.min((P.idx||P.len)/P.len,1),over=c.used-soll;
  if(c.stock)return c.rest<0?{k:'bad',col:'var(--bad)',txt:'Bestand im Minus',over:0}:{k:'ok',col:'var(--ok)',txt:'Bestand',over:0};
  if(c.rest<=0)return{k:'bad',col:'var(--bad)',txt:c.rest<0?'Überzogen um '+eur(-c.rest):'Budget aufgebraucht',over};
  if(over>0.5)return{k:'warn',col:'var(--warn)',txt:eur(over)+' über Plan',over};
  return{k:'ok',col:'var(--ok)',txt:'Im Plan',over}}
const badge=(s,onbg)=>s.k=='ok'?'':`<span class="badge ${s.k}${onbg?' onb':''}">${I(s.k=='bad'?'alert':'up',13)}${s.txt}</span>`;

function gData(b,c,o=0){let cc=0;const{v}=dayVals([b],o);return{t:Math.round(c.total*100)/100,u:Math.round(c.used*100)/100,s:c.p.s.getTime(),len:c.p.len,idx:c.p.idx,cum:v.map(x=>Math.round((cc+=x)*100)/100)}}
function gTip(g,d){const today=g.idx>0&&g.idx<=g.len?g.idx:0,dt=new Date(g.s+(d-1)*864e5),soll=g.t*d/g.len,fut=today&&d>today,spent=fut||!g.cum.length?g.u:g.cum[Math.min(d,g.cum.length)-1],diff=soll-spent;
  return tcHead((d==today?'Heute · ':'Bis ')+dt.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'})+` · Tag ${d}/${g.len}`)+tcRow('Ausgeben erlaubt',soll,'')+tcRow(fut?'Ausgegeben bis heute':'Ausgegeben',spent,'')+`<span class="tr" style="color:color-mix(in srgb,${diff>=0?'var(--ok)':'var(--bad)'} 80%,var(--bg))">${diff>=0?'Noch im Plan':'Über Plan'} <b>${eur(Math.abs(diff))}</b></span>`+(fut&&soll>g.u?`<span class="tr">Ab heute pro Tag <b>${eur(Math.max(0,(soll-g.u)/(d-today+1)))}</b></span>`:'')}
function gauge(pct,col,big,max,sc,gd){const P=gd?{idx:gd.idx,len:gd.len}:period(0),soll=(P.idx-.5)/P.len,r=78,cx=100,cy=92,a=p=>Math.PI*(1-Math.max(0,Math.min(p,1)));
  const pt=(p,rr)=>[cx+rr*Math.cos(a(p)),cy-rr*Math.sin(a(p))];
  const arc=(p0,p1,c)=>{const[x1,y1]=pt(p0,r),[x2,y2]=pt(p1,r);return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${c}" stroke-width="14" fill="none" stroke-linecap="round"/>`};
  const rest=Math.max(0,Math.min(1,1-pct)),sr=1-soll,[s1x,s1y]=pt(sr,r-12),[s2x,s2y]=pt(sr,r+12);
  return `<svg viewBox="0 0 200 ${big?120:104}" width="100%" role="img" aria-label="${Math.round(rest*100)} Prozent übrig"${gd?` class="gg" data-g="${esc(JSON.stringify(gd))}" style="cursor:pointer"`:''}>
   ${arc(0,1,'var(--fill)')}${rest>0.005?arc(0,rest,sc||zone(pct)):''}
   <line x1="${s1x.toFixed(1)}" y1="${s1y.toFixed(1)}" x2="${s2x.toFixed(1)}" y2="${s2y.toFixed(1)}" stroke="var(--fg)" stroke-width="2.5" stroke-linecap="round"/>
   ${gd?`<line class="gmk" x1="0" y1="0" x2="0" y2="0" stroke="${col=='#fff'?'#fff':'var(--accent)'}" stroke-width="4" stroke-linecap="round" style="display:none"/>`:''}
   ${big?`<text x="22" y="114" text-anchor="middle" font-size="10" style="fill:var(--muted)">0 €</text><text x="178" y="114" text-anchor="middle" font-size="10" style="fill:var(--muted)">${eur0(max)}</text>`:''}</svg>`}


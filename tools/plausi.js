#!/usr/bin/env node
/* Plausibilitätsprüfung: lädt die App mit Testdaten unter verschiedenen Stichtagen und Monatsbeginnen
   und prüft die Regeln aus plausiRun in js/06-tools.js (Toleranz 1 Cent).
   node tools/plausi.js            alle Szenarien
   node tools/plausi.js --quick    Kurzlauf (läuft in bump.sh mit)
   node tools/plausi.js --data CashFlow-Sicherung.json   zusätzlich mit echtem Export (bleibt lokal, nie ins Repo!)
   Exit 1 bei Fehlern, Warnungen brechen nicht ab. */
const fs=require('fs'),path=require('path');
let pw;try{pw=require('playwright')}catch(e){console.log('Plausi: Playwright fehlt – Prüfung übersprungen.');process.exit(0)}
const ROOT=path.resolve(__dirname,'..'),URL='file://'+ROOT+'/index.html',RULES='';/* Regeln liegen in js/06-tools.js (plausiRun) */
const A=process.argv.slice(2),quick=A.includes('--quick'),di=A.indexOf('--data'),dataFile=di>=0?A[di+1]:null;
/* Stichtage: heute, Monatsende/-anfang, Schaltjahr, Zeitumstellung (Europe/Berlin) */
const DAYS=quick?['2026-11-17T12:00','2026-11-30T23:30']:['2026-11-17T12:00','2026-11-30T23:30','2026-12-01T00:30','2028-02-29T12:00','2026-10-25T02:30','2027-03-28T03:30','2026-12-31T23:59'];
/* Monatsbeginn: Kalendermonat und Gehaltstag und letzter Werktag ('lw', Gehaltstag) */
const STARTS=quick?[1,'lw']:[1,25,28,'lw'];
/* zusätzliche Buchungen: Umbuchungen, Centbeträge, Geplantes */
const EXTRA=`(()=>{const k=S.accts.find(a=>a.kind=='konto'),bs=S.accts.filter(a=>a.kind!='konto'),sf=S.accts.find(a=>isStock(a.n)),T=Date.now(),D=864e5,P=period(0);
  const t=d=>Math.max(P.s.getTime()+36e5,Math.min(T-6e4,T-d*D));
  if(k&&sf)S.exp.push({id:uid(),type:'tr',b:k.n,to:sf.n,c:'Sparen',a:100,n:'Plausi Umbuchung',t:t(2)});
  if(bs.length>1)S.exp.push({id:uid(),type:'tr',b:bs[0].n,to:bs[1].n,c:'',a:20,n:'Plausi Topf→Topf',t:t(1)});
  if(bs[0])S.exp.push({id:uid(),type:'out',b:bs[0].n,c:'Sonstiges',a:0.1,n:'Plausi 0,10',t:t(1)},{id:uid(),type:'out',b:bs[0].n,c:'Sonstiges',a:0.2,n:'Plausi 0,20',t:t(1)});
  if(bs[0])S.exp.push({id:uid(),type:'out',b:bs[0].n,c:'Sonstiges',a:50,n:'Plausi geplant',t:T+3*D});
  if(k)S.exp.push({id:uid(),type:'out',b:k.n,c:'Sonstiges',a:5000,n:'Plausi ins Minus',t:t(0)});})()`;

/* Stufe 2: dieselbe Zahl an jedem Ort – Heute gegen calc() */
const DASH=`(()=>{tab='dash';render();const v=(document.querySelector('#app .view')||document.body).innerText,R=[],B='Konten & Budgets · Heute',P=period(0),T=new Date().setHours(0,0,0,0),left=Math.max(P.left||1,1);
  const after=l=>{const m=v.match(new RegExp(l+'\\\\s*\\\\n\\\\s*([^\\\\n]+)'));return m?m[1].trim():null};
  const sp=BUDG.filter(b=>!isK(b)&&!isTabu(b)&&!isStock(b)),tot=sp.reduce((s,b)=>s+calc(b).rest,0);
  const frei=sp.reduce((s,b)=>{const c=calc(b),td=S.exp.filter(e=>e.type=='out'&&e.b==b&&!e.corr&&e.t>=T&&e.t<=Date.now()&&inP(e,P)).reduce((x,e)=>x+e.a,0),d=Math.max(0,c.rest+td)/left;return s+d-td},0);
  const chk=(regel,ist,soll)=>R.push({bereich:B,regel,ok:ist==soll,msg:ist==soll?'':'angezeigt '+ist+', berechnet '+soll});
  if(v.includes('Übrig im Monat'))chk('„Übrig im Monat“ = Summe der Budget-Reste',(v.match(/Übrig im Monat[^\\n]*\\n(?:[^\\n]*Tage?\\n)?\\s*([^\\n]*€)/)||[])[1],eur(tot));
  if(v.includes('Heute noch frei'))chk('„Heute noch frei“ = Summe der Tagesbeträge',after('Heute noch frei'),eur(frei));
  const miss=sp.filter(b=>!WH(b)&&!v.includes(eur(calc(b).rest))).map(b=>b+' '+eur(calc(b).rest));
  R.push({bereich:B,regel:'Budget-Reste wie berechnet angezeigt',ok:!miss.length,msg:miss.join(' | ')});return R})()`;
(async()=>{const br=await pw.chromium.launch();let fail=0,warn=0,runs=0;const seen={};
  const run=async(label,day,start,raw)=>{const ctx=await br.newContext({timezoneId:'Europe/Berlin',locale:'de-DE',serviceWorkers:'block'}),pg=await ctx.newPage(),errs=[];
    pg.on('pageerror',e=>errs.push(e.message));await pg.clock.setFixedTime(new Date(day));
    await pg.route(/^https?:/,r=>r.abort());
    if(raw)await pg.addInitScript(s=>{if(!sessionStorage.getItem('pl')){sessionStorage.setItem('pl',1);localStorage.setItem('dodo4',s)}},raw);
    await pg.goto(URL);await pg.waitForFunction(()=>typeof S=='object'&&typeof calc=='function');
    if(!raw){await pg.evaluate(`${start=='lw'?'S.startLW=true':'S.start='+start};S.since=period(-12).s.getTime();S.closed=[];${EXTRA};applyRec();saveNow()`);await pg.reload();await pg.waitForFunction(()=>typeof calc=='function')}
    let res;try{res=await pg.evaluate(RULES+'\nplausiRun()')}catch(e){res=[{bereich:'Ablauf',regel:'Prüfung lief durch',ok:false,msg:e.message.split('\n')[0]}]}
    try{res.push(...await pg.evaluate(DASH))}catch(e){res.push({bereich:'Ansichten',regel:'Heute lesbar',ok:false,msg:e.message.split('\n')[0]})}
    if(errs.length)res.push({bereich:'Ablauf',regel:'Keine JS-Fehler',ok:false,msg:errs.slice(0,3).join(' | ')});
    runs++;res.filter(r=>!r.ok).forEach(r=>{const key=r.regel+'|'+r.msg;r.warn?warn++:fail++;if(seen[key]){seen[key]++;return}seen[key]=1;
      console.log(`${r.warn?'WARNUNG':'FEHLER '} [${label}] ${r.bereich} · ${r.regel}\n         ${r.msg}`)});
    await ctx.close();return res.length};
  let n=0;for(const d of DAYS)for(const s of STARTS)n=await run(`${d.replace('T',' ')} · Beginn ${s}.`,d,s,null);
  if(dataFile){const raw=fs.readFileSync(dataFile,'utf8');const S0=JSON.parse(raw);S0.pin='';await run('Export',new Date().toISOString(),S0.start,JSON.stringify(S0))}
  await br.close();
  console.log(`Plausi: ${runs} Szenarien × ${n} Regeln · ${fail?fail+' Fehler':'keine Fehler'}${warn?' · '+warn+' Warnungen':''}`);process.exit(fail?1:0)})();

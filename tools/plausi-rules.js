/* Plausibilitätsregeln der CashFlow-App.
   Läuft im Seitenkontext der App (globale S, calc, period …). Wird von tools/plausi.js aufgerufen
   und ist so gebaut, dass dieselbe Funktion später als Selbsttest in der App laufen kann.
   Ergebnis: [{bereich, regel, ok, warn, msg}]  · Toleranz 1 Cent.
   Bereiche in Prüfreihenfolge: 1 Konten & Budgets · 2 Rückblick & Prognose · 3 Vermögen · 4 Penny.
   Depot- und Krypto-Live-Kurse sind ausgeklammert. */
function plausiRun(opt){opt=opt||{};const R=[],E=0.01,f2=v=>(Math.round(v*100)/100).toFixed(2).replace('.',','),
  dt=t=>new Date(t).toLocaleDateString('de-DE'),num=v=>typeof v=='number'&&isFinite(v),
  add=(bereich,regel,bad,warn)=>{bad=bad.filter(Boolean);R.push({bereich,regel,ok:!bad.length,warn:!!warn,msg:bad.slice(0,6).join(' | ')+(bad.length>6?' | … +'+(bad.length-6):'')})},
  sum=(L,f)=>L.filter(f).reduce((s,e)=>s+e.a,0),NOW=Date.now(),
  KB='Konten & Budgets';
  const accN=new Set(S.accts.map(a=>a.n)),konten=S.accts.filter(a=>a.kind=='konto').map(a=>a.n),
    budgets=S.accts.filter(a=>a.kind!='konto').map(a=>a.n),
    first=(()=>{let o=0;while(o>-36&&period(o-1).s.getTime()>=(S.since||0))o--;return o})(),
    offs=[];for(let o=Math.max(first,-12);o<=0;o++)offs.push(o);

  /* --- 1 Konten & Budgets --- */
  {const ids=new Set(),b=[];S.exp.forEach(e=>{const w=[];if(!e.id)w.push('ohne ID');else if(ids.has(e.id))w.push('ID doppelt');ids.add(e.id);
    if(!['in','out','tr'].includes(e.type))w.push('Typ '+e.type);if(!num(e.a))w.push('Betrag '+e.a);else if(e.a<0)w.push('Betrag negativ');
    if(!num(e.t))w.push('Datum fehlt');if(!accN.has(e.b))w.push('Konto unbekannt: '+e.b);
    if(e.type=='tr'){if(!accN.has(e.to))w.push('Ziel unbekannt: '+e.to);else if(e.to==e.b)w.push('Ziel = Quelle')}
    if(w.length)b.push((e.n||e.c||'Buchung')+' '+dt(e.t)+': '+w.join(', '))});add(KB,'Buchungen vollständig und gültig',b)}
  add(KB,'Beträge auf Cent genau',S.exp.filter(e=>num(e.a)&&Math.abs(e.a*100-Math.round(e.a*100))>1e-6).map(e=>(e.n||e.c)+' '+dt(e.t)+': '+e.a),true);
  {const b=[];for(let o=-36;o<=24;o++){const p=period(o),q=period(o+1);if(q.s.getTime()!=p.e.getTime())b.push('Lücke/Überlappung nach '+p.label);
    if(p.len<28||p.len>31)b.push(p.label+': '+p.len+' Tage');if(S.start<=28&&p.s.getDate()!=S.start)b.push(p.label+' beginnt am '+p.s.getDate()+'.')}
    const p0=period(0);if(!(NOW>=p0.s.getTime()&&NOW<p0.e.getTime()))b.push('Heute liegt nicht im aktuellen Monat');
    add(KB,'Monate lückenlos, ohne Überlappung',b)}
  {const b=[];offs.forEach(o=>budgets.forEach(n=>{const c=calc(n,o),P=c.p,L=S.exp.filter(e=>e.t>=P.s.getTime()&&e.t<P.e.getTime()&&e.t<=NOW),tag=P.label+' '+n;
    Object.entries(c).forEach(([k,v])=>{if(typeof v=='number'&&!isFinite(v))b.push(tag+': '+k+' = '+v)});
    const out=sum(L,e=>e.type=='out'&&e.b==n),inc=sum(L,e=>e.type=='in'&&e.b==n),trO=sum(L,e=>e.type=='tr'&&e.b==n&&!e.alloc),trI=sum(L,e=>e.type=='tr'&&e.to==n&&!e.alloc);
    if(Math.abs(out-c.out)>E)b.push(tag+': Ausgaben '+f2(c.out)+' statt '+f2(out));if(Math.abs(inc-c.inc)>E)b.push(tag+': Einnahmen '+f2(c.inc)+' statt '+f2(inc));
    if(Math.abs(trO-c.trO)>E||Math.abs(trI-c.trI)>E)b.push(tag+': Umbuchungen weichen ab');
    if(Math.abs(c.used-(out+trO))>E)b.push(tag+': verbraucht '+f2(c.used)+' statt '+f2(out+trO));
    if(Math.abs(c.total-c.used-c.rest)>E)b.push(tag+': verfügbar − verbraucht ≠ Rest');
    if(c.tag<0||c.woche<0)b.push(tag+': Tages-/Wochenbetrag negativ')}));add(KB,'Budget: verfügbar − verbraucht = Rest',b)}
  {const b=[];offs.forEach(o=>budgets.forEach(n=>{const c=calc(n,o);if(c.p.s.getTime()<=S.since){return}const pr=calc(n,o-1),a=acc(n),tag=c.p.label+' '+n;
    const soll=isStock(n)?pr.rest:isCarry(a)?Math.max(pr.rest,0):0;if(Math.abs((c.carry||0)-soll)>E)b.push(tag+': Übertrag '+f2(c.carry||0)+' statt '+f2(soll))}));
    add(KB,'Übertrag = Rest des Vormonats',b)}
  {const b=[];S.accts.filter(a=>isStock(a.n)).forEach(a=>{if(BUDG.includes(a.n))b.push(a.n+' steht in BUDG')});
    const sf=S.accts.find(a=>/sinking/i.test(a.n));if(sf&&!isStock(sf.n))b.push(sf.n+' ist kein Bestand');add(KB,'Sinking Funds ist Bestand, kein Monatsbudget',b)}
  {const b=[];konten.forEach(n=>{const a=acc(n),an=ancD(a);offs.forEach(o=>{if(o==first)return;const c=calc(n,o),pr=calc(n,o-1),P=c.p;
      if(an&&pr.p.e.getTime()<=a.baseD)return;const L=S.exp.filter(e=>e.t>=P.s.getTime()&&e.t<P.e.getTime()&&e.t<=NOW&&(!an||e.t>=a.baseD));
      const fl=sum(L,e=>e.type=='in'&&e.b==n)+sum(L,e=>e.type=='tr'&&e.to==n)-sum(L,e=>e.type=='out'&&e.b==n)-sum(L,e=>e.type=='tr'&&e.b==n),
        zi=(typeof zinsAt=='function'?zinsAt(n,Math.min(P.e.getTime(),NOW))-zinsAt(n,Math.min(pr.p.e.getTime(),NOW)):0);
      if(Math.abs(c.rest-pr.rest-fl-zi)>E)b.push(P.label+' '+n+': Stand '+f2(c.rest)+', erwartet '+f2(pr.rest+fl+zi))})});
    add(KB,'Kontostand = Vormonat + Zu- − Abflüsse',b)}
  {const b=[];konten.forEach(n=>{const a=acc(n),an=ancD(a),L=S.exp.filter(e=>e.t<=NOW&&(!an||e.t>=a.baseD));
    const soll=(an?+a.baseVal:(a.start||0))+(typeof zinsAt=='function'?zinsAt(n,NOW):0)+sum(L,e=>e.type=='in'&&e.b==n)+sum(L,e=>e.type=='tr'&&e.to==n)-sum(L,e=>e.type=='out'&&e.b==n)-sum(L,e=>e.type=='tr'&&e.b==n);
    if(Math.abs(calc(n).rest-soll)>E)b.push(n+': '+f2(calc(n).rest)+' statt '+f2(soll))});add(KB,'Kontostand = Start + alle Buchungen',b)}
  {const b=[];S.exp.filter(e=>e.t>NOW).forEach(e=>{const P=period(0);if(e.t<P.e.getTime()&&calc(e.b).list.includes(e))b.push((e.n||e.c)+' '+dt(e.t)+' zählt schon im Ist')});
    add(KB,'Geplante Buchungen zählen nicht im Ist',b)}
  {const b=[],seen={};S.exp.filter(e=>e.rid&&e.pk).forEach(e=>{const k=e.rid+'|'+e.pk;if(seen[k])b.push('Fixkosten doppelt: '+(e.n||e.c)+' '+e.pk);seen[k]=1});
    if(!opt.readonly){const n0=S.exp.length,h0=(S.recHold||[]).length;applyRec();applyRec();if(S.exp.length!=n0)b.push('erneuter Lauf erzeugt '+(S.exp.length-n0)+' Buchungen');
      if((S.recHold||[]).length!=h0)b.push('erneuter Lauf ändert zurückgehaltene Fixkosten')}
    add(KB,'Fixkosten nicht doppelt (auch bei erneutem Lauf)',b)}
  if(!opt.readonly){const b=[];closeMonths();const c0=JSON.stringify([S.closed,S.restProp]);closeMonths();if(JSON.stringify([S.closed,S.restProp])!=c0)b.push('Monatsabschluss ändert beim zweiten Lauf Daten');add(KB,'Monatsabschluss wiederholbar',b)}
  if(!opt.readonly&&typeof corrBook=='function'){const b=[];abgleichAccs().forEach(n=>{[123.45,-67.89].forEach(d=>{const ziel=Math.round((calc(n).rest+d)*100)/100;corrBook(n,ziel);
      if(Math.abs(calc(n).rest-ziel)>E)b.push(n+': nach Abgleich '+f2(calc(n).rest)+' statt Bankstand '+f2(ziel));if(corrBook(n,ziel)!==0)b.push(n+': zweiter Abgleich bucht erneut')})});
    add(KB,'Kontoabgleich trifft den Bankstand',b)}
  return R}

/* ---------- Vermögen: ETFs, Aktien, Krypto ---------- */
let depShow=false,depBusy=false,depMsg='';const DT={etf:['ETF','#4F6BED','chart'],aktie:['Aktie','#22A699','up'],krypto:['Krypto','#D4A23A','bolt'],robo:['Robo','#7B2CBF','target'],sonst:['Sonstiges','#9A93AD','dot']};
const depot=()=>(S.depot=S.depot||[]);
const KURS_FN=`// Supabase Edge Function "kurse": holt Kurse für ETFs und Aktien (ISIN oder Ticker)
Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const H = { "User-Agent": "Mozilla/5.0" };
  const chart = async (s) => { const r = (await (await fetch("https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(s) + "?range=5d&interval=1d", { headers: H })).json()).chart.result[0]; const m = r.meta; try { const off = (m.gmtoffset || 0) * 1000, day = (t) => Math.floor((t * 1000 + off) / 864e5), td = day(m.regularMarketTime), ts = r.timestamp || [], c = ((r.indicators && r.indicators.quote && r.indicators.quote[0]) || {}).close || []; for (let i = ts.length - 1; i >= 0; i--) { if (c[i] != null && day(ts[i]) < td) { m.__prev = c[i]; break; } } } catch (_) {} return m; };
  const { q = [], hist = false, news = null, info = null, img = null } = await req.json().catch(() => ({}));
  if (img) {
    const dom = String(img).toLowerCase().replace(/[^a-z0-9.-]/g, "").slice(0, 80);
    for (const u of ["https://www.google.com/s2/favicons?domain=" + dom + "&sz=128", "https://icons.duckduckgo.com/ip3/" + dom + ".ico"]) {
      try { const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } }); if (!r.ok) continue; const b = new Uint8Array(await r.arrayBuffer()); if (b.length < 100) continue; let s = ""; for (let k = 0; k < b.length; k += 32768) s += String.fromCharCode(...b.subarray(k, k + 32768));
        return new Response(JSON.stringify({ img: btoa(s), type: r.headers.get("content-type") || "image/png", v: 9 }), { headers: { ...cors, "Content-Type": "application/json" } }); } catch (_) {}
    }
    return new Response(JSON.stringify({ img: null, v: 9 }), { headers: { ...cors, "Content-Type": "application/json" } });
  }
  if (info) {
    const isin = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(info); let cands = [info];
    try { const j = await (await fetch("https://query2.finance.yahoo.com/v1/finance/search?quotesCount=10&newsCount=0&q=" + encodeURIComponent(info), { headers: H })).json(); const qs = (j.quotes || []).map((x) => x.symbol).filter(Boolean); cands = isin ? qs : [info, ...qs.filter((x) => x !== info)]; } catch (_) {}
    let ck = "", cr = "";
    try { const r0 = await fetch("https://fc.yahoo.com", { headers: H, redirect: "manual" }); const sc = (r0.headers.getSetCookie ? r0.headers.getSetCookie() : [r0.headers.get("set-cookie") || ""]).map((x) => x.split(";")[0]).filter(Boolean); ck = sc.join("; "); cr = await (await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", { headers: { ...H, cookie: ck } })).text(); } catch (_) {}
    const mods = "assetProfile,summaryProfile,fundProfile,topHoldings,financialData,recommendationTrend,price,summaryDetail,defaultKeyStatistics,quoteType";
    let best = null;
    for (const sym of cands.slice(0, 5)) {
      try {
        const j = await (await fetch("https://query2.finance.yahoo.com/v10/finance/quoteSummary/" + encodeURIComponent(sym) + "?modules=" + mods + (cr ? "&crumb=" + encodeURIComponent(cr) : ""), { headers: { ...H, cookie: ck } })).json();
        const q = j.quoteSummary && j.quoteSummary.result && j.quoteSummary.result[0]; if (!q) continue;
        const raw = (x) => (x && typeof x === "object" && "raw" in x ? x.raw : x);
        const th = q.topHoldings || {}, ap = q.assetProfile || q.summaryProfile || {}, fp = q.fundProfile || {}, fd = q.financialData || {}, pr = q.price || {}, sd = q.summaryDetail || {}, ks = q.defaultKeyStatistics || {};
        const o = { symbol: sym, name: pr.longName || pr.shortName || sym, type: (q.quoteType && q.quoteType.quoteType) || pr.quoteType || "", currency: pr.currency || fd.financialCurrency || "",
          summary: ap.longBusinessSummary || ks.longBusinessSummary || "", sector: ap.sector || "", industry: ap.industry || "", country: ap.country || "", employees: ap.fullTimeEmployees || null, web: ap.website || "",
          family: fp.family || "", category: fp.categoryName || ks.category || "", ter: raw(fp.feesExpensesInvestment && fp.feesExpensesInvestment.annualReportExpenseRatio) ?? raw(sd.expenseRatio) ?? null, assets: raw(sd.totalAssets) ?? raw(ks.totalAssets) ?? null,
          holdings: (th.holdings || []).slice(0, 10).map((h) => ({ n: h.holdingName || h.symbol, s: h.symbol, p: raw(h.holdingPercent) })),
          sectors: (th.sectorWeightings || []).map((x) => { const k = Object.keys(x)[0]; return { n: k, p: raw(x[k]) }; }).filter((x) => x.p > 0.001).sort((a, b) => b.p - a.p),
          stockPos: raw(th.stockPosition), bondPos: raw(th.bondPosition),
          price: raw(fd.currentPrice) ?? raw(pr.regularMarketPrice), target: { lo: raw(fd.targetLowPrice), mean: raw(fd.targetMeanPrice), med: raw(fd.targetMedianPrice), hi: raw(fd.targetHighPrice), n: raw(fd.numberOfAnalystOpinions) },
          reco: fd.recommendationKey || "", recoMean: raw(fd.recommendationMean), trend: ((q.recommendationTrend && q.recommendationTrend.trend) || []).find((t) => t.period === "0m") || null,
          pe: raw(sd.trailingPE), div: raw(sd.dividendYield) ?? raw(sd.yield), w52: [raw(sd.fiftyTwoWeekLow), raw(sd.fiftyTwoWeekHigh)], mcap: raw(sd.marketCap) };
        const score = (o.summary ? 2 : 0) + (o.holdings.length ? 3 : 0) + (o.sectors.length ? 1 : 0) + (o.target.mean ? 2 : 0);
        const empty = (v) => v == null || v === "" || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.values(v).some((x) => x != null));
        if (!best) best = { ...o, score }; else { for (const k in o) if (empty(best[k]) && !empty(o[k])) best[k] = o[k]; best.score = Math.max(best.score, score); }
        if (best.holdings.length && best.summary && (best.target.mean || best.type === "ETF" || best.holdings.length)) break;
      } catch (_) {}
    }
    return new Response(JSON.stringify({ info: best, v: 9, crumb: !!cr }), { headers: { ...cors, "Content-Type": "application/json" } });
  }
  if (Array.isArray(news)) {
    const items = []; const diag = {};
    const dec = (x) => x.replace(/<!\\[CDATA\\[|\\]\\]>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]+>/g, "").trim();
    const rss = async (url, q, defSrc) => {
      const xml = await (await fetch(url, { headers: { ...H, "Accept-Language": "de-DE,de;q=0.9", Cookie: "CONSENT=YES+cb.20240101-00-p0.de+FX+000; SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmRlIAEaBgiA_LyaBg" } })).text();
      const out = [];
      for (const it of (xml.match(/<item>[\\s\\S]*?<\\/item>/g) || []).slice(0, 12)) {
        const g = (t) => { const m = it.match(new RegExp("<" + t + "[^>]*>([\\\\s\\\\S]*?)<\\\\/" + t + ">")); return m ? dec(m[1]) : ""; };
        const src = g("source") || g("News:Source") || defSrc; let title = g("title"); if (src && title.endsWith(" - " + src)) title = title.slice(0, -(src.length + 3));
        if (title) out.push({ q, id: g("guid") || g("link"), t: title, p: src, u: g("link"), ts: Date.parse(g("pubDate")) || 0 });
      }
      return out;
    };
    for (const n0 of news.slice(0, 15)) {
      const n = typeof n0 === "string" ? { q: n0, y: n0 } : n0; let c = 0;
      if (n.g) {
        try { const r = await rss("https://news.google.com/rss/search?hl=de&gl=DE&ceid=DE:de&q=" + encodeURIComponent(n.g + " when:7d"), n.q, "Google News"); items.push(...r); c += r.length; diag[n.q + ":g"] = r.length; } catch (e) { diag[n.q + ":g"] = String(e); }
        if (!diag[n.q + ":g"]) { try { const r = await rss("https://www.bing.com/news/search?format=rss&setlang=de&cc=DE&q=" + encodeURIComponent(n.g), n.q, "Bing News"); items.push(...r); c += r.length; diag[n.q + ":b"] = r.length; } catch (e) { diag[n.q + ":b"] = String(e); } }
      }
      if (n.y) {
        try {
          const base = n.y.split(/[.-]/)[0].toUpperCase(); const words = (n.w || []).map((w) => w.toLowerCase());
          const j = await (await fetch("https://query2.finance.yahoo.com/v1/finance/search?quotesCount=0&newsCount=12&q=" + encodeURIComponent(n.y), { headers: H })).json();
          for (const x of j.news || []) {
            const rel = (x.relatedTickers || []).map((t) => t.split(/[.-]/)[0].toUpperCase()), tl = String(x.title || "").toLowerCase();
            if (!(rel.includes(base) || tl.includes(base.toLowerCase()) || words.some((w) => w.length > 3 && tl.includes(w)))) continue;
            items.push({ q: n.q, id: x.uuid, t: x.title, p: x.publisher, u: x.link, ts: (x.providerPublishTime || 0) * 1000 }); c++;
          }
        } catch (e) { diag[n.q + ":y"] = String(e); }
      }
      diag[n.q] = c;
    }
    return new Response(JSON.stringify({ __news: items, diag, v: 9 }), { headers: { ...cors, "Content-Type": "application/json" } });
  }
  const out = {}; const fx = {};
  for (const s of q.slice(0, 40)) {
    try {
      let sym = s;
      if (/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(s)) {
        const j = await (await fetch("https://query2.finance.yahoo.com/v1/finance/search?quotesCount=8&q=" + s, { headers: H })).json();
        const qs = j.quotes || [];
        const p = qs.find((x) => /\\.DE$/.test(x.symbol)) || qs.find((x) => /\\.(F|AS|MI|PA|SW|L)$/.test(x.symbol)) || qs[0];
        if (p) sym = p.symbol;
      }
      let m;
      try { m = await chart(sym); } catch (e) {
        const j = await (await fetch("https://query2.finance.yahoo.com/v1/finance/search?quotesCount=8&q=" + encodeURIComponent(s), { headers: H })).json();
        const qs = j.quotes || []; const p = qs.find((x) => /\.DE$/.test(x.symbol)) || qs.find((x) => /\.(F|AS|MI|PA|SW|L)$/.test(x.symbol)) || qs[0];
        if (!p) throw e; sym = p.symbol; m = await chart(sym);
      }
      let k = 1, cur = m.currency;
      if (cur === "GBp") { k = 0.01; cur = "GBP"; }
      if (cur && cur !== "EUR") { fx[cur] = fx[cur] || (await chart(cur + "EUR=X")).regularMarketPrice; k *= fx[cur]; }
      out[s] = { symbol: sym, name: m.longName || m.shortName || sym, price: m.regularMarketPrice * k, prev: (m.__prev || m.regularMarketPreviousClose || m.previousClose || m.chartPreviousClose) * k, time: m.regularMarketTime, v: 9 };
      if (hist) {
        const rg = { d: "range=1y&interval=1d", h: "range=5d&interval=60m", i: "range=1d&interval=5m", w: "range=2y&interval=1wk", m: "range=1mo&interval=1h", s: "range=6mo&interval=1d", f: "range=5y&interval=1wk" }[hist === true ? "d" : hist] || "range=1y&interval=1d";
        const r = (await (await fetch("https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym) + "?" + rg, { headers: H })).json()).chart.result[0];
        const c = r.indicators.quote[0].close;
        out[s].hist = r.timestamp.map((t, i) => [t * 1000, c[i] == null ? null : c[i] * k]).filter((x) => x[1] != null);
      }
    } catch (e) { out[s] = { error: String(e) }; }
  }
  return new Response(JSON.stringify(out), { headers: { ...cors, "Content-Type": "application/json" } });
});`;
async function cryptoPrice(sym){sym=sym.toUpperCase().trim();
  try{const r=await fetch('https://api.coinbase.com/v2/prices/'+sym+'-EUR/spot');if(r.ok){const j=await r.json();const p=+j.data.amount;if(p){let prev=null;
    try{const s=await (await fetch('https://api.exchange.coinbase.com/products/'+sym+'-EUR/stats')).json();if(+s.open)prev=+s.open}catch(e){}
    if(!prev){try{const q=await (await fetch('https://api.coingecko.com/api/v3/search?query='+encodeURIComponent(sym))).json();const c=(q.coins||[]).find(x=>x.symbol.toUpperCase()==sym);if(c){const j2=await (await fetch('https://api.coingecko.com/api/v3/simple/price?ids='+c.id+'&vs_currencies=eur&include_24hr_change=true')).json();const v=j2[c.id];if(v&&v.eur_24h_change!=null)prev=p/(1+v.eur_24h_change/100)}}catch(e){}}
    return{price:p,prev}}}}catch(e){}
  try{const s=await (await fetch('https://api.coingecko.com/api/v3/search?query='+encodeURIComponent(sym))).json();const c=(s.coins||[]).find(x=>x.symbol.toUpperCase()==sym)||(s.coins||[])[0];if(c){const j=await (await fetch('https://api.coingecko.com/api/v3/simple/price?ids='+c.id+'&vs_currencies=eur&include_24hr_change=true')).json();const v=j[c.id];if(v)return{price:v.eur,prev:v.eur_24h_change!=null?v.eur/(1+v.eur_24h_change/100):null}}}catch(e){}
  return null}
let depTry=0;
async function depRefresh(force){if(depBusy)return;const D=depot();if(!D.length)return;const fresh=D.every(h=>h.manual||(h.pt&&Date.now()-h.pt<15*60000));if(!force&&(fresh||Date.now()-depTry<5*60000))return;depTry=Date.now();
  depBusy=true;depMsg='Aktualisiere Kurse …';let ok=0,fail=0;
  for(const h of D.filter(h=>h.type=='krypto'&&!h.manual)){const r=await cryptoPrice(h.sym);if(r){h.price=r.price;h.prev=r.prev||null;h.pt=Date.now();h.qt=Date.now();ok++}else fail++}
  const st=D.filter(h=>h.type!='krypto'&&!h.manual&&h.sym);
  if(st.length){if(syOn()){try{const r=await syFetch('/functions/v1/kurse',{method:'POST',body:JSON.stringify({q:st.map(h=>h.sym.trim().toUpperCase())})});
      if(r.ok){const j=await r.json();const miss=[];st.forEach(h=>{const x=j[h.sym.trim().toUpperCase()];if(x&&x.price){S.kursFnOld=!x.v||x.v<3;h.price=x.price;h.prev=x.prev;h.pt=Date.now();h.qt=x.time?x.time*1000:Date.now();if(!h.n||h.n==h.sym)h.n=x.name;h.ysym=x.symbol;ok++}else miss.push(h)});
        const alt=miss.filter(h=>!/\./.test(h.sym)&&!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/i.test(h.sym.trim()));
        if(alt.length){const qs=[];alt.forEach(h=>['.DE','.F','.AS','.L','.MI','.PA','.SW'].forEach(s=>qs.push(h.sym.trim().toUpperCase()+s)));
          try{const r2=await syFetch('/functions/v1/kurse',{method:'POST',body:JSON.stringify({q:qs})});const j2=r2.ok?await r2.json():{};
            alt.forEach(h=>{const hit=['.DE','.F','.AS','.L','.MI','.PA','.SW'].map(s=>j2[h.sym.trim().toUpperCase()+s]).find(x=>x&&x.price);if(hit){h.price=hit.price;h.prev=hit.prev;h.pt=Date.now();h.qt=hit.time?hit.time*1000:Date.now();h.ysym=hit.symbol;h.sym=hit.symbol;ok++;miss.splice(miss.indexOf(h),1)}})}catch(e){}}
        fail+=miss.length;miss.forEach(h=>h.nofound=true);st.filter(h=>!miss.includes(h)).forEach(h=>delete h.nofound)}else{fail+=st.length;S.kursFn=false}}catch(e){fail+=st.length;S.kursFn=false}}else fail+=st.length}
  D.forEach(h=>{if(h.pendVal&&h.price){h.qty=Math.round(h.pendVal/h.price*1e6)/1e6;delete h.pendVal}});
  for(const h of D.filter(h=>h.manual&&h.mprice&&h.cur&&h.cur!='EUR')){const r=await fxLoad(h.cur);if(r)h.price=h.mprice*r}
  depApplyPlans();save();depBusy=false;depMsg=(ok?'Kurse aktualisiert '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'')+(fail?(ok?' · ':'')+fail+' ohne automatischen Kurs':'');if(ok&&st.length&&!fail)S.kursFn=true;if(tab=='rep'&&repV=='Vermögen'&&!$('sheetRoot').innerHTML)render()}
/* Eine Quelle: Ist ein Sparplan mit einer wiederkehrenden Buchung verknüpft, gelten deren Rate, Tag, Konten und Pause. Das Depot liest sie nur. */
function depSync(){const R=S.rec||[];let ch=false;depot().forEach(h=>{let r=h.rid&&R.find(x=>x.id==h.rid);if(!r){r=R.find(x=>x.dep&&x.dep==h.id);if(r){h.rid=r.id;ch=true}}
  if(!r){if(h.rid){delete h.rid;h.book=false;h.rate=0;h.plan=false;delete h.next;ch=true}return}
  if(r.to&&!h.to){h.to=r.to;ch=true}
  const ended=r.end&&r.end<today(),pa=!!r.paused||!!ended;
  if(h.rate!==r.a){h.rate=r.a;ch=true}if(r.day&&h.day!==r.day){h.day=r.day;if(h.next){const d=new Date(h.next+'T12:00');let s=ymd(dueIn(d.getFullYear(),d.getMonth(),r.day).getTime());if(s<today())s=ymd(dueIn(d.getFullYear(),d.getMonth()+1,r.day).getTime());h.next=s}ch=true}
  if(r.b&&h.from!==r.b){h.from=r.b;ch=true}if(r.to&&h.to!==r.to){h.to=r.to;ch=true}if(h.paused!==pa){h.paused=pa;ch=true}if(!h.book){h.book=true;ch=true}});
  if(ch)save();return ch}
function gespartV(){return Math.round(((S.wish||[]).filter(w=>w.s=='verworfen').reduce((s,w)=>s+(w.p||0),0)+(S.goals||[]).filter(g=>g.dropped).reduce((s,g)=>s+(g.ziel||0),0)+(S.gespartAdj||0))*100)/100}
function goalOfWish(w){if(!w)return null;const G=S.goals||[];return (w.id&&G.find(g=>g.wid==w.id&&!g.done&&!g.dropped))||G.find(g=>!g.wid&&!g.done&&!g.dropped&&g.n==w.n)||null}
/* Eine Quelle: Wunsch ↔ Sparziel (Wunsch liefert Name, Preis, Grund, Link), Kredit-Rate aus der wiederkehrenden Buchung, gespart wird berechnet */
function linkSync(){let ch=false;(S.wish||[]).forEach(w=>{if(!w.id){w.id='w'+sh32(String(w.t||'')+'|'+(w.n||''));ch=true}});
  (S.wish||[]).forEach(w=>{if(w.s!='Sparziel')return;const g=goalOfWish(w);if(!g)return;if(!g.wid){g.wid=w.id;ch=true}if(g.n!==w.n){g.n=w.n;ch=true}if(g.ziel!==w.p){g.ziel=w.p;ch=true}if((g.w||'')!==(w.w||'')){g.w=w.w||undefined;ch=true}if((g.l||'')!==(w.l||'')){g.l=w.l||undefined;ch=true}});
  (S.debts||[]).forEach(d=>{const r=debtRec(d);if(r&&d.rid!==r.id){d.rid=r.id;ch=true}});
  if(S.gespartAdj==null){const calc0=(S.wish||[]).filter(w=>w.s=='verworfen').reduce((s,w)=>s+(w.p||0),0)+(S.goals||[]).filter(g=>g.dropped).reduce((s,g)=>s+(g.ziel||0),0);S.gespartAdj=Math.max(0,Math.round(((S.gespart||0)-calc0)*100)/100);ch=true}
  if(ch)save();return ch}
function depApplyPlans(){const td=today();depSync();depot().forEach(h=>{if(!h.rate||!h.plan||!h.next)return;if(h.paused){while(h.next<=td)h.next=nextDue(h.next,h.day);return}let n=0;const rr=h.rid&&(S.rec||[]).find(x=>x.id==h.rid);while(h.next<=td&&n<24){if(!h.price)break;const tt=new Date(h.next+'T12:00').getTime(),rt=rr?recA(rr,periodAt(tt)):h.rate;h.qty=Math.round(((h.qty||0)+rt/h.price)*1e6)/1e6;h.inv=Math.round(((h.inv||0)+rt)*100)/100;h.tx=h.tx||[];h.tx.push({id:uid(),t:tt,type:'plan',q:Math.round(rt/h.price*1e8)/1e8,p:h.price,fee:0,a:rt});h.avg=avgOf(h);h.next=nextDue(h.next,h.day);n++}})}
/* ---------- Detailseite je Vermögenswert ---------- */
let posView=null,posRange='1y';async function cbDaily(sym,days){const out=[];let end=Date.now();for(let k=0;k<Math.ceil(days/300)&&k<7;k++){const st=end-300*864e5;try{const r=await (await fetch('https://api.exchange.coinbase.com/products/'+sym+'-EUR/candles?granularity=86400&start='+new Date(Math.max(st,Date.now()-days*864e5)).toISOString()+'&end='+new Date(end).toISOString())).json();if(!Array.isArray(r)||!r.length)break;r.forEach(x=>out.push([x[0]*1000,x[4]]))}catch(e){break}end=st;if(end<Date.now()-days*864e5)break}return out.sort((a,b)=>a[0]-b[0])}const PR={'1d':['1T','i'],'1w':['1W','h'],'1m':['1M','m'],'3m':['3M','s'],'6m':['6M','s'],'ytd':['YTD','d'],'1y':['1J','d'],'5y':['5J','f']};const PRL={'1d':'heute','1w':'1 Woche','1m':'1 Monat','3m':'3 Monate','6m':'6 Monate','ytd':'seit 1.1.','1y':'1 Jahr','5y':'5 Jahre'};
const PH={},PINFO=(()=>{try{return JSON.parse(localStorage.getItem('cf_info')||'{}')}catch(e){return{}}})(),PBUSY={};
const SECDE={technology:'Technologie',healthcare:'Gesundheit',financial_services:'Finanzen',consumer_cyclical:'Zyklischer Konsum',consumer_defensive:'Basiskonsum',industrials:'Industrie',communication_services:'Kommunikation',energy:'Energie',basic_materials:'Rohstoffe',realestate:'Immobilien',utilities:'Versorger'};
const RECO={strong_buy:['Stark kaufen','var(--ok)'],buy:['Kaufen','var(--ok)'],hold:['Halten','var(--warn)'],underperform:['Untergewichten','var(--bad)'],sell:['Verkaufen','var(--bad)'],none:['Keine Einschätzung','var(--muted)']};
async function posHist(h,r){const k=hkey(h)+'|'+r;if(PH[k]&&Date.now()-PH[k].t<(r=='1d'?5*6e4:36e5))return PH[k].pts;if(PBUSY[k])return null;
  {const dk=hk2(h,'d'),x=HC[dk];if((r=='1y'||r=='ytd')&&x&&x.pts&&x.pts.length>200&&Date.now()-x.t<36e5){const pts=r=='ytd'?x.pts.filter(p=>p[0]>=yStart()):x.pts;PH[k]={t:x.t,pts};return pts}}
  PBUSY[k]=1;let pts=null;
  try{if(h.type=='krypto'){const sym=String(h.sym).toUpperCase().trim();const days={'1d':1,'1w':7,'1m':30,'3m':92,'6m':183,'ytd':Math.ceil((Date.now()-yStart())/864e5)+1,'1y':365,'5y':1826}[r];if(days>300){pts=await cbDaily(sym,days);if(r=='5y')pts=pts.filter((_,j)=>j%7==0||j==pts.length-1)}if(!pts||!pts.length){const sr=await (await fetch('https://api.coingecko.com/api/v3/search?query='+encodeURIComponent(sym))).json();const c=(sr.coins||[]).find(x=>x.symbol.toUpperCase()==sym)||(sr.coins||[])[0];if(c){h.cgid=c.id;const j=await (await fetch('https://api.coingecko.com/api/v3/coins/'+c.id+'/market_chart?vs_currency=eur&days='+Math.min(days,365))).json();if(j.prices&&j.prices.length)pts=j.prices}}if((!pts||!pts.length)&&days>1)pts=await cbDaily(sym,Math.min(days,1826))}
    else if(syOn()){const q=String(h.sym).trim().toUpperCase();const rr=await syFetch('/functions/v1/kurse',{method:'POST',body:JSON.stringify({q:[q],hist:PR[r][1]})});const j=rr.ok?await rr.json():{};const y=j[q];if(y&&y.hist&&y.hist.length){pts=y.hist;if(!y.v||y.v<7)S.kursFnOld=true}}}catch(e){}
  if(pts&&(r=='ytd'||r=='3m'||r=='1m'&&h.type!='krypto'))pts=pts.filter(p=>p[0]>=(r=='ytd'?yStart():r=='3m'?Date.now()-92*864e5:Date.now()-31*864e5));
  delete PBUSY[k];if(pts&&pts.length){PH[k]={t:Date.now(),pts};if(r=='1y'&&h.type!='krypto'&&!HC[hk2(h,'d')]){HC[hk2(h,'d')]={t:Date.now(),pts};try{hcSave()}catch(e){}}if(r=='5y'&&!HC[hk2(h,'f')]){HC[hk2(h,'f')]={t:Date.now(),pts};try{hcSave()}catch(e){}}return pts}PH[k]={t:Date.now()-36e5+5*6e4,pts:null,fail:1};return null}
async function posInfo(h){const k=hkey(h);const c=PINFO[k];if(c&&Date.now()-c.t<24*36e5)return c.d;if(PBUSY['i'+k])return null;PBUSY['i'+k]=1;let d=null;
  try{if(h.type=='krypto'){const sym=String(h.sym).toUpperCase().trim();let id=h.cgid;if(!id){const sr=await (await fetch('https://api.coingecko.com/api/v3/search?query='+encodeURIComponent(sym))).json();const cc=(sr.coins||[]).find(x=>x.symbol.toUpperCase()==sym)||(sr.coins||[])[0];id=cc&&cc.id}
      if(id){const j=await (await fetch('https://api.coingecko.com/api/v3/coins/'+id+'?localization=true&tickers=false&community_data=false&developer_data=false')).json();const md=j.market_data||{};const strip=t=>String(t||'').replace(/<[^>]+>/g,'').replace(/\r?\n\r?\n/g,'\n\n').trim();
        d={kind:'krypto',name:j.name,summary:strip((j.description||{}).de)||strip((j.description||{}).en),lang:(j.description||{}).de?'de':'en',rank:j.market_cap_rank,mcap:md.market_cap&&md.market_cap.eur,ath:md.ath&&md.ath.eur,athDate:md.ath_date&&md.ath_date.eur,supply:md.circulating_supply,max:md.max_supply,cats:(j.categories||[]).filter(Boolean).slice(0,4),web:(j.links&&j.links.homepage||[])[0]||''}}}
    else if(syOn()){const rr=await syFetch('/functions/v1/kurse',{method:'POST',body:JSON.stringify({info:String(h.sym).trim().toUpperCase()})});const j=rr.ok?await rr.json():{};if(j.v>=7)d=j.info?Object.assign({kind:'yahoo'},j.info):{kind:'none'};else{S.kursFnOld=true;d={kind:'old'}}}}catch(e){}
  delete PBUSY['i'+k];if(d&&d.kind!='old'){PINFO[k]={t:Date.now(),d};try{localStorage.setItem('cf_info',JSON.stringify(PINFO))}catch(e){}}return d}
const fmtBig=v=>v==null?'–':v>=1e12?(v/1e12).toLocaleString('de-DE',{maximumFractionDigits:1})+' Bio.':v>=1e9?(v/1e9).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mrd.':v>=1e6?(v/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio.':Math.round(v).toLocaleString('de-DE');
/* Mein Anteil: Bestand und Eingezahltes zu jedem Zeitpunkt aus den Transaktionen (eine Quelle: h.tx + Bestand) */
const posVal=h=>h.pendVal&&!h.qty?h.pendVal:(h.qty||0)*(h.price||(h.inv&&h.qty?h.inv/h.qty:0));
let posMode='kurs';const txAmt=x=>x.a!=null?x.a:x.q*x.p;
/* Eine Quelle für den Bestandsverlauf einer Position: echte/nachgetragene Transaktionen (h.tx) + für Monate ohne erfassten Sparplan-Eintrag die rechnerische Sparplan-Ausführung. Genutzt von Positionskarte UND Depot-Chart. */
let PEV={};
function posEvents(h){const hc=HC[hk2(h,'d')],ck=h.id+'|'+DV+'|'+(h.tx||[]).length+'|'+(h.rate||0)+'|'+(h.day||0)+'|'+(h.bd||'')+'|'+(h.plan?1:0)+'|'+(hc?hc.t:0);if(PEV[ck])return PEV[ck];if(Object.keys(PEV).length>200)PEV={};const T=(h.tx||[]).slice();
  if(h.rate&&h.plan){const has=new Set(T.filter(x=>x.type=='plan'&&!x.ru).map(x=>ymd(x.t).slice(0,7))),rr=h.rid&&(S.rec||[]).find(x=>x.id==h.rid),from=h.bd&&h.bd!='pre'?new Date(h.bd+'T12:00').getTime():yStart();
    const f0=new Date(from);let y=f0.getFullYear(),m=f0.getMonth(),d=dueIn(y,m,h.day);if(d.getTime()<from){m++;d=dueIn(y,m,h.day)}
    while(d.getTime()<=Date.now()){const t=d.getTime();if(!has.has(ymd(t).slice(0,7))){const a=rr?recA(rr,periodAt(t)):h.rate,pr=priceAt(h,t);if(pr&&a)T.push({t,type:'plan',q:a/pr,p:pr,a,syn:true})}m++;d=dueIn(y,m,h.day)}}
  T.sort((a,b)=>a.t-b.t);return PEV[ck]=T}
function posBaseRaw(h){let q=+h.qty||0,iv=+h.inv||0;posEvents(h).forEach(x=>{if(x.type=='sell'){q+=x.q;iv+=txAmt(x)-(x.fee||0)-(x.real||0)}else{q-=x.q;iv-=txAmt(x)+(x.fee||0)}});return{q,iv}}
function posBase(h){const r=posBaseRaw(h);return{q0:Math.max(0,r.q),i0:Math.max(0,r.iv),bdT:h.bd&&h.bd!='pre'?new Date(h.bd+'T00:00').getTime():0,E:posEvents(h)}}
function posAt(h,B,t){let q=t>=B.bdT?B.q0:0,iv=t>=B.bdT?B.i0:0;for(const x of B.E){if(x.t>t)break;if(x.type=='sell'){q-=x.q;iv-=txAmt(x)-(x.fee||0)-(x.real||0)}else{q+=x.q;iv+=txAmt(x)+(x.fee||0)}}return{q:Math.max(0,q),iv:Math.max(0,iv)}}
const txK=x=>x&&x.ru?'ru':x.type,TXL={buy:['Kauf','plus','var(--mk-buy)'],sell:['Verkauf','minus','var(--mk-sell)'],plan:['Sparplan','repeat','var(--mk-plan)'],ru:['Wechselgeld','coins','var(--warn)']};
function txRow(h,x,V,btn,nm){const L=x.ru?TXL.ru:(TXL[x.type]||TXL.buy),rb=h.type=='robo',since=!rb&&h.price&&x.p?(h.price/x.p-1)*100:null;
  return `<${btn?`button data-txo="1" data-tid="${esc(x.id||'')}"`:'div'} class="cell ${btn?'':'plain'} txr"><div class="ico" style="background:color-mix(in srgb,${L[2]} 16%,transparent);color:${L[2]}">${I(L[1],16)}</div><div class="t"><div>${nm?`<b>${esc(nm)}</b> · `:''}${L[0]}${!rb&&x.q&&x.p?' · '+V((+x.q).toLocaleString('de-DE',{maximumFractionDigits:6})+' Stk.')+' × '+eur(x.p):''}</div><div class="s">${new Date(x.t).toLocaleDateString('de-DE',{day:'numeric',month:'short',year:'numeric'})}${x.fee?' · Gebühr '+V(eur(x.fee)):''}${x.type=='sell'&&x.real!=null?' · realisiert '+V((x.real>=0?'+':'−')+eur(Math.abs(x.real))):''}${since!=null&&x.type!='sell'?` · seitdem <b class="${since<0?'out':'in'}">${since>=0?'+':''}${since.toFixed(1).replace('.',',')} %</b>`:''}</div>${x.hist?'<span class="histb">nachgetragen</span>':''}${x.syn?'<span class="histb">aus Sparplan berechnet</span>':''}${x.ru?(()=>{const e=S.exp.find(q=>q.id==x.ru),p=e&&S.exp.find(q=>q.id==e.ruOf);return p?`<span class="histb">aus ${esc(p.n||p.c||'Einkauf')}</span>`:''})():''}</div><div class="v ${x.type=='sell'?'in':''}">${V((x.type=='sell'?'+':'−')+eur(txAmt(x)+(x.type=='sell'?-(x.fee||0):(x.fee||0))))}</div></${btn?'button':'div'}>`}
let posAnim='';const posOrder=()=>['__all',...depot().map(h=>h.id)];
function posDots(cur){const O=posOrder(),k=O.indexOf(cur);if(O.length<2)return '';return `<div class="pdots" aria-label="Karte ${k+1} von ${O.length}">${O.length>14?`<span>${k+1} / ${O.length}</span>`:O.map((id,j)=>`<i class="${j==k?'on':''} ${id=='__all'?'all':''}"></i>`).join('')}</div>`}
function posAllHtml(){const D=depot(),show=S.showWealth||depShow,V=x=>show?x:'•••';const val=posVal;
  const tot=D.reduce((s,h)=>s+val(h),0),inv=D.reduce((s,h)=>s+(h.inv||0),0),g=tot-inv,day=D.reduce((s,h)=>s+(h.prev&&h.price?(h.price-h.prev)*(h.qty||0):0),0),sg=v=>v>=0?'+':'−';
  const TX=[];D.forEach(h=>posEvents(h).forEach(x=>TX.push({h,x})));TX.sort((a,b)=>b.x.t-a.x.t);
  return `${appbar({title:'Depot gesamt',back:'posBack',noGear:true,stats:`<div class="hc-big"><span>${D.length} Positionen</span><div class="eyerow"><b>${V(eur(tot))}</b>${eyeBtn()}</div></div><div class="hc-line">heute ${V(sg(day)+eur0(Math.abs(day)))}</div>`})}
   <div class="poswrap ${posAnim}" id="posWrap">${posDots('__all')}
   <div class="pos-kpi k4"><div><span>Eingezahlt</span><b>${V(eur0(inv))}</b></div><div><span>Wert</span><b>${V(eur0(tot))}</b></div><div><span>Gewinn</span><b class="${g<0?'out':'in'}">${V(sg(g)+eur0(Math.abs(g)))}${inv?`<small>${g>=0?'+':''}${(g/inv*100).toFixed(1).replace('.',',')} %</small>`:''}</b></div><div><span>Heute</span><b class="${day<0?'out':'in'}">${V(sg(day)+eur0(Math.abs(day)))}</b></div></div>
   ${depPerfHtml(show)}
   <div class="sec"><div class="sh"><span>Transaktionen</span>${TX.length?`<span style="text-transform:none;color:var(--muted)">${TX.length}</span>`:''}</div><div class="group">${TX.slice(0,40).map(({h,x})=>txRow(h,x,V,!x.syn&&!x.ru,h.n||h.sym).replace('data-txo="1"',`data-txo="1" data-txi="${D.indexOf(h)}"`)).join('')||'<div class="empty">Noch keine Käufe oder Verkäufe erfasst.</div>'}</div></div>
   <div class="note" style="text-align:center">Wische nach links für die einzelnen Positionen.</div></div>`}
function posHtml(){if(posView=='__all')return posAllHtml();const D=depot(),i=D.findIndex(h=>h.id==posView),h=D[i];if(!h){posView=null;return depotHtml()}const show=S.showWealth||depShow,V=x=>show?x:'•••',t=DT[h.type]||DT.sonst;
  const k=hkey(h)+'|'+posRange,pts=PH[k]&&PH[k].pts,info=PINFO[hkey(h)]&&PINFO[hkey(h)].d;
  if(!PH[k]&&!PBUSY[k])posHist(h,posRange).then(()=>{if(posView==h.id&&!$('sheetRoot').innerHTML)render()});if(!info&&h.type!='robo'&&!PBUSY['i'+hkey(h)]&&!(PINFO['f'+hkey(h)]>Date.now()-6e5))posInfo(h).then(d=>{if(!d)PINFO['f'+hkey(h)]=Date.now();if(posView==h.id&&!$('sheetRoot').innerHTML)render()});
  const val=posVal(h),gain=val-(h.inv||0);
  const CH=innerWidth>=1000?{w:500,h:225}:innerWidth>=700?{w:400,h:180}:{h:200},mkLeg=()=>[['buy','Kauf'],['sell','Verkauf'],['plan','Sparplan'],['ru','Wechselgeld']].filter(([t])=>Object.values(M).some(L=>L.some(x=>txK(x)==t))).map(([t,n])=>`<span><i style="background:${TXL[t][2]}"></i>${n}</span>`).join('');let M={};
  let chart='<div class="chartbox"><div class="empty">'+(PH[k]&&PH[k].fail?'Kein Kursverlauf verfügbar.':h.type!='krypto'&&!syOn()?'Für den Kursverlauf brauchst du die Supabase-Funktion „kurse“.':'Kursverlauf wird geladen …')+'</div></div>';
  const TX=(h.tx||[]).slice().sort((a,b)=>a.t-b.t),canMine=+h.qty>0||TX.length>0;if(!canMine)posMode='kurs';
  if(pts&&pts.length>1){const n=Math.min(pts.length,240),st=Math.max(1,Math.ceil(pts.length/n)),P=pts.filter((_,j)=>j%st==0||j==pts.length-1),f=P[0][1],l=P[P.length-1][1],ch=(l/f-1)*100,hi=Math.max(...P.map(p=>p[1])),lo=Math.min(...P.map(p=>p[1]));
    const fd=tt=>{const d=new Date(tt);return posRange=='1d'?d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):posRange=='1w'?d.toLocaleDateString('de-DE',{weekday:'short'})+' '+d.getHours()+' h':d.toLocaleDateString('de-DE',{day:'numeric',month:'short',year:posRange=='5y'||posRange=='1y'?'2-digit':undefined})};
    if(posMode=='mein'){const B0=posBase(h),k0=P.findIndex(p=>{if(posRange=='1d'||posRange=='1w')return posAt(h,B0,p[0]).q>0;const d=new Date(p[0]);d.setHours(23,59,59,0);return posAt(h,B0,d.getTime()).q>0});if(k0>0&&k0<P.length-1)P.splice(0,k0)}
    const lab=[0,Math.floor(P.length/2),P.length-1].map(j=>({i:j,t:fd(P[j][0])})),intra=posRange=='1d'||posRange=='1w',tEnd=t=>{if(intra)return t;const d=new Date(t);d.setHours(23,59,59,0);return d.getTime()};
    const B=posBase(h),AT=P.map(p=>posAt(h,B,tEnd(p[0]))),mine=posMode=='mein',vals=AT.map((a,j)=>a.q*P[j][1]),invs=AT.map(a=>a.iv);
    const span=P.length>1?(P[P.length-1][0]-P[0][0])/(P.length-1):864e5;M={};TX.forEach(x=>{if(x.t<P[0][0]-span||x.t>P[P.length-1][0]+864e5)return;let bj=P.findIndex(p=>tEnd(p[0])>=x.t);if(bj<0)bj=P.length-1;(M[bj]=M[bj]||[]).push(x)});
    const marks=Object.entries(M).map(([j,L])=>{const ty=new Set(L.map(txK)),col=ty.size>1?'var(--accent)':TXL[txK(L[0])][2];return{i:+j,v:mine?vals[j]:P[j][1],col,n:L.length,r:ty.size==1&&ty.has('plan')?3.5:5}});
    const tipAdd=j=>M[j]?`<span class="tr" style="color:var(--accent)">${M[j].map(x=>(TXL[txK(x)]||TXL.buy)[0]+' '+V(eur(txAmt(x)))).join(' · ')}</span>`:'';
    const pick=j0=>{const el=$('posSel');if(!el)return;const tol=Math.max(2,Math.round(P.length*.04));let j=null,bd=1e9;Object.keys(M).forEach(k=>{const d=Math.abs(+k-j0);if(d<=tol&&d<bd){bd=d;j=+k}});if(j==null)return;el.innerHTML=M[j]?`<div class="mmcard possel"><div class="sh" style="padding:8px 12px 0;display:flex;justify-content:space-between"><span>${new Date(M[j][0].t).toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'})}</span><button class="link" id="posSelX">schließen</button></div><div class="group" style="margin:0">${M[j].map(x=>txRow(h,x,V,true)).join('')}</div></div>`:'';if($('posSelX'))$('posSelX').onclick=()=>{el.innerHTML='';tcHide()};el.querySelectorAll('[data-txo]').forEach(b=>b.onclick=()=>{const x=(h.tx||[]).find(q=>q.id==b.dataset.tid);if(x&&x.hist)openBackfill(i,x.id);else openDep(i)})};
    const TLab=j=>new Date(P[j][0]).toLocaleString('de-DE',{weekday:'short',day:'numeric',month:'short',year:'2-digit',hour:intra?'2-digit':undefined,minute:intra?'2-digit':undefined});
    if(mine&&!show)chart=`<div class="chartbox"><div class="empty">Dein Vermögen ist ausgeblendet. Tippe oben auf das Auge, um deinen Anteil zu sehen.</div></div>`;
    else if(mine){const v0=vals[0],v1=vals[vals.length-1],i0=invs[0],i1=invs[invs.length-1],g=v1-i1,dz=(v1-v0)-(i1-i0),up=g>=0;
      chart=`<div class="pos-kpi k4"><div><span>Eingezahlt</span><b>${eur0(i1)}</b></div><div><span>Wert</span><b>${eur0(v1)}</b></div><div><span>Gewinn</span><b class="${up?'in':'out'}">${up?'+':'−'}${eur0(Math.abs(g))}${i1?`<small> ${up?'+':''}${(g/i1*100).toFixed(1).replace('.',',')} %</small>`:''}</b></div><div><span>${PRL[posRange]}</span><b class="${dz<0?'out':'in'}">${dz>=0?'+':'−'}${eur0(Math.abs(dz))}</b></div></div>
       <div class="chartbox">${lineChart({n:P.length,series:[{pts:invs,col:'var(--muted)',dash:'4 3',w:1.6,name:'Eingezahlt'},{pts:vals,col:up?'var(--ok)':'var(--bad)',area:true,dot:true,name:'Mein Wert'}],labels:lab,...CH,tipLab:TLab,marks,pick,tipAdd,fit:true})}
       <div class="legend" style="justify-content:center;margin-top:6px"><span><i style="background:${up?'var(--ok)':'var(--bad)'}"></i>Mein Wert</span><span><i style="background:var(--muted)"></i>Eingezahlt</span>${posEvents(h).some(x=>x.syn)?'<span><i style="background:transparent;border:1.5px dashed var(--muted)"></i>Stufe ohne Punkt = errechnete Sparrate</span>':''}${mkLeg()}</div></div>`}
    else chart=`<div class="pos-kpi"><div><span>Veränderung · ${PRL[posRange]}</span><b class="${ch<0?'out':'in'}">${ch>=0?'+':''}${ch.toFixed(2).replace('.',',')} %</b></div><div><span>Hoch</span><b>${eur(hi)}</b></div><div><span>Tief</span><b>${eur(lo)}</b></div></div>
     <div class="chartbox">${lineChart({n:P.length,series:[{pts:P.map(p=>p[1]),col:ch<0?'var(--bad)':'var(--ok)',area:true,dot:true,name:'Kurs'}],labels:lab,...CH,tipLab:TLab,marks,pick,tipAdd,fit:true})}<div class="legend" style="justify-content:center;margin-top:6px"><span><i style="background:${ch<0?'var(--bad)':'var(--ok)'}"></i>Kurs</span>${mkLeg()}</div>${marks.length?'<div class="note" style="text-align:center;padding:4px 0 0">Punkte antippen für Details</div>':''}</div>`}
  const modeSeg=canMine?`<div class="seg" id="posMode" style="margin-bottom:8px"><button class="${posMode=='kurs'?'on':''}" data-pm="kurs">Kurs</button><button class="${posMode=='mein'?'on':''}" data-pm="mein">Mein Wert</button></div>`:'';
  const TXE=posEvents(h);const txSec=true?`<div class="sec"><div class="sh"><span>Transaktionen${TXE.length?' · '+TXE.length:''}</span><button class="link" id="posHist">+ Nachtragen</button></div><div class="group">${TXE.slice().reverse().slice(0,40).map(x=>txRow(h,x,V,!x.syn&&!x.ru)).join('')||'<div class="empty">Noch keine Käufe, Verkäufe oder Sparplan-Ausführungen.</div>'}</div><div class="note">Mit „Nachtragen“ erfasst du frühere Käufe, Verkäufe und Sparraten für Chart und Verlauf. Stück, Investiert und Depotwert bleiben dabei unverändert.${h.rate&&!TX.some(x=>x.type=='plan')?' Neue Sparplan-Ausführungen werden automatisch erfasst.':''}</div></div>`:'';
  let inf='';if(h.type=='robo')inf='<div class="note">Für ein Robo-Depot gibt es keine eigenen Basisdaten. Der Verlauf ist über den hinterlegten Vergleichs-ETF geschätzt.</div>';
  else if(!info)inf=`<div class="mmcard"><div class="srow" style="color:var(--muted)">${h.type!='krypto'&&!syOn()?'Für Basisdaten brauchst du die Supabase-Funktion „kurse“.':PINFO['f'+hkey(h)]?'Basisdaten konnten nicht geladen werden.':'Basisdaten werden geladen …'}</div></div>`;
  else if(info.kind=='old'||info.kind=='none')inf=`<div class="mmcard"><div class="srow" style="color:var(--muted)">${info.kind=='old'?'Für Basisdaten und Analysten-Einschätzungen bitte die Funktion „kurse“ mit dem neuesten Code aktualisieren (Knopf unten im Depot).':'Zu diesem Wert wurden keine Basisdaten gefunden.'}</div></div>`;
  else if(info.kind=='krypto')inf=`<div class="sec"><div class="sh">Basisdaten</div><div class="mmcard"><div class="ana-flow"><span>Rang nach Marktkapitalisierung</span><b>${info.rank?'#'+(+info.rank):'–'}</b><span>Marktkapitalisierung</span><b>${fmtBig(info.mcap)} €</b><span>Allzeithoch</span><b>${info.ath?eur(info.ath):'–'}${info.athDate?' <small>('+new Date(info.athDate).toLocaleDateString('de-DE',{month:'short',year:'numeric'})+')</small>':''}</b><span>Im Umlauf</span><b>${fmtBig(info.supply)}${info.max?' von '+fmtBig(info.max):''}</b>${info.cats.length?`<span>Kategorie</span><b>${info.cats.map(esc).join(', ')}</b>`:''}</div>${info.summary?`<details class="pos-sum"><summary>Wofür ist ${esc(info.name)} da?</summary><p>${esc(info.summary.slice(0,1800))}${info.summary.length>1800?' …':''}</p>${info.lang=='en'?'<p class="a-s">Beschreibung von CoinGecko, nur auf Englisch verfügbar.</p>':''}</details>`:''}</div></div>
    <div class="sec"><div class="sh">Prognosen & Einschätzungen</div><div class="mmcard"><div class="srow" style="color:var(--muted);font-size:13px">Für Kryptowährungen gibt es keine Kursziele oder Kauf-/Verkaufsempfehlungen von Banken und Brokern. Kursprognosen im Internet sind meist Spekulation.</div></div></div>`;
  else{const isFund=/ETF|MUTUALFUND/i.test(info.type)||h.type=='etf',tr=info.trend,tot=tr?(tr.strongBuy+tr.buy+tr.hold+tr.sell+tr.strongSell):0,cur=info.currency||'',fm=v=>v==null?'–':(+v).toLocaleString('de-DE',{maximumFractionDigits:2})+' '+esc(cur);
    inf=`<div class="sec"><div class="sh">Basisdaten</div><div class="mmcard"><div class="ana-flow">${info.name?`<span>Name</span><b>${esc(info.name)}</b>`:''}${info.family?`<span>Anbieter</span><b>${esc(info.family)}</b>`:''}${info.category?`<span>Kategorie</span><b>${esc(info.category)}</b>`:''}${info.ter!=null?`<span>Kosten (TER)</span><b>${(info.ter*100).toFixed(2).replace('.',',')} % p. a.</b>`:''}${info.assets?`<span>Fondsvolumen</span><b>${fmtBig(info.assets)} ${esc(cur)}</b>`:''}${info.sector?`<span>Branche</span><b>${esc(info.sector)}${info.industry?' · '+esc(info.industry):''}</b>`:''}${info.country?`<span>Land</span><b>${esc(info.country)}</b>`:''}${info.mcap?`<span>Börsenwert</span><b>${fmtBig(info.mcap)} ${esc(cur)}</b>`:''}${info.pe?`<span>KGV</span><b>${info.pe.toFixed(1).replace('.',',')}</b>`:''}${info.div?`<span>Dividendenrendite</span><b>${(info.div*100).toFixed(2).replace('.',',')} %</b>`:''}${info.stockPos!=null?`<span>Aktienanteil</span><b>${Math.round(info.stockPos*100)} %</b>`:''}</div>
      ${info.summary?`<details class="pos-sum"><summary>${isFund?'Was steckt in diesem Fonds?':'Was macht das Unternehmen?'}</summary><p>${esc(info.summary.slice(0,1800))}</p><p class="a-s">Beschreibung von Yahoo Finance, meist auf Englisch.</p></details>`:''}</div></div>
     ${info.holdings&&info.holdings.length?`<div class="sec"><div class="sh">Größte Positionen</div><div class="mmcard">${info.holdings.map(x=>`<div class="srow"><div class="srow-h"><span>${esc(x.n)}</span><span></span><b>${x.p!=null?(x.p*100).toFixed(1).replace('.',',')+' %':''}</b></div><div class="bar" style="height:5px"><i style="width:${Math.min(100,(x.p||0)/(info.holdings[0].p||1)*100).toFixed(0)}%;background:var(--accent)"></i></div></div>`).join('')}</div></div>`:''}
     ${info.sectors&&info.sectors.length?`<div class="sec"><div class="sh">Branchen</div><div class="mmcard">${info.sectors.slice(0,8).map(x=>`<div class="srow"><div class="srow-h"><span>${esc(SECDE[x.n]||x.n)}</span><span></span><b>${(x.p*100).toFixed(1).replace('.',',')} %</b></div><div class="bar" style="height:5px"><i style="width:${Math.min(100,x.p*100/(info.sectors[0].p||1)).toFixed(0)}%;background:var(--blue)"></i></div></div>`).join('')}</div></div>`:''}
     <div class="sec"><div class="sh">Prognosen & Einschätzungen</div><div class="mmcard">${info.target&&info.target.mean?`<div class="srow"><div class="srow-h"><span>Kursziel Ø ${info.target.n?`<small style="color:var(--muted)">${esc(info.target.n)} Analysten</small>`:''}</span><span></span><b>${fm(info.target.mean)}</b></div>
       <div class="tgt"><span>${fm(info.target.lo)}</span><div><i style="left:${info.price&&info.target.hi>info.target.lo?Math.max(0,Math.min(100,(info.price-info.target.lo)/(info.target.hi-info.target.lo)*100)):50}%" title="aktuell"></i><em style="left:${info.target.hi>info.target.lo?Math.max(0,Math.min(100,(info.target.mean-info.target.lo)/(info.target.hi-info.target.lo)*100)):50}%"></em></div><span>${fm(info.target.hi)}</span></div>
       <div class="a-s" style="padding:0 0 4px">Aktuell ${fm(info.price)} · Potenzial bis Ø-Ziel ${info.price?((info.target.mean/info.price-1)*100>=0?'+':'')+((info.target.mean/info.price-1)*100).toFixed(1).replace('.',',')+' %':'–'}</div></div>`:''}
       ${info.reco&&info.reco!='none'||tot?`<div class="srow"><div class="srow-h"><span>Einschätzung</span><span></span><b style="color:${(RECO[info.reco]||RECO.none)[1]}">${(RECO[info.reco]||RECO.none)[0]}</b></div>${tot?`<div class="reco-bar">${[['strongBuy','Stark kaufen','#1F9D6B'],['buy','Kaufen','#3CCB92'],['hold','Halten','#F0A12D'],['sell','Verkaufen','#F0657A'],['strongSell','Stark verkaufen','#C4314B']].map(([kk,l,c])=>tr[kk]?`<i style="flex:${tr[kk]};background:${c}" title="${l}: ${+tr[kk]}"></i>`:'').join('')}</div><div class="a-s">${[['strongBuy','Stark kaufen'],['buy','Kaufen'],['hold','Halten'],['sell','Verkaufen'],['strongSell','Stark verkaufen']].filter(([kk])=>tr[kk]).map(([kk,l])=>l+' '+tr[kk]).join(' · ')}</div>`:''}</div>`:''}
       ${!(info.target&&info.target.mean)&&!(info.reco&&info.reco!='none')&&!tot?`<div class="srow" style="color:var(--muted);font-size:13px">${isFund?'Für ETFs gibt es keine Kursziele oder Kauf-/Verkaufsempfehlungen von Analysten, da sie einen Index abbilden. Entscheidend sind Kosten, Streuung und dein Anlagehorizont.':'Für diesen Wert liegen keine Analysten-Einschätzungen vor.'}</div>`:''}</div>
      <div class="note">Daten von Yahoo Finance, Stand ${new Date(PINFO[hkey(h)].t).toLocaleDateString('de-DE')}. Analysten-Einschätzungen sind keine Anlageberatung und liegen oft daneben.</div></div>`}
  const head=`${appbar({title:esc(h.n||h.sym),back:'posBack',noGear:true,right:`<button class="hc-ic" id="posEdit" aria-label="Bearbeiten">${I('pen',18)}</button>`,stats:`<div class="hc-big"><span>${t[0]} · ${esc(h.ysym||h.sym||'')}</span><div class="eyerow"><b>${h.price?eur(h.price):'–'}</b>${eyeBtn()}</div></div><div class="hc-line">${h.prev&&h.price?((h.price/h.prev-1)*100>=0?'+':'')+((h.price/h.prev-1)*100).toFixed(2).replace('.',',')+(h.type=='krypto'?' % in 24 h · ':' % heute · ')+(h.pt?'Kurs von '+kWhen(h.qt||h.pt)+' · ':''):''}Bestand ${V(eur(val))}${h.inv?' · '+V((gain>=0?'+':'−')+eur0(Math.abs(gain))):''}</div>`})}`,kpiCard=`<div class="mmcard"><div class="ana-flow"><span>Stück</span><b>${V((+h.qty||0).toLocaleString('de-DE',{maximumFractionDigits:6}))}</b><span>Ø Kaufpreis</span><b>${h.inv&&h.qty?V(eur(h.inv/h.qty)):'–'}</b><span>Investiert</span><b>${V(eur(h.inv||0))}</b>${h.rate?`<span>Sparplan</span><b>${V(eur(h.rate))} am ${h.day||1}.${(r=>r&&recAdjNext(r)?`<br><span class="adjb">${I('pen',10)} ${esc(recAdjNext(r))}</span>`:'')(h.rid&&(S.rec||[]).find(r=>r.id==h.rid))}</b>`:''}${h.real?`<span>Realisiert</span><b class="${h.real<0?'out':'in'}">${V((h.real>=0?'+':'−')+eur(Math.abs(h.real)))}</b>`:''}</div>
    <div class="cell plain pos-trade" style="gap:8px"><button class="btn soft" id="posBuy" style="flex:1;margin:0">+ Kauf</button><button class="btn soft" id="posSell" style="flex:1;margin:0" ${+h.qty>0?'':'disabled'}>− Verkauf</button></div></div>`;
  if(innerWidth>=700)return `<div class="poswrap pos2 ${posAnim}" id="posWrap"><div class="pos2-l">${head}${kpiCard}${inf}</div><div class="pos2-r">${posDots(h.id)}
   <div class="seg rgseg" id="posRg">${Object.entries(PR).map(([kk,v])=>`<button class="${posRange==kk?'on':''}" data-pr="${kk}">${v[0]}</button>`).join('')}</div>
   ${modeSeg}${chart}<div id="posSel"></div>
   ${txSec}</div></div>`;
  return `${head}
   <div class="poswrap ${posAnim}" id="posWrap">${posDots(h.id)}
   <div class="seg rgseg" id="posRg">${Object.entries(PR).map(([kk,v])=>`<button class="${posRange==kk?'on':''}" data-pr="${kk}">${v[0]}</button>`).join('')}</div>
   ${modeSeg}${chart}<div id="posSel"></div>
   ${kpiCard}
   ${txSec}
   ${inf}</div>`}
function kWhen(t){if(!t)return 'unbekannt';const d=new Date(t),t0=new Date();t0.setHours(0,0,0,0);const hm=d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});return d>=t0?'heute, '+hm:d>=t0.getTime()-864e5?'gestern, '+hm:d.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'})+', '+hm}
function lastTradeDay(){const d=new Date();if(d.getHours()<10)d.setDate(d.getDate()-1);while(d.getDay()==0||d.getDay()==6)d.setDate(d.getDate()-1);d.setHours(0,0,0,0);return d.getTime()}
function kStale(h){if(h.manual||!h.price)return false;const t=h.qt||h.pt||0;if(h.type=='krypto')return Date.now()-t>864e5;return t<lastTradeDay()}
function kStamp(){const P=depot().filter(h=>!h.manual&&h.pt);if(!P.length)return '';const t=Math.max(...P.map(h=>h.pt)),st=P.filter(kStale).length;return 'Kurse von '+kWhen(t)+(st?' · '+st+' veraltet':'')}
function depotHtml(){const D=depot(),V=x=>S.showWealth||depShow?x:'•••';
  /* v231: bei Sichtschutz keine Seite voller ••• – nur ein Knopf zum Einblenden */
  if(D.length&&!(S.showWealth||depShow))return `<div class="mmcard" style="text-align:center;padding:28px 16px"><div style="font-size:15px;font-weight:600">Vermögen ist ausgeblendet</div><div class="s" style="color:var(--muted);font-size:13px;margin:6px 0 14px">Sichtschutz aktiv. Die Werte erscheinen erst nach dem Einblenden.</div><button class="btn soft" data-eye="1">${I('eye',16)} Einblenden</button></div>`;
  const val=posVal,tot=D.reduce((s,h)=>s+val(h),0),inv=D.reduce((s,h)=>s+(h.inv||0),0),g=tot-inv,mon=D.reduce((s,h)=>s+(h.paused?0:(h.rate||0)),0),day=D.reduce((s,h)=>s+(h.prev&&h.price?(h.price-h.prev)*(h.qty||0):0),0);
  const byT={};D.forEach(h=>byT[h.type]=(byT[h.type]||0)+val(h));const parts=Object.entries(byT).filter(x=>x[1]>0).map(([t,v])=>({k:(DT[t]||DT.sonst)[0],v,col:(DT[t]||DT.sonst)[1]}));
  const pc=(a,b)=>b?((a-b)/b*100):0,sg=v=>v>0?'+':'';
  if(!D.length)return `${vaultSecHtml(S.showWealth||depShow)}<div class="mmcard"><div class="srow" style="padding:18px"><b style="font-size:17px">Dein Depot</b><div class="s" style="color:var(--muted);font-size:14px;margin-top:6px">Trag hier deine ETFs, Aktien und Kryptowährungen ein. Kryptokurse kommen automatisch, ETF- und Aktienkurse mit einem kleinen Zusatz in Supabase oder von Hand.</div></div></div><button class="btn" id="depAdd">${I('plus',16)} Erste Position anlegen</button>${depSetupHtml()}`;
  const vc=vaultCash().reduce((s,n)=>s+calc(n).rest,0);
  return `<div class="wtot" id="wtotAll" role="button" tabindex="0"><span>Gesamtvermögen</span><div class="eyerow"><b>${V(eur0(tot+vc))}</b>${eyeBtn()}</div><small>Depot ${V(eur0(tot))} · Sparkonten ${V(eur0(vc))} · <span class="lnk">Depot-Karten ›</span></small></div><div class="pos-kpi k4" style="grid-column:1/-1"><div><span>Depotwert</span><b>${V(eur0(tot))}</b></div><div><span>Gewinn</span><b class="${g<0?'out':'in'}">${V(sg(g)+eur0(g))}${inv?`<small>${sg(g)}${pc(tot,inv).toFixed(1).replace('.',',')} %</small>`:''}</b></div><div><span>Heute</span><b class="${day<0?'out':'in'}">${V(sg(day)+eur0(day))}</b></div><div><span>Monatlich</span><b>${V(eur0(mon))}</b></div></div>
   <div class="note" style="padding:0 4px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>${esc(depBusy?depMsg:(kStamp()+(/ohne automatischen/.test(depMsg||'')?' · '+depMsg.split(' · ').pop():'')))}</span><button class="ed-link" id="depRef" style="color:var(--accent)">${I('repeat',13)} Neu laden</button></div>
   ${depPerfHtml(S.showWealth||depShow)}
   ${vaultSecHtml(S.showWealth||depShow)}
   <div class="sec"><div class="sh">Aufteilung</div><div class="chartbox">${parts.length&&(S.showWealth||depShow)?donut(parts).replace('>Ausgaben<','>Depot<'):`<div class="ana-flow">${Object.keys(byT).map(t=>`<span>${(DT[t]||DT.sonst)[0]}</span><b>${tot?Math.round(byT[t]/tot*100):0} %</b>`).join('')}</div>`}
    <div class="legend" style="justify-content:center;margin-top:8px">${parts.map(p=>`<span><i style="background:${p.col}"></i>${p.k} ${tot?Math.round(p.v/tot*100):0} %</span>`).join('')}</div></div></div>
   <div class="sec"><div class="sh">Sparpläne</div><div class="mmcard">${D.map((h,i)=>({h,i})).filter(x=>x.h.rate).map(({h,i})=>{const t=DT[h.type]||DT.sonst,lk=h.rid&&(S.rec||[]).some(r=>r.id==h.rid);return `<button class="spl" data-dep="${i}"><span class="ico" style="background:color-mix(in srgb,${t[1]} 16%,transparent);color:${t[1]}">${I(t[2],18)}</span><span class="spl-t"><b>${esc(h.n||h.sym)}</b><small>${t[0]} · am ${h.day||1}.${lk?' · '+I('repeat',11)+' von '+esc(SHORT[h.from]||h.from||''):' · nicht verknüpft'}${h.paused?' · pausiert':''}${(r=>r&&recAdjNext(r)?`<br><span class="adjb">${I('pen',10)} ${esc(recAdjNext(r))}</span>`:'')(lk&&S.rec.find(r=>r.id==h.rid))}</small></span><span class="spl-v" ${h.paused?'style="opacity:.5"':''}><b>${V(eur(h.rate))}</b><small>${h.paused?'pausiert':mon?Math.round(h.rate/mon*100)+' %':''}</small></span></button>`}).join('')||'<div class="srow"><span style="color:var(--muted);font-size:13px">Noch keine Sparrate eingetragen.</span></div>'}
    ${mon?`<div class="spl-sum"><span><b>Pro Monat</b><small>${V(eur0(mon*12))} im Jahr</small></span><b>${V(eur(mon))}</b></div>`:''}</div></div>
   <div class="sec" style="grid-column:1/-1"><div class="sh"><span>Positionen</span><button class="link" id="depAdd">+ Position</button></div><div class="mmcard">${D.map((h,i)=>{const v=val(h),gg=v-(h.inv||0),d=h.prev&&h.price?pc(h.price,h.prev):null;return `<button class="dep" data-dep="${i}"><span class="ico" style="background:color-mix(in srgb,${(DT[h.type]||DT.sonst)[1]} 15%,transparent);color:${(DT[h.type]||DT.sonst)[1]}">${I((DT[h.type]||DT.sonst)[2],18)}</span>
     <span class="t"><b>${esc(h.n||h.sym)}</b><small>${(DT[h.type]||DT.sonst)[0]} · ${esc(h.ysym||h.sym||'')}${h.type=='robo'?' · geschätzt über '+esc(h.ysym||h.sym||'Index'):h.qty?' · '+V((+h.qty).toLocaleString('de-DE',{maximumFractionDigits:6})+' Stk.'):''}${h.bd?' · '+(h.bd=='pre'?'vor '+new Date().getFullYear():'seit '+new Date(h.bd+'T12:00').toLocaleDateString('de-DE',{month:'short',year:'numeric'})):''}${h.qty&&h.inv&&h.type!='robo'?' · Ø '+V(eur(h.inv/h.qty))+((h.cur||'EUR')!='EUR'&&h.avg?' (gekauft in '+h.cur+')':''):''}</small></span>
     <span class="dep-k">${h.type=='robo'?`<span style="font-size:13px;color:var(--muted)">Indexschätzung</span>`:h.price?eur(h.price):`<i style="color:var(--bad)">kein Kurs</i>`}<small class="${d<0?'out':d>0?'in':''}">${d!=null?sg(d)+d.toFixed(2).replace('.',',')+(h.type=='krypto'?' % in 24 h':' % heute')+(h.type!='krypto'&&Math.abs(d)>15?' ⚠︎':'')+(kStale(h)?' <span class="kst" title="'+kWhen(h.qt||h.pt)+'">◷</span>':''):h.manual?'von Hand':!h.price?(h.nofound?'Kürzel nicht gefunden':'noch nicht geladen'):h.pt?'':'–'}</small></span>
     <span class="dep-v"><b>${V(eur(v))}</b><small class="${gg<0?'out':'in'}">${!h.price?'<span style="color:var(--muted)">Wert zum Kaufpreis</span>':h.inv?V(sg(gg)+eur0(gg))+' · '+sg(gg)+pc(v,h.inv).toFixed(1).replace('.',',')+' %':''}</small></span></button>`}).join('')}</div>
    <div class="note">Kurse in Euro. Krypto über Coinbase/CoinGecko, ETFs und Aktien über deine Supabase-Funktion. Sparpläne werden zum aktuellen Kurs fortgeschrieben, die Stückzahl ist daher ein Näherungswert. Gleiche sie ab und zu mit deinem Depot ab.</div></div>
   ${S.kursFn&&!S.kursFnOld?'':depSetupHtml()}
   <div class="sec" style="grid-column:1/-1"><div class="sh">Altersvorsorge</div>${penCard(V)}</div>`}
let NEWSDIAG=(()=>{try{return JSON.parse(localStorage.getItem('cf_newsdiag')||'null')}catch(e){return null}})(),NEWS=null,newsBusy=false,newsMsg='',newsAll=false;try{NEWS=JSON.parse(localStorage.getItem('cf_news')||'null')}catch(e){}
const nWords=t=>new Set(String(t||'').toLowerCase().replace(/[^a-z0-9äöüß ]+/g,' ').split(/\s+/).filter(w=>w.length>2&&!/^(the|and|for|with|from|this|that|der|die|das|und|mit|für|von|auf|ist|des|den|dem|eine|einer|ein|its|are|was|has|have|will|stock|stocks|aktie|aktien)$/.test(w)));
const CRN={BTC:'Bitcoin',ETH:'Ethereum',SOL:'Solana',XRP:'XRP Ripple',ADA:'Cardano',DOGE:'Dogecoin',DOT:'Polkadot',LINK:'Chainlink',AVAX:'Avalanche',LTC:'Litecoin',MATIC:'Polygon',POL:'Polygon',BNB:'BNB',TRX:'Tron',SHIB:'Shiba Inu',ATOM:'Cosmos',XLM:'Stellar',SUI:'Sui',TON:'Toncoin'};
function newsG(h){if(h.type=='krypto'){const k=h.sym.trim().toUpperCase();return (CRN[k]||h.n||k)+' Kurs'}let n=String(h.n||h.sym||'').replace(/\b(UCITS|ETF|EUR|USD|Acc|Dist|Inc|\(Acc\)|\(Dist\)|Shares|Class|plc|SE|AG|Inc\.?|Corp\.?|Ltd\.?|N\.V\.|S\.A\.)\b/gi,' ').replace(/\s+/g,' ').trim();
  if(h.type=='etf'){const R=[[/semicond|halbleiter/i,'Halbleiter Aktien'],[/all country|acwi/i,'MSCI ACWI'],[/msci world/i,'MSCI World'],[/emerging/i,'Emerging Markets Aktien'],[/s&p ?500/i,'S&P 500'],[/nasdaq/i,'Nasdaq 100'],[/euro ?stoxx ?50/i,'Euro Stoxx 50'],[/stoxx europe 600|europe/i,'Europäische Aktien'],[/dax/i,'DAX'],[/ftse all-world|all-world/i,'Weltaktien'],[/dividend/i,'Dividenden Aktien'],[/clean energy/i,'Clean Energy Aktien'],[/robot|automation/i,'Robotik Aktien'],[/gold/i,'Goldpreis']];const m=R.find(([r])=>r.test(n));return m?m[1]:n}return n+' Aktie'}
function newsTerms(){return depot().filter(h=>h.type!='robo'&&h.sym).map(h=>({h,q:h.type=='krypto'?h.sym.trim().toUpperCase()+'-USD':(h.ysym||h.sym).trim().toUpperCase(),g:newsG(h)}))}
function newsClean(raw){const T=newsTerms(),byQ={};T.forEach(x=>{(byQ[x.q]=byQ[x.q]||[]).push(x.h.n||x.h.sym)});const cut=Date.now()-7*864e5,out=[];
  raw.filter(n=>n&&n.t&&n.u&&n.ts>=cut).sort((a,b)=>a.ts-b.ts).forEach(n=>{const w=nWords(n.t),u=n.u.split('?')[0];
    const dup=out.find(o=>o.id==n.id||o.u0==u||(()=>{let c=0;w.forEach(x=>{if(o.w.has(x))c++});return c/Math.max(1,Math.min(w.size,o.w.size))>=.6&&c>=3})());
    const tags=byQ[n.q]||[];if(dup){tags.forEach(t=>{if(!dup.tags.includes(t))dup.tags.push(t)});if(!dup.src.includes(n.p))dup.src.push(n.p);return}
    out.push({id:n.id,t:n.t,p:n.p,u:n.u,u0:u,ts:n.ts,w,tags:[...tags],src:[n.p]})});
  out.forEach(o=>{const age=(Date.now()-o.ts)/36e5;o.score=o.src.length*2+o.tags.length*1.5-Math.min(age,168)/24});
  const top=out.slice().sort((a,b)=>b.score-a.score).slice(0,3).filter(o=>o.src.length>1||o.tags.length>1),ids=new Set(top.map(o=>o.id));
  return{top,rest:out.filter(o=>!ids.has(o.id)).sort((a,b)=>b.ts-a.ts)}}
async function newsLoad(force){const T=newsTerms();if(!T.length||newsBusy)return;if(!force&&NEWS&&Date.now()-NEWS.t<30*6e4&&NEWS.k==T.map(x=>x.q).join()+'|6'&&(NEWS.raw||[]).length)return;
  if(!syOn()){newsMsg='Für News brauchst du die Online-Synchronisierung mit der Funktion „kurse“.';return}
  newsBusy=true;newsMsg='';try{const r=await syFetch('/functions/v1/kurse',{method:'POST',body:JSON.stringify({news:T.filter((x,i)=>T.findIndex(y=>y.q==x.q)==i).map(x=>({q:x.q,y:/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(x.q)?'':x.q,g:x.g,w:String(x.h.n||'').split(/\s+/).filter(w=>w.length>3&&!/^(ucits|etf|acc|dist|inc|msci|shares|global|world)$/i.test(w)).slice(0,2)}))})});const j=r.ok?await r.json():{};
    if(Array.isArray(j.__news)&&(j.v||0)>=6){S.newsFnOld=false;NEWSDIAG=j.diag||null;if(!j.__news.length)newsMsg='Die Funktion hat keine Meldungen gefunden ('+Object.entries(j.diag||{}).filter(([k])=>!k.includes(':')).map(([k,v])=>k+': '+v).join(', ')+').';try{localStorage.setItem('cf_newsdiag',JSON.stringify(j.diag||{}))}catch(e){}NEWS={t:Date.now(),k:T.map(x=>x.q).join()+'|6',raw:j.__news.map(n=>({q:n.q,id:n.id,t:n.t,p:n.p,u:n.u,ts:n.ts}))};try{localStorage.setItem('cf_news',JSON.stringify(NEWS))}catch(e){}}
    else{S.newsFnOld=true;newsMsg=r.ok?'':'Die Funktion antwortet mit Fehler '+r.status+'.'}}catch(e){newsMsg='News konnten gerade nicht geladen werden ('+(e.message||e)+').'}newsBusy=false;if(tab=='rep'&&repV=='Vermögen'&&!$('sheetRoot').innerHTML)render()}
const agoTxt=ts=>{const m=Math.round((Date.now()-ts)/6e4);return m<60?'vor '+Math.max(1,m)+' Min.':m<1440?'vor '+Math.round(m/60)+' Std.':m<2880?'gestern':'vor '+Math.round(m/1440)+' Tagen'};
function newsHtml(){if(!newsTerms().length)return '';const C=NEWS?newsClean(NEWS.raw||[]):{top:[],rest:[]},all=[...C.top,...C.rest];
  const item=(o,big)=>`<a class="nws${big?' top':''}" href="${esc(o.u)}" target="_blank" rel="noopener noreferrer"><span class="nws-t">${esc(o.t)}</span><span class="nws-m">${o.tags.slice(0,3).map(t=>`<em>${esc(t.length>18?t.slice(0,17)+'…':t)}</em>`).join('')}<span>${esc(o.p||'')}${o.src.length>1?' +'+(o.src.length-1):''} · ${agoTxt(o.ts)}</span></span></a>`;
  const rest=newsAll?C.rest:C.rest.slice(0,8);
  return `<div class="sec" style="grid-column:1/-1"><div class="sh"><span>News zu deinen Werten</span><button class="link" id="newsRef">${newsBusy?'Lädt …':'Aktualisieren'}</button></div>
   ${S.newsFnOld?`<div class="note" style="padding:0 4px 8px">Für News muss die Funktion „kurse“ einmal aktualisiert werden: In Supabase › Edge Functions › kurse › Code den alten Code ersetzen und <b>Deploy</b> tippen. <button class="link" id="depFnCopy2">Neuen Code kopieren</button></div>`:''}
   ${newsMsg?`<div class="note" style="padding:0 4px 8px">${esc(newsMsg)}</div>`:''}
   ${all.length?`<div class="mmcard">${C.top.length?`<div class="nws-h">Wichtig</div>${C.top.map(o=>item(o,1)).join('')}${rest.length?'<div class="nws-h">Neueste</div>':''}`:''}${rest.map(o=>item(o)).join('')}</div>
   ${C.rest.length>8?`<button class="link" id="newsMore" style="display:block;margin:8px auto 0">${newsAll?'Weniger anzeigen':'Alle '+all.length+' Meldungen'}</button>`:''}
   ${NEWSDIAG?`<div class="note" style="padding:2px 4px 0">Treffer: ${newsTerms().filter((x,i,a)=>a.findIndex(y=>y.q==x.q)==i).map(x=>esc((x.h.n||x.q).slice(0,16))+' '+(typeof NEWSDIAG[x.q]=='number'?NEWSDIAG[x.q]:'–')).join(' · ')}</div>`:''}
   <div class="note">Letzte 7 Tage, gleiche Meldungen aus mehreren Quellen sind zusammengefasst (+n). Quellen: Google News (deutsch) und Yahoo Finance. ${NEWS?'Stand '+new Date(NEWS.t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+'.':''}</div>`
   :`<div class="mmcard"><div class="srow" style="color:var(--muted);font-size:13px">${newsBusy?'News werden geladen …':S.newsFnOld?'Noch keine News.':'Keine aktuellen Meldungen der letzten 7 Tage.'}</div></div>`}</div>`}
function depSetupHtml(){return `<div class="group" style="grid-column:1/-1"><button class="cell" data-gosetup="1"><div class="ico" style="background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)">${I('code')}</div><div class="t"><div>${S.kursFnOld?'Kursfunktion aktualisieren':'ETF- und Aktienkurse automatisch'}</div><div class="s">Einrichtung unter Mehr › Supabase-Einrichtung</div></div><span class="chev">›</span></button></div>`}
function depSetupHtmlFull(){return `<div class="sec" style="grid-column:1/-1"><button class="btn soft" data-gosetup="1" style="margin-bottom:8px">Zur Supabase-Einrichtung (alle Codes)</button><div class="sh">${S.kursFnOld?'Kursfunktion aktualisieren (für den Kursverlauf)':'ETF- und Aktienkurse automatisch (einmalig, 3 Minuten)'}</div>${S.kursFnOld?'<div class="note" style="padding:0 4px 6px">Deine Funktion „kurse“ ist von gestern. Für die Wertentwicklung bitte in Supabase die Funktion „kurse“ öffnen, den Code ersetzen und neu deployen.</div>':''}<div class="mmcard"><ol class="steps" style="padding:12px 14px 12px 32px;margin:0">
  <li>In Supabase links auf <b>Edge Functions</b> (Blitz-Symbol), dann <b>Deploy a new function</b> › <b>Via Editor</b>.</li>
  <li>Als Namen genau <b>kurse</b> eintragen.</li><li>Den Beispielcode im Editor komplett löschen, hier <b>Code kopieren</b> tippen und einfügen.</li><li>Unten rechts <b>Deploy function</b>. Fertig, hier dann „Kurse aktualisieren“.</li></ol>
  <div class="srow"><button class="btn soft" id="depFnCopy">Code kopieren</button><div class="s" style="font-size:12px;color:var(--muted)">${syOn()?'Funktioniert mit deinem Online-Sync-Konto.':'Dafür muss Online-Sync eingerichtet sein. Ohne trägst du Kurse von Hand ein.'}</div></div></div></div>`}
const CURS=['EUR','USD','GBP','CHF'];
const fxGet=c=>{if(c=='EUR')return 1;const x=(S.fx||{})[c];return x?x.r:null};
async function fxLoad(c){if(c=='EUR')return 1;const x=(S.fx||{})[c];if(x&&Date.now()-x.t<6*36e5)return x.r;let r=null;
  try{const j=await (await fetch('https://api.frankfurter.app/latest?from='+c+'&to=EUR')).json();r=j.rates&&j.rates.EUR}catch(e){}
  if(!r){try{const j=await (await fetch('https://api.coinbase.com/v2/exchange-rates?currency='+c)).json();r=+j.data.rates.EUR}catch(e){}}
  if(r){S.fx=S.fx||{};S.fx[c]={r,t:Date.now()};save()}return r||(x&&x.r)||null}
const qNum=s=>{s=String(s||'').trim().replace(/\s|€|\$/g,'');if(!s)return NaN;if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');else s=s.replace(',','.');return parseFloat(s)};
/* ---------- Kauf/Verkauf mit Kursvorschlag ---------- */
async function priceOn(h,ds){const t=new Date(ds+'T12:00').getTime(),isToday=ds==today();if(isToday&&h.price&&h.pt&&Date.now()-h.pt<6*36e5)return{p:h.price,at:Date.now(),live:true};
  const old=t<Date.now()-350*864e5,k=hk2(h,old?'f':'d');let x=HC[k];if(old&&!(x&&x.pts&&x.pts.length&&x.pts[0][0]<=t+8*864e5)){const d0=HC[hk2(h,'d')];if(d0&&d0.pts&&d0.pts.length&&d0.pts[0][0]<=t+864e5)x=d0}
  const covers=x&&x.pts&&x.pts.length&&x.pts[0][0]<=t+(old?8:1)*864e5;window.__pfail=window.__pfail||{};
  if(!covers&&!(window.__pfail[k]>Date.now()-6e5)){try{if(h.type=='krypto'){const pts=old?await cbDaily(String(h.sym).toUpperCase().trim(),1826):await cryptoHist(h.sym,'d');if(pts&&pts.length){x=HC[k]={t:Date.now(),pts};hcSave()}}else if(syOn()){const q=String(h.sym||'').trim().toUpperCase();const r=await syFetch('/functions/v1/kurse',{method:'POST',body:JSON.stringify({q:[q],hist:old?'f':'d'})});const j=r.ok?await r.json():{};const y=j[q];if(y&&y.hist&&y.hist.length){x=HC[k]={t:Date.now(),pts:y.hist};hcSave();if(y.symbol)h.ysym=y.symbol;if(isToday&&y.price)return{p:y.price,at:Date.now(),live:true}}}}catch(e){}if(!(x&&x.pts&&x.pts.length&&x.pts[0][0]<=t+(old?8:1)*864e5))window.__pfail[k]=Date.now()}
  if(!x||!x.pts||!x.pts.length)return isToday&&h.price?{p:h.price,at:h.pt||Date.now(),live:true}:null;if(x.pts[0][0]>t+(old?8:1)*864e5)return null;
  let best=null;for(const [tt,v] of x.pts){if(tt>t+(old?4*864e5:12*36e5))break;if(v!=null)best=[tt,v]}if(!best)return null;if(isToday&&h.price)return{p:h.price,at:Date.now(),live:true};return{p:best[1],at:best[0]}}
/* Nachtragen: frühere Käufe/Verkäufe/Sparraten nur für den Verlauf – Bestand, Investiert, Depotwert bleiben unverändert */
function openBackfill(i,editId){const D=depot(),h=D[i];if(!h)return;h.tx=h.tx||[];const ex=editId?h.tx.find(x=>x.id==editId):null;const yd=ymd(Date.now()-864e5);
  const st={type:ex?ex.type:'buy',ser:false,d:ex?ymd(ex.t):yd,q:ex?String(ex.q).replace('.',','):'',p:ex?String(ex.p).replace('.',','):'',a:ex&&ex.type=='plan'?String(txAmt(ex)).replace('.',','):'',fee:ex&&ex.fee?String(ex.fee).replace('.',','):'',from:ymd(Date.now()-365*864e5).slice(0,7),to:ymd(Date.now()-31*864e5).slice(0,7),day:String(h.day||1),ra:h.rate?String(h.rate).replace('.',','):''};
  let sug=null,busy=false,warn=null,prog='';
  const newBd=items=>{const first=Math.min(...items.map(x=>x.t));return h.bd&&h.bd!='pre'&&ymd(first)<h.bd?ymd(first):h.bd};
  const close=()=>{$('sheetRoot').innerHTML='';render()};
  const draw=()=>{const plan=st.type=='plan',ser=plan&&st.ser&&!ex;
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Nachtragen"><div class="sheet-h"><button id="bfX">Abbrechen</button><b>${ex?'Nachtrag bearbeiten':'Nachtragen'}</b><button id="bfS" style="font-weight:600" ${busy?'disabled':''}>Sichern</button></div>
   <div class="sheet-b"><div class="note" style="padding:0">${esc(h.n||h.sym)} · nur für Verlauf und Chart. <b>Stück, Investiert und Depotwert bleiben gleich</b>, es entsteht keine Buchung.</div>
   <div class="seg" id="bfK">${[['buy','Kauf'],['sell','Verkauf'],['plan','Sparrate']].map(([k,n])=>`<button class="${st.type==k?'on':''}" data-v="${k}">${n}</button>`).join('')}</div>
   ${plan&&!ex?`<div class="seg" id="bfM"><button class="${!st.ser?'on':''}" data-v="0">Einmal</button><button class="${st.ser?'on':''}" data-v="1">Monatlich (Zeitraum)</button></div>`:''}
   <div class="group">${ser?`<div class="cell plain"><label for="bfF">Von</label><input id="bfF" type="month" value="${st.from}" max="${ymd(Date.now()).slice(0,7)}" style="margin-left:auto"></div>
     <div class="cell plain"><label for="bfT">Bis</label><input id="bfT" type="month" value="${st.to}" max="${ymd(Date.now()).slice(0,7)}" style="margin-left:auto"></div>
     <div class="cell plain"><label for="bfDy">Ausführung am</label><input id="bfDy" inputmode="numeric" value="${esc(st.day)}" style="max-width:60px;text-align:right;margin-left:auto"><span>.</span></div>
     <div class="cell plain"><label for="bfR">Rate pro Monat</label><input id="bfR" inputmode="decimal" value="${esc(st.ra)}" placeholder="z. B. 30" style="max-width:120px;text-align:right;margin-left:auto"><span>€</span></div>`
    :`<div class="cell plain"><label for="bfD">Datum</label><input id="bfD" type="date" value="${st.d}" max="${today()}" style="margin-left:auto"></div>
     ${plan?`<div class="cell plain"><label for="bfA">Betrag</label><input id="bfA" inputmode="decimal" value="${esc(st.a)}" placeholder="z. B. 30" style="max-width:120px;text-align:right;margin-left:auto"><span>€</span></div>`
      :`<div class="cell plain"><label for="bfQ">Stück</label><input id="bfQ" inputmode="decimal" value="${esc(st.q)}" placeholder="z. B. 0,5" style="max-width:120px;text-align:right;margin-left:auto"></div>`}
     <div class="cell plain"><label for="bfP">Kurs pro Stück</label><input id="bfP" inputmode="decimal" value="${esc(st.p)}" placeholder="${busy?'lädt …':'€'}" style="max-width:120px;text-align:right;margin-left:auto"><span>€</span></div>
     <div class="cell plain" style="padding-top:0"><span class="s" style="font-size:12px;color:var(--muted);flex:1">${busy?'Suche Kurs für dieses Datum …':sug?`Vorschlag: <b>${eur(sug.p)}</b> (Schlusskurs ${new Date(sug.at).toLocaleDateString('de-DE')})`:'Kein Kurs gefunden – bitte selbst eintragen.'}</span>${sug&&qNum(st.p)!==Math.round(sug.p*100)/100?'<button class="chip" id="bfUse">Übernehmen</button>':''}</div>
     ${plan?'':`<div class="cell plain"><label for="bfFe">Gebühren</label><input id="bfFe" inputmode="decimal" value="${esc(st.fee)}" placeholder="0,00" style="max-width:120px;text-align:right;margin-left:auto"><span>€</span></div>`}`}</div>
   ${ser?'<div class="note" style="padding:0">Legt für jeden Monat im Zeitraum eine Sparrate mit dem Schlusskurs des Ausführungstags an. Monate, für die schon eine Sparrate erfasst ist, werden übersprungen.</div>':''}
   ${prog?`<div class="note" style="padding:0">${esc(prog)}</div>`:''}
   ${warn?`<div class="adjinfo" style="flex-direction:column;align-items:stretch"><span>${warn.msg}</span><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="chip" id="bfKeep">Trotzdem speichern</button><button class="chip" id="bfFix">Bestand anpassen</button></div></div>`:''}
   ${ex?'<button class="btn soft" id="bfDel" style="color:var(--bad)">Nachtrag löschen</button>':''}
   <div class="note" id="bfE" style="padding:0;color:var(--bad)"></div></div></div>`;
   const keep=()=>{['d:bfD','q:bfQ','p:bfP','a:bfA','fee:bfFe','from:bfF','to:bfT','day:bfDy','ra:bfR'].forEach(s=>{const[k,id]=s.split(':');if($(id))st[k]=$(id).value})};
   $('scrim').onclick=$('bfX').onclick=close;
   document.querySelectorAll('#bfK button').forEach(b=>b.onclick=()=>{keep();st.type=b.dataset.v;warn=null;draw()});
   document.querySelectorAll('#bfM button').forEach(b=>b.onclick=()=>{keep();st.ser=b.dataset.v=='1';warn=null;draw()});
   if($('bfD'))$('bfD').onchange=()=>{keep();fetchSug()};
   if($('bfUse'))$('bfUse').onclick=()=>{keep();st.p=String(Math.round(sug.p*100)/100).replace('.',',');draw()};
   if($('bfDel'))$('bfDel').onclick=()=>{const sn=JSON.stringify(h.tx);h.tx=h.tx.filter(x=>x.id!=ex.id);save();close();toast('Nachtrag gelöscht.',()=>{h.tx=JSON.parse(sn);save();render()})};
   if($('bfKeep'))$('bfKeep').onclick=()=>commit(warn.items,false);if($('bfFix'))$('bfFix').onclick=()=>commit(warn.items,true);
   $('bfS').onclick=()=>{keep();build()}};
  const fetchSug=async()=>{busy=true;sug=null;draw();let r=null;try{r=await priceOn(h,st.d)}catch(e){}busy=false;sug=r;if(r&&!st.p)st.p=String(Math.round(r.p*100)/100).replace('.',',');if(document.querySelector('[aria-label="Nachtragen"]'))draw()};
  const build=async()=>{const err=m=>{$('bfE').textContent=m};const items=[];
    if(st.type=='plan'&&st.ser&&!ex){const ra=qNum(st.ra),dy=Math.min(31,Math.max(1,parseInt(st.day)||1));if(!(ra>0))return err('Bitte die Rate pro Monat eintragen.');if(!st.from||!st.to||st.from>st.to)return err('Bitte einen gültigen Zeitraum wählen.');
      const has=new Set(h.tx.filter(x=>x.type=='plan'&&!x.ru).map(x=>ymd(x.t).slice(0,7)));const ms=[];let [y,m]=st.from.split('-').map(Number);for(;;){const k=y+'-'+String(m).padStart(2,'0');if(k>st.to)break;ms.push([y,m]);m++;if(m>12){m=1;y++}if(ms.length>240)break}
      busy=true;const miss=[];for(let j=0;j<ms.length;j++){const [yy,mm]=ms[j],ds=ymd(dueIn(yy,mm-1,dy).getTime());if(has.has(ds.slice(0,7))||ds>=today())continue;prog='Kurse laden … '+(j+1)+' / '+ms.length;draw();let r=null;try{r=await priceOn(h,ds)}catch(e){}if(!r){miss.push(ds.slice(0,7));continue}
        items.push({id:uid(),t:new Date(ds+'T12:00').getTime(),type:'plan',q:Math.round(ra/r.p*1e8)/1e8,p:Math.round(r.p*1e4)/1e4,fee:0,a:ra,hist:true})}busy=false;prog=miss.length?'Ohne Kurs übersprungen: '+miss.join(', '):'';
      if(!items.length){draw();return err('Keine neuen Monate zum Nachtragen gefunden.')}}
    else{const pr=qNum(st.p),fee=qNum(st.fee)||0;if(!st.d||st.d>today())return err('Bitte ein vergangenes Datum wählen.');if(!(pr>0))return err('Bitte den Kurs eintragen.');
      let q,a=null;if(st.type=='plan'){a=qNum(st.a);if(!(a>0))return err('Bitte den Betrag eintragen.');q=Math.round(a/pr*1e8)/1e8}else{q=qNum(st.q);if(!(q>0))return err('Bitte die Stückzahl eintragen.')}
      const x={id:ex?ex.id:uid(),t:new Date(st.d+'T12:00').getTime(),type:st.type,q,p:pr,fee:st.type=='plan'?0:fee,hist:true};if(a!=null)x.a=a;
      if(st.type=='sell'){const tmp={...h,tx:h.tx.filter(y=>!ex||y.id!=ex.id),bd:newBd([x])},B0=posBase(tmp),b4=posAt(tmp,B0,x.t-1);x.real=b4.q>0?Math.round((q*pr-fee-q*(b4.iv/b4.q))*100)/100:0}
      items.push(x)}
    const others=h.tx.filter(x=>!ex||x.id!=ex.id),test={...h,tx:others.concat(items),bd:newBd(items)};const r=posBaseRaw(test);
    if(r.q<-1e-6||r.iv<-0.5){warn={items,msg:`Die Nachträge ergeben mehr als dein heutiger Bestand (${r.q<-1e-6?'≈ '+(-r.q).toLocaleString('de-DE',{maximumFractionDigits:4})+' Stück':''}${r.q<-1e-6&&r.iv<-0.5?', ':''}${r.iv<-0.5?'≈ '+eur(-r.iv)+' Einzahlung':''} zu viel). Vielleicht fehlt ein Verkauf – oder der Bestand ist zu niedrig.`,dq:Math.max(0,-r.q),di:Math.max(0,-r.iv)};draw();return}
    commit(items,false)};
  const commit=(items,fix)=>{const sn=JSON.stringify({tx:h.tx,q:h.qty,i:h.inv,bd:h.bd});h.tx=h.tx.filter(x=>!ex||x.id!=ex.id).concat(items);
    if(fix&&warn){h.qty=Math.round(((+h.qty||0)+warn.dq)*1e8)/1e8;h.inv=Math.round(((+h.inv||0)+warn.di)*100)/100;h.avg=avgOf(h)}
    h.bd=newBd(items);
    save();$('sheetRoot').innerHTML='';render();toast((items.length>1?items.length+' Einträge':'Eintrag')+' nachgetragen'+(fix?' · Bestand angepasst':'')+'.',()=>{const o=JSON.parse(sn);h.tx=o.tx;h.qty=o.q;h.inv=o.i;h.bd=o.bd;save();render()})};
  draw();if(!ex||!st.p)fetchSug()}
const fxOf=h=>(h.cur||'EUR')=='EUR'?1:(fxGet(h.cur)||h.fx||1),avgOf=h=>h.qty?Math.round(h.inv/h.qty/fxOf(h)*10000)/10000:null;
function openTrade(i,kind,o){o=o||{};const D=depot(),h=D[i];if(!h)return;const tr={type:kind||'buy',d:o.d||today(),q:'',p:'',fee:'',book:o.book===false?false:!!h.to,acc:pufAcc()?pufAcc().n:ALL.find(a=>!isTabu(a))};let sug=null,busy=false,ptouched=false;
  const curQ=+h.qty||0,avgE=curQ?(h.inv||0)/curQ:0;
  const draw=()=>{const q=qNum(tr.q)||0,pp=qNum(tr.p)||0,fee=qNum(tr.fee)||0,amt=q*pp,real=tr.type=='sell'?amt-fee-q*avgE:null;
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Kauf oder Verkauf"><div class="sheet-h"><button id="tX">Abbrechen</button><b>${esc(h.n||h.sym)}</b><button id="tS" style="font-weight:600">Sichern</button></div>
   <div class="sheet-b"><div class="seg" id="tK"><button class="${tr.type=='buy'?'on':''}" data-v="buy">Kauf</button><button class="${tr.type=='sell'?'on':''}" data-v="sell">Verkauf</button></div>
   <div class="group"><div class="cell plain"><label for="tD">Datum</label><input id="tD" type="date" value="${tr.d}" max="${today()}" style="margin-left:auto"></div>
    <div class="cell plain"><label for="tQ">Stück</label><input id="tQ" inputmode="decimal" value="${esc(tr.q)}" placeholder="${tr.type=='sell'?'max. '+curQ.toLocaleString('de-DE',{maximumFractionDigits:6}):'z. B. 1,5'}" style="max-width:130px;text-align:right;margin-left:auto"></div>
    <div class="cell plain"><label for="tP">Kurs pro Stück</label><input id="tP" inputmode="decimal" value="${esc(tr.p)}" placeholder="${busy?'lädt …':'€'}" style="max-width:130px;text-align:right;margin-left:auto"><span>€</span></div>
    <div class="cell plain" style="padding-top:0"><span class="s" id="tSug" style="font-size:12px;color:var(--muted);flex:1">${busy?'Suche Kurs für dieses Datum …':sug?`Vorschlag: <b>${eur(sug.p)}</b> ${sug.live?'(aktueller Kurs)':'(Schlusskurs '+new Date(sug.at).toLocaleDateString('de-DE')+')'}`:'Kein Kurs für dieses Datum gefunden. Bitte selbst eintragen.'}</span>${sug&&qNum(tr.p)!==Math.round(sug.p*100)/100?`<button class="chip" id="tUse">Übernehmen</button>`:''}</div>
    <div class="cell plain"><label for="tA">Betrag</label><input id="tA" inputmode="decimal" value="${amt?String(Math.round(amt*100)/100).replace('.',','):''}" placeholder="oder Betrag eingeben" style="max-width:130px;text-align:right;margin-left:auto"><span>€</span></div>
    <div class="cell plain"><label for="tF">Gebühren</label><input id="tF" inputmode="decimal" value="${esc(tr.fee)}" placeholder="0,00" style="max-width:130px;text-align:right;margin-left:auto"><span>€</span></div></div>
   ${tr.type=='sell'&&q?`<div class="note" style="padding:0">Gewinn/Verlust: <b class="${real<0?'out':'in'}">${real>=0?'+':'−'}${eur(Math.abs(real))}</b> (Ø Einstand ${eur(avgE)} je Stück)</div>`:''}
   ${tr.type=='buy'&&q&&pp?`<div class="note" style="padding:0">Neuer Ø Kaufpreis: <b>${eur(((h.inv||0)+amt+fee)/(curQ+q))}</b> · danach ${(curQ+q).toLocaleString('de-DE',{maximumFractionDigits:6})} Stück</div>`:''}
   <div class="group"><div class="cell plain"><div class="t"><div>Als Buchung erfassen</div><div class="s">${tr.type=='buy'?'Umbuchung von deinem Konto ins Depot':'Erlös zurück auf dein Konto'}</div></div><input type="checkbox" class="switch" id="tB" ${tr.book?'checked':''}></div>
    ${tr.book?`<div class="cell plain"><label for="tAc">${tr.type=='buy'?'Von Konto':'Auf Konto'}</label><select id="tAc">${ALL.filter(a=>!isTabu(a)&&a!=h.to).map(a=>`<option ${tr.acc==a?'selected':''}>${esc(a)}</option>`).join('')}</select></div>`:''}</div>
   <div class="note" id="tE" style="padding:0;color:var(--bad)"></div></div></div>`;
   const keep=()=>{tr.d=$('tD').value||today();tr.q=$('tQ').value;tr.p=$('tP').value;tr.fee=$('tF').value;tr.book=$('tB').checked;if($('tAc'))tr.acc=$('tAc').value};
   $('scrim').onclick=$('tX').onclick=()=>{$('sheetRoot').innerHTML='';openDep(i)};
   document.querySelectorAll('#tK button').forEach(b=>b.onclick=()=>{keep();tr.type=b.dataset.v;draw()});
   $('tD').onchange=()=>{keep();fetchSug()};$('tB').onchange=()=>{keep();draw()};
   const live=()=>{const q=qNum($('tQ').value)||0,p2=qNum($('tP').value)||0;$('tA').value=q&&p2?String(Math.round(q*p2*100)/100).replace('.',','):''};
   $('tQ').oninput=live;$('tP').oninput=()=>{ptouched=true;live()};$('tA').oninput=()=>{const a=qNum($('tA').value)||0,p2=qNum($('tP').value)||0;if(a&&p2)$('tQ').value=String(Math.round(a/p2*1e6)/1e6).replace('.',',')};
   ['tQ','tP','tF','tA'].forEach(id=>$(id).onblur=()=>{keep();draw()});
   if($('tUse'))$('tUse').onclick=()=>{keep();tr.p=String(Math.round(sug.p*100)/100).replace('.',',');ptouched=false;draw()};
   $('tS').onclick=()=>{keep();const q=qNum(tr.q),pr=qNum(tr.p),fee=qNum(tr.fee)||0;if(!(q>0)){$('tE').textContent='Bitte die Stückzahl eintragen.';return}if(!(pr>0)){$('tE').textContent='Bitte den Kurs eintragen.';return}
     if(tr.type=='sell'&&q>curQ+1e-9){$('tE').textContent='Du hast nur '+curQ.toLocaleString('de-DE',{maximumFractionDigits:6})+' Stück.';return}
     const snap=JSON.stringify({d:S.depot,e:S.exp});const amt=Math.round(q*pr*100)/100,t=new Date(tr.d+'T12:00').getTime();h.tx=h.tx||[];
     if(tr.type=='buy'){h.inv=Math.round(((h.inv||0)+amt+fee)*100)/100;h.qty=Math.round((curQ+q)*1e8)/1e8;h.avg=avgOf(h);if(!h.bd)h.bd=tr.d}
     else{const real=Math.round((amt-fee-q*avgE)*100)/100;h.inv=Math.round(Math.max(0,(h.inv||0)-q*avgE)*100)/100;h.qty=Math.round((curQ-q)*1e8)/1e8;h.real=Math.round(((h.real||0)+real)*100)/100;tr.real=real}
     h.tx.push({id:uid(),t,type:tr.type,q,p:pr,fee,real:tr.real||null,bk:!!(tr.book&&tr.acc&&h.to)});
     if(tr.book&&tr.acc&&h.to){S.exp.push({id:uid(),type:'tr',b:tr.type=='buy'?tr.acc:h.to,to:tr.type=='buy'?h.to:tr.acc,c:'',a:tr.type=='buy'?amt+fee:Math.max(0,amt-fee),n:(tr.type=='buy'?'Kauf ':'Verkauf ')+(h.n||h.sym),t:t>Date.now()?Date.now():t,dep:h.id})}
     save();$('sheetRoot').innerHTML='';render();toast((tr.type=='buy'?'Kauf':'Verkauf')+' gespeichert: '+q.toLocaleString('de-DE',{maximumFractionDigits:6})+' × '+eur(pr)+'.',()=>{const o=JSON.parse(snap);S.depot=o.d;S.exp=o.e;save();render()})}};
  const fetchSug=async()=>{busy=true;sug=null;draw();const r=await priceOn(h,tr.d);busy=false;sug=r;if(r&&(!ptouched||!tr.p))tr.p=String(Math.round(r.p*100)/100).replace('.',',');if(o.amt&&!tr.q&&qNum(tr.p))tr.q=String(Math.round(o.amt/qNum(tr.p)*1e6)/1e6).replace('.',',');if(document.querySelector('[aria-label="Kauf oder Verkauf"]'))draw()};
  draw();fetchSug()}
function openDep(i){const D=depot(),h=i>=0?{...D[i]}:{id:uid(),type:'etf',n:'',sym:'',qty:'',inv:'',rate:'',day:1,plan:true,manual:false,price:'',book:true};
  const lr=h.rid&&(S.rec||[]).find(r=>r.id==h.rid);if(h.book==null)h.book=!!lr;h.from=h.from||(lr&&lr.b)||(pufAcc()?pufAcc().n:ALL[0]);h.to=h.to||(lr&&lr.to)||(ALL.find(a=>/etf|depot/i.test(a))||ALL.find(a=>/krypto|crypto/i.test(a)&&h.type=='krypto')||null);
  const draw=()=>{$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Position"><div class="sheet-h"><button id="dpX">Abbrechen</button><b>${i>=0?'Position bearbeiten':'Neue Position'}</b><button id="dpS" style="font-weight:600">Sichern</button></div>
   <div class="sheet-b"><div class="seg" id="dpT">${Object.entries(DT).map(([k,v])=>`<button class="${h.type==k?'on':''}" data-v="${k}">${v[0]}</button>`).join('')}</div>
   <div class="group"><div class="cell plain"><label for="dpN">Name</label><input id="dpN" value="${esc(h.n||'')}" placeholder="${h.type=='krypto'?'z. B. Bitcoin':h.type=='robo'?'z. B. Revolut Robo Aggressive':'z. B. Vanguard FTSE All-World'}"></div>
    <div class="cell plain"><label for="dpY">${h.type=='krypto'?'Kürzel':h.type=='robo'?'Nachbilden mit (ISIN)':'ISIN oder Ticker'}</label><input id="dpY" value="${esc(h.sym||'')}" autocapitalize="characters" placeholder="${h.type=='krypto'?'BTC, ETH, SOL …':'IE00BK5BQT80 oder VWCE.DE'}"></div>
    ${h.type=='robo'?`<div class="cell plain"><span class="s" style="color:var(--muted);font-size:12px">Ein Robo-Depot hat keinen eigenen Börsenkurs. Die App schätzt die tägliche Entwicklung über einen ähnlichen ETF, voreingestellt der FTSE All-World (IE00BK5BQT80), passend zu 90–100 % weltweiten Aktien. Den echten Wert aus der Revolut-App trägst du ab und zu hier ein, dann rechnet die App von dort weiter.</span></div>`:h.type!='krypto'?`<div class="cell plain"><span class="s" style="color:var(--muted);font-size:12px">Am sichersten ist die ISIN. Beim Ticker die Börse anhängen, z. B. .DE für Xetra.${h.nofound?' <b style="color:var(--bad)">Dieses Kürzel wurde nicht gefunden.</b>':''}</span></div>`:''}
    ${h.type=='robo'?`<div class="cell plain"><label for="dpV">Aktueller Wert</label><input id="dpV" inputmode="decimal" value="${h.qty&&h.price?String(Math.round(h.qty*h.price*100)/100).replace('.',','):h.pendVal?String(h.pendVal).replace('.',','):''}" placeholder="€ laut Revolut-App"></div><div class="cell plain"><label for="dpE">Eingezahlt gesamt</label><input id="dpE" inputmode="decimal" value="${h.inv?String(h.inv).replace('.',','):''}" placeholder="€"></div>`:`    <div class="cell plain"><label for="dpQ">Stückzahl</label><input id="dpQ" inputmode="decimal" value="${h.qty!==''&&h.qty!=null?String(h.qty).replace('.',','):''}" placeholder="z. B. 12,345"></div>
    <div class="cell plain"><label for="dpI">Ø Kaufpreis</label><input id="dpI" inputmode="decimal" value="${h.avg?String(h.avg).replace('.',','):h.inv&&h.qty?String(Math.round(h.inv/h.qty/((h.cur||'EUR')=='EUR'?1:(h.fx||1))*10000)/10000).replace('.',','):''}" placeholder="pro Stück"><select id="dpCur" class="cursel" aria-label="Währung">${CURS.map(c=>`<option ${(h.cur||'EUR')==c?'selected':''}>${c}</option>`).join('')}</select></div>`}
    <div class="cell plain"><label for="dpBd">Kaufdatum</label>${h.bd=='pre'?`<span style="flex:1;text-align:right">vor ${new Date().getFullYear()}</span>`:`<input id="dpBd" type="date" value="${h.bd&&h.bd!='pre'?h.bd:''}" max="${today()}">`}</div>
    <div class="cell plain" style="flex-wrap:wrap;gap:6px"><span class="s" style="flex:1;min-width:150px;color:var(--muted);font-size:13px">Datum unbekannt? Bei mehreren Käufen das erste Kaufdatum.</span><button class="chip ${h.bd=='pre'?'on':''}" id="dpPre">vor ${new Date().getFullYear()}</button>${h.type=='robo'?'':'<button class="chip" id="dpEst">Aus Kaufpreis schätzen</button>'}</div>
    <div class="note" id="dpEstMsg" style="padding:0 16px 8px"></div>
    ${h.type=='robo'?'':`<div class="cell plain"><div class="t"><div>Investiert gesamt</div><div class="s" id="dpFx">${(h.cur||'EUR')=='EUR'?'Stückzahl × Ø Kaufpreis':'umgerechnet zum aktuellen Kurs'}</div></div><b id="dpIT">${h.inv?eur(h.inv):'–'}</b></div>`}</div>
   ${i>=0&&h.type!='robo'?`<div class="sh" style="padding:0;display:flex;justify-content:space-between"><span>Käufe & Verkäufe</span>${h.real?`<span class="${h.real<0?'out':'in'}" style="text-transform:none">realisiert ${h.real>=0?'+':'−'}${eur(Math.abs(h.real))}</span>`:''}</div><div class="group">${(h.tx||[]).slice().sort((a,b)=>b.t-a.t).slice(0,6).map(x=>`<div class="cell plain"><div class="t"><div>${x.type=='buy'?'Kauf':x.type=='plan'?'Sparplan':'Verkauf'} · ${(+x.q).toLocaleString('de-DE',{maximumFractionDigits:6})} × ${eur(x.p)}</div><div class="s">${new Date(x.t).toLocaleDateString('de-DE')}${x.hist?' · nachgetragen':''}${x.fee?' · Gebühr '+eur(x.fee):''}${x.real!=null?' · '+(x.real>=0?'+':'−')+eur(Math.abs(x.real)):''}</div></div><b class="${x.type=='sell'?'in':''}">${x.type=='sell'?'+':'−'}${eur(x.q*x.p)}</b></div>`).join('')}
    <div class="cell plain" style="gap:8px"><button class="btn soft" id="dpBuy" style="flex:1;margin:0">+ Kauf</button><button class="btn soft" id="dpSell" style="flex:1;margin:0" ${+h.qty>0?'':'disabled'}>− Verkauf</button></div></div>`:''}
   <div class="sh" style="padding:0">Sparplan</div><div class="group">
    <div class="cell plain"><label for="dpR">Sparrate pro Monat</label><input id="dpR" inputmode="decimal" value="${h.rate?String(h.rate).replace('.',','):''}" placeholder="€"></div>
    <div class="cell plain"><label for="dpD">Ausführung am</label><select id="dpD">${Array.from({length:31},(_,k)=>`<option value="${k+1}" ${(h.day||1)==k+1?'selected':''}>${k+1}.</option>`).join('')}</select></div>
    <div class="cell plain"><div class="t"><div>Automatisch fortschreiben</div><div class="s">Jeden Monat Rate und Stückzahl erhöhen</div></div><input type="checkbox" class="switch" id="dpP" ${h.plan?'checked':''}></div>
    <div class="cell plain"><div class="t"><div>Als wiederkehrende Buchung anlegen</div><div class="s">Die Sparrate wird jeden Monat als Umbuchung gebucht</div></div><input type="checkbox" class="switch" id="dpBk" ${h.book?'checked':''}></div>
    ${h.book?`<div class="cell plain"><label for="dpFr">Von Konto</label><select id="dpFr">${ALL.filter(a=>!isTabu(a)).map(a=>`<option ${h.from==a?'selected':''}>${esc(a)}</option>`).join('')}</select></div>
    <div class="cell plain"><label for="dpTo">Auf Konto</label><select id="dpTo">${ALL.filter(a=>a!=h.from).map(a=>`<option ${h.to==a?'selected':''}>${esc(a)}</option>`).join('')}<option value="__new" ${!h.to?'selected':''}>Neues Konto „${h.type=='krypto'?'Krypto':'ETFs'}“ anlegen</option></select></div>`:''}</div>
   <div class="sh" style="padding:0">Kurs</div><div class="group">
    <div class="cell plain"><div class="t"><div>Kurs von Hand eintragen</div><div class="s">Wenn es keinen automatischen Kurs gibt</div></div><input type="checkbox" class="switch" id="dpM" ${h.manual?'checked':''}></div>
    ${h.manual?`<div class="cell plain"><label for="dpK">Aktueller Kurs</label><input id="dpK" inputmode="decimal" value="${h.mprice!=null?String(h.mprice).replace('.',','):h.price?String(h.price).replace('.',','):''}" placeholder="${h.cur||'EUR'} pro Stück"><span class="s" style="color:var(--muted);margin-left:4px">${h.cur||'EUR'}</span></div>`:''}</div>
   <div class="note" id="dpE" style="padding:0;color:var(--bad)"></div>${i>=0?'<button class="btn danger" id="dpDel">Position löschen</button>':''}</div></div>`;
   const keep=()=>{h.n=$('dpN').value.trim();if($('dpBd'))h.bd=$('dpBd').value||null;h.sym=$('dpY').value.trim();if(h.type=='robo'){const v=qNum($('dpV').value),e=qNum($('dpE').value);h.cur='EUR';h.fx=1;h.avg=null;h.inv=isNaN(e)?0:e;if(!isNaN(v)&&v>0){if(h.price){h.qty=Math.round(v/h.price*1e6)/1e6;delete h.pendVal}else{h.pendVal=v;h.qty=0}}}else{h.qty=qNum($('dpQ').value);const av=qNum($('dpI').value);h.cur=$('dpCur').value;h.fx=h.cur=='EUR'?1:(fxGet(h.cur)||h.fx||1);h.avg=av||null;h.inv=av&&h.qty?Math.round(av*h.qty*h.fx*100)/100:0}h.rate=pNum($('dpR').value)||0;h.day=+$('dpD').value;h.plan=$('dpP').checked;h.book=$('dpBk').checked;if($('dpFr'))h.from=$('dpFr').value;if($('dpTo'))h.to=$('dpTo').value=='__new'?null:$('dpTo').value;h.manual=$('dpM').checked;if($('dpK')){h.mprice=qNum($('dpK').value)||null;h.price=h.mprice?h.mprice*(h.cur=='EUR'?1:(fxGet(h.cur)||h.fx||1)):null}};
   $('scrim').onclick=$('dpX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   const upT=()=>{if(!$('dpQ'))return;const q=qNum($('dpQ').value),a=qNum($('dpI').value),c=$('dpCur').value,fx=c=='EUR'?1:fxGet(c);$('dpIT').textContent=q&&a?(c=='EUR'?eur(q*a):(fx?'≈ '+eur(q*a*fx):(q*a).toLocaleString('de-DE',{maximumFractionDigits:2})+' '+c)):'–';$('dpFx').textContent=c=='EUR'?'Stückzahl × Ø Kaufpreis':fx?'1 '+c+' = '+fx.toLocaleString('de-DE',{maximumFractionDigits:4})+' € (aktueller Kurs)':'Wechselkurs wird geladen …'};if($('dpQ')){$('dpQ').oninput=upT;$('dpI').oninput=upT}
   if($('dpCur'))$('dpCur').onchange=()=>{const c=$('dpCur').value;upT();if(c!='EUR'&&!fxGet(c))fxLoad(c).then(upT)};if($('dpCur')&&$('dpCur').value!='EUR')fxLoad($('dpCur').value).then(upT);
   document.querySelectorAll('#dpT button').forEach(b=>b.onclick=()=>{keep();h.type=b.dataset.v;if(h.type=='robo'&&!h.sym)h.sym='IE00BK5BQT80';draw()});$('dpM').onchange=()=>{keep();draw()};$('dpBk').onchange=()=>{keep();draw()};
   $('dpPre').onclick=()=>{keep();h.bd=h.bd=='pre'?null:'pre';draw()};
   if($('dpBuy'))$('dpBuy').onclick=()=>openTrade(i,'buy');if($('dpSell'))$('dpSell').onclick=()=>openTrade(i,'sell');
   if($('dpBd')&&i<0)$('dpBd').onchange=async()=>{keep();if(!h.bd||!h.sym||h.type=='robo'||($('dpI')&&$('dpI').value))return;$('dpEstMsg').textContent='Suche Kurs am '+new Date(h.bd+'T12:00').toLocaleDateString('de-DE')+' …';const r=await priceOn(h,h.bd);if(!$('dpI'))return;if(r){const fx=(h.cur||'EUR')=='EUR'?1:(fxGet(h.cur)||1);$('dpI').value=String(Math.round(r.p/fx*100)/100).replace('.',',');upT();$('dpEstMsg').textContent='Kurs am '+new Date(r.at).toLocaleDateString('de-DE')+' als Ø Kaufpreis vorgeschlagen. Bei Bedarf anpassen.'}else $('dpEstMsg').textContent='Für dieses Datum gibt es keinen Kurs. Bitte den Kaufpreis selbst eintragen.'};
   if($('dpEst'))$('dpEst').onclick=async()=>{keep();if(!h.sym){$('dpEstMsg').textContent='Bitte zuerst ISIN, Ticker oder Kürzel eintragen.';return}$('dpEstMsg').textContent='Suche im Kursverlauf …';const tmp=[...depot()];if(!depot().includes(h))S.depot.push(h);let r;try{r=await estimateBuy(h)}finally{S.depot=tmp}
     if(r.err){$('dpEstMsg').textContent=r.err;return}if(r.pre)h.bd='pre';else h.bd=r.date;draw();$('dpEstMsg').textContent=r.msg+' Du kannst das Datum jederzeit ändern.'};if($('dpFr'))$('dpFr').onchange=()=>{keep();draw()};
   if($('dpDel'))$('dpDel').onclick=()=>{const b=$('dpDel');if(!b.dataset.arm){b.dataset.arm=1;b.textContent='Wirklich löschen?';return}const s=JSON.stringify(D),sr=JSON.stringify(S.rec);const rid=D[i].rid;D.splice(i,1);if(rid)S.rec=S.rec.filter(r=>r.id!=rid);save();$('sheetRoot').innerHTML='';render();toast('Position gelöscht'+(rid?', Sparplan-Buchung auch.':'.'),()=>{S.depot=JSON.parse(s);S.rec=JSON.parse(sr);save();render()})};
   $('dpS').onclick=()=>{keep();if(!h.n&&!h.sym){$('dpE').textContent='Bitte Name oder Kürzel eintragen.';return}if(isNaN(h.qty))h.qty=0;
     if(h.rate&&h.plan){const d=new Date();let n=dueIn(d.getFullYear(),d.getMonth(),h.day);if(n<=d)n=dueIn(d.getFullYear(),d.getMonth()+1,h.day);if(!h.next||i<0||D[i].day!=h.day||!D[i].plan)h.next=ymd(n.getTime())}
     if(h.manual)h.pt=Date.now();if(i>=0&&D[i].sym!=h.sym){h.pt=0;h.ysym=null}
     const sr=JSON.stringify(S.rec),sa=JSON.stringify(S.accts),sd=JSON.stringify(D);let note='';
     const ri=h.rid?(S.rec||[]).findIndex(r=>r.id==h.rid):-1;
     if(h.book&&h.rate>0){if(!h.to){const nm=h.type=='krypto'?'Krypto':'ETFs';if(!ALL.includes(nm)){S.accts.push({n:nm,kind:'konto',col:h.type=='krypto'?'#D4A23A':'#4F6BED',vis:false,tot:false,start:0,sperre:{art:'tabu'},rolle:'vermoegen'});S.cats=S.cats||{};S.cats[nm]=[['Sparplan','piggy'],['Sonstiges','dot']];refreshA()}h.to=nm}
       const nx=h.next||(()=>{const d=new Date();let n=dueIn(d.getFullYear(),d.getMonth(),h.day);if(n<=d)n=dueIn(d.getFullYear(),d.getMonth()+1,h.day);return ymd(n.getTime())})();
       const r=Object.assign(ri>=0?S.rec[ri]:{id:uid()},{type:'tr',b:h.from,to:h.to,c:'',a:h.rate,n:'Sparplan '+(h.n||h.sym),day:h.day,every:1,dep:h.id});if(ri<0){r.start=nx;S.rec.push(r)}h.rid=r.id;note=ri>=0?' Wiederkehrende Buchung angepasst.':' Wiederkehrende Buchung angelegt: '+eur(h.rate)+' am '+h.day+'. von '+h.from+' nach '+h.to+'.'}
     else if(ri>=0){S.rec.splice(ri,1);delete h.rid;note=' Wiederkehrende Buchung entfernt.'}
     if(i>=0)D[i]=h;else D.push(h);save();$('sheetRoot').innerHTML='';render();toast((i>=0?'Position gesichert.':'Position angelegt.')+note,()=>{S.rec=JSON.parse(sr);S.accts=JSON.parse(sa);S.depot=JSON.parse(sd);refreshA();save();render()});depRefresh(true)}};draw();renderAsst()}
const on2=(id,f)=>{const el=$(id);if(el)el.onclick=f};
function posGo(dir){const O=posOrder(),k=O.indexOf(posView),n=k+dir;if(k<0||n<0||n>=O.length){const w=$('posWrap');if(w){w.classList.remove('bump');void w.offsetWidth;w.classList.add('bump')}return}tcHide();posAnim=dir>0?'pin-r':'pin-l';posView=O[n];render();window.scrollTo(0,0);setTimeout(()=>posAnim='',300)}
function posSwipe(){const v=document.querySelector('#app .view');if(!v||v.__ps)return;v.__ps=1;let x0=null,y0=null,t0=0;
  v.addEventListener('touchstart',e=>{const t=e.target;if(t.closest('.tc,svg,.seg,.rgseg,input,select,textarea,.dlg,.sheet')||e.touches.length>1){x0=null;return}x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now()},{passive:true});
  v.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6&&Date.now()-t0<800)posGo(dx<0?1:-1)},{passive:true})}
let posW0=innerWidth>=700;addEventListener('resize',()=>{const w=innerWidth>=700;if(w===posW0)return;posW0=w;if(posView&&tab=='rep'&&!$('sheetRoot').innerHTML)render()});
function bindDepot(){if(!(tab=='rep'&&repV=='Vermögen'))return;if($('depFnCopy2'))$('depFnCopy2').onclick=()=>{try{navigator.clipboard.writeText(KURS_FN).then(()=>toast('Code kopiert. Jetzt in Supabase einfügen und Deploy tippen.'))}catch(e){toast('Kopieren ging nicht.')}};document.querySelectorAll('#depAdd').forEach(b=>b.onclick=()=>openDep(-1));
  document.querySelectorAll('[data-dep]').forEach(b=>b.onclick=()=>{const h=depot()[+b.dataset.dep];if(h){posView=h.id;render()}});
  on2('wtotAll',()=>{posAnim='';posView='__all';render()});
  if(posView){const i=depot().findIndex(h=>h.id==posView);on2('posBack',()=>{posView=null;posAnim='';render()});document.querySelectorAll('[data-txi]').forEach(b=>b.onclick=()=>openDep(+b.dataset.txi));posSwipe();on2('posEdit',()=>openDep(i));on2('posBuy',()=>openTrade(i,'buy'));on2('posSell',()=>openTrade(i,'sell'));document.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>{posRange=b.dataset.pr;render()});document.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>{posMode=b.dataset.pm;tcHide();render()});document.querySelectorAll('.txr[data-txo]:not([data-txi])').forEach(b=>{if(i>=0)b.onclick=()=>{const x=(depot()[i].tx||[]).find(q=>q.id==b.dataset.tid);if(x&&x.hist)openBackfill(i,x.id);else openDep(i)}});if(i>=0)on2('posHist',()=>openBackfill(i))}
  document.querySelectorAll('[data-rg]').forEach(b=>b.onclick=()=>{dRange=b.dataset.rg;histMsg='';render();loadHist(false,RANGES[dRange][1])});
  if($('vbOpen'))$('vbOpen').onclick=()=>openVaultBase();document.querySelectorAll('[data-vkb]').forEach(b=>b.onclick=()=>{curB=b.dataset.vkb;render();scrollTo(0,0)});document.querySelectorAll('[data-vabg]').forEach(b=>b.onclick=()=>openAbgleich(b.dataset.vabg));if($('vInOpen'))$('vInOpen').onclick=()=>openEinzahlung();
  document.querySelectorAll('[data-vlg]').forEach(b=>b.onclick=()=>{const k=b.dataset.vlg;vOff[k]=!vOff[k];render()});
  document.querySelectorAll('[data-dlg]').forEach(b=>b.onclick=()=>{const k=b.dataset.dlg;depOff[k]=!depOff[k];render()});
  if($('depRef'))$('depRef').onclick=()=>depRefresh(true).then(()=>loadHist(true,'d')).then(()=>{if(RANGES[dRange][1]!='d')loadHist(true,RANGES[dRange][1])});
  if($('depFnCopy'))$('depFnCopy').onclick=()=>{try{navigator.clipboard.writeText(KURS_FN).then(()=>toast('Code kopiert. Jetzt in Supabase einfügen.'))}catch(e){toast('Kopieren ging nicht.')}};
  setTimeout(()=>{depRefresh(false).then(()=>loadHist(false,'d')).then(()=>{if(RANGES[dRange][1]!='d')loadHist(false,RANGES[dRange][1])})},50)}

/* ---------- Depot: Wertentwicklung ---------- */
const HK='cf_hist';let HC=(()=>{try{return JSON.parse(localStorage.getItem(HK))||{}}catch(e){return{}}})();const hcSave=()=>{try{localStorage.setItem(HK,JSON.stringify(HC))}catch(e){}};
let histBusy=false,histMsg='';const yStart=()=>new Date(new Date().getFullYear(),0,1).getTime();
const hkey=h=>(h.type=='krypto'?'c:':'s:')+String(h.sym||'').trim().toUpperCase();
const RANGES={'1d':['1T','i',1],'1w':['1W','h',7],'1m':['1M','d',30],'3m':['3M','d',91],'6m':['6M','d',182],'ytd':['YTD','d',0],'1y':['1J','d',365]};const RGL={'1d':'heute','1w':'1 Woche','1m':'1 Monat','3m':'3 Monate','6m':'6 Monate','ytd':'seit 1.1.','1y':'1 Jahr'};let dRange='ytd';
const rStart=r=>r=='ytd'?yStart():Date.now()-RANGES[r][2]*864e5;
async function cryptoHist(sym,res='d'){sym=sym.toUpperCase().trim();const days=res=='d'?Math.max(366,Math.ceil((Date.now()-yStart())/864e5)+1):res=='h'?7:1;
  try{const s=await (await fetch('https://api.coingecko.com/api/v3/search?query='+encodeURIComponent(sym))).json();const c=(s.coins||[]).find(x=>x.symbol.toUpperCase()==sym)||(s.coins||[])[0];
    if(c){const j=await (await fetch('https://api.coingecko.com/api/v3/coins/'+c.id+'/market_chart?vs_currency=eur&days='+days+(res=='d'?'&interval=daily':''))).json();if(j.prices&&j.prices.length)return j.prices.map(([t,p])=>[t,p])}}catch(e){}
  try{const g=res=='d'?86400:res=='h'?3600:300,st=new Date(Date.now()-(res=='d'?299:res=='h'?7:1)*864e5).toISOString(),r=await (await fetch('https://api.exchange.coinbase.com/products/'+sym+'-EUR/candles?granularity='+g+'&start='+st+'&end='+new Date().toISOString())).json();if(Array.isArray(r)&&r.length)return r.map(x=>[x[0]*1000,x[4]]).sort((a,b)=>a[0]-b[0])}catch(e){}
  return null}
const hk2=(h,res)=>hkey(h)+'|'+res;
const HFAIL={};async function loadHist(force,res='d'){if(histBusy)return;const maxAge={d:12*36e5,h:36e5,i:6e5}[res];const D=depot().filter(h=>h.sym&&!h.manual);const need=D.filter(h=>{const k=hk2(h,res),x=HC[k];if(!force&&HFAIL[k]&&Date.now()-HFAIL[k]<6e5)return false;return force||!x||Date.now()-x.t>maxAge});if(!need.length)return;
  histBusy=true;histMsg='Lade Kursverlauf …';if(tab=='rep'&&repV=='Vermögen'&&!$('sheetRoot').innerHTML)render();let miss=0;
  for(const h of need.filter(h=>h.type=='krypto')){const pts=await cryptoHist(h.sym,res);if(pts){HC[hk2(h,res)]={t:Date.now(),pts}}else miss++}
  const st=need.filter(h=>h.type!='krypto');
  if(st.length){if(syOn()){try{const r=await syFetch('/functions/v1/kurse',{method:'POST',body:JSON.stringify({q:st.map(h=>h.sym.trim().toUpperCase()),hist:res})});const j=r.ok?await r.json():{};
      st.forEach(h=>{const x=j[h.sym.trim().toUpperCase()];if(x&&x.hist&&x.hist.length)HC[hk2(h,res)]={t:Date.now(),pts:x.hist};else miss++;if(x&&x.price&&(!x.v||x.v<3))S.kursFnOld=true})}catch(e){miss+=st.length}}else miss+=st.length}
  if(res=='d')Object.keys(HC).forEach(k=>{if(!k.includes('|'))delete HC[k]});
  need.forEach(h=>{const k=hk2(h,res),x=HC[k];if(!x||Date.now()-x.t>maxAge)HFAIL[k]=Date.now();else delete HFAIL[k]});hcSave();histBusy=false;histMsg=miss?miss+' Position'+(miss>1?'en':'')+' ohne Kursverlauf':'';if(tab=='rep'&&repV=='Vermögen'&&!$('sheetRoot').innerHTML)render()}
function priceAt(h,t,res='d'){const x=HC[hk2(h,res)]||HC[hk2(h,'d')]||HC[hk2(h,'f')]||(PH[hkey(h)+'|1y']&&PH[hkey(h)+'|1y'].pts?PH[hkey(h)+'|1y']:null)||(PH[hkey(h)+'|5y']&&PH[hkey(h)+'|5y'].pts?PH[hkey(h)+'|5y']:null);if(!x||!x.pts||!x.pts.length)return h.price||0;const tol=x===HC[hk2(h,'d')]?12*36e5:0;let p=x.pts[0][1];for(const [tt,v] of x.pts){if(tt>t+tol)break;if(v!=null)p=v}return p}
function depSeries(r=dRange){const D=depot(),res=RANGES[r][1],y0=rStart(r),step={d:864e5,h:36e5,i:3e5}[res],n=Math.floor((Date.now()-y0)/step),out=[];
  const BB=D.map(h=>posBase(h));
  for(let i=0;i<=n;i++){const last=i==n,t=last?Date.now():(res=='d'?new Date(new Date(y0+i*step).setHours(12,0,0,0)).getTime():y0+i*step);let v=0,inv=0;const per=[],pin=[];
    D.forEach((h,k)=>{const a=posAt(h,BB[k],last?Date.now():t),pv=last?posVal(h):a.q*priceAt(h,t,res),iv=last?(h.inv||0):a.iv;per.push(pv);pin.push(iv);v+=pv;inv+=iv});
    out.push({t,v,inv,per,pin})}
  return out}
const PCOL=['#4F6BED','#F0657A','#22A699','#D4A23A','#D946EF','#1F9D6B','#E2725B','#3B82C4','#9A93AD'];let depOff={};
function depChart(S0,show){if(S0.length<2)return '';const D=depot(),DM={},W=340,H=200,top=12,bot=22,l=show?52:6,r=6;
  const vis=D.map((h,k)=>!depOff[h.id]),allV=[];S0.forEach(x=>{if(!depOff.__tot)allV.push(x.v);if(!depOff.__inv)allV.push(x.inv);x.per.forEach((v,k)=>{if(vis[k])allV.push(v)})});
  const mx0=Math.max(...allV,1),st=nice(mx0/4),mx=Math.ceil(mx0/st)*st,lo=0,rng=mx-lo||1;
  const X=i=>l+(W-l-r)*i/(S0.length-1),Y=v=>top+(H-top-bot)*(1-(v-lo)/rng),line=f=>S0.map((x,i)=>`${X(i).toFixed(1)},${Y(f(x)).toFixed(1)}`).join(' ');
  const MN=['J','F','M','A','M','J','J','A','S','O','N','D'],WD=['So','Mo','Di','Mi','Do','Fr','Sa'],res=RANGES[dRange][1],span=dRange;let ticks='',pv=null;const tk=(i,t)=>ticks+=`<text x="${X(i).toFixed(1)}" y="${H-6}" font-size="10" text-anchor="middle" style="fill:var(--muted)">${t}</text>`;
  S0.forEach((x,i)=>{const d=new Date(x.t);if(res=='i'){if(d.getMinutes()==0&&d.getHours()%3==0&&i>0)tk(i,d.getHours()+' h')}else if(res=='h'){if(d.getHours()==0&&i>0)tk(i,WD[d.getDay()])}else if(span=='1m'){if(i>0&&i%7==0)tk(i,d.getDate()+'.'+(d.getMonth()+1)+'.')}else if(d.getDate()==1)tk(i,MN[d.getMonth()]+(d.getMonth()==0&&span=='1y'?' '+String(d.getFullYear()).slice(2):''))});
  let grid='';for(let v=0;v<=mx+0.01;v+=st)grid+=`<line x1="${l}" x2="${W-r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--sep)"/>${show?`<text x="${l-5}" y="${(Y(v)+3).toFixed(1)}" font-size="9" text-anchor="end" style="fill:var(--muted)">${axf(v)}</text>`:''}`;
  const per=D.map((h,k)=>vis[k]?`<polyline points="${line(x=>x.per[k])}" fill="none" stroke="${PCOL[k%PCOL.length]}" stroke-width="1.6" stroke-linejoin="round" opacity=".9"/>`:'').join('');
  const last=S0[S0.length-1],dfmt=t=>{const d=new Date(t);return res=='d'?d.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short',year:'numeric'}):d.toLocaleString('de-DE',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})};
  const TC={},tipAt=i=>{if(TC[i]!=null)return TC[i];const x=S0[i];return TC[i]=tcHead(dfmt(x.t))+(depOff.__tot?'':tcRow('Gesamt',x.v,'var(--accent)',!show))+(depOff.__inv?'':tcRow('Investiert',x.inv,'var(--muted)',!show))+D.map((h,k)=>vis[k]&&x.per[k]!=null?tcRow((h.n||h.sym||'').slice(0,22),x.per[k],PCOL[k%PCOL.length],!show):'').join('')+(DM[i]?`<span class="tr" style="color:var(--accent)">${DM[i].map(o=>TXL[txK(o.x)][0]+' '+esc((o.h.n||o.h.sym||'').slice(0,14))+' '+(show?eur0(txAmt(o.x)):'•••')).join(' · ')}</span>`:'')},tips=tipAt;
  const span0=S0.length>1?(S0[S0.length-1].t-S0[0].t)/(S0.length-1):864e5;D.forEach(h=>(h.tx||[]).forEach(x=>{if(x.t<S0[0].t-span0||x.t>S0[S0.length-1].t+864e5)return;let j=S0.findIndex(s=>s.t>=x.t);if(j<0)j=S0.length-1;(DM[j]=DM[j]||[]).push({h,x})}));
  const mk=depOff.__tot?'':Object.entries(DM).map(([j,L])=>{const ty=new Set(L.map(o=>txK(o.x))),c=ty.size>1?'var(--accent)':TXL[txK(L[0].x)][2];return `<circle cx="${X(+j).toFixed(1)}" cy="${Y(S0[+j].v).toFixed(1)}" r="${ty.size==1&&ty.has('plan')?3.5:5}" fill="${c}" stroke="var(--card)" stroke-width="2"/>${L.length>1?`<text x="${X(+j).toFixed(1)}" y="${(Y(S0[+j].v)-9).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" style="fill:${c}">${L.length}</text>`:''}`}).join('');
  const Vh=x=>show?x:'•••';
  const pick=j0=>{const el=$('posSel');if(!el)return;const tol=Math.max(2,Math.round(S0.length*.04));let j=null,bd=1e9;Object.keys(DM).forEach(k=>{const d=Math.abs(+k-j0);if(d<=tol&&d<bd){bd=d;j=+k}});if(j==null)return;
    el.innerHTML=`<div class="mmcard possel"><div class="sh" style="padding:8px 12px 0;display:flex;justify-content:space-between"><span>${new Date(DM[j][0].x.t).toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'})}</span><button class="link" id="posSelX">schließen</button></div><div class="group" style="margin:0">${DM[j].map(o=>txRow(o.h,o.x,Vh,true,o.h.n||o.h.sym).replace('data-txo="1"',`data-txo="1" data-txp="${esc(o.h.id)}"`)).join('')}</div></div>`;
    $('posSelX').onclick=()=>{el.innerHTML='';tcHide()};el.querySelectorAll('[data-txp]').forEach(b=>b.onclick=()=>{posView=b.dataset.txp;render()})};
  return tcWrap(`<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:440px" role="img" aria-label="Wertentwicklung">${grid}${depOff.__inv?'':`<polyline points="${line(x=>x.inv)}" fill="none" stroke="var(--muted)" stroke-width="1.3" stroke-dasharray="4 3"/>`}${per}${depOff.__tot?'':`<polyline points="${line(x=>x.v)}" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round"/><circle cx="${X(S0.length-1)}" cy="${Y(last.v)}" r="3.5" fill="var(--accent)"/>`}${mk}${ticks}</svg>`,{W,H,xs:S0.map((_,i)=>X(i)),tips,y0:H-bot,y1:top,pick})}
function depPerfHtml(show){const D=depot();if(!D.length)return '';const S0=depSeries(),f=S0[0],l=S0[S0.length-1];if(!l)return '';
  const contrib=(l.inv-f.inv),gain=(l.v-f.v)-contrib,base=f.v+contrib/2,pc=base>0?gain/base*100:0,sg=v=>v>0?'+':'',V=x=>show?x:'•••';
  const noHist=D.filter(h=>!h.manual&&h.sym&&!HC[hk2(h,RANGES[dRange][1])]&&!HC[hk2(h,'d')]).length,noBd=D.filter(h=>!h.bd).length;
  return `<div class="sec" style="grid-column:1/-1"><div class="sh"><span>Wertentwicklung · ${RGL[dRange]}</span><span class="${gain<0?'out':'in'}" style="text-transform:none">${V(sg(gain)+eur0(gain))} · ${sg(pc)}${pc.toFixed(1).replace('.',',')} %</span></div>
   <div class="seg rgseg" id="dRg">${Object.entries(RANGES).map(([k,v])=>`<button class="${dRange==k?'on':''}" data-rg="${k}">${v[0]}</button>`).join('')}</div>
   <div class="chartbox">${depChart(S0,show)}<div class="dlg">${[['__tot','Gesamt','var(--accent)',l.v,f.v,contrib],...D.map((h,k)=>[h.id,h.n||h.sym,PCOL[k%PCOL.length],l.per[k],f.per[k],l.pin[k]-f.pin[k]]),['__inv','Eingezahlt','var(--muted)',l.inv,f.inv]].map(([id,n,c,v,v0,ct])=>{const gn=(v-v0)-(ct||0),bs=v0+(ct||0)/2;return `<button class="dlg-i ${depOff[id]?'off':''}" data-dlg="${esc(id)}"><i style="background:${c}"></i><span>${esc(n)}</span><b>${V(eur0(v))}</b>${id!='__inv'&&v0>0?`<small class="${gn<0?'out':'in'}">${V(sg(gn)+eur0(gn))} · ${sg(gn)}${(bs?gn/bs*100:0).toFixed(1).replace('.',',')} %</small>`:id=='__inv'?`<small>+${V(eur0(contrib))} im Zeitraum</small>`:'<small>neu im Zeitraum</small>'}</button>`}).join('')}</div>
   ${histMsg||noHist||noBd?`<div class="note" style="padding:6px 4px 0">${[histMsg,noHist&&!histBusy&&!histMsg?noHist+' ohne Kursverlauf: dort zählt der heutige Kurs':'',noBd?noBd+' ohne Kaufdatum: werden so gerechnet, als hättest du sie schon vor dem 1. Januar gehabt':''].filter(Boolean).join(' · ')}</div>`:''}${D.some(h=>(h.tx||[]).length)?'<div class="note" style="text-align:center;padding:4px 0 0">Punkte = Käufe und Verkäufe · antippen für Details</div>':''}</div><div id="posSel"></div></div>`}
async function estimateBuy(h){const k=hk2(h,'d');if(!HC[k]){if(h.type=='krypto'){const pts=await cryptoHist(h.sym,'d');if(pts){HC[k]={t:Date.now(),pts};hcSave()}}else await loadHist(true,'d')}
  const x=HC[k];const av=h.inv&&h.qty?h.inv/h.qty:null;if(!x||!av)return{err:!av?'Bitte zuerst Stückzahl und Ø Kaufpreis eintragen.':'Für diese Position gibt es keinen Kursverlauf.'};
  const P=x.pts.filter(p=>p[1]&&p[0]>=yStart()),mn=Math.min(...P.map(p=>p[1])),mx=Math.max(...P.map(p=>p[1]));
  if(av<mn*0.97||av>mx*1.03)return{pre:true,msg:`Dein Ø Kaufpreis (${eur(av)}) lag dieses Jahr nie im Kursbereich (${eur0(mn)} bis ${eur0(mx)}). Vermutlich hast du vor dem 1. Januar gekauft.`};
  let best=P[0],bd=1e18;P.forEach(p=>{const d=Math.abs(p[1]-av);if(d<bd){bd=d;best=p}});const hits=P.filter(p=>Math.abs(p[1]-av)/av<0.02).length;
  return{date:ymd(best[0]),msg:`Am ${new Date(best[0]).toLocaleDateString('de-DE')} lag der Kurs bei ${eur(best[1])}, am nächsten an deinem Ø Kaufpreis.${hits>3?' Der Kurs war an mehreren Tagen ähnlich, das Datum ist also nur eine Schätzung.':''}`}}

/* ---------- Vermögen: Stichtag & Zinsen ---------- */
const dayStart=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
function ancD(a){return !!a&&a.baseD!=null&&a.baseVal!=null&&!isNaN(+a.baseVal)}
function rawBal(n,t){const a=acc(n),an=ancD(a)&&t>=a.baseD;let b=an?+a.baseVal:(a.start||0);S.exp.forEach(e=>{if(e.t>t||isPlan(e)||(an&&e.t<a.baseD))return;if((e.type=='in'&&e.b==n)||(e.type=='tr'&&e.to==n))b+=e.a;else if((e.type=='out'||e.type=='tr')&&e.b==n)b-=e.a});return b}
const ZM={};
function zinsAt(n,t){const a=acc(n),R=(a.rates||[]).filter(r=>r.p>0).sort((x,y)=>x.from<y.from?-1:1);if(!R.length)return 0;
  const k=n+'|'+dayStart(t)+'|'+S.exp.length+'|'+JSON.stringify(R)+'|'+(a.start||0)+'|'+(a.baseD||0)+'|'+(a.baseVal==null?'':a.baseVal);if(ZM[k]!=null)return ZM[k];
  const r0=new Date(R[0].from+'T00:00').getTime(),from=Math.max(r0,a.baseD||0),end=dayStart(t);if(from>=end)return ZM[k]=0;
  const ev=S.exp.filter(e=>!isPlan(e)&&e.t<end&&(e.b==n||e.to==n)).map(e=>[e.t,((e.type=='in'&&e.b==n)||(e.type=='tr'&&e.to==n))?e.a:-e.a]).sort((x,y)=>x[0]-y[0]);
  const an=ancD(a)&&from>=a.baseD;let p=an?+a.baseVal:(a.start||0),i=0,z=0;for(;i<ev.length&&ev[i][0]<from;i++)if(!an||ev[i][0]>=a.baseD)p+=ev[i][1];
  for(let d=from;d<end;d+=864e5){const de=d+864e5;while(i<ev.length&&ev[i][0]<de){p+=ev[i][1];i++}const ds=ymd(d+12*36e5);let rate=0;for(const r of R)if(r.from<=ds)rate=r.p;if(p+z>0)z+=(p+z)*rate/36500}
  return ZM[k]=Math.round(z*100)/100}
const rateNow=n=>{const R=(acc(n).rates||[]).filter(r=>r.from<=today()).sort((x,y)=>x.from<y.from?-1:1);return R.length?R[R.length-1].p:0};

/* ---------- Vermögen: Vermögen ---------- */
function openVaultNew(){const draw=(err)=>{$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Sparkonto anlegen"><div class="sheet-h"><button id="vnX">Abbrechen</button><b>Sparkonto</b><button id="vnS" style="font-weight:600">Anlegen</button></div>
   <div class="sheet-b"><div class="group"><div class="cell plain"><label for="vnN">Name</label><input id="vnN" placeholder="z. B. Tagesgeld"></div>
    <div class="cell plain"><label for="vnV">Stand heute</label><input id="vnV" inputmode="decimal" placeholder="0" style="max-width:140px"><span>€</span></div>
    <div class="cell plain"><label for="vnZ">Zinssatz</label><input id="vnZ" inputmode="decimal" placeholder="z. B. 2,5" style="max-width:90px"><span>% p. a.</span></div>
    <div class="cell plain"><label for="vnR">Sparrate pro Monat</label><input id="vnR" inputmode="decimal" placeholder="optional" style="max-width:110px"><span>€</span></div></div>
   <div class="note" style="padding:0">Trag ein, was laut Bank heute auf dem Konto liegt. Ab jetzt zählen Einzahlungen, Entnahmen und Zinsen. Das Konto ist tabu und zählt zu deinem Vermögen.</div>
   <div class="note" style="padding:0;color:var(--bad)">${err||''}</div></div></div>`;
  $('scrim').onclick=$('vnX').onclick=()=>{$('sheetRoot').innerHTML=''};
  $('vnS').onclick=()=>{const n=safeAcct($('vnN').value),v=qNum($('vnV').value||'0'),z=qNum($('vnZ').value),sr=qNum($('vnR').value);if(!$('vnN').value.trim())return draw('Bitte einen Namen eingeben.');if(ALL.includes(n))return draw('Diesen Namen gibt es schon.');if(isNaN(v))return draw('Bitte einen gültigen Stand eingeben.');
   const col=ACOL.find(c=>!S.accts.some(a=>a.col==c))||ACOL[3],t=Date.now();S.accts.push({n,kind:'konto',col,vis:true,tot:false,start:0,rolle:'vermoegen',sperre:{art:'tabu'},baseD:t,baseVal:Math.round(v*100)/100,baseAt:t,rates:!isNaN(z)&&z>0?[{from:today(),p:z}]:[]});S.cats[n]=[["Sonstiges","dot"]];S.bg[n]={g:7};
   refreshA();for(const k in ZM)delete ZM[k];save();$('sheetRoot').innerHTML='';render();toast(n+' liegt jetzt im Vermögen.');if(!isNaN(sr)&&sr>0){const pa=pufAcc();setTimeout(()=>openRec(-1,{type:'tr',b:pa?pa.n:ALL[0],to:n,c:'',a:Math.round(sr*100)/100,n:'Sparrate '+n,every:1}),300)}}};draw()}
function vaultRows(V,Vv){return `<div class="group" style="margin-top:10px">${V.map(n=>{const a=acc(n),r=rateNow(n);return `<div class="cell"><button class="cell" data-vkb="${esc(n)}" style="padding:0;flex:1;min-width:0;min-height:0"><div class="ico" style="background:color-mix(in srgb,${a.col||'#1F9D6B'} 16%,transparent);color:${a.col||'#1F9D6B'}">${I('lock')}</div><div class="t"><div>${esc(n)}</div><div class="s">${r?String(r).replace('.',',')+' % · Zinsen bisher '+Vv(eur(zinsAt(n,Date.now()))):'ohne Zinsen'}</div></div><div class="v">${Vv(eur(calc(n).rest))}</div></button><button class="link" data-vabg="${esc(n)}" style="margin-left:8px">Abgleichen</button></div>`}).join('')}</div>`}
const vaultCash=()=>vaultAccs().filter(n=>!depot().some(h=>h.to==n));
function balAt(n,t){const a=acc(n);if(a.baseD&&t<a.baseD)return 0;return rawBal(n,t)+zinsAt(n,t)}
function vaultSeries(){const V=vaultCash(),y0=rStart(dRange),days=Math.max(1,Math.ceil((Date.now()-y0)/864e5)),out=[];
  for(let i=0;i<=days;i++){const t=i==days?Date.now():Math.min(y0+i*864e5,Date.now());const per=V.map(n=>balAt(n,t));out.push({t,v:per.reduce((s,x)=>s+x,0),per})}return out}
let vOff={};
function vaultChart(S0,V,show){if(S0.length<2)return '';const W=340,H=180,top=12,bot=22,l=show?52:6,r=6,all=[];S0.forEach(x=>{if(!vOff.__tot)all.push(x.v);x.per.forEach((v,k)=>{if(!vOff[V[k]])all.push(v)})});
  const mx0=Math.max(...all,1),st=nice(mx0/4),mx=Math.ceil(mx0/st)*st,rng=mx||1,X=i=>l+(W-l-r)*i/(S0.length-1),Y=v=>top+(H-top-bot)*(1-v/rng),line=f=>S0.map((x,i)=>`${X(i).toFixed(1)},${Y(f(x)).toFixed(1)}`).join(' ');
  let grid='';for(let v=0;v<=mx+0.01;v+=st)grid+=`<line x1="${l}" x2="${W-r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--sep)"/>${show?`<text x="${l-5}" y="${(Y(v)+3).toFixed(1)}" font-size="9" text-anchor="end" style="fill:var(--muted)">${axf(v)}</text>`:''}`;
  const MN=['J','F','M','A','M','J','J','A','S','O','N','D'];let ticks='';const sp=S0.length;S0.forEach((x,i)=>{const d=new Date(x.t);if(sp>40?d.getDate()==1:(sp>8?i%7==0&&i>0:i>0))ticks+=`<text x="${X(i).toFixed(1)}" y="${H-6}" font-size="10" text-anchor="middle" style="fill:var(--muted)">${sp>40?MN[d.getMonth()]:d.getDate()+'.'+(d.getMonth()+1)+'.'}</text>`});
  const per=V.length<2?'':V.map((n,k)=>vOff[n]?'':`<polyline points="${line(x=>x.per[k])}" fill="none" stroke="${acc(n).col||PCOL[k%PCOL.length]}" stroke-width="1.6" opacity=".9"/>`).join('');
  const tips=S0.map(x=>tcHead(new Date(x.t).toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short',year:'numeric'}))+(vOff.__tot?'':tcRow(V.length>1?'Vermögen':'',x.v,V.length>1?'#1F9D6B':'',!show))+(V.length<2?'':V.map((n,k)=>vOff[n]?'':tcRow(SHORT[n]||n,x.per[k],acc(n).col||PCOL[k%PCOL.length],!show)).join('')));
  return tcWrap(`<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:400px" role="img" aria-label="Vermögensverlauf">${grid}${per}${vOff.__tot?'':`<polyline points="${line(x=>x.v)}" fill="none" stroke="#1F9D6B" stroke-width="2.6" stroke-linejoin="round"/><circle cx="${X(S0.length-1)}" cy="${Y(S0[S0.length-1].v)}" r="3.5" fill="#1F9D6B"/>`}${ticks}</svg>`,{W,H,xs:S0.map((_,i)=>X(i)),tips,y0:H-bot,y1:top})}
function openVaultBase(){const V=vaultCash();if(!V.length){toast('Noch keine Sparkonten. Unter Mehr › Buchen & Kategorien › Sparkonten festlegen.');return}
  const st=V.map(n=>{const a=acc(n);return{n,d:a.baseD?ymd(a.baseD+12*36e5):HISTD(),v:'',z:rateNow(n)?String(rateNow(n)).replace('.',','):'',zf:today()}});
  st.forEach(x=>{const t=new Date(x.d+'T00:00').getTime();x.v=String(Math.round((acc(x.n).baseVal!=null&&acc(x.n).baseD&&ymd(acc(x.n).baseD+12*36e5)==x.d?acc(x.n).baseVal:rawBal(x.n,t-1))*100)/100).replace('.',',')});
  $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Vermögen"><div class="sheet-h"><button id="vbX">Abbrechen</button><b>Bestand & Zinsen</b><button id="vbS" style="font-weight:600">Sichern</button></div>
   <div class="sheet-b"><div class="note" style="padding:0">Stimmt ein Stand nicht mit der Bank überein, gleich ihn ab: Die Differenz wird als „Kontoabgleich“ gebucht und bleibt nachvollziehbar.</div>
   ${st.map((x,i)=>{const a=acc(x.n),R=(a.rates||[]).slice().sort((p,q)=>p.from<q.from?1:-1);return `<div class="sh" style="padding:0">${esc(x.n)}</div><div class="group">
    <button class="cell" data-vbabg="${i}"><div class="t"><div>Kontostand abgleichen</div><div class="s">In der App: ${eur(calc(x.n).rest)}</div></div><span class="chev">›</span></button>
    <div class="cell plain"><label for="vbZ${i}">Zinssatz</label><input id="vbZ${i}" inputmode="decimal" value="${x.z}" placeholder="z. B. 4,25" style="max-width:90px"><span>% p. a.</span></div>
    <div class="cell plain"><label for="vbF${i}">Neuer Zinssatz gilt ab</label><input id="vbF${i}" type="date" value="${today()}"></div>
    ${R.length?`<div class="cell plain" style="flex-direction:column;align-items:stretch;gap:4px"><span class="s" style="font-size:12px;color:var(--muted)">Bisherige Zinssätze</span>${R.map((r,k)=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:14px"><span>ab ${new Date(r.from+'T12:00').toLocaleDateString('de-DE')}</span><span><b>${String(r.p).replace('.',',')} %</b> <button class="ed-ic" data-zdel="${i}|${r.from}" aria-label="Zinssatz löschen" style="color:var(--bad)">${I('trash',14)}</button></span></div>`).join('')}</div>`:''}
    <div class="cell plain"><span class="s" style="font-size:12px;color:var(--muted)">Zinsen bisher: <b>${eur(zinsAt(x.n,Date.now()))}</b> · aktuell ca. ${eur(rawBal(x.n,Date.now())*rateNow(x.n)/36500)} pro Tag</span></div></div>`}).join('')}
   <div class="note" style="padding:0">Zinsen werden täglich auf den Kontostand gerechnet und gutgeschrieben (Zinseszins). Ändert die Bank den Zins, trag den neuen Satz mit dem Datum ein, ab dem er gilt. Der alte bleibt für die Zeit davor erhalten.</div></div></div>`;
  $('scrim').onclick=$('vbX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
  document.querySelectorAll('[data-vbabg]').forEach(b=>b.onclick=()=>openAbgleich(V[+b.dataset.vbabg]));
  document.querySelectorAll('[data-zdel]').forEach(b=>b.onclick=()=>{const[i,f]=b.dataset.zdel.split('|'),a=acc(V[+i]);a.rates=(a.rates||[]).filter(r=>r.from!=f);a.baseAt=Date.now();save();openVaultBase()});
  $('vbS').onclick=()=>{const sa=JSON.stringify(S.accts);
    st.forEach((x,i)=>{const a=acc(x.n),d=null,v=NaN,z=qNum($('vbZ'+i).value),zf=$('vbF'+i).value||d;
      if(d&&!isNaN(v)){const t=new Date(d+'T00:00').getTime(),net=S.exp.reduce((s,e)=>e.t>t-1||isPlan(e)?s:((e.type=='in'&&e.b==x.n)||(e.type=='tr'&&e.to==x.n))?s+e.a:((e.type=='out'||e.type=='tr')&&e.b==x.n)?s-e.a:s,0);a.baseD=t;a.baseVal=v;a.start=Math.round((v-net)*100)/100;a.baseAt=Date.now()}
      if(!isNaN(z)&&z!==rateNow(x.n)){a.rates=(a.rates||[]).filter(r=>r.from!=zf);a.rates.push({from:zf,p:z})}else if(isNaN(z)&&$('vbZ'+i).value.trim()===''&&rateNow(x.n)){a.rates=(a.rates||[]).filter(r=>r.from!=zf);a.rates.push({from:zf,p:0})}});
    for(const k in ZM)delete ZM[k];save();$('sheetRoot').innerHTML='';render();toast('Sparkonto gesichert.',()=>{S.accts=JSON.parse(sa);refreshA();save();render()})}};
function vaultSecHtml(show){const V=vaultCash();if(!V.length)return `<div class="sec" style="grid-column:1/-1"><div class="sh">Vermögen</div><div class="mmcard"><div class="srow" style="display:flex;align-items:center;gap:8px"><span class="s" style="color:var(--muted);font-size:13px;flex:1">Noch keine Sparkonten. Unter Mehr › Buchen & Kategorien › Sparkonten legst du fest, welche Konten dazugehören.</span>${eyeBtn()}</div></div></div>`;
  const S0=vaultSeries(),f=S0[0],l=S0[S0.length-1],sg=v=>v>0?'+':'',Vv=x=>show?x:'•••',dl=l.v-f.v;
  return `<div class="sec" style="grid-column:1/-1"><div class="sh"><span>Vermögen · ${RGL[dRange]}</span><span style="display:flex;gap:12px;align-items:center;text-transform:none"><span class="in">${Vv(sg(dl)+eur0(dl))} im Zeitraum</span><button class="link" id="vInOpen">Einzahlen</button><button class="link" id="vbOpen">Zinsen</button></span></div>
   <div class="chartbox">${show?`<div class="vtot"><span>Bestand</span><div class="eyerow"><b>${eur(l.v)}</b>${eyeBtn()}</div></div>`:`<div class="vtot"><span>Bestand verborgen</span><div class="eyerow"><b>•••</b>${eyeBtn()}</div></div>`}
    ${vaultChart(S0,V,show)}
    <div class="dlg">${(V.length==1?[['__tot',V[0],'#1F9D6B',l.v,f.v]]:[['__tot','Vermögen gesamt','#1F9D6B',l.v,f.v],...V.map((n,k)=>[n,n,acc(n).col||PCOL[k%PCOL.length],l.per[k],f.per[k]])]).map(([id,n,c,v,v0])=>`<button class="dlg-i ${vOff[id]?'off':''}" data-vlg="${esc(id)}"><i style="background:${c}"></i><span>${esc(n)}</span><b>${Vv(eur0(v))}</b><small class="${v-v0<0?'out':'in'}">${Vv(sg(v-v0)+eur0(v-v0))} im Zeitraum</small></button>`).join('')}</div>
    ${V.some(n=>rateNow(n))?`<div class="ztag">${V.filter(n=>rateNow(n)).map(n=>`${I('up',13)} ${esc(n)}: ${String(rateNow(n)).replace('.',',')} % Zinsen · bisher ${Vv(eur(zinsAt(n,Date.now())))} ${rawBal(n,Date.now())>0?` · heute +${Vv(eur(rawBal(n,Date.now())*rateNow(n)/36500))}`:''}`).join('<br>')}</div>`:''}
    ${vaultRows(V,Vv)}
    <div class="note" style="padding:6px 4px 0">Kontostand aus deinen Buchungen und täglichen Zinsen. Tippe auf ein Konto für alle Buchungen. Depot-Konten deiner Sparpläne zählen oben beim Depot, damit nichts doppelt gerechnet wird.</div></div></div>`}

/* ---------- Puffer verschieben & Vermögen ---------- */
const vaultAccs=()=>S.accts.filter(isVerm).map(a=>a.n);
function pufExcess(){return Math.max(Math.round((pufVal()-1000)*100)/100,0)}
function pufMoveDo(parts,label){const p=pufAcc();if(!p)return;const sn=snap(),gs=JSON.stringify(S.goals),done=[];
  parts.forEach(([t,a])=>{a=Math.round(a*100)/100;if(!a)return;const g=t.startsWith('goal:')?S.goals.find(x=>x.id==t.slice(5)):null;
    if(g){const tgt=g.acct&&ALL.includes(g.acct)?g.acct:(ALL.includes('Sinking Funds')?'Sinking Funds':vermAcc());const eid=uid();S.exp.push({id:eid,type:'tr',b:p.n,to:tgt,c:'',a,n:'Sparziel: '+g.n,t:Date.now(),tg:['puffer'],goal:g.id});g.dep.push({a,t:Date.now(),src:p.n,eid});done.push(eur(a)+' → '+g.n)}
    else{S.exp.push({id:uid(),type:'tr',b:p.n,to:t,c:'',a,n:'Puffer-Überschuss',t:Date.now(),tg:['puffer']});done.push(eur(a)+' → '+(SHORT[t]||t))}});
  if(!done.length)return;save();$('sheetRoot').innerHTML='';render();toast((label||'Verschoben: ')+done.join(', '),()=>{restore(sn);S.goals=JSON.parse(gs);save();render()});if(S.cele!==false)celebrate(done.join(' · '))}
function openPufMove(){const p=pufAcc();if(!p){toast('Kein Eingangskonto festgelegt.');return}const free=Math.max(pufVal(),0),ex=pufExcess();let amt=ex?String(ex).replace('.',','):'',to=vermAcc();
  const goals=S.goals.filter(g=>!g.done&&!g.dropped),accs=ALL.filter(a=>a!=p.n);
  const draw=()=>{const v=pNum(amt)||0,lk=isLock(to);
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Überschuss verschieben"><div class="sheet-h"><button id="pmX">Abbrechen</button><b>Verschieben</b><span style="min-width:70px"></span></div>
   <div class="sheet-b es"><div class="mmsum"><div>Puffer<b>${eur0(pufVal())}</b></div><div>Über 1.000 €<b class="in">${eur0(ex)}</b></div><div>Danach<b>${eur0(pufVal()-v)}</b></div></div>
    <div class="group"><div class="cell plain"><label for="pmA">Betrag</label><input id="pmA" inputmode="decimal" value="${esc(amt)}"></div></div>
    <div class="chips wrap" style="justify-content:center">${ex?`<button class="chip" data-pq="${ex}">Überschuss ${eur0(ex)}</button>`:''}<button class="chip" data-pq="${Math.floor(free)}">Alles frei ${eur0(free)}</button><button class="chip" data-pq="${Math.round(free/2)}">Hälfte</button></div>
    <div class="sh" style="padding:0">Wohin?</div>
    <div class="pmt">${accs.map(a=>`<button class="pmo ${to==a?'on':''}" data-pt="${esc(a)}"><span class="dotc" style="--c:${COL[a]||'var(--blue)'}"></span>${esc(a)}${isLock(a)?' '+I('lock',12):''}${vaultAccs().includes(a)?'<small>Vermögen</small>':''}</button>`).join('')}
     ${goals.map(g=>`<button class="pmo ${to=='goal:'+g.id?'on':''}" data-pt="goal:${g.id}">${I('target',14)}${esc(g.n)}<small>Sparziel</small></button>`).join('')}</div>
    ${lk?`<div class="tip bad">${I('lock',14)} <b>${esc(to)} hat die Notfallbremse.</b> Den Puffer dorthin zu schieben geht nur mit Begründung und drei Fragen. So wird der Puffer nicht zum zweiten Shoppingbudget.</div>`:''}
    <div class="note" id="pmE" style="padding:0;color:var(--bad)"></div>
    <button class="btn" id="pmS">${v?eur(v)+' verschieben':'Verschieben'}</button></div></div>`;
   $('scrim').onclick=$('pmX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   $('pmA').oninput=()=>{amt=$('pmA').value;const pos=$('pmA').selectionStart;draw();$('pmA').focus();$('pmA').setSelectionRange(pos,pos)};
   document.querySelectorAll('[data-pq]').forEach(b=>b.onclick=()=>{amt=String(b.dataset.pq).replace('.',',');draw()});
   document.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{to=b.dataset.pt;draw()});
   $('pmS').onclick=()=>{const a=Math.round((pNum(amt)||0)*100)/100;if(!a){$('pmE').textContent='Bitte einen Betrag eingeben.';return}
     if(a>free+0.004){$('pmE').textContent=`Mehr als ${eur(free)} geht nicht, sonst fehlt das Geld für deine Fixkosten.`;return}
     if(isLock(to)){$('sheetRoot').innerHTML='';openSheet(null,{type:'tr',b:p.n,to,amt:String(a),n:'Puffer-Überschuss'});return}
     pufMoveDo([[to,a]])}};draw();renderAsst()}
/* ---------- Einzahlen ins Vermögen: Vermögen, Sparziele, Depot ---------- */
const EINRX=/einzahl|\bzahl\b.*\bein$|\bin den tresor|\bins tresor|in den vermögensaufbau|\bins vermögen/;
function openEinzahlung(pre){pre=pre||{};const pa=pufAcc(),VT=vaultCash();if(!VT.length)VT.push(vermAcc());
  const goals=S.goals.filter(g=>!g.done&&!g.dropped),deps=depot().map((h,i)=>[h,i]).filter(([h])=>h.to&&ALL.includes(h.to));
  const srcs=[...(pa&&!isTabu(pa.n)?[pa.n]:[]),...ALL.filter(a=>!isTabu(a)&&(!pa||a!=pa.n))],HK=['Bonus','Geschenk','Steuererstattung','Verkauf','Sonstiges'];
  const def='acc:'+(VT.includes('Vermögensaufbau')?'Vermögensaufbau':VT[0]);
  let amt=pre.amt?String(pre.amt).replace('.',','):'',src=pre.src=='__ext'||srcs.includes(pre.src)?pre.src:(S.lastEinSrc&&srcs.includes(S.lastEinSrc)?S.lastEinSrc:(srcs[0]||'__ext')),to=pre.to||def,d=today(),note='',her=HK.includes(pre.her)?pre.her:'Bonus',buy=false,err='';
  const tgt=()=>{const p=to.indexOf(':'),k=to.slice(0,p),id=to.slice(p+1);
    if(k=='goal'){const g=goals.find(x=>String(x.id)==id);return g?{k,g,acc:g.acct&&ALL.includes(g.acct)?g.acct:(ALL.includes('Sinking Funds')?'Sinking Funds':vermAcc()),lbl:g.n}:null}
    if(k=='dep'){const x=deps.find(([h])=>String(h.id)==id);return x?{k,h:x[0],i:x[1],acc:x[0].to,lbl:x[0].n||x[0].sym}:null}
    return k=='acc'&&ALL.includes(id)?{k,acc:id,lbl:SHORT[id]||id}:null};
  if(!tgt())to=def;
  const freeOf=s=>pa&&s==pa.n?Math.max(pufVal(),0):Math.max(calc(s).rest,0);
  const draw=()=>{const T=tgt(),v=pNum(amt)||0,ext=src=='__ext',same=!!T&&!ext&&src==T.acc,free=ext?0:freeOf(src),isP=!!pa&&src==pa.n,over=!ext&&!same&&v>free+0.004,fut=d>today(),ex=isP?pufExcess():0;
   const opt=(k,lbl,sub,ic,col)=>`<button class="pmo ${to==k?'on':''}" data-et="${esc(k)}">${ic?I(ic,14):`<span class="dotc" style="--c:${col||'var(--blue)'}"></span>`}${esc(lbl)}${sub?`<small>${esc(sub)}</small>`:''}</button>`;
   $('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Einzahlen"><div class="sheet-h"><button id="eiX">Abbrechen</button><b>Einzahlen</b><span style="min-width:70px"></span></div>
   <div class="sheet-b es"><div class="mmsum">${ext?`<div>Woher<b style="font-size:13px">Von außen</b></div><div>Betrag<b class="in">${eur0(v)}</b></div><div>Wohin<b style="font-size:13px">${esc(T?T.lbl:'–')}</b></div>`
     :`<div>${isP?'Puffer jetzt':esc(SHORT[src]||src)+' frei'}<b>${eur0(free)}</b></div><div>Betrag<b class="in">${eur0(v)}</b></div><div>Danach<b class="${!same&&free-v<0?'out':''}">${eur0(same?free:free-v)}</b></div>`}</div>
    <div class="group"><div class="cell plain"><label for="eiA">Betrag</label><input id="eiA" inputmode="decimal" value="${esc(amt)}" placeholder="0,00"></div></div>
    <div class="chips wrap" style="justify-content:center">${ex?`<button class="chip" data-eq="${ex}">Überschuss ${eur0(ex)}</button>`:''}${[50,100,250].map(x=>`<button class="chip" data-eq="${x}">${x} €</button>`).join('')}</div>
    <div class="group"><div class="cell plain"><label for="eiSrc">Woher</label><select id="eiSrc">${srcs.map(a=>`<option value="${esc(a)}" ${src==a?'selected':''}>${esc(a)}</option>`).join('')}<option value="__ext" ${ext?'selected':''}>Von außen</option></select></div>
     ${ext?`<div class="cell plain" style="flex-direction:column;align-items:stretch;gap:6px"><span class="s" style="font-size:12px;color:var(--muted)">Herkunft</span><div class="chips wrap">${HK.map(h=>`<button class="chip ${her==h?'on':''}" data-eh="${h}">${h}</button>`).join('')}</div></div>`:''}
     <div class="cell plain"><label for="eiD">Datum</label><input id="eiD" type="date" value="${d}" style="margin-left:auto"></div>
     <div class="cell plain"><label for="eiN">Notiz</label><input id="eiN" value="${esc(note)}" placeholder="optional"></div></div>
    <div class="sh" style="padding:0">Vermögen</div><div class="pmt">${VT.map(a=>opt('acc:'+a,SHORT[a]||a,'',null,COL[a]||(acc(a)||{}).col)).join('')}</div>
    ${goals.length?`<div class="sh" style="padding:0">Sparziele</div><div class="pmt">${goals.map(g=>opt('goal:'+g.id,g.n,g.ziel?eur0(g.dep.reduce((s,x)=>s+x.a,0))+' von '+eur0(g.ziel):'Sparziel','target')).join('')}</div>`:''}
    ${deps.length?`<div class="sh" style="padding:0">Depot</div><div class="pmt">${deps.map(([h])=>opt('dep:'+h.id,h.n||h.sym,h.to,'chart')).join('')}</div>`:''}
    ${T&&T.k=='dep'?`<div class="group"><div class="cell plain"><div class="t"><div>Gleich als Kauf erfassen</div><div class="s">Öffnet danach die Kauf-Erfassung für ${esc(T.lbl)} mit diesem Betrag</div></div><input type="checkbox" class="switch" id="eiB" ${buy?'checked':''}></div></div>`:''}
    ${same?`<div class="note" style="padding:0">Das Geld liegt schon in ${esc(T.acc)}. Es wird nur für „${esc(T.lbl)}“ reserviert, ohne Umbuchung.</div>`:''}
    ${ext&&T?`<div class="note" style="padding:0">Wird als Einnahme direkt auf ${esc(T.acc)} gebucht. ${pa?'Dein Puffer bleibt unverändert.':''}</div>`:''}
    ${over?`<div class="tip bad">${isP?`Danach fehlen ${eur(v-free)} für deine Fixkosten.`:`${esc(src)} hat nur ${eur(free)} frei. Danach fehlen ${eur(v-free)}.`}</div>`:''}
    ${fut?`<div class="note" style="padding:0">Liegt in der Zukunft: wird als geplante Einzahlung gespeichert und erscheint in der Prognose.</div>`:''}
    <div class="note" id="eiE" style="padding:0;color:var(--bad)">${esc(err)}</div>
    <button class="btn" id="eiS">${over?'Trotzdem einzahlen':v?eur(v)+' einzahlen':'Einzahlen'}</button></div></div>`;
   $('scrim').onclick=$('eiX').onclick=()=>{$('sheetRoot').innerHTML='';renderAsst()};
   $('eiA').oninput=()=>{amt=$('eiA').value;err='';const pos=$('eiA').selectionStart;draw();$('eiA').focus();$('eiA').setSelectionRange(pos,pos)};
   document.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{amt=String(b.dataset.eq).replace('.',',');err='';draw()});
   document.querySelectorAll('[data-eh]').forEach(b=>b.onclick=()=>{her=b.dataset.eh;draw()});
   document.querySelectorAll('[data-et]').forEach(b=>b.onclick=()=>{to=b.dataset.et;err='';draw()});
   $('eiSrc').onchange=()=>{src=$('eiSrc').value;draw()};$('eiD').onchange=()=>{d=$('eiD').value||today();draw()};$('eiN').oninput=()=>{note=$('eiN').value};
   if($('eiB'))$('eiB').onchange=()=>{buy=$('eiB').checked};
   $('eiS').onclick=()=>{const T=tgt(),a=Math.round((pNum(amt)||0)*100)/100;if(!a){err='Bitte einen Betrag eingeben.';draw();return}if(!T){err='Bitte ein Ziel wählen.';draw();return}
     const sn=snap(),gs=JSON.stringify(S.goals),sa=JSON.stringify(S.accts),ext=src=='__ext',same=!ext&&src==T.acc,fut=d>today(),t=d==today()?Date.now():new Date(d+'T12:00').getTime();
     const nm=note.trim()||(ext?her:T.k=='goal'?'Sparziel: '+T.g.n:'Einzahlung '+T.lbl);let eid=null,before=0;
     if(!same){eid=uid();const e=ext?{id:eid,type:'in',b:T.acc,c:her,a,n:nm,t,tg:['einzahlung']}:{id:eid,type:'tr',b:src,to:T.acc,c:'',a,n:nm,t,tg:['einzahlung']};if(T.k=='goal')e.goal=T.g.id;S.exp.push(e)}
     if(T.k=='goal'){before=T.g.dep.reduce((s,x)=>s+x.a,0);T.g.dep.push({a,t,src:ext?'Von außen':src,eid})}
     if(!ext)S.lastEinSrc=src;save();$('sheetRoot').innerHTML='';if(T.k=='goal'&&T.g.ziel)growFrom[T.g.id]=Math.min(before/T.g.ziel,1);render();
     toast(same?`${eur(a)} für ${T.lbl} reserviert.`:`${eur(a)} ${fut?'geplant':'eingezahlt'}: ${ext?'von außen':SHORT[src]||src} → ${T.lbl}`,()=>{restore(sn);S.goals=JSON.parse(gs);S.accts=JSON.parse(sa);refreshA();save();render()});
     try{pnReact(T.k=='dep'?'chart':'coins')}catch(e){}
     if(T.k=='dep'&&buy)setTimeout(()=>openTrade(T.i,'buy',{book:false,amt:a,d:fut?today():d}),350)}};
  draw();renderAsst()}
function vDeposit(l){if(!EINRX.test(l))return false;
  const a=accIn(l),gl=S.goals.filter(g=>!g.done&&!g.dropped).find(g=>l.includes(g.n.toLowerCase())),dh=depot().find(h=>h.to&&((h.n&&l.includes(h.n.toLowerCase()))||(h.sym&&l.includes(h.sym.toLowerCase())))),
    her=/geschenk/.test(l)?'Geschenk':/bonus/.test(l)?'Bonus':/erstattung/.test(l)?'Steuererstattung':/verkauf/.test(l)?'Verkauf':null;
  $('sheetRoot').innerHTML='';openEinzahlung({amt:amtIn(l),to:gl?'goal:'+gl.id:dh?'dep:'+dh.id:a&&vaultAccs().includes(a)?'acc:'+a:null,src:her||/von außen/.test(l)?'__ext':a&&!isTabu(a)?a:null,her});return true}
function maybeAskPuf(force){const p=pufAcc();if(!p||$('sheetRoot').innerHTML||$('lockRoot').innerHTML||!S.onb)return;const k=pkey(period(0));S.pufAsk=S.pufAsk||{};if(S.pufAsk[k]&&!force)return;const ex=pufExcess();if(ex<50){if(force)openPufMove();return}
  const mark=()=>{S.pufAsk[k]=1;save()},v=vermAcc(),sk=ALL.includes('Sinking Funds')?'Sinking Funds':null,h1=Math.round(ex/2*100)/100;
  showAnswer('Monatsabschluss',`<b>${eur(ex)} übrig</b><p>Dein Puffer liegt nach allen Fixkosten über 1.000 €. Wohin soll der Überschuss?</p>`,[
    ['Alles in den Vermögensaufbau',()=>{mark();pufMoveDo([[v,ex]])}],
    ...(sk?[['Halb Vermögensaufbau, halb Sinking Funds',()=>{mark();pufMoveDo([[v,h1],[sk,ex-h1]])}]]:[]),
    ['Selbst aufteilen',()=>{mark();openPufMove()}],['Bleibt im Puffer',()=>{mark();toast('Alles klar, der Überschuss bleibt im Puffer.')}]]);
  $('ansX').onclick=$('scrim').onclick=()=>{mark();$('sheetRoot').innerHTML='';renderAsst()}}
function vaultHtml(inner){const V=vaultAccs();if(!V.length||S.vaultHide)return '';const P=period(0),ys=new Date(new Date().getFullYear(),0,1).getTime();
  const cut=n=>acc(n).baseD||histT(),into=(e)=>e.t<=Date.now()&&((e.type=='tr'&&V.includes(e.to)&&!V.includes(e.b)&&e.t>=cut(e.to))||(e.type=='in'&&V.includes(e.b)&&e.t>=cut(e.b)));
  const mon=S.exp.filter(e=>inP(e,P)&&!isPlan(e)&&into(e)).reduce((s,e)=>s+e.a,0),yr=S.exp.filter(e=>e.t>=ys&&!isPlan(e)&&into(e)).reduce((s,e)=>s+e.a,0);
  const recM=(S.rec||[]).filter(r=>!r.paused&&r.type=='tr'&&V.includes(r.to)).reduce((s,r)=>s+r.a/(r.every||1),0),goal=S.vaultGoal||Math.round((recM||275)*12/100)*100;
  const tot=V.reduce((s,n)=>s+calc(n).rest,0),fix=pufAcc()?(S.rec||[]).filter(r=>!r.paused&&r.b==pufAcc().n&&(r.type=='out'||(r.type=='tr'&&!V.includes(r.to)))).reduce((s,r)=>s+r.a/(r.every||1),0):0,months=fix?tot/fix:0,pc=goal?Math.min(yr/goal,1):0;
  const card=`<button class="vault" id="vault" aria-label="Vermögen. Tippen zum Einzahlen, lange drücken zeigt den Stand.">
   <div class="vault-h"><span class="vault-ic">${I('lock',20)}</span><div class="t"><b>${mon?'+'+eur0(mon)+' diesen Monat eingezahlt':'Diesen Monat noch nichts eingezahlt'}</b><div class="s">${V.map(n=>esc(n)).join(' · ')} · tippen zum Einzahlen</div></div></div>
   <div class="bar" style="height:8px"><i style="width:${(pc*100).toFixed(0)}%;background:var(--ok)"></i></div>
   <div class="vault-f"><span>${eur0(yr)} von ${eur0(goal)} Jahresziel</span><span>${months?`Polster für ${months.toLocaleString('de-DE',{maximumFractionDigits:1})} Monate Fixkosten`:''}</span></div>
   <div class="vault-x" id="vaultX" hidden>Stand: <b>${eur(tot)}</b><small>verschwindet gleich wieder</small></div></button>`;return inner?card:`<div class="sec"><div class="sh">Vermögen</div>${card}</div>`}
function bindVault(){const v=$('vault');if(!v)return;let t=null,shown=false;const show=()=>{shown=true;$('vaultX').hidden=false;if(navigator.vibrate)navigator.vibrate(15);setTimeout(()=>{if($('vaultX'))$('vaultX').hidden=true},10000)};
  v.onpointerdown=()=>{shown=false;t=setTimeout(show,600)};v.onpointerup=v.onpointerleave=v.onpointercancel=()=>clearTimeout(t);v.oncontextmenu=e=>e.preventDefault();
  v.onclick=()=>{if(!shown)openEinzahlung()}}


/* ---------- Online-Sync (Supabase, Ende-zu-Ende verschlüsselt) ---------- */
/* ---------- push notifications ---------- */
const PUSH_FN=`// Supabase Edge Function "push" v9: Mitteilungen + Daily Briefing für CashFlow (Web Push)
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";
const sb = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron" };
const J = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { ...cors, "Content-Type": "application/json" } });
const UA = { "User-Agent": "Mozilla/5.0" };
async function cfg() {
  let { data } = await sb.from("push_cfg").select("*").eq("id", 1).single();
  if (!data.vapid_public) { const k = webpush.generateVAPIDKeys(); await sb.from("push_cfg").update({ vapid_public: k.publicKey, vapid_private: k.privateKey }).eq("id", 1); data = { ...data, vapid_public: k.publicKey, vapid_private: k.privateKey }; }
  webpush.setVapidDetails("https://dortenestler-cyber.github.io/cashflow-app/", data.vapid_public, data.vapid_private); return data;
}
async function sendTo(uid, msg) {
  const { data: subs } = await sb.from("push_subs").select("*").eq("user_id", uid); let n = 0;
  for (const s of subs || []) {
    try { await webpush.sendNotification(s.sub, JSON.stringify(msg), { TTL: 86400 }); n++; }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", s.endpoint); }
  }
  return n;
}
// ---- Briefing ----
function berlin(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d).map((x) => [x.type, x.value]));
  return { wd: p.weekday, ymd: p.year + "-" + p.month + "-" + p.day, min: (+p.hour % 24) * 60 + +p.minute, dm: (+p.day) + "." + (+p.month) + "." };
}
const E0 = (v) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
const PC = (v) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(1).replace(".", ",") + " %";
async function move(p, ws) {
  try {
    if (p.t === "krypto") {
      if (ws) {
        const c = await (await fetch("https://api.exchange.coinbase.com/products/" + p.s.toUpperCase() + "-EUR/candles?granularity=86400", { headers: UA })).json();
        if (!Array.isArray(c) || !c.length) return null; const last = c[0][4], base = (c.find((x) => x[0] * 1000 <= ws) || c[c.length - 1])[3];
        return base ? (last / base - 1) * 100 : null;
      }
      const s = await (await fetch("https://api.exchange.coinbase.com/products/" + p.s.toUpperCase() + "-EUR/stats", { headers: UA })).json();
      const o = +s.open, l = +s.last; return o && l ? (l / o - 1) * 100 : null;
    }
    let sym = p.s;
    if (/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(sym)) {
      const j = await (await fetch("https://query2.finance.yahoo.com/v1/finance/search?quotesCount=6&q=" + sym, { headers: UA })).json();
      const qs = j.quotes || []; const x = qs.find((q) => /\\.DE$/.test(q.symbol)) || qs[0]; if (x) sym = x.symbol;
    }
    const r = (await (await fetch("https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym) + "?range=" + (ws ? "1mo" : "5d") + "&interval=1d", { headers: UA })).json()).chart.result[0];
    const ts = r.timestamp || [], cl = r.indicators.quote[0].close || [], pts = ts.map((t, i) => [t * 1000, cl[i]]).filter((x) => x[1] != null); if (pts.length < 2) return null;
    const last = pts[pts.length - 1][1];
    if (ws) { const before = pts.filter((x) => x[0] < ws); const base = before.length ? before[before.length - 1][1] : pts[0][1]; return (last / base - 1) * 100; }
    return (last / pts[pts.length - 2][1] - 1) * 100;
  } catch (_) { return null; }
}
async function compose(d, kind) {
  const B = berlin(), L = [], now = Date.now();
  const age = now - (d.at || 0);
  if (d.acc && d.acc.length) L.push(d.acc.map((a) => a.n + " " + E0(a.v)).join(" · "));
  if (d.vm != null) L.push("Vermögen: +" + E0(d.vm) + " diesen Monat");
  if (kind === "e" && d.sp && d.sp.d === B.ymd) L.push("Heute ausgegeben: " + E0(d.sp.v));
  if (d.pos && d.pos.length) {
    const mv = []; let tot = 0, val = 0;
    let wsum = 0, wpc = 0; for (const p of d.pos.slice(0, 15)) { const m = await move(p); if (m == null) continue; mv.push({ n: p.n, m }); tot += (p.v || 0) * m / 100; val += p.v || 0; wsum += p.w || 0; wpc += (p.w || 0) * m; }
    if (mv.length) {
      mv.sort((a, b) => Math.abs(b.m) - Math.abs(a.m));
      L.push((kind === "m" ? "Depot Vortag: " : "Depot heute: ") + (val ? (tot >= 0 ? "+" : "−") + E0(Math.abs(tot)) + " (" + PC(tot / val * 100) + ")" : wsum ? PC(wpc / wsum) : ""));
      L.push(mv.slice(0, 5).map((x) => x.n + " " + PC(x.m)).join(" · "));
    }
    if (kind === "m" && (B.wd === "Sat" || B.wd === "Sun")) {
      const di = B.wd === "Sat" ? 5 : 6, ws = Date.parse(B.ymd + "T00:00:00Z") - di * 864e5 - 3600e3; const wv = []; let wt = 0, wval = 0;
      let ww = 0, wwp = 0; for (const p of d.pos.slice(0, 15)) { const m = await move(p, ws); if (m == null) continue; wv.push({ n: p.n, m }); wt += (p.v || 0) * m / (100 + m); wval += (p.v || 0) / (1 + m / 100); ww += p.w || 0; wwp += (p.w || 0) * m; }
      if (wv.length) { wv.sort((a, b) => b.m - a.m); L.push("Woche: " + (wval ? (wt >= 0 ? "+" : "−") + E0(Math.abs(wt)) + " (" + PC(wt / wval * 100) + ")" : ww ? PC(wwp / ww) : "")); L.push(wv.map((x) => x.n + " " + PC(x.m)).join(" · ")); }
    }
  }
  const days = kind === "m" ? 4 : 2, start = kind === "m" ? 0 : 1, ev = {};
  for (const e of d.ev || []) { const dd = Math.round((Date.parse(e.d + "T12:00:00Z") - Date.parse(B.ymd + "T12:00:00Z")) / 864e5); if (dd >= start && dd < days) (ev[dd] = ev[dd] || []).push(e.t); }
  const lab = (k) => k == 0 ? "Heute" : k == 1 ? "Morgen" : new Date(Date.parse(B.ymd + "T12:00:00Z") + k * 864e5).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric", timeZone: "Europe/Berlin" });
  const ks = Object.keys(ev).map(Number).sort((a, b) => a - b);
  if (ks.length) ks.forEach((k) => L.push(lab(k) + ": " + ev[k].slice(0, 4).join(", ")));
  else L.push(kind === "m" ? "Keine besonderen Termine in den nächsten 3 Tagen." : "Morgen steht nichts Besonderes an.");
  if (age > 12 * 3600e3) L.push("(Kontostände von " + new Date(d.at).toLocaleString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", hour: "2-digit", minute: "2-digit" }) + ")");
  return { title: (kind === "m" ? "Guten Morgen ☀️ " : "Tagesbilanz 🌙 ") + B.wd.replace("Mon", "Mo").replace("Tue", "Di").replace("Wed", "Mi").replace("Thu", "Do").replace("Fri", "Fr").replace("Sat", "Sa").replace("Sun", "So") + ", " + B.dm, body: L.join("\\n"), tag: "brief-" + kind };
}
async function siriPush(uid, txt, big) {
  const { data: r } = await sb.from("push_brief").select("data").eq("user_id", uid).maybeSingle(); const d = r && r.data; if (!d || !d.opt || d.opt.s === false) return;
  const t = big ? "Neuer Beleg in CashFlow" : d.opt.a ? "Siri: " + (txt.length > 80 ? txt.slice(0, 79) + "…" : txt) : "Neue Siri-Eingabe";
  await sendTo(uid, { title: t, body: "Tippe, um den Eintrag zu bestätigen.", tag: "siri" });
}
async function payPush(uid, txt) {
  const { data: r } = await sb.from("push_brief").select("data").eq("user_id", uid).maybeSingle(); const d = r && r.data; if (!d || !d.opt || d.opt.p === false) return;
  const head = txt.replace(/^apple ?pay\\s*:?\\s*/i, "").split("·")[0];
  const m = head.match(/(\\d{1,3}(?:\\.\\d{3})+,\\d{2}|\\d+[.,]\\d{1,2}|\\d+)\\s*(?:€|eur\\b|euro\\b)?/i);
  const amt = m ? +m[1].replace(/\\.(?=\\d{3})/g, "").replace(",", ".") : 0;
  const shop = (m ? head.replace(m[0], " ") : head).replace(/€|\\beur\\b|\\beuro\\b/gi, " ").replace(/\\s+/g, " ").trim() || "Apple Pay";
  const k = shop.toLowerCase().replace(/[0-9.,/€-]+/g, " ").replace(/\\s+/g, " ").trim();
  const mb = d.mb || {}; let bn = mb[k]; if (!bn && k) { const hit = Object.keys(mb).find((x) => k.startsWith(x) || x.startsWith(k)); if (hit) bn = mb[hit]; }
  const a = bn && (d.acc || []).find((x) => x.n === bn); const EC = (v) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);
  let body = "Tippe, um die Zahlung zu bestätigen.";
  if (a) {
    if (amt > 0) { a.v = Math.round(a.v - amt); if (a.d != null && d.left) a.d = Math.max(0, Math.round(a.v / d.left)); await sb.from("push_brief").update({ data: d }).eq("user_id", uid); }
    body = d.opt.a ? bn + ": noch ca. " + E0(a.v) + (a.d != null ? " · " + E0(a.d) + " pro Tag" : "") + ". Tippe zum Bestätigen."
      : (a.v < 0 ? bn + " ist überzogen." : a.d != null && a.d < 5 ? bn + " wird knapp." : bn + " liegt im Plan.") + " Tippe zum Bestätigen.";
  }
  await sendTo(uid, { title: d.opt.a && amt ? shop + " " + EC(amt) : "Apple Pay: " + shop, body, tag: "pay" });
}
async function stale() {
  const B = berlin(); if (B.min < 600 || B.min > 1260) return;
  const { data: rows } = await sb.from("push_brief").select("user_id,data,updated_at");
  for (const r of rows || []) {
    const d = r.data || {}; if (d.st === B.ymd || Date.now() - Date.parse(r.updated_at || 0) < 48 * 3600e3) continue;
    const { count } = await sb.from("inbox").select("id", { count: "exact", head: true }).eq("user_id", r.user_id); if (!count) continue;
    await sendTo(r.user_id, { title: "CashFlow wartet auf dich", body: count + (count === 1 ? " Eintrag" : " Einträge") + " aus Siri oder Apple Pay " + (count === 1 ? "wartet" : "warten") + " auf Bestätigung.", tag: "stale" });
    d.st = B.ymd; await sb.from("push_brief").update({ data: d }).eq("user_id", r.user_id);
  }
}
async function briefs() {
  const B = berlin(), we = B.wd === "Sat" || B.wd === "Sun"; let n = 0;
  const { data: rows } = await sb.from("push_brief").select("*");
  for (const r of rows || []) {
    const d = r.data || {}, o = d.opt || {}, tm = we ? (o.mw != null ? +o.mw : 480) : (o.mt != null ? +o.mt : 390), te = o.et != null ? +o.et : 1080;
    if (o.m !== false && B.min >= tm && B.min < tm + 90 && r.sent_m !== B.ymd) { await sendTo(r.user_id, await compose(d, "m")); await sb.from("push_brief").update({ sent_m: B.ymd }).eq("user_id", r.user_id); n++; }
    if (o.e !== false && B.min >= te && B.min < te + 90 && r.sent_e !== B.ymd) { await sendTo(r.user_id, await compose(d, "e")); await sb.from("push_brief").update({ sent_e: B.ymd }).eq("user_id", r.user_id); n++; }
  }
  return n;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const c = await cfg(); const qp = Object.fromEntries(new URL(req.url).searchParams); const isGet = req.method === "GET"; const body = Object.assign(isGet ? {} : await req.json().catch(() => ({})), qp.op ? qp : {});
    const SAY = (s, st = 200, extra = {}) => isGet ? new Response(s, { status: st, headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } }) : J({ say: s, ...extra }, st);
    if (req.headers.get("x-cron") && req.headers.get("x-cron") === c.secret) {
      const { data: q } = await sb.from("push_queue").select("*").eq("sent", false).lte("at", new Date().toISOString()).order("at").limit(200);
      for (const m of q || []) {
        if (Date.now() - new Date(m.at).getTime() < 6 * 3600e3) await sendTo(m.user_id, { title: m.title, body: m.body, tag: m.tag });
        await sb.from("push_queue").update({ sent: true }).eq("id", m.id);
      }
      await sb.from("push_queue").delete().eq("sent", true).lt("at", new Date(Date.now() - 7 * 864e5).toISOString());
      let b = 0; try { b = await briefs(); } catch (_) {} try { await stale(); } catch (_) {} try { await sb.from("push_cfg").update({ last_cron: new Date().toISOString() }).eq("id", 1); } catch (_) {}
      return J({ ok: true, n: (q || []).length, briefs: b });
    }
    if (body.op === "siri") {
      const raw = String(body.k || ""); if (raw.length < 16) return SAY("Kein gültiger CashFlow-Schlüssel im Kurzbefehl.", 401);
      const hb = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw))); const kh = Array.from(hb).map((x) => x.toString(16).padStart(2, "0")).join("");
      const { data: kr } = await sb.from("siri_keys").select("user_id").eq("key_hash", kh).maybeSingle();
      if (!kr) return SAY("Dieser Schlüssel ist nicht mehr gültig. Bitte in CashFlow unter Siri und Kurzbefehle neu erzeugen.", 401);
      const su = kr.user_id;
      if (body.m === "leisten" || body.m === "woche" || body.m === "ics") {
        const { data: r } = await sb.from("push_brief").select("data").eq("user_id", su).maybeSingle(); const d = (r && r.data) || null;
        if (!d) return SAY("Noch keine Daten. Öffne CashFlow einmal mit eingeschalteten Mitteilungen.");
        const B = berlin();
        if (body.m === "woche") {
          const lim = new Date(Date.parse(B.ymd + "T12:00:00Z") + 7 * 864e5).toISOString().slice(0, 10);
          const L = (d.cal || d.ev || []).filter((e) => e.d >= B.ymd && e.d <= lim);
          return SAY(L.length ? "Diese Woche: " + L.slice(0, 8).map((e) => (e.d === B.ymd ? "heute" : new Date(e.d + "T12:00:00Z").toLocaleDateString("de-DE", { weekday: "long", timeZone: "Europe/Berlin" })) + " " + e.t).join(", ") + "." : "In den nächsten 7 Tagen steht nichts an.");
        }
        if (body.m === "leisten") {
          const t = String(body.txt || ""), mm = t.match(/(\\d+(?:[.,]\\d{1,2})?)/), a = mm ? +mm[1].replace(",", ".") : 0;
          if (!a) return SAY("Sag einen Betrag, zum Beispiel: 80 Euro.");
          const low = t.toLowerCase(), accs = (d.acc || []).filter((x) => x.d != null);
          const acc = accs.find((x) => low.includes(x.n.toLowerCase())) || accs.find((x) => /gönn/i.test(x.n)) || accs[0];
          if (!acc) return SAY("Ich finde kein Budget.");
          const after = acc.v - a, pd = Math.max(after, 0) / Math.max(d.left || 1, 1);
          let s = after < 0 ? "Nein. " + acc.n + " hat nur noch " + E0(acc.v) + ". Es würden " + E0(-after) + " fehlen." : (a >= 50 || pd < 5 ? "Ja, aber. " : "Ja. ") + acc.n + " hat noch " + E0(acc.v) + ". Danach blieben " + E0(after) + ", also " + E0(pd) + " pro Tag.";
          if (a >= 50) s += " Ab 50 Euro gilt deine Regel: erst auf die Wunschliste.";
          return SAY(s);
        }
        const es = (x) => String(x).replace(/[,;]/g, (c) => "\\\\" + c), stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
        const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CashFlow//DE", "CALSCALE:GREGORIAN", "X-WR-CALNAME:CashFlow", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H"];
        (d.cal || []).forEach((e, i) => { const dt = e.d.replace(/-/g, ""), nx = new Date(Date.parse(e.d + "T12:00:00Z") + 864e5).toISOString().slice(0, 10).replace(/-/g, "");
          L.push("BEGIN:VEVENT", "UID:" + dt + "-" + (e.u || i) + "@cashflow", "DTSTAMP:" + stamp, "DTSTART;VALUE=DATE:" + dt, "DTEND;VALUE=DATE:" + nx, "SUMMARY:" + es(e.t), "TRANSP:TRANSPARENT", "END:VEVENT"); });
        L.push("END:VCALENDAR");
        return new Response(L.join("\\r\\n"), { headers: { ...cors, "Content-Type": "text/calendar; charset=utf-8" } });
      }
      if (body.m === "stand") {
        const { data: r } = await sb.from("push_brief").select("data,updated_at").eq("user_id", su).maybeSingle(); const d = (r && r.data) || null;
        if (!d) return SAY("Noch keine Daten. Öffne CashFlow einmal mit eingeschalteten Mitteilungen.");
        const B = berlin(), L = []; const at = d.at ? new Date(d.at) : null;
        if (d.acc && d.acc.length) L.push(d.acc.map((a) => a.n + ": noch " + E0(a.v) + (a.d != null ? ", heute " + E0(a.d) : "")).join(". ") + ".");
        if (d.sp && d.sp.d === B.ymd && d.sp.v) L.push("Heute ausgegeben: " + E0(d.sp.v) + ".");
        if (d.vm) L.push("Ins Vermögen diesen Monat: " + E0(d.vm) + ".");
        const evs = (d.ev || []).filter((e) => e.d >= B.ymd).slice(0, 4).map((e) => (e.d === B.ymd ? "heute " : "") + e.t); if (evs.length) L.push("Demnächst: " + evs.join(", ") + ".");
        if (d.pos && d.pos.length) { let ws = 0, wp = 0; for (const p of d.pos.slice(0, 10)) { const m = await move(p); if (m == null) continue; ws += p.w || 0; wp += (p.w || 0) * m; } if (ws) L.push("Depot heute " + PC(wp / ws) + "."); }
        if (at) L.push("Stand " + new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "long", hour: "2-digit", minute: "2-digit" }).format(at) + " Uhr.");
        return SAY(L.join(" ") || "Keine Daten vorhanden.", 200, { v: 9 });
      }
      const txt0 = String(body.txt || "").trim(), big = /^(beleg|mitteilung|mail|sms)\\s*:/i.test(txt0), txt = txt0.slice(0, big ? 4000 : 300); if (!txt) return SAY("Ich habe nichts verstanden.");
      const { count } = await sb.from("inbox").select("id", { count: "exact", head: true }).eq("user_id", su); if ((count || 0) >= 50) return SAY("Die Ablage ist voll. Öffne CashFlow einmal, dann geht es weiter.");
      const { error } = await sb.from("inbox").insert({ user_id: su, txt }); if (error) return SAY("Konnte nicht speichern.", 500);
      if (/^apple ?pay/i.test(txt)) { try { await payPush(su, txt); } catch (_) {} } else { try { await siriPush(su, txt, big); } catch (_) {} }
      return SAY(big ? "In CashFlow abgelegt. Beim Öffnen bestätigen." : "Notiert: " + txt, 200, { v: 9 });
    }
    if (body.op === "ping") return J({ pong: true, v: 9 });
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\\s+/i, "");
    const { data: u } = await sb.auth.getUser(jwt); const uid = u && u.user && u.user.id;
    if (!uid) return J({ error: "not signed in" }, 401);
    if (body.op === "key") { const { data: br } = await sb.from("push_brief").select("sent_m,sent_e,updated_at").eq("user_id", uid).maybeSingle(); const { count: subs } = await sb.from("push_subs").select("endpoint", { count: "exact", head: true }).eq("user_id", uid); return J({ key: c.vapid_public, v: 9, cron: c.last_cron || null, sm: br && br.sent_m, se: br && br.sent_e, bu: br && br.updated_at, subs: subs || 0, now: berlin().ymd }); }
    if (body.op === "sub") { await sb.from("push_subs").upsert({ endpoint: body.sub.endpoint, user_id: uid, sub: body.sub }); return J({ ok: true }); }
    if (body.op === "unsub") { await sb.from("push_subs").delete().eq("endpoint", body.endpoint).eq("user_id", uid); return J({ ok: true }); }
    if (body.op === "plan") {
      await sb.from("push_queue").delete().eq("user_id", uid).eq("sent", false);
      const items = (body.items || []).slice(0, 30).map((x) => ({ user_id: uid, at: new Date(x.at).toISOString(), title: String(x.title).slice(0, 120), body: String(x.body || "").slice(0, 300), tag: x.tag || null }));
      if (items.length) await sb.from("push_queue").insert(items);
      return J({ ok: true, n: items.length, v: 9 });
    }
    if (body.op === "brief") { const { error } = await sb.from("push_brief").upsert({ user_id: uid, data: body.data, updated_at: new Date().toISOString() }); if (error) return J({ error: error.message }, 500); return J({ ok: true, v: 9 }); }
    if (body.op === "brieftest") { const { data: r } = await sb.from("push_brief").select("*").eq("user_id", uid).single(); const d = (r && r.data) || body.data || {}; const m = await compose(d, body.kind === "e" ? "e" : "m"); const n = await sendTo(uid, m); if (body.real && n) await sb.from("push_brief").update(body.kind === "e" ? { sent_e: berlin().ymd } : { sent_m: berlin().ymd }).eq("user_id", uid); return J({ ok: true, sent: n, msg: m }); }
    if (body.op === "siri_key") { const kh = String(body.h || ""); if (!/^[0-9a-f]{64}$/.test(kh)) return J({ error: "bad key" }, 400); await sb.from("siri_keys").delete().eq("user_id", uid); const { error } = await sb.from("siri_keys").insert({ user_id: uid, key_hash: kh }); if (error) return J({ error: error.message }, 500); return J({ ok: true, v: 9 }); }
    if (body.op === "inbox") { const { data: rows, error } = await sb.from("inbox").select("id,txt,created_at").eq("user_id", uid).order("id").limit(50); if (error) return J({ error: error.message }, 500); return J({ items: rows || [], v: 9 }); }
    if (body.op === "inbox_del") { const ids = (body.ids || []).map(Number).filter(Boolean); if (ids.length) await sb.from("inbox").delete().eq("user_id", uid).in("id", ids); return J({ ok: true }); }
    if (body.op === "test") return J({ ok: true, sent: await sendTo(uid, { title: "CashFlow", body: "Mitteilungen funktionieren. 👍", tag: "test" }) });
    return J({ error: "unknown op" }, 400);
  } catch (e) { return J({ error: String(e) }, 500); }
});`;
const PUSH_SQL=()=>`create extension if not exists pg_cron;
create extension if not exists pg_net;
create table if not exists public.push_cfg (id int primary key default 1, secret text not null default gen_random_uuid()::text, vapid_public text, vapid_private text);
insert into public.push_cfg (id) values (1) on conflict do nothing;
alter table public.push_cfg add column if not exists last_cron timestamptz;
create table if not exists public.push_subs (endpoint text primary key, user_id uuid not null references auth.users on delete cascade, sub jsonb not null, created_at timestamptz default now());
create table if not exists public.push_queue (id bigserial primary key, user_id uuid not null references auth.users on delete cascade, at timestamptz not null, title text not null, body text, tag text, sent boolean not null default false);
create table if not exists public.push_brief (user_id uuid primary key references auth.users on delete cascade, data jsonb, updated_at timestamptz default now(), sent_m text, sent_e text);
alter table public.push_brief enable row level security;
alter table public.push_cfg enable row level security;
alter table public.push_subs enable row level security;
alter table public.push_queue enable row level security;
create table if not exists public.siri_keys (user_id uuid primary key references auth.users on delete cascade, key_hash text not null unique, created_at timestamptz default now());
create table if not exists public.inbox (id bigserial primary key, user_id uuid not null references auth.users on delete cascade, txt text not null, created_at timestamptz default now());
alter table public.siri_keys enable row level security;
alter table public.inbox enable row level security;
select cron.schedule('cashflow-push', '*/10 * * * *', $cron$ select net.http_post(url := '__URL__/functions/v1/push', headers := jsonb_build_object('Content-Type','application/json','x-cron',(select secret from public.push_cfg where id = 1)), body := '{}'::jsonb) $cron$);`.replace('__URL__',(SY.url||SYDEF).replace(/\/$/,''));
const PUSHK='cf_push',pushOn=()=>{try{return localStorage.getItem(PUSHK)==='1'}catch(e){return false}};
const pushSupported=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
async function pushCall(op,extra){const r=await syFetch('/functions/v1/push',{method:'POST',body:JSON.stringify(Object.assign({op},extra||{}))});let j={};try{j=await r.json()}catch(e){}if(!r.ok)throw new Error(j.error||('Fehler '+r.status));return j}
function pushKeyBytes(b64){const s=b64.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((b64.length+3)%4);return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function pushEnable(){if(!syOn())throw new Error('Zuerst die Online-Synchronisierung einrichten.');if(!pushSupported())throw new Error(/iPhone|iPad/.test(navigator.userAgent)&&!STANDALONE?'Öffne die App vom Home-Bildschirm, nicht im Browser.':'Dieses Gerät oder dieser Browser kann keine Mitteilungen.');
  const perm=await Notification.requestPermission();if(perm!=='granted')throw new Error('Mitteilungen sind nicht erlaubt. In den iPhone-Einstellungen › Mitteilungen › CashFlow erlauben.');
  const {key}=await pushCall('key');const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKeyBytes(key)});
  await pushCall('sub',{sub:sub.toJSON()});localStorage.setItem(PUSHK,'1');S.pushOpt=S.pushOpt||{fix:true,fc:true,due:true,ctr:true,wish:true,chk:true,amt:false};save();await pushPlan(true)}
async function pushDisable(){try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(sub){try{await pushCall('unsub',{endpoint:sub.endpoint})}catch(e){}await sub.unsubscribe()}}catch(e){}try{localStorage.removeItem(PUSHK)}catch(e){}}
function pTimes(){const O=S.pushOpt||{};return{qf:O.qf!=null?+O.qf:22,qt:O.qt!=null?+O.qt:8,mt:O.mt!=null?+O.mt:390,mw:O.mw!=null?+O.mw:480,et:O.et!=null?+O.et:1080,max:O.max!=null?+O.max:5}}
const hhmm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
function pushQuiet(d){const T=pTimes(),x=new Date(d),h=x.getHours(),q=T.qf>T.qt?(h>=T.qf||h<T.qt):(h>=T.qf&&h<T.qt);if(!q)return x;if(T.qf>T.qt&&h>=T.qf)x.setDate(x.getDate()+1);x.setHours(T.qt,0,0,0);return x}
const at9=(d,dd=0)=>{const x=new Date(d);x.setDate(x.getDate()+dd);x.setHours(9,0,0,0);return x};
function pushItems(){const O=S.pushOpt||{},A=!!O.amt,E=v=>A?' ('+eur(v)+')':'',now0=Date.now(),L=[],add=(at,title,body,tag)=>{const d=pushQuiet(at);if(d.getTime()>now0+60e3&&d.getTime()<now0+35*864e5)L.push({at:d.getTime(),title,body,tag})};
  if(O.fix!==false){const fg=fixGuard();if(fg){const d=at9(fg.at.d,-2);add(d.getTime()<now0?now0+5*6e4:d,fg.min<0?`${fg.n} reicht am ${dmy(fg.at.d)} nicht`:`${fg.n} wird am ${dmy(fg.at.d)} knapp`,`${fg.big.map(x=>x.n).join(', ')} geht ab${A?', danach '+eur(fg.min):''}. Jetzt umbuchen?`,'fix')}}
  if(O.fc!==false)BUDG.forEach(b=>{const f=budForecast(b);if(f){const d=new Date();d.setDate(d.getDate()+1);d.setHours(18,30,0,0);add(d,`${b} reicht nur bis ca. ${dmy(f.when)}`,`Bei deinem Tempo wird es eng. ${A?'Höchstens '+eur(f.perDay)+' pro Tag, dann reicht es.':'Heute bewusst sparsam bleiben.'}`,'fc-'+b)}});
  if(O.due!==false)[0,1].forEach(o=>{const P=period(o),k=pkey(P);(S.rec||[]).forEach(r=>{if(r.paused||r.a<100||r.type=='in')return;const d=recDue(r,P);if(!d||S.exp.some(e=>e.rid==r.id&&e.pk==k))return;if(isTabu(r.to||''))return;add(at9(d,-1),'Morgen: '+(r.n||r.c),`${r.n||r.c}${E(r.a)} wird morgen von ${r.b} abgebucht.`,'due-'+r.id)})});
  if(O.run!==false)[0,1].forEach(o=>{const P=period(o),k=pkey(P);(S.rec||[]).forEach(r=>{if(r.paused)return;const d=recDue(r,P);if(!d||S.exp.some(e=>e.rid==r.id&&e.pk==k))return;if(isTabu(r.to||''))return;const x=new Date(d);x.setHours(9,0,0,0);add(x,'Heute fällig: '+(r.n||r.c),`${r.n||r.c}${E(r.a)} wird heute ${r.type=='in'?'auf '+r.b+' gebucht':'von '+r.b+' abgebucht'}.`,'run-'+r.id+'-'+k)})});
  if(O.ctr!==false)(S.contracts||[]).forEach(c=>{if(c.state=='cancelled')return;const x=contractNext(c);if(!x.kd)return;[14,3].forEach(dd=>add(at9(x.kd,-dd),`Kündigungsfrist: ${c.n}`,`Noch ${dd} Tage, bis ${x.kd.toLocaleDateString('de-DE')} kündigen oder bewusst verlängern.`,'ctr-'+c.id+'-'+dd))});
  if(O.wish!==false)(S.wish||[]).forEach(w=>{if(w.s!='offen')return;add(new Date(w.t+wait(w.p)),'Wartezeit vorbei: '+(w.n||'Wunsch'),'Jetzt entscheiden: kaufen, sparen oder loslassen?','wish-'+w.id)});
  if(O.chk!==false){const d=new Date();d.setDate(d.getDate()+((7-d.getDay())%7||7));d.setHours(18,0,0,0);add(d,'Wochen-Check-in','Fünf Minuten: Wie lief die Woche, was nimmst du dir vor?','chk')}
  if(O.rg!==false){if(!S.rgSince)S.rgSince=Date.now();S.exp.filter(e=>isKonsum(e)&&e.rg==null&&!isPlan(e)&&e.t>=S.rgSince-864e5&&e.t>now0-864e5).slice(-3).forEach(e=>add(new Date(e.t+24*36e5),'Reue-Check: '+(e.n||e.c),'Hat sich der Kauf'+(A?' für '+eur(e.a):'')+' gelohnt? Kurz in der App antworten.','rg-'+e.id))}
  {let PO;try{PO=JSON.parse(localStorage.getItem('cf_po')||'{}')}catch(e){PO={}}const once=(tag,at,title,body)=>{if(PO[tag]&&PO[tag]<now0)return;if(!PO[tag])PO[tag]=pushQuiet(at).getTime();add(new Date(Math.max(PO[tag],now0+90e3)),title,body,tag)},soon=now0+5*6e4,P=period(0),k=pkey(P);
   Object.keys(PO).forEach(t=>{if(PO[t]<now0-60*864e5)delete PO[t]});
   if(O.sal!==false)[0,1].forEach(o=>{const Pp=period(o),kk=pkey(Pp);(S.rec||[]).forEach(r=>{if(r.paused||r.type!='in'||r.a<300)return;const d=recDue(r,Pp);if(!d)return;const x=new Date(d);x.setHours(10,0,0,0);once('sal-'+r.id+'-'+kk,x,(r.n||r.c||'Gehalt')+' sollte heute da sein','Jetzt verteilen: Budgets füllen, Vermögen zuerst. Tippe für den Monatsabschluss.')})});
   if(O.b80!==false)BUDG.filter(b=>!isK(b)&&!isTabu(b)).forEach(b=>{const c=calc(b);if(c.total>0&&c.pct>=.8&&c.rest>0&&P.left>3)once('b80-'+b+'-'+k,soon,b+': 80 % verbraucht','Noch '+P.left+' Tage im Monat'+(A?', '+eur(c.rest)+' übrig, also '+eur(c.rest/Math.max(P.left,1))+' pro Tag':'')+'.')});
   if(O.abo!==false){(S.rec||[]).forEach(r=>{if(r.paused||r.type!='out')return;const E2=S.exp.filter(e=>e.rid==r.id&&!isPlan(e)).sort((a,b)=>b.t-a.t);if(E2.length<2)return;const a1=E2[0].a,a0=E2[1].a;if(a0>0&&Math.abs(a1-a0)/a0>=.05&&Math.abs(a1-a0)>=1&&now0-E2[0].t<20*864e5)once('abo-'+r.id+'-'+Math.round(a1*100),soon,(r.n||r.c)+(a1>a0?' ist teurer geworden':' ist günstiger geworden'),A?eur(a0)+' → '+eur(a1)+' ('+(a1>a0?'+':'−')+eur(Math.abs(a1-a0)*12)+' im Jahr). Prüfen oder kündigen?':'Der Betrag hat sich geändert. Prüfen oder kündigen?')});
     try{newSubs().forEach(x=>once('sub-'+x.k,soon,'Sieht nach Abo aus: '+x.e.n,x.n+'× im Monatsabstand, aber nicht in den Fixkosten. Aufnehmen?'))}catch(e){}}
   if(O.goal!==false)(S.goals||[]).forEach(g=>{if(g.done||g.dropped||!(g.ziel>0))return;const ist=(g.dep||[]).reduce((s,d)=>s+d.a,0);if(ist>=g.ziel)once('goal-'+g.id,soon,'Sparziel erreicht: '+g.n+' 🎉',A?eur(ist)+' zusammen. Jetzt bewusst entscheiden.':'Jetzt bewusst entscheiden: kaufen oder weitersparen?')});
   if(O.close!==false){const x=new Date(P.e.getTime()-864e5);x.setHours(18,30,0,0);once('close-'+k,x,'Morgen startet der neue Finanzmonat','3 Minuten Monatsabschluss: abgleichen, Rest verteilen, Vorsatz setzen.')}try{localStorage.setItem('cf_po',JSON.stringify(PO))}catch(e){}}
  if(S.urge&&S.urge.until>now0)L.push({at:S.urge.until,title:'10 Minuten sind um',body:'Wie geht es dir mit dem Kaufimpuls? Widerstanden?',tag:'urge'});
  const T=pTimes(),PR=t=>/^(fix|urge|sal)/.test(t)?0:/^(fc|b80)/.test(t)?1:/^(due|run)/.test(t)?2:/^ctr/.test(t)?3:/^wish/.test(t)?4:/^rg/.test(t)?5:6;let K=L;if(T.max>0){const by={};L.forEach(x=>{const k=ymd(x.at);(by[k]=by[k]||[]).push(x)});K=[].concat(...Object.values(by).map(D=>D.sort((a,b)=>PR(a.tag)-PR(b.tag)||a.at-b.at).slice(0,T.max)))}
  return K.sort((a,b)=>a.at-b.at).slice(0,30)}
function briefData(){const O=S.pushOpt||{},showAmt=!!O.amt,P=period(0),k=pkey(P),now0=Date.now(),D=864e5;
  const accL=S.accts.filter(a=>a.vis!==false&&!isTabu(a.n)&&!(pufAcc()&&a.n==pufAcc().n)&&!/comdirect/i.test(a.n)&&!vaultAccs().includes(a.n)&&!depot().some(h=>h.to==a.n)).map(a=>{const c=calc(a.n);return{n:SHORT[a.n]||a.n,v:Math.round(c.rest),d:a.kind=='budget'&&!isK(a.n)&&!isStock(a.n)?Math.max(0,Math.round(c.rest/Math.max(P.left||1,1))):null}});
  const V=vaultAccs(),vm=S.exp.filter(e=>inP(e,P)&&!isPlan(e)&&((e.type=='tr'&&V.includes(e.to)&&!V.includes(e.b))||(e.type=='in'&&V.includes(e.b)))&&e.t<=now0&&e.t>=(acc(e.type=='tr'?e.to:e.b).baseD||histT())).reduce((s,e)=>s+e.a,0);
  const td=new Date();td.setHours(0,0,0,0);const sp=S.exp.filter(e=>e.type=='out'&&!isPlan(e)&&e.t>=td.getTime()&&TOT.includes(e.b)).reduce((s,e)=>s+e.a,0);
  const ev=[],dk=d=>ymd(d.getTime?d.getTime():d),add=(d,t)=>{const x=d.getTime?d.getTime():d;if(x>=td.getTime()&&x<td.getTime()+5*D)ev.push({d:dk(x),t})};
  [0,1].forEach(o=>{const Pp=period(o),kk=pkey(Pp);(S.rec||[]).forEach(r=>{if(r.paused)return;const d=recDue(r,Pp);if(!d||S.exp.some(e=>e.rid==r.id&&e.pk==kk))return;const ra=recA(r,Pp);if(r.type=='in')add(d,(r.n||r.c)+(showAmt?' +'+eur0(ra):''));else if(r.dep&&depot().some(h=>h.id==r.dep)){const h=depot().find(x=>x.id==r.dep);add(d,'Sparplan '+String(h.n||h.sym).split(/\s+/).slice(0,2).join(' ')+(showAmt?' '+eur0(ra):''))}else if(ra>=20&&!isTabu(r.to||''))add(d,(r.n||r.c)+(showAmt?' '+eur0(ra):''))})});
  S.exp.filter(e=>isPlan(e)).forEach(e=>add(new Date(e.t),(e.n||e.c)+(showAmt?' '+eur0(e.a):'')));
  (S.contracts||[]).forEach(c=>{if(c.state=='cancelled')return;const x=contractNext(c);if(x.kd)add(x.kd,'Kündigungsfrist '+c.n)});
  (S.wish||[]).forEach(w=>{if(w.s=='offen')add(new Date(w.t+wait(w.p)),showAmt?'Wartezeit vorbei: '+w.n:'Wartezeit eines Wunschs vorbei')});
  depot().forEach(h=>{if(h.rate&&!h.paused&&!h.rid){for(let i=0;i<5;i++){const d=new Date(td.getTime()+i*D);if(ymd(d.getTime())==ymd(dueIn(d.getFullYear(),d.getMonth(),h.day).getTime()))add(d,'Sparplan '+String(h.n||h.sym).split(/\s+/).slice(0,2).join(' ')+(showAmt?' '+eur0(h.rate):''))}}});
  const fg=fixGuard();if(fg&&fg.min<0)add(fg.at.d,'⚠️ '+fg.n+' reicht nicht');
  const cal=[];{const end=td.getTime()+60*D,cad=(d,t,u)=>{const x=d.getTime?d.getTime():d;if(x>=td.getTime()-864e5&&x<end)cal.push({d:ymd(x),t,u})};
   [0,1,2].forEach(o=>{const Pp=period(o),kk=pkey(Pp);(S.rec||[]).forEach(r=>{if(r.paused||isTabu(r.b))return;const d=recDue(r,Pp);if(!d||S.exp.some(e=>e.rid==r.id&&e.pk==kk))return;const ra=recA(r,Pp);if(r.type=='in')cad(d,'💶 '+(r.n||r.c)+(showAmt?' +'+eur0(ra):''),'r'+r.id);else if(ra>=20&&!isTabu(r.to||''))cad(d,(r.type=='tr'?'↔ ':'💸 ')+(r.n||r.c)+(showAmt?' '+eur0(ra):''),'r'+r.id)})});
   S.exp.filter(e=>isPlan(e)).forEach(e=>cad(new Date(e.t),'🗓 '+(e.n||e.c)+(showAmt?' '+eur0(e.a):''),'p'+e.id));
   (S.contracts||[]).forEach(c=>{if(c.state=='cancelled')return;const x=contractNext(c);if(x.kd)cad(x.kd,'✂️ Kündigungsfrist '+c.n,'c'+c.id)});
   (S.wish||[]).forEach(w=>{if(w.s=='offen')cad(new Date(w.t+wait(w.p)),'⏳ Wartezeit vorbei'+(showAmt?': '+w.n:''),'w'+w.id)});
   cal.sort((a,b)=>a.d<b.d?-1:1)}
  const P0=depot().filter(h=>h.sym&&!h.manual),val=posVal,TV=P0.reduce((s,h)=>s+val(h),0)||1;
  const pos=P0.map(h=>Object.assign({n:String(h.n||h.sym).split(/\s+/).slice(0,2).join(' '),t:h.type=='krypto'?'krypto':'etf',s:h.type=='krypto'?String(h.sym).trim().toUpperCase():(h.ysym||String(h.sym).trim().toUpperCase()),w:Math.round(val(h)/TV*100)/100},showAmt?{v:Math.round(val(h))}:{}));
  const mb={};{const F={},nm=new Set(accL.map(a=>a.n));S.exp.filter(e=>e.type=='out'&&!isPlan(e)&&e.n&&e.t>now0-180*D&&nm.has(SHORT[e.b]||e.b)).forEach(e=>{const k=bKey(e.n);if(!k||k.length<2)return;const f=F[k]=F[k]||{n:0,b:{}};f.n++;const b=SHORT[e.b]||e.b;f.b[b]=(f.b[b]||0)+1});Object.entries(F).sort((x,y)=>y[1].n-x[1].n).slice(0,80).forEach(([k,f])=>{mb[k]=Object.entries(f.b).sort((x,y)=>y[1]-x[1])[0][0]})}
  return{v:1,cal:cal.slice(0,120),at:now0,opt:Object.assign({m:O.bm!==false,e:O.be!==false,p:O.pay!==false,s:O.siri!==false,a:!!O.amt},(({mt,mw,et})=>({mt,mw,et}))(pTimes())),left:P.left,mb,acc:accL,vm:Math.round(vm),sp:{d:ymd(now0),v:Math.round(sp)},ev:ev.slice(0,20),pos}}
let briefLast='';async function briefSend(force){const O=S.pushOpt||{};if(O.bm===false&&O.be===false&&!force)return;const d=briefData(),h=JSON.stringify(Object.assign({},d,{at:0}));if(!force&&h==briefLast)return;try{await pushCall('brief',{data:d});briefLast=h;S.briefOld=false}catch(e){if(/unknown op/.test(String(e.message||e)))S.briefOld=true}}
let pushT=null,pushLast='';async function pushPlan(force){if(!pushOn()||!syOn())return;briefSend(force);try{const items=pushItems(),h=JSON.stringify(items);if(!force&&h==pushLast)return;await pushCall('plan',{items});pushLast=h;S.pushAt=Date.now()}catch(e){}}
function pushSoon(){clearTimeout(pushT);pushT=setTimeout(()=>pushPlan(false),4000)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){clearTimeout(pushT);pushPlan(false)}});
/* ---------- Notfall-Schlüssel & Monats-Sicherung ---------- */
const BAKSQL=`create table if not exists public.cashflow_backup (
  user_id uuid not null references auth.users(id) on delete cascade,
  ym text not null,
  data text not null,
  iv text not null,
  salt text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, ym)
);
alter table public.cashflow_backup enable row level security;
drop policy if exists "nur eigene Sicherungen" on public.cashflow_backup;
create policy "nur eigene Sicherungen" on public.cashflow_backup
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`;
const RKA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',rkNorm=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/O/g,'0').replace(/I/g,'1');
function rkGen(){const b=crypto.getRandomValues(new Uint8Array(20));let t='';b.forEach(x=>t+=RKA[x%32]);return t.match(/.{4}/g).join('-')}
let rkKey=null;async function rkLoad(){if(rkKey)return rkKey;if(SY.rk){rkKey=await crypto.subtle.importKey('raw',ub64(SY.rk),'AES-GCM',true,['encrypt','decrypt']);return rkKey}return null}
async function rkSet(code){SY.rs=b64(crypto.getRandomValues(new Uint8Array(16)));rkKey=await syDerive(rkNorm(code),SY.rs);SY.rk=b64(await crypto.subtle.exportKey('raw',rkKey));SY.bym=null;sySave();S.rkAt=Date.now();save()}
async function bakNow(force){if(!syOn()||!navigator.onLine)return false;const k=await rkLoad();if(!k)return false;const ym=ymd(Date.now()).slice(0,7);if(!force&&SY.bym==ym)return true;
  const iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(S)));
  const r=await syFetch('/rest/v1/cashflow_backup',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:SY.uid,ym,data:b64big(ct),iv:b64(iv),salt:SY.rs,created_at:new Date().toISOString()})});
  if(!r.ok){SY.bakErr=r.status==404||r.status==400?'table':'Fehler '+r.status;sySave();return false}
  SY.bakErr=null;SY.bym=ym;SY.bakAt=Date.now();sySave();const d=new Date();d.setMonth(d.getMonth()-6);syFetch('/rest/v1/cashflow_backup?user_id=eq.'+SY.uid+'&ym=lt.'+ymd(d.getTime()).slice(0,7),{method:'DELETE'}).catch(()=>{});return true}
function openRkSetup(){const code=rkGen();let ok=false;const draw=()=>{$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Notfall-Schlüssel"><div class="sheet-h"><button id="rkX">Abbrechen</button><b>Notfall-Schlüssel</b><button id="rkS" style="font-weight:600" ${ok?'':'disabled'}>Fertig</button></div>
   <div class="sheet-b"><div class="note" style="padding:0">Mit diesem Schlüssel kommst du an deine Daten, falls du das Sync-Passwort vergisst. Er wird nur jetzt angezeigt.</div>
   <div class="rkcode" id="rkCode">${code}</div><button class="btn soft" id="rkCopy">Kopieren</button>
   <div class="anchor">${I('lock',16)}<span>Am besten in der iPhone-App „Passwörter“ als Notiz speichern oder auf Papier aufschreiben. Nicht im selben Ort wie das Sync-Passwort.</span></div>
   <label class="cell plain" style="border-radius:14px;background:var(--card)"><input type="checkbox" id="rkOk" ${ok?'checked':''} style="width:20px;height:20px"><span style="flex:1">Ich habe den Schlüssel sicher notiert.</span></label></div></div>`;
   $('scrim').onclick=$('rkX').onclick=()=>{$('sheetRoot').innerHTML=''};$('rkCopy').onclick=()=>{try{navigator.clipboard.writeText(code).then(()=>toast('Kopiert.'))}catch(e){}};
   $('rkOk').onchange=()=>{ok=$('rkOk').checked;draw()};
   $('rkS').onclick=async()=>{if(!ok)return;await rkSet(code);$('sheetRoot').innerHTML='';const r=await bakNow(true);render();toast(r?'Notfall-Schlüssel gespeichert, erste Sicherung liegt online.':SY.bakErr=='table'?'Schlüssel gespeichert. Jetzt noch die Tabelle in Supabase anlegen (Schritt unten).':'Schlüssel gespeichert. Sicherung folgt beim nächsten Sync.')}};draw()}
function openRkAdd(){$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Notfall-Schlüssel hinterlegen"><div class="sheet-h"><button id="raX">Abbrechen</button><b>Schlüssel hinterlegen</b><button id="raS" style="font-weight:600">Prüfen</button></div>
   <div class="sheet-b"><div class="note" style="padding:0">Gib den Notfall-Schlüssel ein, den du auf dem anderen Gerät erstellt hast. Die App prüft ihn an der letzten Online-Sicherung. Danach sichert auch dieses Gerät jeden Monat.</div>
   <div class="group"><div class="cell plain"><label for="raC">Notfall-Schlüssel</label><input id="raC" placeholder="XXXX-XXXX-…" autocapitalize="characters" style="flex:1;text-align:right"></div></div><div class="note" id="raE" style="padding:0;color:var(--bad)"></div></div></div>`;
  $('scrim').onclick=$('raX').onclick=()=>{$('sheetRoot').innerHTML=''};
  $('raS').onclick=async()=>{const code=$('raC').value,E=$('raE');if(rkNorm(code).length<20){E.textContent='Der Schlüssel hat 20 Zeichen.';return}E.textContent='Prüfe …';
    try{const r=await syFetch('/rest/v1/cashflow_backup?select=*&user_id=eq.'+SY.uid+'&order=ym.desc&limit=1');if(!r.ok)throw new Error(r.status==404?'Die Tabelle für Sicherungen fehlt noch in Supabase.':'Laden ging nicht ('+r.status+').');const row=(await r.json())[0];
      if(!row)throw new Error('Noch keine Online-Sicherung vorhanden. Auf dem anderen Gerät einmal „Jetzt online sichern“ tippen.');
      const k=await syDerive(rkNorm(code),row.salt);try{await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(row.iv)},k,ub64(row.data))}catch(e){throw new Error('Der Schlüssel passt nicht zur Sicherung.')}
      rkKey=k;SY.rk=b64(await crypto.subtle.exportKey('raw',k));SY.rs=row.salt;SY.bym=row.ym;SY.bakAt=Date.parse(row.created_at)||Date.now();SY.bakErr=null;sySave();$('sheetRoot').innerHTML='';render();toast('Notfall-Schlüssel auf diesem Gerät hinterlegt.')}catch(e){E.textContent=e.message||String(e)}}}
function openRecover(){$('sheetRoot').innerHTML=`<div class="scrim" id="scrim"></div><div class="sheet" role="dialog" aria-label="Wiederherstellen"><div class="sheet-h"><button id="rcX">Abbrechen</button><b>Wiederherstellen</b><button id="rcS" style="font-weight:600">Los</button></div>
   <div class="sheet-b"><div class="note" style="padding:0">Gib deinen Notfall-Schlüssel ein und lege ein neues Sync-Passwort fest. Die App holt die letzte Monats-Sicherung und verschlüsselt alles neu.</div>
   <div class="group"><div class="cell plain"><label for="rcC">Notfall-Schlüssel</label><input id="rcC" placeholder="XXXX-XXXX-…" autocapitalize="characters" style="flex:1;text-align:right"></div>
   <div class="cell plain"><label for="rcP">Neues Sync-Passwort</label><input id="rcP" type="password" placeholder="mind. 8 Zeichen" style="flex:1;text-align:right"></div></div><div class="note" id="rcE" style="padding:0;color:var(--bad)"></div></div></div>`;
  $('scrim').onclick=$('rcX').onclick=()=>{$('sheetRoot').innerHTML=''};
  $('rcS').onclick=async()=>{const code=$('rcC').value,np=$('rcP').value,E=$('rcE');if(rkNorm(code).length<20){E.textContent='Der Schlüssel hat 20 Zeichen.';return}if(np.length<8){E.textContent='Das Sync-Passwort braucht mindestens 8 Zeichen.';return}
    E.textContent='Hole Sicherung …';try{const r=await syFetch('/rest/v1/cashflow_backup?select=*&user_id=eq.'+SY.uid+'&order=ym.desc&limit=1');if(!r.ok)throw new Error('Keine Sicherungen gefunden ('+r.status+').');const row=(await r.json())[0];if(!row)throw new Error('Es gibt noch keine Monats-Sicherung.');
      const k=await syDerive(rkNorm(code),row.salt);let data;try{data=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(row.iv)},k,ub64(row.data))))}catch(e){throw new Error('Der Notfall-Schlüssel passt nicht.')}
      const main=await syGet();S=data;S._m=Date.now();try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){}
      SY.salt=b64(crypto.getRandomValues(new Uint8Array(16)));syKey=await syDerive(np,SY.salt);SY.k=b64(await crypto.subtle.exportKey('raw',syKey));rkKey=k;SY.rk=b64(await crypto.subtle.exportKey('raw',k));SY.rs=row.salt;SY.lost=false;SY.rev=main?main.rev:null;SY.at=0;SY.base=null;sySave();refreshA();
      $('sheetRoot').innerHTML='';await sync(false);render();toast('Wiederhergestellt (Stand '+row.ym+'). Neues Sync-Passwort ist aktiv.')}catch(e){E.textContent=e.message||String(e)}}}
const SYK='cf_sync';let SY=(()=>{try{return JSON.parse(localStorage.getItem(SYK))||{}}catch(e){return{}}})();
const sySave=()=>{try{localStorage.setItem(SYK,JSON.stringify(SY))}catch(e){}};
let syKey=null,syTimer=null,syBusy=false,syMsg='';const COLS=['exp','rec','goals','contracts','debts','journal','wish','depot','shop.items'];
const cGet=(st,c)=>{const[a,b]=c.split('.');const v=b?(st[a]&&st[a][b]):st[a];return Array.isArray(v)?v:[]},cSet=(st,c,v)=>{const[a,b]=c.split('.');if(b){if(st[a]&&typeof st[a]=='object')st[a][b]=v}else st[a]=v};
function sh32(s){let x=0;for(let i=0;i<s.length;i++)x=Math.imul(x^s.charCodeAt(i),16777619);return (x>>>0).toString(36)}
function syIds(st){COLS.forEach(c=>cGet(st,c).forEach(x=>{if(x&&typeof x=='object'&&!x.id)x.id='k'+sh32(String(x.t||'')+'|'+(x.n||x.sym||x.isin||''))}))}
const SYTOP=s=>Object.keys(s).filter(k=>!['_m','_km','exp','rec','goals','contracts','debts','journal','wish','depot'].includes(k));let syKH={};
function syMarkKeys(){S._km=S._km||{};const now0=Date.now();SYTOP(S).forEach(k=>{let j;try{j=JSON.stringify(k=='shop'?Object.assign({},S.shop,{items:0}):S[k])}catch(e){return}const hh=sh32(j||'');if(syKH[k]!==undefined&&syKH[k]!==hh)S._km[k]=now0;syKH[k]=hh})}
const b64=u=>btoa(String.fromCharCode(...new Uint8Array(u))),ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
function b64big(buf){const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)}
async function syDerive(pass,salt){const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:ub64(salt),iterations:250000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},true,['encrypt','decrypt'])}
async function syLoadKey(){if(syKey)return syKey;if(SY.k){syKey=await crypto.subtle.importKey('raw',ub64(SY.k),'AES-GCM',true,['encrypt','decrypt']);return syKey}return null}
async function syEnc(obj){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},syKey,new TextEncoder().encode(JSON.stringify(obj)));return{data:b64big(ct),iv:b64(iv)}}
async function syDec(row){const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(row.iv)},syKey,ub64(row.data));return JSON.parse(new TextDecoder().decode(pt))}
const syOn=()=>!!(SY.url&&SY.key&&SY.refresh);
async function syFetch(path,opt={},auth=true){const h=Object.assign({apikey:SY.key,'Content-Type':'application/json'},opt.headers||{});
  if(auth){if(!SY.access||Date.now()>(SY.exp||0)-60000)await syRefresh();h.Authorization='Bearer '+SY.access}
  const r=await fetch(SY.url.replace(/\/$/,'')+path,Object.assign({},opt,{headers:h}));if(r.status==401&&auth&&!opt._retry){await syRefresh();return syFetch(path,Object.assign({},opt,{_retry:1}),auth)}return r}
async function syAuthSet(j){if(!j.access_token)throw new Error(j.error_description||j.msg||j.error||'Anmeldung fehlgeschlagen');SY.access=j.access_token;SY.refresh=j.refresh_token;SY.exp=Date.now()+(j.expires_in||3600)*1000;SY.uid=j.user&&j.user.id||SY.uid;SY.email=j.user&&j.user.email||SY.email;sySave()}
async function syRefresh(){const r=await fetch(SY.url.replace(/\/$/,'')+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SY.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:SY.refresh})});
  const j=await r.json().catch(()=>({}));if(!r.ok){SY.refresh=null;SY.access=null;sySave();throw new Error('Sitzung abgelaufen. Bitte neu anmelden.')}await syAuthSet(j)}
async function syGet(){const r=await syFetch('/rest/v1/cashflow?select=*&user_id=eq.'+SY.uid);if(!r.ok)throw new Error('Laden fehlgeschlagen ('+r.status+'). Ist die Tabelle angelegt?');const a=await r.json();return a[0]||null}
setTimeout(()=>{try{syMarkKeys()}catch(e){}},0);
function syBase(st){syIds(st);const b={};COLS.forEach(c=>b[c]=cGet(st,c).map(x=>x&&x.id).filter(Boolean));return b}
function syMerge(loc,rem,base){syIds(loc);syIds(rem);const out=JSON.parse(JSON.stringify((loc._m||0)>=(rem._m||0)?loc:rem)),locNew=(loc._m||0)>=(rem._m||0);
  const lk=loc._km||{},rk=rem._km||{},km={};new Set([...SYTOP(loc),...SYTOP(rem)]).forEach(k=>{const lt=lk[k]||0,rt=rk[k]||0;
    if(!(k in rem)){out[k]=JSON.parse(JSON.stringify(loc[k]));km[k]=lt;return}if(!(k in loc)){out[k]=JSON.parse(JSON.stringify(rem[k]));km[k]=rt;return}
    const useL=lt!=rt?lt>rt:locNew;out[k]=JSON.parse(JSON.stringify(useL?loc[k]:rem[k]));km[k]=Math.max(lt,rt)});out._km=km;
  COLS.forEach(c=>{const L=cGet(loc,c),Rm=cGet(rem,c),B=new Set((base&&base[c])||[]),lm=new Map(L.filter(x=>x&&x.id).map(x=>[x.id,x])),rm=new Map(Rm.filter(x=>x&&x.id).map(x=>[x.id,x])),res=[];
    const ids=[...new Set([...L.map(x=>x&&x.id),...Rm.map(x=>x&&x.id)])].filter(Boolean);
    ids.forEach(id=>{const a=lm.get(id),r=rm.get(id);if(a&&r)res.push(locNew?a:r);else if(a){if(!B.has(id))res.push(a)}else if(r){if(!B.has(id))res.push(r)}});
    [...L,...Rm].filter(x=>x&&!x.id).forEach(x=>res.push(x));cSet(out,c,res)});
  try{syDepRu(out,locNew?rem:loc)}catch(e){}
  try{syAccBase(out,loc,rem)}catch(e){}
  return out}
/* Bestand & Zinsen je Konto: neuester Stand (baseAt) gewinnt, auch wenn das andere Gerät die Kontenliste zuletzt geändert hat */
function syBaseNewer(loc,rem){const rm=new Map((rem.accts||[]).filter(Boolean).map(a=>[a.n,a]));return (loc.accts||[]).some(a=>a&&(a.baseAt||0)>((rm.get(a.n)||{}).baseAt||0)&&rm.has(a.n))}
function syAccBase(out,loc,rem){const F=['start','baseD','baseVal','baseAt','rates'],all=[...(loc.accts||[]),...(rem.accts||[])];
  (out.accts||[]).forEach(a=>{if(!a)return;let b=a;all.forEach(x=>{if(x&&x.n==a.n&&(x.baseAt||0)>(b.baseAt||0))b=x});if(b!==a)F.forEach(f=>{if(b[f]===undefined)delete a[f];else a[f]=JSON.parse(JSON.stringify(b[f]))})})}
/* Wechselgeld-Anteile im Depot gehen beim Zusammenführen nicht verloren: Position gewinnt als Ganzes, fehlende Wechselgeld-Einträge der anderen Seite werden nachgetragen, solange die Umbuchung noch existiert */
function syDepRu(out,oth){const trs=new Set((out.exp||[]).filter(e=>e&&e.type=='tr').map(e=>e.id)),om=new Map((oth.depot||[]).filter(h=>h&&h.id).map(h=>[h.id,h]));
  (out.depot||[]).forEach(h=>{const o=om.get(h&&h.id);if(!o||!o.tx)return;h.tx=h.tx||[];const have=new Set(h.tx.filter(x=>x.ru).map(x=>x.ru));
    o.tx.filter(x=>x&&x.ru&&!have.has(x.ru)&&trs.has(x.ru)).forEach(x=>{h.tx.push(JSON.parse(JSON.stringify(x)));have.add(x.ru);if(x.q)h.qty=Math.round(((h.qty||0)+x.q)*1e8)/1e8;else if(x.pv)h.pendVal=Math.round(((h.pendVal||0)+x.pv)*100)/100;h.inv=Math.round(((h.inv||0)+(x.a||0))*100)/100})})}
const syHash=()=>{const s=JSON.stringify(Object.assign({},S,{_m:0,_km:0}));let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}return (h2>>>0).toString(36)+(h1>>>0).toString(36)};
function syDirty(){if(!syOn())return;if(syHash()===SY.h)return;syMarkKeys();S._m=Date.now();try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){}clearTimeout(syTimer);syTimer=setTimeout(()=>sync(),2500)}
async function sync(quiet=true){if(!syOn()||syBusy||!navigator.onLine)return;if(!await syLoadKey()){syMsg='Sync-Passwort fehlt auf diesem Gerät.';return}
  syBusy=true;try{for(let tries=0;tries<3;tries++){const row=await syGet();
      if(row&&row.rev!==SY.rev){const rem=await syDec(row);const dirty=(S._m||0)>(SY.at||0)||syBaseNewer(S,rem);
        if(!dirty){S=rem}else{S=syMerge(S,rem,SY.base);S._m=Date.now()}migFlags(S);syKH={};syMarkKeys();DV++;
        try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){}SY.rev=row.rev;SY.base=syBase(rem);if(!dirty){SY.at=Date.now();SY.h=syHash()}sySave();if(!dirty){refreshA&&refreshA();render();syMsg='Aktualisiert '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});return}
        render()}
      if((S._m||0)<=(SY.at||0)&&row){syMsg='Synchron · '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});return}
      const enc=await syEnc(S),nr=(row?row.rev:0)+1,body={user_id:SY.uid,data:enc.data,iv:enc.iv,salt:SY.salt,rev:nr,updated_at:new Date().toISOString()};
      let r;if(!row)r=await syFetch('/rest/v1/cashflow',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(body)});
      else r=await syFetch('/rest/v1/cashflow?user_id=eq.'+SY.uid+'&rev=eq.'+row.rev,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(body)});
      const j=await r.json().catch(()=>[]);if(r.ok&&Array.isArray(j)&&j.length){SY.rev=nr;SY.base=syBase(S);SY.at=Date.now();SY.h=syHash();sySave();syMsg='Gespeichert · '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});return}
      if(!r.ok&&r.status!=409)throw new Error('Speichern fehlgeschlagen ('+r.status+')')}
  }catch(e){syMsg=e.message||String(e);if(!quiet)toast(syMsg)}finally{syBusy=false;if(setView=='sync')render();setTimeout(()=>bakNow(false).catch(()=>{}),1500)}}
async function syLogin(signup){const url=$('syU').value.trim().replace(/\/$/,''),key=$('syK').value.trim(),email=$('syE').value.trim(),pw=$('syP').value,pass=$('syX').value,keep=$('syR').checked;
  if(!url||!key||!email||!pw||!pass){$('syErr').textContent='Bitte alle Felder ausfüllen.';return}if(pass.length<8){$('syErr').textContent='Das Sync-Passwort braucht mindestens 8 Zeichen.';return}
  $('syErr').textContent='Verbinde …';SY.url=url;SY.key=key;
  try{const appUrl=/^https:/.test(location.href)&&!/claude/.test(location.host)?location.origin+location.pathname:'https://dortenestler-cyber.github.io/cashflow-app/';
    const r=await fetch(url+'/auth/v1/'+(signup?'signup?redirect_to='+encodeURIComponent(appUrl):'token?grant_type=password'),{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
    const j=await r.json().catch(()=>({}));if(signup&&r.ok&&!j.access_token){$('syErr').textContent='Konto angelegt. Bestätige den Link in deiner E-Mail und tippe dann auf „Anmelden“.';sySave();return}
    if(!r.ok){const m=j.error_description||j.msg||j.error||('Fehler '+r.status);throw new Error(/not confirmed/i.test(m)?'Deine E-Mail ist noch nicht bestätigt. Siehe Hinweis „Bestätigungslink geht nicht“ unten.':/invalid login/i.test(m)?'E-Mail oder Passwort stimmt nicht.':/already registered/i.test(m)?'Für diese E-Mail gibt es schon ein Konto. Tippe auf „Anmelden“.':m)}await syAuthSet(j);
    const row=await syGet();SY.salt=row?row.salt:b64(crypto.getRandomValues(new Uint8Array(16)));syKey=await syDerive(pass,SY.salt);
    if(row){try{await syDec(row)}catch(e){syKey=null;SY.k=null;SY.lost=true;sySave();render();setTimeout(()=>{if($('syErr'))$('syErr').textContent='Sync-Passwort passt nicht zu den gespeicherten Daten.'},50);return}}SY.lost=false;
    SY.k=keep?b64(await crypto.subtle.exportKey('raw',syKey)):null;SY.rev=null;SY.at=0;SY.base=null;sySave();
    if(row){const rem=await syDec(row);const hasLocal=S.exp&&S.exp.length&&!S.ex;
      if(hasLocal&&!confirmMerge){S=syMerge(S,rem,{});S._m=Date.now()}else S=rem;syKH={};syMarkKeys();DV++;try{localStorage.setItem('dodo4',JSON.stringify(S))}catch(e){}SY.rev=row.rev;SY.base=syBase(rem);SY.at=hasLocal?0:Date.now();if(!hasLocal)SY.h=syHash();sySave();refreshA();}
    else{S._m=Date.now()}
    await sync(false);render();toast(row?'Verbunden. Deine Daten sind auf diesem Gerät.':'Verbunden. Deine Daten sind jetzt verschlüsselt online gesichert.')}
  catch(e){$('syErr').textContent=e.message||String(e)}}
const confirmMerge=false;
function syLogout(wipe){if(SY.access)fetch(SY.url+'/auth/v1/logout',{method:'POST',headers:{apikey:SY.key,Authorization:'Bearer '+SY.access}}).catch(()=>{});
  const keep={url:SY.url,key:SY.key,email:SY.email};SY=keep;syKey=null;sySave();
  if(wipe){try{localStorage.removeItem('dodo4')}catch(e){}location.reload();return}render();toast('Abgemeldet.')}
function viewSync(){const on=syOn(),need=on&&!SY.k&&!syKey;
  return `${appbar({title:'Online-Sync',back:'setBack',noGear:true,stats:`<div class="hc-big"><span>${on?'Verbunden als':'Status'}</span><b style="font-size:22px">${on?esc(SY.email||''):'Nicht verbunden'}</b></div><div class="hc-line">${on?esc(syMsg||'Bereit'):'iPhone, PC und Browser mit denselben Daten'}</div>`})}
  ${on&&!need?`<div class="group"><div class="cell plain"><div class="t"><div>Automatisch synchronisieren</div><div class="s">Nach jeder Änderung und beim Öffnen</div></div>${I('check',18)}</div></div>
   <button class="btn" id="syNow">Jetzt synchronisieren</button>
   <div class="anchor">${I('lock',16)}<span>Deine Daten werden auf diesem Gerät mit deinem Sync-Passwort verschlüsselt, bevor sie hochgeladen werden. Online liegt nur unlesbarer Datensalat.</span></div>
   <div class="sec"><div class="sh">Abmelden</div><button class="btn soft" id="syOut">Abmelden, Daten auf diesem Gerät behalten</button><button class="btn danger" id="syWipe">Abmelden und Daten von diesem Gerät löschen</button><div class="note">Auf einem fremden oder dienstlichen Rechner immer die zweite Variante nutzen. Online bleibt alles erhalten.</div></div>`
  :`${need?`<div class="tip">${SY.lost?'Das Sync-Passwort passt nicht. Versuch es unten nochmal oder stelle deine Daten mit dem Notfall-Schlüssel wieder her.':'Du bist angemeldet, aber das Sync-Passwort ist auf diesem Gerät nicht gespeichert. Bitte melde dich unten neu an.'}</div><button class="btn soft" id="syRec">Sync-Passwort vergessen? Mit Notfall-Schlüssel wiederherstellen</button>`:''}
   <div class="note" style="padding:0 4px">Einmal auf <b>einem</b> Gerät einrichten (Schritte 1 bis 3), danach auf jedem weiteren Gerät nur noch Schritt 4.</div>
   <div class="sstep"><div class="sstep-n">1</div><div class="sstep-b"><b>Tabelle in Supabase anlegen</b><span class="s">Am PC auf supabase.com in deinem Projekt:</span>
    <ol><li>Links in der Leiste auf <b>SQL Editor</b> klicken (Symbol <code>&gt;_</code>).</li><li>Oben auf <b>+ New query</b> bzw. „New SQL snippet“.</li><li>Hier auf <b>SQL kopieren</b> tippen und dort ins große Feld einfügen.</li><li>Unten rechts auf <b>Run</b> klicken. Es erscheint „Success. No rows returned“.</li></ol>
    <button class="btn soft" id="syCopy">SQL kopieren</button><textarea class="box" readonly id="sySql" hidden>${esc(SYSQL)}</textarea>
    <div class="sstat" id="syT">${syChk.t===true?'✅ Tabelle gefunden':syChk.t===false?'⚠️ Tabelle noch nicht gefunden':''}</div></div></div>
   <div class="sstep"><div class="sstep-n">2</div><div class="sstep-b"><b>Schlüssel eintragen</b><span class="s">In Supabase links unten auf das Zahnrad <b>Project Settings</b> › <b>API Keys</b>. Beim Eintrag „default“ den <b>Publishable key</b> (beginnt mit <code>sb_publishable_</code>) mit dem Kopier-Symbol kopieren und hier einfügen. Nicht den Secret Key.</span>
    <div class="group"><div class="cell plain"><label for="syU">Projekt-URL</label><input id="syU" value="${esc(SY.url||SYDEF)}" autocapitalize="off" spellcheck="false"></div>
     <div class="cell plain"><label for="syK">Publishable Key</label><input id="syK" placeholder="sb_publishable_…" value="${esc(SY.key||'')}" autocapitalize="off" spellcheck="false"></div></div>
    <button class="btn soft" id="syChk">Verbindung prüfen</button><div class="sstat" id="syC">${syChk.c||''}</div></div></div>
   <div class="sstep"><div class="sstep-n">3</div><div class="sstep-b"><b>CashFlow-Konto erstellen</b><span class="s">Denk dir zwei Passwörter aus: eins zum Anmelden und ein <b>Sync-Passwort</b>, das deine Daten verschlüsselt. Das Sync-Passwort kann niemand zurücksetzen, schreib es dir sicher auf.</span>
    <div class="group"><div class="cell plain"><label for="syE">E-Mail</label><input id="syE" type="email" autocomplete="username" value="${esc(SY.email||'')}"></div>
     <div class="cell plain"><label for="syP">Passwort</label><input id="syP" type="password" autocomplete="current-password" placeholder="zum Anmelden"></div>
     <div class="cell plain"><label for="syX">Sync-Passwort</label><input id="syX" type="password" autocomplete="off" placeholder="mind. 8 Zeichen"></div>
     <div class="cell plain"><div class="t"><div>Auf diesem Gerät merken</div><div class="s">Am Dienst-PC ausschalten</div></div><input id="syR" type="checkbox" class="switch" checked></div></div>
    <button class="btn" id="syUp">Konto erstellen</button><span class="s">Danach kommt eine E-Mail von Supabase („Confirm your signup“). Den Link darin antippen, zurück hierher und Schritt 4.</span></div></div>
   <div class="sstep"><div class="sstep-n">4</div><div class="sstep-b"><b>Anmelden</b><span class="s">Mit E-Mail, Passwort und Sync-Passwort von oben. Auf jedem weiteren Gerät (PC, Browser) einfach die App-Adresse öffnen, Schlüssel aus Schritt 2 und die drei Angaben eintragen und anmelden.</span>
    <button class="btn" id="syIn">Anmelden</button></div></div>
   <div class="note" id="syErr" style="color:var(--bad)"></div>
   <div class="note"><b>Bestätigungslink geht nicht</b> (Fehlerseite „localhost“)? In Supabase links <b>Authentication</b> › <b>Sign In / Providers</b> › <b>Email</b> › „Confirm email“ ausschalten und speichern. Dann unter <b>Authentication › Users</b> dein Konto über die drei Punkte löschen und hier nochmal „Konto erstellen“. Alternativ unter <b>Authentication › URL Configuration</b> als Site URL <code>https://dortenestler-cyber.github.io/cashflow-app/</code> eintragen.</div>
   <div class="note">Tipp, wenn alles läuft: In Supabase unter Authentication › Sign In / Providers „Allow new users to sign up“ ausschalten. Dann kann sich niemand sonst in deinem Projekt registrieren.</div>`}`}
let syChk={};const SYDEF='https://yyltagrgzrjteltnkolw.supabase.co';
async function syCheck(){const url=$('syU').value.trim().replace(/\/$/,''),key=$('syK').value.trim();if(!url||!key){$('syC').textContent='Bitte URL und Key eintragen.';return}
  $('syC').textContent='Prüfe …';try{const r=await fetch(url+'/rest/v1/cashflow?select=user_id&limit=1',{headers:{apikey:key}});
    if(r.status==401||r.status==403){syChk={c:'❌ Key wird nicht akzeptiert. Bitte den Publishable key vollständig kopieren.'}}
    else if(r.ok){syChk={c:'✅ Verbindung klappt, Tabelle ist da.',t:true}}
    else{const j=await r.json().catch(()=>({}));syChk={c:/does not exist|relation|schema cache/i.test(JSON.stringify(j))?'⚠️ Verbindung klappt, aber die Tabelle fehlt noch. Bitte Schritt 1 ausführen.':'❌ Fehler '+r.status,t:false}}
    SY.url=url;SY.key=key;sySave()}catch(e){syChk={c:'❌ Keine Verbindung. Stimmt die URL?'}}render()}
const SYSQL=`create table if not exists public.cashflow (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data text not null,
  iv text not null,
  salt text not null,
  rev bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.cashflow enable row level security;
drop policy if exists "nur eigene Daten" on public.cashflow;
create policy "nur eigene Daten" on public.cashflow
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`;
function bindSync(){if(setView!='sync')return;const on=(id,f)=>{const el=$(id);if(el)el.onclick=f};
  on('syIn',()=>syLogin(false));on('syRec',openRecover);on('syChk',()=>syCheck());on('syUp',()=>syLogin(true));on('syNow',()=>{syMsg='Synchronisiere …';render();S._m=Math.max(S._m||0,(SY.at||0)+1);sync(false)});
  on('syOut',()=>syLogout(false));on('syWipe',()=>{const b=$('syWipe');if(!b.dataset.arm){b.dataset.arm=1;b.textContent='Wirklich? Nochmal tippen';return}syLogout(true)});
  on('syCopy',()=>{const t=$('sySql');t.select();try{navigator.clipboard.writeText(SYSQL).then(()=>toast('SQL kopiert.'))}catch(e){document.execCommand('copy');toast('SQL kopiert.')}})}


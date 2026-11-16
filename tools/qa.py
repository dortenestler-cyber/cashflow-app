#!/usr/bin/env python3
"""Automatische Prüfung der CashFlow-App (Darstellung, Fehler, Scrollen).
Aufruf: python3 tools/qa.py [profil ...]   Profile: iphone iphone-se ipad-hoch ipad-quer web-s web-m web-l web-xl web-xxl
Ohne Angabe: alle. Mit --safari wird fehlende Scroll-Verankerung (Safari/iOS) nachgestellt.
Ausgabe: nur Auffälligkeiten. Screenshots: /tmp/qa/<profil>-<ansicht>.png (mit --shots)."""
import asyncio,sys,json,os,re
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROFILES={'iphone':(390,844,True),'iphone-se':(375,667,True),'ipad-hoch':(820,1180,True),'ipad-quer':(1180,820,True),
 'web-s':(1000,700,False),'web-m':(1100,800,False),'web-l':(1280,720,False),'web-xl':(1440,900,False),'web-xxl':(1920,1080,False)}
STATES=[("dash",None,None),("list",None,None),("list","listV='Summe'",None),("cal",None,None),("geld",None,None),("more",None,None)]
STATES+=[("wish",f"wishV='{w}'",None) for w in ['Wünsche','Ziele','Zukunft','Fixkosten','Monat','Journal','Verzicht']]
STATES+=[("rep",f"repV='{r}'",None) for r in ['Impulse','Monat','Jahr','Analyse','Bericht','Budget','Verlauf','Entwicklung','Prognose','Simulator','Vermögen','Verträge']]
STATES+=[("more",None,s) for s in "cfg ru sam accts budgets cats rec fav month lohn shop bgs theme debts rules catrules salplan brands usage siri setup ai push".split()]
CHECK=open(os.path.join(ROOT,'tools','qa-check.js')).read()
SAFARI='--safari' in sys.argv;SHOTS='--shots' in sys.argv
names=[a for a in sys.argv[1:] if not a.startswith('--')] or list(PROFILES)
SCROLLJUMP="""async()=>{const sc=document.body.scrollHeight>document.body.clientHeight+1?document.body:document.scrollingElement;const rows=[...document.querySelectorAll('.view .mmrow,.view .mmcard')];const x=rows[Math.min(6,rows.length-1)];if(!x)return '';let prev=null,bad='';for(let i=0;i<30;i++){const t0=x.getBoundingClientRect().top,s0=sc.scrollTop;sc.scrollTop+=20;await new Promise(r=>setTimeout(r,60));const ds=sc.scrollTop-s0;if(ds<20)break;const d=t0-x.getBoundingClientRect().top;if(Math.abs(d-ds)>3){bad='SCROLL-SPRUNG um '+Math.round(d-ds)+'px bei y='+sc.scrollTop;break}}sc.scrollTop=0;return bad}"""
async def main():
  os.makedirs('/tmp/qa',exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for n in names:
      W,H,touch=PROFILES[n]
      pg=await b.new_page(viewport={'width':W,'height':H},has_touch=touch,is_mobile=touch and W<700)
      if SAFARI or touch: await pg.add_init_script("const _s=CSS.supports.bind(CSS);CSS.supports=(a,b)=>a=='overflow-anchor'?false:_s(a,b);document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='*{overflow-anchor:none!important}';document.head.appendChild(s)})")
      errs=[]
      pg.on('pageerror',lambda e:errs.append('JS-FEHLER '+str(e)[:200]))
      pg.on('console',lambda m:errs.append('KONSOLE '+m.text[:200]) if m.type=='error' else None)
      await pg.goto('file://'+ROOT+'/index.html');await pg.wait_for_timeout(1500)
      try: await pg.click('text=Überspringen',timeout=2000)
      except: pass
      await pg.wait_for_timeout(600);found=0
      for t,extra,sv in STATES:
        errs.clear()
        r=await pg.evaluate(f"()=>{{try{{tab='{t}';curB=null;drill=null;setView={json.dumps(sv)};{extra or ''};render();scrollTo(0,0);document.body.scrollTop=0;return 'ok'}}catch(e){{return 'RENDER-FEHLER '+e.message}}}}")
        await pg.wait_for_timeout(500)
        res=await pg.evaluate(CHECK)
        if SHOTS: await pg.screenshot(path=f"/tmp/qa/{n}-{t}-{re.sub(r'[^A-Za-z]','',(extra or '')+(sv or ''))}.png")
        j=await pg.evaluate(SCROLLJUMP)
        await pg.evaluate("()=>{document.body.scrollTop=1e6;scrollTo(0,1e6)}");await pg.wait_for_timeout(900)
        res2=await pg.evaluate(CHECK)
        out=([r] if r!='ok' else [])+errs+[y for y in res if not (y.startswith('COVERED') and ('tabbar' in y or 'asstRoot' in y))]+([j] if j else [])+['@unten '+y for y in res2 if not y.startswith('COVERED') or 'asstRoot' in y or 'fab' in y or 'tabbar' in y]
        if out: found+=1;print(f"[{n} {W}x{H}] {t} {extra or ''} {sv or ''}:",*out,sep='\n   ')
      print(f"== {n}: {found} Ansichten mit Auffälligkeiten von {len(STATES)}")
      await pg.close()
    await b.close()
asyncio.run(main())

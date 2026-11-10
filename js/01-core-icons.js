const STANDALONE=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true,CANFILE=(()=>{try{return window.self===window.top}catch(e){return false}})();
let BN=[],ALL=[],BUDG=[],TOT=[],TOTM=[];const COL={},HEX={},SHORT={};
const ACOL=['#1a8fd6','#ff8a2a','#9466f7','#2fb36b','#e8506a','#13a8a8','#c99a2e','#6b7280'];
const acc=n=>S.accts.find(a=>a.n==n)||{n,kind:'budget',col:'#6b7280',vis:true,tot:false};
const isK=n=>acc(n).kind=='konto';
const safeAcct=n=>String(n??'').replace(/[<>"'`&\\]/g,'').trim().slice(0,40)||'Konto';
function refreshA(){if(!refreshA.busy&&S.accts.some(a=>safeAcct(a.n)!==a.n)){refreshA.busy=1;try{S.accts.forEach(a=>{const s0=safeAcct(a.n);if(s0===a.n)return;let t=s0,k=2;while(S.accts.some(x=>x!==a&&x.n==t))t=s0+' '+k++;renameAcct(a.n,t)})}catch(e){}refreshA.busy=0}ALL=S.accts.map(a=>a.n);BN=S.accts.filter(a=>a.vis).map(a=>a.n);/* v253: Sinking Funds ist ein Bestand, kein Monatsbudget, und gehört nicht in BUDG */BUDG=S.accts.filter(a=>a.vis&&a.kind=='budget'&&!/sinking/i.test(a.n)).map(a=>a.n);TOT=S.accts.filter(a=>a.kind=='budget'&&a.tot).map(a=>a.n);TOTM=TOT.filter(b=>!isStock(b));
  Object.keys(COL).forEach(k=>{delete COL[k];delete HEX[k];delete SHORT[k]});S.accts.forEach(a=>{COL[a.n]=HEX[a.n]=a.col;SHORT[a.n]=a.n.length>9?a.n.split(' ')[0].slice(0,9):a.n})}
const swL=()=>BN.includes(curB)?BN:ALL;
const DEFCATS={"Flow":[["Lebensmittel","cart"],["Drogerie","bottle"],["Friseur","scissors"],["Haushalt","home"],["Gesundheit","pill"],["Mobilität","bus"],["Kleidung","shirt"],["Sonstiges","dot"]],
 "Gönn dir":[["Restaurant","fork"],["Café","cup"],["Freizeit","ticket"],["Shopping","bag"],["Beauty","sparkle"],["Hobby","palette"],["Geschenke","gift"],["Sonstiges","dot"]],
 "Sinking Funds":[["Sparziel","target"],["Technik","headphones"],["Reise","plane"],["Möbel","sofa"],["Sonstiges","dot"]]};
const IC={list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',chart:'<path d="M4 19V5M4 19h16"/><path d="M7 15l4-4 3 3 5-6"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',cart:'<path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
bottle:'<path d="M10 3h4v3l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z"/><path d="M8 12h8"/>',
scissors:'<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5 20 18M8 15.5 20 6"/>',
home:'<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
pill:'<path d="M8.5 15.5 15.5 8.5a3.5 3.5 0 0 0-5-5l-7 7a3.5 3.5 0 0 0 5 5z" transform="translate(2.5 2.5)"/><path d="m9.5 9.5 5 5"/>',
bus:'<rect x="5" y="3" width="14" height="15" rx="2.5"/><path d="M5 11h14M8 21v-3M16 21v-3"/><circle cx="8.5" cy="14.5" r=".8"/><circle cx="15.5" cy="14.5" r=".8"/>',
shirt:'<path d="M8 4 4 6.5l2 4 2-1V20h8V9.5l2 1 2-4L16 4a4 4 0 0 1-8 0z"/>',
fork:'<path d="M7 3v7a2 2 0 0 0 4 0V3M9 3v18M16 21V3c-2 1.5-3 4-3 7h3"/>',
cup:'<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3"/>',
ticket:'<path d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4z"/><path d="M14 7v2M14 11v2M14 15v2"/>',
bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4M17 18h4"/>',
palette:'<path d="M12 3a9 9 0 0 0 0 18c1.2 0 1.8-.9 1.4-2-.5-1.3.4-2.5 1.8-2.5H17a4 4 0 0 0 4-4c0-5.5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
gift:'<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9S10.5 4 8 4.5 7.5 9 12 9zM12 9s1.5-5 4-4.5S16.5 9 12 9z"/>',
target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
headphones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/>',
plane:'<path d="M21 4 3 11l7 2.5L12.5 21z"/><path d="M10 13.5 21 4"/>',
sofa:'<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v5H3zM5 18v2M19 18v2"/>',
heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
car:'<path d="M5 16v-4l2-5h10l2 5v4z"/><path d="M5 12h14M5 16v2M19 16v2"/><circle cx="8" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/>',
dumbbell:'<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>',
music:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
book:'<path d="M5 4h9a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
phone:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
paw:'<circle cx="7" cy="10" r="1.6"/><circle cx="17" cy="10" r="1.6"/><circle cx="10" cy="6.5" r="1.6"/><circle cx="14" cy="6.5" r="1.6"/><path d="M8.5 17a3.5 3.5 0 0 1 7 0c0 1.5-1.5 2.5-3.5 2.5S8.5 18.5 8.5 17z"/>',
game:'<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M7.5 11v3M6 12.5h3"/><circle cx="15.5" cy="12" r=".8"/><circle cx="17.5" cy="13.8" r=".8"/>',
bolt:'<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
dot:'<circle cx="12" cy="12" r="2.6"/><circle cx="5.5" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',gauge:'<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
repeat:'<path d="M17 3l3 3-3 3M20 6H8a4 4 0 0 0-4 4v1M7 21l-3-3 3-3M4 18h12a4 4 0 0 0 4-4v-1"/>',
star:'<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z"/>',
calendar:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
lifebuoy:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="m6.3 6.3 3.2 3.2M14.5 14.5l3.2 3.2M17.7 6.3l-3.2 3.2M9.5 14.5l-3.2 3.2"/>',
face:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9v1.5M15 9v1.5M12 9v4h-1M9.5 16a4 4 0 0 0 5 0"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',pin:'<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
export:'<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/>',
search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>',
backspace:'<path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z"/><path d="m12 9 5 6M17 9l-5 6"/>',
minus:'<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
hourglass:'<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>',
up:'<path d="m6 15 6-6 6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',flat:'<path d="M6 12h12"/>'};
IC.alert='<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>';
IC.close='<path d="M6 6l12 12M18 6 6 18"/>';
IC.back='<path d="m15 5-7 7 7 7"/>';IC.fwd='<path d="m9 5 7 7-7 7"/>';IC.plus='<path d="M12 5v14M5 12h14"/>';IC.filter='<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>';IC.gear='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>';
IC.wallet='<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M16 14.5h2"/><path d="M6 6V5a1 1 0 0 1 1.3-1L17 6"/>';
/* ---------- icon library: all areas of life ---------- */
Object.assign(IC,{
banknote:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
bonus:'<circle cx="12" cy="12" r="8.5"/><path d="m12 7.5 1.3 2.7 3 .4-2.2 2 .6 2.9L12 14l-2.7 1.5.6-2.9-2.2-2 3-.4z"/>',
interest:'<path d="M4 20h16"/><path d="m5 15 4.5-4.5 3 3L19 7"/><path d="M15 7h4v4"/>',
dividend:'<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V9M16 16v-6"/><path d="M18 3v4M16 5h4"/>',
sidejob:'<rect x="3" y="5" width="13" height="9" rx="1.5"/><path d="M2 17.5h14"/><circle cx="19" cy="15.5" r="2.8"/><path d="M19 14.3v2.4"/>',
sale:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.4"/><path d="m11 15.5 4.5-4.5"/>',
cashback:'<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4h4"/><path d="M13.5 9.5h-2.2a1.5 1.5 0 0 0 0 3h1.4a1.5 1.5 0 0 1 0 3H10.5M12 8v1.5M12 15.5V17"/>',
refund:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
kidmoney:'<circle cx="8.5" cy="6" r="2.5"/><path d="M4.5 20v-4.5a4 4 0 0 1 8 0V20"/><circle cx="18" cy="15" r="3"/>',
rentin:'<path d="M3 11.5 11 4.5l8 7"/><path d="M5 10v10h12V10"/><path d="M11 12.5v5M8.5 15h5"/>',
moneygift:'<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M12 9v11M3 13h18"/><path d="M12 9c-2-4-6-3-5-1M12 9c2-4 6-3 5-1"/>',
tipjar:'<path d="M7 3.5h10M8 3.5V7a5 5 0 0 0-2 4v9h12v-9a5 5 0 0 0-2-4V3.5"/><circle cx="12" cy="14" r="2"/>',
umbrella:'<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6a2 2 0 0 1-4 0M12 3v.01"/>',
taxdoc:'<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="m9 16 6-6"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="15.5" r="1"/>',
radio:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="m8 4 8 4"/><circle cx="15.5" cy="14" r="2.8"/><path d="M6.5 12h3M6.5 15.5h3"/>',
contract:'<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3M9 10h6M9 13.5h6M9 17h3"/>',
simcard:'<path d="M7 3h7l4 4v14H7z"/><rect x="9.5" y="11" width="6" height="6.5" rx="1"/><path d="M12.5 11v6.5"/>',
stream:'<rect x="3" y="4.5" width="18" height="12.5" rx="2"/><path d="m10 8 5 2.75-5 2.75z"/><path d="M8 20.5h8"/>',
schoolbag:'<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7M5 13h14M10 13v2.5h4V13"/>',
parcel:'<path d="m3 7.5 9-4.5 9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9M7.5 5.2l9 4.6"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
cash:'<rect x="3" y="4" width="18" height="7" rx="1.5"/><path d="M7 11v9h10v-9"/><circle cx="12" cy="15.5" r="1.8"/>',
fee:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 11.5h6"/>',
loan:'<path d="M3 15h4l5 2h5a2 2 0 0 0 0-4h-4"/><path d="M3 20h4l6 1 8-4"/><circle cx="16" cy="6.5" r="3"/>',
member:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0M14.5 10h4M14.5 13.5h3"/>',
handheart:'<path d="M12 10s-4-2.4-4-4.6A2 2 0 0 1 12 4.6a2 2 0 0 1 4 .8c0 2.2-4 4.6-4 4.6z"/><path d="M3 15h4l5 2h5a2 2 0 0 0 0-4h-4M3 20h4l6 1 8-4"/>',
crypto:'<circle cx="12" cy="12" r="9"/><path d="M10 7v10M13 6.5V8M13 16v1.5M9 8h4.5a2 2 0 0 1 0 4H9h5a2 2 0 0 1 0 4H9"/>',
gold:'<path d="M2.5 20 5 15h6l2.5 5zM10.5 20 13 15h6l2.5 5zM6.5 15 9 10h6l2.5 5"/>',
croissant:'<path d="M4 15.5C4 10 7.5 6 12 6s8 4 8 9.5l-3 1-2.2-5L12 17l-2.8-5.5-2.2 5z"/>',
kiosk:'<path d="M3.5 9h17l-1.5-4.5H5z"/><path d="M5 9v11h14V9M9.5 20v-6h5v6"/>',
icecream:'<path d="M7.5 10a4.5 4.5 0 0 1 9 0z"/><path d="m7.5 10 4.5 11 4.5-11"/>',
laundry:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M8 6.5h.01M11 6.5h.01"/>',
flowers:'<circle cx="12" cy="7.5" r="3"/><path d="M12 10.5V21M12 16c-3 0-5-2-5-4.5M12 18.5c3 0 5-2 5-4.5"/>',
taxi:'<path d="M5 17v-5l2-5h10l2 5v5"/><path d="M3.5 17h17M7 20v-3M17 20v-3M10 4h4M10 4l-.5 3M14 4l.5 3"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M3.5 10h6M14.5 10h6M12 14.5V21"/>',
pharmacy:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
clinic:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M12 7.5v6M9 10.5h6M9.5 21v-3.5h5V21"/>',
swim:'<path d="M2 18.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><circle cx="16.5" cy="6" r="2"/><path d="m4 14 5-5 3 3 3.5-1.5"/>',
newspaper:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v9a2 2 0 0 1-2 2M7.5 9h6M7.5 12.5h6M7.5 16h3.5"/>',
toy:'<rect x="4" y="11" width="7" height="7" rx="1"/><rect x="13" y="11" width="7" height="7" rx="1"/><rect x="8.5" y="3.5" width="7" height="7" rx="1"/>',

basket:'<path d="M4 9h16l-1.5 10h-13z"/><path d="m9 9 3-5 3 5"/>',pizza:'<path d="M12 3 3 19c6 3 12 3 18 0z"/><circle cx="11" cy="12" r="1"/><circle cx="14" cy="15" r="1"/>',
burger:'<path d="M4 11a8 6 0 0 1 16 0z"/><path d="M4 14h16M5 17h14a1 1 0 0 1-1 2H6a1 1 0 0 1-1-2z"/>',wine:'<path d="M8 3h8l-1 6a3 3 0 0 1-6 0z"/><path d="M12 12v8M8 21h8"/>',
beer:'<path d="M6 7h10v13H6z"/><path d="M16 10h2a2 2 0 0 1 0 6h-2M6 7a3 3 0 0 1 5-2 3 3 0 0 1 5 2"/>',bread:'<path d="M5 10a4 4 0 0 1 3-6h8a4 4 0 0 1 3 6v9H5z"/>',
apple:'<path d="M12 7c-2-2-7-1-7 5s4 9 7 7c3 2 7-1 7-7s-5-7-7-5z"/><path d="M12 7c0-2 1-3 3-4"/>',takeaway:'<path d="M5 8h14l-2 12H7z"/><path d="M9 8V5h6v3"/>',
cocktail:'<path d="M4 4h16l-8 9zM12 13v7M8 20h8"/>',drop:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
flame:'<path d="M12 3s5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 2 1 3 3 3 3s0-4 0-7z"/>',key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l3 3"/>',
tools:'<path d="M14.5 6.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 1-2-2z"/>',plant:'<path d="M12 21v-9"/><path d="M12 12c0-5-4-7-8-7 0 5 4 7 8 7zM12 14c0-4 3-6 8-6 0 4-3 6-8 6z"/>',
broom:'<path d="M14 3 9 13"/><path d="M5 13h8l2 8H3z"/>',bed:'<path d="M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3H9v1"/><circle cx="6.5" cy="10.5" r="1.5"/>',
wifi:'<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r=".8"/>',
bike:'<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16 10 8h5l3 8M9 8H7M14 8l-2 8"/>',
train:'<rect x="6" y="3" width="12" height="14" rx="3"/><path d="M6 11h12M9 21l1.5-4M15 21l-1.5-4"/><circle cx="9" cy="14" r=".8"/><circle cx="15" cy="14" r=".8"/>',
fuel:'<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M4 21h12M5 10h10"/><path d="M15 8l3 2v7a1.5 1.5 0 0 0 3 0V9l-3-3"/>',plug:'<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5"/>',
scooter:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 18h9l3-12h2"/>',parking:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
heartpulse:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M5 12h3l2-3 2 5 2-2h5"/>',
tooth:'<path d="M7 3c-2 0-3 2-3 4 0 3 1 5 2 8 .5 2 1 6 2.5 6S10 16 12 16s2 5 3.5 5S17 17 18 15c1-3 2-5 2-8 0-2-1-4-3-4-2 0-3 1-5 1S9 3 7 3z"/>',
lipstick:'<path d="M9 21V11h6v10zM10 11V7l4-3v7"/>',leaf:'<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7"/>',
glasses:'<circle cx="6.5" cy="14" r="3.5"/><circle cx="17.5" cy="14" r="3.5"/><path d="M10 14h4M3 14 5 7M21 14l-2-7"/>',
shoe:'<path d="M3 17v-5l4-1 3-5h3l1 4 6 3a2 2 0 0 1 1 2v2zM3 17h18"/>',ring:'<circle cx="12" cy="15" r="6"/><path d="m9 6 3-3 3 3-3 3z"/>',
watch:'<rect x="7" y="7" width="10" height="10" rx="3"/><path d="M9 7l1-4h4l1 4M9 17l1 4h4l1-4M12 10v2l1 1"/>',hanger:'<path d="M12 7a2 2 0 1 1 2-2M12 7v2L3 16h18l-9-7"/>',
film:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',climb:'<path d="m3 20 6-10 4 6 3-4 5 8z"/><path d="m9 10 1.5-2.5L12 10"/>',
tent:'<path d="M3 20 12 4l9 16zM12 4v16M9 20l3-6 3 6"/>',run:'<circle cx="14" cy="4.5" r="1.8"/><path d="m8 21 3-6 3 2v4M6 12l3-4 4 1 3 4 3 1M11 15l-2-3"/>',
camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',balloon:'<path d="M12 3a5 5 0 0 1 5 5c0 4-5 8-5 8s-5-4-5-8a5 5 0 0 1 5-5z"/><path d="M12 16l-1 2h2l-1 2v1"/>',
smoke:'<path d="M3 15h14v3H3zM19 15v3M17 11c0-2 2-2 2-4M20 11c0-2 1-2 1-4"/>',hotel:'<path d="M3 20V9l9-5 9 5v11M8 20v-5h8v5M8 11h2M14 11h2"/>',
luggage:'<rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9 7V4h6v3M9 11v5M15 11v5"/>',map:'<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
beach:'<path d="M12 20V9M4 9a8 5 0 0 1 16 0zM3 20h18"/>',baby:'<circle cx="12" cy="8" r="4"/><path d="M6 21a6 6 0 0 1 12 0M10 8h.01M14 8h.01"/>',
people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M15 14a5 5 0 0 1 6 5"/>',
cake:'<path d="M4 21V12h16v9zM4 16c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 4 0M12 12V8M12 5.5v.01"/>',laptop:'<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
tv:'<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',cloud:'<path d="M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18z"/>',
bank:'<path d="M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',card:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
coins:'<ellipse cx="9" cy="7" rx="5" ry="2.5"/><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7M4 11v4c0 1.4 2.2 2.5 5 2.5"/><ellipse cx="16" cy="14" rx="5" ry="2.5"/><path d="M11 14v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4"/>',
piggy:'<path d="M5 11a6 5 0 0 1 11-3l3-1v4l1 1v3h-2l-2 3h-2v-2H9v2H7l-1-3a5 5 0 0 1-1-4z"/><circle cx="14" cy="10" r=".7"/>',
chart:'<path d="M4 20V4M4 20h16M8 16l3-4 3 2 5-6"/>',receipt:'<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
shield:'<path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6z"/>',percent:'<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
scale:'<path d="M12 4v16M8 20h8M5 8h14M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/>',briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
grad:'<path d="M2 9 12 4l10 5-10 5zM6 11v5c3 2 9 2 12 0v-5"/>',pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
fish:'<path d="M3 12c3-5 9-6 13-2l4-3v10l-4-3c-4 4-10 3-13-2z"/><circle cx="8" cy="11" r=".8"/>',church:'<path d="M12 2v4M10 4h4M6 21V11l6-5 6 5v10M10 21v-4a2 2 0 0 1 4 0v4"/>'});
const ICGROUPS=[['Einnahmen',['banknote','briefcase','bonus','interest','dividend','sidejob','sale','cashback','refund','kidmoney','rentin','moneygift','tipjar','coins']],
 ['Verträge & Abgaben',['contract','umbrella','taxdoc','radio','simcard','stream','schoolbag','parcel','mail','cash','fee','loan','member','handheart']],
 ['Essen & Trinken',['cart','basket','bread','croissant','apple','fork','burger','pizza','takeaway','cup','icecream','kiosk','wine','beer','cocktail']],
 ['Wohnen & Haushalt',['home','key','sofa','bed','broom','laundry','tools','plant','flowers','bolt','flame','drop','wifi']],
 ['Mobilität',['bus','train','car','taxi','bike','scooter','fuel','plug','parking','wheel','plane']],
 ['Gesundheit & Pflege',['heartpulse','pill','pharmacy','clinic','tooth','glasses','bottle','scissors','lipstick','sparkle','leaf']],
 ['Kleidung & Schmuck',['shirt','hanger','shoe','bag','watch','ring']],
 ['Freizeit & Sport',['ticket','film','music','game','camera','palette','book','dumbbell','run','swim','climb','tent','balloon','newspaper','smoke']],
 ['Reisen',['luggage','hotel','map','beach','plane']],
 ['Familie & Soziales',['baby','toy','people','paw','fish','gift','cake','heart','church']],
 ['Technik & Medien',['phone','laptop','tv','headphones','cloud','grid']],
 ['Finanzen & Verträge',['wallet','bank','card','coins','piggy','chart','target','receipt','shield','percent','scale','repeat','lifebuoy','tag','crypto','gold']],
 ['Arbeit & Bildung',['briefcase','grad','pen']],['Sonstiges',['dot','star','calendar','lock','check']]];
const ICNAME={banknote:'Gehalt Lohn Einnahme Geld',bonus:'Bonus Prämie Weihnachtsgeld',interest:'Zinsen Rendite Ertrag',dividend:'Dividende Ausschüttung Aktien',sidejob:'Nebenjob Freelance Minijob',sale:'Verkauf Kleinanzeigen Vinted eBay',cashback:'Cashback Rabatt Payback',refund:'Erstattung Rückzahlung Retoure',kidmoney:'Kindergeld Unterhalt',rentin:'Mieteinnahme Vermietung',moneygift:'Geldgeschenk Taschengeld',tipjar:'Trinkgeld Spardose',umbrella:'Versicherung Haftpflicht',taxdoc:'Steuern Finanzamt',radio:'Rundfunk GEZ Radio',contract:'Vertrag Abo Mitgliedschaft',simcard:'Handyvertrag SIM Mobilfunk',stream:'Streaming Netflix Disney',schoolbag:'Kita Schule Hort',parcel:'Paket Versand',mail:'Post Brief Porto',cash:'Bargeld Geldautomat',fee:'Gebühren Kontoführung Mahnung',loan:'Kredit Darlehen Rate',member:'Verein Mitglied Ausweis',handheart:'Spende Hilfe Ehrenamt',crypto:'Krypto Bitcoin',gold:'Gold Edelmetall',croissant:'Bäckerei Croissant Frühstück',kiosk:'Kiosk Späti Laden',icecream:'Eis Süßes',laundry:'Waschsalon Wäsche Reinigung',flowers:'Blumen Pflanzen',taxi:'Taxi Uber',wheel:'Fahrschule Lenkrad Werkstatt',pharmacy:'Apotheke',clinic:'Klinik Krankenhaus Praxis',swim:'Schwimmbad Baden',newspaper:'Zeitung Abo Magazin',toy:'Spielzeug Kinder',cart:'Einkauf Supermarkt',basket:'Markt Korb',bread:'Bäcker Brot',apple:'Obst Bio',fork:'Restaurant Essen',burger:'Fast Food Kantine',pizza:'Lieferdienst bestellen',takeaway:'To Go Imbiss',cup:'Café Kaffee',wine:'Wein Alkohol',beer:'Bier Bar',cocktail:'Bar Ausgehen',
 home:'Wohnung Miete Fixkosten',key:'Miete Schlüssel',sofa:'Möbel',bed:'Schlafen Hotel',broom:'Haushalt Putzen',tools:'Reparatur Renovierung Werkzeug',plant:'Garten Pflanzen',bolt:'Strom Gehalt Energie',flame:'Gas Heizung Nebenkosten',drop:'Wasser Waschanlage',wifi:'Internet WLAN',
 bus:'ÖPNV Bus Verkehr',train:'Zug Bahn',car:'Auto Taxi Carsharing',bike:'Fahrrad',scooter:'E-Scooter',fuel:'Tanken Benzin',plug:'Laden E-Auto',parking:'Parken',plane:'Flug Reise Dienstreise',
 heartpulse:'Gesundheit Arzt',pill:'Medikamente Apotheke',tooth:'Zahnarzt',glasses:'Brille Optiker',bottle:'Drogerie Pflege',scissors:'Friseur',lipstick:'Beauty Kosmetik',sparkle:'Beauty Glanz',leaf:'Wellness Natur',
 shirt:'Kleidung Sport',hanger:'Mode Kleidung',shoe:'Schuhe',bag:'Shopping Taschen',watch:'Uhr Accessoires',ring:'Schmuck',
 ticket:'Veranstaltung Freizeit Konzert',film:'Kino Film',music:'Musik Spotify Streaming',game:'Spiele Gaming',camera:'Foto Ausflug',palette:'Hobby Malen Kunst',book:'Bücher Zeitschriften',dumbbell:'Fitness Studio',run:'Sport Laufen',climb:'Klettern Berge',tent:'Camping',balloon:'Party Feier',smoke:'Rauchen',
 luggage:'Urlaub Gepäck',hotel:'Hotel Unterkunft',map:'Ausflug Reise',beach:'Strand Urlaub',baby:'Kinder Baby',people:'Familie Freunde Gemeinschaft',paw:'Haustiere',fish:'Aquarium Tier',gift:'Geschenke',cake:'Geburtstag',heart:'Spenden Liebe',church:'Kirche Spende',
 phone:'Handy Telekom Mobilfunk',laptop:'Computer Elektronik Software',tv:'Fernsehen Streaming',headphones:'Hörbücher Audio Technik',cloud:'Cloud iCloud Speicher',grid:'Apps',
 wallet:'Geld Bargeld',bank:'Bank Kontogebühren',card:'Karte Ratenzahlung Kredit',coins:'Münzen Rückzahlung Prämie',piggy:'Sparen Vermögensaufbau',chart:'ETF Aktien Erlöse',target:'Sparziel',receipt:'Beleg Steuer Erstattung',shield:'Versicherung',percent:'Gebühren Zinsen',scale:'Recht Anwalt Scheidung',repeat:'Abo wiederkehrend',lifebuoy:'Notfall Puffer',tag:'Verkauf Preis',
 briefcase:'Arbeit Büro Gehalt',grad:'Bildung Kurs Studium',pen:'Schreiben Büro',dot:'Sonstiges',star:'Favorit',calendar:'Termin',lock:'Sperre',check:'Erledigt'};
const ICMAP=[[/gehalt|lohn|leistungsentgelt|wzu/i,'briefcase'],[/prämie/i,'coins'],[/aufrunden/i,'piggy'],[/ausgleich/i,'scale'],[/geschenk/i,'gift'],[/reisekosten|steuer|erstattung/i,'receipt'],[/rückzahl/i,'coins'],[/verkauf|erlös/i,'tag'],[/retoure/i,'bag'],[/barauslage|bargeld|cash/i,'wallet'],[/baby|kind/i,'baby'],[/krankengeld/i,'heartpulse'],[/moneypenny/i,'coins'],
 [/öffentliche|verkehrsmittel|mobilität|öffi/i,'bus'],[/scooter|vag rad/i,'scooter'],[/zug|bahn/i,'train'],[/carsharing|taxi|auto/i,'car'],[/miete/i,'key'],[/nebenkosten|strom|gas/i,'flame'],[/lebensmittel/i,'cart'],[/haushalt/i,'broom'],[/to go/i,'takeaway'],[/essen bestellen|liefer/i,'pizza'],[/restaurant|café|cafe/i,'fork'],[/kantine/i,'burger'],
 [/versicherung/i,'shield'],[/etf|aktie/i,'chart'],[/krypto/i,'coins'],[/medikament|apotheke/i,'pill'],[/gesundheit|arzt/i,'heartpulse'],[/beauty|kosmetik/i,'lipstick'],[/friseur/i,'scissors'],[/sportkleidung/i,'shirt'],[/kleidung/i,'hanger'],[/schuh/i,'shoe'],[/accessoire/i,'watch'],[/tasche/i,'bag'],[/schmuck/i,'ring'],[/garden|garten/i,'plant'],
 [/streaming/i,'tv'],[/reise/i,'luggage'],[/veranstalt|konzert/i,'ticket'],[/ausflug/i,'map'],[/freizeit/i,'ticket'],[/barbesuch|bar\b/i,'cocktail'],[/klettergear|kletter/i,'climb'],[/camping/i,'tent'],[/^sport|fitness/i,'run'],[/haustier/i,'paw'],[/hörbuch/i,'headphones'],[/bücher|buch|zeitschrift/i,'book'],[/schreiben|malen/i,'pen'],
 [/elektronik/i,'laptop'],[/^apps?$/i,'grid'],[/software/i,'laptop'],[/versand/i,'receipt'],[/kontogebühr/i,'bank'],[/gebühr/i,'percent'],[/büro/i,'briefcase'],[/tanken/i,'fuel'],[/laden/i,'plug'],[/waschanlage/i,'drop'],[/telekom|mobilfunk|handy/i,'phone'],[/gemeinschaft/i,'people'],[/möbel/i,'sofa'],[/renovier/i,'tools'],[/spende/i,'heart'],[/spotify|musik/i,'music'],
 [/ratenzahl|kredit/i,'card'],[/weed/i,'leaf'],[/rauchen/i,'smoke'],[/scheidung/i,'scale'],[/wellness/i,'leaf'],[/vermögen|sparen/i,'piggy'],[/fixkosten/i,'home'],[/abo/i,'repeat'],[/sparziel/i,'target'],[/shopping/i,'bag'],[/hobby/i,'palette'],[/drogerie/i,'bottle'],[/technik/i,'headphones'],[/möbel/i,'sofa'],[/budgets? & sparen/i,'piggy']];
const iconFor=n=>{for(const[re,k] of ICMAP)if(re.test(n||''))return k;return null};
function remapIcons(force){Object.values(S.cats||{}).forEach(L=>L.forEach(c=>{const k=iconFor(c[0]);if(k&&(force||c[1]=='dot'||!c[1]))c[1]=k}))}
const CATICONS=['cart','bottle','scissors','home','pill','bus','car','shirt','fork','cup','ticket','bag','sparkle','palette','gift','target','headphones','plane','sofa','heart','dumbbell','music','book','phone','paw','game','bolt','dot'];
const I=(k,s)=>`<svg class="i" viewBox="0 0 24 24" ${s?`style="width:${s}px;height:${s}px"`:''} aria-hidden="true">${IC[k]||IC.dot}</svg>`;
const EMO={'🛒':'cart','🧴':'bottle','💇‍♀️':'scissors','🏠':'home','💊':'pill','🚌':'bus','👕':'shirt','•':'dot','🍽':'fork','☕':'cup','🎟':'ticket','🛍':'bag','💅':'sparkle','🎨':'palette','🎁':'gift','🎯':'target','🎧':'headphones','✈️':'plane','🛋':'sofa'};
const uid=()=>Math.random().toString(36).slice(2,9);
const $=id=>document.getElementById(id);
const NF2=new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}),NF0=new Intl.NumberFormat('de-DE',{maximumFractionDigits:0});
const eur=x=>NF2.format(x)+'\u00a0€';
const eur0=x=>NF0.format(x)+'\u00a0€';
/* Eine Monats-Fortschreibung für alle Termine: Tag 29–31 wird auf den Monatsletzten gekürzt (wie recDue) */
const dueIn=(y,m,day)=>{const f=new Date(y,m,1),yy=f.getFullYear(),mm=f.getMonth(),dim=new Date(yy,mm+1,0).getDate();return new Date(yy,mm,Math.min(Math.max(1,day||1),dim),12)};
const nextDue=(ds,day)=>{const d=new Date(ds+'T12:00');return ymd(dueIn(d.getFullYear(),d.getMonth()+1,day||d.getDate()).getTime())};
const HISTD=()=>S.hist||'2026-10-01';function histT(){return new Date(HISTD()+'T00:00').getTime()}const isHistE=e=>!!e&&!isPlan(e)&&e.t<histT();
/* Auswertungen: nur Buchungen ab dem Stichtag „Aktiv ab“, ältere sind historisch */
function RX(){const h=histT();if(RX.v&&RX.s===S.exp&&RX.l===S.exp.length&&RX.h===h&&RX.d===DV)return RX.v;RX.s=S.exp;RX.l=S.exp.length;RX.h=h;RX.d=DV;return RX.v=S.exp.filter(e=>!(e.t<h))}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let now=new Date();


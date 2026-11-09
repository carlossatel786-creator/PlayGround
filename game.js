(() => {
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
const $=s=>document.querySelector(s);
const CATALOG={habitats:[
 {id:'savanna',name:'Savanna habitat',icon:'🦒',price:420,desc:'A sunny home for gentle grazers.',animal:'giraffe',color:'#f2cf76',income:42,size:2},
 {id:'elephant',name:'Elephant habitat',icon:'🐘',price:560,desc:'Room for the biggest personalities.',animal:'elephant',color:'#91b9a2',income:52,size:2},
 {id:'lion',name:'Lion habitat',icon:'🦁',price:650,desc:'A cozy den for the king of the savanna.',animal:'lion',color:'#e6a66c',income:64,size:2},
 {id:'penguin',name:'Penguin cove',icon:'🐧',price:720,desc:'Cool water and happy little waddlers.',animal:'penguin',color:'#8bcbd0',income:70,size:2},
 {id:'panda',name:'Panda garden',icon:'🐼',price:800,desc:'Bamboo, shade, and lots of naps.',animal:'panda',color:'#a9c985',income:78,size:2}],
 amenities:[
 {id:'snack',name:'Snack shack',icon:'🍦',price:180,desc:'Treats for hungry explorers.',income:30,size:1},
 {id:'bench',name:'Picnic bench',icon:'🪑',price:90,desc:'A comfy place to take a break.',income:8,size:1},
 {id:'toilet',name:'Restroom',icon:'🚻',price:240,desc:'The little things matter!',income:18,size:1},
 {id:'giftshop',name:'Gift shop',icon:'🎁',price:300,desc:'A souvenir to remember the day.',income:35,size:1}],
 decor:[
 {id:'tree',name:'Flowering tree',icon:'🌳',price:65,desc:'A little shade goes a long way.',income:3,size:1},
 {id:'fountain',name:'Tiny fountain',icon:'⛲',price:150,desc:'A splash of calm for your guests.',income:9,size:1},
 {id:'flower',name:'Wildflower patch',icon:'🌼',price:35,desc:'Bring a pop of color to the path.',income:2,size:1},
 {id:'lamp',name:'Park lantern',icon:'🏮',price:80,desc:'A warm welcome after sunset.',income:4,size:1}]};
let state={cash:1250,guests:18,happiness:78,level:10,expanded:false,selected:null,tab:'habitats',mode:'build',entities:[{id:'starter',type:'habitats',kind:'savanna',x:2,y:2,size:2,animal:'giraffe',happiness:83,age:1}],time:0,feedBoost:0,muted:false};
let paths=new Set(['5,8','5,7','5,6','5,5','4,7','6,7','5,4']), decoSeed=17, tileW=66,tileH=36,originX=0,originY=0,dpr=1,hover=null,toastTimer;
const key=(x,y)=>`${x},${y}`, allItems=()=>Object.values(CATALOG).flat();
function save(){try{localStorage.setItem('wildwood-save',JSON.stringify(state));}catch(e){}}
try{const saved=JSON.parse(localStorage.getItem('wildwood-save'));if(saved&&saved.entities)state={...state,...saved};}catch(e){}
function resize(){dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);const mobile=innerWidth<700;const usableW=mobile?innerWidth-24:innerWidth-365;const usableH=mobile?innerHeight*.54:innerHeight-160;tileW=Math.max(42,Math.min(mobile?54:68,usableW/(state.level*0.68),usableH/(state.level*.52)));tileH=tileW*.53;originX=(mobile?innerWidth*.5:(usableW*.52+20));originY=mobile?innerHeight*.29:innerHeight*.29;}
addEventListener('resize',resize);resize();
function iso(x,y,z=0){return{x:originX+(x-y)*tileW/2,y:originY+(x+y)*tileH/2-z};}
function path(x,y){return paths.has(key(x,y))||state.entities.some(e=>e.kind==='path'&&e.x===x&&e.y===y)}
function rounded(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function poly(points,fill,stroke=null,width=1){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
function diamond(x,y,w,h,fill,stroke){poly([{x:x,y:y-h/2},{x:x+w/2,y:y},{x:x,y:y+h/2},{x:x-w/2,y:y}],fill,stroke,1)}
function tileOccupied(x,y){return state.entities.some(e=>{const s=e.size||1;return x>=e.x&&x<e.x+s&&y>=e.y&&y<e.y+s})}
function drawGround(){
 const L=state.level;
 // soft shadows and park turf
 for(let y=0;y<L;y++)for(let x=0;x<L;x++){
  const p=iso(x,y);const alt=(x*11+y*7)%5;const grass=['#b8dba9','#b3d6a4','#c0dfa9','#b7d9a8','#c5e0b0'][alt];
  diamond(p.x,p.y,tileW,tileH,grass);
  if((x*13+y*5)%17===1){ctx.fillStyle='#9dc99555';ctx.beginPath();ctx.ellipse(p.x+((x*9)%15)-7,p.y+((y*5)%8)-4,2,1,0,0,7);ctx.fill()}
  if(path(x,y)){diamond(p.x,p.y-1,tileW*.96,tileH*.94,'#e7d8b7','#d8c49c');for(let i=0;i<3;i++){ctx.fillStyle='#d3c09d';ctx.beginPath();ctx.ellipse(p.x-7+i*7,p.y+(i%2)*3,1.3,1,0,0,7);ctx.fill()}}
 }
 // little entry plaza and water lily pond
 let p=iso(5,9);diamond(p.x,p.y,tileW*.98,tileH*.94,'#e9d8b6');
 p=iso(8,2);diamond(p.x,p.y,tileW*1.7,tileH*1.3,'#83cbd0','#6fbac0');ctx.fillStyle='#b8ece1';ctx.beginPath();ctx.ellipse(p.x-5,p.y-3,13,4,-.3,0,7);ctx.fill();
 // outer fence except opening toward bottom
 for(let i=0;i<L;i++){
  if(i!==5) fenceAt(i,0,'top'); fenceAt(i,L-1,'bottom');
  if(i!==0)fenceAt(0,i,'left'); fenceAt(L-1,i,'right');
 }
 drawEntrance();
}
function fenceAt(x,y,edge){let p=iso(x,y),a,b;if(edge==='top'){a={x:p.x-tileW/2,y:p.y};b={x:p.x,y:p.y-tileH/2}}else if(edge==='left'){a={x:p.x-tileW/2,y:p.y};b={x:p.x,y:p.y+tileH/2}}else if(edge==='bottom'){a={x:p.x,y:p.y+tileH/2};b={x:p.x+tileW/2,y:p.y}}else{a={x:p.x+tileW/2,y:p.y};b={x:p.x,y:p.y-tileH/2}}ctx.strokeStyle='#8c7954';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y-7);ctx.lineTo(b.x,b.y-7);ctx.stroke();for(const q of [a,b]){ctx.fillStyle='#fff0ce';ctx.beginPath();ctx.arc(q.x,q.y-7,1.7,0,7);ctx.fill()}}
function drawEntrance(){const p=iso(5,9);ctx.fillStyle='#775e42';ctx.fillRect(p.x-17,p.y-25,34,4);ctx.fillRect(p.x-15,p.y-25,3,26);ctx.fillRect(p.x+12,p.y-25,3,26);ctx.fillStyle='#fff3d4';ctx.font=`bold ${Math.max(7,tileW*.13)}px sans-serif`;ctx.textAlign='center';ctx.fillText('WILDWOOD',p.x,p.y-17)}
function drawTree(x,y,scale=1){const p=iso(x,y);ctx.fillStyle='#42634a33';ctx.beginPath();ctx.ellipse(p.x+2,p.y+1,11*scale,5*scale,0,0,7);ctx.fill();ctx.fillStyle='#755b3d';ctx.fillRect(p.x-2*scale,p.y-14*scale,4*scale,15*scale);for(let i=0;i<3;i++){ctx.fillStyle=['#47845c','#599866','#6ba874'][i];ctx.beginPath();ctx.arc(p.x+(i-1)*7*scale,p.y-20*scale-(i%2)*5*scale,9*scale,0,7);ctx.fill()}}
function drawAnimal(kind,x,y,t){const bob=Math.sin(t*.004+x)*2;ctx.save();ctx.translate(x,y+bob);ctx.fillStyle='#344a3d25';ctx.beginPath();ctx.ellipse(0,0,13,5,0,0,7);ctx.fill();
 const body=(color,w=18,h=12)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,-10,w,h,0,0,7);ctx.fill()};
 if(kind==='giraffe'){body('#e5b64f');ctx.fillStyle='#e5b64f';ctx.beginPath();ctx.ellipse(9,-21,4,10,-.18,0,7);ctx.fill();ctx.beginPath();ctx.arc(11,-31,5,0,7);ctx.fill();ctx.fillStyle='#5e472b';for(const [a,b] of [[-8,-10],[-2,-16],[5,-8],[9,-24]]){ctx.beginPath();ctx.arc(a,b,1.8,0,7);ctx.fill()}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(12,-32,1,0,7);ctx.fill()}
 else if(kind==='elephant'){body('#91a6a0',20,13);ctx.fillStyle='#9dafaa';ctx.beginPath();ctx.arc(12,-17,9,0,7);ctx.fill();ctx.fillStyle='#d5b7aa';ctx.beginPath();ctx.ellipse(18,-17,4,6,.2,0,7);ctx.fill();ctx.strokeStyle='#7d9690';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(18,-12);ctx.quadraticCurveTo(22,-6,16,-4);ctx.stroke();ctx.fillStyle='white';ctx.beginPath();ctx.arc(14,-19,1.5,0,7);ctx.fill()}
 else if(kind==='lion'){body('#d99a4e',17,12);ctx.fillStyle='#b97839';ctx.beginPath();ctx.arc(11,-19,10,0,7);ctx.fill();ctx.fillStyle='#e6b45e';ctx.beginPath();ctx.arc(11,-19,6,0,7);ctx.fill();ctx.fillStyle='#544130';ctx.beginPath();ctx.arc(13,-20,1,0,7);ctx.fill()}
 else if(kind==='penguin'){body('#344d57',12,16);ctx.fillStyle='#f8f2d9';ctx.beginPath();ctx.ellipse(4,-11,6,11,-.15,0,7);ctx.fill();ctx.fillStyle='#edaa4b';ctx.beginPath();ctx.moveTo(11,-21);ctx.lineTo(17,-19);ctx.lineTo(11,-17);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(9,-25,2,0,7);ctx.fill();ctx.fillStyle='#23343a';ctx.beginPath();ctx.arc(10,-25,1,0,7);ctx.fill()}
 else {body('#eee8dc',17,12);ctx.fillStyle='#171d1a';for(const [a,b]of[[-6,-15],[3,-7],[10,-15]]){ctx.beginPath();ctx.arc(a,b,4,0,7);ctx.fill()}ctx.fillStyle='#eee8dc';ctx.beginPath();ctx.arc(10,-19,6,0,7);ctx.fill();ctx.fillStyle='#181e1c';ctx.beginPath();ctx.arc(8,-25,3,0,7);ctx.arc(14,-25,3,0,7);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(12,-20,1,0,7);ctx.fill()}
 ctx.fillStyle=kind==='penguin'?'#edab4f':'#66513b';for(let i=-1;i<=1;i+=2){ctx.beginPath();ctx.ellipse(i*6,-2,2,3,0,0,7);ctx.fill()}ctx.restore()}
function drawBuilding(e,t){const item=allItems().find(a=>a.id===e.kind),s=e.size||1,c=iso(e.x+(s-1)/2,e.y+(s-1)/2),w=tileW*s*.94,h=tileH*s*.92;
 if(e.type==='habitats'){
  diamond(c.x,c.y,w,h,e.kind==='penguin'?'#8ecbd0':e.kind==='lion'?'#c9d28c':'#a9d392','#f5e7b6');
  // fenced enclosure edge
  ctx.strokeStyle='#876f4c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c.x-w/2,c.y);ctx.lineTo(c.x,c.y-h/2);ctx.lineTo(c.x+w/2,c.y);ctx.lineTo(c.x,c.y+h/2);ctx.stroke();
  for(const [a,b]of[[-.5,0],[0,-.5],[.5,0],[0,.5]]){const fx=c.x+a*w,fy=c.y+b*h;ctx.fillStyle='#fff0ce';ctx.fillRect(fx-1.6,fy-7,3,9)}
  if(e.kind==='savanna'){for(let i=0;i<4;i++){let tx=c.x+(i%2-.5)*w*.45,ty=c.y+(Math.floor(i/2)-.5)*h*.34;ctx.fillStyle='#79aa6a';ctx.beginPath();ctx.ellipse(tx,ty,5,2,0,0,7);ctx.fill()}}
  if(e.kind==='penguin'){ctx.fillStyle='#b4edf0';ctx.beginPath();ctx.ellipse(c.x,c.y-2,w*.23,h*.17,0,0,7);ctx.fill()}
  drawAnimal(e.animal,c.x-5+Math.sin(t*.001+e.x)*tileW*.12,c.y-5,t);drawAnimal(e.animal,c.x+tileW*.17,c.y-1,t+700);
  ctx.fillStyle='#fffdf5';ctx.beginPath();ctx.roundRect(c.x-w*.24,c.y-h*.52,w*.48,13,6);ctx.fill();ctx.fillStyle='#476a4e';ctx.font=`bold ${Math.max(7,tileW*.14)}px sans-serif`;ctx.textAlign='center';ctx.fillText(e.kind==='savanna'?'GIRAFFE':e.kind.toUpperCase(),c.x,c.y-h*.52+9);
 }else if(e.kind==='tree'){drawTree(e.x,e.y,1.05)}else if(e.kind==='flower'){ctx.fillStyle='#3d995d';ctx.beginPath();ctx.ellipse(c.x,c.y-5,10,4,0,0,7);ctx.fill();for(let i=0;i<5;i++){ctx.fillStyle=['#f5cb69','#eaa0ad','#fff1d2'][i%3];ctx.beginPath();ctx.arc(c.x-5+i*2.5,c.y-12+(i%2)*3,2.4,0,7);ctx.fill()}}
 else if(e.kind==='fountain'){ctx.fillStyle='#8ccbd0';ctx.beginPath();ctx.ellipse(c.x,c.y-5,13,6,0,0,7);ctx.fill();ctx.fillStyle='#eee2bd';ctx.fillRect(c.x-7,c.y-12,14,7);ctx.fillStyle='#a1dae0';ctx.beginPath();ctx.arc(c.x,c.y-14,4,0,7);ctx.fill()}
 else if(e.kind==='lamp'){ctx.fillStyle='#6b664e';ctx.fillRect(c.x-1,c.y-20,2,20);ctx.fillStyle='#ffdf86';ctx.beginPath();ctx.arc(c.x,c.y-21,5,0,7);ctx.fill();ctx.fillStyle='#fff5bd';ctx.beginPath();ctx.arc(c.x,c.y-21,2.5,0,7);ctx.fill()}
 else {const emoji={snack:'🍦',bench:'🪑',toilet:'🚻',giftshop:'🎁'}[e.kind]||'🏠';ctx.fillStyle='#607c5440';ctx.beginPath();ctx.ellipse(c.x,c.y-2,14,6,0,0,7);ctx.fill();ctx.font=`${tileW*.39}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(emoji,c.x,c.y-15)}
 if(state.inspectId===e.id){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.ellipse(c.x,c.y-1,w*.52,h*.52,0,0,7);ctx.stroke();ctx.setLineDash([])}
}
function draw(now){ctx.clearRect(0,0,innerWidth,innerHeight);drawGround();const sorted=[...state.entities].sort((a,b)=>(a.x+a.y)-(b.x+b.y));for(const e of sorted)drawBuilding(e,now);if(hover&&state.mode==='build'&&state.selected){const item=allItems().find(a=>a.id===state.selected);const p=iso(hover.x+(item.size-1)/2,hover.y+(item.size-1)/2);diamond(p.x,p.y,tileW*item.size,tileH*item.size,canPlace(hover.x,hover.y,item)?'#86d39277':'#e56f6177','#fff');}requestAnimationFrame(draw)}requestAnimationFrame(draw);
function canPlace(x,y,item){if(x<1||y<1||x+item.size>state.level-1||y+item.size>state.level-1)return false;for(let yy=y;yy<y+item.size;yy++)for(let xx=x;xx<x+item.size;xx++){if(path(xx,yy)||tileOccupied(xx,yy))return false;if(xx===8&&yy===2)return false}return true}
function showToast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2100)}
function totalIncome(){return Math.round(state.guests*.58+state.entities.reduce((n,e)=>n+(allItems().find(a=>a.id===e.kind)?.income||0),0))}
function updateHud(){const income=totalIncome();$('#cash').textContent='$'+Math.floor(state.cash).toLocaleString();$('#guests').textContent=state.guests;$('#happiness').textContent=Math.round(state.happiness)+'%';$('#income').textContent=`+$${income}/min`;const h=state.entities.filter(e=>e.type==='habitats').length;$('#missionText').textContent=h<2?'Build one more animal habitat':'Add a snack shack for your guests';$('#missionProgress').textContent=h<2?`${Math.max(0,h-1)} / 1`:`${state.entities.some(e=>e.kind==='snack')?1:0} / 1`;$('#mission').classList.toggle('done',h>=2&&state.entities.some(e=>e.kind==='snack'));save()}
function renderShop(){const list=CATALOG[state.tab];$('#shopItems').innerHTML=list.map(i=>`<button class="shop-card ${state.selected===i.id?'chosen':''}" data-id="${i.id}"><span class="shop-art">${i.icon}</span><span class="shop-copy"><b>${i.name}</b><small>${i.desc}</small></span><span class="shop-price">🪙${i.price}</span></button>`).join('');document.querySelectorAll('.shop-card').forEach(b=>b.onclick=()=>{state.selected=b.dataset.id;state.mode='build';$('#inspectToggle').classList.remove('active');$('#buildToggle').classList.add('active');$('#buildPanel').classList.remove('hidden');$('#hint').textContent='TAP AN EMPTY TILE TO PLACE';$('#selectedNote').textContent='Tap a clear spot in your zoo to place your '+allItems().find(a=>a.id===state.selected).name.toLowerCase()+'.';renderShop()})}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===b));renderShop()});renderShop();
function tileFromPoint(px,py){let best=null,dist=Infinity;for(let y=0;y<state.level;y++)for(let x=0;x<state.level;x++){const p=iso(x,y),dx=Math.abs(px-p.x),dy=Math.abs(py-p.y);if(dx/(tileW/2)+dy/(tileH/2)<=1.05){const d=dx+dy;if(d<dist){dist=d;best={x,y}}}}return best}
function findEntityAt(x,y){return [...state.entities].reverse().find(e=>x>=e.x&&x<e.x+(e.size||1)&&y>=e.y&&y<e.y+(e.size||1))}
canvas.addEventListener('pointermove',ev=>{hover=tileFromPoint(ev.clientX,ev.clientY)});
canvas.addEventListener('pointerleave',()=>hover=null);
canvas.addEventListener('pointerdown',ev=>{if(ev.pointerType==='touch')ev.preventDefault();const tile=tileFromPoint(ev.clientX,ev.clientY);if(!tile)return;const found=findEntityAt(tile.x,tile.y);
 if(state.mode==='inspect'){if(found){state.inspectId=found.id;openInspect(found)}else showToast(path(tile.x,tile.y)?'Zoo path — a busy little walkway!':'Tap Build to add something lovely.');return}
 if(state.selected){const item=allItems().find(a=>a.id===state.selected);if(!item)return;if(state.cash<item.price){showToast('Not quite enough coins yet!');return}if(!canPlace(tile.x,tile.y,item)){showToast('That spot is already in use — try a clear grassy tile.');return}state.cash-=item.price;const id='e'+Date.now();state.entities.push({id,type:state.tab,kind:item.id,x:tile.x,y:tile.y,size:item.size,animal:item.animal,happiness:80,age:0});state.selected=null;$('#hint').textContent='TAP AN EMPTY TILE TO BUILD';$('#selectedNote').textContent='Choose an item, then tap a clear spot in your zoo.';renderShop();updateHud();showToast(`${item.name} built! Your guests will love it.`);return}
 if(found){state.inspectId=found.id;openInspect(found)}else showToast(path(tile.x,tile.y)?'Zoo path — a busy little walkway!':'Choose something from the shop to build here.')
});
function openInspect(e){const item=allItems().find(a=>a.id===e.kind);const isHab=e.type==='habitats';$('#modal').innerHTML=`<div class="big-emoji">${item?.icon||'🌿'}</div><h2>${item?.name||'Wildwood park'}</h2><p>${isHab?`Your ${e.animal} is feeling ${e.happiness>75?'great':'a little hungry'}! ${e.age?`Here for ${e.age} days.`:''}`:`A lovely addition to your zoo. Guests are enjoying it.`}</p><div class="inspect-stats"><span>💚 ${isHab?e.happiness:100}% comfort</span><span>🪙 +$${item?.income||0}/min</span></div><div class="modal-actions">${isHab?'<button class="primary" id="modalFeed">🥕 Feed animal · $40</button>':''}<button class="secondary" id="modalClose">Keep exploring</button></div><button class="sell-link" id="modalSell">Sell for $${Math.floor((item?.price||0)*.45)}</button>`;$('#modalBackdrop').classList.add('open');$('#modalClose').onclick=closeModal;$('#modalFeed')?.addEventListener('click',()=>{if(state.cash<40){showToast('You need $40 to feed your animal.');return}state.cash-=40;e.happiness=Math.min(100,e.happiness+25);state.happiness=Math.min(100,state.happiness+4);closeModal();updateHud();showToast('A happy tummy makes a happy animal! 🥕')});$('#modalSell').onclick=()=>{state.cash+=Math.floor((item?.price||0)*.45);state.entities=state.entities.filter(a=>a.id!==e.id);state.inspectId=null;closeModal();updateHud();showToast('Sold — thanks for caring for your zoo!')};}
function closeModal(){$('#modalBackdrop').classList.remove('open')}$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});$('#closeShop').onclick=()=>$('#buildPanel').classList.add('hidden');
$('#buildToggle').onclick=()=>{state.mode='build';state.selected=null;$('#buildToggle').classList.add('active');$('#inspectToggle').classList.remove('active');$('#buildPanel').classList.remove('hidden');$('#hint').textContent='TAP AN EMPTY TILE TO BUILD';renderShop()};
$('#inspectToggle').onclick=()=>{state.mode='inspect';state.selected=null;state.inspectId=null;$('#inspectToggle').classList.add('active');$('#buildToggle').classList.remove('active');$('#buildPanel').classList.add('hidden');$('#hint').textContent='TAP AN ANIMAL OR BUILDING TO INSPECT';renderShop()};
$('#feedBtn').onclick=()=>{const target=state.entities.find(e=>e.id===state.inspectId&&e.type==='habitats')||state.entities.find(e=>e.type==='habitats');if(!target){showToast('Build an animal habitat first!');return}if(state.cash<40){showToast('You need $40 to feed your animal.');return}state.cash-=40;target.happiness=Math.min(100,(target.happiness||80)+25);state.happiness=Math.min(100,state.happiness+5);state.feedBoost=30;updateHud();showToast(`A tasty treat for your ${target.animal}! 🥕`)};
$('#expandBtn').onclick=()=>{if(state.expanded){showToast('Your park is already fully expanded!');return}if(state.cash<500){showToast('Save up $500 to expand your park.');return}state.cash-=500;state.expanded=true;state.level=12;resize();updateHud();showToast('New land unlocked! Your zoo is growing 🌱')};
$('#sound').onclick=()=>{state.muted=!state.muted;$('#sound').textContent=state.muted?'🔇':'🔊';showToast(state.muted?'Sound effects off':'Sound effects on')};
let lastTick=Date.now();setInterval(()=>{const now=Date.now(),dt=Math.min(2,(now-lastTick)/1000);lastTick=now;state.time+=dt;state.cash+=totalIncome()*dt/60;if(Math.floor(state.time)%12===0&&Math.floor(state.time-dt)!==Math.floor(state.time)){state.guests=Math.min(99,state.guests+Math.max(1,Math.floor(state.entities.length/3)));}
 const habitats=state.entities.filter(e=>e.type==='habitats');if(habitats.length){const avg=habitats.reduce((n,e)=>n+(e.happiness||80),0)/habitats.length;state.happiness=Math.max(50,Math.min(99,state.happiness+(avg-state.happiness)*.006+(state.feedBoost>0?.05:-.01)));habitats.forEach(e=>{e.happiness=Math.max(45,(e.happiness||80)-.006*dt);e.age=(e.age||0)+dt/360})}if(state.feedBoost>0)state.feedBoost-=dt;updateHud()},1000);
updateHud();
})();

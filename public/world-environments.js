import * as THREE from './vendor/three.js';
import {nearestFairway} from './physics.js';
import {pointAlong,courses} from './courses.js';
const rngFor=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function position(level,f,side=0){const p=pointAlong(level.path,f),near=nearestFairway(level,p.x,p.y),d=Math.hypot(near.dx,near.dy);return{x:p.x-near.dy/d*side-250,z:p.y+near.dx/d*side-290}}
function instances(w,geometry,color,transforms){const m=new THREE.InstancedMesh(geometry,w.material(color),transforms.length),matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3();transforms.forEach((t,i)=>{q.setFromEuler(new THREE.Euler(0,t.rot||0,0));matrix.compose(new THREE.Vector3(t.x,t.y,t.z),q,v.set(t.sx||t.s||1,t.sy||t.s||1,t.sz||t.s||1));m.setMatrixAt(i,matrix)});m.castShadow=false;m.receiveShadow=true;w.root.add(m);return m}
export function buildFairway(w,level){
 const turf=w.palette[1],edge=w.palette[3];
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=turf;c.fillRect(0,0,128,128);c.fillStyle='#ffffff0b';c.fillRect(0,0,64,64);c.fillRect(64,64,64,64);const rnd=rngFor(35);for(let i=0;i<550;i++){c.fillStyle=i%2?'#ffffff12':'#1a56200b';c.fillRect(rnd()*128,rnd()*128,1,2)}const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,3);texture.colorSpace=THREE.SRGBColorSpace;w.grassTexture=texture;
 const grass=w.material(turf,{map:texture});const stones=[];
 for(let i=0;i<level.path.length-1;i++){
  const a=level.path[i],b=level.path[i+1],length=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.x-a.x,b.y-a.y),g=w.group((a.x+b.x)/2-250,0,(a.y+b.y)/2-290);g.rotation.y=angle;
  w.box(0,-5,0,level.width+8,18,length,w.palette[2],g);const top=w.box(0,3,0,level.width,6,length,turf,g);top.material=grass;
  for(let s=0;s<=length;s+=13)for(const side of [-1,1]){const t=s/length,x=a.x+(b.x-a.x)*t+(b.y-a.y)/length*level.width/2*side,y=a.y+(b.y-a.y)*t-(b.x-a.x)/length*level.width/2*side;if(nearestFairway(level,x,y).distance>level.width/2-2)stones.push({x:x-250,y:9,z:y-290,s:1})}
 }
 for(const p of level.path){w.cylinder(p.x-250,-4,p.y-290,level.width/2+4,level.width/2+8,18,w.palette[2]);const top=w.cylinder(p.x-250,3,p.y-290,level.width/2,level.width/2,6,turf);top.material=grass;for(let i=0;i<40;i++){const a=i*Math.PI/20,x=p.x+Math.cos(a)*level.width/2,y=p.y+Math.sin(a)*level.width/2;if(nearestFairway(level,x,y).distance>level.width/2-2)stones.push({x:x-250,y:9,z:y-290,s:1})}}
 instances(w,new THREE.SphereGeometry(5.5,8,6),edge,stones);
 // Ground arrows mark the next bend, with no compulsory shortcut or narrow jump.
 for(let i=1;i<level.path.length;i++){const a=level.path[i-1],b=level.path[i],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);for(let f=.25;f<.9;f+=.25){const g=w.group(a.x+dx*f-250,7,a.y+dy*f-290);g.rotation.y=Math.atan2(dx,dy);const shape=new THREE.Shape();shape.moveTo(0,-9);shape.lineTo(-8,3);shape.lineTo(-3,3);shape.lineTo(-3,11);shape.lineTo(3,11);shape.lineTo(3,3);shape.lineTo(8,3);shape.closePath();const arrow=w.mesh(new THREE.ShapeGeometry(shape),'#f4e6a4',g);arrow.rotation.x=-Math.PI/2;arrow.rotation.z=Math.PI;arrow.castShadow=false}}
}
function terrain(w,level,id){
 const rnd=rngFor(id*541+77),snow=id===13,space=id===7,night=[2,7,11].includes(id);const ocean=[4,9].includes(id);const base=snow?'#dce9ed':id===6?'#846f65':night?'#5c6273':ocean?'#82bec0':'#7ca36b';
 const p=pointAlong(level.path,.5);const cx=p.x-250,cz=p.y-290;
 const size=2800,n=52,positions=[],colors=[],indices=[];const color=new THREE.Color(base);
 for(let z=0;z<=n;z++)for(let x=0;x<=n;x++){const xx=(x/n-.5)*size+cx,zz=(z/n-.5)*size+cz,d=nearestFairway(level,xx+250,zz+290).distance,fade=Math.min(1,Math.max(0,(d-level.width/2-20)/220));let h=-15+(Math.sin(xx*.008)+Math.cos(zz*.006))*22*fade+Math.sin(xx*.013+zz*.009)*16*fade;if(ocean)h-=35;if(space)h=-100;positions.push(xx,h,zz);const tint=color.clone().multiplyScalar(.9+rnd()*.2);colors.push(tint.r,tint.g,tint.b);if(x<n&&z<n){const a=z*(n+1)+x;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2)}}
 if(!space){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();w.mesh(g,'#ffffff',w.root,{vertexColors:true,roughness:1}).userData.cameraIgnore=true}
 // A spherical gradient sky surrounds the whole scene rather than a flat backdrop.
 const skyCanvas=document.createElement('canvas');skyCanvas.width=16;skyCanvas.height=256;const ctx=skyCanvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,night?'#17233f':id===6?'#d79079':'#74b5dc');gradient.addColorStop(.55,w.palette[0]);gradient.addColorStop(1,w.palette[0]);ctx.fillStyle=gradient;ctx.fillRect(0,0,16,256);const texture=new THREE.CanvasTexture(skyCanvas);texture.colorSpace=THREE.SRGBColorSpace;const dome=new THREE.Mesh(new THREE.SphereGeometry(2900,24,16),new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,depthWrite:false}));dome.position.set(cx,0,cz);w.root.add(dome);
 w.scene.fog=new THREE.Fog(w.palette[0],1000,2500);
 if(!space)for(let i=0;i<14;i++){const a=i*Math.PI/7,r=1000+rnd()*400,h=180+rnd()*400;const mountain=w.mesh(new THREE.ConeGeometry(180+rnd()*180,h,6),snow?'#c5dce3':night?'#515b78':id===6?'#a87b6c':'#77998b');mountain.position.set(cx+Math.sin(a)*r,h/2-40,cz+Math.cos(a)*r);mountain.rotation.y=rnd()*6;mountain.castShadow=false;if(snow){const cap=w.cone(mountain.position.x,h*.87-40,mountain.position.z,90,h*.3,'#f7fbf2');cap.castShadow=false}}
 if([0,4,9,10,15].includes(id)){
  const water=w.box(cx,-25,cz,2300,3,2300,id===9?'#5aaeb9':'#65b8c2');water.material=w.material(id===9?'#5aaeb9':'#65b8c2',{roughness:.28,metalness:.12,transparent:true,opacity:.86});water.castShadow=false;
  if(!ocean){water.scale.x=.14;water.rotation.y=.28;water.position.x=cx+220;}
  w.animations.push(t=>{water.position.y=-25+Math.sin(t*.8)*1.4;water.material.color.setHSL(.51+Math.sin(t*.18)*.01,.34,.57)});
  for(let i=0;i<8;i++){const ripple=w.torus(cx+(rnd()-.5)*500,-21,cz+(rnd()-.5)*700,12,1,'#b6e1d8');ripple.rotation.x=Math.PI/2;ripple.castShadow=false;w.animations.push(t=>{const s=1+((t*.35+i*.2)%1)*3;ripple.scale.setScalar(s);ripple.visible=(t*.35+i*.2)%1<.85})}
 }
 if(![7,4,9,16].includes(id)){
  const trunks=[],leaves=[],tips=[],tropical=[0,10,15].includes(id),candy=id===5,bricks=[1,8].includes(id);for(let i=0;i<140;i++){const x=cx+(rnd()-.5)*1900,z=cz+(rnd()-.5)*1900;if(nearestFairway(level,x+250,z+290).distance<315||Math.hypot(x+250-level.start.x,z+290-level.start.y)<400)continue;const s=.7+rnd()*1.8;trunks.push({x,y:30*s-12,z,sx:5*s,sy:60*s,sz:5*s});leaves.push({x,y:90*s-12,z,sx:(tropical?47:38)*s,sy:(tropical||candy?32:70)*s,sz:(tropical?47:38)*s});tips.push({x:x+10*s,y:115*s-12,z:z+5*s,sx:28*s,sy:(tropical||candy?28:50)*s,sz:28*s})}
  instances(w,new THREE.CylinderGeometry(1,1,1,6),snow?'#a6a19a':candy?'#e6c8b0':'#8f7759',trunks);instances(w,bricks?new THREE.BoxGeometry(1,1,1):tropical||candy?new THREE.SphereGeometry(1,8,6):new THREE.ConeGeometry(1,1,7),snow?'#e6f3ed':night?'#6c7290':candy?'#dba2b8':id===6?'#96926e':'#537e62',leaves);instances(w,bricks?new THREE.BoxGeometry(1,1,1):tropical||candy?new THREE.SphereGeometry(1,8,6):new THREE.ConeGeometry(1,1,7),snow?'#fffdf2':night?'#8285a0':candy?'#b2d6c4':'#7eaa70',tips);
 }
 if(space)for(let i=0;i<25;i++){const asteroid=w.mesh(new THREE.IcosahedronGeometry(30+rnd()*35,0),'#7d88aa');asteroid.position.set(cx+(rnd()-.5)*1700,-80-rnd()*100,cz+(rnd()-.5)*1600);asteroid.rotation.set(rnd()*4,rnd()*4,rnd()*4);w.animations.push(t=>asteroid.rotation.y=t*.05+i)}
 return{cx,cz,rnd};
}
function flyer(w,x,z,{pterosaur=false,color='#e9bc7e',scale=1,phase=0}={}){
 const bird=w.group();bird.userData.creature=pterosaur?'pterosaur':'bird';bird.scale.setScalar(scale);w.sphere(0,0,0,pterosaur?9:5,color,bird,[1,.7,1.9]);w.sphere(0,4,-(pterosaur?17:9),pterosaur?6:3,color,bird);const beak=w.cone(0,3,pterosaur?-29:-15,pterosaur?4:2,pterosaur?19:10,'#e7a95e',bird);beak.rotation.x=-Math.PI/2;
 const wings=[];for(const side of [-1,1]){const g=w.group(side*4,1,0,bird),r=pterosaur?65:32;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-5,side*r,0,-17,side*r*.65,0,21,side*15,0,12],3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const wing=w.mesh(geo,pterosaur?'#c5a083':color,g,{side:THREE.DoubleSide});wing.castShadow=false;wings.push({g,side});}
 const radius=pterosaur?420:290,height=pterosaur?190:115,speed=pterosaur?.12:.23;
 w.animations.push(t=>{const a=t*speed+phase,xx=Math.cos(a)*radius,zz=Math.sin(a)*radius*.75;bird.position.set(x+xx,height+Math.sin(t*.8+phase)*28,z+zz);bird.rotation.y=Math.atan2(Math.sin(a),-Math.cos(a)*.75);bird.rotation.z=Math.sin(a)*.12;wings.forEach(({g,side})=>g.rotation.z=side*(.15+Math.sin(t*(pterosaur?3:6)+phase)*.52))});return bird;
}
function waterfall(w,x,z,scale=1){
 const g=w.group(x,0,z);g.scale.setScalar(scale);for(let i=0;i<8;i++){const rock=w.mesh(new THREE.DodecahedronGeometry(40),'#819a8c',g);rock.position.set((i%3-1)*38,25+Math.floor(i/3)*48,0);rock.scale.set(1,1.2,.8)}
 const sheet=w.box(0,75,28,57,150,4,'#91d5dd',g);sheet.material=w.material('#91d5dd',{transparent:true,opacity:.78,roughness:.25});
 for(let i=0;i<12;i++){const streak=w.box((i%4-1.5)*13,0,33,3,26,2,'#e1f5e9',g);streak.castShadow=false;w.animations.push(t=>streak.position.y=150-((t*65+i*19)%150))}
 for(let i=0;i<5;i++){const mist=w.sphere((i-2)*15,8,38,12,'#e9f7eb',g,[1,.45,1]);mist.castShadow=false;w.animations.push(t=>mist.scale.setScalar(.8+Math.sin(t*2+i)*.2))}
 w.cylinder(x,0,z+35,70,70,5,'#7ac7cf');
}
function balloon(w,x,y,z,color,s=1){const g=w.group(x,y,z);g.scale.setScalar(s);w.sphere(0,30,0,28,color,g,[1,1.2,1]);w.box(0,-22,0,20,17,20,'#bd9466',g);for(const side of [-1,1])w.link([side*9,-14,0],[side*17,8,0],1.2,'#eee4bc',g);w.animations.push(t=>{g.position.y=y+Math.sin(t*.5+x)*12;g.rotation.z=Math.sin(t*.4+z)*.04});return g}
function ferris(w,x,z){const g=w.group(x,0,z);for(const side of [-1,1])w.link([side*60,0,0],[0,130,0],6,'#baa1ca',g);const wheel=w.group(0,135,0,g);const rim=w.torus(0,0,0,90,5,'#efc36b',wheel);for(let i=0;i<8;i++){const a=i*Math.PI/4;w.link([0,0,0],[Math.sin(a)*90,Math.cos(a)*90,0],2,'#f7dfad',wheel);const gondola=w.group(Math.sin(a)*90,Math.cos(a)*90,0,wheel);w.box(0,-12,0,25,19,22,['#ee9da5','#a5cdb9','#a4bfdc'][i%3],gondola);w.link([-12,-4,0],[0,18,0],1.2,'#e2cfa2',gondola);w.link([12,-4,0],[0,18,0],1.2,'#e2cfa2',gondola);w.animations.push(t=>gondola.rotation.z=-t*.22)}w.animations.push(t=>wheel.rotation.z=t*.22);return g}
function fishSchool(w,level){for(let i=0;i<12;i++){const p=position(level,.15+i*.06,i%2?160:-160),fish=w.group(p.x,25+i%4*25,p.z);w.sphere(0,0,0,12,['#f1b76d','#a9bfdc','#e5a5bb'][i%3],fish,[1.7,.8,.5]);w.cone(-25,0,0,10,20,'#f1bb76',fish).rotation.z=Math.PI/2;w.sphere(11,3,5,2.5,'#365d6a',fish);w.animations.push(t=>{fish.position.x=p.x+Math.sin(t*.6+i)*70;fish.position.y=30+i%4*20+Math.sin(t*1.2+i)*12;fish.rotation.y=Math.sin(t*.6+i)*.5})}}
function train(w,level){const p=position(level,.45,-390);const train=w.group();for(let i=0;i<4;i++){const car=w.group(0,0,i*53,train);w.box(0,15,0,36,30,44,['#e88d67','#f1c663','#91b9d1','#a4c095'][i],car);for(const s of [-1,1])for(const z of [-14,14]){const tire=w.cylinder(s*20,2,z,7,7,5,'#70858b',car,10);tire.rotation.z=Math.PI/2}if(i===0){w.cylinder(0,42,-12,6,7,22,'#e9ae65',car);w.eyes(car,0,23,-25,4)}}w.animations.push(t=>{const a=t*.13;train.position.set(p.x+Math.sin(a)*150,5,p.z+Math.cos(a)*120);train.rotation.y=a+Math.PI/2});return train}
function dragon(w,level){const p=position(level,.45,-220),g=w.dino(p.x,p.z,{scale:2,color:'#a09bc9'});const wings=[];for(const side of [-1,1]){const wing=w.group(side*20,58,0,g);const mesh=w.cone(side*15,0,-15,35,55,'#c7b6db',wing);mesh.scale.z=.15;mesh.rotation.z=side*.6;wings.push({wing,side})}w.animations.push(t=>{g.position.y=30+Math.sin(t*.7)*25;wings.forEach(({wing,side})=>wing.rotation.z=side*(.4+Math.sin(t*2)*.4))});for(let i=0;i<6;i++){const spark=w.sphere(p.x,90,p.z+100,4,'#ffd087');w.animations.push(t=>{const f=(t*.4+i/6)%1;spark.position.set(p.x+Math.sin(i)*f*30,100+Math.sin(t*.7)*25-f*25,p.z+100+f*150);spark.scale.setScalar(1-f)})}}
export function buildEnvironment(w,id){
 const l=w.level,{cx,cz,rnd}=terrain(w,l,id);w.wildlife=[];w.environmentName=courses[id].name;
 if([0,10,15].includes(id)){
  for(let i=0;i<4;i++)w.wildlife.push(flyer(w,cx,cz,{pterosaur:true,scale:1.1+i*.1,phase:i*1.6,color:i%2?'#b9c89b':'#d1b68c'}));
  for(let i=0;i<6;i++)w.wildlife.push(flyer(w,cx-100,cz+150,{phase:i*.7,color:'#e5d6aa',scale:.8}));
  const d=position(l,.34,180);const big=w.dino(d.x,d.z,{scale:id===10?2.6:2.1,rex:id===10,color:id===10?'#86a673':'#83b58c'});const original=big.position.clone();w.animations.push(t=>{big.position.x=original.x+Math.sin(t*.22)*24;big.rotation.y=Math.sin(t*.22)*.22});
  for(let i=0;i<3;i++){const p=position(l,.25+i*.21,i%2?190:-190),baby=w.dino(p.x,p.z,{scale:.55,color:'#d2be83'});w.animations.push(t=>baby.position.z=p.z+Math.sin(t*.65+i)*25)}
  const p=position(l,.65,-230);waterfall(w,p.x,p.z,id===15?2.2:1.6);
 }
 if([1,8].includes(id)){
  train(w,l);for(let i=0;i<12;i++){const p=position(l,.1+i*.07,(i%2?1:-1)*(210+rnd()*100)),g=w.group(p.x,0,p.z);const h=90+rnd()*140;w.box(0,h/2,0,65,h,60,['#d7a770','#8fb1c7','#c9a0aa','#a7b68c'][i%4],g);for(let j=0;j<5;j++)w.box(0,20+j*30,32,45,12,2,'#f5dfaa',g);for(const x of [-15,15])w.cylinder(x,h+5,0,10,10,10,'#efd08b',g);}
  const a=position(l,.65,240);balloon(w,a.x,180,a.z,'#efbe6e',1.7);
 }
 if([2,11].includes(id)){
  for(let i=0;i<7;i++){const p=position(l,.12+i*.12,i%2?165:-165);w.ghost(p.x,45+i%3*15,p.z,.7+i%2*.3);w.pumpkin(p.x+30,p.z+30,20)}for(let i=0;i<5;i++){const p=position(l,.15+i*.16,-260),lantern=w.group(p.x,120+i%3*40,p.z);w.box(0,0,0,18,25,18,'#e7b56a',lantern);w.cone(0,19,0,17,13,'#a597ad',lantern);w.animations.push(t=>{lantern.position.y=120+i%3*40+Math.sin(t+i)*12;lantern.rotation.y=t*.2})}
 }
 if([3,16,17].includes(id)){
  for(let i=0;i<7;i++){const p=position(l,.12+i*.12,(i%2?1:-1)*230);balloon(w,p.x,130+i%3*45,p.z,['#e0a0ba','#eec873','#9fcbd8'][i%3],1+i%2*.35)}
  const p=position(l,.5,240);ferris(w,p.x,p.z);if(id===3){const a=position(l,.3,-200),b=position(l,.7,200);w.number(6,a.x,a.z,'#a691d5');w.number(7,b.x,b.z,'#eeaa69')}
 }
 if(id===4){for(let i=0;i<7;i++)w.wildlife.push(flyer(w,cx,cz,{phase:i*.9,color:'#fff0cc'}));const p=position(l,.5,260),ship=w.group(p.x,0,p.z);w.sphere(0,20,0,75,'#a17d58',ship,[.8,.45,1.8]);w.box(0,35,0,95,12,170,'#d1b17b',ship);w.cylinder(0,135,0,5,6,210,'#b09265',ship);w.box(-40,155,0,75,90,3,'#f4e6c3',ship);w.box(30,105,0,55,65,3,'#b7d4d0',ship);w.animations.push(t=>{ship.rotation.z=Math.sin(t*.7)*.055;ship.position.y=Math.sin(t)*4})}
 if(id===5){for(let i=0;i<10;i++){const p=position(l,.1+i*.08,(i%2?1:-1)*170),g=w.group(p.x,0,p.z);w.cylinder(0,65,0,4,4,130,'#f6e8cd',g);const candy=w.torus(0,145,0,32,12,['#e8a8bc','#a5d1bf','#efd080'][i%3],g);w.sphere(0,145,0,25,'#f7e1b9',g);w.animations.push(t=>candy.rotation.y=t*.5+i)}const p=position(l,.5,260);ferris(w,p.x,p.z)}
 if(id===6){const p=position(l,.55,330),volcano=w.group(p.x,0,p.z);w.cone(0,140,0,190,320,'#9d7464',volcano);w.cylinder(0,294,0,48,64,24,'#d78152',volcano);w.cylinder(0,307,0,44,44,2,'#ffd07c',volcano);for(let i=0;i<14;i++){const lava=w.sphere(0,310,0,6,'#ffc57a',volcano);w.animations.push(t=>{const f=(t*.35+i/14)%1;lava.position.set(Math.sin(i*2.4)*f*160,310+Math.sin(f*Math.PI)*160,Math.cos(i*2.4)*f*160);lava.scale.setScalar(1-f*.6)})}for(let i=0;i<5;i++)w.cloud(p.x,370+i*30,p.z,1+i*.25,'#c8aaa0')}
 if(id===7){for(let i=0;i<5;i++){const p=position(l,.15+i*.16,i%2?330:-330),planet=w.group(p.x,150+i*25,p.z);w.sphere(0,0,0,60+i*9,['#beabc9','#cbb789','#91b6c4'][i%3],planet);const ring=w.torus(0,0,0,90+i*9,5,'#d5bfd0',planet);ring.rotation.x=1.2;w.animations.push(t=>{planet.rotation.y=t*.05;planet.position.y=150+i*25+Math.sin(t*.4+i)*12})}}
 if(id===9){fishSchool(w,l);for(let i=0;i<7;i++){const p=position(l,.1+i*.12,i%2?180:-180),g=w.group(p.x,70,p.z);w.sphere(0,20,0,25,'#b5c6d5',g,[1,.6,1]);for(let j=0;j<5;j++){const arm=w.link([(j-2)*8,14,0],[(j-2)*9,-45,0],1.5,'#d6dfe9',g);w.animations.push(t=>arm.rotation.z=Math.sin(t*2+j+i)*.07)}w.animations.push(t=>g.position.y=70+Math.sin(t*.7+i)*25)}}
 if(id===12){for(let i=0;i<4;i++){const p=position(l,.15+i*.2,-160),g=w.group(p.x,80,p.z);for(let j=0;j<5;j++){const a=w.mesh(new THREE.TorusGeometry(110-j*11,6,8,40,Math.PI),['#eb9f9a','#efc374','#e7df9b','#9ecab5','#a6b9da'][j],g);a.rotation.y=Math.PI/2}w.cloud(p.x,60,p.z-110,.8);w.cloud(p.x,60,p.z+110,.8)}}
 if(id===13){for(let i=0;i<8;i++){const p=position(l,.1+i*.11,i%2?150:-150),g=w.group(p.x,0,p.z);w.sphere(0,27,0,22,'#678391',g,[.8,1.3,.8]);w.sphere(0,25,15,15,'#f8f4df',g,[.7,1,.3]);w.eyes(g,0,41,13,3);w.cone(0,34,23,5,12,'#efbb73',g).rotation.x=Math.PI/2;w.animations.push(t=>{g.position.z=p.z+Math.sin(t*.7+i)*50;g.rotation.z=Math.sin(t*2+i)*.13})}}
 if(id===14)dragon(w,l);
 if(id===17){const p=position(l,.8,-200),trophy=w.group(p.x,0,p.z);w.cylinder(0,25,0,32,45,50,'#bb9a60',trophy);w.cylinder(0,100,0,65,25,100,'#e8bf65',trophy);for(const side of [-1,1])w.torus(side*65,110,0,35,7,'#eac36d',trophy);w.sphere(0,175,0,22,'#ffe7a2',trophy);w.animations.push(t=>trophy.rotation.y=Math.sin(t*.4)*.15)}
 w.canvas.dataset.wildlife=String(w.wildlife.length);w.canvas.dataset.environment=courses[id].name;
}

import * as THREE from './vendor/three.js';
import {nearestFairway} from './physics.js';

// All art is generated locally: the download and offline app use the same assets.
export function seeded(seed=1){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function texture(kind){
 const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d'),random=seeded(471+kind.length),image=ctx.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const n=random(),grain=Math.sin(x*.22+Math.sin(y*.036)*3),coarse=Math.sin(x*.065)*Math.cos(y*.043);
  let v=kind==='wood'?148+grain*22+Math.sin(x*.9+Math.sin(y*.07))*9+n*20:kind==='bark'?100+grain*28+n*32:kind==='turf'?155+n*54+Math.sin(y*Math.PI/64)*7:kind==='scales'?164+Math.sin(x*.4)*Math.sin(y*.4)*25+n*15:158+coarse*14+n*28;
  if(kind==='scales'){const row=Math.floor(y/12),xx=(x+(row%2)*6)%12,yy=y%12;v=195+Math.sin(xx*Math.PI/12)*Math.sin(yy*Math.PI/12)*13+n*6;}
  if(kind==='stone'&&((y%64<3)||(x+(Math.floor(y/64)%2)*32)%96<2))v-=28;
  const i=(y*size+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=v;image.data[i+3]=255;
 }
 ctx.putImageData(image,0,0);
 const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 const normalCanvas=document.createElement('canvas');normalCanvas.width=normalCanvas.height=size;const nc=normalCanvas.getContext('2d'),normal=nc.createImageData(size,size);
 const value=(x,y)=>image.data[(((y+size)%size)*size+(x+size)%size)*4];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4;normal.data[i]=128+(value(x-1,y)-value(x+1,y))*.7;normal.data[i+1]=128+(value(x,y-1)-value(x,y+1))*.7;normal.data[i+2]=250;normal.data[i+3]=255}
 nc.putImageData(normal,0,0);const normalMap=new THREE.CanvasTexture(normalCanvas);normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;
 return{map,normalMap};
}
export function prepareMaterials(w){
 w.surfaceTextures=Object.fromEntries(['wood','stone','turf','bark','scales'].map(k=>[k,texture(k)]));if(w.software)Object.values(w.surfaceTextures).forEach(t=>t.map.anisotropy=1);
 w.surfaceMaterial=(kind,color,options={})=>w.material(color,{...w.surfaceTextures[kind],normalScale:new THREE.Vector2(kind==='turf'?.25:.5,kind==='turf'?.25:.5),roughness:kind==='scales'?.66:.92,...options});
}
export function configureLighting(w){
 const night=[2,7,11].includes(w.id),warm=[3,5,6,16,17].includes(w.id);
 w.renderer.toneMappingExposure=night?.95:1.05;
 w.scene.add(new THREE.HemisphereLight(night?'#869bc9':'#b5d5ed',night?'#252438':'#5e6548',night?.85:1.1));
 const sun=new THREE.DirectionalLight(night?'#bed4ff':warm?'#ffe1b0':'#fff0d2',night?1.8:3.4);
 const middle=w.level.path[Math.floor(w.level.path.length/2)];sun.position.set(middle.x-650,700,middle.y+160);sun.target.position.set(middle.x-250,0,middle.y-290);w.scene.add(sun.target);
 sun.castShadow=true;sun.shadow.mapSize.set(w.software?1024:2048,w.software?1024:2048);Object.assign(sun.shadow.camera,{left:-700,right:700,top:750,bottom:-750,near:1,far:2200});sun.shadow.normalBias=.35;sun.shadow.bias=-.00015;sun.shadow.radius=3;w.scene.add(sun);w.sun=sun;
 // A small procedural environment gives the ball, water and metal real sky reflections.
 const faces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,64);g.addColorStop(0,night?'#35496e':'#8cb6d2');g.addColorStop(.55,night?'#5d6683':'#d8e5e8');g.addColorStop(1,night?'#242735':'#797665');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);if(i===0&&!night){ctx.fillStyle='#fff3d4';ctx.fillRect(22,6,12,12)}return c});
 const env=new THREE.CubeTexture(faces);env.colorSpace=THREE.SRGBColorSpace;env.needsUpdate=true;w.scene.environment=env;w.scene.environmentIntensity=night?.32:.5;w.environmentTexture=env;
}
export function makeRock(w,x,z,s=1,color='#7f8174',parent=w.root){
 const g=new THREE.SphereGeometry(14,20,16),p=g.attributes.position,r=seeded(Math.abs(Math.round(x*31+z*17))+15);
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),factor=.85+.18*Math.sin(v.x*.17+v.y*.08+v.z*.12);v.multiplyScalar(factor);p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();
 const m=w.mesh(g,color,parent);m.material=w.surfaceMaterial('stone',color);m.position.set(x,-2,z);m.rotation.set(r()*.3,r()*6,r()*.2);m.scale.set(s,s*(.55+r()*.4),s);return m;
}
function leafGeometry(){
 const g=new THREE.BufferGeometry(),p=[],uv=[],idx=[];for(let i=0;i<=6;i++){const t=i/6,width=Math.sin(t*Math.PI)*.42;for(const side of [-1,1]){p.push(side*width,Math.sin(t*Math.PI)*.16,t);uv.push(side<0?0:1,t)}if(i<6){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
export function detailedTree(w,x,z,scale=1,palm=false){
 const g=w.group(x,-10,z),random=seeded(Math.abs(Math.round(x*67+z*13))+11);g.scale.setScalar(scale);
 const trunk=w.cylinder(0,51,0,palm?4:7,palm?9:13,110,'#736047',g,12);trunk.material=w.surfaceMaterial('bark','#897451');trunk.rotation.z=.06;
 for(let i=0;i<5;i++){const a=i*1.256;const root=w.link([Math.sin(a)*21,1,Math.cos(a)*21],[0,21,0],3,'#796249',g);root.material=trunk.material}
 const leaves=[],q=new THREE.Quaternion(),matrix=new THREE.Matrix4(),ge=leafGeometry();
 if(palm){
  const transforms=[];
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9,frond=w.group(0,105,0,g);frond.rotation.y=a;
   const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(),new THREE.Vector3(0,28,30),new THREE.Vector3(0,-15,80));w.mesh(new THREE.TubeGeometry(curve,10,1,4,false),'#5a6c34',frond);
   frond.updateMatrix();
   for(let j=1;j<10;j++)for(const side of [-1,1]){const t=j/10,p=curve.getPoint(t);q.setFromEuler(new THREE.Euler(.1+t*.3,side*(1.15-t*.25),0));matrix.compose(p,q,new THREE.Vector3(17*(1-t*.65),13,27*(1-t*.6)));transforms.push(frond.matrix.clone().multiply(matrix))}
  }
  const canopy=new THREE.InstancedMesh(ge,w.material('#567b37',{side:THREE.DoubleSide,roughness:.92}),transforms.length);transforms.forEach((m,i)=>canopy.setMatrixAt(i,m));canopy.castShadow=true;canopy.receiveShadow=true;g.add(canopy);leaves.push(canopy);
 }else{
  const transforms=[];
  for(let branch=0;branch<8;branch++){const a=branch*2.4,y=65+branch*6,end=new THREE.Vector3(Math.sin(a)*(35+random()*12),y+20,Math.cos(a)*38);const b=w.link([0,y-15,0],end.toArray(),3,'#796247',g);b.material=trunk.material;
   for(let j=0;j<28;j++){const p=end.clone().add(new THREE.Vector3((random()-.5)*42,(random()-.5)*30,(random()-.5)*42));q.setFromEuler(new THREE.Euler(random()*1.7,random()*6,.3));matrix.compose(p,q,new THREE.Vector3(14+random()*9,12,22+random()*13));transforms.push(matrix.clone())}}
  const canopy=new THREE.InstancedMesh(ge,w.material('#668743',{side:THREE.DoubleSide,roughness:.96}),transforms.length);transforms.forEach((m,i)=>{canopy.setMatrixAt(i,m);canopy.setColorAt(i,new THREE.Color().setHSL(.23+random()*.05,.34,.22+random()*.13))});canopy.castShadow=true;canopy.receiveShadow=true;g.add(canopy);leaves.push(canopy);
 }
 batchModel(w,g);
 w.animations.push(t=>{leaves.forEach((leaf,i)=>leaf.rotation.z=Math.sin(t*.8+x*.03+i*.6)*.025+Math.sin(t*1.7+i)*.008)});return g;
}
export function detailedDino(w,x,z,{color='#7c9563',rex=false,scale=1}={}){
 const g=w.group(x,-18*scale,z);g.scale.setScalar(scale);const body=w.group(0,0,0,g),skin=w.surfaceMaterial('scales',color),belly=w.surfaceMaterial('scales','#b7b289');
 const ellipsoid=(x,y,z,r,stretch,material=skin,parent=body)=>{const m=w.sphere(x,y,z,r,color,parent,stretch);m.material=material;return m};
 ellipsoid(0,45,0,31,[.88,.9,1.5]);ellipsoid(0,36,6,26,[.72,.65,1.4],belly);
 const tail=w.group(0,47,-34,body),tailJoints=[];let joint=tail;
 for(let i=0;i<6;i++){const next=w.group(0,0,i?-15:0,joint);const segment=w.cylinder(0,0,-8,Math.max(1,11-i*1.7),Math.max(.6,9-i*1.6),19,color,next,12);segment.rotation.x=Math.PI/2;segment.material=skin;tailJoints.push(next);joint=next}
 const neck=w.group(0,55,27,body);if(!rex){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(),new THREE.Vector3(0,26,3),new THREE.Vector3(0,64,9),new THREE.Vector3(0,87,18)]);const n=w.mesh(new THREE.TubeGeometry(curve,20,11,12,false),color,neck);n.material=skin}
 const head=w.group(0,rex?23:89,rex?17:19,neck);ellipsoid(0,0,0,rex?22:14,rex?[.78,1,1.4]:[.85,.65,1.5],skin,head);ellipsoid(0,-7,12,rex?18:11,[.85,.25,1.1],belly,head);
 const jaw=w.group(0,-7,-2,head);ellipsoid(0,0,13,rex?16:10,[.85,.22,1.1],skin,jaw);
 for(const side of [-1,1]){ellipsoid(side*(rex?16:10),5,9,4,[.4,.75,1],w.material('#d1ad53',{roughness:.38}),head);ellipsoid(side*(rex?17.5:11.5),5,10,2,[.3,1,1],w.material('#152021',{roughness:.2}),head);ellipsoid(side*6,-1,rex?27:20,1.6,[1,.5,.7],w.material('#384433'),head);
  if(rex){for(let i=0;i<5;i++){const tooth=w.cone(side*10,-7,6+i*4,1.5,4,'#e4dcc1',head);tooth.rotation.x=Math.PI}w.link([side*20,55,24],[side*22,45,39],3,color,body)}
 }
 const legs=[];for(const side of [-1,1])for(const front of [false,true]){
  if(rex&&front)continue;
  const hip=w.group(side*20,47,front?22:-22,body),upper=ellipsoid(0,-10,0,12,[.8,1.45,.9],skin,hip),knee=w.group(0,-20,0,hip);
  const shin=w.cylinder(0,-10,2,6,8,22,color,knee,12);shin.material=skin;ellipsoid(0,-20,8,8,[1.15,.45,1.6],skin,knee);
  for(let toe=0;toe<3;toe++)ellipsoid((toe-1)*5,-21,17,2.5,[.7,.6,1.7],w.material('#bdb48e'),knee);
  legs.push({hip,knee,phase:(side>0?0:Math.PI)+(front?Math.PI:0)});
 }
 if(rex){body.position.y=-5;body.rotation.x=-.1}
 for(let i=0;i<10;i++)ellipsoid(0,71-i*.7,22-i*7,3,[.7,.9,1.5],w.material('#626f43'));
 const phase=Math.abs(x+z)*.01,previous=g.position.clone();let distance=0,lastTime=0,gait=0;
 w.animations.push(t=>{const dt=Math.max(.001,t-lastTime),travel=Math.hypot(g.position.x-previous.x,g.position.z-previous.z);distance+=Math.min(travel,10);gait+=(Math.min(1,travel/dt/9)-gait)*Math.min(1,dt*5);previous.copy(g.position);lastTime=t;const cycle=distance/9+phase;body.position.y=(rex?-5:0)+Math.sin(t*1.2+phase)*.4+Math.sin(cycle*2)*.5*gait;body.scale.x=1+Math.sin(t*1.25+phase)*.008;legs.forEach(({hip,knee,phase:p})=>{hip.rotation.x=Math.sin(cycle+p)*.24*gait;knee.rotation.x=Math.max(0,Math.sin(cycle+p))*.38*gait});neck.rotation.y=Math.sin(t*.27+phase)*.13;neck.rotation.x=Math.sin(t*.6+phase)*.025;head.rotation.z=Math.sin(t*.37+phase)*.025;jaw.rotation.x=.015+Math.max(0,Math.sin(t*.43+phase))*.05;tailJoints.forEach((j,i)=>j.rotation.y=Math.sin(t*1.15+phase-i*.48)*(.05+i*.008))});
 batchModel(w,g);
 w.friendly(g,rex?'A VERY FRIENDLY T. REX!':'HELLO, LITTLE GOLFER!');return g;
}
export function detailedFlyer(w,x,z,{pterosaur=false,color='#bcad8c',scale=1,phase=0}={}){
 const bird=w.group();bird.userData.creature=pterosaur?'pterosaur':'bird';bird.scale.setScalar(scale);w.sphere(0,0,0,pterosaur?8:4.5,color,bird,[.7,.75,1.9]);w.sphere(0,4,-(pterosaur?15:8),pterosaur?5:3,color,bird,[.7,1,1.2]);const beak=w.cone(0,3,pterosaur?-27:-15,pterosaur?3:1.6,pterosaur?19:9,'#a99567',bird);beak.rotation.x=-Math.PI/2;
 const wingJoints=[];
 for(const side of [-1,1]){const shoulder=w.group(side*3,2,-1,bird),elbow=w.group(side*(pterosaur?27:13),0,1,shoulder);wingJoints.push({shoulder,elbow,side});
  const shape=(points,parent,col)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();return w.mesh(geo,col,parent,{side:THREE.DoubleSide,roughness:.8})};
  const span=pterosaur?28:14;shape([[0,0,-5],[side*span,0,-4],[side*span,0,15],[0,0,9]],shoulder,color);
  shape([[0,0,-4],[side*span*1.3,1,-8],[side*span*.72,0,12],[0,0,15]],elbow,pterosaur?'#98896f':color);
  if(pterosaur){for(const fraction of [.3,.65,1])w.link([0,.2,-4],[side*span*fraction,0,14-fraction*10],.45,'#746c57',elbow)}else for(let j=0;j<6;j++){const feather=w.sphere(side*(5+j*2.3),0,8,3,color,elbow,[.48,.15,2.5-j*.18]);feather.rotation.y=-side*.2}
 }
 batchModel(w,bird);
 w.animations.push(t=>{const a=t*(pterosaur?.1:.18)+phase,radius=pterosaur?440:300;bird.position.set(x+Math.cos(a)*radius,(pterosaur?210:135)+Math.sin(a*2+phase)*25,z+Math.sin(a)*radius*.7);bird.rotation.y=Math.atan2(Math.sin(a),-Math.cos(a)*.7);bird.rotation.z=Math.sin(a)*.14;
  const cycle=t*(pterosaur?2.5:5.8)+phase,glide=pterosaur?(.45+.55*Math.sin(t*.35+phase)**4):1;
  wingJoints.forEach(({shoulder,elbow,side})=>{shoulder.rotation.z=side*(.1+Math.sin(cycle)*.42*glide);elbow.rotation.z=side*(.08+Math.sin(cycle-.65)*.28*glide);elbow.rotation.y=side*Math.sin(cycle-.35)*.08})});return bird;
}
export function addGroundCover(w){
 if([7,9,13].includes(w.id))return;
 const random=seeded(629+w.id),blades=[],center=w.level.path[2],matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),leaf=leafGeometry();
 for(let i=0;i<1700;i++){const x=center.x+(random()-.5)*1700,y=center.y+(random()-.5)*1800,near=nearestFairway(w.level,x,y);if(near.distance<w.level.width/2+12||near.distance>270)continue;
  const height=7+random()*13;q.setFromEuler(new THREE.Euler(-Math.PI/2+random()*.25,random()*6,random()*.3));matrix.compose(new THREE.Vector3(x-250,-11,y-290),q,new THREE.Vector3(2+random()*4,height,height));blades.push(matrix.clone());
 }
 const grass=new THREE.InstancedMesh(leaf,w.material('#596f36',{side:THREE.DoubleSide,roughness:1}),blades.length);blades.forEach((m,i)=>{grass.setMatrixAt(i,m);grass.setColorAt(i,new THREE.Color().setHSL(.22+random()*.07,.36,.25+random()*.15))});grass.receiveShadow=true;w.root.add(grass);
 // Vertex wind keeps hundreds of plants in one draw call.
 const wind={value:0};grass.material.onBeforeCompile=shader=>{shader.uniforms.windTime=wind;shader.vertexShader='uniform float windTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(windTime*1.8 + instanceMatrix[3].x*.04 + instanceMatrix[3].z*.03)*position.z*position.z*.12;')};grass.material.customProgramCacheKey=()=> 'ground-wind-v1';w.animations.push(t=>wind.value=t);
 for(let i=0;i<24;i++){const p=w.level.path[i%w.level.path.length],a=random()*Math.PI*2,x=p.x+Math.sin(a)*(110+random()*110),z=p.y+Math.cos(a)*(110+random()*110);if(nearestFairway(w.level,x,z).distance<w.level.width/2+14)continue;makeRock(w,x-250,z-290,.45+random()*.7,'#777b68');}
}
export function upgradeMaterials(w){
 const timber=['#9a744b','#aa8456','#967147','#62533f','#bb9b6c','#796044','#66523c','#b17c45','#a9814b','#b09265'];
 w.root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.material?.color)return;const color='#'+o.material.color.getHexString();if(timber.includes(color))o.material=w.surfaceMaterial('wood',color);else if(color===w.palette[3]||color==='#d4c394'||color==='#716b5d')o.material=w.surfaceMaterial('stone',color);if([1,8].includes(w.id)&&o.geometry.type==='BoxGeometry'){o.material.roughness=.34;o.material.envMapIntensity=.7}});
}

export function buildSky(w){
 if(w.software){
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d'),night=[2,7,11].includes(w.id),gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,night?'#182942':'#6293b6');gradient.addColorStop(.55,night?'#6c7082':'#d9ded8');gradient.addColorStop(1,night?'#484659':'#b8bdad');ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
  const random=seeded(82);for(let i=0;i<32;i++){const x=random()*512,y=55+random()*65,r=16+random()*38,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,night?'#c5ccd026':'#fff8df77');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const dome=new THREE.Mesh(new THREE.SphereGeometry(2800,24,16),new THREE.MeshBasicMaterial({map,side:THREE.BackSide,depthWrite:false}));const p=w.level.path[2];dome.position.set(p.x-250,0,p.y-290);w.root.add(dome);return;
 }
 const night=[2,7,11].includes(w.id),sky=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{time:{value:0},zenith:{value:new THREE.Color(night?'#101e38':'#528eb9')},horizon:{value:new THREE.Color(night?'#77738b':'#e2e1d0')},sunDirection:{value:new THREE.Vector3(-.5,.65,.4).normalize()},night:{value:night?1:0}},vertexShader:`varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
 varying vec3 direction;uniform float time;uniform float night;uniform vec3 zenith;uniform vec3 horizon;uniform vec3 sunDirection;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){return noise(p)*.55+noise(p*2.03)*.27+noise(p*4.1)*.12+noise(p*8.2)*.06;}
 void main(){vec3 d=normalize(direction);float altitude=max(0.,d.y);vec3 col=mix(horizon,zenith,pow(altitude,.45));float sun=max(0.,dot(d,sunDirection));col+=vec3(1.,.77,.43)*(pow(sun,32.)*.13+pow(sun,900.)*.9)*(1.-night);
 vec2 uv=d.xz/(max(.15,d.y)+.2)*2.4+vec2(time*.008,0.);float field=fbm(uv);float cloud=smoothstep(.51,.72,field)*smoothstep(.04,.2,d.y);vec3 cloudColor=mix(vec3(.7,.76,.79),vec3(1.,.96,.86),smoothstep(.48,.7,field));col=mix(col,cloudColor,cloud*(1.-night*.65)*.85);gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(2800,32,20),sky);const p=w.level.path[2];dome.position.set(p.x-250,0,p.y-290);w.root.add(dome);w.animations.push(t=>sky.uniforms.time.value=t);
}
export function stoneTunnel(w,tunnel,id){
 const g=w.group(tunnel.x+tunnel.w/2-250,0,tunnel.y+tunnel.h/2-290),radius=tunnel.w/2-5,stone=w.surfaceMaterial('stone',id===2?'#888297':id===13?'#c4d4d6':'#a89f86');
 for(const side of [-1,1])for(let layer=0;layer<4;layer++){const block=w.box(side*radius,12+layer*13,0,10,12,tunnel.h,'#a89f86',g);block.material=stone;}
 // Individual voussoirs form the vault; the opening stays genuinely open.
 for(let i=0;i<15;i++){const a=(i+.5)*Math.PI/15;const block=w.box(Math.cos(a)*radius,50+Math.sin(a)*radius,0,Math.PI*radius/15-.6,12,tunnel.h+4,'#a89f86',g);block.rotation.z=a-Math.PI/2;block.material=stone;}
 for(const face of [-1,1])for(let i=0;i<15;i++){const a=(i+.5)*Math.PI/15;const trim=w.box(Math.cos(a)*radius,50+Math.sin(a)*radius,face*(tunnel.h/2+4),Math.PI*radius/15-.5,17,7,'#c5bba3',g);trim.rotation.z=a-Math.PI/2;trim.material=w.surfaceMaterial('stone','#bcb29a');}
 batchModel(w,g);w.friendly(g,'THROUGH THE STONE ARCH!');return g;
}

// Merge static pieces inside articulated groups; joints and instanced leaves remain separate.
export function batchModel(w,group){
 for(const child of [...group.children])if(child.isGroup)batchModel(w,child);
 const batches=new Map();for(const mesh of group.children)if(mesh.isMesh&&!mesh.isInstancedMesh&&!mesh.userData.dynamic){const key=mesh.material.uuid;const list=batches.get(key)||[];list.push(mesh);batches.set(key,list)}
 for(const meshes of batches.values()){
  if(meshes.length<2)continue;
  const attributes={position:[],normal:[],uv:[]};
  for(const m of meshes){m.updateMatrix();const source=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();source.applyMatrix4(m.matrix);for(const name of Object.keys(attributes)){const a=source.attributes[name];if(a)attributes[name].push(...a.array);else if(name==='uv')attributes.uv.push(...new Float32Array(source.attributes.position.count*2))}source.dispose();}
  const geometry=new THREE.BufferGeometry();for(const [name,values]of Object.entries(attributes))geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,name==='uv'?2:3));
  const merged=new THREE.Mesh(geometry,meshes[0].material);merged.castShadow=true;merged.receiveShadow=true;group.add(merged);w.cameraBlockers.push(merged);
  const removed=new Set(meshes);w.cameraBlockers=w.cameraBlockers.filter(m=>!removed.has(m));for(const m of meshes){group.remove(m);m.geometry.dispose()}
 }
}
export function puff(w,x,y,z,size,color='#ffffff',parent=w.root){
 if(!w.puffTexture){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'#ffffffaa');g.addColorStop(.5,'#ffffff66');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);w.puffTexture=new THREE.CanvasTexture(c)}
 const material=new THREE.SpriteMaterial({map:w.puffTexture,color,transparent:true,opacity:.55,depthWrite:false});const sprite=new THREE.Sprite(material);sprite.position.set(x,y,z);sprite.scale.set(size,size*.7,1);parent.add(sprite);return sprite;
}

export function golfBallGeometry(){
 const geometry=new THREE.SphereGeometry(12,96,64),p=geometry.attributes.position;
 const centers=Array.from({length:250},(_,j)=>{const y=1-(j+.5)/125,r=Math.sqrt(1-y*y),a=j*2.399963;return new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r)});
 const v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();let proximity=-1;for(const c of centers)proximity=Math.max(proximity,v.dot(c));const dent=Math.max(0,1-(1-proximity)/.0024);v.multiplyScalar(12-.19*Math.sin(dent*Math.PI/2)**2);p.setXYZ(i,v.x,v.y,v.z)}geometry.computeVertexNormals();return geometry;
}

export function clothSail(w,x,y,z,width,height,color,parent){
 const geometry=new THREE.PlaneGeometry(width,height,12,10),base=geometry.attributes.position.array.slice(),mesh=w.mesh(geometry,color,parent,{side:THREE.DoubleSide,roughness:.96});mesh.position.set(x,y,z);
 w.animations.push(t=>{const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const xx=base[i*3],yy=base[i*3+1],edge=Math.sin((xx/width+.5)*Math.PI);p.setZ(i,edge*(width*.09+Math.sin(t*1.5+xx*.035+yy*.026)*width*.025))}p.needsUpdate=true;geometry.computeVertexNormals()});return mesh;
}
export function driftingGhost(w,x,y,z,scale=1){
 const g=w.group(x,y,z);g.scale.setScalar(scale);const points=[];for(let i=0;i<=20;i++){const t=i/20;points.push(new THREE.Vector2(t<.62?Math.sin(t/.62*Math.PI/2)*20:20+(t-.62)*10,42-t*64))}
 const geo=new THREE.LatheGeometry(points,24),base=geo.attributes.position.array.slice(),sheet=w.mesh(geo,'#d8dce6',g,{roughness:.8,transparent:true,opacity:.9,side:THREE.DoubleSide});w.eyes(g,0,24,17,3.2);
 w.animations.push(t=>{g.position.y=y+Math.sin(t*.65+x*.01)*9;g.position.x=x+Math.sin(t*.28+z*.01)*5;g.rotation.y=Math.sin(t*.24+x*.01)*.2;const p=geo.attributes.position;for(let i=0;i<p.count;i++){const xx=base[i*3],yy=base[i*3+1],zz=base[i*3+2],fall=Math.max(0,(15-yy)/38);p.setXYZ(i,xx+Math.sin(t*1.6+zz*.12)*fall*2,yy+Math.sin(Math.atan2(zz,xx)*6-t*1.8)*fall*3,zz)}p.needsUpdate=true;geo.computeVertexNormals()});w.friendly(g,'BOO! HELLO, FRIEND!');return g;
}

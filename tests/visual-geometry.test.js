import test from 'node:test';
import assert from 'node:assert/strict';
import {golfBallGeometry} from '../public/realism.js';

test('golf ball dimples are recessed into a centred, consistently sized sphere',()=>{
 const g=golfBallGeometry(),p=g.attributes.position;let min=Infinity,max=0;
 for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getY(i),p.getZ(i));min=Math.min(min,r);max=Math.max(max,r);assert.ok(Number.isFinite(g.attributes.normal.getX(i)));}
 assert.ok(min<11.9,'dimples have real depth');assert.ok(min>11.79,'dimples keep a round silhouette');assert.ok(max<=12.00001,'dimples never protrude beyond the collision radius');
 g.computeBoundingBox();assert.ok(Math.abs(g.boundingBox.min.x+g.boundingBox.max.x)<.03);g.dispose();
});

test('material caching reuses texture references without serializing image pixels',async()=>{
 const {World3D}=await import('../public/world3d.js');const THREE=await import('../public/vendor/three.js');
 const texture=new THREE.Texture();texture.toJSON=()=>{throw Error('Material lookup must not encode texture images')};
 const world={materials:new Map()},a=World3D.prototype.material.call(world,'#ffffff',{map:texture,normalScale:new THREE.Vector2(.5,.5)}),b=World3D.prototype.material.call(world,'#ffffff',{map:texture,normalScale:new THREE.Vector2(.5,.5)});
 assert.equal(a,b);assert.equal(world.materials.size,1);a.dispose();texture.dispose();
});

test('large themed scenery stays clear of every leg of all 18 winding fairways',async()=>{
 const {sceneryPosition}=await import('../public/world-environments.js'),{layout}=await import('../public/courses.js'),{nearestFairway}=await import('../public/physics.js');
 for(let id=0;id<18;id++)for(const f of [.1,.25,.44,.46,.67,.8])for(const side of [-330,-230,-190,-150,150,190,230,330]){
  const l=layout(id),p=sceneryPosition(l,f,side);assert.ok(nearestFairway(l,p.x+250,p.z+290).distance>=l.width/2+89,`hole ${id+1}: scenery intersects a fairway`);
 }
});

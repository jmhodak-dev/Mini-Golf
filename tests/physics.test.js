import test from 'node:test';import assert from 'node:assert/strict';
import {advanceBall,movingBumpers,groundHeight,nearestFairway} from '../public/physics.js';import {layout} from '../public/courses.js';
function run(ball,level,phase=0){for(let i=0;i<1500;i++){const result=advanceBall(ball,level,phase+i);assert.ok(Number.isFinite(ball.x)&&Number.isFinite(ball.y));if(result.stopped)return{ball,result}}throw Error('Shot never settled')}
test('two peers simulate moving obstacles identically without sharing a frame rate',()=>{const l=layout(3),a={x:l.path[2].x,y:l.path[2].y+45,vx:0,vy:-4},b={...a};assert.deepEqual(run(a,l,750),run(b,l,750))});
test('friendly rails bounce a strong shot back onto the winding fairway',()=>{const l=layout(0),b={...l.start,vx:-15,vy:0};run(b,l);assert.ok(nearestFairway(l,b.x,b.y).distance<l.width/2-9)});
test('a boost pad launches once per shot and cannot keep a ball rolling forever',()=>{const l=layout(5),p=l.pads[0],b={x:p.x,y:p.y,vx:.5,vy:0};const r=advanceBall(b,l,0);assert.ok(r.events.includes('boost'));b.x=p.x;b.y=p.y;b.boostCooldown=0;assert.ok(!advanceBall(b,l,1).events.includes('boost'))});
test('space portals transport the ball and have an anti-loop cooldown',()=>{const l=layout(7),p=l.portals[0],exit=l.portals[1],b={x:p.x,y:p.y,vx:1,vy:0};const r=advanceBall(b,l,0);assert.ok(r.events.includes('portal'));assert.ok(Math.hypot(b.x-exit.x-27,b.y-exit.y)<5);assert.equal(b.portalCooldown,100)});
test('Little Golfer helps a near miss while Classic leaves it alone',()=>{const l=layout(0),classic=layout(0);classic.easy=false;const b={x:l.hole.x+39,y:l.hole.y,vx:.2,vy:0};assert.equal(run({...b},l).result.done,true);assert.equal(run({...b},classic).result.done,false)});
test('raised bridge surfaces match the physical ramp height',()=>{const l=layout(0),r=l.ramps[0];assert.ok(r);assert.ok(groundHeight(l,r.x+r.w/2,r.y+r.h/2)>20);assert.equal(groundHeight(l,l.start.x,l.start.y),0)});
test('dynamic bumpers really move, and all holes keep optional star rewards',()=>{for(let id=0;id<18;id++){const l=layout(id);assert.equal(l.stars.length,3);if(l.movers.length)assert.notDeepEqual(movingBumpers(l,0),movingBumpers(l,100))}});
test('bridge side rails block lateral entry and exit at every raised deck',()=>{
 for(let id=0;id<18;id++)for(const r of layout(id).ramps){
  const l=layout(id);l.movers=[];l.spinners=[];l.portals=[];l.pads=[];
  for(const side of [-1,1])for(const speed of [2,16]){
   const edge=side<0?r.x:r.x+r.w;
   const inside={x:edge-side*18,y:r.y+r.h/2,vx:side*speed,vy:0};
   for(let t=0;t<12;t++)advanceBall(inside,l,t);
   assert.ok(side<0?inside.x>=r.x+12:inside.x<=r.x+r.w-12,`hole ${id}: ball escaped bridge`);
   // Isolate the bridge from the outer fairway so entry is tested from both sides.
   const isolated={...l,path:null,bounds:{minX:-1000,maxX:2000,minY:-1000,maxY:2000},walls:[]};
   const outside={x:edge+side*20,y:r.y+r.h/2,vx:-side*speed,vy:0};
   for(let t=0;t<12;t++)advanceBall(outside,isolated,t);
   assert.ok(side<0?outside.x<r.x:outside.x>r.x+r.w,`hole ${id}: entered through side`);
   assert.equal(groundHeight(isolated,outside.x,outside.y),0);
  }
  const center=r.x+r.w/2;
  assert.ok(groundHeight(l,center,r.y+.01)<.001,'approach has no sudden height step');
 }
});
test('bridges remain open end to end, with tunnels on separate straights',()=>{
 for(let id=0;id<18;id++){
  const l=layout(id);l.movers=[];l.spinners=[];l.portals=[];l.pads=[];
  l.hole={x:-900,y:-900};
  for(const r of l.ramps){const b={x:r.x+r.w/2,y:r.y-16,vx:0,vy:10};let crossed=false;
   for(let t=0;t<300;t++){advanceBall(b,l,t);if(b.y>r.y+r.h+12){crossed=true;break}}
   assert.ok(crossed,`hole ${id}: entrance or exit blocked`);
   for(const tunnel of l.tunnels)assert.ok(tunnel.x+tunnel.w<=r.x||tunnel.x>=r.x+r.w||tunnel.y+tunnel.h<=r.y||tunnel.y>=r.y+r.h);
  }
 }
});

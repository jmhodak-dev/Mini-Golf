// Fixed-step, frame-rate-independent physics shared by local and live-room play.
export function movingBumpers(level,tick=0){
 return [...level.bumpers,...level.movers.map((m,i)=>({...m,x:m.x+Math.sin(tick*.018+i)*m.travel,y:m.y+Math.sin(tick*.011+i)*12}))];
}
export function nearestFairway(level,x,y){let best={distance:Infinity};for(let i=0;i<(level.path?.length||0)-1;i++){const a=level.path[i],b=level.path[i+1],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));const px=a.x+t*dx,py=a.y+t*dy,distance=Math.hypot(x-px,y-py);if(distance<best.distance)best={x:px,y:py,distance,index:i,t,dx,dy}}return best}
export function groundHeight(level,x,y){let height=0;for(const ramp of level.ramps||[]){if(x>=ramp.x&&x<=ramp.x+ramp.w&&y>=ramp.y&&y<=ramp.y+ramp.h)height=Math.max(height,Math.sin((y-ramp.y)/ramp.h*Math.PI)**2*ramp.height)}return height}
function clearToCup(ball,level){for(let i=1;i<=12;i++){const f=i/12,x=ball.x+(level.hole.x-ball.x)*f,y=ball.y+(level.hole.y-ball.y)*f;if(level.path&&nearestFairway(level,x,y).distance>level.width/2-12)return false;for(const w of level.walls)if(x>w.x-11&&x<w.x+w.w+11&&y>w.y-11&&y<w.y+w.h+11&&groundHeight(level,x,y)<30)return false}return true}
export function advanceBall(ball,level,tick){
 const events=[];ball.portalCooldown=Math.max(0,(ball.portalCooldown||0)-1);ball.boostCooldown=Math.max(0,(ball.boostCooldown||0)-1);
 const speed=Math.hypot(ball.vx,ball.vy),steps=Math.max(1,Math.ceil(speed/4));
 for(let i=0;i<steps;i++){
  ball.x+=ball.vx/steps;ball.y+=ball.vy/steps;
  if(level.path){const nearest=nearestFairway(level,ball.x,ball.y),limit=level.width/2-12;if(nearest.distance>limit){const nx=(ball.x-nearest.x)/nearest.distance,ny=(ball.y-nearest.y)/nearest.distance;ball.x=nearest.x+nx*limit;ball.y=nearest.y+ny*limit;const dot=ball.vx*nx+ball.vy*ny;if(dot>0){ball.vx-=1.65*dot*nx;ball.vy-=1.65*dot*ny;events.push('bounce')}}}
  else{const bounds=level.bounds||{minX:49,maxX:451,minY:49,maxY:531};if(ball.x<bounds.minX){ball.x=bounds.minX;ball.vx=Math.abs(ball.vx)*.8}if(ball.x>bounds.maxX){ball.x=bounds.maxX;ball.vx=-Math.abs(ball.vx)*.8}if(ball.y<bounds.minY){ball.y=bounds.minY;ball.vy=Math.abs(ball.vy)*.8}if(ball.y>bounds.maxY){ball.y=bounds.maxY;ball.vy=-Math.abs(ball.vy)*.8}}
  for(const w of [...level.walls,...(level.ramps||[]).flatMap(r=>[{x:r.x-6,y:r.y,w:6,h:r.h,height:Infinity},{x:r.x+r.w,y:r.y,w:6,h:r.h,height:Infinity}])]){
   let nx=Math.max(w.x,Math.min(ball.x,w.x+w.w)),ny=Math.max(w.y,Math.min(ball.y,w.y+w.h));let dx=ball.x-nx,dy=ball.y-ny,d=Math.hypot(dx,dy);
   if(d<12&&groundHeight(level,ball.x,ball.y)<(w.height||25)+8){if(d===0){const side=[{d:Math.abs(ball.x-w.x),x:-1,y:0},{d:Math.abs(ball.x-w.x-w.w),x:1,y:0},{d:Math.abs(ball.y-w.y),x:0,y:-1},{d:Math.abs(ball.y-w.y-w.h),x:0,y:1}].sort((a,b)=>a.d-b.d)[0];dx=side.x;dy=side.y;d=1;nx=side.x<0?w.x:side.x>0?w.x+w.w:ball.x;ny=side.y<0?w.y:side.y>0?w.y+w.h:ball.y}
    const ux=dx/d,uy=dy/d,dot=ball.vx*ux+ball.vy*uy;ball.x=nx+ux*12.1;ball.y=ny+uy*12.1;
    if(dot<0){ball.vx-=1.8*dot*ux;ball.vy-=1.8*dot*uy;events.push('bounce')}
   }
  }
  for(const o of movingBumpers(level,tick)){
   const dx=ball.x-o.x,dy=ball.y-o.y,d=Math.hypot(dx,dy);
   if(d<o.r+12){const ux=d?dx/d:1,uy=d?dy/d:0,dot=ball.vx*ux+ball.vy*uy;ball.x=o.x+ux*(o.r+12.1);ball.y=o.y+uy*(o.r+12.1);if(dot<0){ball.vx-=1.95*dot*ux;ball.vy-=1.95*dot*uy;events.push('boing')}}
  }
  for(const spinner of level.spinners||[]){const a=tick*spinner.speed,ux=Math.cos(a),uy=Math.sin(a),dx=ball.x-spinner.x,dy=ball.y-spinner.y,along=Math.max(-spinner.length,Math.min(spinner.length,dx*ux+dy*uy));const nx=spinner.x+along*ux,ny=spinner.y+along*uy,ex=ball.x-nx,ey=ball.y-ny,d=Math.hypot(ex,ey);if(d<12+spinner.r){const normalX=d?ex/d:-uy,normalY=d?ey/d:ux,dot=ball.vx*normalX+ball.vy*normalY;ball.x=nx+normalX*(12.1+spinner.r);ball.y=ny+normalY*(12.1+spinner.r);if(dot<0){ball.vx-=1.5*dot*normalX;ball.vy-=1.5*dot*normalY;events.push('boing')}}}
  for(const [index,pad] of level.pads.entries()){ball.hitPads??=[];if(!ball.hitPads.includes(index)&&!ball.boostCooldown&&Math.hypot(ball.x-pad.x,ball.y-pad.y)<pad.r){ball.vx=pad.vx;ball.vy=pad.vy;ball.boostCooldown=90;ball.hitPads.push(index);events.push('boost')}}
  if(!ball.portalCooldown&&level.portals.length){for(let n=0;n<level.portals.length;n++){const p=level.portals[n];if(Math.hypot(ball.x-p.x,ball.y-p.y)<19){const exit=level.portals[(n+1)%level.portals.length];ball.x=exit.x+27;ball.y=exit.y;ball.portalCooldown=100;events.push('portal');break}}}
  if(Math.hypot(ball.x-level.hole.x,ball.y-level.hole.y)<(level.easy?24:18)&&Math.hypot(ball.vx,ball.vy)<(level.easy?12:9)){ball.x=level.hole.x;ball.y=level.hole.y;ball.vx=ball.vy=0;return{done:true,stopped:true,events}}
 }
 if(level.easy&&Math.hypot(ball.x-level.hole.x,ball.y-level.hole.y)<65&&Math.hypot(ball.vx,ball.vy)<2.8&&clearToCup(ball,level)){const dx=level.hole.x-ball.x,dy=level.hole.y-ball.y,d=Math.hypot(dx,dy);if(d>1){ball.vx=ball.vx*.88+dx/d*.28;ball.vy=ball.vy*.88+dy/d*.28;if(Math.hypot(ball.vx,ball.vy)<.35){ball.vx=dx/d*.4;ball.vy=dy/d*.4}}}
 ball.vx*=.986;ball.vy*=.986;const stopped=Math.hypot(ball.vx,ball.vy)<.17;
 if(stopped)ball.vx=ball.vy=0;
 return{done:false,stopped,events};
}

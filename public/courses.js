export const courses = [
 ['Jurassic Putt','Dinosaur','🦕','#cce9b3','#447b4c','Easy','A little roar. A big adventure.',3],
 ['Brick by Brick','Brick world','🧱','#ffdf92','#e68c36','Easy','Build your way to a hole-in-one.',3],
 ['Spooky Hollow','Halloween','🎃','#e0d3f4','#8a69ad','Medium','All treats. A few tricky shots.',4],
 ['Six Seven!','Silly stuff','✌️','#f6d4e2','#c55d91','Medium','Is it a six? Is it a seven? Yes.',4],
 ['Pirate’s Paradise','Adventure','🏴‍☠️','#b9e5e7','#29888e','Medium','X marks the perfect putt.',4],
 ['Sweet Spot','Candy land','🍭','#f8d2b7','#df8075','Easy','Sugar, sprinkles, and sweet shots.',3],
 ['Lava Lanes','Dinosaur','🌋','#f5c5a2','#cc6450','Tricky','The floor is lava. Seriously.',5],
 ['Space Cadet','Space','🪐','#cbd0f5','#6865b0','Medium','One small putt for a golfer.',4],
 ['Block Party','Brick world','🏰','#b9deee','#4d8eac','Tricky','Big blocks. Bigger bounces.',5],
 ['Under the Sea','Adventure','🐙','#b3e4db','#419d90','Easy','Make a splash with every shot.',3],
 ['Dino-Mite Valley','Dinosaur','🦖','#dce9af','#809d4d','Medium','Watch out for tiny T. rex arms.',4],
 ['Ghost Town','Halloween','👻','#d6d5ec','#77759f','Tricky','Boo-tiful bounces ahead.',5],
 ['Rainbow Road','Silly stuff','🌈','#f5e2a8','#bfa057','Easy','Good vibes and colorful drives.',3],
 ['Frosty Fairway','Adventure','⛄','#cde7ef','#699aa9','Medium','Stay cool. Putt cooler.',4],
 ['Dragon’s Playground','Fantasy','🐉','#dcd5f2','#8b76aa','Easy','A friendly dragon guards the rainbow bridge.',4],
 ['Waterfall Wonder','Adventure','💦','#bbe5d8','#499b8e','Easy','Putt through a roaring jungle waterfall.',4],
 ['Carnival Chaos','Silly stuff','🎡','#f9d9bd','#c78584','Easy','Ferris wheels, balloons, and bumper fun.',4],
 ['The Grand Finale','Silly stuff','🏆','#e5dbac','#9e9253','Tricky','One last wildly good adventure.',5]
].map((c,id)=>({id,name:c[0],category:c[1],emoji:c[2],bg:c[3],accent:c[4],difficulty:c[5],description:c[6],par:c[7]}));
// Each fairway has its own route through a large surrounding world.
export const routes = [
 [[100,800],[100,600],[280,460],[405,300],[405,100]],
 [[100,800],[310,800],[420,610],[230,430],[230,150]],
 [[100,820],[100,600],[340,600],[440,370],[280,150]],
 [[140,820],[360,730],[160,520],[390,340],[390,110]],
 [[120,800],[120,560],[330,430],[500,430],[500,150]],
 [[120,810],[330,700],[330,490],[120,330],[310,130]],
 [[130,820],[350,680],[170,460],[400,280],[400,100]],
 [[110,800],[310,800],[440,580],[250,370],[440,140]],
 [[120,820],[350,820],[350,580],[130,390],[350,130]],
 [[120,810],[120,600],[380,510],[490,320],[320,120]],
 [[130,800],[340,650],[160,450],[400,330],[400,100]],
 [[100,820],[320,680],[320,440],[140,300],[340,110]],
 [[120,820],[340,700],[120,500],[340,300],[340,110]],
 [[120,820],[120,600],[360,600],[360,340],[180,130]],
 [[120,820],[350,720],[350,480],[130,330],[360,100]],
 [[120,820],[120,570],[350,570],[480,340],[350,110]],
 [[120,820],[340,820],[340,600],[140,400],[350,130]],
 [[120,820],[360,740],[160,530],[390,340],[390,100]]
];
export function layout(id){
 if(!Number.isInteger(id)||!courses[id])throw new RangeError('Unknown hole');
 const path=routes[id].map(([x,y])=>({x,y}));const start={...path[0]},hole={...path.at(-1)};
 const midpoint=path[2],next=path[3],dx=next.x-midpoint.x,dy=next.y-midpoint.y,d=Math.hypot(dx,dy);
 const level={id,path,width:158,start,hole,bounds:{minX:-150,maxX:750,minY:-130,maxY:1050},easy:true,
 walls:[],bumpers:[],movers:[],pads:[],portals:[],stars:[.22,.48,.73].map(f=>pointAlong(path,f)),ramps:[],tunnels:[],spinners:[]};
 // An optional moving toy sits off-center, always leaving a generous way around.
 if(![0,13,15].includes(id))level.movers=[{x:midpoint.x+38,y:midpoint.y+15,r:19,travel:22}];
 if([1,3,5,8,12,16,17].includes(id))level.spinners=[{x:midpoint.x,y:midpoint.y,length:35,r:6,speed:.006}];
 // Hills and bridges line up with vertical stretches of the actual fairway.
 for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1];if(Math.abs(a.x-b.x)<25&&Math.abs(a.y-b.y)>170){level.ramps=[{x:a.x-79,y:Math.min(a.y,b.y)+25,w:158,h:Math.abs(a.y-b.y)-50,height:26+id%3*8}];break}}
 // Tunnels occupy a separate straight, with entrances aligned to the shot.
 if([0,2,4,9,10,13,15].includes(id))for(let i=path.length-2;i>=0;i--){const a=path[i],b=path[i+1],y=(a.y+b.y)/2;
  if(a.x===b.x&&Math.abs(a.y-b.y)>170&&!level.ramps.some(r=>Math.abs(a.x-r.x-r.w/2)<80&&y>r.y-40&&y<r.y+r.h+40)){
   const t={x:a.x-79,y:y-35,w:158,h:70,height:76};level.tunnels.push(t);level.walls.push({x:t.x,y:t.y,w:10,h:t.h,height:90},{x:t.x+t.w-10,y:t.y,w:10,h:t.h,height:90});break;
  }
 }
 if([6,7,11,14,17].includes(id)){const a=pointAlong(path,.3),b=pointAlong(path,.67);level.portals=[{...a},{...b}]}
 if([1,5,7,12,16].includes(id))level.pads=[{x:midpoint.x,y:midpoint.y+30,r:18,vx:dx/d*5,vy:dy/d*5}];
 return level;
}
export function pointAlong(path,fraction){const lengths=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y));let distance=lengths.reduce((a,b)=>a+b,0)*fraction;for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){const t=distance/lengths[i];return{x:path[i].x+(path[i+1].x-path[i].x)*t,y:path[i].y+(path[i+1].y-path[i].y)*t}}distance-=lengths[i]}return{...path.at(-1)}}

export const worldHints = [
 'A baby dino is on patrol! Grab the stars and bounce past its egg.',
 'The brick robot is building! Time your shot past its rolling block.',
 'Friendly ghosts love to boing your ball. Watch the floating pumpkin!',
 'SIX! SEVEN! The numbers are dancing. Putt through their party!',
 'Sail past the shark and find the treasure. Arrr you ready?',
 'The candy wheel never stops! Bounce off a giant gumball.',
 'The volcano is erupting! Dodge its rolling lava rock.',
 'Blast off! Purple portals teleport your ball across space.',
 'The castle crane is spinning. Sneak past the moving brick!',
 'The octopus is waving hello! Look out for the bubble bumper.',
 'T. rex is stomping! Time your putt around the giant egg.',
 'Friendly ghosts and magic portals. Where will your ball pop out?',
 'Rainbow windmills and bouncing clouds. Follow the stars!',
 'Penguins are sliding! Boing around the wandering snowball.',
 'A friendly dragon swoops over your bridge. Find its magical shortcut!',
 'Birds, jungle pools, and a giant waterfall. Follow the winding fairway!',
 'Ride past a working Ferris wheel and dancing carnival balloons!',
 'Fireworks, a giant trophy, and one last magical portal!'
];

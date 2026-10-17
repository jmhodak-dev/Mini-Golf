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
 ['The Grand Finale','Silly stuff','🏆','#e5dbac','#9e9253','Tricky','One last wildly good adventure.',5]
].map((c,id)=>({id,name:c[0],category:c[1],emoji:c[2],bg:c[3],accent:c[4],difficulty:c[5],description:c[6],par:c[7]}));
export function layout(id){
 const variants=[[{x:175,y:270,w:200,h:28}],[{x:90,y:230,w:200,h:28},{x:290,y:360,w:80,h:28}],[{x:175,y:225,w:30,h:190},{x:330,y:180,w:30,h:160}],[{x:90,y:275,w:170,h:28},{x:310,y:340,w:60,h:28}],[{x:170,y:180,w:180,h:28},{x:170,y:360,w:180,h:28}]];
 const result = {start:{x:100,y:475},hole:{x:405,y:110},walls:variants[id%5].map((w,i)=>({...w,x:w.x+(Math.floor(id/5)*9)*(i%2?-1:1),y:w.y+Math.floor(id/5)*13})),bumpers:id>5?[{x:275,y:125,r:23},{x:345,y:450,r:23}]:[],movers:[{x:250,y:365,r:20,travel:45+id%3*10}],pads:[{x:220,y:440,r:19,vx:1,vy:-7}],portals:[7,11,14].includes(id)?[{x:110,y:175},{x:355,y:410}]:[],stars:[{x:125,y:385},{x:270,y:165},{x:400,y:245}]};
 result.ramps=[{x:225+(id%3-1)*15,y:210+(id%2)*25,w:100,h:180,height:48}];
 result.tunnels=[0,2,4,9,10,13].includes(id)?[{x:85,y:165,w:100,h:70,height:62}]:[];
 result.spinners=[1,3,4,5,8,12,14].includes(id)?[{x:270,y:185,length:42,r:6,speed:.009}]:[];
 for(const tunnel of result.tunnels){result.walls.push({x:tunnel.x,y:tunnel.y,w:12,h:tunnel.h,height:56},{x:tunnel.x+tunnel.w-12,y:tunnel.y,w:12,h:tunnel.h,height:56})}
 result.easy=true;
 return result;
}

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
 'Fireworks, a giant trophy, and one last magical portal!'
];

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
 const variants=[[{x:175,y:270,w:200,h:28}],[{x:90,y:230,w:200,h:28},{x:290,y:360,w:155,h:28}],[{x:175,y:225,w:30,h:190},{x:330,y:180,w:30,h:160}],[{x:90,y:275,w:170,h:28},{x:310,y:340,w:120,h:28}],[{x:170,y:180,w:180,h:28},{x:170,y:360,w:180,h:28}]];
 return {start:{x:100,y:475},hole:{x:405,y:110},walls:variants[id%5].map((w,i)=>({...w,x:w.x+(Math.floor(id/5)*9)*(i%2?-1:1),y:w.y+Math.floor(id/5)*13})),bumpers:id>5?[{x:275,y:125,r:23},{x:375,y:460,r:23}]:[]};
}

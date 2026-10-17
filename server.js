import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {randomBytes} from 'node:crypto';
const app=express(); const server=createServer(app); const io=new Server(server); const rooms=new Map();
app.use(express.static('public')); app.get('/health',(_,res)=>res.json({ok:true}));
function state(room){return {code:room.code,course:room.course,players:room.players,turn:room.turn,started:room.started,positions:room.positions};}
function broadcast(room){io.to(room.code).emit('room',state(room));}
io.on('connection',socket=>{
 socket.on('join',({code,name,course=0},reply)=>{
  if(socket.data.code)return reply({error:'You are already in a room. Refresh to leave.'});
  let room;
  if(code){room=rooms.get(String(code).toUpperCase());if(!room)return reply({error:'Room not found. Check those letters!'});if(room.started)return reply({error:'This game has already started.'});if(room.players.length>=4)return reply({error:'This room is full.'});}
  else {code=randomBytes(3).toString('hex').toUpperCase();room={code,course:Math.max(0,Math.min(14,Number(course)||0)),players:[],turn:0,started:false,positions:[]};rooms.set(code,room);}
  room.players.push({id:socket.id,name:String(name||'Golfer').slice(0,18),strokes:0,done:false});room.positions.push({x:100,y:475});socket.join(room.code);socket.data.code=room.code;reply({ok:true});broadcast(room);
 });
 socket.on('begin',()=>{const r=rooms.get(socket.data.code);if(r&&r.players[0]?.id===socket.id){r.started=true;broadcast(r);}});
 socket.on('shot',({vx,vy})=>{const r=rooms.get(socket.data.code);if(!r?.started||r.players[r.turn]?.id!==socket.id||r.busy)return; if(!Number.isFinite(vx)||!Number.isFinite(vy)||Math.hypot(vx,vy)>17)return;r.busy=true;r.players[r.turn].strokes++;io.to(r.code).emit('shot',{vx,vy,index:r.turn});});
 socket.on('settled',({x,y,done})=>{const r=rooms.get(socket.data.code);if(!r?.busy||r.players[r.turn]?.id!==socket.id||!Number.isFinite(x)||!Number.isFinite(y))return;r.positions[r.turn]={x:Math.max(49,Math.min(451,x)),y:Math.max(49,Math.min(531,y))};r.players[r.turn].done=!!done;r.busy=false;for(let n=1;n<=r.players.length;n++){const t=(r.turn+n)%r.players.length;if(!r.players[t].done){r.turn=t;break;}}broadcast(r);});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.code);if(!r)return;const i=r.players.findIndex(p=>p.id===socket.id);if(i===r.turn)r.busy=false;r.players.splice(i,1);r.positions.splice(i,1);if(!r.players.length)rooms.delete(r.code);else{if(i<r.turn)r.turn--;r.turn%=r.players.length;broadcast(r);}});
});
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Wild Putt running on port '+(process.env.PORT||3000)));

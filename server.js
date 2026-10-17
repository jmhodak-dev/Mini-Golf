import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {randomBytes} from 'node:crypto';
import {courses,layout} from './public/courses.js';
import {nearestFairway} from './public/physics.js';
const app=express(),server=createServer(app),io=new Server(server),rooms=new Map();
app.use(express.static('public'));app.get('/health',(_,res)=>res.json({ok:true}));
function state(r){return{code:r.code,course:r.course,players:r.players,turn:r.turn,started:r.started,positions:r.positions,easy:r.easy,full:r.full}}
function broadcast(r){io.to(r.code).emit('room',state(r))}
function resetHole(r){r.positions=r.players.map(()=>({...layout(r.course).start}));r.turn=0;r.busy=false;for(const p of r.players){p.strokes=0;p.done=false;p.stars=[]}}
io.on('connection',socket=>{
 socket.on('join',({code,name,course=0,easy=true,full=false}={},reply=()=>{})=>{
  if(socket.data.code)return reply({error:'You are already in a room. Refresh to leave.'});let r;
  if(code){r=rooms.get(String(code).toUpperCase());if(!r)return reply({error:'Room not found. Check those letters!'});if(r.started)return reply({error:'This game has already started.'});if(r.players.length>=4)return reply({error:'This room is full.'})}
  else{code=randomBytes(3).toString('hex').toUpperCase();r={code,course:full?0:Math.max(0,Math.min(courses.length-1,Math.floor(Number(course)||0))),players:[],turn:0,started:false,positions:[],easy:easy!==false,full:!!full};rooms.set(code,r)}
  r.players.push({id:socket.id,name:String(name||'Golfer').slice(0,18),strokes:0,done:false,stars:[],total:0,scorecard:[]});r.positions.push({...layout(r.course).start});socket.join(r.code);socket.data.code=r.code;reply({ok:true});broadcast(r);
 });
 socket.on('begin',()=>{const r=rooms.get(socket.data.code);if(r&&r.players[0]?.id===socket.id){r.started=true;broadcast(r)}});
 socket.on('shot',({vx,vy}={})=>{const r=rooms.get(socket.data.code);if(!r?.started||r.players[r.turn]?.id!==socket.id||r.busy||r.players[r.turn].done)return;if(!Number.isFinite(vx)||!Number.isFinite(vy)||Math.hypot(vx,vy)>17)return;r.busy=true;r.players[r.turn].strokes++;io.to(r.code).emit('shot',{vx,vy,index:r.turn,phase:Math.floor(Date.now()/(1000/60))})});
 socket.on('settled',({x,y,done,stars}={})=>{const r=rooms.get(socket.data.code);if(!r?.busy||r.players[r.turn]?.id!==socket.id||!Number.isFinite(x)||!Number.isFinite(y))return;const l=layout(r.course),near=nearestFairway(l,x,y),limit=l.width/2-11;if(near.distance>limit){x=near.x+(x-near.x)/near.distance*limit;y=near.y+(y-near.y)/near.distance*limit}r.positions[r.turn]={x,y};const p=r.players[r.turn];p.done=!!done;p.stars=Array.isArray(stars)?[...new Set(stars.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];r.busy=false;for(let n=1;n<=r.players.length;n++){const t=(r.turn+n)%r.players.length;if(!r.players[t].done){r.turn=t;break}}broadcast(r)});
 socket.on('next-hole',()=>{const r=rooms.get(socket.data.code);if(!r?.full||r.players[0]?.id!==socket.id||!r.players.every(p=>p.done)||r.course>=courses.length-1)return;for(const p of r.players){p.total+=p.strokes;p.scorecard.push(p.strokes)}r.course++;resetHole(r);broadcast(r)});
 socket.on('reset-ball',()=>{const r=rooms.get(socket.data.code);if(!r?.started||r.busy||r.players[r.turn]?.id!==socket.id||r.players[r.turn].done)return;r.positions[r.turn]={...layout(r.course).start};broadcast(r)});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.code);if(!r)return;const i=r.players.findIndex(p=>p.id===socket.id);if(i<0)return;if(i===r.turn)r.busy=false;r.players.splice(i,1);r.positions.splice(i,1);if(!r.players.length)rooms.delete(r.code);else{if(i<r.turn)r.turn--;r.turn%=r.players.length;if(r.players[r.turn].done){const next=r.players.findIndex(p=>!p.done);if(next>=0)r.turn=next}broadcast(r)}});
});
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Wild Putt running on port '+(process.env.PORT||3000)));

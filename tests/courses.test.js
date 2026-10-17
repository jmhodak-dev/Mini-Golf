import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,layout} from '../public/courses.js';
test('15 themed courses have playable, unobstructed tees and cups',()=>{assert.equal(courses.length,15);assert.equal(new Set(courses.map(c=>c.name)).size,15);for(const c of courses){const l=layout(c.id);for(const p of [l.start,l.hole]){assert.ok(p.x>49&&p.x<451&&p.y>49&&p.y<531);for(const w of l.walls)assert.ok(p.x<w.x-10||p.x>w.x+w.w+10||p.y<w.y-10||p.y>w.y+w.h+10)}}});
test('requested worlds exist',()=>{for(const theme of ['Dinosaur','Brick world','Halloween'])assert.ok(courses.some(c=>c.category===theme));assert.ok(courses.some(c=>c.name==='Six Seven!'))});

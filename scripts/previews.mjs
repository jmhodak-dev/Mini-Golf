import {courses} from '../public/courses.js';
import {chromium} from '@playwright/test';import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('public/previews',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1280,height:900}});await page.goto('http://127.0.0.1:3000');for(let id=0;id<courses.length;id++){await page.locator(`.play-course[data-play="${id}"]`).click();await page.locator('#start-local').click();await page.waitForTimeout(1300);const image=await page.evaluate(()=>import('/world3d.js').then(m=>m.capturePreview()));await writeFile(`public/previews/course-${id}.webp`,Buffer.from(image.split(',')[1],'base64'));await page.locator('#exit-game').click()}console.log('Saved 18 previews of the actual playable 3D worlds.')}finally{await browser.close()}

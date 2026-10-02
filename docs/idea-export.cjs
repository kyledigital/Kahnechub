const {chromium}=require('C:/Users/kyleh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/kyleh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),fs=require('fs');
const out=__dirname+'/kahnec-hub-ideas-preview/assets/media/';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:720,height:476}});try{
page.on('pageerror',e=>console.log(e.message));await page.goto('http://127.0.0.1:4176/render-ideas.html');await page.waitForFunction(()=>window.sceneReady,null,{timeout:30000});
// One sequential low-resolution pass. Do not run alongside other browser jobs.
const video=await page.evaluate(()=>window.recordScene());fs.writeFileSync(out+'ideas-capture.webm',Buffer.from(video.base64,'base64'));
await page.evaluate(()=>window.drawFrame(8.5));await sharp(await page.screenshot()).webp({quality:88}).toFile(out+'ideas-poster.webp');
console.log(JSON.stringify({width:720,height:476,mime:video.mime,videoBytes:video.size,posterBytes:fs.statSync(out+'ideas-poster.webp').size,method:'Three.js, software WebGL, one 9.5-second Chrome MediaRecorder pass'}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});

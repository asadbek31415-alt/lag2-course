'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||'distribution/public'),site=path.join(root,'site');
const version=JSON.parse(fs.readFileSync(path.join(site,'version.json'))).version;
assert.match(version,/^\d+\.\d+\.\d+$/);
if(process.env.GITHUB_REF_NAME) assert.equal(process.env.GITHUB_REF_NAME,'v'+version);
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'android/package.json'))).version,version);
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'android/package-lock.json'))).version,version);
assert.ok(fs.readFileSync(path.join(site,'js/release.js'),'utf8').includes("version: '"+version+"'"));
assert.ok(fs.readFileSync(path.join(site,'js/content.js'),'utf8').includes('Course · v'+version));
const html=fs.readFileSync(path.join(site,'index.html'),'utf8');
assert.ok(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(html),'Remote startup dependency');
for (const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) if(!/^(?:https?:|#|data:)/.test(m[1])) assert.ok(fs.existsSync(path.join(site,m[1])),m[1]);
const css=fs.readFileSync(path.join(site,'vendor/fontawesome/css/all.min.css'),'utf8');
for(const m of css.matchAll(/url\(([^)]+)\)/g)) assert.ok(fs.existsSync(path.resolve(site,'vendor/fontawesome/css',m[1].replace(/["']/g,''))),m[1]);
let count=0;
const walk=p=>{for(const ent of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,ent.name); if(ent.isDirectory())walk(f);else{count++;assert.ok(!/\.p12$|password|keystore|\.env$/.test(ent.name),'Private file: '+f);}}};walk(site);
const context={console}; vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(site,'vendor/math.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(site,'js/engine.js'),'utf8')+'\nthis.engine=MatlabEngine;',context);
vm.runInContext(fs.readFileSync(path.join(site,'js/content.js'),'utf8')+'\nthis.content=CourseContent;',context);
assert.equal(context.content.chapters.length,5);
for(const chapter of [context.content.dashboard,...context.content.chapters]){
  for(const [id,code] of Object.entries(chapter.matlabBlocks||{})){
    context.engine.reset(); const result=context.engine.execute(code); const errors=result.filter(x=>x.type==='error');
    assert.equal(errors.length,0,chapter.id+'/'+id+': '+JSON.stringify(errors));
  }
}
context.engine.reset();context.engine.execute('A = [4 3; 6 3]; [L,U,P] = lu(A); residual = norm(P*A-L*U)');
const residual=context.engine.execute('residual').find(x=>x.type==='result'); assert.ok(residual && Math.abs(Number(residual.text.split('=')[1].trim())) < 1e-9,'LU reconstruction failed');
console.log('Release v'+version+': '+count+' assets, five chapters, bundled libraries and all course code blocks checked.');




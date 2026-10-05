'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(process.argv[2]||'distribution/public');
const source=fs.readFileSync(path.join(root,'site/js/release.js'),'utf8');
const installed=JSON.parse(fs.readFileSync(path.join(root,'site/version.json'))).version;
function element(){return {hidden:true,dataset:{},textContent:'',href:'',target:'',events:{},addEventListener(type,fn){this.events[type]=fn;}};}
async function scenario(options={}) {
    const notice=element(),message=element(),link=element(),dismiss=element();
    const elements={'[data-update-message]':message,'[data-update-link]':link,'[data-update-dismiss]':dismiss};
    notice.querySelector=name=>elements[name];
    const doc={hidden:false,events:{},getElementById:()=>notice,querySelectorAll:()=>[],addEventListener(type,fn){this.events[type]=fn;}};
    const win={events:{},Capacitor:options.android?{getPlatform:()=> 'android'}:undefined,addEventListener(type,fn){this.events[type]=fn;}};
    let requests=0,now=Date.now();
    const ctx={console,window:win,document:doc,navigator:{onLine:options.offline?false:true},location:{hash:'#lu/triangular'},localStorage:{getItem:()=>options.previous||null,setItem(){}},AbortController,setTimeout,clearTimeout,setInterval(){},Date:{now:()=>now},fetch:async()=>{requests++;if(options.failure)throw Error('offline');return {ok:true,json:async()=>({tag_name:'v'+(options.version||'1.0.1'),prerelease:!!options.prerelease,draft:false,assets:options.missingAssets?[]:[{name:'LAG2-Android.apk'},{name:'LAG2-Interactive-Course.zip'}]})};}};
    vm.runInNewContext(source,ctx);doc.events.DOMContentLoaded();await new Promise(setImmediate);
    return {notice,message,link,dismiss,requests:()=>requests,resume:async()=>{now+=16*60*1000;doc.events.visibilitychange();await new Promise(setImmediate);}};
}
(async()=>{
    const android=await scenario({android:true});
    assert.equal(android.notice.hidden,false);assert.match(android.message.textContent,/1\.0\.1 is ready/);assert.match(android.link.href,/releases\/download\/v1\.0\.1\/LAG2-Android\.apk$/);assert.equal(android.link.textContent,'Download Android update');
    android.dismiss.events.click();await android.resume();assert.equal(android.notice.hidden,true,'Dismissed notice stays dismissed this session');
    const online=await scenario();assert.match(online.link.href,/\?version=1\.0\.1#lu\/triangular$/);assert.equal(online.link.textContent,'Load new version');
    for(const options of [{version:installed},{version:'0.1.0'},{version:'broken'},{prerelease:true},{missingAssets:true},{offline:true},{failure:true}])assert.equal((await scenario(options)).notice.hidden,true,JSON.stringify(options));
    const updated=await scenario({version:installed,previous:'0.1.0'});assert.equal(updated.message.textContent,'Updated to LAG2 v'+installed+'.');
    const offline=await scenario({offline:true});assert.equal(offline.requests(),0);
    console.log('Website/Android update destinations, published-version comparisons, missing assets, offline use, resume and dismissal checked.');
})().catch(error=>{console.error(error);process.exitCode=1;});

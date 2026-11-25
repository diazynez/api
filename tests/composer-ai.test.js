"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const ai=require("../tools/composer-ai.js");
const core=require("../tools/composer-core.js");

test("attacker initialization hints and coverage preserve lock and gravity configuration",()=>{
    const text='生成一个锁定的独立道具“bsmc”，无重力',baseline=core.fromText(text);
    const prompt=ai.prompt(core,text,"3.8开发","character",baseline,[]),data=JSON.parse(prompt.user);
    assert.match(data.interfaces.find(row=>row.api === "addAttacker").hint,/moveToTarget:true/);
    assert.match(prompt.system,/不要因为“锁定”切换 actor/);
    const plan=params=>({steps:[{api:"addAttacker",args:{mcName:"bsmc",params}}],unresolved:[]});
    const good=ai.buildPlan(core,plan({applyG:false,y:{moveToTarget:true},x:{moveToTarget:true}}),"3.8开发","character");
    assert.deepEqual(ai.coverage(core,text,baseline,good.graph),[]);
    for(const params of [{x:{moveToTarget:true},y:{moveToTarget:true},applyG:true},{x:{moveToTarget:true},applyG:false}]) {
        const bad=ai.buildPlan(core,plan(params),"3.8开发","character");
        assert.ok(ai.coverage(core,text,baseline,bad.graph).some(note=>note.includes("初始化配置")));
    }
});

test("recognized local branch chains do not request paid AI completion",()=>{
    for(const text of ['如果血量低于20，播放“A”；否则如果耐力低于10，播放“B”；否则播放“C”','攻击k1命中后跳到“招2”，否则播放“站立”']) {
        const baseline=core.fromText(text);assert.deepEqual(baseline.notes,[]);assert.equal(ai.needsAI(core,text,baseline),false);
        assert.doesNotMatch(core.generate(baseline.graph).code,/justHitToPlay/);
    }
    const bad='如果血量低于20，播放“A”；否则如果';assert.equal(ai.needsAI(core,bad,core.fromText(bad)),true);
});

test("semantic else-if and else steps preserve exclusive control flow",()=>{
    const source={steps:[{if:[{api:"hp",op:"<",value:20}],then:[{api:"gotoAndPlay",args:{name:"A"}}],elseIf:[{if:[{api:"getEnergy",op:"<",value:10}],then:[{api:"gotoAndPlay",args:{name:"B"}}]}],else:[{api:"gotoAndPlay",args:{name:"C"}}]}],unresolved:[]};
    const built=ai.buildPlan(core,source,"3.8开发","character"),code=core.generate(built.graph).code;
    assert.match(code,/else if \(/);assert.match(code,/else \{/);
    for(const [hp,energy,name] of [[19,0,"A"],[20,0,"B"],[20,10,"C"]]) {
        const calls=[];
        vm.runInNewContext(code,{parent:{$fighter_ctrler:{getSelf:()=>({hp}),getEnergy:()=>energy},$mc_ctrler:{gotoAndPlay:v=>calls.push(v)}}});
        assert.deepEqual(calls,[name]);
    }
    for(const elseIf of [null,{},[{then:[]}],[{if:[],then:[]}]]) assert.throws(()=>ai.buildPlan(core,{steps:[{...source.steps[0],elseIf}],unresolved:[]},"3.8开发","character"),/elseIf|条件/);
    assert.throws(()=>ai.buildPlan(core,{steps:[{...source.steps[0],else:{api:"shine"}}],unresolved:[]},"3.8开发","character"),/步骤/);
    const disabled={steps:[{if:[{api:"hp",op:"<",value:20}],then:[{api:"setDisabled",args:{action:"skill1",condition:"true"}}],else:[{api:"shine"}]}],unresolved:[]};
    const output=core.generate(ai.buildPlan(core,disabled,"3.8开发","character").graph);
    assert.match(output.code,/else \{/);assert.doesNotMatch(output.code,/function\(\):Boolean/);
    const nested={steps:[{eachFrame:{frames:-1},steps:source.steps}],unresolved:[]};
    assert.match(core.generate(ai.buildPlan(core,nested,"3.8开发","character").graph).code,/else if \(/);
});
const settings=ai.config({provider:"openai",model:"gpt-6.2-sol",effort:"low",enabled:true},true);
function plan() {
    return {nodes:[{id:"ground",key:"isInAir",params:{}},{id:"energy",key:"getEnergy",params:{}},{id:"jump",key:"gotoAndPlay",params:{name:"招2"}}],blocks:[{id:"when",kind:"condition",conditions:[{node:"ground",operator:"falsy",value:"",join:"and"},{node:"energy",operator:">=",value:"20",join:"and"}],actions:["jump"]}],order:["when"],unresolved:[]};
}
function settingsPage(local=new Map(),session=new Map(),blockSession=false,clientAI=ai) {
    const elements=new Map();
    function element(id) {
        if (!elements.has(id)) elements.set(id,{value:"",checked:false,hidden:false,disabled:false,textContent:"",dataset:{},handlers:{},children:[],addEventListener(name,fn){this.handlers[name]=fn;},replaceChildren(){this.children=[];this.value="";},appendChild(child){this.children.push(child);if (this.children.length===1)this.value=child.value;},close(){this.open=false;},showModal(){this.open=true;}});
        return elements.get(id);
    }
    const context={BvnComposerAI:clientAI,BvnComposer:core,document:{getElementById:element,createElement:()=>element("created"+elements.size)},localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value)},sessionStorage:{getItem:key=>{if(blockSession)throw new Error("SecurityError");return session.get(key)||null;},setItem:(key,value)=>session.set(key,value),removeItem:key=>session.delete(key)},URL,AbortController,setTimeout,clearTimeout};
    context.window=context;vm.runInNewContext(fs.readFileSync(require.resolve("../tools/composer-ai-ui.js"),"utf8"),context);
    return {element,client:context.BvnComposerAISettings,local,session};
}
test("configuration never serializes credentials and rejects unsafe API destinations",()=>{
    assert.equal(JSON.stringify(ai.config({...settings,key:"secret",apiKey:"secret"})).includes("secret"),false);
    for (const baseUrl of ["https://user:secret@example.com/v1","http://example.com/v1","https://example.com/?key=secret","javascript:alert(1)","https://example.com/#secret"]) assert.throws(()=>ai.config({...settings,baseUrl}));
    assert.equal(ai.config({...settings,baseUrl:"http://127.0.0.1:9000/v1/"}).baseUrl,"http://127.0.0.1:9000/v1");
});
test("only incomplete static results call for AI and the test sentence needs supplementation",()=>{
    const direct="耐力不少于20时，跳到“招2”并播放";
    assert.equal(ai.needsAI(core,direct,core.fromText(direct)),false);
    assert.equal(ai.needsAI(core,"读取当前耐力",core.fromText("读取当前耐力")),false);
    const indirect="双脚仍在地面且体力足够支付20点时，切到“招2”继续播放";
    assert.equal(ai.needsAI(core,indirect,core.fromText(indirect)),true);
});
test("an AI semantic plan uses native shortcuts and respects the actual combined condition",()=>{
    const result=ai.buildPlan(core,plan(),"3.8开发","character");
    const code=core.generate(result.graph).code;
    assert.match(code,/\$mc_ctrler.gotoAndPlay/);assert.doesNotMatch(code,/getMC\(\).goFrame/);
    let energy=20, inAir=false, calls=0;
    const context={parent:{$fighter_ctrler:{getSelf:()=>({isInAir:inAir}),getEnergy:()=>energy},$mc_ctrler:{gotoAndPlay:()=>calls++}}};
    vm.runInNewContext(code,context);assert.equal(calls,1);
    inAir=true;vm.runInNewContext(code,context);assert.equal(calls,1);
    inAir=false;energy=19;vm.runInNewContext(code,context);assert.equal(calls,1);
});
test("unresolved requests remain pending and no partial generated code is accepted",()=>{
    const p=plan();p.unresolved=["缺少动作帧标签"];
    const result=ai.buildPlan(core,p,"3.8开发","character");assert.equal(result.graph,null);assert.deepEqual(result.notes,p.unresolved);
});
test("invented APIs, parameters, code expressions, mismatched versions and duplicate execution are rejected",()=>{
    let p=plan();p.nodes[2].key="eval";assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/不适用/);
    p=plan();p.nodes[2].params.extra="oops";assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/未知或无效参数/);
    p=plan();p.blocks[0].conditions[1].value="20);evil();//";assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/校验/);
    p=plan();assert.throws(()=>ai.buildPlan(core,p,"3.0","character"),/不适用/);
    p=plan();p.order.push("jump");assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/重复/);
    p=plan();p.nodes[0].key="__proto__";assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/不适用/);
});
test("a state-dependent disable uses a single native callback instead of an if or render loop",()=>{
    const p={nodes:[{id:"hp",key:"hp",params:{}},{id:"disable",key:"setDisabled",params:{action:"zhao2",condition:"true"}}],blocks:[{id:"condition",kind:"condition",conditions:[{node:"hp",operator:"<",value:"100"}],actions:["disable"]}],order:["condition"],unresolved:[]};
    const code=core.generate(ai.buildPlan(core,p,"3.8开发","character").graph).code;
    assert.match(code,/setDisabled\("zhao2", function\(\):Boolean/);assert.doesNotMatch(code,/addRenderFunc|if \(/);
});
test("explicit object sources preserve distinct attack configuration identities",()=>{
    const p={nodes:[{id:"hit",key:"getHitVO",params:{id:"k1"}},{id:"power",key:"setPower",params:{value:80},source:"hit"}],blocks:[],order:["power"],unresolved:[]};
    const code=core.generate(ai.buildPlan(core,p,"3.8开发","character").graph).code;assert.match(code,/getHitVO\("k1"\).power = 80/);
    p.nodes[0].source="power";assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/循环/);
});
test("old binding clearing must stay inside a per-frame block",()=>{
    const p={nodes:[{id:"disable",key:"clearBinding",params:{action:"zhao2"}}],blocks:[],order:["disable"],unresolved:[]};
    assert.throws(()=>ai.buildPlan(core,p,"3.0","character"),/逐帧/);
    p.blocks=[{id:"frame",kind:"frame",frames:-1,conditions:[],actions:["disable"]}];p.order=["frame"];
    const code=core.generate(ai.buildPlan(core,p,"3.0","character").graph).code;assert.match(code,/delayCall/);
});
test("reasoning choices are provider aware and unsupported settings never get sent",()=>{
    assert.deepEqual(ai.efforts(settings),["auto","low"]);
    assert.throws(()=>ai.body({...settings,effort:"none"},"s","u",100),/尚未确认/);
    const deepseek=ai.config({provider:"deepseek",model:"test",effort:"none"});
    assert.deepEqual(ai.body(deepseek,"s","u",100).thinking,{type:"disabled"});
    const unknown=ai.config({provider:"custom",baseUrl:"https://example.com/v1",model:"unknown"});
    assert.deepEqual(ai.efforts(unknown),["auto"]);
    const caps={capabilities:{thinking:{types:{disabled:{supported:true},adaptive:{supported:true}}},effort:{low:{supported:true}}}};
    const anthropic=ai.config({provider:"anthropic",model:"test",effort:"none"});
    assert.deepEqual(ai.efforts(anthropic,caps),["auto","none","low"]);
});

test("SiliconFlow Qwen hybrid models have explicit thinking controls without treating defaults as enabled",async()=>{
    for(const model of ["Qwen/Qwen3-14B","Qwen/Qwen3.5-9B","Qwen/Qwen3.5-27B","Qwen/Qwen3.5-35B-A3B"]) {
        const settings=ai.config({provider:"siliconflow",model,effort:"on"});
        assert.equal(settings.effort,"on");assert.deepEqual(ai.efforts(settings),["auto","none","on"]);
        assert.equal(ai.body(settings,"s","u",100).enable_thinking,true);
        assert.equal(ai.body({...settings,effort:"none"},"s","u",100).enable_thinking,false);
        assert.equal(Object.hasOwn(ai.body({...settings,effort:"auto"},"s","u",100),"enable_thinking"),false);
    }
    for(const settings of [ai.config({provider:"custom",baseUrl:"https://example.com/v1",model:"Qwen/Qwen3.5-27B",effort:"on"}),ai.config({provider:"siliconflow",model:"Qwen/Qwen3-Coder-30B-A3B-Instruct",effort:"on"})]) assert.throws(()=>ai.body(settings,"s","u",100),/尚未确认/);
    for(const effort of ["on","none","auto"]) {
        let request=null;
        await ai.complete(ai.config({provider:"siliconflow",model:"Qwen/Qwen3.5-27B",effort}),"dummy-secret","system","private-user-text",{onRequest:info=>request=info,fetch:async(url,options)=>{
            const sent=JSON.parse(options.body);
            assert.deepEqual(request.parameters,Object.hasOwn(sent,"enable_thinking")?["enable_thinking="+sent.enable_thinking]:[]);
            return new Response(JSON.stringify({choices:[{message:{content:'{"steps":[],"unresolved":[]}'}}]}));
        }});
        assert.equal(request.model,"Qwen/Qwen3.5-27B");assert.equal(request.effort,effort);
        assert.doesNotMatch(JSON.stringify(request),/dummy-secret|private-user-text|system|Authorization/);
    }
});
test("requests put the key only in headers, disable redirects and return validated model data",async()=>{
    let calls=0;
    const result=await ai.models(settings,"test-secret",{fetch:async(url,options)=>{
        calls++;assert.equal(url,"https://api.openai.com/v1/models");assert.equal(options.headers.Authorization,"Bearer test-secret");
        assert.equal(options.credentials,"omit");assert.equal(options.redirect,"error");assert.equal(options.cache,"no-store");assert.equal(String(options.body).includes("test-secret"),false);
        return new Response(JSON.stringify({data:[{id:"one"},{id:null}]}));
    }});
    assert.deepEqual(result,[{id:"one"}]);assert.equal(calls,1);
});
test("no automatic paid retries and no provider error body or key leaks",async()=>{
    let calls=0;
    await assert.rejects(ai.complete(settings,"test-secret","s","u",{fetch:async()=>{calls++;return new Response("secret test-secret",{status:400});}}),/HTTP 400/);
    assert.equal(calls,1);
    await assert.rejects(ai.models(settings,"test-secret",{fetch:async()=>{throw new TypeError("private-url");}}),/跨域/);
});
test("all three response protocols reject truncated or unstructured output",()=>{
    assert.deepEqual(ai.readOutput({output:[{content:[{type:"output_text",text:'{"ok":true}'}]}]},"responses"),{ok:true});
    assert.deepEqual(ai.readOutput({content:[{type:"thinking",thinking:"ignore"},{type:"text",text:'```json\n{"ok":true}\n```'}]},"messages"),{ok:true});
    assert.deepEqual(ai.readOutput({choices:[{message:{content:'{"ok":true}'},finish_reason:"stop"}]},"chat"),{ok:true});
    assert.throws(()=>ai.readOutput({status:"incomplete"},"responses"),/完整/);
    assert.throws(()=>ai.readOutput({choices:[{message:{content:"{}"},finish_reason:"length"}]},"chat"),/长度/);
});
test("AI prompts contain only available interfaces, documentation and requirements, never credentials",()=>{
    const input="双脚仍在地面且体力足够支付20点时，切到“招2”继续播放";
    const prompt=ai.prompt(core,input,"3.0","character",core.fromText(input,"3.0"),[]);
    const data=JSON.parse(prompt.user);assert.equal(data.request,input);
    assert.equal(data.interfaces.some(s=>s.api === "setDisabled"),false);
    assert.equal(data.interfaces.some(s=>s.api === "gotoAndPlay"),true);
    assert.equal("key" in data,false);
});
test("cancelling a pending network request stops the call without retrying",async()=>{
    const controller=new AbortController();
    const promise=ai.models(settings,"test-secret",{signal:controller.signal,fetch:async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener("abort",()=>reject(new DOMException("aborted","AbortError"))))});
    controller.abort();await assert.rejects(promise,error=>error.name === "AbortError");
});

test("a top-only collapse expands with one upward event both immediately and after idle",()=>{
    const source=fs.readFileSync(require.resolve("../tools/composer.js"),"utf8");
    const start=source.indexOf("    var introGestureUntil=0,"),end=source.indexOf('    window.addEventListener("scroll"',start);
    for(const [animating,idle] of [[true,20],[false,20],[false,5000]]) {
        let compact=false,now=1000,modes=[],armed=0;
        const handlers={},ctx={introLocked:false,introScrollActive:false,performance:{now:()=>now},document:{body:{classList:{contains:()=>compact}}},$:()=>({open:false}),window:{scrollY:0,addEventListener:(name,fn)=>handlers[name]=fn},setIntroMode:value=>{modes.push(value);compact=value;ctx.introLocked=true;},topArmed:false,topTimer:null,touchY:null,clearTimeout:()=>{},armTop:()=>armed++};
        vm.runInNewContext(source.slice(start,end),ctx);
        function wheel(deltaY) {handlers.wheel({deltaY,preventDefault(){},target:{closest:()=>null}});}
        wheel(100);ctx.window.scrollY=0;ctx.introLocked=animating;now+=idle;
        wheel(-100);assert.deepEqual(modes,[true,false]);assert.equal(armed,0);
    }
    let compact=false,now=1000,modes=[],armed=0;
    const handlers={},ctx={introLocked:false,introScrollActive:false,performance:{now:()=>now},document:{body:{classList:{contains:()=>compact}}},$:()=>({open:false}),window:{scrollY:0,addEventListener:(name,fn)=>handlers[name]=fn},setIntroMode:value=>{modes.push(value);compact=value;},topArmed:false,topTimer:null,touchY:null,clearTimeout:()=>{},armTop:()=>armed++};
    vm.runInNewContext(source.slice(start,end),ctx);
    function wheel(deltaY) {handlers.wheel({deltaY,preventDefault(){},target:{closest:()=>null}});}
    wheel(100);ctx.window.scrollY=400;now+=500;wheel(-100);
    assert.deepEqual(modes,[true]);
    // Once the page has moved, the existing arrive-at-top gesture stays separate
    ctx.introTopCollapsed=false;ctx.window.scrollY=0;wheel(-100);
    assert.deepEqual(modes,[true]);assert.equal(armed,1);
    ctx.topArmed=true;wheel(-100);assert.deepEqual(modes,[true,false]);
});

test("expanded-page wheel events are consumed even over the canvas, and animation consumes further motion",()=>{
    const source=fs.readFileSync(require.resolve("../tools/composer.js"),"utf8");
    const start=source.indexOf("    var introGestureUntil=0,"),end=source.indexOf('    window.addEventListener("scroll"',start);
    let compact=false,now=1000,prevented=0,modes=[],target="#board";
    const handlers={},ctx={
        introLocked:false,performance:{now:()=>now},document:{body:{classList:{contains:()=>compact}}},
        $:()=>({open:false}),window:{scrollY:0,addEventListener:(name,fn,options)=>{handlers[name]={fn,options};}},
        setIntroMode:value=>{modes.push(value);compact=value;ctx.introLocked=true;},
        topArmed:false,topTimer:null,touchY:null,clearTimeout:()=>{},armTop:()=>{}
    };
    vm.runInNewContext(source.slice(start,end),ctx);
    function wheel(deltaY) {handlers.wheel.fn({deltaY,preventDefault:()=>prevented++,target:{closest:()=>target}});}
    wheel(1600);assert.equal(prevented,1);assert.deepEqual(modes,[true]);
    wheel(1600);assert.equal(prevented,2);assert.deepEqual(modes,[true]);
    ctx.introLocked=false;now+=50;wheel(200);assert.equal(prevented,3);
    now+=500;target=null;wheel(200);assert.equal(prevented,3);
    assert.equal(handlers.wheel.options.passive,false);assert.equal(handlers.wheel.options.capture,true);
});

test("saving the actual settings form persists ordinary configuration but never its Key",()=>{
    const elements=new Map(),saved=new Map();
    function element(id) {
        if (!elements.has(id)) elements.set(id,{value:"",checked:false,hidden:false,disabled:false,textContent:"",dataset:{},handlers:{},children:[],addEventListener(name,fn){this.handlers[name]=fn;},replaceChildren(){this.children=[];this.value="";},appendChild(child){this.children.push(child);if (this.children.length === 1) this.value=child.value;},close(){this.open=false;},showModal(){this.open=true;}});
        return elements.get(id);
    }
    const context={BvnComposerAI:ai,BvnComposer:core,document:{getElementById:element,createElement:()=>({})},localStorage:{getItem:()=>null,setItem:(key,value)=>saved.set(key,value)},URL,AbortController};
    context.window=context;vm.runInNewContext(fs.readFileSync(require.resolve("../tools/composer-ai-ui.js"),"utf8"),context);
    element("ai-settings").handlers.click();
    assert.equal(element("ai-state").textContent,"未启用");
    element("ai-key").value="dummy-secret-for-test";element("ai-model").value="gpt-6.2-sol";element("ai-enabled").checked=true;
    element("ai-form").handlers.submit({preventDefault(){}});
    assert.equal(context.BvnComposerAISettings.ready(),true);
    assert.equal(element("ai-state").textContent,"已启用");assert.equal(element("ai-state").dataset.state,"enabled");
    const stored=JSON.parse(saved.get("bvn-api-composer-ai-v1"));assert.equal(stored.model,"gpt-6.2-sol");assert.equal(stored.enabled,true);
    assert.equal(JSON.stringify(stored).includes("dummy-secret"),false);assert.equal(element("ai-key").value,"");
    element("ai-settings").handlers.click();assert.equal(element("ai-key").value,"dummy-secret-for-test");
    element("ai-url").value="https://other.example/v1";element("ai-url").handlers.input();assert.equal(element("ai-key").value,"");
});

test("AI resources are included in the standalone page with the current release version",()=>{
    const html=fs.readFileSync(require.resolve("../tools/composer.html"),"utf8");
    for (const asset of ["composer-ai.js","composer-ai-ui.js"]) assert.ok(html.includes(asset+"?v="+core.demoVersion));
    assert.ok(html.indexOf('src="composer-ai.js') < html.indexOf('src="composer-ai-ui.js'));
    assert.ok(html.indexOf('src="composer-ai-ui.js') < html.indexOf('src="composer.js'));
});

test("parameterless interfaces accept omitted or null params and numeric conditions preserve meaning",()=>{
    const p=plan();delete p.nodes[0].params;p.nodes[1].params=null;
    delete p.blocks[0].conditions[0].value;p.blocks[0].conditions[1].value=20;
    const result=ai.buildPlan(core,p,"3.8开发","character");
    assert.match(core.generate(result.graph).code,/getEnergy\(\) >= 20/);
    p.nodes[0].params=[];assert.ok(ai.buildPlan(core,p,"3.8开发","character").graph);
    p.nodes[0].params=[1];assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/ground.*params/);
});

test("DeepSeek official and hosted DeepSeek use different switches under the same chat protocol",()=>{
    const direct=ai.config({provider:"deepseek",model:"deepseek-chat",effort:"none"});
    assert.equal(direct.provider,"custom");assert.equal(ai.compatibility(direct),"deepseek");
    assert.deepEqual(ai.body(direct,"s","u",100).thinking,{type:"disabled"});
    const hosted=ai.config({provider:"custom",baseUrl:"https://api.siliconflow.cn/v1",model:"deepseek-ai/DeepSeek-V3.2",protocol:"chat",effort:"none"});
    assert.equal(ai.compatibility(hosted),"siliconflow");
    const body=ai.body(hosted,"s","u",100);assert.equal(body.enable_thinking,false);assert.equal(body.thinking,undefined);
    assert.deepEqual(ai.efforts({...hosted,model:"deepseek-ai/DeepSeek-V3"}),["auto"]);
});

test("typed normalization accepts equivalent Boolean comparisons and JSON configurations without accepting code",()=>{
    const p=plan();p.blocks[0].conditions[0]={node:"ground",operator:"==",value:false};
    assert.match(core.generate(ai.buildPlan(core,p,"3.8开发","character").graph).code,/!\(parent\.\$fighter_ctrler\.getSelf\(\)\.isInAir\)/);
    const fire={nodes:[{id:"shot",key:"fire",params:{mcName:"bullet1",params:{hits:3}}}],blocks:[],order:["shot"],unresolved:[]};
    assert.match(core.generate(ai.buildPlan(core,fire,"3.8开发","character").graph).code,/"hits":3/);
    const malicious=JSON.parse('{"__proto__":{"polluted":true}}');p.nodes[0].params=malicious;
    assert.throws(()=>ai.buildPlan(core,p,"3.8开发","character"),/未知或无效参数/);assert.equal({}.polluted,undefined);
});

test("GenerateContent discovery, authentication, request shape and output are native Gemini",async()=>{
    const settings=ai.config({provider:"gemini",model:"gemini-2.5-flash",effort:"none"});
    let page=0;
    const list=await ai.models(settings,"dummy-key",{fetch:async(url,options)=>{
        assert.equal(options.headers["x-goog-api-key"],"dummy-key");assert.equal(options.headers.Authorization,undefined);
        page++;
        if (page === 1) return new Response(JSON.stringify({models:[{name:"models/gemini-2.5-flash",supportedGenerationMethods:["generateContent"]}],nextPageToken:"next"}));
        assert.match(url,/pageToken=next/);
        return new Response(JSON.stringify({models:[{name:"models/embed",supportedGenerationMethods:["embedContent"]}]}));
    }});
    assert.equal(list.length,1);assert.equal(list[0].id,"gemini-2.5-flash");
    let usage;
    const output=await ai.complete(settings,"dummy-key","system","user",{onUsage:value=>usage=value,fetch:async(url,options)=>{
        assert.equal(url,"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
        const sent=JSON.parse(options.body);assert.equal(sent.generationConfig.thinkingConfig.thinkingBudget,0);assert.equal(sent.generationConfig.responseMimeType,"application/json");
        assert.deepEqual(sent.systemInstruction.parts,[{text:"system"}]);
        return new Response(JSON.stringify({candidates:[{finishReason:"STOP",content:{parts:[{text:'{"ok":true}'}]}}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:10}}));
    }});
    assert.deepEqual(output,{ok:true});assert.equal(usage.input,100);
    assert.throws(()=>ai.readOutput({candidates:[{finishReason:"MAX_TOKENS"}]},"gemini"),/长度/);
});

test("compact prompts cut the interface payload without dropping available interfaces or fields",()=>{
    const parsed=JSON.parse(ai.prompt(core,"a","3.8开发","character",core.fromText("a"),[]).user);
    const available=core.specs.filter(s=>core.available(s,"3.8开发")&&core.usable(s,"character","3.8开发")&&s.kind!=="root"&&(s.kind!=="object"||s.fields.length||s.manualPath));
    assert.equal(parsed.interfaces.length,available.length);
    assert.ok(JSON.stringify(parsed.interfaces).length < 35000);
    const jump=parsed.interfaces.find(s=>s.api==="gotoAndPlay");assert.equal(jump.arguments.name.type,"String");
    assert.equal("owner" in jump,false);assert.equal("kind" in jump,false);
    assert.equal(parsed.interfaces.some(s=>s.api==="getMcCtrl"),false);
    assert.equal("staticNotes" in parsed,false);
});

test("failed parsing stays at the input and preserves the workbench; only successful completion scrolls",async()=>{
    const source=fs.readFileSync(require.resolve("../tools/composer.js"),"utf8");
    const fragment=source.slice(source.indexOf("    async function extract()"),source.indexOf("    function position(event)"));
    const nodes=new Map();function element(id) {if (!nodes.has(id)) nodes.set(id,{value:"",appendChild(){},replaceChildren(){}});return nodes.get(id);}
    let scrolls=0,enabled=false,supplemented=null;
    const settings={cancel(){},enabled:()=>enabled,ready:()=>true,run:async()=>supplemented};
    const context={api:core,graph:core.createGraph(),extractionId:0,$:element,window:{BvnComposerAI:ai,BvnComposerAISettings:settings},el:()=>({appendChild(){},replaceChildren(){}}),button:()=>({}),showMatches(){},appendUsage(){},arrange(){},selected:null,notify(){},setIntroMode(){},moveToWorkspace(){scrolls++;}};
    context.update=fn=>fn();vm.runInNewContext(fragment,context);
    const before=JSON.stringify(context.graph);element("prompt").value="双脚仍在地面且体力足够支付20点时，切到“招2”继续播放";
    await context.extract();assert.equal(scrolls,0);assert.equal(JSON.stringify(context.graph),before);
    enabled=true;supplemented={graph:null,notes:["待确认"]};await context.extract();assert.equal(scrolls,0);
    supplemented=ai.buildPlan(core,plan(),"3.8开发","character");await context.extract();assert.equal(scrolls,1);
    element("prompt").value="耐力不少于20时，跳到“招2”并播放";await context.extract();assert.equal(scrolls,2);
});

test("semantic conditions compile locally without asking the model to supply a graph or spend checked resources",()=>{
    const intent={steps:[{if:[{api:"isInAir",op:"falsy"},{api:"getEnergy",op:">=",value:20,join:"and"}],then:[{api:"gotoAndPlay",args:{name:"招2"}}]}],unresolved:[]};
    const result=ai.buildPlan(core,intent,"3.8开发","character");
    const code=core.generate(result.graph).code;
    assert.match(code,/getEnergy\(\) >= 20/);assert.match(code,/!\(.*isInAir\)/);assert.match(code,/\$mc_ctrler.gotoAndPlay\("招2"\)/);
    assert.doesNotMatch(code,/loseEnergy|setDisabled|getHitVO|getTargetSP/);
    assert.deepEqual(result.graph.nodes.filter(n=>core.catalog[n.key].kind==="action").map(n=>n.key),["gotoAndPlay"]);
    let energy=20,inAir=false,calls=0;
    const context={parent:{$fighter_ctrler:{getSelf:()=>({isInAir:inAir}),getEnergy:()=>energy},$mc_ctrler:{gotoAndPlay:()=>calls++}}};
    vm.runInNewContext(code,context);assert.equal(calls,1);
    energy=19;vm.runInNewContext(code,context);assert.equal(calls,1);
    energy=20;inAir=true;vm.runInNewContext(code,context);assert.equal(calls,1);
});

test("semantic receiver selectors configure the requested instance and otherwise let the program build paths",()=>{
    const intent={steps:[{api:"setPower",args:{value:80},from:{api:"getHitVO",args:{id:"k1"}}},{api:"setPower",args:{value:40},from:{api:"getHitVO",args:{id:"k2"}}}],unresolved:[]};
    const code=core.generate(ai.buildPlan(core,intent,"3.8开发","character").graph).code;
    assert.match(code,/getHitVO\("k1"\).power = 80/);assert.match(code,/getHitVO\("k2"\).power = 40/);
});

test("semantic per-frame steps support nested conditions and keep stop conditions separate",()=>{
    const intent={steps:[{eachFrame:{frames:-1},until:[{api:"hp",op:"<=",value:0}],steps:[{if:[{api:"energy",op:"<",value:20}],then:[{api:"clearBinding",args:{action:"zhao2"}}]}]}],unresolved:[]};
    const graph=ai.buildPlan(core,intent,"3.0","character").graph;
    const frame=graph.bubbles.find(b=>b.kind==="frame"),inner=graph.bubbles.find(b=>b.kind==="condition");
    assert.equal(inner.container,frame.id);assert.equal(core.nodeById(graph,frame.condition).key,"hp");assert.equal(core.nodeById(graph,inner.condition).key,"energy");
    assert.match(core.generate(graph).code,/delayCall/);
});

test("semantic disable conditions still use a native single registration",()=>{
    const intent={steps:[{if:[{api:"hp",op:"<",value:100}],then:[{api:"setDisabled",args:{action:"zhao2",condition:"true"}}]}],unresolved:[]};
    const code=core.generate(ai.buildPlan(core,intent,"3.8开发","character").graph).code;
    assert.match(code,/setDisabled\("zhao2", function\(\):Boolean/);assert.doesNotMatch(code,/addRenderFunc|if \(/);
});

test("semantic steps reject metadata in arguments, irrelevant graph fields and unknown operations",()=>{
    assert.throws(()=>ai.buildPlan(core,{steps:[{api:"gotoAndPlay",args:{name:"招2",owner:"FighterMcCtrler"}}],unresolved:[]},"3.8开发","character"),/未知或无效参数/);
    assert.throws(()=>ai.buildPlan(core,{steps:[{api:"getMcCtrl"}],unresolved:[]},"3.8开发","character"),/对象选择器/);
    assert.throws(()=>ai.buildPlan(core,{steps:[{if:[{api:"hp",op:"<",value:50}],then:[{api:"shine"}],finally:[{api:"addHp"}]}],unresolved:[]},"3.8开发","character"),/未支持/);
    assert.throws(()=>ai.buildPlan(core,{steps:[{api:"madeUpAction"}],unresolved:[]},"3.8开发","character"),/接口类型/);
});

test("the reported unresolved object shape stays pending and never salvages an invalid model graph",()=>{
    const reported={nodes:[{id:"n1",key:"getMcCtrl",params:{},source:""},{id:"n2",key:"getFighterMc",params:{name:"n1",owner:"FighterCtrler",kind:"object",output:"FighterMcCtrler"},source:"n1"}],blocks:[],order:["n1","n2"],unresolved:[{desc:"体力足够支付20点的条件未解决",reason:"没有 checkEnergyCost 接口，需要人工比较 getEnergy >= 20",status:"partial"}]};
    const result=ai.buildPlan(core,reported,"3.8开发","character");assert.equal(result.graph,null);assert.match(result.notes[0],/checkEnergyCost/);
    reported.unresolved=[];assert.throws(()=>ai.buildPlan(core,reported,"3.8开发","character"),/未知或无效参数/);
});

test("the model is taught platform comparisons without being fed static-parser refusal messages",()=>{
    const text="血量不足300时闪白光",result=core.fromText(text);result.notes=["POISON_STATIC_PARSER_LIMITATION"];
    const prompt=ai.prompt(core,text,"3.8开发","character",result,[]);
    assert.equal(prompt.user.includes("POISON_STATIC_PARSER_LIMITATION"),false);
    assert.match(prompt.system,/平台内建能力/);assert.match(prompt.system,/"steps"/);assert.match(prompt.system,/"if"/);
    assert.doesNotMatch(prompt.system,/"nodes"|"source"|"blocks"/);
});

test("the reported read-only result is rejected as incomplete despite being valid code",()=>{
    const text="双脚仍在地面且体力足够支付20点时，切到“招2”继续播放",baseline=core.fromText(text);
    const wrong=ai.buildPlan(core,{steps:[{api:"isInAir"},{api:"isMoving"},{api:"getEnergy"}],unresolved:[]},"3.8开发","character");
    assert.equal(core.generate(wrong.graph).errors.length,0);
    const gaps=ai.coverage(core,text,baseline,wrong.graph);
    assert.ok(gaps.some(s=>s.includes("缺少执行操作")));assert.ok(gaps.some(s=>s.includes("缺少判断条件")));assert.ok(gaps.some(s=>s.includes("数值判断")));
    const missingResource=ai.buildPlan(core,{steps:[{if:[{api:"isInAir",op:"falsy"}],then:[{api:"gotoAndPlay",args:{name:"招2"}}]}],unresolved:[]},"3.8开发","character");
    assert.ok(ai.coverage(core,text,baseline,missingResource.graph).some(s=>s.includes("耐力的数值判断")));
    assert.deepEqual(ai.coverage(core,text,baseline,ai.buildPlan(core,plan(),"3.8开发","character").graph),[]);
});

test("coverage preserves recognized action counts and literals while allowing pure read requests",()=>{
    const text="先闪白光，然后恢复100点血量",baseline=core.fromText(text);
    const incomplete=ai.buildPlan(core,{steps:[{api:"shine"}],unresolved:[]},"3.8开发","character");
    assert.ok(ai.coverage(core,text,baseline,incomplete.graph).some(s=>s.includes("缺少执行操作")));
    const jumpText="耐力不少于20时，跳到“招2”并播放",p=plan();p.nodes[2].params.name="招3";
    assert.ok(ai.coverage(core,jumpText,core.fromText(jumpText),ai.buildPlan(core,p,"3.8开发","character").graph).some(s=>s.includes("帧标签与原文不一致")));
    const read=core.fromText("读取当前耐力");assert.deepEqual(ai.coverage(core,"读取当前耐力",read,read.graph),[]);
    for(const actor of Object.keys(core.actors))for(const version of core.versions)for(const [name,text] of core.demoExamples(actor,version)) {
        const result=core.fromText(text,version,actor);assert.deepEqual(ai.coverage(core,text,result,result.graph),[],actor+version+name);
    }
});

test("flat condition joins preserve the original AND and OR even when a predicate was not parsed statically",()=>{
    const text="生命值低于满血的三成或耐力不足15点期间，禁用↓j",baseline=core.fromText(text);
    function make(join) {
        return ai.buildPlan(core,{steps:[{if:[{api:"hpRate",op:"<",value:.3},{api:"getEnergy",op:"<",value:15,join}],then:[{api:"setDisabled",args:{action:"skill1",condition:"true"}}]}],unresolved:[]},"3.8开发","character");
    }
    const wrong=make("and");ai.reconcile(core,text,baseline,wrong);
    assert.ok(ai.coverage(core,text,baseline,wrong.graph).some(s=>s.includes("应使用“或”")));
    assert.match(core.generate(wrong.graph).code,/hpRate < 0.3 &&/);
    assert.deepEqual(ai.coverage(core,text,baseline,make("or").graph),[]);
    const andText="血量低于500且耐力低于15时闪白光",andBaseline=core.fromText(andText);
    const orPlan={steps:[{if:[{api:"hp",op:"<",value:500},{api:"getEnergy",op:"<",value:15,join:"or"}],then:[{api:"shine"}]}],unresolved:[]};
    assert.ok(ai.coverage(core,andText,andBaseline,ai.buildPlan(core,orPlan,"3.8开发","character").graph).some(s=>s.includes("应使用“且”")));
    const literal='血量低于500时跳到“且或并且”',literalGraph=core.fromText(literal);
    assert.deepEqual(ai.coverage(core,literal,literalGraph,literalGraph.graph),[]);
    const mixed="血量低于500或耐力低于15且在地面时闪白光",mixedBaseline=core.fromText(mixed);
    const plan={steps:[{if:[{api:"hp",op:"<",value:500},{api:"getEnergy",op:"<",value:15,join:"and"},{api:"isInAir",op:"falsy",join:"or"}],then:[{api:"shine"}]}],unresolved:[]};
    assert.equal(ai.coverage(core,mixed,mixedBaseline,ai.buildPlan(core,plan,"3.8开发","character").graph).filter(s=>s.includes("条件连接关系")).length,2);
});

test("settings retain the actual request configuration on semantic failure without applying the rejected graph",async()=>{
    const text="生命值低于满血的三成或耐力不足15点期间，禁用↓j";
    const wrong={steps:[{if:[{api:"hpRate",op:"<",value:.3},{api:"getEnergy",op:"<",value:15,join:"and"}],then:[{api:"setDisabled",args:{action:"skill1",condition:"true"}}]}],unresolved:[]};
    let calls=0;
    const clientAI={...ai,complete:(settings,key,system,user,options)=>ai.complete(settings,key,system,user,{...options,fetch:async()=>{
        calls++;return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(wrong)}}],usage:{prompt_tokens:100,completion_tokens:40}}));
    }})};
    const page=settingsPage(new Map(),new Map(),false,clientAI);page.client.open();
    page.element("ai-model").value="Qwen/Qwen3.5-27B";page.element("ai-key").value="dummy-key";page.element("ai-enabled").checked=true;page.element("ai-effort").value="on";
    page.element("ai-form").handlers.submit({preventDefault(){}});
    const baseline=core.fromText(text),snapshot=JSON.stringify(baseline.graph);
    await assert.rejects(()=>page.client.run(text,"3.8开发","character",baseline),error=>{
        assert.match(error.message,/应使用“或”/);assert.equal(error.request.effort,"on");assert.deepEqual(error.request.parameters,["enable_thinking=true"]);
        assert.equal(error.request.diagnostic.stage,"done");assert.equal(error.request.diagnostic.httpStatus,200);
        assert.ok(error.request.elapsedMs >= 0);assert.equal(error.usage.input,100);assert.deepEqual(error.modelPlan,wrong);return true;
    });
    assert.equal(calls,1);assert.equal(JSON.stringify(baseline.graph),snapshot);
});

test("the result line reports request parameters independently of token counts",()=>{
    const source=fs.readFileSync(require.resolve("../tools/composer.js"),"utf8"),start=source.indexOf("    function appendUsage(");
    const context={el:(tag,className,text)=>({tag,className,text})};
    vm.runInNewContext(source.slice(start,source.indexOf("    function showMatches(",start)),context);
    const items=[],host={appendChild:item=>items.push(item)};
    context.appendUsage(host,null,{model:"Qwen/Qwen3.5-27B",effort:"on",parameters:["enable_thinking=true"],elapsedMs:1250});
    assert.match(items[0].text,/Qwen3.5-27B.*请求开启推理.*enable_thinking=true.*1.3 秒/);
    items.length=0;context.appendUsage(host,null,{model:"test",effort:"auto",parameters:[],elapsedMs:200});
    assert.match(items[0].text,/服务商默认.*未发送推理参数/);
});

test("AI input retains positive fragments without reintroducing refusal messages or object-path metadata",()=>{
    const text="双脚仍在地面且体力足够支付20点时，切到“招2”继续播放";
    const data=JSON.parse(ai.prompt(core,text,"3.8开发","character",core.fromText(text),[]).user);
    assert.deepEqual(data.recognizedFragments.steps.find(s=>s.api === "gotoAndPlay").args,{name:"招2"});
    assert.ok(data.recognizedFragments.conditions.some(s=>s.api === "isInAir" && s.op === "falsy"));
    assert.equal(JSON.stringify(data).includes("请拆开配置"),false);
});

test("all recognized fragments follow their selected signature, including stale graph parameters",()=>{
    for(const actor of Object.keys(core.actors))for(const version of core.versions)for(const [name,text] of core.demoExamples(actor,version)) {
        const result=core.fromText(text,version,actor);
        result.graph.nodes.forEach(n=>{n.params.staleArgument="do not copy";});
        const data=JSON.parse(ai.prompt(core,text,version,actor,result,[]).user);
        for(const fragment of [...data.recognizedFragments.steps,...data.recognizedFragments.conditions]) {
            const keys=core.catalog[fragment.api].fields.map(f=>f.key);
            assert.ok(Object.keys(fragment.args).every(key=>keys.includes(key)),actor+version+name+fragment.api);
            for(let from=fragment.from;from;from=from.from) assert.ok(Object.keys(from.args).every(key=>core.catalog[from.api].fields.some(f=>f.key === key)));
        }
    }
});

test("the interface contract includes units, legal action identifiers, receiver selectors and arithmetic effects",()=>{
    const text='仅当耐力落在20到50之间（含20、不含50），把攻击ID“k7”的攻击力加12';
    const data=JSON.parse(ai.prompt(core,text,"3.8开发","character",core.fromText(text),[]).user);
    const byKey=key=>data.interfaces.find(row=>row.api === key);
    assert.deepEqual(byKey("hpRate").quantity,{resource:"hp",basis:"ratio"});assert.match(byKey("hpRate").hint,/除以 100/);
    assert.deepEqual(byKey("mainenergyMax").quantity,{resource:"energy",basis:"maximum"});
    assert.equal(byKey("setPower").effect,"=");assert.equal(byKey("addPower").effect,"+=");assert.equal(byKey("subtractPower").effect,"-=");
    assert.equal(byKey("addPower").receiver,"getHitVO");
    assert.deepEqual(data.recognizedFragments.steps.find(row=>row.api === "addPower").from,{api:"getHitVO",args:{id:"k7"}});
    assert.ok(byKey("setDisabled").arguments.action.choices.includes("skill1"));assert.equal(byKey("setDisabled").arguments.action.choices.includes("down"),false);
    assert.equal(data.actionAliases["↓j"],"skill1");assert.equal(data.actionAliases.SU,"zhao2");
    assert.match(byKey("moveToTarget").hint,/相对偏移/);
});

test("capacity checks not requested by the user cannot be accepted as successful generation",()=>{
    const text='角色没有腾空且耐力能支付35点时，转入“追击 B”继续播放',baseline=core.fromText(text);
    const plan={steps:[{if:[{api:"isInAir",op:"falsy"},{api:"mainenergyMax",op:"!=",value:0},{api:"getEnergy",op:">=",value:35}],then:[{api:"gotoAndPlay",args:{name:"追击 B"}}]}],unresolved:[]};
    const result=ai.buildPlan(core,plan,"3.8开发","character");
    assert.ok(ai.coverage(core,text,baseline,result.graph).some(s=>s.includes("原文未要求的上限条件")));
    for(const explicit of ["最大耐力不为0时跳到“追击 B”","耐力上限不为0时跳到“追击 B”","energyMax不为0时跳到“追击 B”"]) {
        assert.equal(ai.coverage(core,explicit,core.fromText(explicit),result.graph).some(s=>s.includes("原文未要求的上限条件")),false);
    }
});

test("omitted unresolved is structurally harmless but invalid identifiers and orphan receiver steps remain rejected",()=>{
    const reported={steps:[{if:[{api:"hp",op:"<",value:30},{api:"energy",op:"<",value:15,join:"or"}],then:[{api:"setDisabled",args:{action:"down",condition:"true"}}]}]};
    assert.throws(()=>ai.buildPlan(core,reported,"3.8开发","character"),/有效的动作标识/);
    assert.ok(ai.buildPlan(core,{steps:[{api:"shine"}]},"3.8开发","character").graph);
    assert.throws(()=>ai.buildPlan(core,{steps:[],unresolved:null},"3.8开发","character"),/待配置列表/);
    const orphan={steps:[{if:[{api:"getEnergy",op:"between",value:{lower:20,upper:50,includeLower:true,includeUpper:false}}],then:[{api:"getHitVO",args:{id:"k7"}},{api:"getHitVO",args:{id:"k7"}},{api:"setPower",args:{value:12}}]}],unresolved:[]};
    assert.throws(()=>ai.buildPlan(core,orphan,"3.8开发","character"),/对象选择器.*from/);
});

test("matching echoed settings are harmless metadata while conflicting or invented top-level settings stay rejected",()=>{
    const text='角色没有腾空且耐力能支付35点时，转入“追击 B”继续播放';
    const reported={steps:[{if:[{api:"isInAir",op:"falsy"},{api:"getEnergy",op:">=",value:35}],then:[{api:"gotoAndPlay",args:{name:"追击 B"}}]}],unresolved:[],version:"3.8开发",actor:"character"};
    const before=JSON.stringify(reported),result=ai.buildPlan(core,reported,"3.8开发","character");
    assert.equal(JSON.stringify(reported),before);assert.equal(result.graph.version,"3.8开发");assert.equal(result.graph.actor,"character");
    assert.deepEqual(ai.coverage(core,text,core.fromText(text),result.graph),[]);
    const expected={...reported};delete expected.version;delete expected.actor;
    assert.equal(core.generate(result.graph).code,core.generate(ai.buildPlan(core,expected,"3.8开发","character").graph).code);
    for(const metadata of [{version:"3.0"},{actor:"attacker"},{version:null},{temperature:0}]) {
        assert.throws(()=>ai.buildPlan(core,{...reported,...metadata},"3.8开发","character"),/与当前设置不一致|未支持的字段/);
    }
});

test("condition errors identify wrapped predicates and standalone connectors without deleting or flattening them",()=>{
    const malformed={steps:[{eachFrame:{frames:-1,scheduler:"auto",renderMode:"animation"},until:[],steps:[{if:[{api:"hpRate",op:"<",value:.3},{join:"or",value:{api:"getEnergy",op:"<",value:15}},{join:"and",value:{api:"getCurAction",op:"==",value:"skill1"}}],then:[{api:"setDisabled",args:{action:"skill1",condition:"true"}}]}]}],unresolved:[]};
    const copy=JSON.stringify(malformed);
    assert.throws(()=>ai.buildPlan(core,malformed,"3.8开发","character"),/steps\[0\]\.steps\[0\]\.if\[1\].*同一层/);
    assert.equal(JSON.stringify(malformed),copy);
    const range={api:"getEnergy",op:"between",value:{lower:20,upper:50,includeLower:true,includeUpper:false}};
    const duplicate={steps:[{if:[range,range,{join:"and"}],then:[{api:"addPower",args:{value:12},from:{api:"getHitVO",args:{id:"k7"}}}]}],unresolved:[]};
    const before=JSON.stringify(duplicate);
    assert.throws(()=>ai.buildPlan(core,duplicate,"3.8开发","character"),/steps\[0\]\.if\[2\].*只有连接符/);
    assert.equal(JSON.stringify(duplicate),before);
    assert.throws(()=>ai.buildPlan(core,{steps:[{if:[{api:"hp",value:100}],then:[]}]},"3.8开发","character"),/if\[0\].*缺少比较符/);
});

test("timeouts identify the response deadline and do not retry a billable request",async()=>{
    let calls=0;
    await assert.rejects(()=>ai.complete(settings,"dummy-key","system","request",{timeout:5,fetch:async(url,options)=>{
        calls++;return new Promise((resolve,reject)=>options.signal.addEventListener("abort",()=>reject(new Error("aborted")),{once:true}));
    }}),/请求超时.*完整响应.*未自动重试/);
    assert.equal(calls,1);
});

test("request diagnostics distinguish header wait, body reading and completed transport",async()=>{
    const settings=ai.config({provider:"siliconflow",model:"Qwen/Qwen3.5-27B",effort:"none"});
    const updates=[];
    await ai.complete(settings,"dummy-key","system","request",{onDiagnostic:info=>updates.push(info),fetch:async()=>new Response(new ReadableStream({start(controller){setTimeout(()=>{controller.enqueue(new TextEncoder().encode('{"choices":[{"message":{"content":"{\\"ok\\":true}"}}]}'));controller.close();},5);}}),{headers:{"x-siliconcloud-trace-id":"trace-demo-1"}})});
    assert.deepEqual(updates.map(d=>d.stage),["headers","body","done"]);
    assert.equal(updates[0].headersMs,null);assert.equal(updates[1].bodyMs,null);assert.equal(updates[2].result,"success");
    assert.equal(updates[2].httpStatus,200);assert.equal(updates[2].requestId,"trace-demo-1");assert.equal(updates[2].requestIdHeader,"x-siliconcloud-trace-id");
    assert.ok(updates[2].bodyMs >= 0);assert.ok(updates[2].elapsedMs >= updates[2].headersMs+updates[2].bodyMs);
    assert.equal(updates[0].stage,"headers");assert.doesNotMatch(JSON.stringify(updates),/dummy-key|system|request"|Authorization/);
});

test("header and body timeouts retain different phases and do not retry",async()=>{
    const settings=ai.config({provider:"siliconflow",model:"Qwen/Qwen3.5-27B",effort:"none"});
    for(const phase of ["headers","body"]) {
        let diagnostic,calls=0;
        await assert.rejects(()=>ai.complete(settings,"dummy-key","system","request",{timeout:5,onDiagnostic:info=>diagnostic=info,fetch:async(url,options)=>{
            calls++;
            const blocked=()=>new Promise((resolve,reject)=>options.signal.addEventListener("abort",()=>reject(new DOMException("aborted","AbortError")),{once:true}));
            return phase === "headers" ? blocked() : {ok:true,status:200,headers:new Headers({"x-siliconcloud-trace-id":"trace-body-timeout"}),text:blocked};
        }}),phase === "headers" ? /尚未收到响应头/ : /正文尚未读取完成/);
        assert.equal(diagnostic.stage,phase);assert.equal(diagnostic.result,"timeout");assert.equal(diagnostic.bodyMs,null);assert.equal(calls,1);
        if (phase === "body") {assert.ok(diagnostic.headersMs >= 0);assert.equal(diagnostic.requestId,"trace-body-timeout");}
        else {assert.equal(diagnostic.headersMs,null);assert.equal(diagnostic.httpStatus,null);assert.equal(diagnostic.requestId,null);}
    }
});

test("HTTP and parse failures preserve readable trace IDs without exposing provider bodies or arbitrary headers",async()=>{
    const settings=ai.config({provider:"siliconflow",model:"Qwen/Qwen3.5-27B",effort:"none"});
    let diagnostic;
    await assert.rejects(()=>ai.complete(settings,"dummy-key","s","u",{onDiagnostic:info=>diagnostic=info,fetch:async()=>({ok:false,status:503,headers:new Headers({"x-request-id":"req-http-503","x-private":"private-data"}),text:()=>{throw new Error("must not read provider error body");}})}),/HTTP 503/);
    assert.equal(diagnostic.stage,"status");assert.equal(diagnostic.httpStatus,503);assert.equal(diagnostic.requestId,"req-http-503");assert.equal(diagnostic.bodyMs,null);
    assert.doesNotMatch(JSON.stringify(diagnostic),/private-data|dummy-key/);
    await assert.rejects(()=>ai.complete(settings,"dummy-key","s","u",{onDiagnostic:info=>diagnostic=info,fetch:async()=>new Response("invalid-json",{headers:{"request-id":"req-invalid-json"}})}),/不是 JSON/);
    assert.equal(diagnostic.stage,"parse");assert.equal(diagnostic.result,"error");assert.ok(diagnostic.bodyMs >= 0);assert.equal(diagnostic.requestId,"req-invalid-json");
    for(const headers of [{},{"x-request-id":"dummy-key"},{"x-request-id":"<invalid-id>"}]) {
        await ai.complete(settings,"dummy-key","s","u",{onDiagnostic:info=>diagnostic=info,fetch:async()=>new Response('{"choices":[{"message":{"content":"{}"}}]}',{headers})});
        assert.equal(diagnostic.requestId,null);
    }
});

test("diagnostic rendering clearly separates a header timeout from an unfinished response body",()=>{
    const source=fs.readFileSync(require.resolve("../tools/composer.js"),"utf8"),start=source.indexOf("    function appendUsage(");
    const context={el:(tag,className,text)=>({tag,className,text:text || "",children:[],appendChild(child){this.children.push(child);}})};
    vm.runInNewContext(source.slice(start,source.indexOf("    function showMatches(",start)),context);
    function render(diagnostic) {
        const children=[],host={appendChild:child=>children.push(child)};
        context.appendUsage(host,null,{model:"test",effort:"none",parameters:["enable_thinking=false"],elapsedMs:45000,diagnostic});
        const all=items=>items.map(item=>item.text+all(item.children)).join(" ");return all(children);
    }
    const base={elapsedMs:45000,headersMs:null,bodyMs:null,httpStatus:null,requestId:null};
    assert.match(render(base),/尚未收到响应头.*等待响应头：45.0 秒.*读取正文：未开始.*尚未收到服务商请求编号/);
    const body=render({...base,stage:"body",headersMs:1000,httpStatus:200,requestId:"trace-waiting-body",requestIdHeader:"x-siliconcloud-trace-id"});
    assert.match(body,/正文尚未读取完成.*响应头：1.0 秒.*已等待 44.0 秒.*trace-waiting-body/);
    assert.match(render({...base,stage:"done",headersMs:100,bodyMs:50,httpStatus:200}),/响应头 0.1 秒.*正文 0.1 秒.*未返回，或浏览器未开放读取/);
});

test("coverage preserves operation amounts and parameterized receiver identities without repairing model mistakes",()=>{
    const text='攻击ID“k7”的攻击力加12',baseline=core.fromText(text);
    for(const [api,value,id] of [["addPower",13,"k7"],["addPower",12,"k8"],["setPower",12,"k7"]]) {
        const result=ai.buildPlan(core,{steps:[{api,args:{value},from:{api:"getHitVO",args:{id}}}],unresolved:[]},"3.8开发","character");
        ai.reconcile(core,text,baseline,result);
        assert.ok(ai.coverage(core,text,baseline,result.graph).length);assert.equal(result.notes.length,0);
        assert.equal(result.graph.nodes.find(n=>n.key === api).params.value,value);assert.equal(result.graph.nodes.find(n=>n.key === "getHitVO").params.id,id);
    }
});

test("the reported wrapper defaults preserve both conditions and execute only at the resource threshold",()=>{
    const text="双脚仍在地面且体力足够支付20点时，切到“招2”继续播放";
    for(const emptyValue of [false,true]) {
        const intent={steps:[{if:[{api:"isInAir",op:"falsy",...(emptyValue?{value:""}:{})},{api:"energy",op:">=",value:20}],then:[{api:"gotoAndPlay",args:{name:"招2",isPlay:true,playFrame:0}}]}],unresolved:[]};
        const original=JSON.stringify(intent),draft=ai.buildPlan(core,intent,"3.8开发","character");
        assert.equal(JSON.stringify(intent),original);
        assert.deepEqual(ai.coverage(core,text,core.fromText(text),draft.graph),[]);
        assert.deepEqual(draft.graph.nodes.find(n=>n.key === "gotoAndPlay").params,{name:"招2"});
        const output=core.generate(draft.graph);assert.deepEqual(output.errors,[]);
        let energy=19,inAir=false;const calls=[];
        const context={parent:{$fighter_ctrler:{getSelf:()=>({isInAir:inAir,energy})},$mc_ctrler:{gotoAndPlay:(...args)=>calls.push(args)}}};
        vm.runInNewContext(output.code,context);assert.equal(calls.length,0);
        energy=20;vm.runInNewContext(output.code,context);assert.deepEqual(calls,[["招2"]]);
        inAir=true;vm.runInNewContext(output.code,context);assert.equal(calls.length,1);
    }
});

test("wrapper argument normalization accepts only redundant defaults and rejects conflicting behavior",()=>{
    for(const actor of Object.keys(core.actors))for(const play of [true,false]) {
        const member=play?"gotoAndPlay":"gotoAndStop",api=actor === "character" ? member : actor+member[0].toUpperCase()+member.slice(1);
        const make=args=>({steps:[{api,args:{name:"追击",...args}}],unresolved:[]});
        for(const args of [{isPlay:play,playFrame:0},{isPlay:String(play),playFrame:"0"}]) {
            const draft=ai.buildPlan(core,make(args),"3.8开发",actor);
            assert.deepEqual(draft.graph.nodes.find(n=>n.key === api).params,{name:"追击"});
        }
        for(const args of [{isPlay:!play},{playFrame:3},{playFrame:-1},{playFrame:""},{isPlay:0},{unknown:true}]) {
            assert.throws(()=>ai.buildPlan(core,make(args),"3.8开发",actor),/未知或无效参数/);
        }
    }
});

test("the reported whitespace and threshold drift are reconciled against original facts before coverage",()=>{
    const text="双脚仍在地面且体力足够支付20点时，切到“招2”继续播放",baseline=core.fromText(text);
    const intent={steps:[{if:[{api:"isInAir",op:"falsy",value:""},{api:"getEnergy",op:">",value:20}],then:[{api:"gotoAndPlay",args:{name:"招 2"}}]}],unresolved:[]};
    const original=JSON.stringify(intent),draft=ai.buildPlan(core,intent,"3.8开发","character");
    const gaps=ai.coverage(core,text,baseline,draft.graph);
    assert.ok(gaps.some(s=>s.includes("帧标签与原文不一致")));assert.ok(gaps.some(s=>s.includes("条件与原文不一致")));
    ai.reconcile(core,text,baseline,draft);assert.deepEqual(ai.coverage(core,text,baseline,draft.graph),[]);
    assert.equal(draft.notes.length,2);assert.equal(JSON.stringify(intent),original);
    let energy=19,inAir=false;const calls=[];
    const context={parent:{$fighter_ctrler:{getSelf:()=>({isInAir:inAir}),getEnergy:()=>energy},$mc_ctrler:{gotoAndPlay:label=>calls.push(label)}}};
    const code=core.generate(draft.graph).code;
    vm.runInNewContext(code,context);assert.equal(calls.length,0);
    energy=20;vm.runInNewContext(code,context);assert.deepEqual(calls,["招2"]);
    inAir=true;vm.runInNewContext(code,context);assert.equal(calls.length,1);
});

test("literal reconciliation preserves meaningful spaces and never guesses ambiguous or different names",()=>{
    function result(text,name) {
        const baseline=core.fromText(text),draft=ai.buildPlan(core,{steps:[{api:"gotoAndPlay",args:{name}}],unresolved:[]},"3.8开发","character");
        ai.reconcile(core,text,baseline,draft);return {baseline,draft};
    }
    const text='跳到“招 2”',restored=result(text,"招2");
    assert.equal(restored.draft.graph.nodes.find(n=>n.key === "gotoAndPlay").params.name,"招 2");
    for(const [input,name] of [['跳到“招2”',"招3"],['跳到“A B”然后跳到“AB”',"A  B"]]) {
        const {baseline,draft}=result(input,name);
        assert.equal(draft.graph.nodes.find(n=>n.key === "gotoAndPlay").params.name,name);
        assert.ok(ai.coverage(core,input,baseline,draft.graph).some(s=>s.includes("帧标签与原文不一致")));
    }
});

test("numeric reconciliation only restores a unique original bound, never a changed amount or direction",()=>{
    for(const [text,op,value,expected] of [["耐力大于20时闪白光",">=",20,">"],["血量不足100时闪白光","<=",100,"<"],["耐力至少20时闪白光","<",20,"<"],["耐力至少20时闪白光",">",30,">"]]) {
        const api=text.startsWith("血量")?"hp":"getEnergy",baseline=core.fromText(text);
        const draft=ai.buildPlan(core,{steps:[{if:[{api,op,value}],then:[{api:"shine"}]}],unresolved:[]},"3.8开发","character");
        ai.reconcile(core,text,baseline,draft);
        assert.equal(core.conditionsOf(draft.graph.bubbles[0])[0].operator,expected);
        assert.equal(ai.coverage(core,text,baseline,draft.graph).length,op === "<" || value === 30 ? 1 : 0);
    }
    const text="耐力至少20且耐力小于50时闪白光",baseline=core.fromText(text);
    const draft=ai.buildPlan(core,{steps:[{if:[{api:"getEnergy",op:">",value:20},{api:"getEnergy",op:"<=",value:50}],then:[{api:"shine"}]}],unresolved:[]},"3.8开发","character");
    ai.reconcile(core,text,baseline,draft);assert.equal(draft.notes.length,0);assert.equal(ai.coverage(core,text,baseline,draft.graph).length,2);
});

test("Key stays memory-only by default and survives reload only after explicit session opt-in",()=>{
    const local=new Map(),session=new Map(),first=settingsPage(local,session);
    function save(page,remember) {
        page.client.open();page.element("ai-model").value="Qwen/Qwen3.5-9B";page.element("ai-key").value="dummy-session-key";page.element("ai-enabled").checked=true;page.element("ai-remember-key").checked=remember;page.element("ai-form").handlers.submit({preventDefault(){}});
    }
    save(first,false);assert.equal(first.client.ready(),true);assert.equal(session.size,0);assert.equal(settingsPage(local,session).client.ready(),false);
    const remembered=settingsPage(local,session);save(remembered,true);
    assert.equal(session.size,1);assert.equal([...local.values()].join("").includes("dummy-session-key"),false);
    const restored=settingsPage(local,session);assert.equal(restored.client.ready(),true);restored.client.open();assert.equal(restored.element("ai-remember-key").checked,true);assert.equal(restored.element("ai-key").value,"dummy-session-key");
    restored.element("ai-remember-key").checked=false;restored.element("ai-form").handlers.submit({preventDefault(){}});
    assert.equal(session.size,0);assert.equal(restored.client.ready(),true);assert.equal(settingsPage(local,session).client.ready(),false);
});

test("backdrop dismissal discards unsaved edits and never closes a drag that started inside the form",()=>{
    const page=settingsPage(),dialog=page.element("ai-dialog"),body=page.element("ai-form-body"),field=page.element("ai-model");
    dialog.getBoundingClientRect=()=>({left:100,top:50,right:600,bottom:650});
    body.scrollTop=120;page.client.open();assert.equal(body.scrollTop,0);
    const inside={target:field,clientX:200,clientY:150,button:0},outside={target:dialog,clientX:50,clientY:100,button:0},padding={target:dialog,clientX:120,clientY:60,button:0};
    dialog.handlers.pointerdown(inside);dialog.handlers.click(inside);assert.equal(dialog.open,true);
    dialog.handlers.pointerdown(inside);dialog.handlers.click(outside);assert.equal(dialog.open,true);
    dialog.handlers.pointerdown(padding);dialog.handlers.click(padding);assert.equal(dialog.open,true);
    field.value="unsaved-model";page.element("ai-key").value="dummy-unsaved-key";
    dialog.handlers.pointerdown(outside);dialog.handlers.click(outside);
    assert.equal(dialog.open,false);assert.equal(page.element("ai-key").value,"");assert.equal(page.local.size,0);
    page.client.open();assert.equal(field.value,"");
    let prevented=false;dialog.handlers.cancel({preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(dialog.open,false);
});

test("session credentials are bound to the endpoint and can be cleared without keeping an undo copy",()=>{
    const local=new Map(),session=new Map(),page=settingsPage(local,session);page.client.open();
    page.element("ai-model").value="model";page.element("ai-enabled").checked=true;page.element("ai-key").value="dummy-key";page.element("ai-remember-key").checked=true;page.element("ai-form").handlers.submit({preventDefault(){}});
    const copy=new Map(session),wrongSettings=JSON.parse(local.get("bvn-api-composer-ai-v1"));wrongSettings.baseUrl="https://other.example/v1";
    const changed=settingsPage(new Map([["bvn-api-composer-ai-v1",JSON.stringify(wrongSettings)]]),copy);
    assert.equal(changed.client.ready(),false);assert.equal(copy.size,0);
    const same=settingsPage(local,session);same.client.open();same.element("ai-clear-key").handlers.click();
    assert.equal(same.client.ready(),false);assert.equal(session.size,0);assert.equal(same.element("ai-key").value,"");assert.equal(same.element("ai-remember-key").checked,false);
});

test("blocked sessionStorage falls back to memory with the remember option disabled",()=>{
    const page=settingsPage(new Map(),new Map(),true);assert.equal(page.element("ai-remember-key").disabled,true);assert.match(page.element("ai-session-help").textContent,/不允许/);
    page.client.open();page.element("ai-model").value="model";page.element("ai-key").value="dummy-key";page.element("ai-enabled").checked=true;
    page.element("ai-form").handlers.submit({preventDefault(){}});assert.equal(page.client.ready(),true);assert.equal(page.session.size,0);
});

test("malformed remembered credentials are removed without disabling healthy session storage",()=>{
    const session=new Map([["bvn-api-composer-ai-session-v1","not-json"]]);
    const page=settingsPage(new Map(),session);assert.equal(session.size,0);assert.equal(page.element("ai-remember-key").disabled,false);assert.equal(page.client.ready(),false);
});

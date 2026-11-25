(function () {
    "use strict";
    var ai=window.BvnComposerAI, core=window.BvnComposer, $=function (id) {return document.getElementById(id);};
    var storageKey="bvn-api-composer-ai-v1", settings=null, key="", metadata=[], formController=null, active=null;
    var dialog=$("ai-dialog"), form=$("ai-form"), account="", effortModel="", backdropPointer=false;
    try {var stored=JSON.parse(localStorage.getItem(storageKey));if (stored) {settings=ai.config(stored,false);account=String(stored.account || "").slice(0,100);}} catch (error) {}
    if (!settings) settings=ai.config({provider:"siliconflow",enabled:false},false);
    var sessionKey="bvn-api-composer-ai-session-v1",rememberKey=false,sessionAvailable=true;
    try {
        var credential=null,sessionValue=sessionStorage.getItem(sessionKey);
        if (sessionValue) {try {credential=JSON.parse(sessionValue);} catch (error) {sessionStorage.removeItem(sessionKey);}}
        if (credential && credential.baseUrl === settings.baseUrl && credential.protocol === settings.protocol && typeof credential.key === "string" && credential.key.length <= 8192 && credential.key.trim() && !/[\r\n]/.test(credential.key)) {key=credential.key;rememberKey=true;}
        else if (credential) sessionStorage.removeItem(sessionKey);
    } catch (error) {sessionAvailable=false;}
    $("ai-remember-key").disabled=!sessionAvailable;
    if (!sessionAvailable) $("ai-session-help").textContent="浏览器不允许会话存储，Key 将仅在页面内存中使用";
    if (typeof location !== "undefined" && location.protocol === "file:") {$("ai-file-help").hidden=false;}
    function updateHeader() {
        var state=$("ai-state");
        state.textContent=settings.enabled ? key ? "已启用" : "待填 Key" : "未启用";
        state.dataset.state=settings.enabled ? key ? "enabled" : "needs-key" : "disabled";
    }
    var recommendations=[
        ["Qwen/Qwen3.5-27B","优先试用"],["Qwen/Qwen3-14B","对照试用"],["Qwen/Qwen3.5-9B","对照试用"],
        ["Qwen/Qwen3.5-35B-A3B","其他候选（未实测）"],["Qwen/Qwen3-32B","其他候选（未实测）"],
        ["Qwen/Qwen3-8B","其他候选（未实测）"],["Qwen/Qwen2.5-7B-Instruct","其他候选（未实测）"],["Qwen/Qwen2.5-14B-Instruct","其他候选（未实测）"]
    ];
    function status(message,error) {$("ai-status").textContent=message;$("ai-status").dataset.state=error ? "error" : "info";}
    function values(requireModel) {
        return ai.config({provider:$("ai-provider").value,baseUrl:$("ai-url").value,protocol:$("ai-protocol").value,model:$("ai-model").value,effort:$("ai-effort").value,enabled:$("ai-enabled").checked},requireModel);
    }
    function selectedMetadata(model) {return metadata.find(function (item) {return item.id === model;});}
    function refreshRecommendations() {
        var silicon=false;
        try {silicon=ai.compatibility(values(false)) === "siliconflow";} catch (error) {}
        $("ai-offer").hidden=!silicon;
        $("ai-model-guide").hidden=!silicon;
        $("ai-offer-activity").hidden=new Date() > new Date("2026-12-31T23:59:59+08:00");
        var host=$("ai-recommendations");host.replaceChildren();
        if (!silicon) return;
        var shown=new Set();
        recommendations.forEach(function (entry) {
            if (shown.has(entry[1]) || !selectedMetadata(entry[0])) return;
            var button=document.createElement("button");button.type="button";button.textContent=entry[0].split("/").pop()+" · "+entry[1];
            button.addEventListener("click",function () {$("ai-model").value=entry[0];refreshEffort();});host.appendChild(button);shown.add(entry[1]);
        });
    }
    function refreshEffort(preferred) {
        var choices=["auto"];
        try {var value=values(false);choices=ai.efforts(value,selectedMetadata(value.model));} catch (error) {}
        var previous=preferred || (effortModel === $("ai-model").value ? $("ai-effort").value : "");effortModel=$("ai-model").value;
        if (!preferred && $("ai-effort-field").hidden) previous="";
        $("ai-effort").replaceChildren();
        choices.forEach(function (value) {var option=document.createElement("option");option.value=value;option.textContent={auto:"服务商默认",none:"关闭推理",on:"开启推理",low:"低"}[value];$("ai-effort").appendChild(option);});
        $("ai-effort").value=choices.includes(previous) ? previous : choices.includes("none") ? "none" : choices.includes("low") ? "low" : "auto";
        $("ai-effort-field").hidden=choices.length === 1;
    }
    function open() {
        $("ai-provider").value=settings.provider;$("ai-url").value=settings.baseUrl;$("ai-protocol").value=settings.protocol;
        $("ai-model").value=settings.model;$("ai-key").value=key;$("ai-account").value=account;$("ai-enabled").checked=settings.enabled;
        $("ai-remember-key").checked=rememberKey;
        refreshEffort(settings.effort);refreshRecommendations();status("");backdropPointer=false;dialog.showModal();$("ai-form-body").scrollTop=0;
    }
    function close() {if (formController) formController.abort();backdropPointer=false;dialog.close();$("ai-key").value="";}
    function clearModels() {if (formController) formController.abort();metadata=[];effortModel="";$("ai-models").replaceChildren();refreshEffort();refreshRecommendations();status("");}
    $("ai-settings").addEventListener("click",open);
    $("ai-close").addEventListener("click",close);
    $("ai-clear-key").addEventListener("click",function () {
        key="";rememberKey=false;$("ai-key").value="";$("ai-remember-key").checked=false;if (active) active.abort();updateHeader();
        try {if (sessionAvailable) sessionStorage.removeItem(sessionKey);status("已清除此标签页的 Key");}
        catch (error) {status("页面中的 Key 已清空，但浏览器阻止了会话存储清除，请在浏览器中清除此站点的数据",true);}
    });
    dialog.addEventListener("cancel",function (event) {event.preventDefault();close();});
    function outside(event) {
        if (event.target !== dialog) return false;
        var rect=dialog.getBoundingClientRect();
        return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    }
    dialog.addEventListener("pointerdown",function (event) {backdropPointer=event.button === 0 && outside(event);});
    dialog.addEventListener("click",function (event) {var dismiss=backdropPointer && outside(event);backdropPointer=false;if (dismiss) close();});
    $("ai-provider").addEventListener("change",function () {
        var preset=ai.presets[this.value];$("ai-url").value=preset.baseUrl;$("ai-protocol").value=preset.protocol;
        $("ai-key").value="";$("ai-model").value="";clearModels();
    });
    // Changing the destination requires explicitly filling credentials for that destination
    $("ai-url").addEventListener("input",function () {$("ai-key").value="";clearModels();});
    $("ai-protocol").addEventListener("change",clearModels);
    $("ai-model").addEventListener("input",function () {refreshEffort();});
    async function operation(button,handler) {
        if (formController) formController.abort();
        var controller=new AbortController();formController=controller;
        $("ai-load-models").disabled=true;$("ai-test").disabled=true;
        status(button === "ai-test" ? "正在测试连接…" : "正在获取模型…");
        try {await handler(controller.signal);} catch (error) {if (error.name !== "AbortError") status(error.message,true);}
        finally {if (formController === controller) {formController=null;$("ai-load-models").disabled=false;$("ai-test").disabled=false;}}
    }
    $("ai-load-models").addEventListener("click",function () {
        operation("ai-load-models",async function (signal) {
            var value=values(false);metadata=await ai.models(value,$("ai-key").value.trim(),{signal:signal});
            $("ai-models").replaceChildren();metadata.forEach(function (row) {var option=document.createElement("option");option.value=row.id;option.label=row.display_name || row.name || row.id;$("ai-models").appendChild(option);});
            refreshEffort();refreshRecommendations();status("已获取 "+metadata.length+" 个模型，请选择用于补全的模型");
        });
    });
    $("ai-test").addEventListener("click",function () {
        operation("ai-test",async function (signal) {var value=values(true);await ai.test(value,$("ai-key").value.trim(),{signal:signal,metadata:selectedMetadata(value.model)});status("连接正常，模型可以返回 JSON");});
    });
    form.addEventListener("submit",function (event) {
        event.preventDefault();
        try {
            var next=values($("ai-enabled").checked);
            if (next.enabled && !$("ai-key").value.trim()) throw new Error("请先填充 API Key");
            var nextKey=$("ai-key").value.trim(),nextRemember=$("ai-remember-key").checked;
            if (nextRemember) {
                if (!sessionAvailable) throw new Error("浏览器不允许会话存储，请取消勾选记住 Key");
                try {sessionStorage.setItem(sessionKey,JSON.stringify({baseUrl:next.baseUrl,protocol:next.protocol,key:nextKey}));}
                catch (error) {throw new Error("未能保存会话 Key；请取消勾选后继续使用页面内存模式");}
            } else if (sessionAvailable) sessionStorage.removeItem(sessionKey);
            if (active) active.abort();
            key=nextKey;rememberKey=nextRemember;account=$("ai-account").value.trim().slice(0,100);settings=next;
            localStorage.setItem(storageKey,JSON.stringify(Object.assign({},next,{account:account})));
            updateHeader();
            close();
        } catch (error) {status(error.message || "未能保存配置",true);}
    });
    async function documents(text,result,version,actor,signal) {
        var candidates=result.suggestions.concat(result.graph.nodes.map(function (node) {return node.key;}));
        text.split(/[\s，,。；;、]+/).forEach(function (part) {
            if (part.length > 1) core.searchSpecs(part,actor,version).slice(0,4).forEach(function (spec) {candidates.push(spec.key);});
        });
        var specs=Array.from(new Set(candidates)).map(function (id) {return core.catalog[id];}).filter(function (spec) {return spec && spec.kind !== "root";}).slice(0,6);
        var paths=Array.from(new Set(specs.map(function (spec) {return spec.doc;}))), pages=new Map();
        await Promise.all(paths.map(async function (path) {
            var controller=new AbortController(),timer=setTimeout(function () {controller.abort();},5000);
            function cancel() {controller.abort();}signal.addEventListener("abort",cancel,{once:true});
            try {
                if (signal.aborted) return;
                var response=await fetch(new URL("../"+path+".md",location.href),{signal:controller.signal,credentials:"omit"});
                if (response.ok) pages.set(path,await response.text());
            } catch (error) { /* The curated interface descriptions remain available without document fetches */ }
            finally {clearTimeout(timer);signal.removeEventListener("abort",cancel);}
        }));
        return specs.map(function (spec) {
            var source=pages.get(spec.doc) || "", anchor=(spec.anchor || spec.key).toLowerCase();
            var sections=source.split(/\r?\n(?=> #{5,6} )/), section=sections.find(function (part) {return part.split(/\r?\n/)[0].replace(/^> #{5,6} /,"").replace(/^3\.\d+(?:开发)?增加\s*/,"").toLowerCase() === anchor;});
            return {key:spec.key,doc:spec.doc,content:(section || "").split("使用示例：")[0].slice(0,1200)};
        }).filter(function (row) {return row.content;});
    }
    updateHeader();
    window.BvnComposerAISettings={
        enabled:function () {return settings.enabled;},
        ready:function () {return !!(settings.enabled && key && settings.model);},
        open:open,
        cancel:function () {if (active) active.abort();},
        run:async function (text,version,actor,result,onProgress) {
            actor=result.graph.actor;
            if (active) active.abort();
            var controller=new AbortController();active=controller;
            var snapshot=Object.assign({},settings), credential=key, modelData=selectedMetadata(settings.model), used=null, plan=null, requestInfo=null, started=0;
            try {
                var docs=await documents(text,result,version,actor,controller.signal);
                if (controller.signal.aborted) {var aborted=new Error("已取消 AI 请求");aborted.name="AbortError";throw aborted;}
                var prompt=ai.prompt(core,text,version,actor,result,docs);
                plan=await ai.complete(snapshot,credential,prompt.system,prompt.user,{signal:controller.signal,metadata:modelData,onUsage:function (usage) {used=usage;},onRequest:function (info) {requestInfo=info;started=Date.now();},onDiagnostic:function (info) {if (requestInfo) requestInfo.diagnostic=info;if (onProgress) onProgress(info);}});
                var built=ai.reconcile(core,text,result,ai.buildPlan(core,plan,version,actor,result.graph.context));
                var gaps=ai.coverage(core,text,result,built.graph);
                if (gaps.length) throw new Error("方案未覆盖已识别的需求："+gaps.join("；"));
                built.usage=used;if (requestInfo) {requestInfo.elapsedMs=Date.now()-started;built.request=requestInfo;}return built;
            } catch (error) {
                if (plan) error.modelPlan=plan;
                error.usage=used;if (requestInfo) {requestInfo.elapsedMs=Date.now()-started;error.request=requestInfo;}throw error;
            } finally {if (active === controller) active=null;}
        }
    };
}());

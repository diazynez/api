# BVN 角色制作 API 文档

为改版创作倾注动力！从人物属性、攻击配置到道具与特效，在这里查找接口和使用示例。

<div class="api-home">

<div class="home-start">
<section class="home-main">
<h2>常用功能</h2>
<div class="home-tasks">
<a class="home-task" href="#/zh-cn/core-object-classes/FighterMain"><strong>调整当前血量与耐力</strong><span>FighterMain · hp、energy、energyMax</span></a>
<a class="home-task" href="#/zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=setattack"><strong>设置攻击与技能动作</strong><span>FighterMcCtrler · setAttack、setSkill1、setBisha</span></a>
<a class="home-task" href="#/zh-cn/data-model-classes/FighterHitModel?id=gethitvo"><strong>读取与修改攻击配置</strong><span>FighterHitModel · getHitVO、getHitVOLike</span></a>
<a class="home-task" href="#/zh-cn/main-fighter-ctrlers/FighterEffectCtrl"><strong>播放特效</strong><span>FighterEffectCtrl · 变身、残影与受击特效</span></a>
<a class="home-task" href="#/zh-cn/other-ctrlers/FighterAttackerCtrler"><strong>控制攻击对象</strong><span>FighterAttackerCtrler · 移动、碰撞与退场</span></a>
<a class="home-task" href="#/zh-cn/other-ctrlers/AssisiterCtrler"><strong>控制辅助人物</strong><span>AssisiterCtrler · 攻击定义、碰撞与退场</span></a>
</div>
</section>

<aside class="home-help">
<h2>查阅提示</h2>
<p>文档以 3.0 为基础。后续版本增加的接口会在标题中标注，参数和行为变化写在接口说明末尾。</p>
<h3>用熟悉的叫法搜索</h3>
<p>“当身”“防反”“反制”可以搜到同一组相关接口；“生命值”也能找到使用“血量”表述的内容。</p>
<h3>按用途查找</h3>
<p>当前血量与耐力查看人物主体；动作登记查看 Mc 控制器；修改已有攻击的属性可通过攻击模型取得 HitVO，再查对应字段。</p>
</aside>
</div>

<section class="home-tools">
<h2>自动化编写器</h2>
<p>在接口示例下填写参数，实时生成可复制的调用代码。</p>
<div class="home-tool-list">
<a class="home-tool" href="#/zh-cn/main-fighter-ctrlers/FighterCtrler?id=defineaction"><h3>攻击定义</h3><code>defineAction</code><p>配置攻击力、受力、硬直及破防等属性。</p></a>
<a class="home-tool" href="#/zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=fire"><h3>飞行道具</h3><code>fire</code><p>配置速度、存在时长、可攻击次数与血量。</p></a>
<a class="home-tool" href="#/zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=addattacker"><h3>攻击对象</h3><code>addAttacker</code><p>配置位置、目标跟随与重力。</p></a>
</div>
</section>

<p class="home-about"><a href="#/about">关于文档与贡献者 →</a></p>

</div>

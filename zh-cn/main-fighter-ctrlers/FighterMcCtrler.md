# Mc控制器

### 属性

说明：设置或调整人物的默认属性

> ###### effectCtrler

类型：[`FighterEffectCtrl`](zh-cn/main-fighter-ctrlers/FighterEffectCtrl)

说明：人物的Effect控制器

使用示例：

```actionscript
parent.$mc_ctrler.effectCtrler.shine(0xFFFFFF);
```

<span id="doactiontimes"></span>

> ###### 3.8开发增加 doActionTimes

类型：`uint`

说明：动作执行序号，初始为 1，每次 doAction 时递增，主要用于引擎内部传递和识别同一次动作的攻击来源，角色脚本通常无需直接使用

### 方法

> ###### addQi

传入参数：`qi:Number`

返回类型：`void`

说明：增加气量

使用示例：

```actionscript
parent.$mc_ctrler.addQi(10);
```

> ###### idle

传入参数：`frame:String = "站立"`

返回类型：`void`

说明：人物恢复站立状态（在空中则恢复下落状态）

使用示例：

```actionscript
parent.$mc_ctrler.idle();
```

> ###### loop

传入参数：`frame:String`

返回类型：`void`

说明：循环播放（效果与gotoAndPlay方法完全相同）

使用示例：

```actionscript
parent.$mc_ctrler.loop("走");
```

> ###### stop

传入参数：无

返回类型：`void`

说明：停止播放人物动画

使用示例：

```actionscript
parent.$mc_ctrler.stop();
```

> ###### dash

传入参数：`speedPlus:Number = 3`

返回类型：`void`

说明：开始冲刺（参数乘人物移动速度为实际速度）

使用示例：

```actionscript
parent.$mc_ctrler.dash(3);
```

> ###### dashStop

传入参数：`loseSpdPercent:Number = 0.5`

返回类型：`void`

说明：结束冲刺（参数乘人物移动速度为实际失速度）

使用示例：

```actionscript
parent.$mc_ctrler.dashStop();
```

> ###### setAllAct

传入参数：无

返回类型：`void`

说明：设定所有地面的动作可执行

使用示例：

```actionscript
parent.$mc_ctrler.setAllAct();
```

> ###### setAirAllAct

传入参数：无

返回类型：`void`

说明：设定所有空中的动作可执行

使用示例：

```actionscript
parent.$mc_ctrler.setAirAllAct();
```

> ###### setAirMove

传入参数：`v:Boolean`

返回类型：`void`

说明：设置空中是否可移动

使用示例：

```actionscript
parent.$mc_ctrler.setAirMove(true);
```

> ###### setMove

传入参数：无

返回类型：`void`

说明：设置可行走（A和D）

使用示例：

```actionscript
parent.$mc_ctrler.setMove();
```

> ###### setMoveLeft

传入参数：无

返回类型：`void`

说明：将左移动作登记为“走”

使用示例：

```actionscript
parent.$mc_ctrler.setMoveLeft();
```

> ###### setMoveRight

传入参数：无

返回类型：`void`

说明：将右移动作登记为“走”

使用示例：

```actionscript
parent.$mc_ctrler.setMoveRight();
```

> ###### setDefense

传入参数：无

返回类型：`void`

说明：设置可防御（S）

使用示例：

```actionscript
parent.$mc_ctrler.setDefense();
```

> ###### setJump

传入参数：`action:String = "跳"`

返回类型：`void`

说明：设置可跳（K）

使用示例：

```actionscript
parent.$mc_ctrler.setJump();
```

> ###### 正常模式专用 setJumpQuick

传入参数：`action:String = "跳"`

返回类型：`void`

说明：设置可快速跳（K）

使用示例：

```actionscript
parent.$mc_ctrler.setJumpQuick();
```

> ###### setJumpDown

传入参数：`action:String = "落"`

返回类型：`void`

说明：设置可下台阶（SK）

使用示例：

```actionscript
parent.$mc_ctrler.setJumpDown();
```

> ###### setDash

传入参数：`action:String = "瞬步"`

返回类型：`void`

说明：设置可瞬步（L）

使用示例：

```actionscript
parent.$mc_ctrler.setDash();
```

> ###### FVO专用 setDashBack

传入参数：`action:String = "起身"`

返回类型：`void`

说明：设置可后撤步（SL）

使用示例：

```actionscript
parent.$mc_ctrler.setDashBack();
```

> ###### setAttack

传入参数：`action:String = "砍1"`

返回类型：`void`

说明：设置可攻击（J）

使用示例：

```actionscript
parent.$mc_ctrler.setAttack();
```

> ###### setSkill1

传入参数：`action:String = "砍技1"`

返回类型：`void`

说明：设置可砍技1（SJ）

使用示例：

```actionscript
parent.$mc_ctrler.setSkill1();
```

> ###### setSkill2

传入参数：`action:String = "砍技2"`

返回类型：`void`

说明：设置可砍技2（WJ）

使用示例：

```actionscript
parent.$mc_ctrler.setSkill2();
```

> ###### setZhao1

传入参数：`action:String = "招1"`

返回类型：`void`

说明：设置可招1（U）

使用示例：

```actionscript
parent.$mc_ctrler.setZhao1();
```

> ###### setZhao2

传入参数：`action:String = "招2"`

返回类型：`void`

说明：设置可招2（SU）

使用示例：

```actionscript
parent.$mc_ctrler.setZhao2();
```

> ###### setZhao3

传入参数：`action:String = "招3"`

返回类型：`void`

说明：设置可招3（WU）

使用示例：

```actionscript
parent.$mc_ctrler.setZhao3();
```

> ###### setCatch1

传入参数：`action:String = "摔1"`

返回类型：`void`

说明：设置可摔1（ADJ）

使用示例：

```actionscript
parent.$mc_ctrler.setCatch1();
```

> ###### setCatch2

传入参数：`action:String = "摔2"`

返回类型：`void`

说明：设置可摔2（ADU）

使用示例：

```actionscript
parent.$mc_ctrler.setCatch2();
```

<span id="setspecialskill"></span>

> ###### 3.8开发增加 setSpecialSkill

传入参数：`param1:String = null`

返回类型：`void`

说明：将特殊辅助动作设为特殊技能；可传入已有帧标签覆盖。尚未设置特殊辅助动作时不处理

使用示例：

```actionscript
// 先登记特殊辅助动作，再将其设为特殊技能
if (parent.$mc_ctrler.setSpecialAssist({enabled:false, action:"招2"}))
{
    parent.$mc_ctrler.setSpecialSkill();
}
```

> ###### setBisha

传入参数：`action:String = "必杀" , qi:int = 100`

返回类型：`void`

说明：设置可必杀（I）

使用示例：

```actionscript
parent.$mc_ctrler.setBisha();
```

> ###### setBishaUP

传入参数：`action:String = "上必杀" , qi:int = 100`

返回类型：`void`

说明：设置可上必杀（WI）

使用示例：

```actionscript
parent.$mc_ctrler.setBishaUP();
```

> ###### setBishaSUPER

传入参数：`action:String = "超必杀" , qi:int = 300`

返回类型：`void`

说明：设置可超必杀（SI）

使用示例：

```actionscript
parent.$mc_ctrler.setBishaSUPER();
```

> ###### setAttackAIR

传入参数：`action:String = "跳砍"`

返回类型：`void`

说明：设置可跳砍（KJ）

使用示例：

```actionscript
parent.$mc_ctrler.setAttackAIR();
```

> ###### setSkillAIR

传入参数：`action:String = "跳招"`

返回类型：`void`

说明：设置跳招（KU）

使用示例：

```actionscript
parent.$mc_ctrler.setSkillAIR();
```

> ###### setBishaAIR

传入参数：`action:String = "空中必杀" , qi:int = 100`

返回类型：`void`

说明：设置可空中必杀（KI）

使用示例：

```actionscript
parent.$mc_ctrler.setBishaAIR();
```

> ###### setWankai

传入参数：`action:String = "万解"`<br>
传入参数（3.3）：无

返回类型：`void`

说明：设置可变身（JK）

<div class="version-note">

3.3改动：不再接收 action 参数，使用“万解”“万解S”“万解W”动作标签，分别对应 JK、SJK、WJK

</div>

使用示例：

```actionscript
parent.$mc_ctrler.setWankai();
```

> ###### setTouchFloor

传入参数：`action:String = "落地" , breakAct:Boolean = true`

返回类型：`void`

说明：设定落地的动作（参数1：落地时执行的动作，参数2：接触到地面时是否中断当前动作）

使用示例：

```actionscript
parent.$mc_ctrler.setTouchFloor("跳招2",true);
```

> ###### setHitTarget

传入参数：`checker:String , action:String`<br>
传入参数（3.8开发）：`checker:String, action:String, isCheckTargetIsAllowBeHit:Boolean = true, isResponseTargetGameSprite:Boolean = false`

返回类型：`void`

说明：设定检测碰撞后攻击（参数1：待检测对象的名称，参数2：碰撞后执行的动作）

<div class="version-note">

3.8开发改动：增加是否要求目标可受击、是否将碰撞目标作为响应对象两个开关，默认 true、false

</div>

使用示例：

```actionscript
parent.$mc_ctrler.setHitTarget("kj10atm","砍技12");
```

> ###### setHurtAction

传入参数：`action:String`

返回类型：`void`

说明：设置当身触发后的动作，并使人物进入当身状态；跳转到的目标帧须设为无敌状态

使用示例：

```actionscript
parent.$mc_ctrler.setHurtAction("招22");
```

<span id="settouchside"></span>

> ###### 3.8开发增加 setTouchSide

传入参数：`action:String`

返回类型：`void`

说明：登记碰到地图侧边时执行的动作标签

使用示例：

```actionscript
parent.$mc_ctrler.setTouchSide("招2");
```

> ###### move

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：持续移动

使用示例：

```actionscript
parent.$mc_ctrler.move(8, 0);
```

> ###### movePercent

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：按角色速度的百分比持续移动

使用示例：

```actionscript
parent.$mc_ctrler.movePercent(1, 0);
```

> ###### stopMove

传入参数：无

返回类型：`void`

说明：停止移动

使用示例：

```actionscript
parent.$mc_ctrler.stopMove();
```

> ###### damping

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：设置阻力

使用示例：

```actionscript
parent.$mc_ctrler.damping(0.8, 0);
```

> ###### dampingPercent

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：按角色速度的百分比设置阻力

使用示例：

```actionscript
parent.$mc_ctrler.dampingPercent(0.1, 0);
```

> ###### endAct

传入参数：无

返回类型：`void`

说明：清除纽带，使对方AI检测我方角色状态为硬直状态，清除人物的特殊状态

使用示例：

```actionscript
parent.$mc_ctrler.endAct();
```

> ###### fire

传入参数：`mcName:String , params:Object = null`

返回类型：`void`

说明：发射飞行道具（子弹、波等）

params 的配置与[飞行道具的速度、存在时长、可攻击次数、血量及可用版本](zh-cn/core-object-classes/Bullet?id=fire-params)一致，编写器按目标版本显示可用参数

使用示例：

- [详细介绍](zh-cn/core-object-classes/Bullet)

```actionscript
parent.$mc_ctrler.fire("zh1atm",{x:{start:15,hit:3},y:0,hold:2,hits:1,hp:100});

/*
飞行道具元件设置说明
1.飞行道具元件名称格式须为：XXXatm，该攻击ID应已在伤害表中注册
2.飞行道具的攻击范围元件（攻击面）名称必须为：main
3.元件注册点位置应位于飞行道具的中心，否则此飞行道具的碰撞检测功能会失常
4.飞行道具内特殊帧标签定义：
    loop_start:设定循环开始的位置
    loop:跳至loop_start帧，若没有设置loop_start帧，则为第一帧
    hit:攻击到目标时自动跳转到此帧，常用于播放道具的消失动画
    hit_over:设置攻击结束，提醒游戏对本飞行道具进行清除
    timeout:本飞行道具存在超时时自动跳转到此帧
    remove:删除本飞行道具
*/
```

[fire](../../tools/fire.html ':include :type=iframe width=100% height=653px')

> ###### addAttacker

传入参数：`mcName:String , params:Object = null`<br>
传入参数（3.8开发）：`mcName:String, params:Object = null, again:Boolean = false`

返回类型：`void`

说明：加入攻击对象（即独立道具）

params 的配置与[攻击对象的位置、跟随方式、重力及穿平台配置](zh-cn/core-object-classes/FighterAttacker?id=add-attacker-params)一致，编写器按目标版本显示可用参数

<div class="version-note">

3.8开发改动：增加内部重试标记 again；通常仍使用两个参数，元件尚未出现时最多延迟重试一次

</div>

使用示例：

- [详细介绍](zh-cn/other-ctrlers/FighterAttackerCtrler)
- [详细介绍](zh-cn/core-object-classes/FighterAttacker)

```actionscript
parent.$mc_ctrler.addAttacker("bsmc",{applyG:false});

/*
如果比较复杂，需要在攻击对象元件内部加入代码，实现接口
var $attacker_ctrler:*;
function setAttackerCtrler(attackerCtrler:*):void
{
    $attacker_ctrler = attackerCtrler;
}
*/
```

[addAttacker](../../tools/addAttacker.html ':include :type=iframe width=100% height=531px')

> ###### getAttacker

传入参数：`name:String`

返回类型：[`FighterAttackerCtrler`](zh-cn/other-ctrlers/FighterAttackerCtrler)

说明：获取通过addAttacker加入的对象（可用于控制攻击对象）

注：有多个同名攻击对象时优先获取最早登场的一个

使用示例：

```actionscript
if (parent.$mc_ctrler.getAttacker("bsmc"))
{
	parent.$mc_ctrler.getAttacker("bsmc").move(4, 4);
}   //如果存在名为bsmc的攻击对象，将其运动设置为(4, 4)
```

<span id="getassister"></span>

> ###### 3.8开发增加 getAssister

传入参数：无

返回类型：[`AssisiterCtrler`](zh-cn/other-ctrlers/AssisiterCtrler)

说明：取得当前已登场辅助人物的控制器；当前没有辅助人物时返回 null

使用示例：

```actionscript
var assistCtrl1 = parent.$mc_ctrler.getAssister();
if (assistCtrl1 != null)
{
    assistCtrl1.stopMove();
}
```

<span id="getassisterglobal"></span>

> ###### 3.8开发增加 getAssisterGlobal

传入参数：无

返回类型：[`Assister`](zh-cn/core-object-classes/Assisiter)

说明：取得己方配置的辅助人物主体，无论辅助是否在场均可访问；无双模式等未配置辅助人物的情况下返回 null

使用示例：

```actionscript
var assister1 = parent.$mc_ctrler.getAssisterGlobal();
if (assister1 != null)
{
    assister1.enable = false; // 禁止通常的辅助调用
}
```

<span id="setspecialassist"></span>

> ###### 3.8开发增加 setSpecialAssist

传入参数：`params:Object = null`

返回类型：`Boolean`

说明：配置特殊辅助调用，返回是否成功。params 支持 id（限定辅助角色）、back（条件函数）、enabled（是否保留通常辅助登场，默认 false）、useFzqi（是否消耗辅助能量，默认 true）、action（替代通常辅助调用的动作标签或无参数函数）；action 在 enabled 为 false 时使用。无辅助或 id 不匹配时返回 false

使用示例：

```actionscript
// 在登记动作的帧中配置：耐力不少于 20 时，用人物的“招2”替代通常辅助调用，并将该动作登记为特殊技能
// “招2”需替换为已有动作标签
// back 在调用本方法时检查；条件会变化时，应在原有的动作登记流程中重新调用本方法
function checkAssist1():Boolean
{
    return parent.$fighter_ctrler.getEnergy() >= 20;
}
var assistReady1:Boolean = parent.$mc_ctrler.setSpecialAssist({enabled:false, useFzqi:true, back:checkAssist1, action:"招2"});
if (assistReady1)
{
    parent.$mc_ctrler.setSpecialSkill();
}
```

<span id="setspecialhurtbreak"></span>

> ###### 3.8开发增加 setSpecialHurtBreak

传入参数：`param:Object = null`

返回类型：`Boolean`

说明：设置受击脱离时替代通常灵压爆发／替身术的动作，传入动作标签字符串或无参数 Function。非 null 返回 true，null 返回 false；脱离判定与耗气仍由原流程处理

使用示例：

```actionscript
parent.$mc_ctrler.setSpecialHurtBreak("招2");
```

> ###### isApplyG

传入参数：`v:Boolean`

返回类型：`void`

说明：设置人物是否受重力影响

使用示例：

```actionscript
parent.$mc_ctrler.isApplyG(false);
```

<span id="isallowcrossfloor"></span>

> ###### 3.8开发增加 isAllowCrossFloor

传入参数：`b:Boolean`

返回类型：`void`

说明：是否允许穿过地图平台；BaseGameSprite 默认 false，Bullet 默认 true

使用示例：

```actionscript
parent.$mc_ctrler.isAllowCrossFloor(true);
```

> ###### gotoAndPlay

传入参数：`frame:String`

返回类型：`void`

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
parent.$mc_ctrler.gotoAndPlay("帧标签");
```

> ###### gotoAndStop

传入参数：`frame:String`

返回类型：`void`

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
parent.$mc_ctrler.gotoAndStop("帧标签");
```

> ###### hurtFly

传入参数：`x:Number , y:Number`

返回类型：`void`

说明：将自身击飞

使用示例：

```actionscript
parent.$mc_ctrler.hurtFly(-10,0);
```

> ###### justHitToPlay

传入参数：`hitid:String , frame:String , noIdle:Boolean = false , inCludeDefense:Boolean = false`

返回类型：`void`

说明：指定攻击命中时跳转到 frame 对应的动作；第三参数为 true 时，未命中则回到站立，为 false 时保持当前动作；第四参数决定是否将被对方防御的命中也计入，默认 false

使用示例：

```actionscript
parent.$mc_ctrler.justHitToPlay("攻击ID", "帧标签", false, false);
```

> ###### moveTarget

传入参数：`params:Object = null`

返回类型：`void`

说明：对对方产生吸引力

使用示例：

```actionscript
parent.$mc_ctrler.moveTarget({followmc: "move_mc"});

/*
参数(params)填写说明，(小括号和中文字符均为提示文本，需要删除)

x: Number(水平位置),
y: Number(竖直位置), 
followmc: String(设置此值时以该影片剪辑为中心吸引对方，此处应填写影片剪辑的名称),
speed: Number(吸引速度)
或
speed: new Point(Number, Number)(水平、竖直吸引分速度）
*/

/*
补充说明
    吸引速度为0或不设置时，直接移动对方到相应位置
    参数填写null时效果为结束吸引：parent.$mc_ctrler.moveTarget(null);
*/
```

> ###### getAction

传入参数：无

返回类型：[`FighterAction`](zh-cn/core-object-classes/FighterAction)

说明：获取人物动作

使用示例：

```actionscript
var fighterAcion = parent.$mc_ctrler.getAction();
```

> ###### sayIntro

传入参数：无

返回类型：`void`

说明：播放“开场”动作

使用示例：

```actionscript
parent.$mc_ctrler.sayIntro();
```

> ###### doWin

传入参数：无

返回类型：`void`

说明：播放“胜利”动作

使用示例：

```actionscript
parent.$mc_ctrler.doWin();
```

> ###### doLose

传入参数：无

返回类型：`void`

说明：播放“失败”动作

使用示例：

```actionscript
parent.$mc_ctrler.doLose();
```

<span id="targetdoghoststep"></span>

> ###### 3.8开发增加 targetDoGhostStep

传入参数：无

返回类型：`void`

说明：用于在对方幽步结束后解除自身残留的防御受击硬直，避免人物继续卡在防御受击状态。仅在自身处于防御受击状态时生效，同时停止水平移动、给予短暂不可受击时间并重新允许瞬步。引擎会在对方幽步结束时自动调用

<span id="isghoststeping"></span>

> ###### 3.8开发增加 isGhostSteping

传入参数：无

返回类型：`Boolean`

说明：判断自身是否正在幽步

使用示例：

```actionscript
var ghostSteping1:Boolean = parent.$mc_ctrler.isGhostSteping();
```

> ###### getFighterMc

传入参数：无

返回类型：[`FighterMC`](zh-cn/core-object-classes/FighterMC)

说明：获取人物MC

使用示例：

```actionscript
var fighterMC = parent.$mc_ctrler.getFighterMc();
```

> ###### getCurAction

传入参数：无

返回类型：`String`

说明：获取人物当前所执行的动作的帧标签（大多数基础动作无法通过此接口获取）

使用示例：

```actionscript
var curAcion: String = parent.$mc_ctrler.getCurAction();
```

<span id="gethurtholdframe"></span>

> ###### 3.8开发增加 getHurtHoldFrame

传入参数：无

返回类型：`int`

说明：取得当前受击硬直的剩余动画帧计数

使用示例：

```actionscript
var hurtHoldFrame1:int = parent.$mc_ctrler.getHurtHoldFrame();
```

<span id="gethurtholdframemax"></span>

> ###### 3.8开发增加 getHurtHoldFrameMax

传入参数：无

返回类型：`int`

说明：取得当前受击硬直的最大动画帧计数

使用示例：

```actionscript
var hurtHoldFrameMax1:int = parent.$mc_ctrler.getHurtHoldFrameMax();
```

<span id="getdefenseholdframe"></span>

> ###### 3.8开发增加 getDefenseHoldFrame

传入参数：无

返回类型：`int`

说明：取得防御受击停留的剩余动画帧计数

使用示例：

```actionscript
var defenseHoldFrame1:int = parent.$mc_ctrler.getDefenseHoldFrame();
```

<span id="getisdefense"></span>

> ###### 3.8开发增加 getIsDefense

传入参数：无

返回类型：`Boolean`

说明：取得控制器内部记录的防御判定状态

使用示例：

```actionscript
var isDefense1:Boolean = parent.$mc_ctrler.getIsDefense();
```

<span id="getactionctrler"></span>

> ###### 3.5增加 getActionCtrler

传入参数：无

返回类型：`IFighterActionCtrl`

说明：取得当前输入或 AI 动作控制器

使用示例：

```actionscript
var actionCtrler1 = parent.$mc_ctrler.getActionCtrler();
```

> ###### setMc

传入参数：`mc:FighterMC`

返回类型：`void`

说明：为人物设定 FighterMC，通常由引擎初始化流程调用

使用示例：

```actionscript
var fighterMC1 = parent.$mc_ctrler.getFighterMc();
parent.$mc_ctrler.setMc(fighterMC1);
```

> ###### beHit

传入参数：`hitvo:HitVO , hitRect:Rectangle = null`

返回类型：`void`

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

属于[人物主体的beHit方法](zh-cn/core-object-classes/FighterMain?id=behit)的一部分

使用示例：

```actionscript
parent.$mc_ctrler.beHit(null);        // 手动触发自身已设置的当身动作
```

<span id="touchfloor"></span>

> ###### 3.3增加 touchFloor

传入参数：无

返回类型：`void`

说明：若人物在空中，播放落地的动作

使用示例：

```actionscript
parent.$mc_ctrler.touchFloor();
```

<span id="doactionflexible"></span>

> ###### 3.8开发增加 doActionFlexible

传入参数：`action:*, state:int = -1`

返回类型：`void`

说明：传入字符串时清除动作设置并执行对应动作；传入 Function 时直接调用；state 不为 -1 时先设置人物状态

使用示例：

```actionscript
parent.$mc_ctrler.doActionFlexible("招1");
```

> ###### moveMC

传入参数：`mmc:DisplayObject, x:Object = null, y:Object = null`

返回类型：`void`

说明：以人物位置为原点移动指定元件，元件应与人物处于同一显示层级

使用示例：

```actionscript
parent.$mc_ctrler.moveMC(mc1, 0, 0);        //将mc1移动到与主人物相同的坐标
parent.$mc_ctrler.moveMC(mc1, {target:0}, {target:0});        //将mc1移动到与对方角色相同的坐标（原版该部分存在三处逻辑错误，不建议使用）
```

> ###### FVO专用 setFly

传入参数：`flying:Boolean, params:Object = null`

返回类型：`void`

说明：设置可飞行

<div class="version-note">

3.8开发也可使用

</div>

使用示例：

```actionscript
parent.$mc_ctrler.setFly(true,{params});

/*
参数(params)填写说明，(小括号和中文字符均为提示文本，需要删除)

lrSpd:Number(左右移动速度),
upSpd:Number(上升速度),
downSpd:Number(下降速度),
hold:int(持续时间),
endAction:String(结束动作)
*/
```

> ###### FVO专用 unHoldAttack

传入参数：`frame:String = null`

返回类型：`void`

说明：未蓄力攻击

<div class="version-note">

3.8开发也可使用

</div>

使用示例：

```actionscript
parent.$mc_ctrler.unHoldAttack("砍32");
```

> ###### FVO专用 unHoldSkill

传入参数：`frame:String = null`

返回类型：`void`

说明：未蓄力技能

<div class="version-note">

3.8开发也可使用

</div>

使用示例：

```actionscript
parent.$mc_ctrler.unHoldSkill("招22");
```

> ###### FVO专用 unHoldBisha

传入参数：`frame:String = null`

返回类型：`void`

说明：未蓄力必杀

<div class="version-note">

3.8开发也可使用

</div>

使用示例：

```actionscript
parent.$mc_ctrler.unHoldBisha("上必杀2");
```

<span id="setsteelbody"></span>

> ###### 3.3增加 setSteelBody

传入参数：`v:Boolean, isSuper:Boolean = false`

返回类型：`void`

说明：设置钢身效果（参数1：开启或关闭钢身，参数2：是否开启超级钢身）

使用示例：

```actionscript
parent.$mc_ctrler.setSteelBody(true,false);
```

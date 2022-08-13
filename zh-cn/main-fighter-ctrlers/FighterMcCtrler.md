# Mc控制器

### 属性

说明：设置或调整人物的默认属性

> ###### effectCtrler

类型：FighterEffectCtrl

说明：人物的effect控制器

使用示例：

- [详细介绍](zh-cn/main-fighter-ctrlers/FighterEffectCtrl)

```actionscript
var effect = parent.$mc_ctrler.effectCtrler;        //将人物的effect控制器赋值到变量effect
```

### 方法

> ###### addQi

传入参数：qi:Number

返回类型：void

说明：增加气量

使用示例：

```actionscript
parent.$mc_ctrler.addQi(10);
```

> ###### idle

传入参数：frame:String = "站立"

返回类型：void

说明：人物恢复站立状态（在空中则恢复下落状态）

使用示例：

```actionscript
parent.$mc_ctrler.idle();
```

> ###### loop

传入参数：frame:String

返回类型：void

说明：循环播放（效果与gotoAndPlay方法完全相同）

使用示例：

```actionscript
parent.$mc_ctrler.loop("走");
```

> ###### stop

传入参数：无

返回类型：void

说明：停止播放人物动画

使用示例：

```actionscript
parent.$mc_ctrler.stop();
```

> ###### dash

传入参数：speedPlus:Number = 3

返回类型：void

说明：开始冲刺（参数乘人物移动速度为实际速度）

使用示例：

```actionscript
parent.$mc_ctrler.dash(3);
```

> ###### dashStop

传入参数：loseSpdPercent:Number = 0.5

返回类型：void

说明：结束冲刺（参数乘人物移动速度为实际失速度）

使用示例：

```actionscript
parent.$mc_ctrler.dashStop();
```

> ###### setAllAct

传入参数：无

返回类型：void

说明：设定所有地面的动作可执行

使用示例：

```actionscript
parent.$mc_ctrler.setAllAct();
```

> ###### setAirAllAct

传入参数：无

返回类型：void

说明：设定所有空中的动作可执行

使用示例：

```actionscript
parent.$mc_ctrler.setAirAllAct();
```

> ###### setAirMove

传入参数：v:Boolean

返回类型：void

说明：设置空中是否可移动

使用示例：

```actionscript
parent.$mc_ctrler.setAirMove(true);
```

> ###### setMove

传入参数：无

返回类型：void

说明：设置可行走（A和D）

使用示例：

```actionscript
parent.$mc_ctrler.setMove();
```

> ###### setDefense

传入参数：无

返回类型：void

说明：设置可防御（S）

使用示例：

```actionscript
parent.$mc_ctrler.setDefense();
```

> ###### setJump

传入参数：action:String = "跳"

返回类型：void

说明：设置可跳（K）

使用示例：

```actionscript
parent.$mc_ctrler.setJump();
```

> ###### 正常模式专用 setJumpQuick

传入参数：action:String = "跳"

返回类型：void

说明：设置可快速跳（K）

使用示例：

```actionscript
parent.$mc_ctrler.setJumpQuick();
```

> ###### setJumpDown

传入参数：action:String = "落"

返回类型：void

说明：设置可下台阶（SK）

使用示例：

```actionscript
parent.$mc_ctrler.setJumpDown();
```

> ###### setDash

传入参数：action:String = "瞬步"

返回类型：void

说明：设置可瞬步（L）

使用示例：

```actionscript
parent.$mc_ctrler.setDash();
```

> ###### FVO专用 setDashBack

传入参数：action:String = "起身"

返回类型：void

说明：设置可后撤步（SL）

使用示例：

```actionscript
parent.$mc_ctrler.setDashBack();
```

> ###### setAttack

传入参数：action:String = "砍1"

返回类型：void

说明：设置可攻击（J）

使用示例：

```actionscript
parent.$mc_ctrler.setAttack();
```

> ###### setSkill1

传入参数：action:String = "砍技1"

返回类型：void

说明：设置可技能1（SJ）

使用示例：

```actionscript
parent.$mc_ctrler.setSkill1();
```

> ###### setSkill2

传入参数：action:String = "砍技2"

返回类型：void

说明：设置可技能2（WJ）

使用示例：

```actionscript
parent.$mc_ctrler.setSkill2();
```

> ###### setZhao1

传入参数：action:String = "招1"

返回类型：void

说明：设置可招1（U）

使用示例：

```actionscript
parent.$mc_ctrler.setZhao1();
```

> ###### setZhao2

传入参数：action:String = "招2"

返回类型：void

说明：设置可招2（SU）

使用示例：

```actionscript
parent.$mc_ctrler.setZhao2();
```

> ###### setZhao3

传入参数：action:String = "招3"

返回类型：void

说明：设置可招3（WU）

使用示例：

```actionscript
parent.$mc_ctrler.setZhao3();
```

> ###### setCatch1

传入参数：action:String = "摔1"

返回类型：void

说明：设置可摔1（ADJ）

使用示例：

```actionscript
parent.$mc_ctrler.setCatch1();
```

> ###### setCatch2

传入参数：action:String = "摔2"

返回类型：void

说明：设置可摔2（ADU）

使用示例：

```actionscript
parent.$mc_ctrler.setCatch2();
```

> ###### setBisha

传入参数：action:String = "必杀" , qi:int = 100

返回类型：void

说明：设置可必杀（I）

使用示例：

```actionscript
parent.$mc_ctrler.setBisha();
```

> ###### setBishaUP

传入参数：action:String = "上必杀" , qi:int = 100

返回类型：void

说明：设置可上必杀（WI）

使用示例：

```actionscript
parent.$mc_ctrler.setBishaUP();
```

> ###### setBishaSUPER

传入参数：action:String = "超必杀" , qi:int = 300

返回类型：void

说明：设置可超必杀（SI）

使用示例：

```actionscript
parent.$mc_ctrler.setBishaSUPER();
```

> ###### setAttackAIR

传入参数：action:String = "跳砍"

返回类型：void

说明：设置可跳砍（KJ）

使用示例：

```actionscript
parent.$mc_ctrler.setAttackAIR();
```

> ###### setSkillAIR

传入参数：action:String = "跳招"

返回类型：void

说明：设置跳招（KU）

使用示例：

```actionscript
parent.$mc_ctrler.setSkillAIR();
```

> ###### setBishaAIR

传入参数：action:String = "空中必杀" , qi:int = 100

返回类型：void

说明：设置可空中必杀（KI）

使用示例：

```actionscript
parent.$mc_ctrler.setBishaAIR();
```

> ###### setWankai

传入参数：action:String = "万解"（3.3改动：无）

返回类型：void

说明：设置可变身（JK）（3.3改动：JK、SJK、WJK）

使用示例：

```actionscript
parent.$mc_ctrler.setWankai();
```

> ###### setTouchFloor

传入参数：action:String = "落地" , breakAct:Boolean

返回类型：void

说明：设定落地的动作（参数1：落地时执行的动作，参数2：接触到地面时是否中断当前动作）

使用示例：

```actionscript
parent.$mc_ctrler.setTouchFloor("跳招2",true);
```

> ###### setHitTarget

传入参数：checker:String , action:String

返回类型：void

说明：设定检测碰撞后攻击（参数1：待检测对象的名称，参数2：碰撞后执行的动作）

使用示例：

```actionscript
parent.$mc_ctrler.setHitTarget("kj10","砍技12");
```

> ###### setHurtAction

传入参数：action:String

返回类型：void

说明：人物被打时执行动作，用于反制技能，注意跳转到的帧处须是无敌状态

使用示例：

```actionscript
parent.$mc_ctrler.setHurtAction("招22");
```

> ###### move

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：持续移动

使用示例：

```actionscript
parent.$mc_ctrler.move(8,0);
```

> ###### movePercent

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：按角色速度的百分比持续移动

使用示例：

```actionscript
parent.$mc_ctrler.movePercent(1,0);
```

> ###### stopMove

传入参数：无

返回类型：void

说明：停止移动

使用示例：

```actionscript
parent.$mc_ctrler.stopMove();
```

> ###### damping

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：设置阻力

使用示例：

```actionscript
parent.$mc_ctrler.damping(0.8,0);
```

> ###### dampingPercent

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：按角色速度的百分比设置阻力

使用示例：

```actionscript
parent.$mc_ctrler.dampingPercent(0.1,0);
```

> ###### endAct

传入参数：无

返回类型：void

说明：清除纽带，使对方AI检测我方角色状态为硬直状态，清除人物的特殊状态

使用示例：

```actionscript
parent.$mc_ctrler.endAct();
```

> ###### fire

传入参数：mcName:String , params:Object = null

返回类型：void

说明：发射子弹、波（即飞行道具）

使用示例：

- [详细介绍](zh-cn/core-object-classes/Bullet)


```actionscript
parent.$mc_ctrler.fire("zh1atm",{x:{start:15,hit:3},y:0,hold:2,hits:1,hp:100});

/*

参数2(params)填写说明，(小括号和中文字符均为提示文本，需要删除)

x:Number(水平固定速度)
或
{start:Number(开始速度),add:Number(加速度),max:Number(最大速度),min:Number(最小速度),hit:Number(攻击到速度)},(水平可变速度)
y:Number(竖直固定速度)
或
{start:Number(开始速度),add:Number(加速度),max:Number(最大速度),min:Number(最小速度),hit:Number(攻击到速度)},(竖直可变速度)
hold:int(存在时长),
hits:int(攻击次数),
hp:int(血量,默认为100)
*/

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

> ###### addAttacker

传入参数：mcName:String , params:Object = null

返回类型：void

说明：加入攻击对象（即独立道具）

使用示例：

- [详细介绍](zh-cn/main-fighter-ctrlers/FighterAttackerCtrler)
- [详细介绍](zh-cn/core-object-classes/FighterAttacker)

```actionscript
parent.$mc_ctrler.addAttacker("bsmc",{applyG:false});

/*
参数2(params)填写说明，(小括号和中文字符均为提示文本，需要删除)

x:{moveToTarget:Boolean(是否移动到目标),followTarget:Boolean(是否跟随目标),offset:Number(距离目标偏移量),range:Array[left,right](攻击范围)},
y:{moveToTarget:Boolean(是否移动到目标),followTarget:Boolean(是否跟随目标),offset:Number(距离目标偏移量),range:Array[top,bottom](攻击范围)},
applyG:Boolean(是否受重力影响)
*/

/*
如果比较复杂，需要在攻击对象元件内部加入代码，实现接口
var $attacker_ctrler:*;
function setAttackerCtrler(attackerCtrler:*):void{
    $attacker_ctrler = attackerCtrler;
}
*/
```

> ###### getAttacker

传入参数：name:String

返回类型：FighterAttackerCtrler

说明：获取通过addAttacker加入的对象（可用于控制攻击对象）

使用示例：

```actionscript
parent.$mc_ctrler.getAttacker("bsmc").move(4,4);
```

> ###### isApplyG

传入参数：v:Boolean

返回类型：void

说明：设置人物是否受重力影响

使用示例：

```actionscript
parent.$mc_ctrler.isApplyG(false);
```

> ###### gotoAndPlay

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
parent.$mc_ctrler.gotoAndPlay("帧标签");
```

> ###### gotoAndStop

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
parent.$mc_ctrler.gotoAndStop("帧标签");
```

> ###### hurtFly

传入参数：x:Number , y:Number

返回类型：void

说明：将自身击飞

使用示例：

```actionscript
parent.$mc_ctrler.hurtFly(-10,0);
```

> ###### justHitToPlay

传入参数：hitid:String , frame:String , noIdle:Boolean = false , inCludeDefense:Boolean = false

返回类型：void

说明：判定指定攻击是否打中对方，是则跳转到相应的帧标签（参数1：检测的攻击ID，不含”atm“，参数2：检测成功后跳转到的相应帧标签，参数3：如果检测失败，是否跳转到站立，参数4：对方防御时是否继续攻击）

使用示例：

```actionscript
parent.$mc_ctrler.justHitToPlay("攻击ID","帧标签",false,false);
```

> ###### moveTarget

传入参数：params:Object = null

返回类型：void

说明：对对方产生吸引力

使用示例：

```actionscript
parent.$mc_ctrler.moveTarget({followmc: "move_mc"});

/*
参数(params)填写说明，(小括号和中文字符均为提示文本，需要删除)

x:Number(水平位置),
y:Number(竖直位置), 
followmc:String(设置此值时以该影片剪辑为中心吸引对方，此处应填写影片剪辑的名称),
speed:Number(吸引速度)
或
{x:Number,y:Number}(水平、竖直吸引分速度）
*/

/*
补充说明
    吸引速度为0或不设置时，直接移动对方到相应位置
    参数填写null时效果为结束吸引：parent.$mc_ctrler.moveTarget(null);
*/
```

> ###### getAction

传入参数：无

返回类型：FighterAction

说明：获取人物活动

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterAction)

```actionscript
var fighterAcion = parent.$mc_ctrler.getAction();
```

> ###### sayIntro

传入参数：无

返回类型：void

说明：播放“开场”动作

使用示例：

```actionscript
parent.$mc_ctrler.sayIntro();
```

> ###### doWin

传入参数：无

返回类型：void

说明：播放“胜利”动作

使用示例：

```actionscript
parent.$mc_ctrler.doWin();
```

> ###### doLose

传入参数：无

返回类型：void

说明：播放“失败”动作

使用示例：

```actionscript
parent.$mc_ctrler.doLose();
```

> ###### getFighterMc

传入参数：无

返回类型：FighterMC

说明：获取人物MC

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMC)

```actionscript
var fighterMC = parent.$mc_ctrler.getFighterMc();
```

> ###### getCurAction

传入参数：无

返回类型：String

说明：获取人物当前所执行的动作的帧标签（大多数基础动作无法通过此接口获取）

使用示例：

```actionscript
var curAcion: String = parent.$mc_ctrler.getCurAction();
```

> ###### setMc

传入参数：mc:FighterMC

返回类型：void

说明：为人物设定FighterMc

使用示例：

```actionscript
parent.$mc_ctrler.setMc();
```

> ###### beHit

传入参数：hitvo:HitVO , hitRect:Rectangle = null

返回类型：void

说明：被打（参数1：指定攻击值对象，参数2：攻击范围矩形）

使用示例：

```actionscript
parent.$mc_ctrler.beHit();
```

> ###### touchFloor

传入参数：无

返回类型：void

说明：若人物在空中，播放落地的动作

使用示例：

```actionscript
parent.$mc_ctrler.touchFloor();
```

> ###### moveMC

传入参数：mmc:DisplayObject, x:Object = null, y:Object = null

返回类型：void

说明：以我方的的位置为原点，移动指定元件

使用示例：

```actionscript
parent.$mc_ctrler.moveMC(mc1, 0, 0);        //将mc1移动到与主人物相同的坐标
x/y参数为非Number类型对象时的情况的用途不明，待后续补充
```

> ###### FVO专用 setFly

传入参数：flying:Boolean, params:Object = null

返回类型：void

说明：设置可飞行

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

传入参数：frame:String = null

返回类型：void

说明：未蓄力攻击

使用示例：

```actionscript
parent.$mc_ctrler.unHoldAttack("砍32");
```

> ###### FVO专用 unHoldSkill

传入参数：frame:String = null

返回类型：void

说明：未蓄力技能

使用示例：

```actionscript
parent.$mc_ctrler.unHoldSkill("招22");
```

> ###### FVO专用 unHoldBisha

传入参数：frame:String = null

返回类型：void

说明：未蓄力必杀

使用示例：

```actionscript
parent.$mc_ctrler.unHoldBisha("上必杀2");
```

> ###### 3.3增加 setSteelBody

传入参数：v:Boolean, isSuper:Boolean = false

返回类型：void

说明：设置钢身效果（参数1：开启或关闭钢身，参数2：是否开启超级钢身）

使用示例：

```actionscript
parent.$mc_ctrler.setSteelBody(true,false);
```

 
# Assister控制器

### 属性

> ###### effect

类型：FighterEffectCtrl

说明：辅助人物的effect控制器

使用示例：

```actionscript
var effect = $assisterCtrler.effect;        //将辅助人物的effect控制器赋值到变量effect
```

> ###### hitModel

类型：FighterHitModel

说明：辅助人物的攻击模型

使用示例：

```actionscript
$assisterCtrler.hitModel.setPowerRate(2);       //将自身的攻击力倍数设置为2
```

> ###### owner_mc_ctrler

类型：FighterMcCtrler

说明：辅助人物的主人的mc控制器（只读）

使用示例：

```actionscript
var oMc = $assisterCtrler.owner_mc_ctrler;      //将辅助人物的主人的mc控制器赋值到变量oMc
```

> ###### owner_fighter_ctrler

类型：FighterCtrler

说明：辅助人物的主人的fighter控制器（只读）

使用示例：

```actionscript
var oFighter = $assisterCtrler.owner_fighter_ctrler;        //将辅助人物的主人的fighter控制器赋值到变量oFighter
```

### 方法

> ###### getTarget

传入参数：无

返回类型：IGameSprite

说明：获取敌人对象

使用示例：

- [详细介绍](https://diazynez.github.io/api/FighterMain.html)

```actionscript
var target = $assisterCtrler.getTarget();
```

> ###### getOwner

传入参数：无

返回类型：IGameSprite

说明：获取主人对象

使用示例：

- [详细介绍](https://diazynez.github.io/api/FighterMain.html)

```actionscript
var owner = $assisterCtrler.getOwner();
```

> ###### 3.3增加 getSelf

传入参数：无

返回类型：Assister

说明：获取自身对象

使用示例：

- [详细介绍](https://diazynez.github.io/api/Assister.html)

```actionscript
var self = $assisterCtrler.getSelf();
```

> ###### setApplyG

传入参数：v:Boolean

返回类型：void

说明：设置辅助人物是否受重力影响

使用示例：

```actionscript
$assisterCtrler.setApplyG(false);
```

> ###### defineAction

传入参数：id:String , obj:Object

返回类型：void

说明：定义攻击ID

使用示例：

[defineAction](../../tools/defineAction.html ':include :type=iframe width=100% height=491px')

```actionscript
$assisterCtrler.defineAction("tk" ,{power:30 , hitType:1 , hitx:2 , hity:6 , hurtTime:300 , hurtType:0 , isBreakDef:false});

/*
obj的定义:
power:Number = 0（攻击力）
hitType:int = 1（攻击类型）
hitx:Number = 0（受力X）
hity:Number = 0（受力Y）
hurtTime:Number = 300（硬直时间）
hurtType:int = 0（是否击倒）
isBreakDef:Boolean = false（是否破防）
powerRate:Number = 1（攻击力倍数）
checkDirect:Boolean = true（是否开启背击破防特性）
doubleHurtType:int = 0（第二击是否击倒）
*/
```

> ###### finish

传入参数：showEffect:Boolean = true

返回类型：void

说明：结束自己（包含removeSelf的功能）

使用示例：

```actionscript
$assisterCtrler.finish();
```

> ###### removeSelf

传入参数：无

返回类型：void

说明：删除自身

使用示例：

```actionscript
 $assisterCtrler.removeSelf();
```

> ###### endAct

传入参数：无

返回类型：void

说明：使AI检测辅助人物状态为非攻击状态

使用示例：

```actionscript
$assisterCtrler.endAct();
```

> ###### moveToTarget

传入参数：x:Object = null, y:Object = null, setDirect:Boolean = true

返回类型：void

说明：移动到敌人的位置（x/y填null则横/纵向不进行移动）（x : X位置偏移，y : Y位置偏移，setDirect : 是否面向敌人）

使用示例：

```actionscript
$assisterCtrler.moveToTarget(0,0,true);
```

> ###### setDirectToTarget

传入参数：无

返回类型：void

说明：使自身面对敌人

使用示例：

```actionscript
$assisterCtrler.setDirectToTarget();
```

> ###### move

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：持续移动

使用示例：

```actionscript
$assisterCtrler.move(8,0);
```

> ###### damping

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：设置阻力

使用示例：

```actionscript
$assisterCtrler.damping(0.8,0);
```

> ###### stop

传入参数：无

返回类型：void

说明：停止播放辅助人物动画

使用示例：

```actionscript
$assisterCtrler.stop();
```

> ###### gotoAndPlay

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
$assisterCtrler.gotoAndPlay("帧标签");
```

> ###### gotoAndStop

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
$assisterCtrler.gotoAndStop("帧标签");
```

> ###### setTouchFloor

传入参数：frame:String

返回类型：void

说明：设定落地的动作（参数表示落地时执行的动作）

使用示例：

```actionscript
$assisterCtrler.setTouchFloor("落地");
```

> ###### setHitTarget

传入参数：checker:String, action:String

返回类型：void

说明：设定检测碰撞后攻击（参数1：待检测对象的名称，参数2：碰撞后执行的动作）

使用示例：

```actionscript
$assisterCtrler.setHitTarget("atm1","碰到");
```

> ###### justHit

传入参数：hitId:String, playFrame:String = null, includeDefense:Boolean = false

返回类型：Boolean

说明：判断敌人是否被指定攻击面命中（参数1：检测的攻击ID，不含”atm“，参数2：检测成功后跳转到的相应帧标签，参数3：防御时是否调用）

使用示例：

```actionscript
//用法1
if ($assisterCtrler.justHit("atm1"))
{
    $assisterCtrler.finish();
}   //当敌人被atm1打中，并为真命中时，结束自己

//用法2
$assisterCtrler.justHit("atm1","击中")
```

> ###### fire

传入参数：mcName:String , params:Object = null

返回类型：void

说明：发射子弹、波（即飞行道具）

使用示例：

```actionscript
$assisterCtrler.fire("zh1atm",{x:{start:15,hit:3},y:0,hold:2,hits:1,hp:100});

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

- [详细介绍](https://diazynez.github.io/api/FighterAttackerCtrler.html)

```actionscript
$assisterCtrler.addAttacker("bsmc",{applyG:false});

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

> ###### 3.3增加 checkHitOwner

传入参数：mcName:String

返回类型：void

说明：判断主人是否与指定元件接触（参数表示元件名称）

使用示例：

```actionscript
if ($attacker_ctrler.checkHitOwner("mc1"))
{
    $attacker_ctrler.finish();
}   //当主人与mc1碰撞时，结束自己
```
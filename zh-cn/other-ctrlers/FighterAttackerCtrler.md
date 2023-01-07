# 攻击对象控制器

### 属性

> ###### effect

类型：FighterEffectCtrl

说明：攻击对象的主人的Effect控制器

使用示例：

```actionscript
var effectCtrl = $attacker_ctrler.effect;
```

> ###### ownerMc

类型：FighterMcCtrler

说明：攻击对象的主人的mc控制器

使用示例：

```actionscript
var oMc = $attacker_ctrler.ownerMc;
```

> ###### owner_mc_ctrler

类型：FighterMcCtrler

说明：攻击对象的主人的Mc控制器（只读）

使用示例：

```actionscript
var oMc = $attacker_ctrler.owner_mc_ctrler;
```

> ###### owner_fighter_ctrler

类型：FighterCtrler

说明：攻击对象的主人的Fighter控制器（只读）

使用示例：

```actionscript
var oFighter = $attacker_ctrler.owner_fighter_ctrler;
```

### 方法

> ###### move

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：持续移动

使用示例：

```actionscript
$attacker_ctrler.move(8, 0);
```

> ###### damping

传入参数：x:Number=0 , y:Number=0

返回类型：void

说明：设置阻力

使用示例：

```actionscript
$attacker_ctrler.damping(0.8, 0);
```

> ###### moveToTarget

传入参数：offsetX:Number = NaN, offsetY:Number = NaN

返回类型：void

说明：移动到对方的位置

使用示例：

```actionscript
$attacker_ctrler.moveToTarget(0, 0);
```

> ###### endAct

传入参数：无

返回类型：void

说明：使AI检测攻击对象状态为非攻击状态

使用示例：

```actionscript
$attacker_ctrler.endAct();
```

> ###### stop

传入参数：无

返回类型：void

说明：停止攻击对象动画

使用示例：

```actionscript
$attacker_ctrler.stop();
```

> ###### gotoAndPlay

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
$attacker_ctrler.gotoAndPlay("帧标签");
```

> ###### gotoAndStop

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
$attacker_ctrler.gotoAndStop("帧标签");
```

> ###### setTouchFloor

传入参数：frame:String

返回类型：void

说明：设定落地的动作（参数表示落地时执行的动作）

使用示例：

```actionscript
$attacker_ctrler.setTouchFloor("落地");
```

> ###### setHitTarget

传入参数：checker:String, action:String

返回类型：void

说明：设定检测碰撞后攻击（参数1：待检测对象的名称，参数2：碰撞后执行的动作）

使用示例：

```actionscript
$attacker_ctrler.setHitTarget("kj1atm", "碰到");
```

> ###### justHit

传入参数：hitId:String

返回类型：Boolean

说明：判断对方是否被指定攻击面命中（参数表示检测的攻击ID，不含”atm“）

使用示例：

```actionscript
if ($attacker_ctrler.justHit("zh2"))
{
    $attacker_ctrler.removeSelf();
}   //当对方被zh2atm打中，并为真命中时，删除自身
```

> ###### setCrossMap

传入参数：v:Boolean

返回类型：void

说明：设置自身是否可以穿过地图边界

使用示例：

```actionscript
$attacker_ctrler.setCrossMap(false);
```

> ###### stopFollowTarget

传入参数：无

返回类型：void

说明：停止追踪对方

使用示例：

```actionscript
$attacker_ctrler.stopFollowTarget();
```

> ###### removeSelf

传入参数：无

返回类型：void

说明：删除自身

使用示例：

```actionscript
$attacker_ctrler.removeSelf();
```

> ###### 3.3增加 fire

传入参数：mcName:String , params:Object = null

返回类型：void

说明：发射子弹、波（即飞行道具）

使用示例：

- [详细介绍](zh-cn/core-object-classes/Bullet)

[fire](../../tools/fire.html ':include :type=iframe width=100% height=653px')

```actionscript
$attacker_ctrler.fire("zh1atm",{x:{start:15,hit:3},y:0,hold:2,hits:1,hp:100});

/*
参数2(params)填写说明，(小括号和中文字符均为提示文本，需要删除)

x:Number(水平固定速度)
或
{start:Number(开始速度),add:Number(加速度),max:Number(最大速度),min:Number(最小速度),hit:Number(命中速度)},(水平可变速度)
y:Number(竖直固定速度)
或
{start:Number(开始速度),add:Number(加速度),max:Number(最大速度),min:Number(最小速度),hit:Number(命中速度)},(竖直可变速度)
hold:int(存在时长),
hits:int(攻击次数),
hp:int(血量,默认为100),
effect:{shadow:[0,0,0]}(残影效果，FVO专用)
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

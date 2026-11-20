# 攻击对象控制器

### 实现接口

```
var $attacker_ctrler:*;
function setAttackerCtrler(attackerCtrler:*):void{
    $attacker_ctrler = attackerCtrler;
}
```

### 属性

> ###### effect

类型：[`FighterEffectCtrl`](zh-cn/main-fighter-ctrlers/FighterEffectCtrl)

说明：攻击对象主人的Effect控制器

<div class="version-note">

3.8开发改动：effect 改为攻击对象自身的Effect控制器

</div>

使用示例：

```actionscript
$attacker_ctrler.effect.shine(0xFFFFFF);
```

> ###### ownerMc

类型：[`FighterMcCtrler`](zh-cn/main-fighter-ctrlers/FighterMcCtrler)

说明：攻击对象主人的Mc控制器

使用示例：

```actionscript
var oMc = $attacker_ctrler.ownerMc;
```

> ###### owner_mc_ctrler

类型：[`FighterMcCtrler`](zh-cn/main-fighter-ctrlers/FighterMcCtrler)

说明：攻击对象主人的Mc控制器（只读）

使用示例：

```actionscript
var oMc = $attacker_ctrler.owner_mc_ctrler;
```

> ###### owner_fighter_ctrler

类型：[`FighterCtrler`](zh-cn/main-fighter-ctrlers/FighterCtrler)

说明：攻击对象的主人的Fighter控制器（只读）

使用示例：

```actionscript
var oFighter = $attacker_ctrler.owner_fighter_ctrler;
```

<span id="targetchecker"></span>

> ###### 3.8开发增加 targetChecker

类型：`String`

说明：取得当前用于检测目标碰撞的元件名称（只读）

使用示例：

```actionscript
var targetChecker1:String = $attacker_ctrler.targetChecker;
```

<span id="ownerchecker"></span>

> ###### 3.8开发增加 ownerChecker

类型：`String`

说明：取得当前用于检测主人碰撞的元件名称（只读）

使用示例：

```actionscript
var ownerChecker1:String = $attacker_ctrler.ownerChecker;
```

### 方法

> ###### move

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：持续移动

使用示例：

```actionscript
$attacker_ctrler.move(8, 0);
```

<span id="stopmove"></span>

> ###### 3.8开发增加 stopMove

传入参数：无

返回类型：`void`

说明：将水平和竖直速度同时设为 0

使用示例：

```actionscript
$attacker_ctrler.stopMove();
```

> ###### damping

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：设置阻力

使用示例：

```actionscript
$attacker_ctrler.damping(0.8, 0);
```

> ###### moveToTarget

传入参数：`offsetX:Number = NaN, offsetY:Number = NaN`

返回类型：`void`

说明：移动到对方的位置

使用示例：

```actionscript
$attacker_ctrler.moveToTarget(0, 0);
```

<span id="getowner"></span>

> ###### 3.8开发增加 getOwner

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：取得直接主人，可能为人物或辅助人物；无主人时返回 null

使用示例：

```actionscript
var owner1 = $attacker_ctrler.getOwner();
```

<span id="getownerfighter"></span>

> ###### 3.8开发增加 getOwnerFighter

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：取得主人；直接主人是辅助人物时继续取它的主人

使用示例：

```actionscript
var ownerFighter1 = $attacker_ctrler.getOwnerFighter();
```

<span id="gettargetfighter"></span>

> ###### 3.8开发增加 getTargetFighter

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：根据直接主人获取当前目标；不支持的主人类型或无目标时返回 null

使用示例：

```actionscript
var targetFighter1 = $attacker_ctrler.getTargetFighter();
```

<span id="getself"></span>

> ###### 3.8开发增加 getSelf

传入参数：无

返回类型：[`FighterAttacker`](zh-cn/core-object-classes/FighterAttacker)

说明：取得当前 FighterAttacker 主体

使用示例：

```actionscript
var attacker1 = $attacker_ctrler.getSelf();
```

<span id="setdirectreverse"></span>

> ###### 3.8开发增加 setDirectReverse

传入参数：无

返回类型：`void`

说明：使自身转向相反方向

使用示例：

```actionscript
$attacker_ctrler.setDirectReverse();
```

<span id="setapplyg"></span>

> ###### 3.8开发增加 setApplyG

传入参数：`b:Boolean`

返回类型：`void`

说明：设置是否受重力影响

使用示例：

```actionscript
$attacker_ctrler.setApplyG(false);
```

<span id="setallowcrossfloor"></span>

> ###### 3.8开发增加 setAllowCrossFloor

传入参数：`b:Boolean`

返回类型：`void`

说明：设置是否允许穿过地图平台

使用示例：

```actionscript
$attacker_ctrler.setAllowCrossFloor(true);
```

> ###### endAct

传入参数：无

返回类型：`void`

说明：使AI检测攻击对象状态为非攻击状态

使用示例：

```actionscript
$attacker_ctrler.endAct();
```

> ###### stop

传入参数：无

返回类型：`void`

说明：停止攻击对象动画

使用示例：

```actionscript
$attacker_ctrler.stop();
```

> ###### gotoAndPlay

传入参数：`frame:String`

返回类型：`void`

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
$attacker_ctrler.gotoAndPlay("帧标签");
```

> ###### gotoAndStop

传入参数：`frame:String`

返回类型：`void`

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
$attacker_ctrler.gotoAndStop("帧标签");
```

> ###### setTouchFloor

传入参数：`frame:String`

返回类型：`void`

说明：设定落地的动作（参数表示落地时执行的动作）

使用示例：

```actionscript
$attacker_ctrler.setTouchFloor("落地");
```

<span id="settouchside"></span>

> ###### 3.8开发增加 setTouchSide

传入参数：`action:String`

返回类型：`void`

说明：登记碰到地图侧边时执行的动作标签

使用示例：

```actionscript
$attacker_ctrler.setTouchSide("招2");
```

> ###### setHitTarget

传入参数：`checker:String, action:String`<br>
传入参数（3.8开发）：`checker:String, action:String, isCheckTargetIsAllowBeHit:Boolean = true, isResponseTargetGameSprite:Boolean = true`

返回类型：`void`

说明：设定检测碰撞后攻击（参数1：待检测对象的名称，参数2：碰撞后执行的动作）

<div class="version-note">

3.8开发改动：增加是否要求目标可受击、是否将碰撞目标作为响应对象两个开关，默认均为 true

</div>

使用示例：

```actionscript
$attacker_ctrler.setHitTarget("kj1atm", "碰到");
```

> ###### justHit

传入参数：`hitId:String`

返回类型：`Boolean`

说明：判断对方是否被指定攻击面命中（参数表示检测的攻击ID，不含”atm“）

使用示例：

```actionscript
if ($attacker_ctrler.justHit("zh2"))
{
    $attacker_ctrler.removeSelf();
}   //当对方被zh2atm打中，并为真命中时，删除自身
```

> ###### setCrossMap

传入参数：`v:Boolean`

返回类型：`void`

说明：设置自身是否可以穿过地图边界

使用示例：

```actionscript
$attacker_ctrler.setCrossMap(false);
```

<span id="setcrossfloor"></span>

> ###### 3.8开发增加 setCrossFloor

传入参数：`b:Boolean`

返回类型：`void`

说明：设置是否穿过平台，与 setAllowCrossFloor 修改同一属性

使用示例：

```actionscript
$attacker_ctrler.setCrossFloor(true);
```

> ###### stopFollowTarget

传入参数：无

返回类型：`void`

说明：停止追踪对方

使用示例：

```actionscript
$attacker_ctrler.stopFollowTarget();
```

> ###### removeSelf

传入参数：无

返回类型：`void`

说明：删除自身

使用示例：

```actionscript
$attacker_ctrler.removeSelf();
```

<span id="fire"></span>

> ###### 3.3增加 fire

传入参数：`mcName:String , params:Object = null`

返回类型：`void`

说明：发射飞行道具（子弹、波等）

params 的配置与[飞行道具的速度、存在时长、可攻击次数、血量及可用版本](zh-cn/core-object-classes/Bullet?id=fire-params)一致，编写器按目标版本显示可用参数

使用示例：

- [详细介绍](zh-cn/core-object-classes/Bullet)

```actionscript
$attacker_ctrler.fire("zh1atm",{x:{start:15,hit:3},y:0,hold:2,hits:1,hp:100});

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

<span id="addrenderfunc"></span>

> ###### 3.8开发增加 addRenderFunc

传入参数：`func:Function = null, params:Object = null`

返回类型：`void`

说明：注册逐帧回调，同一函数在同一回调列表中不会重复注册。params 的配置如下：

- 不传 params：跟随对象的动画更新
- `{isFollowFps:true}`：跟随对象的逻辑更新频率
- `{isFollowFps:true, isPermanent:true}`：在独立的全局更新后回调中执行，与对象通常的逻辑和动画更新分开调度

isPermanent 仅在 isFollowFps 为 true 时有效；持久回调仍会在对象销毁时清理。回调的执行频率由对应的动画或逻辑更新决定

使用示例：

```actionscript
// 登记后持续朝向当前目标；停止时移除同一个回调
function faceTarget1():void
{
    var target1 = $attacker_ctrler.getTargetFighter();
    if (target1 != null)
    {
        $attacker_ctrler.getSelf().direct = target1.x >= $attacker_ctrler.getSelf().x ? 1 : -1;
    }
}
$attacker_ctrler.addRenderFunc(faceTarget1, {isFollowFps:true});

// 在停止跟随朝向的帧中执行，传入同一个函数引用
$attacker_ctrler.removeRenderFunc(faceTarget1);
```

<span id="removerenderfunc"></span>

> ###### 3.8开发增加 removeRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：从逐帧回调列表移除指定函数，必须传入注册时的同一个 Function 引用

使用示例：

```actionscript
function faceTarget1():void
{
    var target1 = $attacker_ctrler.getTargetFighter();
    if (target1 != null)
    {
        $attacker_ctrler.getSelf().direct = target1.x >= $attacker_ctrler.getSelf().x ? 1 : -1;
    }
}
// 注册回调
$attacker_ctrler.addRenderFunc(faceTarget1, {isFollowFps:true});

// 在结束跟随的帧中移除，使用登记时的同一个函数引用
$attacker_ctrler.removeRenderFunc(faceTarget1);
```

# 辅助人物控制器

### 属性

> ###### effect

类型：[`FighterEffectCtrl`](zh-cn/main-fighter-ctrlers/FighterEffectCtrl)

说明：辅助人物的Effect控制器

使用示例：

```actionscript
$assisterCtrler.effect.shake(3, 3, 0.2);
```

<span id="targetchecker"></span>

> ###### 3.8开发增加 targetChecker

类型：`String`

说明：取得当前用于检测目标碰撞的元件名称（只读）

使用示例：

```actionscript
var targetChecker1:String = $assisterCtrler.targetChecker;
```

<span id="ownerchecker"></span>

> ###### 3.8开发增加 ownerChecker

类型：`String`

说明：取得当前用于检测主人碰撞的元件名称（只读）

使用示例：

```actionscript
var ownerChecker1:String = $assisterCtrler.ownerChecker;
```

> ###### hitModel

类型：[`FighterHitModel`](zh-cn/data-model-classes/FighterHitModel)

说明：辅助人物的攻击模型

使用示例：

```actionscript
// 调整已定义攻击 k1 的攻击力与硬直时间
$assisterCtrler.hitModel.getHitVO("k1").power = 50;
$assisterCtrler.hitModel.getHitVO("k1").hurtTime = 400;
```

> ###### owner_mc_ctrler

类型：[`FighterMcCtrler`](zh-cn/main-fighter-ctrlers/FighterMcCtrler)

说明：辅助人物的主人的Mc控制器（只读）

使用示例：

```actionscript
var oMc = $assisterCtrler.owner_mc_ctrler;
```

> ###### owner_fighter_ctrler

类型：[`FighterCtrler`](zh-cn/main-fighter-ctrlers/FighterCtrler)

说明：辅助人物的主人的Fighter控制器（只读）

使用示例：

```actionscript
var oFighter = $assisterCtrler.owner_fighter_ctrler;
```

<span id="enabled"></span>

> ###### 3.8开发增加 enabled

类型：`Boolean`

说明：读取或设置辅助人物的 enable 开关

使用示例：

```actionscript
$assisterCtrler.enabled = false;
```

<span id="usefzqi"></span>

> ###### 3.8开发增加 useFzqi

类型：`Boolean`

说明：读取或设置辅助调用是否使用辅助能量

使用示例：

```actionscript
$assisterCtrler.useFzqi = false;
```

### 方法

> ###### getTarget

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：获取对方的游戏对象

使用示例：

```actionscript
var target = $assisterCtrler.getTarget();
```

> ###### getOwner

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：获取主人的游戏对象

使用示例：

```actionscript
var owner = $assisterCtrler.getOwner();
```

<span id="getself"></span>

> ###### 3.3增加 getSelf

传入参数：无

返回类型：[`Assister`](zh-cn/core-object-classes/Assisiter)

说明：获取自身的游戏对象

使用示例：

```actionscript
var self = $assisterCtrler.getSelf();
```

<span id="setdirectreverse"></span>

> ###### 3.8开发增加 setDirectReverse

传入参数：无

返回类型：`void`

说明：使自身转向相反方向

使用示例：

```actionscript
$assisterCtrler.setDirectReverse();
```

> ###### setApplyG

传入参数：`v:Boolean`

返回类型：`void`

说明：设置辅助人物是否受重力影响

使用示例：

```actionscript
$assisterCtrler.setApplyG(false);
```

<span id="setallowcrossfloor"></span>

> ###### 3.8开发增加 setAllowCrossFloor

传入参数：`b:Boolean`

返回类型：`void`

说明：设置是否允许穿过地图平台

使用示例：

```actionscript
$assisterCtrler.setAllowCrossFloor(true);
```

> ###### defineAction

传入参数：`id:String , obj:Object`

返回类型：`void`

说明：定义攻击ID

obj 用于创建攻击值对象，配置字段与 [HitVO](zh-cn/data-model-classes/HitVO?id=define-action-params) 保持一致

<div class="version-note">

3.5增加增伤、慢放和镜头聚焦配置；3.8开发增加防御耐力消耗、被动脱离、防御受力、冻结时长及命中回调配置，名称和默认值见链接中的属性说明

</div>

使用示例：

```actionscript
$assisterCtrler.defineAction("tk" ,{power:30 , hitType:1 , hitx:2 , hity:6 , hurtTime:300 , hurtType:0 , isBreakDef:false});

```

[defineAction](../../tools/defineAction.html ':include :type=iframe width=100% height=557px')

> ###### finish

传入参数：`showEffect:Boolean = true`

返回类型：`void`

说明：结束辅助调用并移除自身。showEffect 决定是否播放辅助退场特效，默认 true；设为 false 时直接退场

使用示例：

```actionscript
$assisterCtrler.finish(false); // 不播放退场特效，直接结束辅助调用
```

> ###### removeSelf

传入参数：无

返回类型：`void`

说明：删除自身

使用示例：

```actionscript
 $assisterCtrler.removeSelf();
```

> ###### endAct

传入参数：无

返回类型：`void`

说明：使AI检测辅助人物状态为非攻击状态

使用示例：

```actionscript
$assisterCtrler.endAct();
```

> ###### moveToTarget

传入参数：`x:Object = null, y:Object = null, setDirect:Boolean = true`

返回类型：`void`

说明：移动到对方的位置（x/y填null则横/纵向不进行移动）（x : X位置偏移，y : Y位置偏移，setDirect : 是否面向对方）

使用示例：

```actionscript
$assisterCtrler.moveToTarget(0, 0, true);
```

> ###### setDirectToTarget

传入参数：无

返回类型：`void`

说明：使自身面对对方

使用示例：

```actionscript
$assisterCtrler.setDirectToTarget();
```

> ###### move

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：持续移动

使用示例：

```actionscript
$assisterCtrler.move(8, 0);
```

<span id="stopmove"></span>

> ###### 3.8开发增加 stopMove

传入参数：无

返回类型：`void`

说明：将水平和竖直速度同时设为 0

使用示例：

```actionscript
$assisterCtrler.stopMove();
```

> ###### damping

传入参数：`x:Number=0 , y:Number=0`

返回类型：`void`

说明：设置阻力

使用示例：

```actionscript
$assisterCtrler.damping(0.8, 0);
```

> ###### stop

传入参数：无

返回类型：`void`

说明：停止播放辅助人物动画

使用示例：

```actionscript
$assisterCtrler.stop();
```

> ###### gotoAndPlay

传入参数：`frame:String`

返回类型：`void`

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
$assisterCtrler.gotoAndPlay("帧标签");
```

> ###### gotoAndStop

传入参数：`frame:String`

返回类型：`void`

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
$assisterCtrler.gotoAndStop("帧标签");
```

> ###### setTouchFloor

传入参数：`frame:String`

返回类型：`void`

说明：设定落地的动作（参数表示落地时执行的动作）

使用示例：

```actionscript
$assisterCtrler.setTouchFloor("落地");
```

<span id="settouchside"></span>

> ###### 3.8开发增加 setTouchSide

传入参数：`action:String`

返回类型：`void`

说明：登记碰到地图侧边时执行的动作标签

使用示例：

```actionscript
$assisterCtrler.setTouchSide("招2");
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
$assisterCtrler.setHitTarget("atm1", "碰到");
```

> ###### justHit

传入参数：`hitId:String, playFrame:String = null, includeDefense:Boolean = false`

返回类型：`Boolean`

说明：判断对方是否被指定攻击命中；hitId 为攻击 ID，playFrame 为命中后播放的帧标签，留空时只返回判定结果；includeDefense 决定是否将被对方防御的命中也计入，默认 false

使用示例：

```actionscript
//用法1
if ($assisterCtrler.justHit("atm1"))
{
    $assisterCtrler.finish();
}   //当对方被atm1打中，并为真命中时，结束自己

//用法2
$assisterCtrler.justHit("atm1","击中")
```

> ###### fire

传入参数：`mcName:String , params:Object = null`

返回类型：`void`

说明：发射飞行道具（子弹、波等）

params 的配置与[飞行道具的速度、存在时长、可攻击次数、血量及可用版本](zh-cn/core-object-classes/Bullet?id=fire-params)一致，编写器按目标版本显示可用参数

使用示例：

- [详细介绍](zh-cn/core-object-classes/Bullet)

```actionscript
$assisterCtrler.fire("zh1atm",{x:{start:15,hit:3},y:0,hold:2,hits:1,hp:100});

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

3.8开发改动：增加 again 参数；通常使用前两个参数，具体重试由控制器处理

</div>

使用示例：

- [详细介绍](zh-cn/other-ctrlers/FighterAttackerCtrler)
- [详细介绍](zh-cn/core-object-classes/FighterAttacker)

```actionscript
$assisterCtrler.addAttacker("bsmc",{applyG:false});

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

<span id="checkhitowner"></span>

> ###### 3.3增加 checkHitOwner

传入参数：`mcName:String`

返回类型：`void`

说明：判断主人是否与指定元件接触（参数表示元件名称）

使用示例：

```actionscript
if ($attacker_ctrler.checkHitOwner("mc1"))
{
    $attacker_ctrler.finish();
}   //当主人与mc1碰撞时，结束自己
```

<span id="targetinrange"></span>

> ###### 3.8开发增加 targetInRange

传入参数：`rangeX:Array = null, rangeY:Array = null`

返回类型：`Boolean`

说明：判断目标是否在相对范围内；rangeX、rangeY 为 [最小值, 最大值]，水平方向随自身朝向换算，null 表示不限制该轴。应先确认 getTarget() 不为 null

使用示例：

```actionscript
if ($assisterCtrler.getTarget() != null && $assisterCtrler.targetInRange([0, 100], [-50, 50]))
{
    $assisterCtrler.gotoAndPlay("招1");
}
```

<span id="movetarget"></span>

> ###### 3.8开发增加 moveTarget

传入参数：`params:Object = null, target:IGameSprite = null`

返回类型：`void`

说明：按 params 吸引目标；可显式指定 target，省略时使用当前目标；传 null 取消已存在的吸引

使用示例：

```actionscript
// 将当前目标吸引到辅助人物前方 40、上方 20 的位置
var assister1 = $assisterCtrler.getSelf();
$assisterCtrler.moveTarget({x:assister1.x + 40 * assister1.direct, y:assister1.y - 20, speed:{x:4, y:2}});

// 在吸引动作结束时执行
$assisterCtrler.moveTarget(null);
```

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
    var target1 = $assisterCtrler.getTarget();
    if (target1 != null)
    {
        $assisterCtrler.getSelf().direct = target1.x >= $assisterCtrler.getSelf().x ? 1 : -1;
    }
}
$assisterCtrler.addRenderFunc(faceTarget1, {isFollowFps:true});

// 在停止跟随朝向的帧中执行，传入同一个函数引用
$assisterCtrler.removeRenderFunc(faceTarget1);
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
    var target1 = $assisterCtrler.getTarget();
    if (target1 != null)
    {
        $assisterCtrler.getSelf().direct = target1.x >= $assisterCtrler.getSelf().x ? 1 : -1;
    }
}
// 注册回调
$assisterCtrler.addRenderFunc(faceTarget1, {isFollowFps:true});

// 在结束跟随的帧中移除，使用登记时的同一个函数引用
$assisterCtrler.removeRenderFunc(faceTarget1);
```

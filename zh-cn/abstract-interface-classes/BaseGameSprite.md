# 基元游戏对象

> 此类实现[游戏对象接口](zh-cn/abstract-interface-classes/IGameSprite)，符合该数据模型

### 子类

- [人物主体](zh-cn/core-object-classes/FighterMain)
- [辅助人物主体](zh-cn/core-object-classes/Assisiter)
- [攻击对象主体](zh-cn/core-object-classes/FighterAttacker)

```
//子类可继承使用此类的所有属性和方法，若子类中存在同名属性或方法，效果以子类中的为准
```

```
//下文假设主体为$self_main，使用其他形式的主体时请自行替换
```

### 属性

> ###### isInAir

类型：`Boolean`

说明：游戏对象是否位于空中

使用示例：

```actionscript
if ($self_main.isInAir)
{
	$self_main.hp += 100;
}   //当游戏对象位于空中时，使其血量值增加100
```

> ###### isTouchBottom

类型：`Boolean`

说明：游戏对象是否接触地图底部边缘

使用示例：

```actionscript
if ($self_main.isTouchBottom)
{
	$self_main.hp += 100;
}   //当游戏对象触底时，使其血量值增加100
```

> ###### isAllowBeHit

类型：`Boolean`

说明：游戏对象是否允许受到攻击（默认为true）

使用示例：

```actionscript
//设置游戏对象不允许受到攻击
$self_main.isAllowBeHit = false;
```

> ###### isCross

类型：`Boolean`

说明：游戏对象是否允许穿越（默认为false）

使用示例：

```actionscript
//设置游戏对象可穿越
$self_main.isCross = true;
```

> ###### isAlive

类型：`Boolean`

说明：游戏对象是否存活（默认为true）

使用示例：

```actionscript
if ($self_main.isAlive)
{
	$self_main.hp += 100;
}   //当游戏对象存活时，使其血量值增加100
```

> ###### isAllowLoseHP

类型：`Boolean`

说明：游戏对象是否允许掉血（默认为true）

使用示例：

```
//设置游戏对象不允许掉血
$self_main.isAllowLoseHP = false;
```

> ###### isApplyG

类型：`Boolean`

说明：游戏对象是否开启重力（默认为true）

使用示例：

```
//设置游戏对象关闭重力
$self_main.isApplyG = false;
```

> ###### heavy

类型：`Number`

说明：游戏对象的体格值（默认为2）

使用示例：

```
$self_main.heavy = 3;      //设置游戏对象的体格值为3
var heavy1: Number = $self_main.heavy;       //将游戏对象当前体格值赋值到变量heavy1
```

> ###### hp

类型：`Number`

说明：游戏对象的血量（默认为1000）

使用示例：

```
$self_main.hp = 800;       //设置游戏对象的血量值为800
var hp1: Number = $self_main.hp;     //将游戏对象当前血量值赋值到变量hp1
```

> ###### hpMax

类型：`Number`

说明：游戏对象的最大血量（默认为1000）

使用示例：

```
$self_main.hpMax = 800;       //设置游戏对象的最大血量为800
var hpMax1: Number = $self_main.hpMax;     //将游戏对象当前最大血量赋值到变量hp1
```

<span id="hprate"></span>

> ###### 3.8开发增加 hpRate

类型：`Number`

说明：当前血量除以最大血量得到的比例（只读）

使用示例：

```actionscript
var hpRate1:Number = $self_main.hpRate;
```

> ###### defense

类型：`Number`

说明：游戏对象的格挡值（默认为0）

使用示例：

```
//设置游戏对象格挡值为5，每次受到伤害产生5减免
$self_main.defense = 5;
```

> ###### isAllowCrossX

类型：`Boolean`

说明：游戏对象是否可穿过地图左右边缘（默认为false）

使用示例：

```
//设置游戏对象可穿过地图左右边缘
$self_main.isAllowCrossX = true;
```

> ###### isAllowCrossBottom

类型：`Boolean`

说明：游戏对象是否可穿过地图底部边缘（默认为false）

使用示例：

```
//设置游戏对象可穿过地图左右边缘
$self_main.isAllowCrossBottom = true;
```

<span id="isallowcrossfloor"></span>

> ###### 3.8开发增加 isAllowCrossFloor

类型：`Boolean`

说明：是否允许穿过地图平台；BaseGameSprite 默认 false，Bullet 默认 true

使用示例：

```actionscript
$self_main.isAllowCrossFloor = true;
```

> ###### id

类型：`String`

说明：游戏对象的通用唯一识别码（UUID）

使用示例：

```
var id: String = $self_main.id;
```

<span id="colortransform"></span>

> ###### 3.8开发增加 colorTransform

类型：`ColorTransform`

说明：读取或设置当前颜色变换对象

使用示例：

```actionscript
import flash.geom.ColorTransform;

$self_main.colorTransform = new ColorTransform(1, 1, 1, 1, 50, 0, 0, 0); // 增加红色分量
```

> ###### attackRate

类型：`Number`

说明：游戏对象的攻击力倍率

使用示例：

```
$self_main.attackRate = 1.5;        //设置游戏对象当前攻击力倍率为1.5
var attackRate1: Number = $self_main.attackRate;        //将当前攻击力倍率赋值到变量attackRate1
```

<span id="defenserate"></span>

> ###### 3.3增加 defenseRate

类型：`Number`

说明：游戏对象的防御力倍率

使用示例：

```
$self_main.defenseRate = 1.5;        //设置游戏对象当前防御力倍率为1.5
var defenseRate1: Number = $self_main.defenseRate;        //将当前防御力倍率赋值到变量defenseRate1
```

> ###### mc

类型：`MovieClip`

说明：游戏对象的显示对象元件（只读）

使用示例：

```
var mc1: MovieClip = $self_main.mc;
```

> ###### x

类型：`Number`

说明：游戏对象的横坐标

使用示例：

```
var x1: Number = $self_main.x;
```

> ###### y

类型：`Number`

说明：游戏对象的纵坐标

使用示例：

```
var y1: Number = $self_main.y;
```

> ###### scale

类型：`Number`

说明：游戏对象的缩放倍率

使用示例：

```
var scale: Number = $self_main.scale;
```

> ###### direct

类型：`int`

说明：游戏对象的朝向

使用示例：

```
var direct: int = $self_main.direct;
```

> ###### team

类型：`TeamVO`

说明：游戏对象的小队对象

使用示例：

```
var team = $self_main.team;
```

### 方法

<span id="getactive"></span>

> ###### 3.5增加 getActive

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否处于活动状态

使用示例：

```actionscript
var isActive: Boolean = $self_main.getActive();
```

<span id="setactive"></span>

> ###### 3.5增加 setActive

传入参数：`v:Boolean`

返回类型：`void`

说明：设置游戏对象的活动状态

使用示例：

```actionscript
$self_main.setActive(true);	
```

<span id="updateposition"></span>

> ###### updatePosition

传入参数：无

返回类型：`void`

说明：更新游戏对象坐标

使用示例：

```actionscript
$self_main.updatePosition();
```

<span id="setvolume"></span>

> ###### 3.3增加 setVolume

传入参数：`v:Number`

返回类型：`void`

说明：设置游戏对象的音量（范围为0~1）

使用示例：

```actionscript
$self_main.setVolume(0.5);
```

<span id="isdestoryed"></span>

> ###### 3.3增加 isDestoryed

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否已被摧毁

使用示例：

```actionscript
var isDestoryed: Boolean = $self_main.isDestoryed();
```

> ###### renderAnimate

传入参数：无

返回类型：`void`

说明：渲染一次游戏对象动画

使用示例：

```actionscript
$self_main.renderAnimate();
```

> ###### render

传入参数：无

返回类型：`void`

说明：渲染一次游戏对象属性

使用示例：

```actionscript
$self_main.render();
```

> ###### getDisplay

传入参数：无

返回类型：`DisplayObject`

说明：获取游戏对象元件

使用示例：

```actionscript
var mc1: MovieClip = $self_main.getDisplay();
```

> ###### move

传入参数：`x:Number = 0, y:Number = 0`

返回类型：`void`

说明：使游戏对象移动一次

使用示例：

```actionscript
$self_main.move(8, 0);
```

<span id="moveworld"></span>

> ###### 3.8开发增加 moveWorld

传入参数：`param1:Number = 0, param2:Number = 0`

返回类型：`void`

说明：直接增加世界坐标 x、y，不随人物朝向反转；修改后由引擎同步显示位置

使用示例：

```actionscript
$self_main.moveWorld(30, -10); // 向游戏坐标右方移动 30、上方移动 10，不受朝向影响
```

> ###### setSpeedRate

传入参数：`v:Number`

返回类型：`void`

说明：设置速度倍率（用于慢放效果，默认为30 / 游戏FPS）

使用示例：

```actionscript
$self_main.setSpeedRate(1);
```

> ###### getVelocity

传入参数：无

返回类型：`Point`

说明：获取游戏对象的运动向量

使用示例：

```actionscript
var vec: Point = $self_main.getVelocity();
```

> ###### getVecX

传入参数：无

返回类型：`Number`

说明：获取游戏对象的横向运动向量

使用示例：

```actionscript
var vecX: Number = $self_main.getVecX();
```

> ###### getVecY

传入参数：无

返回类型：`Number`

说明：获取游戏对象的纵向运动向量

使用示例：

```actionscript
var vecY: Number = $self_main.getVecY();
```

> ###### setVecX

传入参数：`v:Number`

返回类型：`void`

说明：设置游戏对象的横向运动向量

使用示例：

```actionscript
$self_main.setVecX(8);
```

> ###### setVecY

传入参数：`v:Number`

返回类型：`void`

说明：设置游戏对象的纵向运动向量

使用示例：

```actionscript
$self_main.setVecY(0);
```

> ###### setVelocity

传入参数：`x:Number = 0, y:Number = 0`

返回类型：`void`

说明：设置游戏对象的运动向量

使用示例：

```actionscript
$self_main.setVelocity(8, 0);
```

> ###### addVelocity

传入参数：`x:Number = 0, y:Number = 0`

返回类型：`void`

说明：增加游戏对象的运动向量

使用示例：

```actionscript
$self_main.addVelocity(1, 0);
```

> ###### setVec2

传入参数：`x:Number = 0, y:Number = 0, dampingX:Number = 0, dampingY:Number = 0`

返回类型：`void`

说明：设置游戏对象的第二运动向量（用于墙角推移等场合）

使用示例：

```actionscript
$self_main.setVec2(8, 0, 0.8, 0);
```

> ###### getVec2

传入参数：无

返回类型：`Point`

说明：获取游戏对象的第二运动向量

使用示例：

```actionscript
var vec2: Point = $self_main.getVec2();
```

> ###### getDampingX

传入参数：无

返回类型：`Number`

说明：获取游戏对象的横向阻力向量

使用示例：

```actionscript
var damX: Number = $self_main.getDampingX();
```

> ###### getDampingY

传入参数：无

返回类型：`Number`

说明：获取游戏对象的纵向阻力向量

使用示例：

```actionscript
var damY: Number = $self_main.getDampingY();
```

> ###### setDampingX

传入参数：`v:Number`

返回类型：`void`

说明：设置游戏对象的横向阻力向量

使用示例：

```actionscript
$self_main.setDampingX(0.8);
```

> ###### setDampingY

传入参数：`v:Number`

返回类型：`void`

说明：设置游戏对象的纵向阻力向量

使用示例：

```actionscript
$self_main.setDampingY(0);
```

> ###### setDamping

传入参数：`x:Number = 0, y:Number = 0`

返回类型：`void`

说明：设置游戏对象的阻力向量

使用示例：

```actionscript
$self_main.setDamping(0.8, 0);
```

> ###### addDamping

传入参数：`x:Number = 0, y:Number = 0`

返回类型：`void`

说明：增加游戏对象的阻力向量

使用示例：

```actionscript
$self_main.addDamping(0.1, 0);
```

> ###### applayG

传入参数：`g:Number`

返回类型：`void`

说明：设置游戏对象的重力值

使用示例：

```actionscript
$self_main.applayG(4);
```

> ###### setInAir

传入参数：`v:Boolean`

返回类型：`void`

说明：设置游戏对象是否位于空中

使用示例：

```actionscript
$self_main.setInAir(true);
```

<span id="updateinair"></span>

> ###### 3.8开发增加 updateInAir

传入参数：无

返回类型：`void`

说明：重新计算并写入是否在空中的状态

> ###### hit

传入参数：`hitvo:HitVO, target:IGameSprite`

返回类型：`void`

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：双方层级交换（其他效果在子类中分别进行实现）

使用示例：

```actionscript
$self_main.hit($self_main.getCtrler().hitModel.getHitVO("k1"), $self_main.getCurrentTarget());
```

> ###### beHit

传入参数：`hitvo:HitVO, hitRect:Rectangle = null`

返回类型：`void`

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

包含效果：无效果（其他效果在子类中分别进行实现）

使用示例：

```actionscript
$self_main.getCurrentTarget().beHit($self_main.getCtrler().hitModel.getHitVO("k1"), $self_main.getCurrentTarget().getBodyArea());
```

> ###### getCurrentHits

传入参数：无

返回类型：`Array`

说明：无效果且固定返回null（效果在子类中分别进行覆写实现）

> ###### getArea

传入参数：无

返回类型：`Rectangle`

说明：获取游戏对象元件当前在场景中的位置和大小

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getArea();
```

> ###### getBodyArea

传入参数：无

返回类型：`Rectangle`

说明：无效果且固定返回null（效果在子类中分别进行覆写实现）

> ###### allowCrossMapXY

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否可穿过地图左右边缘

使用示例：

```actionscript
var allowCrossMapXY: Boolean = $self_main.allowCrossMapXY();
```

> ###### allowCrossMapBottom

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否可穿过地图底部边缘

使用示例：

```actionscript
var allowCrossMapBottom: Boolean = $self_main.allowCrossMapBottom();
```

<span id="allowcrossfloor"></span>

> ###### 3.8开发增加 allowCrossFloor

传入参数：无

返回类型：`Boolean`

说明：返回是否允许穿过地图平台

使用示例：

```actionscript
var allowCrossFloor1:Boolean = $self_main.allowCrossFloor();
```

> ###### getIsTouchSide

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否接触地图左右边缘

使用示例：

```actionscript
var isTouchSide: Boolean = $self_main.getIsTouchSide();
```

> ###### setIsTouchSide

传入参数：`v:Boolean`

返回类型：`void`

说明：设置游戏对象是否接触地图左右边缘

使用示例：

```actionscript
$self_main.setIsTouchSide(false);
```

> ###### addHp

传入参数：`v:Number`

返回类型：`void`

说明：增加血量

使用示例：

```actionscript
$self_main.addHp(10);
```

> ###### loseHp

传入参数：`v:Number`<br>
传入参数（3.8开发）：`delta:Number`

返回类型：`void`<br>
返回类型（3.8开发）：`Number`

说明：减少血量

<div class="version-note">

3.8开发改动：返回类型由 void 改为 Number，返回扣除防御等因素后的扣血量；不允许扣血时返回 0

</div>

使用示例：

```actionscript
$self_main.loseHp(10);
```

> ###### delayCall

传入参数：`func:Function, frame:int`

返回类型：`void`

说明：延迟一定帧数后执行函数

使用示例：

```actionscript
$self_main.delayCall(function1, 1);
```

> ###### renderSelf

传入参数：无

返回类型：`void`

说明：开始渲染自身

使用示例：

```actionscript
$self_main.renderSelf();
```

> ###### stopRenderSelf

传入参数：无

返回类型：`void`

说明：停止渲染自身

使用示例：

```actionscript
$self_main.stopRenderSelf();
```

> ###### setAnimateFrameOut

传入参数：`func:Function, frame:int`

返回类型：`void`

说明：延迟一定动画帧数后执行函数

使用示例：

```actionscript
$self_main.setAnimateFrameOut(function1, 1);
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
// 3.8开发：初始化时注册一次，不再需要时移除
function updateCustomState():void
{
    // 自定义逐帧逻辑
}
parent.$fighter_ctrler.getSelf().addRenderFunc(updateCustomState, {isFollowFps:true});
// 移除时传入同一个函数引用
parent.$fighter_ctrler.getSelf().removeRenderFunc(updateCustomState);
```

<span id="removerenderfunc"></span>

> ###### 3.8开发增加 removeRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：从逐帧回调列表移除指定函数，必须传入注册时的同一个 Function 引用

使用示例：

```actionscript
function updateCustomState1():void
{
    // 自定义逐帧逻辑
}
$self_main.addRenderFunc(updateCustomState1, {isFollowFps:true});

// 不再需要时执行，传入登记时的同一个函数引用
$self_main.removeRenderFunc(updateCustomState1);
```

<span id="inheritrenderfunc"></span>

> ###### 3.8开发增加 inheritRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：标记已注册的逐帧回调，使其在小队模式更换出场人物时，由下一位出场人物继续执行。例如当前人物战败退场后，回调会由新入场的人物继承。需先调用addRenderFunc注册，再用本方法标记

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

// 小队模式：在初始人物上登记一次
var fighter1 = parent.$fighter_ctrler.getSelf();
var group1 = fighter1.team.name == "P1"
    ? GameCtrl.I.gameRunData.p1FighterGroup
    : GameCtrl.I.gameRunData.p2FighterGroup;
function recoverSquadEnergy1():void
{
    var currentFighter1 = group1.currentFighter;
    if (currentFighter1 != null && currentFighter1.isAlive)
    {
        currentFighter1.addEnergy(0.1);
    }
}
fighter1.addRenderFunc(recoverSquadEnergy1, {isFollowFps:true});
fighter1.inheritRenderFunc(recoverSquadEnergy1);
```

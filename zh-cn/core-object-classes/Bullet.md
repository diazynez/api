# 飞行道具主体

> 此类实现[游戏对象接口](zh-cn/abstract-interface-classes/IGameSprite)，符合该数据模型

### 获取实例

```actionscript
//同一对象内只需要写一次，若报错请删除
```

```actionscript
//飞行道具使用下方代码获取自身的主体：
function get $self_main(): * {if (parent)for each(var i: * in parent.parent.parent.getGameSprites()) if (i.getDisplay() == this) return i;}
```

```actionscript
//主人物使用下方代码获取指定飞行道具的主体（任选其一）：
//注：有多个同名飞行道具时优先获取最早登场的一个

//写法1：
function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}
function getBullet(name: String): *
{
	for each(var i: * in $self_main.team.children) if (i.getDisplay().name == name) return i;
}

//写法2：
//注：此写法使用前提是目标飞行道具内已含有$self_main的定义，使用此写法的情况下有多个同名飞行道具时优先获取最晚登场的一个（若最晚登场的飞行道具已移除，此方法无法获取次晚登场的飞行道具）
function getBullet(name: String): *
{
	return this[name].$self_main;
}
```

```actionscript
//下文所有$self_main均等效于getBullet("飞行道具元件名称")，视实际情况选择使用的接口
```

<span id="fire-params"></span>

### fire的参数

Mc、辅助人物和攻击对象控制器的 `fire(mcName, params)` 使用下列配置建立飞行道具；攻击值对象仍由对应攻击模型按元件名称取得，不直接在params中填写伤害字段。

| 配置 | 类型及默认值 | 作用 |
| --- | --- | --- |
| `x` | `Number = 5` 或速度对象 | 水平速度 |
| `y` | `Number = 0` 或速度对象 | 竖直速度 |
| `hold` | `Number = -1` | 存在时长，单位秒，-1不限制时长 |
| `hits` | `int = -1` | 可攻击次数，-1不限制次数 |
| `hp` | `int = 100` | 飞行道具血量 |
| `effect.shadow` | `Array` | 残影颜色参数，如 `[0,0,0]`；FVO及3.8开发可用 |

速度对象的字段为 `start`（初始速度）、`add`（加速度）、`max`（速度上限）、`min`（速度下限）、`hit`（命中后的速度）。未填写的字段沿用默认设置。旧版构造函数不会将数值0作为水平速度覆盖值，若需要水平静止，使用 `x:{start:0}`；编写器会自动处理这种情况。

### 属性

说明：设置或调整人物的默认属性

> ###### speed

类型：`Point`

说明：飞行道具的速度向量

使用示例：

```actionscript
var speedX: Number = $self_main.speed.x;
var speedY: Number = $self_main.speed.y;
```

> ###### hp

类型：`int`

说明：飞行道具的血量值（默认为100）

使用示例：

```actionscript
$self_main.hp = 200;       //设置飞行道具的血量值为200
var hp1: int = $self_main.hp;     //将当前血量值赋值到变量hp1
```

> ###### hpMax

类型：`int`

说明：飞行道具的最大血量（默认为100）

使用示例：

```actionscript
$self_main.hpMax = 200;       //设置飞行道具的最大血量为200
var hpMax1: int = $self_main.hpMax;     //将当前最大血量赋值到变量hpMax1
```

> ###### addSpeed

类型：`Point`

说明：飞行道具的加速度向量

使用示例：

```actionscript
var addSpeedX: Number = $self_main.addSpeed.x;
var addSpeedY: Number = $self_main.addSpeed.y;
```

> ###### maxSpeed

类型：`Point`

说明：飞行道具的最大速度向量

使用示例：

```actionscript
var maxSpeedX: Number = $self_main.maxSpeed.x;
var maxSpeedY: Number = $self_main.maxSpeed.y;
```

> ###### minSpeed

类型：`Point`

说明：飞行道具的最小速度向量

使用示例：

```actionscript
var minSpeedX: Number = $self_main.minSpeed.x;
var minSpeedY: Number = $self_main.minSpeed.y;
```

> ###### hitSpeed

类型：`Point`

说明：飞行道具的命中速度向量

使用示例：

```actionscript
var hitSpeedX: Number = $self_main.hitSpeed.x;
var hitSpeedY: Number = $self_main.hitSpeed.y;
```

> ###### holdFrame

类型：`int`

说明：飞行道具的可存在帧数（默认为-1，该数值在飞行道具生成时会初始化为params.hold * 游戏FPS）

使用示例：

```actionscript
var holdFrame: int = $self_main.holdFrame;
```

> ###### onRemove

类型：`Function`

说明：攻击对象用于移除自身的函数

使用示例：

```actionscript
try
{
	$self_main.onRemove($self_main)
}
catch (e)
{}
```

> ###### mc

类型：`MovieClip`

说明：飞行道具的元件

使用示例：

```actionscript
var mc1: MovieClip = $self_main.mc;
```

> ###### hitTimes

类型：`int`

说明：飞行道具的可攻击次数（默认为-1）

使用示例：

```actionscript
var hitTimes: Number = $self_main.hitTimes;
```

> ###### owner

类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：主人的游戏对象

<div class="version-note">

3.8开发改动：字段类型或初始值变化，见签名

</div>

使用示例：

```actionscript
var owner = $self_main.owner;
```

<span id="isallowcrossx"></span>

> ###### 3.8开发增加 isAllowCrossX

类型：`Boolean`

说明：是否允许越过地图水平边界，默认 true

使用示例：

```actionscript
$self_main.isAllowCrossX = false;
```

<span id="isallowcrossbottom"></span>

> ###### 3.8开发增加 isAllowCrossBottom

类型：`Boolean`

说明：是否允许越过地图底部边界，默认 false

使用示例：

```actionscript
$self_main.isAllowCrossBottom = true;
```

<span id="isallowcrossfloor"></span>

> ###### 3.8开发增加 isAllowCrossFloor

类型：`Boolean`

说明：是否允许穿过地图平台；BaseGameSprite 默认 false，Bullet 默认 true

使用示例：

```actionscript
$self_main.isAllowCrossFloor = false;
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

> ###### x

类型：`Number`

说明：飞行道具的横坐标

使用示例：

```actionscript
var x1: Number = $self_main.x;
```

> ###### y

类型：`Number`

说明：飞行道具的纵坐标

使用示例：

```actionscript
var y1: Number = $self_main.y;
```

> ###### team

类型：`TeamVO`

说明：飞行道具的所属小队

使用示例：

```actionscript
var team = $self_main.team;
```

> ###### direct

类型：`int`

说明：飞行道具的朝向

使用示例：

```actionscript
var direct = $self_main.direct;
```

### 方法

<span id="getactive"></span>

> ###### 3.5增加 getActive

传入参数：无

返回类型：`Boolean`

说明：判断飞行道具是否处于活动状态

使用示例：

```actionscript
var isActive: Boolean = $self_main.getActive();
```

<span id="setactive"></span>

> ###### 3.5增加 setActive

传入参数：`v:Boolean`

返回类型：`void`

说明：设置飞行道具的活动状态

使用示例：

```actionscript
$self_main.setActive(true);
```

> ###### isAttacking

传入参数：无

返回类型：`Boolean`

说明：判断飞行道具是否处于攻击状态（用于对方AI检测）

使用示例：

```actionscript
var isAttacking: Boolean = $self_main.isAttacking();
```

> ###### setSpeedRate

传入参数：`v:Number`

返回类型：`void`

说明：设置速度倍率（用于慢放效果，默认为30 / 游戏FPS）

使用示例：

```actionscript
$self_main.setSpeedRate(1);
```

<span id="setvolume"></span>

> ###### 3.3增加 setVolume

传入参数：`v:Number`

返回类型：`void`

说明：设置飞行道具的音量（范围为0~1）

使用示例：

```actionscript
$self_main.setVolume(0.5);
```

> ###### setHitVO

传入参数：`v:HitVO`

返回类型：`void`

说明：设置飞行道具的[攻击值对象](zh-cn/data-model-classes/HitVO)

使用示例：

```actionscript
//无使用示例
```

<span id="getdoingaction"></span>

> ###### 3.8开发增加 getDoingAction

传入参数：无

返回类型：`Object`

说明：取得发射时记录的主人动作信息，用于关联攻击来源；可能为 null

使用示例：

```actionscript
var doingAction1:Object = $self_main.getDoingAction();
```

<span id="isdestoryed"></span>

> ###### 3.3增加 isDestoryed

传入参数：无

返回类型：`Boolean`

说明：判断飞行道具是否已被摧毁

使用示例：

```actionscript
var isDestoryed: Boolean = $self_main.isDestoryed();
```

> ###### renderAnimate

传入参数：无

返回类型：`void`

说明：渲染一次飞行道具动画

使用示例：

```actionscript
$self_main.renderAnimate();
```

> ###### render

传入参数：无

返回类型：`void`

说明：渲染一次飞行道具属性

使用示例：

```actionscript
$self_main.render();
```

> ###### getDisplay

传入参数：无

返回类型：`DisplayObject`

说明：获取飞行道具元件

使用示例：

```actionscript
var mc1: MovieClip = $self_main.getDisplay();
```

> ###### hit

传入参数：`hitvo:HitVO, target:IGameSprite`

返回类型：`void`

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：判定自身命中后的状态、主人集气、HITS的UI刷新、计分板得分增加

使用示例：

```actionscript
$self_main.hit($self_main.owner.getCtrler().hitModel.getHitVO("k1"), $self_main.owner.getCurrentTarget());
```

> ###### beHit

传入参数：`hitvo:HitVO, hitRect:Rectangle = null`

返回类型：`void`

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

使用示例：

```actionscript
$self_main.beHit($self_main.owner.getCurrentTarget().getCtrler().hitModel.getHitVO("k1"), $self_main.owner.getBodyArea());
```

> ###### getCurrentHits

传入参数：无

返回类型：`Array`

说明：获取自身的攻击面，返回包含自身的[攻击值对象](zh-cn/data-model-classes/HitVO)的数组

使用示例：

```actionscript
var curHitsArr: Array = $self_main.getCurrentHits();
```

> ###### getArea

传入参数：无

返回类型：`Rectangle`

说明：获取飞行道具当前在场景中的位置和大小

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getArea();
```

> ###### getBodyArea

传入参数：无

返回类型：`Rectangle`

说明：获取飞行道具当前在场景中的位置和大小

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getBodyArea();
```

> ###### allowCrossMapXY

传入参数：无

返回类型：`Boolean`

说明：判断飞行道具是否可穿过地图左右边缘（固定为true）

使用示例：

```actionscript
var allowCrossMapXY: Boolean = $self_main.allowCrossMapXY();
```

> ###### allowCrossMapBottom

传入参数：无

返回类型：`Boolean`

说明：判断飞行道具是否可穿过地图底部边缘（固定为false）

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

说明：判断飞行道具是否接触地图左右边缘（固定为false）

使用示例：

```actionscript
var isTouchSide: Boolean = $self_main.getIsTouchSide();
```

> ###### setIsTouchSide

传入参数：`v:Boolean`

返回类型：`void`

说明：设置游戏对象是否接触地图左右边缘（无效果）

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
// 在飞行道具中登记渐隐效果，随其动画更新逐渐降低透明度
// 回调随道具销毁清理；主动移除的实现限制见下方 removeRenderFunc
var bullet1 = $self_main;
function fadeBullet1():void {
    var display1 = bullet1.getDisplay();
    if (display1.alpha > 0.3) {
        display1.alpha = Math.max(0.3, display1.alpha - 0.02);
    }
}
bullet1.addRenderFunc(fadeBullet1);
```

<span id="removerenderfunc"></span>

> ###### 3.8开发增加 removeRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：当前参考源码的列表空值判断存在问题：有列表时会跳过，空列表时可能访问空引用；不能保证移除成功，使用前应核对目标游戏版本

### 逐帧回调的实现差异

Bullet 自行实现 IGameSprite，并非继承 BaseGameSprite。3.8开发中，回调移除和继承接口存在本页注明的限制，不应直接套用人物主体的回调用法。

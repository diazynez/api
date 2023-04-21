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

### 属性

说明：设置或调整人物的默认属性

> ###### speed

类型：Point

说明：飞行道具的速度向量

使用示例：

```actionscript
var speedX: Number = $self_main.speed.x;
var speedY: Number = $self_main.speed.y;
```

> ###### hp

类型：int

说明：飞行道具的血量值（默认为100）

使用示例：

```actionscript
$self_main.hp = 200;       //设置飞行道具的血量值为200
var hp1: int = $self_main.hp;     //将当前血量值赋值到变量hp1
```

> ###### hpMax

类型：int

说明：飞行道具的血量最大值（默认为100）

使用示例：

```actionscript
$self_main.hpMax = 200;       //设置飞行道具的血量最大值为200
var hpMax1: int = $self_main.hpMax;     //将当前血量最大值赋值到变量hpMax1
```

> ###### addSpeed

类型：Point

说明：飞行道具的加速度向量

使用示例：

```actionscript
var addSpeedX: Number = $self_main.addSpeed.x;
var addSpeedY: Number = $self_main.addSpeed.y;
```

> ###### maxSpeed

类型：Point

说明：飞行道具的最大速度向量

使用示例：

```actionscript
var maxSpeedX: Number = $self_main.maxSpeed.x;
var maxSpeedY: Number = $self_main.maxSpeed.y;
```

> ###### minSpeed

类型：Point

说明：飞行道具的最小速度向量

使用示例：

```actionscript
var minSpeedX: Number = $self_main.minSpeed.x;
var minSpeedY: Number = $self_main.minSpeed.y;
```

> ###### hitSpeed

类型：Point

说明：飞行道具的命中速度向量

使用示例：

```actionscript
var hitSpeedX: Number = $self_main.hitSpeed.x;
var hitSpeedY: Number = $self_main.hitSpeed.y;
```

> ###### holdFrame

类型：int

说明：飞行道具的可存在帧数（默认为-1，该数值在飞行道具生成时会初始化为params.hold * 游戏FPS）

使用示例：

```actionscript
var holdFrame: int = $self_main.holdFrame;
```

> ###### onRemove

类型：Function

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

类型：MovieClip

说明：飞行道具的元件

使用示例：

```actionscript
var mc1: MovieClip = $self_main.mc;
```

> ###### hitTimes

类型：int

说明：飞行道具的可攻击次数（默认为-1）

使用示例：

```actionscript
var hitTimes: Number = $self_main.hitTimes;
```

> ###### owner

类型：IGameSprite

说明：主人的游戏对象

使用示例：

```actionscript
var owner = $self_main.owner;
```

> ###### x

类型：Number

说明：飞行道具的横坐标

使用示例：

```actionscript
var x1: Number = $self_main.x;
```

> ###### y

类型：Number

说明：飞行道具的纵坐标

使用示例：

```actionscript
var y1: Number = $self_main.y;
```

> ###### team

类型：TeamVO

说明：飞行道具的所属小队

使用示例：

```actionscript
var team = $self_main.team;
```

> ###### direct

类型：int

说明：飞行道具的朝向

使用示例：

```actionscript
var direct = $self_main.direct;
```

### 方法

> ###### 3.5增加 getActive

传入参数：无

返回类型：Boolean

说明：判断飞行道具是否处于活动状态

使用示例：

```actionscript
var isActive: Boolean = $self_main.getActive();
```

> ###### 3.5增加 setActive

传入参数：v:Boolean

返回类型：void

说明：设置飞行道具的活动状态

使用示例：

```actionscript
$self_main.setActive(true);
```

> ###### isAttacking

传入参数：无

返回类型：Boolean

说明：判断飞行道具是否处于攻击状态（用于对方AI检测）

使用示例：

```actionscript
var isAttacking: Boolean = $self_main.isAttacking();
```

> ###### setSpeedRate

传入参数：v:Number

返回类型：void

说明：设置速度倍率（用于慢放效果，默认为30 / 游戏FPS）

使用示例：

```actionscript
$self_main.setSpeedRate(1);
```

> ###### setVolume

传入参数：v:Number

返回类型：void

说明：设置飞行道具的音量（范围为0~1）

使用示例：

```actionscript
$self_main.setVolume(0.5);
```

> ###### setHitVO

传入参数：v:HitVO

返回类型：void

说明：设置飞行道具的[攻击值对象](zh-cn/data-model-classes/HitVO)

使用示例：

```actionscript
//无使用示例
```

> ###### isDestoryed

传入参数：无

返回类型：Boolean

说明：判断飞行道具是否已被摧毁

使用示例：

```actionscript
var isDestoryed: Boolean = $self_main.isDestoryed();
```

> ###### renderAnimate

传入参数：无

返回类型：void

说明：渲染一次飞行道具动画

使用示例：

```actionscript
$self_main.renderAnimate();
```

> ###### render

传入参数：无

返回类型：void

说明：渲染一次飞行道具属性

使用示例：

```actionscript
$self_main.render();
```

> ###### getDisplay

传入参数：无

返回类型：DisplayObject

说明：获取飞行道具元件

使用示例：

```actionscript
var mc1: MovieClip = $self_main.getDisplay();
```

> ###### hit

传入参数：hitvo:HitVO, target:IGameSprite

返回类型：void

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：判定自身命中后的状态、主人集气、HITS的UI刷新、计分板得分增加

使用示例：

```actionscript
$self_main.hit($self_main.owner.getCtrler().hitModel.getHitVO("k1"), $self_main.owner.getCurrentTarget());
```

> ###### beHit

传入参数：hitvo:HitVO, hitRect:Rectangle = null

返回类型：void

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

使用示例：

```actionscript
$self_main.beHit($self_main.owner.getCurrentTarget().getCtrler().hitModel.getHitVO("k1"), $self_main.owner.getBodyArea());
```

> ###### getCurrentHits

传入参数：无

返回类型：Array

说明：获取自身的攻击面，返回包含自身的[攻击值对象](zh-cn/data-model-classes/HitVO)的数组

使用示例：

```actionscript
var curHitsArr: Array = $self_main.getCurrentHits();
```

> ###### getArea

传入参数：无

返回类型：Rectangle

说明：获取飞行道具当前在场景中的位置和大小

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getArea();
```

> ###### getBodyArea

传入参数：无

返回类型：Rectangle

说明：获取飞行道具当前在场景中的位置和大小

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getBodyArea();
```

> ###### allowCrossMapXY

传入参数：无

返回类型：Boolean

说明：判断飞行道具是否可穿过地图左右边缘（固定为true）

使用示例：

```actionscript
var allowCrossMapXY: Boolean = $self_main.allowCrossMapXY();
```

> ###### allowCrossMapBottom

传入参数：无

返回类型：Boolean

说明：判断飞行道具是否可穿过地图底部边缘（固定为false）

使用示例：

```actionscript
var allowCrossMapBottom: Boolean = $self_main.allowCrossMapBottom();
```

> ###### getIsTouchSide

传入参数：无

返回类型：Boolean

说明：判断飞行道具是否接触地图左右边缘（固定为false）

使用示例：

```actionscript
var isTouchSide: Boolean = $self_main.getIsTouchSide();
```

> ###### setIsTouchSide

传入参数：v:Boolean

返回类型：void

说明：无效果

使用示例：

```actionscript
$self_main.setIsTouchSide(false);
```

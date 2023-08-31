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

类型：Boolean

说明：游戏对象是否位于空中

使用示例：

```actionscript
if ($self_main.isInAir)
{
	$self_main.hp += 100;
}   //当游戏对象位于空中时，使其血量值增加100
```

> ###### isTouchBottom

类型：Boolean

说明：游戏对象是否接触地图底部边缘

使用示例：

```actionscript
if ($self_main.isTouchBottom)
{
	$self_main.hp += 100;
}   //当游戏对象触底时，使其血量值增加100
```

> ###### isAllowBeHit

类型：Boolean

说明：游戏对象是否允许受到攻击（默认为true）

使用示例：

```actionscript
//设置游戏对象不允许受到攻击
$self_main.isAllowBeHit = false;
```

> ###### isCross

类型：Boolean

说明：游戏对象是否允许穿越（默认为false）

使用示例：

```actionscript
//设置游戏对象可穿越
$self_main.isCross = true;
```

> ###### isAlive

类型：Boolean

说明：游戏对象是否存活（默认为true）

使用示例：

```actionscript
if ($self_main.isAlive)
{
	$self_main.hp += 100;
}   //当游戏对象存活时，使其血量值增加100
```

> ###### isAllowLoseHP

类型：Boolean

说明：游戏对象是否允许掉血（默认为true）

使用示例：

```
//设置游戏对象不允许掉血
$self_main.isAllowLoseHP = false;
```

> ###### isApplyG

类型：Boolean

说明：游戏对象是否开启重力（默认为true）

使用示例：

```
//设置游戏对象关闭重力
$self_main.isApplyG = false;
```

> ###### heavy

类型：Number

说明：游戏对象的体格值（默认为2）

使用示例：

```
$self_main.heavy = 3;      //设置游戏对象的体格值为3
var heavy1: Number = $self_main.heavy;       //将游戏对象当前体格值赋值到变量heavy1
```

> ###### hp

类型：Number

说明：游戏对象的生命值（默认为1000）

使用示例：

```
$self_main.hp = 800;       //设置游戏对象的血量值为800
var hp1: Number = $self_main.hp;     //将游戏对象当前血量值赋值到变量hp1
```

> ###### hpMax

类型：Number

说明：游戏对象的血量最大值（默认为1000）

使用示例：

```
$self_main.hpMax = 800;       //设置游戏对象的血量最大值为800
var hpMax1: Number = $self_main.hpMax;     //将游戏对象当前血量最大值赋值到变量hp1
```

> ###### defense

类型：Number

说明：游戏对象的格挡值（默认为0）

使用示例：

```
//设置游戏对象格挡值为5，每次受到伤害产生5减免
$self_main.defense = 5;
```

> ###### isAllowCrossX

类型：Boolean

说明：游戏对象是否可穿过地图左右边缘（默认为false）

使用示例：

```
//设置游戏对象可穿过地图左右边缘
$self_main.isAllowCrossX = true;
```

> ###### isAllowCrossBottom

类型：Boolean

说明：游戏对象是否可穿过地图底部边缘（默认为false）

使用示例：

```
//设置游戏对象可穿过地图左右边缘
$self_main.isAllowCrossBottom = true;
```

> ###### id

类型：String

说明：游戏对象的通用唯一识别码（UUID）

使用示例：

```
var id: String = $self_main.id;
```

> ###### attackRate

类型：Number

说明：游戏对象的攻击力倍率

使用示例：

```
$self_main.attackRate = 1.5;        //设置游戏对象当前攻击力倍率为1.5
var attackRate1: Number = $self_main.attackRate;        //将当前攻击力倍率赋值到变量attackRate1
```

> ###### defenseRate

类型：Number

说明：游戏对象的防御力倍率

使用示例：

```
$self_main.defenseRate = 1.5;        //设置游戏对象当前防御力倍率为1.5
var defenseRate1: Number = $self_main.defenseRate;        //将当前防御力倍率赋值到变量defenseRate1
```

> ###### mc

类型：MovieClip

说明：游戏对象的显示对象元件（只读）

使用示例：

```
var mc1: MovieClip = $self_main.mc;
```

> ###### x

类型：Number

说明：游戏对象的横坐标

使用示例：

```
var x1: Number = $self_main.x;
```

> ###### y

类型：Number

说明：游戏对象的纵坐标

使用示例：

```
var y1: Number = $self_main.y;
```

> ###### scale

类型：Number

说明：游戏对象的缩放倍率

使用示例：

```
var scale: Number = $self_main.scale;
```

> ###### direct

类型：int

说明：游戏对象的朝向

使用示例：

```
var direct: int = $self_main.direct;
```

> ###### team

类型：TeamVO

说明：游戏对象的小队对象

使用示例：

```
var team = $self_main.team;
```

### 方法

> ###### 3.5增加 getActive

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否处于活动状态

使用示例：

```actionscript
var isActive: Boolean = $self_main.getActive();
```

> ###### 3.5增加 setActive

传入参数：v:Boolean

返回类型：void

说明：设置游戏对象的活动状态

使用示例：

```actionscript
$self_main.setActive(true);	
```

> ###### 3.5增加 updatePosition

传入参数：无

返回类型：void

说明：更新游戏对象坐标

使用示例：

```actionscript
$self_main.updatePosition();
```

> ###### setVolume

传入参数：v:Number

返回类型：void

说明：设置游戏对象的音量（范围为0~1）

使用示例：

```actionscript
$self_main.setVolume(0.5);
```

> ###### isDestoryed

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否已被摧毁

使用示例：

```actionscript
var isDestoryed: Boolean = $self_main.isDestoryed();
```

> ###### renderAnimate

传入参数：无

返回类型：void

说明：渲染一次游戏对象动画

使用示例：

```actionscript
$self_main.renderAnimate();
```

> ###### render

传入参数：无

返回类型：void

说明：渲染一次游戏对象属性

使用示例：

```actionscript
$self_main.render();
```

> ###### getDisplay

传入参数：无

返回类型：DisplayObject

说明：获取游戏对象元件

使用示例：

```actionscript
var mc1: MovieClip = $self_main.getDisplay();
```

> ###### move

传入参数：x:Number = 0, y:Number = 0

返回类型：void

说明：使游戏对象移动一次

使用示例：

```actionscript
$self_main.move(8, 0);
```

> ###### setSpeedRate

传入参数：v:Number

返回类型：void

说明：设置速度倍率（用于慢放效果，默认为30 / 游戏FPS）

使用示例：

```actionscript
$self_main.setSpeedRate(1);
```

> ###### getVelocity

传入参数：无

返回类型：Point

说明：获取游戏对象的运动向量

使用示例：

```actionscript
var vec: Point = $self_main.getVelocity();
```

> ###### getVecX

传入参数：无

返回类型：Number

说明：获取游戏对象的横向运动向量

使用示例：

```actionscript
var vecX: Number = $self_main.getVecX();
```

> ###### getVecY

传入参数：无

返回类型：Number

说明：获取游戏对象的纵向运动向量

使用示例：

```actionscript
var vecY: Number = $self_main.getVecY();
```

> ###### setVecX

传入参数：v:Number

返回类型：void

说明：设置游戏对象的横向运动向量

使用示例：

```actionscript
$self_main.setVecX(8);
```

> ###### setVecY

传入参数：v:Number

返回类型：void

说明：设置游戏对象的纵向运动向量

使用示例：

```actionscript
$self_main.setVecY(0);
```

> ###### setVelocity

传入参数：x:Number = 0, y:Number = 0

返回类型：void

说明：设置游戏对象的运动向量

使用示例：

```actionscript
$self_main.setVelocity(8, 0);
```

> ###### addVelocity

传入参数：x:Number = 0, y:Number = 0

返回类型：void

说明：增加游戏对象的运动向量

使用示例：

```actionscript
$self_main.addVelocity(1, 0);
```

> ###### setVec2

传入参数：x:Number = 0, y:Number = 0, dampingX:Number = 0, dampingY:Number = 0

返回类型：void

说明：设置游戏对象的第二运动向量（用于墙角推移等场合）

使用示例：

```actionscript
$self_main.setVec2(8, 0, 0.8, 0);
```

> ###### getVec2

传入参数：无

返回类型：Point

说明：获取游戏对象的第二运动向量

使用示例：

```actionscript
var vec2: Point = $self_main.getVec2();
```

> ###### getDampingX

传入参数：无

返回类型：Number

说明：获取游戏对象的横向阻力向量

使用示例：

```actionscript
var damX: Number = $self_main.getDampingX();
```

> ###### getDampingY

传入参数：无

返回类型：Number

说明：获取游戏对象的纵向阻力向量

使用示例：

```actionscript
var damY: Number = $self_main.getDampingY();
```

> ###### setDampingX

传入参数：v:Number

返回类型：void

说明：设置游戏对象的横向阻力向量

使用示例：

```actionscript
$self_main.setDampingX(0.8);
```

> ###### setDampingY

传入参数：v:Number

返回类型：void

说明：设置游戏对象的纵向阻力向量

使用示例：

```actionscript
$self_main.setDampingY(0);
```

> ###### setDamping

传入参数：x:Number = 0, y:Number = 0

返回类型：void

说明：设置游戏对象的阻力向量

使用示例：

```actionscript
$self_main.setDamping(0.8, 0);
```

> ###### addDamping

传入参数：x:Number = 0, y:Number = 0

返回类型：void

说明：增加游戏对象的阻力向量

使用示例：

```actionscript
$self_main.addDamping(0.1, 0);
```

> ###### applayG

传入参数：g:Number

返回类型：void

说明：设置游戏对象的重力值

使用示例：

```actionscript
$self_main.applayG(4);
```

> ###### setInAir

传入参数：v:Boolean

返回类型：void

说明：设置游戏对象是否位于空中

使用示例：

```actionscript
$self_main.setInAir(true);
```

> ###### hit

传入参数：hitvo:HitVO, target:IGameSprite

返回类型：void

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：双方层级交换（其他效果在子类中分别进行实现）

使用示例：

```actionscript
$self_main.hit($self_main.getCtrler().hitModel.getHitVO("k1"), $self_main.getCurrentTarget());
```

> ###### beHit

传入参数：hitvo:HitVO, hitRect:Rectangle = null

返回类型：void

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

包含效果：无效果（其他效果在子类中分别进行实现）

使用示例：

```actionscript
$self_main.getCurrentTarget().beHit($self_main.getCtrler().hitModel.getHitVO("k1"), $self_main.getCurrentTarget().getBodyArea());
```

> ###### getCurrentHits

传入参数：无

返回类型：Array

说明：无效果且固定返回null（效果在子类中分别进行覆写实现）

> ###### getArea

传入参数：无

返回类型：Rectangle

说明：获取游戏对象元件当前在场景中的位置和大小

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getArea();
```

> ###### getBodyArea

传入参数：无

返回类型：Rectangle

说明：无效果且固定返回null（效果在子类中分别进行覆写实现）

> ###### allowCrossMapXY

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否可穿过地图左右边缘

使用示例：

```actionscript
var allowCrossMapXY: Boolean = $self_main.allowCrossMapXY();
```

> ###### allowCrossMapBottom

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否可穿过地图底部边缘

使用示例：

```actionscript
var allowCrossMapBottom: Boolean = $self_main.allowCrossMapBottom();
```

> ###### getIsTouchSide

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否接触地图左右边缘

使用示例：

```actionscript
var isTouchSide: Boolean = $self_main.getIsTouchSide();
```

> ###### setIsTouchSide

传入参数：v:Boolean

返回类型：void

说明：设置游戏对象是否接触地图左右边缘

使用示例：

```actionscript
$self_main.setIsTouchSide(false);
```

> ###### addHp

传入参数：v:Number

返回类型：void

说明：增加生命

使用示例：

```actionscript
$self_main.addHp(10);
```

> ###### loseHp

传入参数：v:Number

返回类型：void

说明：减少生命

使用示例：

```actionscript
$self_main.loseHp(10);
```

> ###### delayCall

传入参数：func:Function, frame:int

返回类型：void

说明：延迟一定帧数后执行函数

使用示例：

```actionscript
$self_main.delayCall(function1, 1);
```

> ###### renderSelf

传入参数：无

返回类型：void

说明：开始渲染自身

使用示例：

```actionscript
$self_main.renderSelf();
```

> ###### stopRenderSelf

传入参数：无

返回类型：void

说明：停止渲染自身

使用示例：

```actionscript
$self_main.stopRenderSelf();
```

> ###### setAnimateFrameOut

传入参数：func:Function, frame:int

返回类型：void

说明：延迟一定动画帧数后执行函数

使用示例：

```actionscript
$self_main.setAnimateFrameOut(function1, 1);
```

# 攻击对象主体

### 获取实例

```actionscript
//同一对象内只需要写一次，若报错请删除
```

```actionscript
//攻击对象使用下方代码获取自身的主体：
function get $self_main(): * {for each(var i: * in parent.parent.parent.getGameSprites()) if (i.getDisplay() == this) return i;}
```

```actionscript
//主人物使用下方代码获取指定攻击对象的主体（任选其一）：
//注：有多个同名攻击对象时优先获取最早登场的一个

//写法1：
function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}
function getFighterAttacker(name: String): *
{
	for each(var i: * in $self_main.team.children) if (i.getDisplay().name == name) return i;
}

//写法2：
function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}
function getFighterAttacker(name: String): *
{
	for each(var i: * in $self_main.team.children) if (i.getCtrler() == parent.$mc_ctrler.getAttacker(name)) return i;
}

//写法3：
//注：此写法使用前提是目标攻击对象内已含有$self_main的定义，使用此写法的情况下有多个同名攻击对象时优先获取最晚登场的一个
function getFighterAttacker(name: String): *
{
	return this[name].$self_main;
}
```

```actionscript
//下文所有$self_main均等效于getFighterAttacker("攻击对象元件名称")，视实际情况选择使用的接口
```

### 属性

说明：设置或调整人物的默认属性

> ###### onRemove

类型：Function

说明：攻击对象用于移除自身的函数

使用示例：

```actionscript
$self_main.onRemove(this);
```

> ###### isAttacking

类型：Boolean

说明：攻击对象是否处于攻击状态（用于对方AI检测）

使用示例：

```actionscript
$self_main.isAttacking = false;
```

> ###### moveToTargetX

类型：Boolean

说明：攻击对象是否横向移动到目标

使用示例：

```actionscript
$self_main.moveToTargetX = false;
```

> ###### moveToTargetY

类型：Boolean

说明：攻击对象是否纵向移动到目标

使用示例：

```actionscript
$self_main.moveToTargetY = false;
```

> ###### followTargetX

类型：Boolean

说明：攻击对象是否横向跟随目标

使用示例：

```actionscript
$self_main.followTargetX = false;
```

> ###### followTargetY

类型：Boolean

说明：攻击对象是否纵向跟随目标

使用示例：

```actionscript
$self_main.followTargetY = false;
```

> ###### rangeX

类型：Point

说明：攻击对象横向捕捉移动范围

使用示例：

```actionscript
$self_main.rangeX = new Point(0, 100);
```

> ###### rangeY

类型：Point

说明：攻击对象纵向捕捉移动范围

使用示例：

```actionscript
$self_main.followTargetY = new Point(-50, 50);
```

> ###### name

类型：String

说明：攻击对象元件名称（只读）

使用示例：

```actionscript
var name1: String = $self_main.name;
```

### 方法

> ###### getOwner

传入参数：无

返回类型：IGameSprite

说明：获取主人的游戏对象

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

```actionscript
var owner = $self_main.getOwner();
```

> ###### getCtrler

传入参数：无

返回类型：FighterAttackerCtrler

说明：获取攻击对象的控制器

使用示例：

- [详细介绍](zh-cn/other-ctrlers/FighterAttackerCtrler)

```actionscript
var ctrler = $self_main.getCtrler();
```

> ###### setOwner

传入参数：v:IGameSprite

返回类型：void

说明：设置攻击对象的主人

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

> ###### init

传入参数：无

返回类型：void

说明：初始化攻击对象

> ###### renderAnimate

传入参数：无

返回类型：void

说明：渲染一次攻击对象动画

使用示例：

```actionscript
$self_main.renderAnimate();
```

> ###### render

传入参数：无

返回类型：void

说明：渲染一次攻击对象属性和控制器

使用示例：

```actionscript
$self_main.render();
```

> ###### stopFollowTarget

传入参数：无

返回类型：void

说明：停止跟随对方

使用示例：

```actionscript
$self_main.stopFollowTarget();
```

> ###### moveToTarget

传入参数：offsetX:Number = NaN, offsetY:Number = NaN

返回类型：void

说明：移动到对方的位置（offsetX/offsetY填NaN则横/纵向不进行移动）

使用示例：

```actionscript
$self_main.moveToTarget(0, 0);
```

> ###### stop

传入参数：无

返回类型：void

说明：停止播放攻击对象动画

使用示例：

```actionscript
$self_main.stop();
```

> ###### gotoAndPlay

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
$self_main.gotoAndPlay("帧标签");
```

> ###### gotoAndStop

传入参数：frame:String

返回类型：void

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
$self_main.gotoAndStop("帧标签");
```

> ###### getTargets

传入参数：无

返回类型：Vector.\<IGameSprite\>

说明：获取对方队伍的所有存活的游戏对象

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

```actionscript
var targets = $self_main.getTargets();
```

> ###### getTarget

传入参数：无

返回类型：IGameSprite

说明：获取对方的游戏对象（可用于控制对方）

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

```actionscript
var target = $self_main.getTarget();
```

> ###### removeSelf

传入参数：无

返回类型：void

说明：删除自身

使用示例：

```actionscript
$self_main.removeSelf();
```

> ###### getHitCheckRect

传入参数：name:String

返回类型：Rectangle

说明：根据元件名称获取元件当前在场景中的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var hitArea: Rectangle = $self_main.getHitCheckRect("zh1atm");
```

> ###### getCheckHitRect

传入参数：name:String

返回类型：Rectangle

说明：根据元件名称获取MC内元件的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var checkHitRect: Rectangle = $self_main.getCheckHitRect("zh1atm");
```

> ###### hit

传入参数：hitvo:HitVO, target:IGameSprite

返回类型：void

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：主人集气、HITS的UI刷新、计分板得分增加

使用示例：

```actionscript
$self_main.hit($self_main.getOwner().getCtrler().hitModel.getHitVO("k1"), $self_main.getTarget());
```

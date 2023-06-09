# 基元游戏对象

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

说明：游戏对象的标识

使用示例：

```
var id: String = $self_main.id;
```

### 方法

> ###### changeColor

传入参数：v:ColorTransform

返回类型：void

说明：修改人物的颜色

使用示例：

```actionscript
$self_main.changeColor(new ColorTransform(1, 1, 1, 1, -255, -255, -255, 0));        //将自身调为纯黑色
```

未完待续

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
if ($self_main.isAllowBeHit)
{
	$self_main.hp += 100;
}   //当游戏对象允许受到攻击时，使其血量值增加100
```

> ###### isCross

类型：Boolean

说明：游戏对象是否允许穿越（默认为false）

使用示例：

```actionscript
if ($self_main.isCross)
{
	$self_main.hp += 100;
}   //当游戏对象允许穿越时，使其血量值增加100
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

未完待续

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

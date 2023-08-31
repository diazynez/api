# 游戏对象接口

### 实现此接口的类

- [基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite)
- [飞行道具主体](zh-cn/core-object-classes/Bullet)
- 位图滤镜视图（BitmapFilterView）（用于实现钢身发光效果）

### 属性

说明：设置或调整人物的默认属性

> ###### direct

类型：int

说明：游戏对象的朝向

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=direct)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=direct)

> ###### x

类型：Number

说明：游戏对象的横坐标

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=x)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=x)

> ###### y

类型：Number

说明：游戏对象的纵坐标

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=y)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=y)

> ###### team

类型：TeamVO

说明：游戏对象的小队对象

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=team)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=team)

### 方法

> ###### destory

传入参数：param1:Boolean = true

返回类型：void

说明：摧毁游戏对象

> ###### isDestoryed

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否已被摧毁

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=isdestoryed)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=isdestoryed)

> ###### render

传入参数：无

返回类型：void

说明：渲染一次游戏对象属性

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=render)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=render)

> ###### renderAnimate

传入参数：无

返回类型：void

说明：渲染一次游戏对象动画

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=renderanimate)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=renderanimate)

> ###### getDisplay

传入参数：无

返回类型：DisplayObject

说明：获取游戏对象元件

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getdisplay)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getdisplay)

> ###### hit

传入参数：param1:HitVO, param2:IGameSprite

返回类型：void

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=hit)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=hit)

> ###### beHit

传入参数：param1:HitVO, param2:Rectangle = null

返回类型：void

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=behit)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=behit)

> ###### getArea

传入参数：无

返回类型：Rectangle

说明：获取游戏对象当前在场景中的位置和大小

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getarea)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getarea)

> ###### getBodyArea

传入参数：无

返回类型：Rectangle

说明：获取游戏对象当前在场景中的位置和大小

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getbodyarea)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getbodyarea)

> ###### getCurrentHits

传入参数：无

返回类型：Array

说明：获取自身的攻击面，返回包含自身的攻击值对象的数组

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getcurrenthits)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getcurrenthits)

> ###### allowCrossMapXY

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否可穿过地图左右边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=allowcrossmapxy)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=allowcrossmapxy)

> ###### allowCrossMapBottom

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否可穿过地图底部边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=allowcrossmapbottom)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=allowcrossmapbottom)

> ###### getIsTouchSide

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否接触地图左右边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getistouchside)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getistouchside)

> ###### setIsTouchSide

传入参数：param1:Boolean

返回类型：void

说明：设置游戏对象是否接触地图左右边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setistouchside)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setistouchside)

> ###### setSpeedRate

传入参数：param1:Number

返回类型：vpid

说明：设置速度倍率（用于慢放效果，默认为30 / 游戏FPS）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setspeedrate)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setspeedrate)

> ###### setVolume

传入参数：v:Number

返回类型：void

说明：设置游戏对象的音量（范围为0~1）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setvolume)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setvolume)

> ###### 3.5增加 getActive

传入参数：无

返回类型：Boolean

说明：判断游戏对象是否处于活动状态

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getactive)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getactive)

> ###### 3.5增加 setActive

传入参数：param1:Boolean

返回类型：void

说明：设置游戏对象的活动状态

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setactive)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setactive)
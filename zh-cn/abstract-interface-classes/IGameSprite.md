# 游戏对象接口

### 实现此接口的类

- [基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite)
- [飞行道具主体](zh-cn/core-object-classes/Bullet)
- 位图滤镜视图（BitmapFilterView）（用于实现钢身发光效果）

### 属性

说明：设置或调整人物的默认属性

<span id="colortransform"></span>

> ###### 3.8开发增加 colorTransform

类型：`ColorTransform`

说明：读取或设置当前颜色变换对象

> ###### direct

类型：`int`

说明：游戏对象的朝向

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=direct)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=direct)

> ###### x

类型：`Number`

说明：游戏对象的横坐标

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=x)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=x)

> ###### y

类型：`Number`

说明：游戏对象的纵坐标

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=y)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=y)

> ###### team

类型：`TeamVO`

说明：游戏对象的小队对象

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=team)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=team)

### 方法

> ###### destory

传入参数：`param1:Boolean = true`

返回类型：`void`

说明：摧毁游戏对象

<span id="isdestoryed"></span>

> ###### 3.3增加 isDestoryed

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否已被摧毁

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=isdestoryed)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=isdestoryed)

> ###### render

传入参数：无

返回类型：`void`

说明：渲染一次游戏对象属性

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=render)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=render)

> ###### renderAnimate

传入参数：无

返回类型：`void`

说明：渲染一次游戏对象动画

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=renderanimate)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=renderanimate)

> ###### getDisplay

传入参数：无

返回类型：`DisplayObject`

说明：获取游戏对象元件

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getdisplay)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getdisplay)

> ###### hit

传入参数：`param1:HitVO, param2:IGameSprite`

返回类型：`void`

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=hit)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=hit)

> ###### beHit

传入参数：`param1:HitVO, param2:Rectangle = null`

返回类型：`void`

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=behit)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=behit)

> ###### getArea

传入参数：无

返回类型：`Rectangle`

说明：获取游戏对象当前在场景中的位置和大小

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getarea)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getarea)

> ###### getBodyArea

传入参数：无

返回类型：`Rectangle`

说明：获取游戏对象当前在场景中的位置和大小

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getbodyarea)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getbodyarea)

> ###### getCurrentHits

传入参数：无

返回类型：`Array`

说明：获取自身的攻击面，返回包含自身的攻击值对象的数组

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getcurrenthits)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getcurrenthits)

> ###### allowCrossMapXY

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否可穿过地图左右边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=allowcrossmapxy)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=allowcrossmapxy)

> ###### allowCrossMapBottom

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否可穿过地图底部边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=allowcrossmapbottom)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=allowcrossmapbottom)

<span id="allowcrossfloor"></span>

> ###### 3.8开发增加 allowCrossFloor

传入参数：无

返回类型：`Boolean`

说明：返回是否允许穿过地图平台

> ###### getIsTouchSide

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否接触地图左右边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getistouchside)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getistouchside)

> ###### setIsTouchSide

传入参数：`param1:Boolean`

返回类型：`void`

说明：设置游戏对象是否接触地图左右边缘

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setistouchside)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setistouchside)

> ###### setSpeedRate

传入参数：`param1:Number`

返回类型：`vpid`

说明：设置速度倍率（用于慢放效果，默认为30 / 游戏FPS）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setspeedrate)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setspeedrate)

<span id="setvolume"></span>

> ###### 3.3增加 setVolume

传入参数：`v:Number`

返回类型：`void`

说明：设置游戏对象的音量（范围为0~1）

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setvolume)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setvolume)

<span id="getactive"></span>

> ###### 3.5增加 getActive

传入参数：无

返回类型：`Boolean`

说明：判断游戏对象是否处于活动状态

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=getactive)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=getactive)

<span id="setactive"></span>

> ###### 3.5增加 setActive

传入参数：`param1:Boolean`

返回类型：`void`

说明：设置游戏对象的活动状态

实现实例：

[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite?id=setactive)

[飞行道具主体](zh-cn/core-object-classes/Bullet?id=setactive)

<span id="addrenderfunc"></span>

> ###### 3.8开发增加 addRenderFunc

传入参数：`func:Function = null, params:Object = null`

返回类型：`void`

说明：注册逐帧回调，同一函数在同一回调列表中不会重复注册。params 的配置如下：

- 不传 params：跟随对象的动画更新
- `{isFollowFps:true}`：跟随对象的逻辑更新频率
- `{isFollowFps:true, isPermanent:true}`：在独立的全局更新后回调中执行，与对象通常的逻辑和动画更新分开调度

isPermanent 仅在 isFollowFps 为 true 时有效；持久回调仍会在对象销毁时清理。回调的执行频率由对应的动画或逻辑更新决定

<span id="removerenderfunc"></span>

> ###### 3.8开发增加 removeRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：从逐帧回调列表移除指定函数，必须传入注册时的同一个 Function 引用

<span id="inheritrenderfunc"></span>

> ###### 3.8开发增加 inheritRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：标记已注册的逐帧回调，使其在小队模式更换出场人物时，由下一位出场人物继续执行。例如当前人物战败退场后，回调会由新入场的人物继承。需先调用addRenderFunc注册，再用本方法标记

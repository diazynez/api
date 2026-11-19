# 辅助人物主体

> 此类继承自[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite)，可使用此类的所有属性和方法
>
> 此类实现[游戏对象接口](zh-cn/abstract-interface-classes/IGameSprite)，符合该数据模型

### 属性

说明：设置或调整人物的默认属性

<span id="enable"></span>

> ###### 3.8开发增加 enable

类型：`Boolean`

说明：是否允许通常的辅助调用，默认 true

使用示例：

```actionscript
$assisterCtrler.getSelf().enable = false;
```

<span id="usefzqi"></span>

> ###### 3.8开发增加 useFzqi

类型：`Boolean`

说明：辅助调用是否使用辅助能量，默认 true

使用示例：

```actionscript
$assisterCtrler.getSelf().useFzqi = false;
```

<span id="orgpos"></span>

> ###### 3.8开发增加 orgPos

类型：`Point`

说明：辅助人物出生位置偏移，默认 Point(-30, 0)

使用示例：

```actionscript
import flash.geom.Point;

$assisterCtrler.getSelf().orgPos = new Point(-40, 0);
```

<span id="fzqiper"></span>

> ###### 3.8开发增加 fzqiPer

类型：`Number`

说明：辅助能量的自动恢复速度参数，默认 0.2；数值越大恢复越快

使用示例：

```actionscript
$assisterCtrler.getSelf().fzqiPer = 0.3;
```

> ###### onRemove

类型：`Function`

说明：辅助人物用于移除自身的函数

使用示例：

```actionscript
$assisterCtrler.getSelf().onRemove(this);
```

> ###### data

类型：`FighterVO`

说明：辅助人物的角色数据

使用示例：

```actionscript
var id: String = $assisterCtrler.getSelf().data.id;       //将当前角色的ID赋值到变量id
var name: String = $assisterCtrler.getSelf().data.name;       //将当前角色的名称赋值到变量name
var comicType: int = $assisterCtrler.getSelf().data.comicType;       //将当前角色的所属阵营赋值到变量comicType
/*
FighterVO中的属性包含：id (String)、name (String)、comicType (int)、fileUrl (String)、
                      startFrame (int)、faceUrl (String)、faceBigUrl (String)、
                      faceBarUrl (String)、faceWinUrl (String)、
                      contactFriends (Array)、contactEnemys (Array)、
                      says (Array)、bgm (String)、bgmRate (Number)、isAlive (Boolean)
            方法包含：initByXML、getRandSay、clone
*/
```

> ###### isAttacking

类型：`Boolean`

说明：辅助人物是否处于攻击状态（用于对方AI检测）

使用示例：

```actionscript
$assisterCtrler.getSelf().isAttacking = false;
```

> ###### name

类型：`String`

说明：辅助人物元件名称（只读）

使用示例：

```actionscript
var name1: String = $assisterCtrler.getSelf().name;
```

### 方法

<span id="getcurrentlabel"></span>

> ###### 3.8开发增加 getCurrentLabel

传入参数：无

返回类型：`String`

说明：取得底层 MovieClip 的 currentLabel，与控制器保存的动作名不完全相同

使用示例：

```actionscript
var currentLabel1:String = $assisterCtrler.getSelf().getCurrentLabel();
```

> ###### getOwner

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：获取主人的游戏对象

使用示例：

```actionscript
var owner = $assisterCtrler.getSelf().getOwner();
```

> ###### setOwner

传入参数：`v:IGameSprite`

返回类型：`void`

说明：设置辅助的主人

- [详细介绍](zh-cn/core-object-classes/FighterMain)

> ###### getCtrler

传入参数：无

返回类型：[`AssisiterCtrler`](zh-cn/other-ctrlers/AssisiterCtrler)

说明：获取辅助的控制器

使用示例：

```actionscript
var ctrler = $assisterCtrler.getSelf().getCtrler();
```

> ###### goFight

传入参数：无

返回类型：`void`

说明：辅助入场

使用示例：

```actionscript
$assisterCtrler.getSelf().goFight();
```

> ###### stop

传入参数：无

返回类型：`void`

说明：停止播放辅助动画

使用示例：

```actionscript
$assisterCtrler.getSelf().stop();
```

> ###### gotoAndPlay

传入参数：`frame:Object`

返回类型：`void`

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
$assisterCtrler.getSelf().gotoAndPlay("帧标签");
$assisterCtrler.getSelf().gotoAndPlay("帧标签", "场景 1");
$assisterCtrler.getSelf().gotoAndPlay(10);
```

> ###### gotoAndStop

传入参数：`frame:Object`

返回类型：`void`

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
$assisterCtrler.getSelf().gotoAndStop("帧标签");
$assisterCtrler.getSelf().gotoAndStop("帧标签", "场景 1");
$assisterCtrler.getSelf().gotoAndStop(10);
```

> ###### getTargets

传入参数：`Vector.<IGameSprite>`

返回类型：`void`

说明：获取对方小队的所有存活的游戏对象

使用示例：

- [详细介绍](zh-cn/abstract-interface-classes/IGameSprite)

```actionscript
var targets = $assisterCtrler.getSelf().getTargets();
```

> ###### removeSelf

传入参数：无

返回类型：`void`

说明：删除自身

说明：获取对方小队的所有存活的游戏对象

使用示例：

```actionscript
$assisterCtrler.getSelf().removeSelf();
```

> ###### render

传入参数：无

返回类型：`void`

说明：渲染一次辅助属性和控制器

使用示例：

```actionscript
$assisterCtrler.getSelf().render();
```

> ###### renderAnimate

传入参数：无

返回类型：`void`

说明：渲染一次辅助动画

使用示例：

```actionscript
$assisterCtrler.getSelf().renderAnimate();
```

> ###### getHitCheckRect

传入参数：`name:String`

返回类型：`Rectangle`

说明：根据元件名称获取元件当前在场景中的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var hitArea: Rectangle = $assisterCtrler.getSelf().getHitCheckRect("zh1atm");
```

> ###### getCheckHitRect

传入参数：`name:String`

返回类型：`Rectangle`

说明：根据元件名称获取MC内元件的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var checkHitRect: Rectangle = $assisterCtrler.getSelf().getCheckHitRect("zh1atm");
```

<span id="getcurrentrect"></span>

> ###### 3.8开发增加 getCurrentRect

传入参数：`param1:Rectangle, param2:String = null`

返回类型：`Rectangle`

说明：将局部矩形转换到游戏坐标，考虑自身朝向；可传缓存名称复用 Rectangle

使用示例：

```actionscript
// 将以辅助人物为原点的局部矩形换算为游戏坐标；相同缓存名称会复用返回矩形
import flash.geom.Rectangle;

var localRect1:Rectangle = new Rectangle(-20, -60, 40, 60);
var worldRect1:Rectangle = $assisterCtrler.getSelf().getCurrentRect(localRect1, "checkRect1");
```

> ###### hit

传入参数：`hitvo:HitVO, target:IGameSprite`

返回类型：`void`

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：主人物集气、HITS的UI刷新、计分板得分增加

使用示例：

```actionscript
$assisterCtrler.getSelf().hit($assisterCtrler.getOwner().getCtrler().hitModel.getHitVO("k1"), $assisterCtrler.getSelf().getCurrentTarget());
```

> ###### getCurrentHits

传入参数：无

返回类型：`Array`

说明：获取自身当前场上存在的一般攻击面，返回当前包含自身所有[攻击值对象](zh-cn/data-model-classes/HitVO)的数组

使用示例：

```actionscript
var curHitsArr: Array = $assisterCtrler.getSelf().getCurrentHits();
```

> ###### getCurrentTarget

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：获取对方的游戏对象（可用于控制对方）

使用示例：

```actionscript
var tSP = $assisterCtrler.getSelf().getCurrentTarget();
```

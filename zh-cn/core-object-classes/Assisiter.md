# 辅助人物主体

### 属性

说明：设置或调整人物的默认属性

> ###### onRemove

类型：Function

说明：辅助人物用于移除自身的函数

使用示例：

```actionscript
$assisterCtrler.getSelf().onRemove(this);
```

> ###### data

类型：FighterVO

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

类型：Boolean

说明：辅助人物是否处于攻击状态（用于对方AI检测）

使用示例：

```actionscript
$assisterCtrler.getSelf().isAttacking = false;
```

> ###### name

类型：String

说明：辅助人物元件名称（只读）

使用示例：

```actionscript
var name1: String = $assisterCtrler.getSelf().name;
```

### 方法

> ###### getOwner

传入参数：无

返回类型：IGameSprite

说明：获取主人的游戏对象

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

```actionscript
var owner = $assisterCtrler.getSelf().getOwner();
```

> ###### setOwner

传入参数：v:IGameSprite

返回类型：void

说明：设置辅助的主人

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

> ###### getCtrler

传入参数：无

返回类型：AssisiterCtrler

说明：获取辅助的控制器

使用示例：

- [详细介绍](zh-cn/other-ctrlers/AssisiterCtrler)

```actionscript
var ctrler = $assisterCtrler.getSelf().getCtrler();
```

> ###### goFight

传入参数：无

返回类型：void

说明：辅助入场

使用示例：

```actionscript
$assisterCtrler.getSelf().goFight();
```

> ###### stop

传入参数：无

返回类型：void

说明：停止播放辅助动画

使用示例：

```actionscript
$assisterCtrler.getSelf().stop();
```

> ###### gotoAndPlay

传入参数：frame:Object

返回类型：void

说明：跳转到对应帧标签并播放

使用示例：

```actionscript
$assisterCtrler.getSelf().gotoAndPlay("帧标签");
$assisterCtrler.getSelf().gotoAndPlay("帧标签", "场景 1");
$assisterCtrler.getSelf().gotoAndPlay(10);
```

> ###### gotoAndStop

传入参数：frame:Object

返回类型：void

说明：跳转到对应帧标签并停止

使用示例：

```actionscript
$assisterCtrler.getSelf().gotoAndStop("帧标签");
$assisterCtrler.getSelf().gotoAndStop("帧标签", "场景 1");
$assisterCtrler.getSelf().gotoAndStop(10);
```

> ###### getTargets

传入参数：Vector.\<IGameSprite\>

返回类型：void

说明：获取对方队伍的所有存活的游戏对象

使用示例：

- [详细介绍](zh-cn/abstract-interface-classes/IGameSprite)

```actionscript
var targets = $assisterCtrler.getSelf().getTargets();
```

> ###### removeSelf

传入参数：无

返回类型：void

说明：删除自身

说明：获取对方队伍的所有存活的游戏对象

使用示例：

```actionscript
$assisterCtrler.getSelf().removeSelf();
```

> ###### render

传入参数：无

返回类型：void

说明：渲染一次辅助属性和控制器

使用示例：

```actionscript
$assisterCtrler.getSelf().render();
```

> ###### renderAnimate

传入参数：无

返回类型：void

说明：渲染一次辅助动画

使用示例：

```actionscript
$assisterCtrler.getSelf().renderAnimate();
```

> ###### getHitCheckRect

传入参数：name:String

返回类型：Rectangle

说明：根据元件名称获取元件当前在场景中的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var hitArea: Rectangle = $assisterCtrler.getSelf().getHitCheckRect("zh1atm");
```

> ###### getCheckHitRect

传入参数：name:String

返回类型：Rectangle

说明：根据元件名称获取MC内元件的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var checkHitRect: Rectangle = $assisterCtrler.getSelf().getCheckHitRect("zh1atm");
```

> ###### hit

传入参数：hitvo:HitVO, target:IGameSprite

返回类型：void

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：主人物集气、HITS的UI刷新、计分板得分增加

使用示例：

```actionscript
$assisterCtrler.getSelf().hit($assisterCtrler.getOwner().getCtrler().hitModel.getHitVO("k1"), $assisterCtrler.getSelf().getCurrentTarget());
```

> ###### getCurrentHits

传入参数：无

返回类型：Array

说明：获取自身当前场上存在的一般攻击面，返回当前包含自身所有[攻击值对象](zh-cn/data-model-classes/HitVO)的数组

使用示例：

```actionscript
var curHitsArr: Array = $assisterCtrler.getSelf().getCurrentHits();
```

> ###### getCurrentTarget

传入参数：无

返回类型：IGameSprite

说明：获取对方的游戏对象（可用于控制对方）

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

```actionscript
var tSP = $assisterCtrler.getSelf().getCurrentTarget();
```

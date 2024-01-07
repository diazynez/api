# Fighter控制器

### 属性

说明：设置或调整人物的默认属性

> ###### hp

类型：Number

说明：人物的血量值（默认为1000）

使用示例：

```actionscript
$fighter_ctrler.hp = 800;       //设置人物的血量值为800
var hp1: Number = parent.$fighter_ctrler.hp;     //将当前血量值赋值到变量hp1
```

> ###### energy

类型：Number

说明：人物的耐力最大值（默认为100）

使用示例：

```actionscript
$fighter_ctrler.energy = 150;       //设置人物的最大耐力值为150
var energy1: Number = parent.$fighter_ctrler.energy;     //将当前最大耐力值赋值到变量energy1
```

> ###### speed

类型：Number

说明：人物的速度值（默认为6）

使用示例：

```actionscript
$fighter_ctrler.speed = 12;     //设置人物的速度值为12
var speed1: Number = parent.$fighter_ctrler.speed;       //将当前速度值赋值到变量speed
```

> ###### jumpPower

类型：Number

说明：人物的跳跃能力值（默认为15）

使用示例：

```actionscript
$fighter_ctrler.jumpPower = 12;     //设置人物的跳跃能力值为12
var jumpPower1: Number = parent.$fighter_ctrler.jumpPower;      //将当前跳跃能力值赋值到变量jumpPower1
```

> ###### heavy

类型：Number

说明：人物的体格值（默认为2）

使用示例：

```actionscript
$fighter_ctrler.heavy = 3;      //设置人物的体格值为3
var heavy1: Number = parent.$fighter_ctrler.heavy;       //将当前体格值赋值到变量heavy1
```

> ###### defenseType

类型：int

说明：人物的防御类型值（0=剑，1=手，默认为0）

使用示例：

```actionscript
$fighter_ctrler.defenseType = 1;        //设置人物的防御类型值为1
var defenseType1: int = parent.$fighter_ctrler.defenseType;        //将当前防御类型值赋值到变量defenseType1
```

> ###### self

类型：DisplayObject

说明：自身的显示对象（只读）

使用示例：

```actionscript
parent.$fighter_ctrler.self.visible = true/false;       //将自身设置为显示/消失
parent.$fighter_ctrler.self.$mc_ctrler.setHurtAction("招21");  // 使自身进入反制状态
```

> ###### target

类型：DisplayObject

说明：对方的显示对象（只读）

使用示例：

```actionscript
parent.$fighter_ctrler.target.visible = true/false;     //将对方设置为显示/消失
parent.$fighter_ctrler.target.$mc_ctrler.setHurtAction("招21");  // 使对方进入反制状态
```

> ###### hitModel

类型：FighterHitModel

说明：人物的攻击模型

使用示例：

[详细介绍](zh-cn/data-model-classes/FighterHitModel)


```actionscript
var hitModel = parent.$fighter_ctrler.hitModel;
```

### 方法

> ###### getTargetSP

传入参数：无

返回类型：IGameSprite

说明：获取对方的游戏对象（可用于控制对方）

使用示例：

- [详细介绍](zh-cn/core-object-classes/FighterMain)

```actionscript
var tSP = parent.$fighter_ctrler.getTargetSP();
```

> ###### getTargetState

传入参数：无

返回类型：int

说明：获取对方的状态号

0=正常，40=硬直，10=正在攻击，11=正在使用技能，12=正在使用必杀，13=正在使用超必杀，14=正在跳跃，15=正在瞬步，16=正在反制，20=正在防御，21=被打，22=击飞，23=击倒，24=击倒弹起，30=死亡，50=正在卍解，60=开场，61=胜利，62=失败

使用示例：

```actionscript
if (parent.$fighter_ctrler.getTargetState() == 21)
{
    parent.$fighter_ctrler.speed = 12;
}   //当对方的状态是被打时，设置我方人物的速度值为12
```

> ###### setTargetVelocity

传入参数：x:Number,y:Number

返回类型：void

说明：设置对方受力

使用示例：

```actionscript
parent.$fighter_ctrler.setTargetVelocity(1, 1);
```

> ###### setTargetDamping

传入参数：x:Number,y:Number

返回类型：void

说明：设置对方阻力

使用示例：

```actionscript
parent.$fighter_ctrler.setTargetDamping(0.1, 0.1);
```

> ###### targetInRange

传入参数：rx:Array = null , ry:Array = null

返回类型：Boolean

说明：判断对方是否在距离自身的一定范围内（格式为：[左,右],[上,下]）

使用示例：

```actionscript
if (parent.$fighter_ctrler.targetInRange([0, 100], [-50, 50]))
{
    parent.$fighter_ctrler.speed = 12;
}   //当对方在该范围内时，设置我方人物的速度值为12
```

> ###### justHit

传入参数：hitId:String , includeDefense:Boolean = false

返回类型：Boolean

说明：判断对方是否被指定攻击面命中（参数1：传入攻击ID，参数2：防御时是否调用）

使用示例：

```actionscript
if (parent.$fighter_ctrler.justHit("k1", false))
{
    parent.$fighter_ctrler.speed = 12;
}   //当对方被k1atm打中，并为真命中时，设置我方人物的速度值为12
```

> ###### defineAction

传入参数：id:String , obj:Object

返回类型：void

说明：定义攻击ID

使用示例：

[defineAction](../../tools/defineAction.html ':include :type=iframe width=100% height=557px')

```actionscript
$fighter_ctrler.defineAction("tk" ,{power:30 , hitType:1 , hitx:2 , hity:6 , hurtTime:300 , hurtType:0 , isBreakDef:false});

/*
obj的定义:
power:Number = 0（攻击力）
hitType:int = 1（攻击类型）
hitx:Number = 0（横向受力）
hity:Number = 0（纵向受力）
hurtTime:Number = 300（硬直时间）
hurtType:int = 0（是否击倒）
isBreakDef:Boolean = false（是否破防）
powerRate:Number = 1（攻击力倍数）
checkDirect:Boolean = true（是否背击破防）
slowDown:Number = 0（慢放时间）
focusTarget:Boolean = false（镜头聚焦到对方）
doubleHurtType:int = 0（第二击是否击倒）
*/
```

> ###### defineBishaFace

传入参数：id:String , face:Class

返回类型：void

说明：定义必杀特写，第二个参数需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineBishaFace("XX特写1", bs1face);
```

> ###### defineHurtSound

传入参数：sound1,sound2...

返回类型：void

说明：定义受伤的声音，第二个参数需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineHurtSound(snd_hurt1, snd_hurt1);
```

> ###### defineHurtFlySound

传入参数：sound1,sound2...

返回类型：void

说明：定义被击飞的声音，第二个参数需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineHurtFlySound(snd_hurt2, snd_hurt2);
```

> ###### defineDieSound

传入参数：sound1,sound2...

返回类型：void

说明：定义死亡的声音，第二个参数需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineDieSound(snd_hurt3, snd_hurt3);
```

> ###### initMc

传入参数：mc:MovieClip

返回类型：void

说明：初始化人物mc

使用示例：

```actionscript
$fighter_ctrler.initMc(mc);
```

> ###### getCurrentHits

传入参数：无

返回类型：Array

说明：获取自身当前场上存在的一般攻击面，返回当前包含自身所有[攻击值对象](zh-cn/data-model-classes/HitVO)的数组

使用示例：

```actionscript
var curHitsArr: Array = parent.$fighter_ctrler.getCurrentHits();
```

> ###### getBodyArea

传入参数：无

返回类型：Rectangle

说明：获取人物被打面当前在场景中的位置和大小，不存在被打面返回null

使用示例：

```actionscript
var bodyArea: Rectangle = parent.$fighter_ctrler.getBodyArea();
```

> ###### getHitCheckRect

传入参数：name:String

返回类型：Rectangle

说明：根据元件名称获取元件当前在场景中的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var hitArea: Rectangle = parent.$fighter_ctrler.getHitCheckRect("zh1atm");
```

> ###### getCurrentRect

传入参数：rect:Rectangle, cacheId:String = null

返回类型：Rectangle

说明：将一个矩形的相对坐标转换为游戏场景中的绝对坐标（参数1：传入的矩形，参数2：游戏内缓存的矩形ID）

使用示例：

```actionscript
var curArea: Rectangle = parent.$fighter_ctrler.getCurrentRect(new Rectangle(-7, -30, 15, 55), null);
```

> ###### getHitRange

传入参数：id:String

返回类型：Rectangle

说明：获取AI判定面当前在场景中的范围（参数：判定面的ID）

使用示例：

```actionscript
var aiArea: Rectangle = parent.$fighter_ctrler.getHitRange("kanmian");
```

> ###### doWanKai

传入参数：无（3.3改动：frame:int = 0）

返回类型：void

说明：执行变身

使用示例：

```actionscript
parent.$fighter_ctrler.doWanKai();      //变身为下一段人物
parent.$fighter_ctrler.doWanKai(2);     //变身为人物的一段
```

> ###### setDirectToTarget

传入参数：无

返回类型：void

说明：使自身面对对方

使用示例：

```actionscript
parent.$fighter_ctrler.setDirectToTarget();
```

> ###### moveOnce

传入参数：x:Number = 0 , y:Number = 0

返回类型：void

说明：移动一次

使用示例：

```actionscript
parent.$fighter_ctrler.moveOnce(0,0);
```

> ###### moveToTarget

传入参数：x:Object = null , y:Object = null , setDirect:Boolean = true

返回类型：void

说明：移动到对方的位置（x/y填null则横/纵向不进行移动）（x : X位置偏移，y : Y位置偏移，setDirect : 是否面向对方）

使用示例：

```actionscript
parent.$fighter_ctrler.moveToTarget(0, 0, true);
```

> ###### setCross

传入参数：v:Boolean

返回类型：void

说明：设置穿越 （不碰撞对方，但是被打判定仍然以被打面为准）

使用示例：

```actionscript
parent.$fighter_ctrler.setCross(true);
```

> ###### addHp

传入参数：v:Number

返回类型：void

说明：增加生命

使用示例：

```actionscript
parent.$fighter_ctrler.addHp(10);
```

> ###### addHpPercent

传入参数：v:Number

返回类型：void

说明：以最大生命值的倍数增加生命（此值大于0，小于等于1）

使用示例：

```actionscript
parent.$fighter_ctrler.addHpPercent(0.15);
```

> ###### loseHp

传入参数：v:Number

返回类型：void

说明：减少生命

使用示例：

```actionscript
parent.$fighter_ctrler.loseHp(10);
```

> ###### loseHpPercent

传入参数：v:Number

返回类型：void

说明：以最大生命值的倍数减少生命（此值大于0，小于等于1）

使用示例：

```actionscript
parent.$fighter_ctrler.loseHpPercent(0.15);
```

> ###### getMcCtrl

传入参数：无

返回类型：FighterMcCtrler

说明：获取Mc控制器

使用示例：

- [详细介绍](zh-cn/main-fighter-ctrlers/FighterMcCtrler)

```actionscript
var mcCtrl = parent.$fighter_ctrler.getMcCtrl();
```

> ###### getEffectCtrl

传入参数：无

返回类型：FighterEffectCtrl

说明：获取Effect控制器

使用示例：

- [详细介绍](zh-cn/main-fighter-ctrlers/FighterEffectCtrl)

```actionscript
var effectCtrl = parent.$fighter_ctrler.getEffectCtrl();
```

> ###### getVoiceCtrl

传入参数：无

返回类型：FighterVoiceCtrler

说明：获取Voice控制器

使用示例：

- [详细介绍](zh-cn/main-fighter-ctrlers/FighterVoiceCtrler)

```actionscript
var voiceCtrl = parent.$fighter_ctrler.getVoiceCtrl();
```

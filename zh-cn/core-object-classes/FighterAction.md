# 人物动作

### 属性

说明：设置或调整人物的默认属性

> ###### isMoving

类型：Boolean

说明：人物是否处于移动状态

使用示例：

```actionscript
var isMoving: Boolean = parent.$mc_ctrler.getAction().isMoving;
```

> ###### isJumping

类型：Boolean

说明：人物是否处于跳跃状态

使用示例：

```actionscript
var isJumping: Boolean = parent.$mc_ctrler.getAction().isJumping;
```

> ###### isDefensing

类型：Boolean

说明：人物是否处于防御状态

使用示例：

```actionscript
var isDefensing: Boolean = parent.$mc_ctrler.getAction().isDefensing;
```

> ###### isDashing

类型：Boolean

说明：人物是否处于冲刺状态

使用示例：

```actionscript
var isDashing: Boolean = parent.$mc_ctrler.getAction().isDashing;
```

> ###### isHurting

类型：Boolean

说明：人物是否处于被打状态

使用示例：

```actionscript
var isHurting: Boolean = parent.$mc_ctrler.getAction().isHurting;
```

> ###### isHurtFlying

类型：Boolean

说明：人物是否处于击飞状态

使用示例：

```actionscript
var isHurtFlying: Boolean = parent.$mc_ctrler.getAction().isHurtFlying;
```

> ###### isDefenseHiting

类型：Boolean

说明：人物是否处于防御受击状态

使用示例：

```actionscript
var isDefenseHiting: Boolean = parent.$mc_ctrler.getAction().isDefenseHiting;
```

> ###### airMove

类型：Boolean

说明：人物在空中是否可移动

使用示例：

```actionscript
parent.$mc_ctrler.getAction().airMove = true;
```

> ###### touchFloor

类型：String

说明：人物落地时执行的动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().touchFloor = "落地";
```

> ###### touchFloorBreakAct

类型：Boolean = false

说明：人物接触到地面时是否中断当前动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().touchFloorBreakAct = false;
```

> ###### hitTarget

类型：String

说明：人物检测碰撞后执行的动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().hitTarget = "砍技12";
```

> ###### hitTargetChecker

类型：String

说明：人物检测碰撞的对象名称

使用示例：

```actionscript
parent.$mc_ctrler.getAction().hitTargetChecker = "kj10atm";
```

> ###### FVO专用 unHolding

类型：String

说明：人物未蓄力后执行的动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().unHolding = "砍技12";
```

> ###### FVO专用 unHoldingChecker

类型：Function

说明：人物蓄力按键检测（包含攻击（J）、技能（U）、必杀（I）三种）

使用示例：

```actionscript
if (!parent.$mc_ctrler.getAction().unHoldingChecker())
{
	parent.$fighter_ctrler.speed = 12;
}   //当对方的蓄力按键未按下时，设置我方人物的速度值为12
```

> ###### moveLeft

类型：String

说明：向左行走（A）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().moveLeft = "走";
```

> ###### moveRight

类型：String

说明：向右行走（D）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().moveRight = "走";
```

> ###### defense

类型：String

说明：防御（S）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().defense = "防御";
```

> ###### jump

类型：String

说明：跳（K）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jump = "跳";
```

> ###### 正常模式专用 jumpQuick

类型：String

说明：快速跳（K）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jumpQuick = "跳";
```

> ###### jumpDown

类型：String

说明：下台阶（SK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jumpDown = "落";
```

> ###### dash

类型：String

说明：瞬步（L）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().defense = "瞬步";
```

> ###### FVO专用 dashBack

类型：String

说明：后撤步（SL）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().dashBack = "起身";
```

> ###### attack

类型：String

说明：攻击（J）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().attack = "砍1";
```

> ###### skill1

类型：String

说明：砍技1（SJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().skill1 = "砍技1";
```

> ###### skill2

类型：String

说明：砍技2（WJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().skill2 = "砍技2";
```

> ###### zhao1

类型：String

说明：招1（U）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().zhao1 = "招1";
```

> ###### zhao2

类型：String

说明：招2（SU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().zhao2 = "招2";
```

> ###### zhao3

类型：String

说明：招3（WU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().zhao3 = "招3";
```

> ###### catch1

类型：String

说明：摔1（ADJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().catch1 = "摔1";
```

> ###### catch2

类型：String

说明：摔2（ADU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().catch2 = "摔2";
```

> ###### bisha

类型：String

说明：必杀（I）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bisha = "必杀";
```

> ###### bishaUP

类型：String

说明：上必杀（WI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaUP = "上必杀";
```

> ###### bishaSUPER

类型：String

说明：超必杀（SI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaSUPER = "超必杀";
```

> ###### hurtAction

类型：String

说明：人物被打时执行动作，用于反制技能，注意跳转到的帧处须是无敌状态

使用示例：

```actionscript
parent.$mc_ctrler.getAction().hurtAction = "招22";
```

> ###### waiKai

类型：String

说明：变身（JK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().waiKai = "万解";
```

> ###### 3.3增加 waiKaiW

类型：String

说明：变身（WJK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().waiKaiW = "万解W";
```

> ###### 3.3增加 waiKaiS

类型：String

说明：变身（SJK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().waiKaiS = "万解S";
```

> ###### attackAIR

类型：String

说明：跳砍（KJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().attackAIR = "跳砍";
```

> ###### skillAIR

类型：String

说明：跳招（KU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().skillAIR = "跳招";
```

> ###### bishaAIR

类型：String

说明：空中必杀（KI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaAIR = "空中必杀";
```

> ###### airHitTimes

类型：int

说明：空中可攻击次数（默认为1）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().airHitTimes = 0;
```

> ###### jumpTimes

类型：int

说明：可跳跃次数（默认为2）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jumpTimes = 0;
```

> ###### bishaQi

类型：int

说明：必杀（I）的耗气数值

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaQi = 100;
```

> ###### bishaUPQi

类型：int

说明：上必杀（WI）的耗气数值

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaUPQi = 100;
```

> ###### bishaSUPERQi

类型：int

说明：超必杀（SI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaSUPERQi = 300;
```

> ###### bishaAIRQi

类型：int

说明：空中必杀（KI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaAIRQi = 100;
```

### 方法

> ###### clear

传入参数：无

返回类型：void

说明：调用[clearState方法](zh-cn/core-object-classes/FighterAction?id=clearstate)和[clearAction方法](zh-cn/core-object-classes/FighterAction?id=clearaction)

使用示例：

```actionscript
parent.$mc_ctrler.getAction().clear();
```

> ###### clearState

传入参数：无

返回类型：void

说明：清除角色状态

使用示例：

```actionscript
parent.$mc_ctrler.getAction().clearState();
```

> ###### clearAction

传入参数：无

返回类型：void

说明：清除角色动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().clearAction();
```

> ###### render

传入参数：无

返回类型：void

说明：渲染一次冷却

使用示例：

```actionscript
parent.$mc_ctrler.getAction().render();
```

> ###### setCD

传入参数：id:String, time:int

返回类型：void

说明：设置冷却（参数1：冷却ID，参数2：冷却时长）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().setCD("cd_test", 10 * Math.pow(getDefinitionByName("net.play5d.game.bvn::GameConfig").FPS_GAME, 2));        //设置名为cd_test、时长为10s的冷却
```

> ###### CDOK

传入参数：id:String

返回类型：Boolean

说明：判断冷却是否结束（不存在的冷却默认为已结束）

使用示例：

```actionscript
if (parent.$mc_ctrler.getAction().CDOK("cd_test"))
{
	parent.$fighter_ctrler.speed = 12;
}   //当cd_test冷却结束时，设置我方人物的速度值为12
```

# 人物动作

### 属性

说明：设置或调整人物的默认属性

> ###### isMoving

类型：`Boolean`

说明：人物是否处于移动状态

使用示例：

```actionscript
var isMoving: Boolean = parent.$mc_ctrler.getAction().isMoving;
```

> ###### isJumping

类型：`Boolean`

说明：人物是否处于跳跃状态

使用示例：

```actionscript
var isJumping: Boolean = parent.$mc_ctrler.getAction().isJumping;
```

> ###### isDefensing

类型：`Boolean`

说明：人物是否处于防御状态

使用示例：

```actionscript
var isDefensing: Boolean = parent.$mc_ctrler.getAction().isDefensing;
```

> ###### isDashing

类型：`Boolean`

说明：人物是否处于冲刺状态

使用示例：

```actionscript
var isDashing: Boolean = parent.$mc_ctrler.getAction().isDashing;
```

> ###### isHurting

类型：`Boolean`

说明：人物是否处于被打状态

使用示例：

```actionscript
var isHurting: Boolean = parent.$mc_ctrler.getAction().isHurting;
```

> ###### isHurtFlying

类型：`Boolean`

说明：人物是否处于击飞状态

使用示例：

```actionscript
var isHurtFlying: Boolean = parent.$mc_ctrler.getAction().isHurtFlying;
```

> ###### isDefenseHiting

类型：`Boolean`

说明：人物是否处于防御受击状态

使用示例：

```actionscript
var isDefenseHiting: Boolean = parent.$mc_ctrler.getAction().isDefenseHiting;
```

<span id="issteelhiting"></span>

> ###### 3.8开发增加 isSteelHiting

类型：`Boolean`

说明：是否处于钢身受击状态

使用示例：

```actionscript
var isSteelHiting1:Boolean = parent.$mc_ctrler.getAction().isSteelHiting;
```

<span id="isflying"></span>

> ###### 3.8开发增加 isFlying

类型：`Boolean`

说明：是否启用飞行状态，默认 false

使用示例：

```actionscript
var isFlying1:Boolean = parent.$mc_ctrler.getAction().isFlying;
```

> ###### airMove

类型：`Boolean`

说明：人物在空中是否可移动

使用示例：

```actionscript
parent.$mc_ctrler.getAction().airMove = true;
```

> ###### touchFloor

类型：`String`

说明：人物落地时执行的动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().touchFloor = "落地";
```

> ###### touchFloorBreakAct

类型：`Boolean = false`

说明：人物接触到地面时是否中断当前动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().touchFloorBreakAct = false;
```

> ###### hitTarget

类型：`String`

说明：人物检测碰撞后执行的动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().hitTarget = "砍技12";
```

> ###### hitTargetChecker

类型：`String`

说明：人物检测碰撞的对象名称

使用示例：

```actionscript
parent.$mc_ctrler.getAction().hitTargetChecker = "kj10atm";
```

<span id="touchside"></span>

> ###### 3.8开发增加 touchSide

类型：`String`

说明：碰到地图侧边时执行的动作标签

使用示例：

```actionscript
var touchSide1:String = parent.$mc_ctrler.getAction().touchSide;
```

> ###### FVO专用 unHolding

类型：`String`

说明：人物未蓄力后执行的动作

<div class="version-note">

3.8开发也可使用

</div>

使用示例：

```actionscript
parent.$mc_ctrler.getAction().unHolding = "砍技12";
```

> ###### FVO专用 unHoldingChecker

类型：`Function`

说明：人物蓄力按键检测（包含攻击（J）、技能（U）、必杀（I）三种）

<div class="version-note">

3.8开发也可使用

</div>

使用示例：

```actionscript
if (!parent.$mc_ctrler.getAction().unHoldingChecker())
{
	parent.$fighter_ctrler.speed = 12;
}   //当对方的蓄力按键未按下时，设置我方人物的速度值为12
```

> ###### moveLeft

类型：`String`

说明：向左行走（A）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().moveLeft = "走";
```

> ###### moveRight

类型：`String`

说明：向右行走（D）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().moveRight = "走";
```

> ###### defense

类型：`String`

说明：防御（S）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().defense = "防御";
```

> ###### jump

类型：`String`

说明：跳（K）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jump = "跳";
```

> ###### 正常模式专用 jumpQuick

类型：`String`

说明：快速跳（K）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jumpQuick = "跳";
```

> ###### jumpDown

类型：`String`

说明：下台阶（SK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jumpDown = "落";
```

> ###### dash

类型：`String`

说明：瞬步（L）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().dash = "瞬步";
```

> ###### FVO专用 dashBack

类型：`String`

说明：后撤步（SL）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().dashBack = "起身";
```

> ###### attack

类型：`String`

说明：攻击（J）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().attack = "砍1";
```

> ###### skill1

类型：`String`

说明：砍技1（SJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().skill1 = "砍技1";
```

> ###### skill2

类型：`String`

说明：砍技2（WJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().skill2 = "砍技2";
```

> ###### zhao1

类型：`String`

说明：招1（U）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().zhao1 = "招1";
```

> ###### zhao2

类型：`String`

说明：招2（SU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().zhao2 = "招2";
```

> ###### zhao3

类型：`String`

说明：招3（WU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().zhao3 = "招3";
```

> ###### catch1

类型：`String`

说明：摔1（ADJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().catch1 = "摔1";
```

> ###### catch2

类型：`String`

说明：摔2（ADU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().catch2 = "摔2";
```

<span id="specialskill"></span>

> ###### 3.8开发增加 specialSkill

类型：`Object`

说明：特殊技能的动作登记数据，由 Mc 控制器的 [setSpecialSkill](zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=setspecialskill) 设置，供引擎触发对应动作

> ###### bisha

类型：`String`

说明：必杀（I）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bisha = "必杀";
```

> ###### bishaUP

类型：`String`

说明：上必杀（WI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaUP = "上必杀";
```

> ###### bishaSUPER

类型：`String`

说明：超必杀（SI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaSUPER = "超必杀";
```

> ###### hurtAction

类型：`String`

说明：当身触发后执行的动作标签，跳转到的目标帧须设为无敌状态

使用示例：

```actionscript
parent.$mc_ctrler.getAction().hurtAction = "招22";
```

> ###### waiKai

类型：`String`

说明：变身（JK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().waiKai = "万解";
```

<span id="waikaiw"></span>

> ###### 3.3增加 waiKaiW

类型：`String`

说明：变身（WJK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().waiKaiW = "万解W";
```

<span id="waikais"></span>

> ###### 3.3增加 waiKaiS

类型：`String`

说明：变身（SJK）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().waiKaiS = "万解S";
```

> ###### attackAIR

类型：`String`

说明：跳砍（KJ）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().attackAIR = "跳砍";
```

> ###### skillAIR

类型：`String`

说明：跳招（KU）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().skillAIR = "跳招";
```

> ###### bishaAIR

类型：`String`

说明：空中必杀（KI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaAIR = "空中必杀";
```

> ###### airHitTimes

类型：`int`

说明：空中可攻击次数（默认为1）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().airHitTimes = 0;
```

> ###### jumpTimes

类型：`int`

说明：可跳跃次数（默认为2）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().jumpTimes = 0;
```

> ###### bishaQi

类型：`int`

说明：必杀（I）的耗气数值

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaQi = 100;
```

> ###### bishaUPQi

类型：`int`

说明：上必杀（WI）的耗气数值

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaUPQi = 100;
```

> ###### bishaSUPERQi

类型：`int`

说明：超必杀（SI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaSUPERQi = 300;
```

> ###### bishaAIRQi

类型：`int`

说明：空中必杀（KI）的纽带（填null为禁用纽带）

使用示例：

```actionscript
parent.$mc_ctrler.getAction().bishaAIRQi = 100;
```

<span id="specialhurtbreak"></span>

> ###### 3.8开发增加 specialHurtBreak

类型：`Object`

说明：特殊受击脱离的动作登记数据，由 Mc 控制器的 [setSpecialHurtBreak](zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=setspecialhurtbreak) 设置

<span id="specialassistaction"></span>

> ###### 3.8开发增加 specialAssistAction

类型：`Object`

说明：特殊辅助调用的动作登记数据，由 Mc 控制器的 [setSpecialAssist](zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=setspecialassist) 设置

### 方法

> ###### clear

传入参数：无

返回类型：`void`

说明：调用[clearState方法](zh-cn/core-object-classes/FighterAction?id=clearstate)和[clearAction方法](zh-cn/core-object-classes/FighterAction?id=clearaction)

使用示例：

```actionscript
parent.$mc_ctrler.getAction().clear();
```

> ###### clearState

传入参数：无

返回类型：`void`

说明：清除角色状态

使用示例：

```actionscript
parent.$mc_ctrler.getAction().clearState();
```

> ###### clearAction

传入参数：无

返回类型：`void`

说明：清除角色动作

使用示例：

```actionscript
parent.$mc_ctrler.getAction().clearAction();
```

> ###### render

传入参数：无

返回类型：`void`

说明：渲染一次冷却

使用示例：

```actionscript
parent.$mc_ctrler.getAction().render();
```

> ###### setCD

传入参数：`id:String, time:int`

返回类型：`void`

说明：设置冷却（参数1：冷却ID，参数2：冷却时长）

<div class="version-note">

`setCD` 在 3.0、3.3、3.5、3.6 源码中先将传入值除以 `GameConfig.FPS_GAME`，再由每次逻辑更新递减。旧版 10 秒示例因此使用 `10 * FPS_GAME * FPS_GAME`。

3.8开发直接保存传入的帧数，并在动画更新时递减；10 秒应填写 `10 * 30`。暂停战斗时该版本不推进此动画冷却计数。

</div>

```actionscript
// 仅用于 3.8开发：10 秒，即 300 个动画帧
parent.$mc_ctrler.getAction().setCD("cd_test", 300);
```

使用示例：

```actionscript
parent.$mc_ctrler.getAction().setCD("cd_test", 10 * Math.pow(getDefinitionByName("net.play5d.game.bvn::GameConfig").FPS_GAME, 2));        //设置名为cd_test、时长为10s的冷却
```

<span id="getcd"></span>

> ###### 3.8开发增加 getCD

传入参数：`param1:String`

返回类型：`Number`

说明：取得指定动作的剩余冷却计数，未登记时返回 NaN

使用示例：

```actionscript
var cd1:Number = parent.$mc_ctrler.getAction().getCD("cd_test");
```

> ###### CDOK

传入参数：`id:String`

返回类型：`Boolean`

说明：判断冷却是否结束（不存在的冷却默认为已结束）

使用示例：

```actionscript
if (parent.$mc_ctrler.getAction().CDOK("cd_test"))
{
	parent.$fighter_ctrler.speed = 12;
}   //当cd_test冷却结束时，设置我方人物的速度值为12
```

<span id="setdisabled"></span>

> ###### 3.8开发增加 setDisabled

传入参数：`action:String, condition:Object = true`

返回类型：`void`

说明：禁用指定动作；condition 为 true 时持续禁用，为数字时按动画更新倒计时，为 Function 时在返回 false 后解除

使用示例：

```actionscript
parent.$mc_ctrler.getAction().setDisabled("attack", 30); // 3.8开发：禁用 30 个动画帧
```

<span id="isdisabled"></span>

> ###### 3.8开发增加 isDisabled

传入参数：`action:String`

返回类型：`Boolean`

说明：检查指定动作是否仍在禁用表中

使用示例：

```actionscript
var disabled1:Boolean = parent.$mc_ctrler.getAction().isDisabled("attack");
```

<span id="removedisabled"></span>

> ###### 3.8开发增加 removeDisabled

传入参数：`action:String = null`

返回类型：`void`

说明：移除指定动作的禁用记录；传入 null 时清空全部禁用记录

使用示例：

```actionscript
parent.$mc_ctrler.getAction().removeDisabled("attack");
```

<span id="setalldisabled"></span>

> ###### 3.8开发增加 setAllDisabled

传入参数：`condition:Object = true`

返回类型：`void`

说明：为源码列出的移动、防御、攻击、技能等动作统一登记禁用条件；条件规则同 setDisabled

使用示例：

```actionscript
// 临时禁用通常动作，30 次动作状态更新后自动解除
parent.$mc_ctrler.getAction().setAllDisabled(30);
```

# 攻击值对象

<span id="define-action-params"></span>

`FighterCtrler.defineAction`、`AssisiterCtrler.defineAction` 和 `FighterHitModel.addHitVO` 使用同一套攻击配置：obj 中的可配置字段如下，类型、默认值及具体作用见对应属性条目。

<div class="api-config-table">

| 可用版本 | 可配置字段 |
| --- | --- |
| 3.0起 | `power`、`powerRate`、`hitType`、`isBreakDef`、`hitx`、`hity`、`hurtTime`、`hurtType`、`checkDirect` |
| 3.5起 | `powerAdd`、`slowDown`、`focusTarget`；其中 `powerAdd` 在3.5为固定加值，3.6起为百分比 |
| 3.8开发起 | `isCounterDef`、`isHurtBreak`、`hitxDef`、`holdTime`、`onHit` |
| FVO专用 | `doubleHurtType` |

</div>

`id` 和 `owner` 由攻击模型填写；`currentArea`、`isWeak`、`lastDamage` 为运行数据，`limitRate` 只读，均不作为编写器中的攻击配置项。

### 属性

> ###### id

类型：`String`

说明：攻击值对象的标识

> ###### owner

类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：攻击值对象的所有者

> ###### power

类型：`Number`

说明：攻击值对象的攻击力（默认为0）

<span id="poweradd"></span>

> ###### 3.5增加 powerAdd

类型：`Number`

说明：攻击值对象的攻击力增幅（默认为0）

<div class="version-note">

3.5 作为固定攻击力加值；3.6 改为攻击力百分比，3.8开发沿用百分比含义

</div>

> ###### powerRate

类型：`Number`

说明：攻击值对象的伤害倍率（默认为1）

> ###### hitType

类型：`int`

说明：攻击值对象的攻击类型（默认为1，可从1~11中选择）

> ###### isBreakDef

类型：`Boolean`

说明：攻击值对象是否破防（默认为false）

<span id="iscounterdef"></span>

> ###### 3.8开发增加 isCounterDef

类型：`Boolean`

说明：防御耐力消耗加倍标记，默认 false；为 true 时，源码中相应防御分支会将耐力消耗乘以 2

<span id="ishurtbreak"></span>

> ###### 3.8开发增加 isHurtBreak

类型：`Boolean`

说明：被此攻击命中后，是否允许通过灵压爆发／替身术等被动技能脱离（默认为true）；其他耐力、气量和连招限制仍需满足

> ###### hitx

类型：`Number`

说明：攻击值对象的横向受力（默认为0）

<span id="hitxdef"></span>

> ###### 3.8开发增加 hitxDef

类型：`Number`

说明：防御受击时使用的横向受力；0 时继续使用通常受力计算（默认为0）

> ###### hity

类型：`Number`

说明：攻击值对象的纵向受力（默认为0）

> ###### hurtTime

类型：`Number`

说明：攻击值对象的硬直时间（默认为300）

> ###### hurtType

类型：`int`

说明：攻击值对象的受击方式（默认为0；0为击退，1为击倒）

> ###### FVO专用 doubleHurtType

类型：`int`

说明：攻击值对象第二击的受击方式（默认为0；0为击退，1为击倒）

<span id="slowdown"></span>

> ###### 3.5增加 slowDown

类型：`Number`

说明：攻击值对象的慢放时间，单位秒（默认为0）

<span id="holdtime"></span>

> ###### 3.8开发增加 holdTime

类型：`Number`

说明：命中或钢身受击特效使用的冻结时长，单位毫秒；大于 0 时覆盖效果配置中的 freeze，默认 0 表示沿用效果配置

> ###### checkDirect

类型：`Boolean`

说明：攻击值对象是否背击破防（默认为true）

> ###### currentArea

类型：`Rectangle`

说明：命中检测流程写入的场景判定范围矩形

<span id="isweak"></span>

> ###### 3.8开发增加 isWeak

类型：`Boolean`

说明：构造时缓存的轻击类型判定，属于运行字段；后续直接修改攻击类型不会自动刷新该缓存

<span id="lastdamage"></span>

> ###### 3.8开发增加 lastDamage

类型：`Number`

说明：最近结算伤害的运行字段，初始 0，供引擎维护

<span id="limitrate"></span>

> ###### 3.8开发增加 limitRate

类型：`Number`

说明：取得修正等级免伤比例（只读）：未开启标准修正时为 0，等级 0/1/2/3 对应 0/0.3/0.6/1

使用示例：

```actionscript
var limitRate1:Number = parent.$fighter_ctrler.hitModel.getHitVO("kj1").limitRate;
```

<span id="focustarget"></span>

> ###### 3.5增加 focusTarget

类型：`Boolean`

说明：攻击值对象镜头是否聚焦到对方（默认为false）

<span id="onhit"></span>

> ###### 3.8开发增加 onHit

类型：`Function`

说明：命中回调。人物受击流程按函数声明的参数个数调用：0 个参数、(受击人物) 或 (受击人物, HitVO)；飞行道具受击流程传入道具主体

使用示例：

```actionscript
// 3.8开发：在角色初始化时定义
$fighter_ctrler.defineAction("k1", {
    power: 50,
    onHit: function(target:*, hit:*):void {
        // target 为受击人物，hit 为本次攻击值对象
    }
});
```

### 方法

> ###### clone

传入参数：无

返回类型：[`HitVO`](zh-cn/data-model-classes/HitVO)

说明：复制自身

使用示例：

```actionscript
var cloneVO = parent.$fighter_ctrler.hitModel.getHitVO("k1").clone();
```

> ###### isBisha

传入参数：无

返回类型：`Boolean`

说明：判断攻击值对象是否为必杀攻击面

使用示例：

```actionscript
if (parent.$fighter_ctrler.hitModel.getHitVO("bs1").isBisha())
{
	parent.$fighter_ctrler.hitModel.getHitVO("bs1").power = 300;
}
```

<span id="isskill"></span>

> ###### 3.5增加 isSkill

传入参数：无

返回类型：`Boolean`

说明：判断攻击值对象是否为技能攻击面

使用示例：

```actionscript
if (parent.$fighter_ctrler.hitModel.getHitVO("zh1").isSkill())
{
	parent.$fighter_ctrler.hitModel.getHitVO("zh1").power = 100;
}
```

<span id="iscatch"></span>

> ###### 3.3增加 isCatch

传入参数：无

返回类型：`Boolean`

说明：判断攻击值对象是否为投技攻击面

使用示例：

```actionscript
if (parent.$fighter_ctrler.hitModel.getHitVO("sh1").isCatch())
{
	parent.$fighter_ctrler.hitModel.getHitVO("sh1").power = 0;
}
```

> ###### getDamage

传入参数：无

返回类型：`int`

说明：计算攻击值对象的伤害并返回 int，尚未包含受击人物的防御扣减

<div class="version-note">

各版本公式如下：

- 3.0、3.3：`power * powerRate`
- 3.5：`(power + powerAdd) * powerRate`，powerAdd 为固定加值
- 3.6：`(power + power * powerAdd / 100) * powerRate`，powerAdd 改为百分比
- 3.8开发：在 3.6 公式基础上再乘以 `(1 - limitRate)`

</div>

使用示例：

```actionscript
var kj1Damage: int = parent.$fighter_ctrler.hitModel.getHitVO("kj1").getDamage();
```

<span id="isweakhit"></span>

> ###### 3.5增加 isWeakHit

传入参数：无

返回类型：`Boolean`

说明：判断无双模式的轻击效果；除攻击类型条件外，还要求攻击所有者或其主人为非 Boss 的无双敌人

使用示例：

```actionscript
var kj1IsWeakHit: Boolean = parent.$fighter_ctrler.hitModel.getHitVO("kj1").isWeakHit();
```

### 创建攻击值对象时的约束

3.0 及后续参考源码中，`hitType == 1` 且 `hurtTime < 100` 时，构造函数会将硬直时长提高到 100。`clone()` 复制字段，owner 等对象引用仍指向原对象。

# 攻击值对象

### 属性

> ###### id

类型：String

说明：攻击值对象的标识

> ###### owner

类型：IGameSprite

说明：攻击值对象的所有者

> ###### power

类型：Number

说明：攻击值对象的攻击力（默认为0）

> ###### 3.5增加 powerAdd

类型：Number

说明：攻击值对象的攻击力增幅（默认为0）

> ###### powerRate

类型：Number

说明：攻击值对象的攻击力倍数（默认为1）

> ###### hitType

类型：int

说明：攻击值对象的攻击类型（默认为1，可从1~11中选择）

> ###### isBreakDef

类型：Boolean

说明：攻击值对象是否破防（默认为false）

> ###### hitx

类型：Number

说明：攻击值对象的横向受力（默认为0）

> ###### hity

类型：Number

说明：攻击值对象的纵向受力（默认为0）

> ###### hurtTime

类型：Number

说明：攻击值对象的硬直时间（默认为300）

> ###### hurtType

类型：int

说明：攻击值对象是否击倒（默认为0，可在0~1中选择）

> ###### FVO专用 doubleHurtType

类型：int

说明：攻击值对象第二击是否击倒（默认为0，可在0~1中选择）

> ###### 3.5增加 slowDown

类型：Number

说明：攻击值对象的慢放时间（默认为0）

> ###### checkDirect

类型：Boolean

说明：攻击值对象是否背击破防（默认为true）

> ###### currentArea

类型：Rectangle

说明：攻击值对象当前在场景中的判定范围矩形

> ###### 3.5增加 focusTarget

类型：Boolean

说明：攻击值对象镜头是否聚焦到对方（默认为false）

### 方法

> ###### clone

传入参数：无

返回类型：HitVO

说明：复制自身

使用示例：

```actionscript
var cloneVO = parent.$fighter_ctrler.hitModel.getHitVO("k1").clone();
```

> ###### isBisha

传入参数：无

返回类型：Boolean

说明：判断攻击值对象是否为必杀攻击面

使用示例：

```actionscript
if (parent.$fighter_ctrler.hitModel.getHitVO("bs1").isBisha())
{
	parent.$fighter_ctrler.hitModel.getHitVO("bs1").power = 300;
}
```

> ###### 3.5增加 isSkill

传入参数：无

返回类型：Boolean

说明：判断攻击值对象是否为技能攻击面

使用示例：

```actionscript
if (parent.$fighter_ctrler.hitModel.getHitVO("zh1").isSkill())
{
	parent.$fighter_ctrler.hitModel.getHitVO("zh1").power = 100;
}
```

> ###### isCatch

传入参数：无

返回类型：Boolean

说明：判断攻击值对象是否为投技攻击面

使用示例：

```actionscript
if (parent.$fighter_ctrler.hitModel.getHitVO("sh1").isSkill())
{
	parent.$fighter_ctrler.hitModel.getHitVO("sh1").power = 0;
}
```

> ###### getDamage

传入参数：无

返回类型：int

说明：计算攻击值对象造成的伤害（公式为(power + power * (powerAdd / 100)) * powerRate）

使用示例：

```actionscript
var kj1Damage: int = parent.$fighter_ctrler.hitModel.getHitVO("kj1").getDamage();
```

> ###### 3.5增加 isWeakHit

传入参数：无

返回类型：Boolean

说明：判断攻击值对象是否为轻击效果（hitType为1/2/4且hurtType为0）

使用示例：

```actionscript
var kj1IsWeakHit: Boolean = parent.$fighter_ctrler.hitModel.getHitVO("kj1").isWeakHit();
```

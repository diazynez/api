# 人物主体

### 获取实例

```actionscript
//同一对象内只需要写一次，若报错请删除
//主人物使用下方代码：
function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}
```

```actionscript
//辅助人物、攻击对象、飞行道具使用下方代码：
function get $self_main(): * {for each(var i: * in parent.parent.parent.getGameSprites()) if (i.getDisplay() == this) return i;}
```

### 属性

说明：设置或调整人物的默认属性

> ###### qi

类型：Number

说明：人物的气量值（默认为0）

使用示例：

```actionscript
$self_main.qi = 300;       //设置人物当前气量值为300
var qi1: Number = $self_main.qi;     //将当前气量值赋值到变量qi1
```

> ###### qiMax

类型：Number

说明：人物的气量最大值（默认为300）

使用示例：

```actionscript
$self_main.qiMax = 300;       //设置人物当前气量最大值为300
var qiMax1: Number = $self_main.qiMax;     //将当前气量最大值赋值到变量qiMax1
```

> ###### energy

类型：Number

说明：人物的耐力值（默认为100）

使用示例：

```actionscript
$self_main.energy = 50;       //设置人物当前耐力值为50
var energy1: Number = $self_main.energy;     //将当前耐力值赋值到变量energy1
```

> ###### energyMax

类型：Number

说明：人物的耐力最大值（默认为100）

使用示例：

```actionscript
$self_main.energyMax = 150;       //设置人物当前耐力最大值为150
var energyMax1: Number = $self_main.energyMax;     //将当前耐力最大值赋值到变量energyMax1
```

> ###### energyOverLoad

类型：Boolean

说明：人物的耐力过载状态（默认为false）

使用示例：

```actionscript
$self_main.energyOverLoad = true;       //设置人物为耐力过载状态
```

> ###### customHpMax

类型：int

说明：人物的自定义血量最大值（默认为0）

使用示例：

```actionscript
//仅在对战初始化阶段作为$fighter_ctrler.hp的中间变量，无使用示例
```

> ###### fzqi

类型：Number

说明：人物的辅助冷却值（默认为100）

使用示例：

```actionscript
$self_main.fzqi = 100;       //设置人物当前辅助冷却值为100
var fzqi1: Number = $self_main.fzqi;     //将当前辅助冷却值赋值到变量fzqi1
```

> ###### fzqiMax

类型：Number

说明：人物的辅助冷却最大值（默认为100）（只读）

使用示例：

```actionscript
var fzqiMax1: Number = $self_main.fzqiMax;     //将当前辅助冷却最大值赋值到变量fzqiMax1
```

> ###### speed

类型：Number

说明：人物的速度值（默认为6）

使用示例：

```actionscript
$self_main.speed = 12;       //设置人物当前速度值为12
var speed1: Number = $self_main.speed;     //将当前速度值赋值到变量speed1
```

> ###### jumpPower

类型：Number

说明：人物的跳跃能力值（默认为15）

使用示例：

```actionscript
$self_main.jumpPower = 12;       //设置人物当前跳跃能力值为12
var jumpPower1: Number = $self_main.jumpPower;     //将当前跳跃能力值赋值到变量jumpPower1
```

> ###### isSteelBody

类型：Boolean

说明：人物的钢身（白）状态（默认为false）

使用示例：

```actionscript
$self_main.isSteelBody = true;       //设置人物为钢身（白）状态
```

> ###### isSuperSteelBody

类型：Boolean

说明：人物的钢身（金）状态（默认为false）

使用示例：

```actionscript
$self_main.isSuperSteelBody = true;       //设置人物为钢身（金）状态
```

> ###### data

类型：FighterVO

说明：人物的角色数据

使用示例：

```actionscript
var id: String = $self_main.data.id;       //将当前角色的ID赋值到变量id
var name: String = $self_main.data.name;       //将当前角色的名称赋值到变量name
var comicType: int = $self_main.data.comicType;       //将当前角色的所属阵营赋值到变量comicType
/*
FighterVO中的属性包含：id (String)、name (String)、comicType (int)、fileUrl (String)、
					  startFrame (int)、faceUrl (String)、faceBigUrl (String)、
					  faceBarUrl (String)、faceWinUrl (String)、
					  contactFriends (Array)、contactEnemys (Array)、
					  says (Array)、bgm (String)、bgmRate (Number)、isAlive (Boolean)
		    方法包含：initByXML、getRandSay、clone
*/
```

> ###### 3.5增加 mosouPlayerData

类型：MosouFighterVO

说明：人物的无双角色数据

> ###### 3.5增加 mosouEnemyData

类型：MosouEnemyVO

说明：人物的无双敌军数据

> ###### airHitTimes

类型：int

说明：人物的空中可攻击次数（默认为1）

使用示例：

```actionscript
$self_main.airHitTimes = 0;       //设置人物当前空中可攻击次数为0
```

> ###### jumpTimes

类型：int

说明：人物的可跳跃次数（默认为2）

使用示例：

```actionscript
$self_main.jumpTimes = 0;       //设置人物当前可跳跃次数为0
```

> ###### actionState

类型：int

说明：人物的状态号（默认为0）

0=正常，40=硬直，10=正在攻击，11=正在使用技能，12=正在使用必杀，13=正在使用超必杀，14=正在跳跃，15=正在瞬步，16=正在反制，20=正在防御，21=被打，22=击飞，23=击倒，24=击倒弹起，30=死亡，50=正在卍解，60=开场，61=胜利，62=失败

使用示例：

```actionscript
if ($self_main.actionState == 21)
{
    $self_main.speed = 12;
}   //当我方的状态是被打时，设置我方人物的速度值为12
```

> ###### defenseType

类型：int

说明：人物的防御类型值（0=剑，1=手，默认为0）

使用示例：

```actionscript
$self_main.defenseType = 1;        //设置人物当前防御类型值为1
var defenseType1: int = $self_main.defenseType;        //将当前防御类型值赋值到变量defenseType1
```

> ###### lastHitVO

类型：HitVO

说明：人物最后一次受击的攻击值对象

使用示例：

- [详细介绍](zh-cn/data-model-classes/HitVO)

```actionscript
var lastHitVO = $self_main.lastHitVO;        //将最后一次受击的攻击值对象赋值到变量lastHitVO
```

> ###### 3.5增加 introSaid

类型：Boolean

说明：人物是否执行过开场动作（默认为false）

使用示例：

```actionscript
$self_main.introSaid = true;        //设置人物执行过开场动作
```

> ###### 3.5增加 mosouLogic

类型：MosouFighterLogic

说明：无双角色逻辑

> ###### hurtHit

类型：HitVO

说明：人物当前受击的攻击值对象

使用示例：

- [详细介绍](zh-cn/data-model-classes/HitVO)

```actionscript
var hurtHit = $self_main.hurtHit;        //将当前受击的攻击值对象赋值到变量hurtHit
```

> ###### defenseHit

类型：HitVO

说明：人物当前防御受击（假命中）的攻击值对象

使用示例：

- [详细介绍](zh-cn/data-model-classes/HitVO)

```actionscript
var defenseHit = $self_main.defenseHit;        //将当前防御受击（假命中）的攻击值对象赋值到变量defenseHit
```

> ###### targetTeams

类型：Vector.\<TeamVO\>

说明：包含对方小队成员的动态数组

使用示例：

```actionscript
var targetTeams = $self_main.targetTeams;        //将对方小队成员的动态数组赋值到变量targetTeams
```

> ###### colorTransform

类型：ColorTransform

说明：人物的颜色调整或颜色转换对象

使用示例：

```actionscript
$self_main.colorTransform.greenOffset = -85;        //将人物调为2P配色
var colorTransform = $self_main.colorTransform;        //将颜色对象赋值到变量colorTransform
```

> ###### attackRate

类型：Number

说明：人物的攻击力倍率

使用示例：

```actionscript
$self_main.attackRate = 1.5;        //设置人物当前攻击力倍率为1.5
var attackRate1: Number = $self_main.attackRate;        //将当前攻击力倍率赋值到变量attackRate1
```

### 方法

> ###### changeColor

传入参数：v:ColorTransform

返回类型：void

说明：修改人物的颜色

使用示例：

```actionscript
$self_main.changeColor(new ColorTransform(1, 1, 1, 1, -255, -255, -255, 0));        //将自身调为纯黑色
```

> ###### resumeColor

传入参数：无

返回类型：void

说明：复原人物的颜色

使用示例：

```actionscript
$self_main.resumeColor();
```

> ###### 3.5增加 getMosouLogic

传入参数：无

返回类型：MosouFighterLogic

说明：获取无双角色逻辑

> ###### setActive

传入参数：v:Boolean

返回类型：void

说明：设置自身的活动状态，若设置为非活动状态，则会结束幽步特效、结束钢身发光、结束残影特效

使用示例：

```actionscript
$self_main.setActive(false);
```

> ##### currentHurtDamage

传入参数：无

返回类型：int

说明：获取本次被打过程受到的总伤害（计算规则是连招本身1倍的伤害（无视attackRate的数值） * 【当前的】attackRate，因此不完全等同于真实连招伤害）

使用示例：

```actionscript
var currentHurtDamage: int = $self_main.currentHurtDamage();        //将当前受到的总伤害赋值到变量currentHurtDamage
```

> ##### getLastHurtHitVO

传入参数：无

返回类型：HitVO

说明：获取最后一次受击的攻击值对象

使用示例：

- [详细介绍](zh-cn/data-model-classes/HitVO)

```actionscript
var lastHurtHitVO = $self_main.getLastHurtHitVO();        //将当前最后一次受击的攻击值对象赋值到变量lastHurtHitVO
```


未完待续
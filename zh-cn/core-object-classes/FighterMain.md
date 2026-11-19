# 人物主体

> 此类继承自[基元游戏对象](zh-cn/abstract-interface-classes/BaseGameSprite)，可使用此类的所有属性和方法
>
> 此类实现[游戏对象接口](zh-cn/abstract-interface-classes/IGameSprite)，符合该数据模型

### 获取实例

```actionscript
//同一对象内只需要写一次，若报错请删除
```

```actionscript
//主人物使用下方代码：
function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}
```

### 属性

说明：设置或调整人物的默认属性

> ###### qi

类型：`Number`

说明：人物的气量值（默认为0）

<div class="version-note">

3.8开发改动：初始气量改为读取 GameData.I.config.originalQi

</div>

使用示例：

```actionscript
$self_main.qi = 300;       //设置人物当前气量值为300
var qi1: Number = $self_main.qi;     //将当前气量值赋值到变量qi1
```

> ###### qiMax

类型：`Number`

说明：人物的最大气量（默认为300）（只读）

使用示例：

```actionscript
$self_main.qiMax = 300;       //设置人物当前最大气量为300
var qiMax1: Number = $self_main.qiMax;     //将当前最大气量赋值到变量qiMax1
```

> ###### energy

类型：`Number`

说明：人物的耐力值（默认为100）

使用示例：

```actionscript
$self_main.energy = 50;       //设置人物当前耐力值为50
var energy1: Number = $self_main.energy;     //将当前耐力值赋值到变量energy1
```

> ###### energyMax

类型：`Number`

说明：人物的最大耐力（默认为100）

使用示例：

```actionscript
$self_main.energyMax = 150;       //设置人物当前最大耐力为150
var energyMax1: Number = $self_main.energyMax;     //将当前最大耐力赋值到变量energyMax1
```

> ###### energyOverLoad

类型：`Boolean`

说明：人物的耐力过载状态（默认为false）

使用示例：

```actionscript
$self_main.energyOverLoad = true;       //设置人物为耐力过载状态
```

<span id="tempperenergy"></span>

> ###### 3.8开发增加 tempPerEnergy

类型：`Number`

说明：临时限制耐力的自动恢复速度，可用于虚弱等状态；默认 0 表示沿用通常恢复速度，耐力回满后自动清零

使用示例：

```actionscript
$self_main.tempPerEnergy = 0.05; // 降低耐力自动恢复速度，持续到耐力回满
```

> ###### customHpMax

类型：`int`

说明：人物的自定义最大血量（默认为0）

使用示例：

```actionscript
//仅在对战初始化阶段作为$fighter_ctrler.hp的中间变量，无使用示例
```

> ###### fzqi

类型：`Number`

说明：人物的辅助能量（默认为100）

<div class="version-note">

3.8开发改动：初始辅助能量改为按 originalAssist 配置设置：启用时为 100，否则为 0

</div>

使用示例：

```actionscript
$self_main.fzqi = 100;       //设置人物当前辅助能量为100
var fzqi1: Number = $self_main.fzqi;     //将当前辅助能量赋值到变量fzqi1
```

> ###### fzqiMax

类型：`Number`

说明：人物的最大辅助能量（默认为100）（只读）

使用示例：

```actionscript
var fzqiMax1: Number = $self_main.fzqiMax;
```

> ###### speed

类型：`Number`

说明：人物的速度值（默认为6）

使用示例：

```actionscript
$self_main.speed = 12;       //设置人物当前速度值为12
var speed1: Number = $self_main.speed;     //将当前速度值赋值到变量speed1
```

<span id="speedadd"></span>

> ###### 3.8开发增加 speedAdd

类型：`Number`

说明：额外移动速度，默认 0

使用示例：

```actionscript
$self_main.speedAdd = 2; // 将额外移动速度设为 2
```

> ###### jumpPower

类型：`Number`

说明：人物的跳跃能力值（默认为15）

使用示例：

```actionscript
$self_main.jumpPower = 12;       //设置人物当前跳跃能力值为12
var jumpPower1: Number = $self_main.jumpPower;     //将当前跳跃能力值赋值到变量jumpPower1
```

<span id="issteelbody"></span>

> ###### 3.3增加 isSteelBody

类型：`Boolean`

说明：人物的钢身（白）状态（默认为false）

使用示例：

```actionscript
$self_main.isSteelBody = true;
```

<span id="issupersteelbody"></span>

> ###### 3.3增加 isSuperSteelBody

类型：`Boolean`

说明：人物的钢身（金）状态（默认为false）

使用示例：

```actionscript
$self_main.isSuperSteelBody = true;
```

<span id="allowsteelcatch"></span>

> ###### 3.8开发增加 allowSteelCatch

类型：`Boolean`

说明：是否允许投技触发钢身受击分支，默认 true

使用示例：

```actionscript
$self_main.allowSteelCatch = false; // 投技不再触发钢身受击分支
```

<span id="allowdefdirect"></span>

> ###### 3.8开发增加 allowDefDirect

类型：`Boolean`

说明：是否使用防御朝向检查，默认 true

使用示例：

```actionscript
$self_main.allowDefDirect = false; // 防御判定不再检查朝向
```

<span id="allowaddqi"></span>

> ###### 3.8开发增加 allowAddQi

类型：`Boolean`

说明：是否允许通常的气量增加逻辑，默认 true

使用示例：

```actionscript
$self_main.allowAddQi = false; // 关闭通常的气量增加
```

> ###### data

类型：`FighterVO`

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

<span id="mosouplayerdata"></span>

> ###### 3.5增加 mosouPlayerData

类型：`MosouFighterVO`

说明：人物的无双角色数据

<span id="mosouenemydata"></span>

> ###### 3.5增加 mosouEnemyData

类型：`MosouEnemyVO`

说明：人物的无双敌人数据

> ###### airHitTimes

类型：`int`

说明：人物的空中可攻击次数（默认为1）

使用示例：

```actionscript
$self_main.airHitTimes = 0;
```

> ###### jumpTimes

类型：`int`

说明：人物的可跳跃次数（默认为2）

使用示例：

```actionscript
$self_main.jumpTimes = 0;
```

> ###### actionState

类型：`int`

说明：人物的状态号（默认为0）

0=正常，40=硬直，10=正在攻击，11=正在使用技能，12=正在使用必杀，13=正在使用超必杀，14=正在跳跃，15=正在瞬步，16=当身，20=正在防御，21=被打，22=击飞，23=击倒，24=击倒弹起，30=死亡，50=正在卍解，60=开场，61=胜利，62=失败

使用示例：

```actionscript
if ($self_main.actionState == 21)
{
    $self_main.speed = 12;
}   //当我方的状态是被打时，设置我方人物的速度值为12
```

> ###### defenseType

类型：`int`

说明：人物的防御类型值（0=剑，1=手，默认为0）

使用示例：

```actionscript
$self_main.defenseType = 1;        //设置人物当前防御类型值为1
var defenseType1: int = $self_main.defenseType;        //将当前防御类型值赋值到变量defenseType1
```

> ###### lastHitVO

类型：[`HitVO`](zh-cn/data-model-classes/HitVO)

说明：人物最后一次受击的攻击值对象

使用示例：

```actionscript
var lastHitVO = $self_main.lastHitVO;
```

<span id="introsaid"></span>

> ###### 3.5增加 introSaid

类型：`Boolean`

说明：人物是否执行过开场动作（默认为false）

使用示例：

```actionscript
$self_main.introSaid = true;
```

<span id="introprior"></span>

> ###### 3.8开发增加 introPrior

类型：`Boolean`

说明：是否优先播放自身的开场演出，默认 false；双方均为 true 时同时播放

使用示例：

```actionscript
$self_main.introPrior = true; // 在人物初始化阶段设置，使自身优先播放开场演出
```

<span id="loseprior"></span>

> ###### 3.8开发增加 losePrior

类型：`Boolean`

说明：战败时是否优先播放自身的失败演出，默认 false

使用示例：

```actionscript
$self_main.losePrior = true; // 战败时优先播放自身失败演出
```

<span id="mosoulogic"></span>

> ###### 3.5增加 mosouLogic

类型：`MosouFighterLogic`

说明：无双角色逻辑

> ###### hurtHit

类型：[`HitVO`](zh-cn/data-model-classes/HitVO)

说明：人物当前受击的攻击值对象

使用示例：

```actionscript
var hurtHit = $self_main.hurtHit;
```

> ###### defenseHit

类型：[`HitVO`](zh-cn/data-model-classes/HitVO)

说明：人物当前防御受击（假命中）的攻击值对象

使用示例：

```actionscript
var defenseHit = $self_main.defenseHit;
```

> ###### targetTeams

类型：`Vector.<TeamVO>`

说明：包含对方小队成员的动态数组

使用示例：

```actionscript
var targetTeams = $self_main.targetTeams;
```

<span id="limitlevel"></span>

> ###### 3.8开发增加 limitLevel

类型：`int`

说明：读取或设置自身所在小队的修正等级

使用示例：

```actionscript
$self_main.limitLevel = 1; // 将自身小队的修正等级设为 1
```

<span id="isaictrl"></span>

> ###### 3.8开发增加 isAICtrl

类型：`Boolean`

说明：当前动作控制器是否为 FighterAICtrl（只读）

使用示例：

```actionscript
var isAICtrl1:Boolean = $self_main.isAICtrl;
```

<span id="colortransform"></span>

> ###### 3.3增加 colorTransform

类型：`ColorTransform`

说明：人物的颜色调整或颜色转换对象

使用示例：

```actionscript
$self_main.colorTransform.greenOffset = -85;        //将人物调为2P配色
var colorTransform = $self_main.colorTransform;        //将颜色对象赋值到变量colorTransform
```

> ###### attackRate

类型：`Number`

说明：人物的攻击力倍率

使用示例：

```actionscript
$self_main.attackRate = 1.5;        //设置人物当前攻击力倍率为1.5
var attackRate1: Number = $self_main.attackRate;        //将当前攻击力倍率赋值到变量attackRate1
```

### 方法

<span id="changecolor"></span>

> ###### 3.3增加 changeColor

传入参数：`v:ColorTransform`

返回类型：`void`

说明：修改人物的颜色

使用示例：

```actionscript
$self_main.changeColor(new ColorTransform(1, 1, 1, 1, -255, -255, -255, 0));        //将自身调为纯黑色
```

<span id="resumecolor"></span>

> ###### 3.3增加 resumeColor

传入参数：无

返回类型：`void`

说明：复原人物的颜色

使用示例：

```actionscript
$self_main.resumeColor();
```

<span id="getmosoulogic"></span>

> ###### 3.5增加 getMosouLogic

传入参数：无

返回类型：`MosouFighterLogic`

说明：获取无双角色逻辑

使用示例：

```actionscript
var mosouLogic1 = $self_main.getMosouLogic();
```

> ###### currentHurtDamage

传入参数：无

返回类型：`int`

说明：获取本次受击累计的伤害值

<div class="version-note">

3.0 合计当前受击列表中各攻击值对象的 getDamage()，无列表时返回 0；3.8开发改为合计各攻击值对象记录的 lastDamage，即实际扣血记录

</div>

使用示例：

```actionscript
var currentHurtDamage1: int = $self_main.currentHurtDamage();
```

> ###### getLastHurtHitVO

传入参数：无

返回类型：[`HitVO`](zh-cn/data-model-classes/HitVO)

说明：取得当前受击列表最后一个攻击值对象，无列表时返回 null

使用示例：

```actionscript
var lastHurtHitVO1 = $self_main.getLastHurtHitVO();
```

> ###### hurtBreakHit

传入参数：无

返回类型：`Boolean`

说明：检查当前受击列表中是否存在 isBreakDef 为 true 的攻击

使用示例：

```actionscript
var hasBreakHit1: Boolean = $self_main.hurtBreakHit();
```

<span id="hurtbreakdefhit"></span>

> ###### 3.8开发增加 hurtBreakDefHit

传入参数：无

返回类型：`Boolean`

说明：检查当前受击列表中是否有 id 为 breakdef 的攻击

使用示例：

```actionscript
var isBreakDefHit1:Boolean = $self_main.hurtBreakDefHit();
```

<span id="hurtcatchhit"></span>

> ###### 3.8开发增加 hurtCatchHit

传入参数：无

返回类型：`Boolean`

说明：检查当前受击列表中是否有 hitType 为 11 且 isBreakDef 为 true 的投技

使用示例：

```actionscript
var isCatchHit1:Boolean = $self_main.hurtCatchHit();
```

<span id="hurtbishahit"></span>

> ###### 3.8开发增加 hurtBishaHit

传入参数：无

返回类型：`Boolean`

说明：检查当前受击列表中是否有 isBisha() 为 true 的攻击

使用示例：

```actionscript
var isBishaHit1:Boolean = $self_main.hurtBishaHit();
```

> ###### clearHurtHits

传入参数：无

返回类型：`void`

说明：清空当前受击列表

使用示例：

```actionscript
$self_main.clearHurtHits();
```

<span id="clearbehurthits"></span>

> ###### 3.8开发增加 clearBeHurtHits

传入参数：无

返回类型：`void`

说明：清空 hurtHit 和 defenseHit

> ###### setActive

传入参数：`v:Boolean`

返回类型：`void`

说明：设置自身的活动状态，若设置为非活动状态，则会结束幽步特效、结束钢身发光、结束残影特效

使用示例：

```actionscript
$self_main.setActive(false);
```

> ##### currentHurtDamage

传入参数：无

返回类型：`int`

说明：获取本次被打过程受到的总伤害（计算规则是连招本身1倍的伤害（无视attackRate的数值） * 【当前的】attackRate，因此不完全等同于真实连招伤害）

使用示例：

```actionscript
var currentHurtDamage: int = $self_main.currentHurtDamage();
```

> ##### getLastHurtHitVO

传入参数：无

返回类型：[`HitVO`](zh-cn/data-model-classes/HitVO)

说明：获取最后一次受击的攻击值对象

使用示例：

```actionscript
var lastHurtHitVO = $self_main.getLastHurtHitVO();
```

> ##### hurtBreakHit

传入参数：无

返回类型：`Boolean`

说明：检测本次被打过程是否存在破防攻击

使用示例：

```actionscript
if ($self_main.hurtBreakHit())
{
	$self_main.speed = 12;
}   //当本次被打过程存在破防攻击时，设置我方人物的速度值为12
```

> ##### clearHurtHits

传入参数：无

返回类型：`void`

说明：清空当前的被打记录

使用示例：

```actionscript
$self_main.clearHurtHits();
```

> ###### getCtrler

传入参数：无

返回类型：[`FighterCtrler`](zh-cn/main-fighter-ctrlers/FighterCtrler)

说明：获取Fighter控制器

使用示例：

```actionscript
var fighterCtrl = $self_main.getCtrler();
```

<span id="getbuffctrl"></span>

> ###### 3.3增加 getBuffCtrl

传入参数：无

返回类型：[`FighterBuffCtrler`](zh-cn/main-fighter-ctrlers/FighterBuffCtrler)

说明：获取Buff控制器

使用示例：

```actionscript
var buffCtrl = $self_main.getBuffCtrl();
```

> ###### getCurrentTarget

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：获取对方的游戏对象（可用于控制对方）

使用示例：

```actionscript
var tSP = $self_main.getCurrentTarget();
```

> ###### getTargets

传入参数：无

返回类型：[`Vector.<IGameSprite>`](zh-cn/abstract-interface-classes/IGameSprite)

说明：获取对方小队的所有存活的游戏对象

使用示例：

```actionscript
var targets = $self_main.getTargets();
```

> ###### getMC

传入参数：无

返回类型：[`FighterMC`](zh-cn/core-object-classes/FighterMC)

说明：获取人物MC

使用示例：

```actionscript
var fighterMC = $self_main.getMC();
```

<span id="initmosoufighter"></span>

> ###### 3.5增加 initMosouFighter

传入参数：`v:MosouFighterVO`

返回类型：`void`

说明：初始化无双角色

<span id="initmosouenemy"></span>

> ###### 3.5增加 initMosouEnemy

传入参数：`v:MosouEnemyVO`

返回类型：`void`

说明：初始化无双敌人

<span id="updateproperties"></span>

> ###### 3.5增加 updateProperties

传入参数：无

返回类型：`void`

说明：初始化/更新角色属性

> ###### setActionCtrl

传入参数：`ctrler:IFighterActionCtrl`

返回类型：`void`

说明：设置Action控制器

使用示例：

```actionscript
//此接口无法单独使用，使用方法详见其他成品代码
```

<span id="getactionctrl"></span>

> ###### 3.8开发增加 getActionCtrl

传入参数：无

返回类型：`IFighterActionCtrl`

说明：取得当前输入或 AI 动作控制器

使用示例：

```actionscript
var actionCtrl1 = $self_main.getActionCtrl();
```

<span id="initlized"></span>

> ###### 3.5增加 initlized

传入参数：无

返回类型：`Boolean`

说明：检测Fighter控制器是否已被定义

使用示例：

```actionscript
if ($self_main.initlized())
{
	$self_main.speed = 12;
}   //当Fighter控制器已被定义时，设置我方人物的速度值为12
```

> ###### initlize

传入参数：无

返回类型：`void`

说明：初始化角色

使用示例：

```actionscript
//此接口无法单独使用，使用方法详见其他成品代码
```

<span id="onmcinited"></span>

> ###### 3.5增加 onMcInited

传入参数：无

返回类型：`void`

说明：初始化无双角色MC

使用示例：

```actionscript
//此接口无法单独使用，使用方法详见其他成品代码
```

<span id="initattackadddmg"></span>

> ###### 3.5增加 initAttackAddDmg

传入参数：`normal:int, skill:int = 0, bisha:int = 0`

返回类型：`void`

说明：初始化普通攻击、技能和必杀的增伤数值，分别写入各攻击值对象的 powerAdd

<div class="version-note">

3.5 的值表示固定攻击力加值；3.6 及 3.8开发改为百分比，与 HitVO.getDamage() 的版本变化一致

</div>

使用示例：

```actionscript
$self_main.initAttackAddDmg(100, 100, 100);
```

> ###### renderAnimate

传入参数：无

返回类型：`void`

说明：渲染一次人物动画

使用示例：

```actionscript
$self_main.renderAnimate();
```

> ###### render

传入参数：无

返回类型：`void`

说明：渲染一次人物属性和控制器

使用示例：

```actionscript
$self_main.render();
```

> ###### jump

传入参数：无

返回类型：`void`

说明：进行一次跳跃运动

使用示例：

```actionscript
$self_main.jump();
```

> ###### getCurrentHits

传入参数：无

返回类型：`Array`

说明：获取人物当前攻击面的攻击值对象数组，通常由 [Fighter控制器的getCurrentHits方法](zh-cn/main-fighter-ctrlers/FighterCtrler?id=getcurrenthits) 取得

<div class="version-note">

3.0～3.6：灵压爆发有效期间，仅返回灵压爆发的攻击值对象

3.8开发改动：灵压爆发有效期间，将其攻击值对象放在数组首位，同时保留人物原有的攻击面

</div>

使用示例：

```actionscript
var cHitsArr: Array = $self_main.getCurrentHits();
```

> ###### getBodyArea

传入参数：无

返回类型：`Rectangle`

说明：调用[Fighter控制器的getBodyArea方法](zh-cn/main-fighter-ctrlers/FighterCtrler?id=getbodyarea)

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getBodyArea();
```

> ###### hit

传入参数：`hitvo:HitVO, target:IGameSprite`

返回类型：`void`

说明：产生攻击效果（参数1：指定攻击值对象，参数2：指定的目标游戏对象）

包含效果：双方层级交换、自身集气、HITS的UI刷新、计分板得分增加

使用示例：

```actionscript
$self_main.hit($self_main.getCtrler().hitModel.getHitVO("k1"), $self_main.getCurrentTarget());
```

> ###### beHit

传入参数：`hitvo:HitVO, hitRect:Rectangle = null`

返回类型：`void`

说明：产生被打效果（参数1：指定攻击值对象，参数2：攻击命中部分的范围矩形）

包含效果：被打效果、产生于攻击面对应的推移、自身集气

使用示例：

```actionscript
$self_main.getCurrentTarget().beHit($self_main.getCtrler().hitModel.getHitVO("k1"), $self_main.getCurrentTarget().getBodyArea());
```

> ###### hasEnergy

传入参数：`v:Number, allowOverflow:Boolean = false`

返回类型：`Boolean`

说明：判断是否具有指定耐力值（参数1：指定耐力数值，参数2：是否允许耐力溢出，允许时只要未处于耐力过载状态均返回true）

使用示例：

```actionscript
var has50Energy: Boolean = $self_main.hasEnergy(50);
```

<span id="addenergy"></span>

> ###### 3.8开发增加 addEnergy

传入参数：`delta:Number`

返回类型：`void`

说明：增加人物耐力，最多恢复至最大耐力

使用示例：

```actionscript
$self_main.addEnergy(10); // 为自身恢复 10 点耐力
```

> ###### useEnergy

传入参数：`v:Number`

返回类型：`void`

说明：消耗耐力值，并使得此后的24帧内不会进行自然的耐力恢复，若此次耐力消耗后耐力不足，则会进入耐力过载状态

使用示例：

```actionscript
$self_main.useEnergy(50);
```

> ###### useQi

传入参数：`v:Number`

返回类型：`Boolean`

说明：消耗气量值，若气量值不足则不会发生消耗并返回false，若足够则会发生消耗并返回true

使用示例：

```actionscript
$self_main.useQi(100);        //如果拥有≥100气量值，则消耗100气量值
if ($self_main.useQi(100)) $self_main.hp += 500;        //如果拥有≥100气量值，则消耗100气量值并增加500血量值
```

> ###### addQi

传入参数：`v:Number`

返回类型：`void`

说明：增加气量值

使用示例：

```actionscript
$self_main.addQi(100);
```

> ###### sayIntro

传入参数：无

返回类型：`void`

说明：将[introSaid属性](zh-cn/core-object-classes/FighterMain?id=_35增加-introsaid)设置为true并调用[Mc控制器的sayIntro方法](zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=sayintro)

使用示例：

```actionscript
$self_main.sayIntro();
```

> ###### win

传入参数：无

返回类型：`void`

说明：调用[Mc控制器的doWin方法](zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=dowin)

使用示例：

```actionscript
$self_main.win();
```

> ###### idle

传入参数：无

返回类型：`void`

说明：调用[Mc控制器的idle方法](zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=idle)

使用示例：

```actionscript
$self_main.idle();
```

> ###### lose

传入参数：无

返回类型：`void`

说明：调用[Mc控制器的doLose方法](zh-cn/main-fighter-ctrlers/FighterMcCtrler?id=dolose)

使用示例：

```actionscript
$self_main.lose();
```

> ###### getHitRange

传入参数：`id:String`

返回类型：`Rectangle`

说明：调用[Fighter控制器的getHitRange方法](zh-cn/main-fighter-ctrlers/FighterCtrler?id=gethitrange)

使用示例：

```actionscript
var aiArea: Rectangle = $self_main.getHitRange("kanmian");
```

> ###### energyExplode

传入参数：无

返回类型：`void`

说明：产生一次灵压爆发

使用示例：

```actionscript
$self_main.energyExplode();
```

> ###### replaceSkill

传入参数：无

返回类型：`void`

说明：产生一次替身术

使用示例：

```actionscript
$self_main.replaceSkill();
```

> ###### getArea

传入参数：无

返回类型：`Rectangle`

说明：调用[getBodyArea方法](zh-cn/core-object-classes/FighterMain?id=getbodyarea)

使用示例：

```actionscript
var bodyArea: Rectangle = $self_main.getArea();
```

<span id="haswankai"></span>

> ###### 3.3增加 hasWankai

传入参数：无

返回类型：`Boolean`

说明：检测自身是否具有变身能力（仅限于JK变身，不包含SJK、WJK)

使用示例：

```actionscript
var hasWankai: Boolean = $self_main.hasWankai();
```

<span id="die"></span>

> ###### 3.3增加 die

传入参数：无

返回类型：`void`

说明：使自身进入死亡状态（不会造成胜负判定）

包含内容：血量值归零、[isAlive属性](zh-cn/abstract-interface-classes/BaseGameSprite?id=isalive)设置为false、播放倒地动作

使用示例：

```actionscript
$self_main.die();
```

<span id="relive"></span>

> ###### 3.3增加 relive

传入参数：`reset:Boolean = false`<br>
传入参数（3.5）：`param1:Boolean = false`

返回类型：`void`

说明：使自身复活（不会造成胜负判定）

包含内容：血量值回满、气量值归零（仅限参数为true时有效）、[isAlive属性](zh-cn/abstract-interface-classes/BaseGameSprite?id=isalive)设置为true、恢复站立

<div class="version-note">

3.5改动：增加 reset 参数，用于控制复活时是否重置人物

</div>

使用示例：

```actionscript
$self_main.relive();
```

<span id="targetdoghoststep"></span>

> ###### 3.8开发增加 targetDoGhostStep

传入参数：无

返回类型：`void`

说明：用于在对方幽步结束后解除自身残留的防御受击硬直，避免人物继续卡在防御受击状态。仅在自身处于防御受击状态时生效，同时停止水平移动、给予短暂不可受击时间并重新允许瞬步。引擎会在对方幽步结束时自动调用

<span id="getdoingaction"></span>

> ###### 3.8开发增加 getDoingAction

传入参数：无

返回类型：`Object`

说明：取得动作标识和动作次数组成的对象，用于关联攻击来源；尚未准备好时可能返回 null

使用示例：

```actionscript
var doingAction1 = $self_main.getDoingAction();
```

<span id="ismosouenemy"></span>

> ###### 3.5增加 isMosouEnemy

传入参数：无

返回类型：`Boolean`

说明：判断是否是无双敌人

使用示例：

```actionscript
var isMosouEnemy1:Boolean = $self_main.isMosouEnemy();
```

<span id="ismosouboss"></span>

> ###### 3.5增加 isMosouBoss

传入参数：无

返回类型：`Boolean`

说明：判断是否是无双头目

使用示例：

```actionscript
var isMosouBoss1:Boolean = $self_main.isMosouBoss();
```

<span id="stopeffects"></span>

> ###### 3.8开发增加 stopEffects

传入参数：无

返回类型：`void`

说明：停止抖动、残影、发光、钢身等效果，清理相关计数并刷新部分减益状态

使用示例：

```actionscript
$self_main.stopEffects(); // 在需要结束当前人物效果的帧中执行
```

# Fighter控制器

### 属性

说明：设置或调整人物的默认属性

> ###### hp

类型：`Number`

说明：读取人物当前血量（默认为1000）；赋值会同时设置当前血量和最大血量。恢复当前血量使用 addHp

使用示例：

```actionscript
$fighter_ctrler.hp = 800;       //设置人物的血量值为800
var hp1: Number = parent.$fighter_ctrler.hp;     //将当前血量值赋值到变量hp1
```

> ###### energy

类型：`Number`

说明：读取人物最大耐力（默认为100）；赋值会同时设置当前耐力和最大耐力。

<div class="version-note">

读取当前耐力时，后续版本可使用 getEnergy

</div>

使用示例：

```actionscript
$fighter_ctrler.energy = 150;       //设置人物的最大耐力值为150
var energy1: Number = parent.$fighter_ctrler.energy;     //将当前最大耐力值赋值到变量energy1
```

> ###### speed

类型：`Number`

说明：人物的速度值（默认为6）

使用示例：

```actionscript
$fighter_ctrler.speed = 12;     //设置人物的速度值为12
var speed1: Number = parent.$fighter_ctrler.speed;       //将当前速度值赋值到变量speed
```

<span id="speedadd"></span>

> ###### 3.8开发增加 speedAdd

类型：`Number`

说明：读取或设置人物的额外移动速度（默认为0）

使用示例：

```actionscript
parent.$fighter_ctrler.speedAdd = 2;
```

> ###### jumpPower

类型：`Number`

说明：人物的跳跃能力值（默认为15）

使用示例：

```actionscript
$fighter_ctrler.jumpPower = 12;     //设置人物的跳跃能力值为12
var jumpPower1: Number = parent.$fighter_ctrler.jumpPower;      //将当前跳跃能力值赋值到变量jumpPower1
```

> ###### heavy

类型：`Number`

说明：人物的体格值（默认为2）

使用示例：

```actionscript
$fighter_ctrler.heavy = 3;      //设置人物的体格值为3
var heavy1: Number = parent.$fighter_ctrler.heavy;       //将当前体格值赋值到变量heavy1
```

> ###### defenseType

类型：`int`

说明：人物的防御类型值（0=剑，1=手，默认为0）

使用示例：

```actionscript
$fighter_ctrler.defenseType = 1;        //设置人物的防御类型值为1
var defenseType1: int = parent.$fighter_ctrler.defenseType;        //将当前防御类型值赋值到变量defenseType1
```

> ###### self

类型：`DisplayObject`

说明：自身的显示对象（只读）

使用示例：

```actionscript
parent.$fighter_ctrler.self.visible = true/false;       //将自身设置为显示/消失
parent.$fighter_ctrler.self.$mc_ctrler.setHurtAction("招21");  // 使自身进入当身状态
```

> ###### target

类型：`DisplayObject`

说明：对方的显示对象（只读）

使用示例：

```actionscript
parent.$fighter_ctrler.target.visible = true/false;     //将对方设置为显示/消失
parent.$fighter_ctrler.target.$mc_ctrler.setHurtAction("招21");  // 使对方进入当身状态
```

> ###### hitModel

类型：[`FighterHitModel`](zh-cn/data-model-classes/FighterHitModel)

说明：人物的攻击模型

使用示例：

```actionscript
// 调整已定义攻击 k1 的攻击力与硬直时间
parent.$fighter_ctrler.hitModel.getHitVO("k1").power = 50;
parent.$fighter_ctrler.hitModel.getHitVO("k1").hurtTime = 400;
```

### 方法

> ###### getTargetSP

传入参数：无

返回类型：[`IGameSprite`](zh-cn/abstract-interface-classes/IGameSprite)

说明：获取对方的游戏对象（可用于控制对方）

使用示例：

```actionscript
var tSP = parent.$fighter_ctrler.getTargetSP();
```

> ###### getTargetState

传入参数：无

返回类型：`int`

说明：获取对方的状态号

0=正常，40=硬直，10=正在攻击，11=正在使用技能，12=正在使用必杀，13=正在使用超必杀，14=正在跳跃，15=正在瞬步，16=当身，20=正在防御，21=被打，22=击飞，23=击倒，24=击倒弹起，30=死亡，50=正在卍解，60=开场，61=胜利，62=失败

使用示例：

```actionscript
if (parent.$fighter_ctrler.getTargetState() == 21)
{
    parent.$fighter_ctrler.speed = 12;
}   //当对方的状态是被打时，设置我方人物的速度值为12
```

> ###### setTargetVelocity

传入参数：`x:Number,y:Number`

返回类型：`void`

说明：设置对方受力

使用示例：

```actionscript
parent.$fighter_ctrler.setTargetVelocity(1, 1);
```

> ###### setTargetDamping

传入参数：`x:Number,y:Number`

返回类型：`void`

说明：设置对方阻力

使用示例：

```actionscript
parent.$fighter_ctrler.setTargetDamping(0.1, 0.1);
```

> ###### targetInRange

传入参数：`rx:Array = null , ry:Array = null`

返回类型：`Boolean`

说明：判断对方是否在距离自身的一定范围内（格式为：[左,右],[上,下]）

使用示例：

```actionscript
if (parent.$fighter_ctrler.targetInRange([0, 100], [-50, 50]))
{
    parent.$fighter_ctrler.speed = 12;
}   //当对方在该范围内时，设置我方人物的速度值为12
```

> ###### justHit

传入参数：`hitId:String , includeDefense:Boolean = false`

返回类型：`Boolean`

说明：判断对方是否被指定攻击命中；hitId 为攻击 ID，includeDefense 决定是否将被对方防御的命中也计入，默认 false

使用示例：

```actionscript
if (parent.$fighter_ctrler.justHit("k1", false))
{
    parent.$fighter_ctrler.speed = 12;
}   //当对方被k1atm打中，并为真命中时，设置我方人物的速度值为12
```

> ###### defineAction

传入参数：`id:String , obj:Object`

返回类型：`void`

说明：定义攻击ID

obj 用于创建攻击值对象，配置字段与 [HitVO](zh-cn/data-model-classes/HitVO?id=define-action-params) 保持一致

<div class="version-note">

3.5增加增伤、慢放和镜头聚焦配置；3.8开发增加防御耐力消耗、被动脱离、防御受力、冻结时长及命中回调配置，名称和默认值见链接中的属性说明

</div>

使用示例：

```actionscript
$fighter_ctrler.defineAction("tk" ,{power:30 , hitType:1 , hitx:2 , hity:6 , hurtTime:300 , hurtType:0 , isBreakDef:false});

```

[defineAction](../../tools/defineAction.html ':include :type=iframe width=100% height=557px')

> ###### defineBishaFace

传入参数：`id:String , face:Class`

返回类型：`void`

说明：定义必杀特写，第二个参数需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineBishaFace("XX特写1", bs1face);
```

> ###### defineHurtSound

传入参数：`sound1,sound2...`

返回类型：`void`

说明：定义受伤声音，可传多个声音链接类；每个声音都需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineHurtSound(snd_hurt1, snd_hurt1);
```

> ###### defineHurtFlySound

传入参数：`sound1,sound2...`

返回类型：`void`

说明：定义被击飞声音，可传多个声音链接类；每个声音都需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineHurtFlySound(snd_hurt2, snd_hurt2);
```

> ###### defineDieSound

传入参数：`sound1,sound2...`

返回类型：`void`

说明：定义死亡声音，可传多个声音链接类；每个声音都需要在库中设置链接

使用示例：

```actionscript
$fighter_ctrler.defineDieSound(snd_hurt3, snd_hurt3);
```

> ###### initMc

传入参数：`mc:MovieClip`

返回类型：`void`

说明：用人物动作时间轴的 MovieClip 初始化动画与判定管理，为其创建 [FighterMC 对象](zh-cn/core-object-classes/FighterMC)

使用示例：

```actionscript
$fighter_ctrler.initMc(mc);
```

> ###### getCurrentHits

传入参数：无

返回类型：`Array`

说明：获取自身当前场上存在的一般攻击面，返回当前包含自身所有[攻击值对象](zh-cn/data-model-classes/HitVO)的数组

使用示例：

```actionscript
var curHitsArr: Array = parent.$fighter_ctrler.getCurrentHits();
```

> ###### getBodyArea

传入参数：无

返回类型：`Rectangle`

说明：获取人物被打面当前在场景中的位置和大小，不存在被打面返回null

使用示例：

```actionscript
var bodyArea: Rectangle = parent.$fighter_ctrler.getBodyArea();
```

> ###### getHitCheckRect

传入参数：`name:String`

返回类型：`Rectangle`

说明：根据元件名称获取元件当前在场景中的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var hitArea: Rectangle = parent.$fighter_ctrler.getHitCheckRect("zh1atm");
```

> ###### getCurrentRect

传入参数：`rect:Rectangle, cacheId:String = null`

返回类型：`Rectangle`

说明：将一个矩形的相对坐标转换为游戏场景中的绝对坐标（参数1：传入的矩形，参数2：游戏内缓存的矩形ID）

使用示例：

```actionscript
var curArea: Rectangle = parent.$fighter_ctrler.getCurrentRect(new Rectangle(-7, -30, 15, 55), null);
```

> ###### getHitRange

传入参数：`id:String`

返回类型：`Rectangle`

说明：获取AI判定面当前在场景中的范围（参数：判定面的ID）

使用示例：

```actionscript
var aiArea: Rectangle = parent.$fighter_ctrler.getHitRange("kanmian");
```

<span id="getself"></span>

> ###### 3.8开发增加 getSelf

传入参数：无

返回类型：[`FighterMain`](zh-cn/core-object-classes/FighterMain)

说明：取得 FighterMain 人物主体

使用示例：

```actionscript
var fighter1 = parent.$fighter_ctrler.getSelf();
```

<span id="setdirectreverse"></span>

> ###### 3.8开发增加 setDirectReverse

传入参数：无

返回类型：`void`

说明：使自身转向相反方向

使用示例：

```actionscript
parent.$fighter_ctrler.setDirectReverse();
```

<span id="addrenderfunc"></span>

> ###### 3.8开发增加 addRenderFunc

传入参数：`func:Function = null, params:Object = null`

返回类型：`void`

说明：注册逐帧回调，同一函数在同一回调列表中不会重复注册。params 的配置如下：

- 不传 params：跟随对象的动画更新
- `{isFollowFps:true}`：跟随对象的逻辑更新频率
- `{isFollowFps:true, isPermanent:true}`：在独立的全局更新后回调中执行，与对象通常的逻辑和动画更新分开调度

isPermanent 仅在 isFollowFps 为 true 时有效；持久回调仍会在对象销毁时清理。回调的执行频率由对应的动画或逻辑更新决定

使用示例：

```actionscript
// 3.8开发：初始化时注册一次，不再需要时移除
function updateCustomState():void
{
    // 自定义逐帧逻辑
}
parent.$fighter_ctrler.addRenderFunc(updateCustomState, {isFollowFps:true});
// 移除时传入同一个函数引用
parent.$fighter_ctrler.removeRenderFunc(updateCustomState);
```

<span id="removerenderfunc"></span>

> ###### 3.8开发增加 removeRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：从逐帧回调列表移除指定函数，必须传入注册时的同一个 Function 引用

使用示例：

```actionscript
function updateCustomState1():void
{
    // 自定义逐帧逻辑
}
parent.$fighter_ctrler.addRenderFunc(updateCustomState1, {isFollowFps:true});

// 不再需要时执行，传入登记时的同一个函数引用
parent.$fighter_ctrler.removeRenderFunc(updateCustomState1);
```

<span id="inheritrenderfunc"></span>

> ###### 3.8开发增加 inheritRenderFunc

传入参数：`func:Function = null`

返回类型：`void`

说明：标记已注册的逐帧回调，使其在小队模式更换出场人物时，由下一位出场人物继续执行。例如当前人物战败退场后，回调会由新入场的人物继承。需先调用addRenderFunc注册，再用本方法标记

使用示例：

```actionscript
// 在小队模式中为当前人物登记耐力恢复效果
// 回调每次读取己方当前出场人物，换人后会为新人物恢复耐力
// 此段在初始人物上登记一次
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = parent.$fighter_ctrler.getSelf();
var group1 = fighter1.team.name == "P1"
    ? GameCtrl.I.gameRunData.p1FighterGroup
    : GameCtrl.I.gameRunData.p2FighterGroup;

function recoverSquadEnergy1():void
{
    var currentFighter1 = group1.currentFighter;
    if (currentFighter1 != null && currentFighter1.isAlive)
    {
        currentFighter1.addEnergy(0.1);
    }
}
parent.$fighter_ctrler.addRenderFunc(recoverSquadEnergy1, {isFollowFps:true});
parent.$fighter_ctrler.inheritRenderFunc(recoverSquadEnergy1);
```

> ###### doWanKai

传入参数：无<br>
传入参数（3.3）：`param1:int = 0`

返回类型：`void`

说明：执行变身

<div class="version-note">

3.3改动：增加可选 frame 参数，原有无参数调用仍可用

</div>

使用示例：

```actionscript
parent.$fighter_ctrler.doWanKai();      //变身为下一段人物
parent.$fighter_ctrler.doWanKai(2);     //变身为人物的一段
```

> ###### setDirectToTarget

传入参数：无

返回类型：`void`

说明：使自身面对对方

使用示例：

```actionscript
parent.$fighter_ctrler.setDirectToTarget();
```

> ###### moveOnce

传入参数：`x:Number = 0 , y:Number = 0`

返回类型：`void`

说明：移动一次

使用示例：

```actionscript
parent.$fighter_ctrler.moveOnce(0,0);
```

> ###### moveToTarget

传入参数：`x:Object = null , y:Object = null , setDirect:Boolean = true`

返回类型：`void`

说明：移动到对方的位置（x/y填null则横/纵向不进行移动）（x : X位置偏移，y : Y位置偏移，setDirect : 是否面向对方）

使用示例：

```actionscript
parent.$fighter_ctrler.moveToTarget(0, 0, true);
```

> ###### setCross

传入参数：`v:Boolean`

返回类型：`void`

说明：设置是否允许穿过对方人物的身体，被打判定仍由被打面决定

使用示例：

```actionscript
parent.$fighter_ctrler.setCross(true);
```

> ###### addHp

传入参数：`v:Number`

返回类型：`void`

说明：增加血量

使用示例：

```actionscript
parent.$fighter_ctrler.addHp(10);
```

> ###### addHpPercent

传入参数：`v:Number`

返回类型：`void`

说明：以最大血量的倍数增加血量（此值大于0，小于等于1）

使用示例：

```actionscript
parent.$fighter_ctrler.addHpPercent(0.15);
```

<span id="addhplosepercent"></span>

> ###### 3.8开发增加 addHpLosePercent

传入参数：`v:Number`

返回类型：`void`

说明：按已损失血量恢复血量：恢复量为 (hpMax - hp) * v；例如 0.2 表示已损失血量的 20%

使用示例：

```actionscript
parent.$fighter_ctrler.addHpLosePercent(0.2); // 恢复已损失血量的 20%
```

> ###### loseHp

传入参数：`v:Number`

返回类型：`void`

说明：减少血量

使用示例：

```actionscript
parent.$fighter_ctrler.loseHp(10);
```

> ###### loseHpPercent

传入参数：`v:Number`

返回类型：`void`

说明：以最大血量的倍数减少血量（此值大于0，小于等于1）

使用示例：

```actionscript
parent.$fighter_ctrler.loseHpPercent(0.15);
```

<span id="losehplosepercent"></span>

> ###### 3.8开发增加 loseHpLosePercent

传入参数：`v:Number`

返回类型：`void`

说明：按已损失血量扣除血量：扣除量为 (hpMax - hp) * v

使用示例：

```actionscript
parent.$fighter_ctrler.loseHpLosePercent(0.1);
```

<span id="addenergy"></span>

> ###### 3.8开发增加 addEnergy

传入参数：`delta:Number`

返回类型：`void`

说明：增加当前耐力，最高不超过最大耐力

使用示例：

```actionscript
parent.$fighter_ctrler.addEnergy(10);
```

<span id="getenergy"></span>

> ###### 3.6增加 getEnergy

传入参数：无

返回类型：`Number`

说明：取得当前耐力；energy 属性取得的是最大耐力

使用示例：

```actionscript
var energy1:Number = parent.$fighter_ctrler.getEnergy();
```

<span id="getenergyoverload"></span>

> ###### 3.6增加 getEnergyOverload

传入参数：无

返回类型：`Boolean`

说明：取得耐力过载状态

使用示例：

```actionscript
var overloaded1:Boolean = parent.$fighter_ctrler.getEnergyOverload();
```

<span id="loseenergy"></span>

> ###### 3.6增加 loseEnergy

传入参数：`v:Number`

返回类型：`void`

说明：消耗指定的耐力值

使用示例：

```actionscript
parent.$fighter_ctrler.loseEnergy(10);
```

<span id="loseqi"></span>

> ###### 3.6增加 loseQi

传入参数：`v:Number`

返回类型：`void`

说明：消耗指定的气量值

使用示例：

```actionscript
parent.$fighter_ctrler.loseQi(100);
```

> ###### getMcCtrl

传入参数：无

返回类型：[`FighterMcCtrler`](zh-cn/main-fighter-ctrlers/FighterMcCtrler)

说明：获取Mc控制器

使用示例：

```actionscript
var mcCtrl = parent.$fighter_ctrler.getMcCtrl();
```

> ###### getEffectCtrl

传入参数：无

返回类型：[`FighterEffectCtrl`](zh-cn/main-fighter-ctrlers/FighterEffectCtrl)

说明：获取Effect控制器

使用示例：

```actionscript
var effectCtrl = parent.$fighter_ctrler.getEffectCtrl();
```

> ###### getVoiceCtrl

传入参数：无

返回类型：[`FighterVoiceCtrler`](zh-cn/main-fighter-ctrlers/FighterVoiceCtrler)

说明：获取Voice控制器

使用示例：

```actionscript
var voiceCtrl = parent.$fighter_ctrler.getVoiceCtrl();
```

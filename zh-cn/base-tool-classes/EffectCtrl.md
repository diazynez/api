# 战斗效果控制器

通过 `EffectCtrl.I` 控制全局战斗效果。角色自身效果通常优先使用 `$effect_ctrler`，此类用于指定世界坐标、对象或全局演出。时长请按各接口标注的毫秒或秒填写。

源码类：`net.play5d.game.bvn.ctrl.EffectCtrl`

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

// 3.0：在指定游戏坐标播放效果
EffectCtrl.I.doEffectById("jump", 100, 0, 1);
```

### 属性与方法

<span id="effect_smoothing"></span>

> ###### 3.3增加 EFFECT_SMOOTHING

类型：`Boolean`

说明：全局特效平滑开关（静态），默认 true

<span id="shadow_enabled"></span>

> ###### 3.3增加 SHADOW_ENABLED

类型：`Boolean`

说明：全局残影开关（静态），默认 true

<span id="shake_enabled"></span>

> ###### 3.3增加 SHAKE_ENABLED

类型：`Boolean`

说明：全局抖动开关（静态），默认 true

<span id="bg_bulr_enabled"></span>

> ###### 3.6增加 BG_BULR_ENABLED

类型：`Boolean`

说明：全局背景模糊开关（静态，默认为true）

> ###### shineMaxCount

类型：`int`

说明：同时保留的闪光效果数量阈值，默认 3

> ###### freezeEnabled

类型：`Boolean`

说明：是否允许冻结效果，默认 true

<span id="bgblurenabled"></span>

> ###### 3.5增加 bgBlurEnabled

类型：`Boolean`

说明：当前场景是否允许背景模糊，默认 true

> ###### I

类型：[`EffectCtrl`](zh-cn/base-tool-classes/EffectCtrl)

说明：取得全局战斗效果控制器单例（静态只读访问器）

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

var effectCtrl1 = EffectCtrl.I;
```

> ###### doHitEffect

传入参数：`param1:HitVO, param2:Rectangle`<br>
传入参数（3.3）：`param1:HitVO, param2:Rectangle, param3:IGameSprite = null`

返回类型：`void`

说明：按攻击值对象和命中矩形播放命中特效

<div class="version-note">

3.3改动：增加可选 target，供特效关联命中目标

</div>

> ###### doDefenseEffect

传入参数：`param1:HitVO, param2:Rectangle, param3:int`<br>
传入参数（3.3）：`param1:HitVO, param2:Rectangle, param3:int, param4:IGameSprite = null`

返回类型：`void`

说明：按攻击值对象、命中矩形和防御类型播放防御特效

<div class="version-note">

3.3改动：增加可选 target，供特效关联防御目标

</div>

<span id="dosteelhiteffect"></span>

> ###### 3.3增加 doSteelHitEffect

传入参数：`param1:HitVO, param2:Rectangle, param3:IGameSprite`

返回类型：`void`

说明：按攻击类型在命中矩形处播放钢身受击效果

> ###### doEffectById

传入参数：`param1:String, param2:Number, param3:Number, param4:int = 1`<br>
传入参数（3.3）：`param1:String, param2:Number, param3:Number, param4:int = 1, param5:IGameSprite = null`<br>
传入参数（3.5）：`param1:String, param2:Number, param3:Number, param4:int = 1, param5:IGameSprite = null, param6:Boolean = true`

返回类型：`void`

说明：按效果 ID 在游戏坐标 x、y 播放效果，direct 表示朝向

<div class="version-note">

3.3改动：增加可选 target 参数，用于关联效果目标

3.5改动：增加可选 playSnd 参数，默认 true，用于控制是否播放效果声音

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

var fighter1 = parent.$fighter_ctrler.getTargetSP();
if (fighter1 != null)
{
    EffectCtrl.I.doEffectById("jump", fighter1.x, fighter1.y, fighter1.direct);
}
```

> ###### assisterEffect

传入参数：`param1:Assister`

返回类型：`void`

说明：按辅助人物所属作品类型播放登场效果

> ###### doEffectVO

传入参数：`param1:EffectVO, param2:Number, param3:Number, param4:int = 1`<br>
传入参数（3.3）：`param1:EffectVO, param2:Number, param3:Number, param4:int = 1, param5:IGameSprite = null`<br>
传入参数（3.5）：`param1:EffectVO, param2:Number, param3:Number, param4:int = 1, param5:IGameSprite = null, param6:Boolean = true`

返回类型：`void`

说明：按 EffectVO 配置播放效果，并应用冻结、抖动等关联配置

<div class="version-note">

3.3改动：增加可选 target 参数，用于关联效果目标

3.5改动：增加可选 playSnd 参数，默认 true，用于控制是否播放效果声音

</div>

使用示例：

```actionscript
// 取得已加载的原版起跳效果配置，按指定坐标播放
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.data.EffectModel;
import net.play5d.game.bvn.data.EffectVO;

var effect1:EffectVO = EffectModel.I.getEffect("jump");
var fighter1 = parent.$fighter_ctrler.getTargetSP();
if (fighter1 != null)
{
    EffectCtrl.I.doEffectVO(effect1, fighter1.x, fighter1.y, fighter1.direct);
}
```

<span id="dospecialeffect"></span>

> ###### 3.3增加 doSpecialEffect

传入参数：`param1:String, param2:FighterMain`

返回类型：`void`

说明：按 ID 为指定人物创建特殊跟随效果

使用示例：

```actionscript
// 在 P1 当前人物上播放原版的持续火焰效果
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
if (fighter1 != null)
{
    EffectCtrl.I.doSpecialEffect("fire_ing", fighter1);
}
```

<span id="dobuffeffect"></span>

> ###### 3.3增加 doBuffEffect

传入参数：`param1:String, param2:FighterMain, param3:FighterBuffVO`

返回类型：`void`

说明：按 ID 为指定人物创建并绑定 Buff 的效果

> ###### freeze

传入参数：`param1:int`

返回类型：`void`

说明：冻结战斗指定毫秒数；freezeEnabled 为 false 或时长不足一帧时不处理

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.shine(0xFFFFFF, 0.2);
EffectCtrl.I.freeze(150); // 白光出现后冻结战斗 150 毫秒
```

> ###### shine

传入参数：`param1:uint = 16777215, param2:Number = 0.2`

返回类型：`void`

说明：播放全屏颜色闪光，默认白色、透明度 0.2

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.shine(0xFFFFFF, 0.2);
```

<span id="startshake"></span>

> ###### 3.3增加 startShake

传入参数：`param1:Number, param2:Number`

返回类型：`void`

说明：开启持续水平和竖直抖动，配合 endShake 结束

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

// 3.3起：演出开始帧
EffectCtrl.I.startShake(3, 2);

// 演出结束帧
EffectCtrl.I.endShake();
```

<span id="endshake"></span>

> ###### 3.3增加 endShake

传入参数：无

返回类型：`void`

说明：结束持续抖动并恢复场景偏移

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.endShake();
```

> ###### shake

传入参数：`param1:Number = 0, param2:Number = 3, param3:int = 0`<br>
传入参数（3.3）：`param1:Number = 0, param2:Number = 3, param3:int = 500`

返回类型：`void`

说明：设置镜头抖动强度和毫秒时长；时长 -1 为不衰减，需配合结束流程处理

<div class="version-note">

3.3改动：time 默认值由 0 改为 500，单位毫秒

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.shake(3, 2, 500); // 水平强度 3、竖直强度 2，持续 500 毫秒
```

> ###### startShadow

传入参数：`param1:DisplayObject, param2:int = 0, param3:int = 0, param4:int = 0`<br>
传入参数（3.8开发）：`param1:DisplayObject, param2:int = 0, param3:int = 0, param4:int = 0, param5:Object = null`

返回类型：`void`

说明：为指定显示对象开启残影，r、g、b 为颜色通道参数

<div class="version-note">

3.8开发改动：增加 params 对象，支持 gap（残影生成间隔，默认 1）与 addOnce（是否只生成一次残影，默认 false）

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

var display1 = parent.$fighter_ctrler.self;
EffectCtrl.I.startShadow(display1, 0, 0, 0);

// 在结束残影的帧中，传入同一个显示对象
EffectCtrl.I.endShadow(display1);
```

> ###### endShadow

传入参数：`param1:DisplayObject`

返回类型：`void`

说明：停止指定显示对象继续产生残影，已有残影按效果流程消失

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.endShadow(parent.$fighter_ctrler.self);
```

> ###### bisha

传入参数：`param1:BaseGameSprite, param2:Boolean = false, param3:DisplayObject = null`

返回类型：`void`

说明：开始必杀演出；第一参数为演出人物，第二参数决定是否聚焦镜头，默认 false；第三参数为特写显示对象，默认 null 表示不显示特写

使用示例：

```actionscript
// 必杀演出的开始与结束调用分别放在对应帧中；开始和结束针对同一个人物
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
// 在 P1 人物的演出开始帧执行
EffectCtrl.I.bisha(fighter1, true);

// 在演出结束帧执行，以下为 3.0 的写法
EffectCtrl.I.endBisha();
// 3.3起改用：EffectCtrl.I.endBisha(fighter1);
```

> ###### endBisha

传入参数：无<br>
传入参数（3.3）：`param1:BaseGameSprite`

返回类型：`void`

说明：结束必杀演出并恢复渲染、镜头、命中检测和地图显示

<div class="version-note">

3.3改动：结束演出时需要传入对应人物主体

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

// 3.0：结束演出
EffectCtrl.I.endBisha();

// 3.3起改用以下写法，传入开始演出时的同一个人物
// var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
// EffectCtrl.I.endBisha(fighter1);
```

> ###### wanKai

传入参数：`param1:FighterMain, param2:DisplayObject = null`

返回类型：`void`

说明：开始变身演出并聚焦人物，可指定头像显示对象

使用示例：

```actionscript
// 变身演出的开始与结束调用分别放在对应帧中；开始和结束针对同一个人物
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
// 在 P1 人物的演出开始帧执行
EffectCtrl.I.wanKai(fighter1);

// 在演出结束帧执行，以下为 3.0 的写法
EffectCtrl.I.endWanKai();
// 3.3起改用：EffectCtrl.I.endWanKai(fighter1);
```

> ###### endWanKai

传入参数：无<br>
传入参数（3.3）：`param1:FighterMain`

返回类型：`void`

说明：结束变身演出并恢复战斗显示

<div class="version-note">

3.3改动：结束演出时需要传入对应人物主体

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

// 3.0：结束演出
EffectCtrl.I.endWanKai();

// 3.3起改用以下写法，传入开始演出时的同一个人物
// var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
// EffectCtrl.I.endWanKai(fighter1);
```

> ###### jumpEffect

传入参数：`param1:Number, param2:Number`

返回类型：`void`

说明：在指定游戏坐标播放起跳效果

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.jumpEffect(100, 0);
```

> ###### jumpAirEffect

传入参数：`param1:Number, param2:Number`

返回类型：`void`

说明：在指定游戏坐标播放空中跳跃效果

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.jumpAirEffect(100, -80);
```

> ###### touchFloorEffect

传入参数：`param1:Number, param2:Number`

返回类型：`void`

说明：在指定游戏坐标播放触地效果

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.touchFloorEffect(100, 0);
```

> ###### hitFloorEffect

传入参数：`param1:int, param2:Number, param3:Number`

返回类型：`void`

说明：播放触地冲击效果；第一个参数为类型，0 普通、1 轻、2 重，其后为 x、y

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.hitFloorEffect(0, 100, 0);
```

> ###### slowDown

传入参数：`param1:Number, param2:int = 1000`

返回类型：`void`

说明：按倍率慢放指定毫秒数，默认 1000；时长 0 时不自动倒计时恢复，需手动调用 slowDownResume

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.slowDown(2, 1000); // 按 2 倍慢放倍率演出 1000 毫秒后自动恢复

// 若需要提前结束，在对应帧中执行
EffectCtrl.I.slowDownResume();
```

<span id="bgblur"></span>

> ###### 3.5增加 bgBlur

传入参数：`blurX:Number, blurY:Number, time:int = 1000`

返回类型：`void`

说明：设置背景水平、竖直模糊和持续毫秒数，默认 1000

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

// 3.5起：背景模糊持续 1000 毫秒
EffectCtrl.I.bgBlur(8, 8, 1000);

// 若需要提前取消，在对应帧中执行
EffectCtrl.I.cancelBgBlur();
```

<span id="cancelbgblur"></span>

> ###### 3.5增加 cancelBgBlur

传入参数：无

返回类型：`void`

说明：取消背景模糊并清空倒计时

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.cancelBgBlur();
```

> ###### slowDownResume

传入参数：无

返回类型：`void`

说明：恢复正常速度并清除慢放计数

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.slowDownResume();
```

> ###### BGEffect

传入参数：`param1:String, param2:Number = -1`

返回类型：`void`

说明：播放背景效果；hold 为秒，默认 -1 表示不额外限制持续时间

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.BGEffect("kobg", 2); // 显示原版 KO 背景效果，时长限制为 2 秒
```

<span id="setonfreezeover"></span>

> ###### 3.3增加 setOnFreezeOver

传入参数：`param1:Function`

返回类型：`void`

说明：添加冻结结束回调

使用示例：

```actionscript
// 先登记回调，再开始冻结；本次冻结结束时闪白
import net.play5d.game.bvn.ctrl.EffectCtrl;

function onFreezeOver1():void
{
    EffectCtrl.I.shine(0xFFFFFF, 0.2);
}
EffectCtrl.I.setOnFreezeOver(onFreezeOver1);
EffectCtrl.I.freeze(150);
```

> ###### ghostStep

传入参数：`param1:BaseGameSprite`

返回类型：`void`

说明：开始幽步演出，暂停通常战斗并单独推进指定对象

使用示例：

```actionscript
// 幽步演出的开始与结束调用分别放在对应帧中；开始和结束针对同一个人物
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
// 在 P1 人物的演出开始帧执行
EffectCtrl.I.ghostStep(fighter1);

// 在演出结束帧执行，以下为 3.0 的写法
EffectCtrl.I.endGhostStep();
// 3.3起改用：EffectCtrl.I.endGhostStep(fighter1);
```

> ###### endGhostStep

传入参数：无<br>
传入参数（3.3）：`param1:BaseGameSprite`

返回类型：`void`

说明：结束幽步演出并恢复战斗显示

<div class="version-note">

3.3改动：结束演出时需要传入对应游戏对象

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

// 3.0：结束演出
EffectCtrl.I.endGhostStep();

// 3.3起改用以下写法，传入开始演出时的同一个人物
// var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
// EffectCtrl.I.endGhostStep(fighter1);
```

<span id="startfilter"></span>

> ###### 3.3增加 startFilter

传入参数：`param1:BaseGameSprite, param2:BitmapFilter, param3:Point = null`

返回类型：`void`

说明：为人物开启或更新位图滤镜效果，可指定滤镜位置偏移

使用示例：

```actionscript
// 3.3起：为 P1 当前人物设置蓝色发光滤镜，并在演出结束时移除
import flash.filters.GlowFilter;
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
EffectCtrl.I.startFilter(fighter1, new GlowFilter(0x66CCFF, 1, 8, 8));

// 在效果结束帧执行
EffectCtrl.I.endFilter(fighter1);
```

<span id="endfilter"></span>

> ###### 3.3增加 endFilter

传入参数：`param1:BaseGameSprite`

返回类型：`void`

说明：移除指定人物的位图滤镜效果

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
EffectCtrl.I.endFilter(fighter1);
```

<span id="createimpacteffect"></span>

> ###### 3.8开发增加 createImpactEffect

传入参数：`config:Object = null`

返回类型：`void`

说明：创建黑白闪冲击效果，config 覆盖效果对象配置；创建前会清理已有冲击效果。config 的可配置字段见 [playImpactEffect 的参数示例](zh-cn/main-fighter-ctrlers/FighterEffectCtrl?id=playimpacteffect)

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

// 3.8开发：按默认配置创建黑白闪冲击效果
EffectCtrl.I.createImpactEffect();

// 如需在演出结束时提前清理
EffectCtrl.I.clearImpactEffects();
```

<span id="clearimpacteffects"></span>

> ###### 3.8开发增加 clearImpactEffects

传入参数：无

返回类型：`void`

说明：清除当前所有黑白闪冲击效果

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.EffectCtrl;

EffectCtrl.I.clearImpactEffects();
```

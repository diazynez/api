# Effect控制器

### 方法

> ###### shake

传入参数：`powX:Number = 0 , powY:Number = 3 , time:Number = 0`

返回类型：`void`

说明：设置震动（参数1：水平振幅，参数2：竖直振幅，参数3：持续秒数）

使用示例：

```actionscript
parent.$effect_ctrler.shake(5, 5);
```

> ###### startShake

传入参数：`powX:Number = 0 , powY:Number = 3`

返回类型：`void`

说明：开始持续震动（参数1：水平振幅，参数2：竖直振幅）

使用示例：

```actionscript
parent.$effect_ctrler.startShake(5, 5);
```

> ###### endShake

传入参数：无

返回类型：`void`

说明：结束震动

使用示例：

```actionscript
parent.$effect_ctrler.endShake();
```

> ###### dash

传入参数：无<br>
传入参数（3.5）：`param1:Boolean = true`

返回类型：`void`

说明：设置冲刺特效

<div class="version-note">

3.5改动：增加 playSound 参数，控制是否播放声音

</div>

使用示例：

```actionscript
parent.$effect_ctrler.dash();
```

> ###### walk

传入参数：无

返回类型：`void`

说明：设置走特效

使用示例：

```actionscript
parent.$effect_ctrler.walk();
```

> ###### jump

传入参数：无

返回类型：`void`

说明：设置跳特效

使用示例：

```actionscript
parent.$effect_ctrler.jump();
```

> ###### jumpAir

传入参数：无

返回类型：`void`

说明：设置空中跳特效

使用示例：

```actionscript
parent.$effect_ctrler.jumpAir();
```

> ###### touchFloor

传入参数：无

返回类型：`void`

说明：设置落地特效

使用示例：

```actionscript
parent.$effect_ctrler.touchFloor();
```

> ###### hitFloor

传入参数：`type:int`<br>
传入参数（3.5）：`param1:int, param2:Number = 0`

返回类型：`void`

说明：播放击地特效，type 为效果类型：0 普通、1 轻、2 重

<div class="version-note">

3.5改动：增加 shakePow 参数，设置额外抖动强度；默认 0 表示不额外抖动

</div>

使用示例：

```actionscript
parent.$effect_ctrler.hitFloor(0);
```

> ###### energyExplode

传入参数：无

返回类型：`void`

说明：设置灵压爆发特效

使用示例：

```actionscript
parent.$effect_ctrler.energyExplode();
```

> ###### replaceSkill

传入参数：无

返回类型：`void`

说明：设置替身术特效

使用示例：

```actionscript
parent.$effect_ctrler.replaceSkill();
```

> ###### ghostStep

传入参数：无

返回类型：`void`

说明：设置幽步特效

使用示例：

```actionscript
parent.$effect_ctrler.ghostStep();
```

> ###### endGhostStep

传入参数：无

返回类型：`void`

说明：结束残影特效

使用示例：

```actionscript
parent.$effect_ctrler.endGhostStep();
```

> ###### shadow

传入参数：`r:int = 0, g:int = 0, b:int = 0`<br>
传入参数（3.8开发）：`param1:int = 0, param2:int = 0, param3:int = 0, param4:Object = null`

返回类型：`void`

说明：设置残影特效（颜色用RGB表示）

<div class="version-note">

3.8开发改动：增加 params 对象，支持 gap（残影生成间隔，默认 1）与 addOnce（是否只生成一次残影，默认 false）

</div>

使用示例：

```actionscript
parent.$effect_ctrler.shadow(255, 255, 255);
```

> ###### endShadow

传入参数：无

返回类型：`void`

说明：结束残影特效

使用示例：

```actionscript
parent.$effect_ctrler.endShadow();
```

> ###### slowDown

传入参数：`time:Number`

返回类型：`void`

说明：播放慢动作特效，time 为持续秒数

使用示例：

```actionscript
parent.$effect_ctrler.slowDown(0.5);
```

> ###### shine

传入参数：`color:uint = 16777215`

返回类型：`void`

说明：设置闪光特效（参数：颜色值）

使用示例：

```actionscript
parent.$effect_ctrler.shine(0xffffff);
```

> ###### FVO专用 specialStep

传入参数：无

返回类型：`void`

说明：设置特殊步特效

使用示例：

```actionscript
parent.$effect_ctrler.specialStep();
```

> ###### bisha

传入参数：`isSuper:Boolean=false, face:String=null`

返回类型：`void`

说明：设置必杀黑幕特效（参数1：是否拉近镜头，参数2：必杀特写名称，特写需要在伤害表中定义）

使用示例：

```actionscript
parent.$effect_ctrler.bisha(false,"特写名称");
```

> ###### endBisha

传入参数：无

返回类型：`void`

说明：结束必杀黑幕特效

使用示例：

```actionscript
parent.$effect_ctrler.endBisha();
```

> ###### startWanKai

传入参数：`face:String = null`

返回类型：`void`

说明：设置变身黑幕特效（参数：必杀特写名称，特写需要在伤害表中定义）

使用示例：

```actionscript
parent.$effect_ctrler.startWanKai("特写名称");
```

> ###### endWanKai

传入参数：无

返回类型：`void`

说明：结束变身黑幕特效

使用示例：

```actionscript
parent.$effect_ctrler.endWanKai();
```

<span id="definemelt"></span>

> ###### 3.8开发增加 defineMelt

传入参数：`mc:MovieClip, name:String, params:Object = null`

返回类型：`void`

说明：缓存指定 MovieClip 的逐帧位图并用 name 登记；当前实现未使用 params

使用示例：

```actionscript
// 先用库中的独立元件登记效果，再在招式中创建；登记与创建使用相同的名称
import flash.display.MovieClip;

// 库中用于位图残留的元件，其链接类设为 MeltSource1
var meltSource1:MovieClip = new MeltSource1();
parent.$effect_ctrler.defineMelt(meltSource1, "melt1");

// 在需要显示效果的帧中，使用同一个名称创建效果
var melt1 = parent.$effect_ctrler.addMelt("melt1");
```

<span id="addmelt"></span>

> ###### 3.8开发增加 addMelt

传入参数：`name:String, params:Object = null`

返回类型：`Melt`

说明：按已登记的 name 创建位图残留效果，并定位到当前对象；未登记时返回 null

使用示例：

```actionscript
import flash.display.MovieClip;

// 库中用于位图残留的元件，其链接类设为 MeltSource1
var meltSource1:MovieClip = new MeltSource1();
parent.$effect_ctrler.defineMelt(meltSource1, "melt1");
var melt1 = parent.$effect_ctrler.addMelt("melt1");
```

> ###### setBishaFace

传入参数：`id:String , face:Class`

返回类型：`void`

说明：定义必杀特写，第二个参数需要在库中设置链接

使用示例：

```actionscript
$effect_ctrler.setBishaFace("XX特写1", bs1face);
```

<span id="doeffectbyid"></span>

> ###### 3.8开发增加 doEffectById

传入参数：`id:String, playSnd:Boolean = true`

返回类型：`void`

说明：在当前对象坐标及朝向播放指定效果；playSnd 控制是否播放声音

使用示例：

```actionscript
parent.$effect_ctrler.doEffectById("jump", false);
```

<span id="startglow"></span>

> ###### 3.3增加 startGlow

传入参数：`color:uint = 16777215`

返回类型：`void`

说明：设置钢身发光（参数：颜色值）

使用示例：

```actionscript
parent.$effect_ctrler.startGlow(0);
```

<span id="endglow"></span>

> ###### 3.3增加 endGlow

传入参数：无

返回类型：`void`

说明：结束钢身发光

使用示例：

```actionscript
parent.$effect_ctrler.endGlow();
```

<span id="playimpacteffect"></span>

> ###### 3.8开发增加 playImpactEffect

传入参数：`config:Object = null`

返回类型：`void`

说明：在设置允许时播放黑白闪冲击效果，config 用于覆盖效果对象配置

使用示例：

```actionscript
var impactConfig1:Object = new Object();
// 效果持续帧数
impactConfig1.holdFrames = 4;
// 速度线基础数量
impactConfig1.lineBase = 96;
// 速度线随机数量范围
impactConfig1.lineRand = 15;
// 速度线角度抖动值
impactConfig1.angleJitter = 8;
// 速度线最小宽度
impactConfig1.lineWidthMin = 0.3;
// 速度线最大宽度
impactConfig1.lineWidthMax = 3;
// 速度线淡出起始比例
impactConfig1.fadeStart = 0;
// 速度线径向分割步数
impactConfig1.radialSteps = 20;
// 径向模糊强度上限
impactConfig1.maxBlur = 25;
// 模糊 X/Y 比例
impactConfig1.blurXYRatio = 0.15;
// 毛刺最大偏移量
impactConfig1.glitchH = 10;
// 毛刺行跳过步长
impactConfig1.glitchSkip = 4;
// 二值化亮度阈值
impactConfig1.binarizeThreshold = 120;
// 二值化对比度系数
impactConfig1.binarizeContrast = 90;

parent.$effect_ctrler.playImpactEffect(impactConfig1);
```

<span id="stopimpacteffect"></span>

> ###### 3.8开发增加 stopImpactEffect

传入参数：无

返回类型：`void`

说明：清除当前黑白闪冲击效果

使用示例：

```actionscript
parent.$effect_ctrler.stopImpactEffect();
```

<span id="clean"></span>

> ###### 3.5增加 clean

传入参数：无

返回类型：`void`

说明：结束幽步特效、结束钢身发光、结束残影特效

使用示例：

```actionscript
parent.$effect_ctrler.clean();
```

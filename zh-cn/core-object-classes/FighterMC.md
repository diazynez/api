# 人物MC

`FighterMC` 负责管理人物动作的播放、跳帧与判定范围。`initMc(mc)` 接收动作时间轴的 `MovieClip`，引擎再为它创建 `FighterMC` 对象。

| 获取方式或用途 | 对象类型 | 对应内容 |
| --- | --- | --- |
| `FighterMcCtrler.getFighterMc()`、`FighterMain.getMC()` | `FighterMC` | 本页介绍的动画与判定管理对象 |
| 传入 `FighterCtrler.initMc(mc)` 的 `mc` | `MovieClip` | 在编辑器中制作的人物动作时间轴 |
| `FighterMC.mc`（3.8开发） | `MovieClip` | 初始化时传入的同一个动作时间轴 |
| `FighterMain.mc`、`FighterMain.getDisplay()`、`FighterCtrler.self` | `MovieClip` / `DisplayObject` | 人物的外层显示对象，通常包含动作时间轴 |

```actionscript
import flash.display.MovieClip;

var fighterMC1 = parent.$mc_ctrler.getFighterMc(); // 动画与判定管理对象
var actionMc1:MovieClip = fighterMC1.mc; // 3.8开发：初始化时传入的动作时间轴
var displayMc1 = parent.$fighter_ctrler.self; // 人物外层显示对象
```

### 属性

说明：设置或调整人物的默认属性

> ###### currentFrameName

类型：`String`

说明：人物MC当前的帧标签（只读）

使用示例：

```actionscript
var currentFrameName: String = parent.$mc_ctrler.getFighterMc().currentFrameName;
```

<span id="mc"></span>

> ###### 3.8开发增加 mc

类型：`MovieClip`

说明：取得人物动作时间轴的 MovieClip，与初始化时传入 initMc 的对象相同（只读）

使用示例：

```actionscript
var actionMc1 = parent.$mc_ctrler.getFighterMc().mc;
```

> ###### currentFrameCount

类型：`int`

说明：当前动作标签下累计的动画更新次数（只读）

<div class="version-note">

版本变化：3.3 改为 getCurrentFrameCount() 方法；3.0 读取 currentFrameCount 属性，后续版本使用 getCurrentFrameCount()

</div>

使用示例：

```actionscript
// 3.0：读取当前动作的动画更新计数
var frameCount1:int = parent.$mc_ctrler.getFighterMc().currentFrameCount;
// 3.3起改用：var frameCount1:int = parent.$mc_ctrler.getFighterMc().getCurrentFrameCount();
```

> ###### x

类型：`Number`

说明：人物MC的横坐标

使用示例：

```actionscript
var mcx: Number = parent.$mc_ctrler.getFighterMc().x;
```

> ###### y

类型：`Number`

说明：人物MC的纵坐标

使用示例：

```actionscript
var mcy: Number = parent.$mc_ctrler.getFighterMc().y;
```

### 方法

<span id="getcurrentframe"></span>

> ###### 3.3增加 getCurrentFrame

传入参数：无

返回类型：`int`

说明：获取人物MC当前所处帧数

使用示例：

```actionscript
var currentFrame: int = parent.$mc_ctrler.getFighterMc().getCurrentFrame();
```

<span id="getcurrentframecount"></span>

> ###### 3.3增加 getCurrentFrameCount

传入参数：无

返回类型：`int`

说明：获取人物MC当前动作的持续帧数

使用示例：

```actionscript
var currentFrameCount: int = parent.$mc_ctrler.getFighterMc().getCurrentFrameCount();
```

> ###### getChildByName

传入参数：`name:String`

返回类型：`DisplayObject`

说明：根据元件名称获取MC内元件

使用示例：

```actionscript
var bdmnMc: DisplayObject = parent.$mc_ctrler.getFighterMc().getChildByName("bdmn");
```

> ###### renderAnimate

传入参数：无

返回类型：`void`

说明：渲染人物MC动画、判定区域和延迟播放动作

使用示例：

```actionscript
parent.$mc_ctrler.getFighterMc().renderAnimate();
```

> ###### goFrame

传入参数：`name:String, isPlay:Boolean = true, playFrame:int = 0, goFrameDelay:Object = null`

返回类型：`void`

说明：控制MC跳帧（参数1：跳转目标帧标签，参数2：是否播放，参数3：播放指定帧数后停止（填0则不会停止），参数4：延迟执行另一跳转）

使用示例：

```actionscript
parent.$mc_ctrler.getFighterMc().goFrame("帧标签", true);        //等同于Mc控制器的gotoAndPlay
parent.$mc_ctrler.getFighterMc().goFrame("帧标签", false);        //等同于Mc控制器的gotoAndStop
parent.$mc_ctrler.getFighterMc().goFrame("被打", true, 3);        //跳转至“被打”动作，并在播放3帧后停止播放
parent.$mc_ctrler.getFighterMc().goFrame("被打", false, 0, {
	"name":"击飞",
	"delay":1,
	"isPlay":false
});        //在跳转到“被打”动作并停止的1帧后，跳转到“击飞”动作并停止
```

> ###### stopRenderMainAnimate

传入参数：无

返回类型：`void`

说明：停止渲染人物MC的主动画

使用示例：

```actionscript
parent.$mc_ctrler.getFighterMc().stopRenderMainAnimate();
```

> ###### resumeRenderMainAnimate

传入参数：无

返回类型：`void`

说明：恢复渲染人物MC的主动画

使用示例：

```actionscript
parent.$mc_ctrler.getFighterMc().resumeRenderMainAnimate();
```

> ###### checkFrame

传入参数：`name:String`

返回类型：`Boolean`

说明：检查人物MC内是否存在指定帧标签

使用示例：

```actionscript
var hasWankai: Boolean = parent.$mc_ctrler.getFighterMc().checkFrame("万解");
```

> ###### getCurrentHitSprite

传入参数：无

返回类型：`Array`

说明：获取自身当前场上存在的一般攻击面的元件，返回包含这些元件的数组

使用示例：

```actionscript
var currentHitSprite: Array = parent.$mc_ctrler.getFighterMc().getCurrentHitSprite();
```

> ###### getCurrentBodyArea

传入参数：无

返回类型：`Rectangle`

说明：获取人物被打面在人物MC中的位置和大小，不存在被打面返回null

使用示例：

```actionscript
var currentBodyArea: Rectangle = parent.$mc_ctrler.getFighterMc().getCurrentBodyArea();
```

> ###### getCurrentHitArea

传入参数：无

返回类型：`Array`

说明：获取自身当前场上存在的一般攻击面的范围数据（Object类型对象），返回包含这些Object的数组

使用示例：

```actionscript
var currentHitArea: Array = parent.$mc_ctrler.getFighterMc().getCurrentHitArea();

/*
会得到形如这样的返回值

[
	{
		name: "zh31atm",
		hitVO: [Object HitVO],(攻击值对象类型对象)
		area:(x=41, y=-94, w=34, h=42)（Rectangle类型对象）
	},
	{
		name: "zh32atm",
		hitVO: [Object HitVO],
		area:(x=75, y=-131, w=38.5, h=50)
	},
	{
		name: "zh33atm",
		hitVO: [Object HitVO],
		area:(x=110, y=-171, w=52, h=44.5)
	}
]
*/
```

> ###### getCheckHitRect

传入参数：`name:String`

返回类型：`Rectangle`

说明：根据元件名称获取MC内元件的判定范围矩形（参数：判定面的名称）

使用示例：

```actionscript
var checkHitRect: Rectangle = parent.$mc_ctrler.getFighterMc().getCheckHitRect("zh1atm");
```

> ###### playHurtFly

传入参数：`hitx:Number, hity:Number, showBeHit:Boolean = true`

返回类型：`void`

说明：播放击飞动作（参数1：受力X，参数2：受力Y，参数3：是否显示”被打“动作）

使用示例：

```actionscript
parent.$mc_ctrler.getFighterMc().playHurtFly(-10 * $self_main.direct, 0, false);
```

> ###### playHurtDown

传入参数：无<br>
传入参数（3.8开发）：`effect:Boolean = true`

返回类型：`void`

说明：播放击倒动作

<div class="version-note">

3.8开发改动：增加 effect 参数，默认 true 时播放击地冲击效果；false 时改用普通触地效果，仍保留抖动

</div>

使用示例：

```actionscript
parent.$mc_ctrler.getFighterMc().playHurtDown();
```

> ###### stopHurtFly

传入参数：无

返回类型：`void`

说明：停止击飞过程

使用示例：

```actionscript
parent.$mc_ctrler.getFighterMc().stopHurtFly();
```

> ###### getHitRange

传入参数：`id:String`

返回类型：`Rectangle`

说明：获取AI判定面在人物MC中的范围（参数：判定面的ID）

使用示例：

```actionscript
var aiArea: Rectangle = parent.$mc_ctrler.getFighterMc().getHitRange("kanmian");
```

<span id="getcurrentlabel"></span>

> ###### 3.8开发增加 getCurrentLabel

传入参数：无

返回类型：`String`

说明：取得底层 MovieClip 的 currentLabel，与控制器保存的动作名不完全相同

使用示例：

```actionscript
var currentLabel1:String = parent.$mc_ctrler.getFighterMc().getCurrentLabel();
```

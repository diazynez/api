# 游戏摄像机

通过 `GameCtrl.I.gameState.camera` 访问摄像机。镜头跟随的是显示对象数组。自定义镜头演出结束后，可调用场景的 `cameraResume()` 恢复通常跟随。

源码类：`net.play5d.game.bvn.state.GameCamera`

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

// 聚焦自身；演出结束时调用 GameCtrl.I.gameState.cameraResume()
GameCtrl.I.gameState.cameraFocusOne(parent.$fighter_ctrler.self);
```

### 属性与方法

> ###### tweenSpd

类型：`int`

说明：镜头缓动除数；大于 1 时逐渐接近目标，0 或 1 时直接到达

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.tweenSpd = 5;
```

> ###### stageSize

类型：`Point`

说明：地图场景的尺寸 Point

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var stageSize1 = GameCtrl.I.gameState.camera.stageSize;
```

> ###### focusX

类型：`Boolean`

说明：是否跟随水平位置，默认 true

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.focusX = false;
```

> ###### focusY

类型：`Boolean`

说明：是否跟随竖直位置，默认 false

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.focusY = true;
```

> ###### offsetX

类型：`Number`

说明：水平跟随偏移，默认 0

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.offsetX = 20;
```

> ###### offsetY

类型：`Number`

说明：竖直跟随偏移，默认 0

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.offsetY = -30;
```

> ###### autoZoom

类型：`Boolean`

说明：是否根据跟随对象间距自动缩放，默认 false

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.autoZoom = true;
```

> ###### autoZoomMin

类型：`Number`

说明：自动缩放下限，默认 1

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.autoZoomMin = 1;
```

> ###### autoZoomMax

类型：`Number`

说明：自动缩放上限，默认 3

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.autoZoomMax = 3;
```

> ###### getScreenRect

传入参数：无<br>
传入参数（3.3）：`param1:Boolean = false`

返回类型：`Rectangle`

说明：取得镜头视口矩形

<div class="version-note">

3.0 返回目标视口，后续版本可选择是否包含缓动后的状态

3.3改动：增加 withTween 开关，默认 false，选择目标或当前缓动视口

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var screenRect1 = GameCtrl.I.gameState.camera.getScreenRect();
```

> ###### updateNow

传入参数：无

返回类型：`void`

说明：暂时关闭缓动并立即更新镜头，然后恢复原缓动参数

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.camera.updateNow();
```

> ###### setStageBounds

传入参数：`param1:Rectangle = null`

返回类型：`void`

说明：设置场景边界；传 null 时从场景显示对象取得边界

使用示例：

```actionscript
// 自定义场景边界，示例中的范围按实际地图尺寸调整
import flash.geom.Rectangle;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var camera1 = GameCtrl.I.gameState.camera;
camera1.setStageBounds(new Rectangle(0, 0, 1200, 600));

// 恢复从场景显示对象取得边界
camera1.setStageBounds();
```

> ###### setStageSizeFromDisplay

传入参数：`param1:DisplayObject`

返回类型：`void`

说明：根据显示对象的尺寸和缩放设置 stageSize

使用示例：

```actionscript
// 使用当前地图显示对象的尺寸设置场景大小
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var scene1 = GameCtrl.I.gameState;
scene1.camera.setStageSizeFromDisplay(scene1.getMap().mapMc);
```

> ###### getZoom

传入参数：`param1:Boolean = false`

返回类型：`Number`

说明：取得缩放倍率；默认取得目标倍率，true 取得当前实际显示倍率

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var zoom1:Number = GameCtrl.I.gameState.camera.getZoom();
```

> ###### setZoom

传入参数：`param1:Number, param2:Boolean = true`<br>
传入参数（3.3）：`param1:Number`

返回类型：`void`

说明：设置镜头缩放倍率

<div class="version-note">

3.0 第二参数控制是否立即应用到显示层

3.3改动：不再接收第二个立即应用开关

</div>

使用示例：

```actionscript
// 临时固定镜头缩放，结束时恢复倍率和自动缩放开关
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var camera1 = GameCtrl.I.gameState.camera;
var zoom1:Number = camera1.getZoom();
var autoZoom1:Boolean = camera1.autoZoom;
camera1.autoZoom = false;
camera1.setZoom(1.2);
camera1.updateNow();

// 在演出结束帧恢复
GameCtrl.I.gameState.cameraResume();
camera1.setZoom(zoom1);
camera1.autoZoom = autoZoom1;
```

> ###### focus

传入参数：`param1:Array, param2:Boolean = false`

返回类型：`void`

说明：设置跟随的 DisplayObject 数组；第二参数为 true 时立即定位

使用示例：

```actionscript
// 同时跟随双方显示对象，并立即定位
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var camera1 = GameCtrl.I.gameState.camera;
var selfDisplay1 = parent.$fighter_ctrler.self;
var targetDisplay1 = parent.$fighter_ctrler.target;
camera1.focus([selfDisplay1, targetDisplay1], true);

// 演出结束时恢复场景原本的跟随对象
GameCtrl.I.gameState.cameraResume();
```

> ###### move

传入参数：`param1:Number, param2:Number`

返回类型：`void`

说明：取消对象跟随并设置镜头目标坐标

参考源码在取消跟随后，下一次 `render()` 仍会读取 `_focus.length`，可能出现空引用。需要固定镜头时可参考 [setX / setY 的示例](zh-cn/base-tool-classes/GameCamera?id=setx)。

> ###### moveCenter

传入参数：无

返回类型：`void`

说明：取消对象跟随并将镜头目标设置到场景中心

参考源码在取消跟随后，下一次 `render()` 仍会读取 `_focus.length`，可能出现空引用。需要固定镜头时可参考 [setX / setY 的示例](zh-cn/base-tool-classes/GameCamera?id=setx)。

> ###### setX

传入参数：`param1:Number, param2:Boolean = true`<br>
传入参数（3.3）：`param1:Number`

返回类型：`void`

说明：设置镜头水平位置

<div class="version-note">

3.0 第二参数控制是否直接应用

3.3改动：不再接收第二个立即应用开关

</div>

使用示例：

```actionscript
// 固定两轴位置时同时暂停坐标跟随，避免下一次更新覆盖设置
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var camera1 = GameCtrl.I.gameState.camera;
// 固定当前镜头位置，暂停两轴跟随
var focusX1:Boolean = camera1.focusX;
var focusY1:Boolean = camera1.focusY;
camera1.focusX = false;
camera1.focusY = false;
camera1.setX(100);
camera1.setY(0);

// 演出结束时恢复跟随
camera1.focusX = focusX1;
camera1.focusY = focusY1;
GameCtrl.I.gameState.cameraResume();
```

> ###### setY

传入参数：`param1:Number, param2:Boolean = true`<br>
传入参数（3.3）：`param1:Number`

返回类型：`void`

说明：设置镜头竖直位置

<div class="version-note">

3.0 第二参数控制是否直接应用

3.3改动：不再接收第二个立即应用开关

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var camera1 = GameCtrl.I.gameState.camera;
var focusY1:Boolean = camera1.focusY;
camera1.focusY = false;
camera1.setY(0);

// 演出结束时恢复竖直跟随
camera1.focusY = focusY1;
```

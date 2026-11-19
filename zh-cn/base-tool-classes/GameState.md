# 游戏场景

通过 `GameCtrl.I.gameState` 访问当前战斗场景。场景坐标与角色 MovieClip 内的局部坐标不同，转换时使用下方的坐标方法。

源码类：`net.play5d.game.bvn.state.GameState`

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var target1 = parent.$fighter_ctrler.getTargetSP();
if (target1 != null) {
    var position1 = GameCtrl.I.gameState.getGameSpriteGlobalPosition(target1);
}
```

### 属性与方法

> ###### camera

类型：[`GameCamera`](zh-cn/base-tool-classes/GameCamera)

说明：当前游戏摄像机，通过 GameCtrl.I.gameState.camera 访问

<div class="version-note">

3.8开发的 gameState 类型改为 GameStage，本页 GameState 的旧版接口不保证全部适用于 GameStage

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var camera1 = GameCtrl.I.gameState.camera;
```

> ###### gameUI

类型：`GameUI`

说明：当前战斗 UI

> ###### gameLayer

类型：`Sprite`

说明：取得包含地图和人物等对象的游戏显示层（只读）

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var gameLayer1 = GameCtrl.I.gameState.gameLayer;
```

> ###### getMap

传入参数：无

返回类型：`MapMain`

说明：取得当前地图主体 MapMain

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var map1 = GameCtrl.I.gameState.getMap();
```

<span id="setvisiblebyclass"></span>

> ###### 3.3增加 setVisibleByClass

传入参数：`param1:Class, param2:*`

返回类型：`void`

说明：按游戏对象的确切类设置显示对象 visible，不按子类关系匹配

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;
import net.play5d.game.bvn.fighter.Bullet;

// 3.3起：演出开始时隐藏场内飞行道具
GameCtrl.I.gameState.setVisibleByClass(Bullet, false);

// 演出结束时恢复显示
GameCtrl.I.gameState.setVisibleByClass(Bullet, true);
```

<span id="getfighterbydata"></span>

> ###### 3.5增加 getFighterByData

传入参数：`data:FighterVO`

返回类型：[`FighterMain`](zh-cn/core-object-classes/FighterMain)

说明：按 FighterVO 对象身份取得场内人物，未找到时返回 null

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

// 3.5起：使用本局保存的同一个 FighterVO 对象查找场内人物
var data1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighterVO;
var fighter1 = GameCtrl.I.gameState.getFighterByData(data1);
if (fighter1 != null) {
    var hp1:int = fighter1.hp;
}
```

> ###### display

类型：`DisplayObject`

说明：取得场景自身的 DisplayObject（只读）

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var display1 = GameCtrl.I.gameState.display;
```

> ###### getGameSpriteGlobalPosition

传入参数：`param1:IGameSprite, param2:Number = 0, param3:Number = 0`

返回类型：`Point`

说明：将游戏对象坐标及可选偏移换算成场景显示坐标，考虑当前缩放和游戏层偏移

使用示例：

```actionscript
// 取得对方头顶附近的位置，供场景显示层上的提示或标记定位
import flash.geom.Point;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var target1 = parent.$fighter_ctrler.getTargetSP();
if (target1 != null) {
    var position1:Point = GameCtrl.I.gameState.getGameSpriteGlobalPosition(target1, 0, -60);
}
```

> ###### getGameSprites

传入参数：无<br>
传入参数（3.3）：无

返回类型：`Array`<br>
返回类型（3.3）：[`Vector.<IGameSprite>`](zh-cn/abstract-interface-classes/IGameSprite)

说明：取得场内游戏对象集合；返回内部集合的引用

<div class="version-note">

3.3改动：返回类型由 Array 改为 Vector.\<IGameSprite\>

</div>

使用示例：

```actionscript
// 恢复场内游戏对象的显示；遍历写法同时适用于 Array 与 Vector 返回值
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

for each (var sprite1 in GameCtrl.I.gameState.getGameSprites()) {
    var display1 = sprite1.getDisplay();
    if (display1 != null) {
        display1.visible = true;
    }
}
```

> ###### addGameSprite

传入参数：`param1:IGameSprite`

返回类型：`void`

说明：将对象及其显示内容加入场景，不负责建立小队归属；通常使用 GameCtrl.I.addGameSprite

<span id="addgamespriteat"></span>

> ###### 3.3增加 addGameSpriteAt

传入参数：`param1:IGameSprite, param2:int`

返回类型：`void`

说明：在指定人物显示层索引插入对象并加入场内对象集合

> ###### removeGameSprite

传入参数：`param1:IGameSprite`<br>
传入参数（3.5）：`param1:IGameSprite, param2:Boolean = false`

返回类型：`void`

说明：将对象及其显示内容移出场景

<div class="version-note">

3.0 本方法不调用对象 destory

3.5改动：增加 isDispose 参数，控制是否释放移除对象的资源

</div>

> ###### cameraFocusOne

传入参数：`param1:DisplayObject`

返回类型：`void`

说明：将镜头聚焦到指定显示对象，并设定特写缩放

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

// 人物演出开始帧
GameCtrl.I.gameState.cameraFocusOne(parent.$fighter_ctrler.self);

// 演出结束帧
GameCtrl.I.gameState.cameraResume();
```

> ###### cameraResume

传入参数：无

返回类型：`void`

说明：恢复场景保存的通常镜头跟随对象

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.cameraResume();
```

> ###### drawGameRect

传入参数：`param1:Rectangle, param2:uint = 16711680, param3:Number = 0.5, param4:Boolean = false`

返回类型：`void`

说明：在效果层绘制调试矩形；参数依次为矩形、颜色、透明度、是否先清除旧绘制

使用示例：

```actionscript
import flash.geom.Rectangle;
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var target1 = parent.$fighter_ctrler.getTargetSP();
if (target1 != null) {
    var rect1:Rectangle = target1.getArea();
    if (rect1 != null) {
        GameCtrl.I.gameState.drawGameRect(rect1, 0xFF0000, 0.5, true);
    }
}

// 调试结束时执行
GameCtrl.I.gameState.clearDrawGameRect();
```

> ###### clearDrawGameRect

传入参数：无

返回类型：`void`

说明：清空调试矩形图形

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

GameCtrl.I.gameState.clearDrawGameRect();
```

# 游戏事件

继承自 `flash.events.Event`，同时提供共享事件派发器的静态方法。以下仅列出与角色或战斗脚本较相关的事件；界面和无双任务等内部事件未逐项收录。

源码类：`net.play5d.game.bvn.events.GameEvent`

事件附带的数据由具体派发位置决定，读取方式见 param 属性及对应版本说明。

使用示例：

```actionscript
import net.play5d.game.bvn.events.GameEvent;

function onScoreUpdate(event:GameEvent):void
{
    // 3.0 可监听此事件，不读取 event.param
}
GameEvent.addEventListener(GameEvent.SCORE_UPDATE, onScoreUpdate);
// 不再需要时移除
GameEvent.removeEventListener(GameEvent.SCORE_UPDATE, onScoreUpdate);
```

### 属性与方法

> ###### SCORE_UPDATE

类型：`String`

说明：事件类型常量：分数更新（默认为"SCORE_UPDATE"）（只读）

<span id="pause_game"></span>

> ###### 3.3增加 PAUSE_GAME

类型：`String`

说明：事件类型常量：战斗暂停（默认为"PAUSE_GAME"）（只读）

<span id="pause_game_menu"></span>

> ###### 3.6增加 PAUSE_GAME_MENU

类型：`String`

说明：事件类型常量：暂停菜单打开（默认为"PAUSE_GAME_MENU"）（只读）

<span id="resume_game"></span>

> ###### 3.3增加 RESUME_GAME

类型：`String`

说明：事件类型常量：战斗恢复（默认为"RESUME_GAME"）（只读）

<span id="load_game_complete"></span>

> ###### 3.3增加 LOAD_GAME_COMPLETE

类型：`String`

说明：事件类型常量：游戏加载完成（默认为"LOAD_GAME_COMPLETE"）（只读）

<span id="game_start"></span>

> ###### 3.3增加 GAME_START

类型：`String`

说明：事件类型常量：整场战斗开始（默认为"GAME_START"）（只读）

<span id="round_start"></span>

> ###### 3.3增加 ROUND_START

类型：`String`

说明：事件类型常量：回合开始（默认为"ROUND_START"）（只读）

<span id="round_end"></span>

> ###### 3.3增加 ROUND_END

类型：`String`

说明：事件类型常量：回合结束（默认为"ROUND_END"）（只读）

<span id="game_end"></span>

> ###### 3.3增加 GAME_END

类型：`String`

说明：事件类型常量：整场战斗结束（默认为"GAME_END"）（只读）

<span id="game_over"></span>

> ###### 3.3增加 GAME_OVER

类型：`String`

说明：事件类型常量：游戏失败（默认为"GAME_OVER"）（只读）

<span id="game_pass_all"></span>

> ###### 3.3增加 GAME_PASS_ALL

类型：`String`

说明：事件类型常量：全部关卡通过（默认为"GAME_PASS_ALL"）（只读）

<span id="fight_start"></span>

> ###### 3.6增加 FIGHT_START

类型：`String`

说明：事件类型常量：战斗启动（默认为"FIGHT_START"）（只读）

<span id="param"></span>

> ###### 3.3增加 param

类型：`*`

说明：事件附带的数据

<div class="version-note">

3.0 没有此公开属性

</div>

> ###### dispatchEvent

调用方式：静态方法

传入参数：`param1:String, param2:* = null, param3:Boolean = false, param4:Boolean = false`

返回类型：`void`

说明：在共享派发器上派发事件；四个参数依次为事件类型、附带数据、是否冒泡、是否可取消，后两个参数默认均为 false

<div class="version-note">

3.0 构造器未保存该参数，3.3 增加 param 属性后才可通过 event.param 读取

</div>

使用示例：

```actionscript
// 在共享派发器上演示登记、传递数据、移除监听的完整流程
import net.play5d.game.bvn.events.GameEvent;

// 3.3起：自定义事件类型，发送的数据通过 event.param 读取
function onCustomEffect1(event:GameEvent):void
{
    var power1:Number = event.param.power;
}
GameEvent.addEventListener("customEffect1", onCustomEffect1);
GameEvent.dispatchEvent("customEffect1", {power:100});
GameEvent.removeEventListener("customEffect1", onCustomEffect1);
```

> ###### addEventListener

调用方式：静态方法

传入参数：`param1:String, param2:Function, param3:Boolean = false, param4:int = 0, param5:Boolean = false`

返回类型：`void`

说明：在共享派发器上监听事件；参数依次为类型、回调、捕获、优先级、弱引用

使用示例：

```actionscript
import net.play5d.game.bvn.events.GameEvent;

function onScoreUpdate1(event:GameEvent):void
{
    // 在此处理分数变化
}
GameEvent.addEventListener(GameEvent.SCORE_UPDATE, onScoreUpdate1);
```

> ###### removeEventListener

调用方式：静态方法

传入参数：`param1:String, param2:Function, param3:Boolean = false`

返回类型：`void`

说明：移除共享派发器上的监听，类型、函数引用和捕获参数应与登记时一致

使用示例：

```actionscript
import net.play5d.game.bvn.events.GameEvent;

function onScoreUpdate1(event:GameEvent):void
{
    // 在此处理分数变化
}
GameEvent.addEventListener(GameEvent.SCORE_UPDATE, onScoreUpdate1);

// 不再需要监听时，使用登记时的同一个函数引用
GameEvent.removeEventListener(GameEvent.SCORE_UPDATE, onScoreUpdate1);
```

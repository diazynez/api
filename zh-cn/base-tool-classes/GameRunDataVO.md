# 对局数据

通过 `GameCtrl.I.gameRunData` 读取本局状态。这些字段由开场、计时和回合结束流程维护；手动写入胜场或回合字段不会自动执行对应的结算流程。

源码类：`net.play5d.game.bvn.data.GameRunDataVO`

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var round1:int = GameCtrl.I.gameRunData.round;
var p1Wins1:int = GameCtrl.I.gameRunData.p1Wins;
```

### 属性与方法

> ###### p1FighterGroup

类型：`GameRunFighterGroup`

说明：P1 的当前人物、辅助及小队运行数据（默认为new GameRunFighterGroup()）

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var p1FighterGroup1 = GameCtrl.I.gameRunData.p1FighterGroup;
```

> ###### p2FighterGroup

类型：`GameRunFighterGroup`

说明：P2 的当前人物、辅助及小队运行数据（默认为new GameRunFighterGroup()）

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var p2FighterGroup1 = GameCtrl.I.gameRunData.p2FighterGroup;
```

> ###### map

类型：`MapMain`

说明：本局地图

<div class="version-note">

3.0 类型为 MapMain，后续版本存在类型变更

3.5改动：字段类型由 MapMain 改为地图数据 MapVO

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var map1 = GameCtrl.I.gameRunData.map;
```

> ###### p1Wins

类型：`int`

说明：P1 已获胜回合数，初始 0

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var p1Wins1:int = GameCtrl.I.gameRunData.p1Wins;
```

> ###### p2Wins

类型：`int`

说明：P2 已获胜回合数，初始 0

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var p2Wins1:int = GameCtrl.I.gameRunData.p2Wins;
```

> ###### lastWinnerTeam

类型：`TeamVO`

说明：上一回合胜者小队

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var lastWinnerTeam1 = GameCtrl.I.gameRunData.lastWinnerTeam;
```

> ###### lastWinner

类型：[`FighterMain`](zh-cn/core-object-classes/FighterMain)

说明：上一回合胜者人物

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var lastWinner1 = GameCtrl.I.gameRunData.lastWinner;
```

<span id="lastloser"></span>

> ###### 3.8开发增加 lastLoser

类型：[`FighterMain`](zh-cn/core-object-classes/FighterMain)

说明：上一回合败者人物主体

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var lastLoser1 = GameCtrl.I.gameRunData.lastLoser;
```

> ###### lastWinnerHp

类型：`int`

说明：上一回合胜者剩余血量记录（默认为1000）

> ###### lastLoserData

类型：`FighterVO`

说明：上一回合败者的 FighterVO 数据

> ###### lastLoserQi

类型：`int`

说明：上一回合败者剩余气量（默认为0）

> ###### round

类型：`int`

说明：当前回合编号，初始 1

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var round1:int = GameCtrl.I.gameRunData.round;
```

> ###### gameTime

类型：`int`

说明：本回合剩余时间，由引擎计时流程维护

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var gameTime1:int = GameCtrl.I.gameRunData.gameTime;
```

> ###### gameTimeMax

类型：`int`

说明：本回合时间上限，从配置的 fightTime 取得

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var gameTimeMax1:int = GameCtrl.I.gameRunData.gameTimeMax;
```

> ###### isTimerOver

类型：`Boolean`

说明：是否已到回合时间上限

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var isTimerOver1:Boolean = GameCtrl.I.gameRunData.isTimerOver;
```

> ###### isDrawGame

类型：`Boolean`

说明：本回合是否为平局

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var isDrawGame1:Boolean = GameCtrl.I.gameRunData.isDrawGame;
```

> ###### getWins

传入参数：`param1:FighterMain`

返回类型：`int`

说明：根据人物的小队编号取得对应胜场数；无法匹配时返回 0

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var fighter1 = GameCtrl.I.gameRunData.p1FighterGroup.currentFighter;
var wins1:int = GameCtrl.I.gameRunData.getWins(fighter1);
```

> ###### setAllowLoseHP

传入参数：`param1:Boolean`

返回类型：`void`

说明：设置双方当前人物的 isAllowLoseHP，需保证双方人物已经建立

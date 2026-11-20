# 游戏控制器

通过 GameCtrl.I 访问当前战斗的场景、小队及运行数据。下方示例中的 gameCtrl1 使用以下方式取得，访问战斗对象时应保证战斗场景已经建立。

```actionscript
import flash.utils.getDefinitionByName;

var gameCtrl1 = getDefinitionByName("net.play5d.game.bvn.ctrl.game_ctrls::GameCtrl").I;
```

### 属性

> ###### I

类型：[`GameCtrl`](zh-cn/base-tool-classes/GameCtrl)

说明：游戏控制器的静态单例（只读），通过 GameCtrl.I 访问

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.game_ctrls.GameCtrl;

var gameCtrl1 = GameCtrl.I;
```

> ###### gameState

类型：[`GameState`](zh-cn/base-tool-classes/GameState)

说明：当前战斗场景，可通过它访问地图、摄像机及场内游戏对象

<div class="version-note">

3.8开发改动：类型改为 net.play5d.game.bvn.stage.GameStage，不再使用旧的 GameState 类。调用场景方法时需核对目标版本，旧 GameState 的接口不保证全部适用于 GameStage

</div>

使用示例：

- [游戏场景](zh-cn/base-tool-classes/GameState)
- [游戏摄像机](zh-cn/base-tool-classes/GameCamera)

```actionscript
var camera1 = gameCtrl1.gameState.camera;
var map1 = gameCtrl1.gameState.getMap();
```

> ###### gameRunData

类型：[`GameRunDataVO`](zh-cn/base-tool-classes/GameRunDataVO)

说明：当前对局的运行数据，包含双方小队、胜场、回合及计时等信息（只读）

使用示例：

- [对局数据](zh-cn/base-tool-classes/GameRunDataVO)

```actionscript
var round1:int = gameCtrl1.gameRunData.round;
var p1Wins1:int = gameCtrl1.gameRunData.p1Wins;
```

<span id="slowrate"></span>

> ###### 3.5增加 slowRate

类型：`Number`

说明：慢放倍率记录，初始为 0；调用 slow(rate) 时记录传入倍率，slowResume() 将其恢复为 0

使用示例：

```actionscript
var slowRate1:Number = gameCtrl1.slowRate;
```

<span id="isgamepause"></span>

> ###### 3.8开发增加 isGamePause

类型：`Boolean`

说明：战斗演出冻结标志（只读），由 pause(false) 和 resume(false) 切换。此值不等同于菜单暂停状态；判断菜单暂停时使用 isMenuPause

使用示例：

```actionscript
var isGamePause1:Boolean = gameCtrl1.isGamePause;
```

<span id="ismenupause"></span>

> ###### 3.8开发增加 isMenuPause

类型：`Boolean`

说明：是否处于菜单暂停状态（只读），不用于判断必杀黑屏等演出冻结

使用示例：

```actionscript
var isMenuPause1:Boolean = gameCtrl1.isMenuPause;
```

### 方法

> ###### getAttacker

传入参数：`name:String, teamId:int`

返回类型：[`FighterAttacker`](zh-cn/core-object-classes/FighterAttacker)

说明：按攻击对象名称和小队编号查找场内攻击对象，未找到时返回null；通常小队编号1为P1，2为P2。同名对象有多个时返回最早匹配的一个

<div class="version-note">

3.5改动：无双模式下改为从无双控制器维护的攻击对象列表查找；其他模式仍使用通常战斗列表

</div>

使用示例：

- [攻击对象主体](zh-cn/core-object-classes/FighterAttacker)

```actionscript
var attacker1 = gameCtrl1.getAttacker("bsmc", 1);
if (attacker1 != null)
{
    attacker1.setVelocity(4, 0);
}
```

> ###### getEnemyTeam

传入参数：`sprite:IGameSprite`

返回类型：`TeamVO`

说明：根据传入游戏对象的小队取得敌方小队。对象没有小队，或其小队编号不是1、2时返回null；传入对象本身不能为null

使用示例：

```actionscript
var fighter1 = gameCtrl1.gameRunData.p1FighterGroup.currentFighter;
if (fighter1 != null)
{
    var enemyTeam1 = gameCtrl1.getEnemyTeam(fighter1);
}
```

> ###### setRenderHit

传入参数：`enabled:Boolean`

返回类型：`void`

说明：开启或关闭主战斗逻辑的攻击命中检测，自定义演出结束时按需恢复检测

<div class="version-note">

3.8开发改动：pause(false) 会关闭命中检测，resume(false) 会重新开启；演出中自行设置的开关可能被这两个方法覆盖

</div>

使用示例：

```actionscript
gameCtrl1.setRenderHit(false); // 关闭命中检测
// 演出结束时恢复
gameCtrl1.setRenderHit(true);
```

> ###### addGameSprite

传入参数：`teamId:int, sprite:IGameSprite`<br>
传入参数（3.3）：`teamId:int, sprite:IGameSprite, index:int = -1`

返回类型：`void`

说明：将游戏对象加入战斗场景及指定小队，同时设置对象的team；人物主体还会更新其敌方小队列表。参数1为小队编号，通常1为P1、2为P2，参数2为已创建的游戏对象

<div class="version-note">

3.3改动：增加可选的显示层索引参数。index为-1时按通常方式添加，其他值传给场景的addGameSpriteAt；此索引不改变小队内的排序

</div>

> ###### removeGameSprite

传入参数：`sprite:IGameSprite`<br>
传入参数（3.3）：`sprite:IGameSprite, isDispose:Boolean = false`

返回类型：`void`

说明：将游戏对象移出战斗场景及所在小队，并调用对象的destory方法

<div class="version-note">

3.0中，续关保留人物gameRunData.continueLoser不会在此处销毁

3.3改动：增加isDispose参数，默认false，传给对象的destory(isDispose)。false不表示仅隐藏或暂时移除对象，仍会执行其销毁流程；具体资源清理由对象自身实现决定。基元游戏对象在true时还会停止并清除主MovieClip引用

</div>

> ###### pause

传入参数：`pauseUI:Boolean = false`

返回类型：`void`

说明：暂停战斗逻辑。pauseUI为false时用于必杀黑屏等演出冻结，为true时同时进入菜单暂停并更新暂停UI。应与对应类型的resume调用配对

<div class="version-note">

3.3改动：战斗尚未运行时不处理；开场或结束演出期间请求菜单暂停时，交由相关流程延后处理，并在实际菜单暂停时派发PAUSE_GAME事件

3.8开发改动：pause(false)改为设置isGamePause并关闭命中检测，不再直接关闭通常的全局战斗更新；pause(true)仍走菜单暂停流程。两种暂停状态分别记录，不能将isGamePause作为菜单暂停标志

</div>

使用示例：

```actionscript
gameCtrl1.pause(); // 演出冻结
// 演出结束时使用 gameCtrl.resume() 恢复
```

> ###### resume

传入参数：`resumeUI:Boolean = false`

返回类型：`void`

说明：恢复战斗逻辑。resumeUI为false时恢复演出冻结，为true时同时恢复暂停UI，应与pause使用相同类型的参数

<div class="version-note">

3.3改动：战斗尚未运行时不处理，实际退出菜单暂停时派发RESUME_GAME事件

3.6改动：仅在暂停UI的resume()返回true时清除菜单暂停标记并派发RESUME_GAME事件

3.8开发改动：resume(false)清除isGamePause并重新开启命中检测；退出菜单暂停后，非练习、非无双模式还会执行恢复倒计时

</div>

使用示例：

```actionscript
gameCtrl1.resume(); // 恢复演出冻结
```

> ###### slow

传入参数：`rate:Number`

返回类型：`void`

说明：按倍率同时调整人物动画、战斗逻辑速度及摄像机缓动。倍率需大于 0，大于 1 时慢放，例如 2 表示使用通常的一半速度；持续生效，调用 slowResume 恢复

<div class="version-note">

3.5改动：同时将slowRate记录为传入倍率

</div>

使用示例：

```actionscript
gameCtrl1.slow(2);
// 慢放结束时调用 gameCtrl.slowResume()
```

> ###### slowResume

传入参数：无

返回类型：`void`

说明：恢复默认人物动画速度、战斗逻辑速度和摄像机缓动，不负责解除菜单暂停或演出冻结

<div class="version-note">

3.5改动：同时将slowRate恢复为0

</div>

使用示例：

```actionscript
gameCtrl1.slowResume();
```

> ###### setAnimateFPS

传入参数：`fps:Number`

返回类型：`void`

说明：设置人物动画的目标帧率，不改变战斗逻辑的更新帧率。传入值需大于0

<div class="version-note">

3.3改动：改为私有方法，3.3、3.5、3.6及3.8开发均不能从角色脚本直接调用。需要整体慢放时使用slow及slowResume，不能照搬下方的3.0调用

</div>

使用示例：

```actionscript
// 仅适用于3.0
gameCtrl1.setAnimateFPS(15);
// 恢复通常动画帧率
gameCtrl1.setAnimateFPS(30);
```

<span id="getmosouctrl"></span>

> ###### 3.5增加 getMosouCtrl

传入参数：无

返回类型：`MosouCtrl`

说明：取得当前无双模式控制器；通常对战中未创建无双控制器时返回null

使用示例：

```actionscript
var mosouCtrl1 = gameCtrl1.getMosouCtrl();
```

<span id="getteammap"></span>

> ###### 3.5增加 getTeamMap

传入参数：无

返回类型：`TeamMap`

说明：取得当前小队映射，可按小队编号访问TeamVO。返回战斗当前使用的对象引用

使用示例：

```actionscript
var teamMap1 = gameCtrl1.getTeamMap();
var p1Team1 = teamMap1.getTeam(1);
```

<span id="getfighterbydata"></span>

> ###### 3.5增加 getFighterByData

传入参数：`data:FighterVO`

返回类型：[`FighterMain`](zh-cn/core-object-classes/FighterMain)

说明：按同一个 FighterVO 对象引用查找场内人物，未找到时返回 null

使用示例：

```actionscript
var current1 = gameCtrl1.gameRunData.p1FighterGroup.currentFighter;
if (current1 != null)
{
    var fighter1 = gameCtrl1.getFighterByData(current1.data);
}
```

<span id="getassister"></span>

> ###### 3.8开发增加 getAssister

传入参数：`teamId:int`

返回类型：[`Assister`](zh-cn/core-object-classes/Assisiter)

说明：按小队编号取得当前场内的辅助人物主体。未登场、未找到或处于无双模式时返回null；通常1为P1、2为P2

使用示例：

- [辅助人物主体](zh-cn/core-object-classes/Assisiter)

```actionscript
var assister1 = gameCtrl1.getAssister(1);
if (assister1 != null)
{
    var assisterCtrl1 = assister1.getCtrler();
}
```

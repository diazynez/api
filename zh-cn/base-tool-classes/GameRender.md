# 游戏渲染器

静态全局更新入口。注册的函数不接收参数；移除时必须传入同一个函数引用。角色退出后应移除自己添加的全局回调。

源码类：`net.play5d.game.bvn.ctrl.GameRender`

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.GameRender;

function updateCustomEffect():void
{
    // 每次全局更新时执行
}
GameRender.add(updateCustomEffect);
// 效果结束或角色退出时执行
GameRender.remove(updateCustomEffect);
```

### 属性与方法

> ###### isRender

类型：`Boolean`

说明：全局渲染更新开关（静态），默认 true

<span id="addbefore"></span>

> ###### 3.8开发增加 addBefore

调用方式：静态方法

传入参数：`func:Function`

返回类型：`void`

说明：注册在通常全局回调之前执行的函数

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.GameRender;

function updateCustomEffect1():void
{
    // 自定义逐帧逻辑
}
GameRender.addBefore(updateCustomEffect1);
```

> ###### add

调用方式：静态方法

传入参数：`param1:Function`<br>
传入参数（3.3）：`param1:Function, param2:* = null`

返回类型：`void`

说明：注册无参数的全局逐帧函数，同一列表不会重复注册同一函数

<div class="version-note">

3.3改动：增加可选 owner，将回调按所属对象分组；省略时使用公共分组

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.GameRender;

function updateCustomEffect1():void
{
    // 自定义逐帧逻辑
}
GameRender.add(updateCustomEffect1);
```

<span id="addafter"></span>

> ###### 3.8开发增加 addAfter

调用方式：静态方法

传入参数：`func:Function`

返回类型：`void`

说明：注册在通常全局回调之后执行的函数

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.GameRender;

function updateCustomEffect1():void
{
    // 自定义逐帧逻辑
}
GameRender.addAfter(updateCustomEffect1);
```

<span id="removebefore"></span>

> ###### 3.8开发增加 removeBefore

调用方式：静态方法

传入参数：`func:Function`

返回类型：`void`

说明：移除通过 addBefore 登记的函数

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.GameRender;

function updateCustomEffect1():void
{
    // 自定义逐帧逻辑
}
GameRender.addBefore(updateCustomEffect1);

// 效果结束或角色退出时执行
GameRender.removeBefore(updateCustomEffect1);
```

> ###### remove

调用方式：静态方法

传入参数：`param1:Function`<br>
传入参数（3.3）：`param1:Function, param2:* = null`

返回类型：`void`

说明：移除注册过的全局逐帧函数，需传入相同的函数引用

<div class="version-note">

3.3改动：增加可选 owner，移除时必须与 add 使用同一分组

</div>

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.GameRender;

function updateCustomEffect1():void
{
    // 自定义逐帧逻辑
}
GameRender.add(updateCustomEffect1);

// 效果结束或角色退出时执行
GameRender.remove(updateCustomEffect1);
```

<span id="removeafter"></span>

> ###### 3.8开发增加 removeAfter

调用方式：静态方法

传入参数：`func:Function`

返回类型：`void`

说明：移除通过 addAfter 登记的函数

使用示例：

```actionscript
import net.play5d.game.bvn.ctrl.GameRender;

function updateCustomEffect1():void
{
    // 自定义逐帧逻辑
}
GameRender.addAfter(updateCustomEffect1);

// 效果结束或角色退出时执行
GameRender.removeAfter(updateCustomEffect1);
```

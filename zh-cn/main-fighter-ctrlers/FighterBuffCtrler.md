# 3.3增加 Buff控制器

### 获取控制器

```actionscript
//主人物使用下方代码：
var buffCtrl = $self_main.getBuffCtrl();
//用于实现功能，若报错请删除
function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}
```
```actionscript
//辅助人物使用下方代码：
var buffCtrl = $assisterCtrler.getOwner().getBuffCtrl();        //主人的控制器
var buffCtrl = $assisterCtrler.getTarget().getBuffCtrl();        //对方的控制器
```

### 方法

<span id="speedup"></span>

> ###### 3.3增加 speedUp

传入参数：`upVal:Number = 0, hold:Number = 5`

返回类型：`void`

说明：增加移动速度，upVal 为增加的速度值，hold 为持续秒数

使用示例：

```actionscript
buffCtrl.speedUp(0.3, 15);
```

<span id="attackup"></span>

> ###### 3.3增加 attackUp

传入参数：`rateVal:Number = 0, hold:Number = 5`

返回类型：`void`

说明：增加攻击倍率，rateVal 为倍率增量，hold 为持续秒数

使用示例：

```actionscript
buffCtrl.attackUp(0.3, 15);
```

<span id="defenseup"></span>

> ###### 3.3增加 defenseUp

传入参数：`upVal:Number = 0, hold:Number = 5`

返回类型：`void`

说明：增加防御倍率，upVal 为倍率增量，hold 为持续秒数

使用示例：

```actionscript
buffCtrl.defenseUp(0.3, 15);
```

<span id="speeddown"></span>

> ###### 3.3增加 speedDown

传入参数：`downVal:Number = 0, hold:Number = 5`<br>
传入参数（3.8开发）：`downVal:Number = 0, hold:Number = 5, showEffect:Boolean = true`

返回类型：`void`

说明：降低移动速度，downVal 为减少的速度值，hold 为持续秒数

<div class="version-note">

3.8开发改动：增加 showEffect 参数，默认 true；设为 false 时应用减益但不播放对应效果

</div>

使用示例：

```actionscript
buffCtrl.speedDown(0.3, 15);
```

<span id="attackdown"></span>

> ###### 3.3增加 attackDown

传入参数：`rateVal:Number = 0, hold:Number = 5`<br>
传入参数（3.8开发）：`rateVal:Number = 0, hold:Number = 5, showEffect:Boolean = true`

返回类型：`void`

说明：降低攻击倍率，rateVal 为倍率减少量，hold 为持续秒数

<div class="version-note">

3.8开发改动：增加 showEffect 参数，默认 true；设为 false 时应用减益但不播放对应效果

</div>

使用示例：

```actionscript
buffCtrl.attackDown(0.3, 15);
```

<span id="defensedown"></span>

> ###### 3.3增加 defenseDown

传入参数：`downVal:Number = 0, hold:Number = 5`<br>
传入参数（3.8开发）：`downVal:Number = 0, hold:Number = 5, showEffect:Boolean = true`

返回类型：`void`

说明：降低防御值，downVal 为减少的防御值，hold 为持续秒数

<div class="version-note">

3.8开发改动：增加 showEffect 参数，默认 true；设为 false 时应用减益但不播放对应效果

</div>

使用示例：

```actionscript
buffCtrl.defenseDown(0.3, 15);
```

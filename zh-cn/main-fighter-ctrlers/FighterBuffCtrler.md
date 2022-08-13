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

> ###### speedUp

传入参数：upVal:Number = 0, hold:Number = 5

返回类型：void

说明：设置速度增加（参数1：增加倍数，参数2：持续时长）

使用示例：

```actionscript
buffCtrl.speedUp(0.3,15);
```

> ###### attackUp

传入参数：rateVal:Number = 0, hold:Number = 5

返回类型：void

说明：设置攻击力增加（参数1：增加倍数，参数2：持续时长）

使用示例：

```actionscript
buffCtrl.attackUp(0.3,15);
```

> ###### defenseUp

传入参数：upVal:Number = 0, hold:Number = 5

返回类型：void

说明：设置防御力增加（参数1：增加倍数，参数2：持续时长）

使用示例：

```actionscript
buffCtrl.defenseUp(0.3,15);
```

> ###### speedDown

传入参数：downVal:Number = 0, hold:Number = 5

返回类型：void

说明：设置速度减少（参数1：减少倍数，参数2：持续时长）

使用示例：

```actionscript
buffCtrl.speedDown(0.3,15);
```

> ###### attackDown

传入参数：rateVal:Number = 0, hold:Number = 5

返回类型：void

说明：设置攻击力减少（参数1：减少倍数，参数2：持续时长）

使用示例：

```actionscript
buffCtrl.attackDown(0.3,15);
```

> ###### defenseDown

传入参数：downVal:Number = 0, hold:Number = 5

返回类型：void

说明：设置防御力减少（参数1：减少倍数，参数2：持续时长）s

使用示例：

```actionscript
buffCtrl.defenseDown(0.3,15);
```
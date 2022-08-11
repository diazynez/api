# 人物主体

### 获取实例

```actionscript
//同一对象内只需要写一次，若报错请删除
//主人物使用下方代码：
function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}
```

```actionscript
//辅助人物、攻击对象、飞行道具使用下方代码：
function get $self_main(): * {for each(var i: * in parent.parent.parent.getGameSprites()) if (i.getDisplay() == this) return i;}
```

### 属性

说明：设置或调整人物的默认属性

> ###### qi

类型：Number

说明：人物的气量值（默认为0）

使用示例：

```actionscript
$self_main.qi = 300;       //设置人物当前气量值为300
var qi1:Number = $self_main.qi;     //将当前气量值赋值到变量qi1
```

> ###### qiMax

类型：Number

说明：人物的气量最大值（默认为300）

使用示例：

```actionscript
$self_main.qiMax = 300;       //设置人物当前气量最大值为300
var qiMax1:Number = $self_main.qiMax;     //将当前气量最大值赋值到变量qiMax1
```

###### 

### 方法

> ###### speedUp

传入参数：upVal:Number = 0, hold:Number = 5

返回类型：void

说明：设置速度增加（参数1：增加倍数，参数2：持续时长）

使用示例：

```actionscript
buffCtrl.speedUp(0.3,15);
```


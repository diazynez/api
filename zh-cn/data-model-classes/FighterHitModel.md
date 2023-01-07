# 攻击模型

### 方法

> ###### clear

传入参数：无

返回类型：void

说明：清空攻击模型中存储的攻击值对象

使用示例：

```actionscript
parent.$fighter_ctrler.hitModel.clear();
```

> ###### getHitVO

传入参数：id:String

返回类型：HitVO

说明：根据ID获取攻击值对象

使用示例：

```actionscript
parent.$fighter_ctrler.hitModel.getHitVO("k1").power = 50;
```

> ###### 3.5增加 getAll

传入参数：无

返回类型：Object

说明：获取攻击模型中存储的所有攻击值对象

使用示例：

```actionscript
var allHitVO: Object = parent.$fighter_ctrler.hitModel.getAll();
```

> ###### getHitVOLike

传入参数：likeId:String

返回类型：Vector.\<HitVO\>

说明：获取所有ID中包含指定字符串的攻击值对象

使用示例：

```actionscript
var kj1HitVOs = parent.$fighter_ctrler.hitModel.getHitVOLike("kj1");
```

> ###### getHitVOByDisplayName

传入参数：name:String

返回类型：HitVO

说明：根据攻击面元件名称获取攻击值对象

使用示例：

```actionscript
parent.$fighter_ctrler.hitModel.getHitVOByDisplayName("k1atm").power = 50;
```

> ###### addHitVO

传入参数：id:String, obj:Object

返回类型：void

说明：向攻击模型中添加攻击值对象（[Fighter控制器的defineAction函数](zh-cn/main-fighter-ctrlers/FighterCtrler?id=defineaction)即调用了此函数）

使用示例：

```actionscript
parent.$fighter_ctrler.hitModel.addHitVO("tk" ,{power:30 , hitType:1 , hitx:2 , hity:6 , hurtTime:300 , hurtType:0 , isBreakDef:false});
```

> ###### setPowerRate

传入参数：v:Number

返回类型：void

说明：设置所有攻击值对象的攻击力倍数

使用示例：

```actionscript
parent.$fighter_ctrler.hitModel.setPowerRate(2);
```

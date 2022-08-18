# Effect控制器

### 方法

> ###### shake

传入参数：powX:Number = 0 , powY:Number = 3 , time:Number = 0

返回类型：void

说明：设置震动（参数1：水平振幅，参数2：竖直振幅，参数3：持续时长）

使用示例：

```actionscript
parent.$effect_ctrler.shake(5,5);
```

> ###### startShake

传入参数：powX:Number = 0 , powY:Number = 3

返回类型：void

说明：开始持续震动（参数1：水平振幅，参数2：竖直振幅）

使用示例：

```actionscript
parent.$effect_ctrler.startShake(5,5);
```

> ###### endShake

传入参数：无

返回类型：void

说明：结束震动

使用示例：

```actionscript
parent.$effect_ctrler.endShake();
```

> ###### dash

传入参数：无

返回类型：void

说明：设置冲刺特效

使用示例：

```actionscript
parent.$effect_ctrler.dash();
```

> ###### walk

传入参数：无

返回类型：void

说明：设置走特效

使用示例：

```actionscript
parent.$effect_ctrler.walk();
```

> ###### jump

传入参数：无

返回类型：void

说明：设置跳特效

使用示例：

```actionscript
parent.$effect_ctrler.jump();
```

> ###### jumpAir

传入参数：无

返回类型：void

说明：设置空中跳特效

使用示例：

```actionscript
parent.$effect_ctrler.jumpAir();
```

> ###### touchFloor

传入参数：无

返回类型：void

说明：设置落地特效

使用示例：

```actionscript
parent.$effect_ctrler.touchFloor();
```

> ###### hitFloor

传入参数：type:int

返回类型：void

说明：设置击地特效（参数：0/1/2可选）

使用示例：

```actionscript
parent.$effect_ctrler.hitFloor();
```

> ###### energyExplode

传入参数：无

返回类型：void

说明：设置灵压爆发特效

使用示例：

```actionscript
parent.$effect_ctrler.energyExplode();
```

> ###### replaceSkill

传入参数：无

返回类型：void

说明：设置替身术特效

使用示例：

```actionscript
parent.$effect_ctrler.replaceSkill();
```

> ###### ghostStep

传入参数：无

返回类型：void

说明：设置幽步特效

使用示例：

```actionscript
parent.$effect_ctrler.ghostStep();
```

> ###### endGhostStep

传入参数：无

返回类型：void

说明：结束残影特效

使用示例：

```actionscript
parent.$effect_ctrler.endGhostStep();
```

> ###### shadow

传入参数：r:int = 0, g:int = 0, b:int = 0

返回类型：void

说明：设置残影特效（颜色用RGB表示）

使用示例：

```actionscript
parent.$effect_ctrler.shadow(255,255,255);
```

> ###### endShadow

传入参数：无

返回类型：void

说明：结束残影特效

使用示例：

```actionscript
parent.$effect_ctrler.endShadow();
```

> ###### slowDown

传入参数：time:Number

返回类型：void

说明：设置慢动作特效（参数：慢动作持续时长）

使用示例：

```actionscript
parent.$effect_ctrler.slowDown(0.5);
```

> ###### shine

传入参数：color:uint = 16777215（3.3改动：color:uint = 16777215 , alpha:Number = 0.2）

返回类型：void

说明：设置闪光特效（参数1：颜色值，参数2：透明度）

使用示例：

```actionscript
parent.$effect_ctrler.shine(0xffffff);
```

> ###### FVO专用 specialStep

传入参数：无

返回类型：void

说明：设置特殊步特效

使用示例：

```actionscript
parent.$effect_ctrler.specialStep();
```

> ###### bisha

传入参数：isSuper:Boolean=false, face:String=null

返回类型：void

说明：设置必杀黑幕特效（参数1：是否拉近镜头，参数2：必杀特写名称，特写需要在伤害表中定义）

使用示例：

```actionscript
parent.$effect_ctrler.bisha(false,"特写名称");
```

> ###### endBisha

传入参数：无

返回类型：void

说明：结束必杀黑幕特效

使用示例：

```actionscript
parent.$effect_ctrler.endBisha();
```

> ###### startWanKai

传入参数：face:String = null

返回类型：void

说明：设置变身黑幕特效（参数：必杀特写名称，特写需要在伤害表中定义）

使用示例：

```actionscript
parent.$effect_ctrler.startWanKai("特写名称");
```

> ###### endWanKai

传入参数：无

返回类型：void

说明：结束变身黑幕特效

使用示例：

```actionscript
parent.$effect_ctrler.endWanKai();
```

> ###### setBishaFace

传入参数：id:String , face:Class

返回类型：void

说明：定义必杀特写，第二个参数需要在库中设置链接

使用示例：

```actionscript
$effect_ctrler.setBishaFace("XX特写1",bs1face);
```

> ###### 3.3增加 startGlow

传入参数：color:uint = 16777215

返回类型：void

说明：设置钢身发光（参数：颜色值）

使用示例：

```actionscript
parent.$effect_ctrler.startGlow(0);
```

> ###### 3.3增加 endGlow

传入参数：无

返回类型：void

说明：结束钢身发光

使用示例：

```actionscript
parent.$effect_ctrler.endGlow();
```

> ###### 3.5增加 clean

传入参数：无

返回类型：void

说明：结束幽步特效、结束钢身发光、结束残影特效

使用示例：

```actionscript
parent.$effect_ctrler.clean();
```


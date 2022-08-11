# Voice控制器

### 方法

> ###### setVoice

传入参数：id:int, sounds:Array

返回类型：void

说明：设置声音（参数1：声音ID，参数2：包含一或多个声音的数组，声音需要在库中设置链接）

使用示例：

```actionscript
parent.$fighter_ctrler.getVoiceCtrl().setVoice(0,[snd1,snd2]);      //设定被打声音（随机）

/*

默认使用的特殊ID值说明
0用于被打声音
1用于被击飞声音
2用于死亡声音
*/
```

> ###### playVoice

传入参数：id:int, rate:Number = 1

返回类型：void

说明：播放声音（参数1：声音ID，ID需要设置，参数2：播放声音概率）

使用示例：

```actionscript
parent.$fighter_ctrler.getVoiceCtrl().playVoice(0,1);
```
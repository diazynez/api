# 辅助人物主体

### 属性

说明：设置或调整人物的默认属性

> ###### onRemove

类型：Function

说明：辅助人物用于移除自身的函数

使用示例：

```actionscript
$assisterCtrler.getSelf().onRemove(this);
```

> ###### data

类型：FighterVO

说明：辅助人物的角色数据

使用示例：

```actionscript
var id: String = $assisterCtrler.getSelf().data.id;       //将当前角色的ID赋值到变量id
var name: String = $assisterCtrler.getSelf().data.name;       //将当前角色的名称赋值到变量name
var comicType: int = $assisterCtrler.getSelf().data.comicType;       //将当前角色的所属阵营赋值到变量comicType
/*
FighterVO中的属性包含：id (String)、name (String)、comicType (int)、fileUrl (String)、
                      startFrame (int)、faceUrl (String)、faceBigUrl (String)、
                      faceBarUrl (String)、faceWinUrl (String)、
                      contactFriends (Array)、contactEnemys (Array)、
                      says (Array)、bgm (String)、bgmRate (Number)、isAlive (Boolean)
            方法包含：initByXML、getRandSay、clone
*/
```

> ###### isAttacking

类型：Boolean

说明：辅助人物是否处于攻击状态（用于对方AI检测）

使用示例：

```actionscript
$assisterCtrler.getSelf().isAttacking = false;
```

> ###### isAttacking

类型：String

说明：辅助人物元件名称（只读）

使用示例：

```actionscript
var name1: String = $assisterCtrler.getSelf().name;
```

### 方法

> ###### getOwner

传入参数：无

返回类型：IGameSprite

说明：获取主人的游戏对象

使用示例：

- [详细介绍](http://localhost:3000/#/zh-cn/core-object-classes/FighterMain)

```actionscript
var owner = $assisterCtrler.getSelf().getOwner();
```

未完待续，但是下一页已经写完力！

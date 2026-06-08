# About
2020年元旦，正值疫情席卷世界之前的那个冬天，我去了日本旅行两周。

旅途中，在越后的一座小镇上，我偶然走进了一个展览。那本是一次无心的相遇，却成为此行最难忘的记忆之一。展厅里几乎一片漆黑。黑暗中，一列小小的电动火车沿着环形铁轨缓缓前行。车头只有一束微弱的灯光，掠过轨道旁的森林、房舍和桥梁。随着列车移动，墙上的影子也不断拉长、收缩、交错，如同一场无声的戏剧在夜色中上演。

如今，稳定而充足的电力早已让黑暗变得罕见，人们也不太容易再体验到那种长久沉浸于夜色之中，只偶尔有一缕光芒划过眼前的感觉。但我小时候生活在中国内地的一座小镇，停电是再平常不过的事。夏夜里，整条街忽然陷入黑暗，远处的车灯、手电筒的光束，或是谁家窗前摇曳的煤油灯，都曾在黑暗中留下短暂而深刻的痕迹。那种光与影交替出现的记忆，早已沉淀在心底。

当我站在那个展览前，看着微光随着火车缓缓穿行，许多尘封已久的画面忽然被唤醒。于是，我萌生了一个念头：用3D技术，将这份关于光、黑暗与童年记忆的体验重新创造出来。

Around New Year's Day 2020 — yes, on the eve of the Covid outbreak — I traveled to Japan for two weeks. During the trip, I visited a very special exhibition in a small town in Echigo. Inside was a dark room, where a tiny electric train ran along a short stretch of track. The locomotive carried a light that shone on the forests, houses, and bridges along the way. As the train moved, the shadows on the walls shifted and danced.
With electricity so readily available now, people rarely experience that feeling of a faint light briefly sweeping through a long stretch of darkness. I lived in a small town in inland China, where power outages were frequent, and I had many chances to see scenes just like that. The setting stirred something in my memory. I want to recreate it in 3D.

## Scene Requirements

The scene should feel like standing inside a dark room beside a small electric train installation. The default camera should be placed at human eye height near one corner of the room, as if a person is standing close to the model.

Use real-world proportions where 1 scene unit represents 1 meter. The room is about 3 meters high. The track sits on the ground and forms a rounded rectangular loop roughly 2 meters by 4 meters. The locomotive is about 5 centimeters high, and the surrounding objects should be scaled relative to that train.

The locomotive carries a strong forward-facing headlamp with a wide beam, over 60 degrees of spread. The room should stay dark, but there should be enough scattered light to see the train when standing close. The main visual effect is the headlamp projecting clear silhouettes of nearby objects onto the walls; for example, when the train crosses the bridge, the bridge's X-frame structure should cast visible shadows across the room.

Objects along the route should suggest a countryside setting. Required objects include a nail-like forest, a round barn with a cone roof, and a steel cross-frame bridge inspired by the Auckland North Shore bridge. Additional countryside details can include a farmhouse, water tower, fence, and utility poles.

## Development

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run typecheck
npm run build
```

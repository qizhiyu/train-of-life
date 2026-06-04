# About
2020年元旦，对，Covid爆发前夕，我去日本旅游了两周。期间在越后的小镇上去看一个很特别的展览。里面是一个暗室，一个小小的电动火车在一段铁轨上运行。车头是一盏灯光，照在路边的森林、房子、桥梁上。火车在行进，墙上的影子也随之变幻。
现在电力供应充足，大家可能不经常会这种大段黑暗中幽光略过的感觉。以前我在12岁前，生活在中国内地小镇上，停电常常发生，有很多机会看到这种场景。这个布景触动了我的回忆。我希望用3D来重现它。 

Around New Year's Day 2020 — yes, on the eve of the Covid outbreak — I traveled to Japan for two weeks. During the trip, I visited a very special exhibition in a small town in Echigo. Inside was a dark room, where a tiny electric train ran along a short stretch of track. The locomotive carried a light that shone on the forests, houses, and bridges along the way. As the train moved, the shadows on the walls shifted and danced.
With electricity so readily available now, people rarely experience that feeling of a faint light briefly sweeping through a long stretch of darkness. Before I turned twelve, I lived in a small town in inland China, where power outages were frequent, and I had many chances to see scenes just like that. The setting stirred something in my memory. I want to recreate it in 3D.

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

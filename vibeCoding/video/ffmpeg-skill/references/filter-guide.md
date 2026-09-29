# 常用滤镜参数速查

## scale — 缩放

```bash
-vf "scale=WIDTH:HEIGHT"
```

| 参数 | 说明 |
|------|------|
| `scale=1920:1080` | 固定分辨率 |
| `scale=1280:-1` | 宽 1280，高按比例（-1 = 自动） |
| `scale=-1:720` | 高 720，宽按比例 |
| `scale=iw/2:ih/2` | 缩小到 50%（iw/ih = 输入宽高） |
| `scale=1280:720:flags=lanczos` | 使用高质量 lanczos 算法 |
| `scale=1280:720:force_original_aspect_ratio=decrease` | 保持宽高比，不足处加黑边 |

## crop — 裁切

```bash
-vf "crop=W:H:X:Y"
```

| 参数 | 说明 |
|------|------|
| `crop=1920:1080:0:0` | 从 (0,0) 裁 1920x1080 |
| `crop=iw/2:ih:iw/4:0` | 裁掉左右各 1/4 |
| `crop=iw:ih-200:0:100` | 裁掉顶部和底部各 100px |

## delogo — 去水印

```bash
-vf "delogo=x=X:y=Y:w=W:h=H"
```

| 参数 | 说明 |
|------|------|
| `delogo=x=10:y=10:w=200:h=50` | 去除 (10,10) 处 200x50 的水印 |
| `delogo=x=0:y=0:w=100:h=100:show=1` | `show=1` 显示绿色矩形框（用于定位） |

> 本质是模糊遮盖，不是 AI 消除。对半透明/复杂水印效果有限。
> 先用 `show=1` 定位水印区域，确认位置后再去掉 `show`。

## overlay — 叠加（加水印、画中画）

```bash
-vf "overlay=X:Y"
```

| 参数 | 说明 |
|------|------|
| `overlay=10:10` | 左上角偏移 10px |
| `overlay=W-w-10:10` | 右上角偏移 10px（W=主视频宽, w=叠加层宽） |
| `overlay=W-w-10:H-h-10` | 右下角偏移 10px |
| `overlay=10:H-h-10` | 左下角偏移 10px |
| `overlay=(W-w)/2:(H-h)/2` | 居中 |
| `overlay=10:10:enable='between(t,5,10)'` | 只在 5-10 秒显示 |

## drawtext — 文字叠加

```bash
-vf "drawtext=text='文字':fontsize=24:fontcolor=white:x=10:y=10"
```

| 参数 | 说明 |
|------|------|
| `text='Hello'` | 文字内容 |
| `textfile=content.txt` | 从文件读取文字（支持中文） |
| `fontsize=24` | 字号 |
| `fontcolor=white` | 颜色（名称或 `#RRGGBB`） |
| `fontcolor=white@0.5` | 半透明白色（0=全透, 1=不透明） |
| `fontfile=/path/to/font.ttf` | 指定字体文件 |
| `x=10:y=10` | 坐标 |
| `x=(w-text_w)/2:y=(h-text_h)/2` | 居中 |
| `box=1:boxcolor=black@0.5:boxborderw=5` | 文字背景框 |
| `shadowx=2:shadowy=2:shadowcolor=black@0.5` | 文字阴影 |
| `bordercolor=black:borderw=2` | 文字描边 |
| `enable='between(t,0,5)'` | 只在 0-5 秒显示 |

**中文支持**：Windows 下需指定中文字体路径：
```bash
drawtext=fontfile='C\:/Windows/Fonts/msyh.ttc':text='你好'
```

## fps — 帧率调整

```bash
-vf "fps=30"      # 固定 30fps
-vf "fps=30/1.001" # 29.97fps
```

## setpts — 调速（视频）

```bash
-vf "setpts=0.5*PTS"   # 2 倍速
-vf "setpts=2*PTS"     # 0.5 倍速（慢放）
-vf "setpts=1/60*PTS"  # 60 倍速（延时摄影）
```

## atempo — 调速（音频）

```bash
-af "atempo=2.0"        # 2 倍速
-af "atempo=0.5"        # 0.5 倍速
-af "atempo=2.0,atempo=2.0"  # 4 倍速（需链式，范围 0.5-2.0）
```

> 视频调速需配合 setpts；音频调速需配合 atempo。两者同时使用才能保持音视频同步。

## transpose — 旋转/翻转

```bash
-vf "transpose=0"  # 逆时针 90°
-vf "transpose=1"  # 顺时针 90°
-vf "transpose=2"  # 逆时针 270°
-vf "transpose=3"  # 顺时针 270°
```

## hflip / vflip — 翻转

```bash
-vf "hflip"  # 水平翻转（镜像）
-vf "vflip"  # 垂直翻转
```

## volume — 音量

```bash
-af "volume=2.0"   # 音量翻倍（线性）
-af "volume=3dB"   # 增加 3dB
-af "volume=-6dB"  # 减少 6dB
```

# 水印类命令模板

## 去水印（delogo）

用模糊遮盖固定区域的水印。先用 `show=1` 定位，再正式处理。

### 第 1 步：定位水印

```bash
# show=1 会在画面中显示绿色方框，帮助确认坐标和尺寸
ffmpeg -i input.mp4 -vf "delogo=x=10:y=10:w=200:h=50:show=1" -t 5 preview.mp4
```

### 第 2 步：去除水印

```bash
ffmpeg -i input.mp4 -vf "delogo=x=10:y=10:w=200:h=50" -c:a copy output.mp4
```

### 去四角水印（同时多个 delogo）

```bash
ffmpeg -i input.mp4 -vf "delogo=x=10:y=10:w=180:h=60,delogo=x=W-190:y=10:w=180:h=60,delogo=x=10:y=H-70:w=180:h=60,delogo=x=W-190:y=H-70:w=180:h=60" -c:a copy output.mp4
```

> 注意：`W` 和 `H` 不能用变量，需替换为实际值。

### 局限性

- 只对固定位置、纯色/半透明水印有效
- 不能还原被遮挡的原画面
- 复杂图案水印效果差
- 动态水印基本无效

## 图片水印（overlay）

```bash
# 右下角添加 PNG 水印
ffmpeg -i input.mp4 -i watermark.png -filter_complex "overlay=W-w-10:H-h-10" output.mp4

# 左上角，缩放水印到 100px 宽
ffmpeg -i input.mp4 -i watermark.png -filter_complex "[1:v]scale=100:-1[wm];[0:v][wm]overlay=10:10" output.mp4

# 半透明水印
ffmpeg -i input.mp4 -i watermark.png -filter_complex "[1:v]format=rgba,colorchannelmixer=aa=0.3[wm];[0:v][wm]overlay=W-w-10:H-h-10" output.mp4

# 居中水印
ffmpeg -i input.mp4 -i watermark.png -filter_complex "overlay=(W-w)/2:(H-h)/2" output.mp4
```

## 文字水印（drawtext）

```bash
# 右下角白色文字
ffmpeg -i input.mp4 -vf "drawtext=text='© 2024 MyCompany':fontsize=24:fontcolor=white@0.7:x=W-tw-10:y=H-th-10" output.mp4

# 顶部居中半透明背景
ffmpeg -i input.mp4 -vf "drawtext=text='SAMPLE':fontsize=48:fontcolor=white@0.5:x=(W-tw)/2:y=(H-th)/2:box=1:boxcolor=black@0.3:boxborderw=20" output.mp4

# 时间戳水印（动态）
ffmpeg -i input.mp4 -vf "drawtext=text='%{pts\:hms}':fontsize=24:fontcolor=white:x=10:y=10:box=1:boxcolor=black@0.5" output.mp4

# 时间范围水印（带阴影）
ffmpeg -i input.mp4 -vf "drawtext=text='MyVideo':fontsize=32:fontcolor=white:x=10:y=10:shadowx=2:shadowy=2:shadowcolor=black@0.5" output.mp4
```

## 动态水印（移动水印）

```bash
# 水印从左上角移动到右下角
ffmpeg -i input.mp4 -i watermark.png -filter_complex "overlay='W-t*W/T':'H-t*H/T'" output.mp4

# 水印右上角周期性上下移动
ffmpeg -i input.mp4 -i watermark.png -filter_complex "overlay=W-w-10:'10+sin(2*PI*t/5)*50'" output.mp4
```

## 去水印 + 加水印组合

```bash
ffmpeg -i input.mp4 -vf "delogo=x=10:y=10:w=200:h=50,drawtext=text='New Watermark':fontsize=24:fontcolor=white@0.7:x=W-tw-10:y=10" output.mp4
```

> 水印 PNG 最好用带透明通道的 RGBA 格式，否则背景不透明。

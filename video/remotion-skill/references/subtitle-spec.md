# script.json 格式规范

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `fps` | number | 视频帧率，固定 30 |
| `durationInFrames` | number | 总帧数，等于最后一段 endFrame |
| `canvas.width` | number | 画布宽度，9x16 为 1080，16x9 为 1920 |
| `canvas.height` | number | 画布高度，9x16 为 1920，16x9 为 1080 |
| `segments` | array | 字幕段落数组 |
| `segments[].text` | string | 单段文案 |
| `segments[].startFrame` | number | 开始帧（含） |
| `segments[].endFrame` | number | 结束帧（不含） |

## 分段规则

- 按中文句号 `。`、感叹号 `！`、问号 `？`、换行符分割
- 每段默认 3 秒（90 帧 @ 30fps）
- 允许用户手动调整时长

## 校验

- `startFrame` 必须小于 `endFrame`
- 段落必须连续：第 N 段 `endFrame` 等于第 N+1 段 `startFrame`
- `durationInFrames` 必须等于最后一段 `endFrame`

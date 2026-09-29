# Cute 插画风格规范

适合公众号配图、小红书、知识付费课程。

## 颜色

```
背景:       #fff8f3
容器背景:   #fff0e8
容器边框:   #f4d7c4
节点填充:   #ffffff
节点边框:   #f4c2c2
主文字:     #5c4b51
副文字:     #9d8a8f
主流程箭头: #ff9aa2
迭代箭头:   #b5b9ff
投影:       rgba(255, 154, 162, 0.18)
```

## 字体

```
font-family: 'Nunito', 'Quicksand', 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

## 节点尺寸

- 节点默认宽度 230px，高度 70px
- 图标圆形背景直径 32px，半径 16px，圆心位于节点左侧 28px 处
- 标题 font-size: 15px，font-weight: 600
- 副标题 font-size: 12px

## 节点样式

- 胶囊形圆角矩形，rx=16, ry=16
- 节点下方加柔边投影：filter="drop-shadow(0 4px 6px rgba(255,154,162,0.18))"

## 图标

- 图标本体默认使用对应语义描边色
- 图标在圆形背景中居中

## 图标背景色

| 语义 | 填充 | 描边 |
|------|------|------|
| 用户/输入 | #ffe9ec | #ff9aa2 |
| AI/思考 | #e6e6fa | #b5b9ff |
| 代码/生成 | #e0f7fa | #80deea |
| 运行/预览 | #fff9c4 | #fff176 |
| 检查/验收 | #e8f5e9 | #a5d6a7 |
| 循环/反馈 | #fce4ec | #f48fb1 |
| 部署/上线 | #e3f2fd | #90caf9 |

## 箭头 marker

- markerWidth="10"，markerHeight="7"，refX="9"，refY="3.5"
- 主流程 marker 填充 `#ff9aa2`
- 迭代 marker 填充 `#b5b9ff`

## 箭头

- 主流程：实线，stroke-width=3，粉色
- 迭代/反馈：虚线，stroke-dasharray="6,4"，淡紫色
- marker-end 使用对应颜色箭头

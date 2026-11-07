// vue-chart-skill 核心类型定义
// 所有图表组件共享的类型体系

// ===================== 通用数据类型 =====================

/** 单个数据点 */
export interface DataPoint {
  name: string;
  value: number;
  /** 自定义颜色（覆盖系列色） */
  color?: string;
  /** 附加数据（tooltip 回调可用） */
  extra?: Record<string, unknown>;
}

/** 系列数据 */
export interface Series {
  name: string;
  data: number[];
  /** 系列颜色（不传则自动分配） */
  color?: string;
  /** 折线样式 */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** 线宽 */
  lineWidth?: number;
  /** 是否平滑曲线 */
  smooth?: boolean;
  /** 是否显示面积填充 */
  area?: boolean;
  /** 面积填充透明度（0-1） */
  areaOpacity?: number;
  /** 是否显示数据点 */
  showDot?: boolean;
  /** 数据点半径 */
  dotRadius?: number;
  /** 柱状图堆叠组 */
  stack?: string;
  /** y 轴索引（双轴用） */
  yAxisIndex?: number;
}

// ===================== 坐标轴 =====================

export interface AxisLabel {
  show?: boolean;
  /** 格式化函数 */
  formatter?: (value: number | string, index: number) => string;
  color?: string;
  fontSize?: number;
  /** 旋转角度（度） */
  rotate?: number;
}

export interface AxisLine {
  show?: boolean;
  color?: string;
  width?: number;
}

export interface AxisTick {
  show?: boolean;
  color?: string;
  length?: number;
}

export interface SplitLine {
  show?: boolean;
  color?: string;
  /** 虚线 [线长, 间距] */
  dash?: [number, number];
  width?: number;
}

export interface Axis {
  show?: boolean;
  /** 轴类型 */
  type?: 'category' | 'value' | 'time';
  /** 类目数据（category 轴） */
  data?: string[];
  /** 轴名称 */
  name?: string;
  /** 轴名称位置 */
  nameLocation?: 'start' | 'center' | 'end';
  /** 最小值（value 轴） */
  min?: number | 'dataMin';
  /** 最大值（value 轴） */
  max?: number | 'dataMax';
  /** 刻度间隔 */
  interval?: number;
  /** 是否从零开始 */
  startFromZero?: boolean;
  /** 格式化 */
  formatter?: (value: number) => string;
  /** 轴标签 */
  axisLabel?: AxisLabel;
  /** 轴线 */
  axisLine?: AxisLine;
  /** 刻度 */
  axisTick?: AxisTick;
  /** 分割线 */
  splitLine?: SplitLine;
  /** 分割区域（交替底色） */
  splitArea?: { show?: boolean; colors?: string[] };
}

// ===================== 提示框 =====================

export interface TooltipStyle {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textStyle?: {
    color?: string;
    fontSize?: number;
  };
  /** 最大宽度 */
  maxWidth?: number;
  /** 内边距 [上, 右, 下, 左] */
  padding?: [number, number, number, number];
}

export interface Tooltip {
  show?: boolean;
  /** 触发方式 */
  trigger?: 'item' | 'axis';
  /** 自定义格式化 */
  formatter?: (params: TooltipParams) => string;
  /** 样式 */
  style?: TooltipStyle;
  /** 指示器类型（trigger='axis' 时） */
  axisPointer?: 'line' | 'shadow' | 'cross';
}

export interface TooltipParams {
  seriesName: string;
  name: string;
  value: number;
  color: string;
  dataIndex: number;
  seriesIndex: number;
  percent?: number;
}

// ===================== 图例 =====================

export interface Legend {
  show?: boolean;
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** 对齐 */
  align?: 'left' | 'center' | 'right';
  /** 图例间距 */
  gap?: number;
  /** 图例项间距 */
  itemGap?: number;
  /** 图例标记形状 */
  icon?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond';
  /** 文字样式 */
  textStyle?: {
    color?: string;
    fontSize?: number;
  };
  /** 选中状态（控制显示隐藏） */
  selected?: Record<string, boolean>;
}

// ===================== 网格 =====================

export interface Grid {
  show?: boolean;
  /** 上右下左边距 */
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  /** 是否包含坐标轴标签 */
  containLabel?: boolean;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
}

// ===================== 标题 =====================

export interface Title {
  text?: string;
  subtext?: string;
  /** 位置 */
  left?: 'left' | 'center' | 'right' | number;
  top?: number;
  textStyle?: {
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | number;
  };
  subtextStyle?: {
    color?: string;
    fontSize?: number;
  };
}

// ===================== 标签 =====================

export interface Label {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'center';
  formatter?: string | ((params: { value: number; name: string; percent?: number }) => string);
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | number;
  /** 距离图形的距离 */
  distance?: number;
}

// ===================== 视觉样式 =====================

export interface ItemStyle {
  color?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number | number[];
  opacity?: number;
  /** 阴影 */
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

// ===================== 动画 =====================

export interface Animation {
  /** 是否开启动画 */
  enabled?: boolean;
  /** 动画时长（ms） */
  duration?: number;
  /** 缓动函数 */
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'cubicOut' | 'bounceOut';
  /** 动画延迟（ms） */
  delay?: number | ((dataIndex: number) => number);
}

// ===================== 图表配置 =====================

/** 折线图配置 */
export interface LineChartOption {
  title?: Title;
  grid?: Grid;
  xAxis?: Axis;
  yAxis?: Axis | Axis[];
  tooltip?: Tooltip;
  legend?: Legend;
  series: Series[];
  animation?: Animation;
  /** 数据缩放（滑块） */
  dataZoom?: { show?: boolean; start?: number; end?: number; height?: number };
}

/** 柱状图配置 */
export interface BarChartOption {
  title?: Title;
  grid?: Grid;
  xAxis?: Axis;
  yAxis?: Axis | Axis[];
  tooltip?: Tooltip;
  legend?: Legend;
  series: Series[];
  /** 柱条宽度 */
  barWidth?: number | string;
  /** 柱条最大宽度 */
  barMaxWidth?: number;
  /** 柱条间距 */
  barGap?: string;
  /** 分类间距 */
  barCategoryGap?: string;
  animation?: Animation;
}

/** 饼图配置 */
export interface PieChartOption {
  title?: Title;
  tooltip?: Tooltip;
  legend?: Legend;
  series: PieSeries[];
  animation?: Animation;
}

export interface PieSeries {
  name?: string;
  data: DataPoint[];
  /** 饼图 or 环形图 */
  type?: 'pie' | 'donut';
  /** 内外半径 ['内%','外%'] */
  radius?: [string, string];
  /** 中心偏移 [x, y] */
  center?: [string, string];
  /** 南丁格尔玫瑰图 */
  roseType?: 'radius' | 'area' | false;
  /** 起始角度 */
  startAngle?: number;
  /** 扇区间隔 */
  padAngle?: number;
  label?: Label;
  labelLine?: { show?: boolean; length?: number; length2?: number; smooth?: boolean };
  itemStyle?: ItemStyle;
  /** 选中偏移 */
  selectedOffset?: number;
  /** 是否可选中 */
  selectedMode?: 'single' | 'multiple' | boolean;
  /** 颜色列表（覆盖全局） */
  color?: string[];
}

/** 散点图配置 */
export interface ScatterChartOption {
  title?: Title;
  grid?: Grid;
  xAxis?: Axis;
  yAxis?: Axis | Axis[];
  tooltip?: Tooltip;
  legend?: Legend;
  series: ScatterSeries[];
  animation?: Animation;
}

export interface ScatterSeries {
  name: string;
  data: [number, number, number?][]; // [x, y, symbolSize?]
  color?: string;
  /** 气泡大小范围 [min, max] */
  symbolSize?: [number, number] | number;
  itemStyle?: ItemStyle;
  label?: Label;
}

/** 雷达图配置 */
export interface RadarChartOption {
  title?: Title;
  tooltip?: Tooltip;
  legend?: Legend;
  radar: RadarIndicator[];
  series: RadarSeries[];
  animation?: Animation;
}

export interface RadarIndicator {
  name: string;
  max: number;
  color?: string;
}

export interface RadarSeries {
  name: string;
  data: number[];
  color?: string;
  lineStyle?: { width?: number; type?: 'solid' | 'dashed' };
  areaStyle?: { opacity?: number };
  symbol?: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none';
  symbolSize?: number;
}

/** 仪表盘配置 */
export interface GaugeChartOption {
  title?: Title;
  series: GaugeSeries[];
  animation?: Animation;
}

export interface GaugeSeries {
  name?: string;
  data: DataPoint[];
  /** 仪表盘半径 */
  radius?: string;
  /** 起始角度 */
  startAngle?: number;
  /** 结束角度 */
  endAngle?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 分割段数 */
  splitNumber?: number;
  axisLine?: {
    lineStyle?: {
      color?: [number, string][];  // [位置, 颜色]
      width?: number;
    };
  };
  axisTick?: { show?: boolean; length?: number; splitNumber?: number };
  axisLabel?: { show?: boolean; distance?: number; formatter?: (v: number) => string };
  splitLine?: { show?: boolean; length?: number };
  pointer?: { show?: boolean; length?: string; width?: number };
  title?: { show?: boolean; offsetCenter?: [string, string]; fontSize?: number };
  detail?: {
    show?: boolean;
    formatter?: string | ((v: number) => string);
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | number;
    offsetCenter?: [string, string];
    color?: string | ((v: number) => string);
  };
  progress?: { show?: boolean; width?: number; roundCap?: boolean };
}

/** 漏斗图配置 */
export interface FunnelChartOption {
  title?: Title;
  tooltip?: Tooltip;
  legend?: Legend;
  series: FunnelSeries[];
  animation?: Animation;
}

export interface FunnelSeries {
  name?: string;
  data: DataPoint[];
  /** 排序 */
  sort?: 'descending' | 'ascending' | 'none';
  /** 上下宽度百分比 */
  min?: number;
  max?: number;
  /** 间距 */
  gap?: number;
  label?: Label;
  itemStyle?: ItemStyle;
  /** 颜色列表 */
  color?: string[];
}

/** 进度环配置 */
export interface ProgressRingOption {
  /** 百分比 0-100 */
  percent: number;
  /** 圆环尺寸 */
  size?: number;
  /** 线宽 */
  strokeWidth?: number;
  /** 轨道色 */
  trackColor?: string;
  /** 进度色 */
  color?: string | [number, string][];
  /** 是否圆角端点 */
  roundCap?: boolean;
  /** 中心内容 */
  content?: {
    title?: string;
    value?: string;
    titleStyle?: { color?: string; fontSize?: number };
    valueStyle?: { color?: string; fontSize?: number; fontWeight?: 'normal' | 'bold' | number };
  };
  /** 动画 */
  animation?: Animation;
}

// ===================== 预设主题 =====================

export interface ChartTheme {
  /** 主色板（按顺序分配给系列） */
  color: string[];
  /** 背景色 */
  backgroundColor: string;
  /** 文字色 */
  textStyle: { color: string; fontSize: number; fontFamily: string };
  /** 标题样式 */
  title: { textStyle: { color: string; fontSize: number; fontWeight: string } };
  /** 坐标轴 */
  axis: {
    lineColor: string;
    tickColor: string;
    labelColor: string;
    splitLineColor: string;
    splitLineDash: [number, number];
  };
  /** 图例 */
  legend: { textStyle: { color: string; fontSize: number } };
  /** 提示框 */
  tooltip: {
    backgroundColor: string;
    borderColor: string;
    textStyle: { color: string; fontSize: number };
  };
}

// ===================== 热力图 =====================

/** 热力图系列 */
export interface HeatmapSeries {
  name?: string;
  /** 二维数据：[xIndex, yIndex, value][] */
  data: [number, number, number][];
  /** 标签 */
  label?: Label;
  /** 单元格样式 */
  itemStyle?: ItemStyle;
}

/** 热力图配置 */
export interface HeatmapChartOption {
  title?: Title;
  tooltip?: Tooltip;
  legend?: Legend;
  /** X 轴类目 */
  xAxis?: Axis;
  /** Y 轴类目 */
  yAxis?: Axis;
  series: HeatmapSeries[];
  /** 视觉映射（颜色范围） */
  visualMap?: {
    /** 最小值 */
    min?: number;
    /** 最大值 */
    max?: number;
    /** 起始颜色 */
    minColor?: string;
    /** 结束颜色 */
    maxColor?: string;
    /** 是否显示色阶条 */
    show?: boolean;
    /** 色阶条位置 */
    orient?: 'horizontal' | 'vertical';
    left?: number | string;
    top?: number | string;
    /** 格式化文本 */
    formatter?: (value: number) => string;
  };
  /** 格子样式 */
  itemStyle?: ItemStyle & {
    /** 格子间距 */
    gap?: number;
    /** 圆角 */
    borderRadius?: number;
  };
  /** 是否在格子内显示数值 */
  showValue?: boolean;
  animation?: Animation;
}

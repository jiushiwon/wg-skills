# 商城组合主题模板

三个设计方案、四种布局（grid / editorial / waterfall / category），包含商品、购物车、钱包三个视图。Demo 路由 #/pages/commerce?theme=coral&layout=grid&page=products；默认隐藏主题设置控件，settings=1显式打开。商品照片随 assets/commerce 提供，来源见 sources.json；商品名称、规格和价格为示例，不代表照片对应型号。默认提供同一线性风格 SVG 图标，通过按钮与底栏 icon 接口加载。

必须读取 uniapp-theme-skill/references/commerce-presets.md。依赖主题真源、BaseCard、BaseButton 与 page-components Empty；不复制容器实现。主题选择状态应用级共享，挂到真实项目时在 App 根容器统一绑定；原生导航色另由容器同步。

演示中数量为本地状态，金额整数分计算，数量范围0–99；0会移出购物车。钱包数值独立mock，充值/提现/结算仅反馈未接入提示，不改余额、不创建订单。当前未处理登录、异步加载、服务失败或资金权限，不能当完整商城骨架。安全区底部做避让，使用系统导航承担顶部；真实项目自绘导航时另读安全区技能。

两套布局：grid 为商品双栏、购物车与钱包纵向；editorial 为商品横排、购物车与钱包分区。editorial 的购物车与钱包采用双栏分区，手机默认单栏，640px以上双栏；这是三种共享页面结构的主题/布局组合，不宣传18套独立实现。

## 分类与搜索
顶部复用 `uniapp-base-skill/components/form/search-bar/index.vue`，不另写搜索输入框。全部/电脑/手机/耳机/腕表分类与关键词联合筛选，清空搜索保留分类，无结果使用既有 Empty。购物车、钱包保留独立页面及 page 查询入口；设置模式可显示页面切换。当前为本地商品过滤，接入后端时需补充分页、请求取消与错误状态。

商城提供 grid 双栏、editorial 横排、waterfall 双列独立流、category 左侧分类点单。通过 layout 参数选择；现有 SearchBar 与分类共同过滤，商品图复用随技能提供的数码图片。瀑布流按稳定索引分列，不承诺动态测量最短列；左侧为一级分类，不冒充多级树。

## 设计入口
`?design=B` 为频道瀑布流；`?design=C` 为图片分类与左侧菜单。默认 A 保留品牌双栏。优先读取主题技能的 commerce-design-catalog.md，确认设计编号再组合页面。底栏复用 BaseTabbar、展开面板复用 BasePopup、搜索复用 SearchBar、加购复用带图标 BaseButton。图标 SVG 随技能提供，并由 prepare-sources.mjs 复制到运行目录。默认仅四款独立数码商品，不伪造大量重复商品；接入商品接口后按 categoryId 过滤。

## 分类 JSON 入参
页面组件使用 `<Commerce :categories="categoryData" />`。categories 为数组；省略使用默认四类，空数组仅展示全部。
节点结构：`{ id, label, image?, productIds?, children? }`。id必须全树唯一，保留 all；children允许多级。productIds为当前节点商品ID数组，父分类筛选合并后代ID。未填productIds时以节点id匹配商品id。
单级示例：`[{"id":"phone","label":"手机","productIds":["phone"]}]`
多级示例：`[{"id":"digital","label":"数码","children":[{"id":"mobile","label":"手机","productIds":["phone"]}]}]`
模板按层级缩进展示所有节点；这是多级选择列表，不是折叠树。搜索与分类联合过滤。原生导航位于系统层，App/小程序若需遮住导航须使用项目已有自定义导航方案并真机验证。

## 新版主题分层
全项目视觉先读 uniapp-theme-skill/basic_theme.md；本页布局读 current_theme.md。内置 S1简洁平铺、S2精细横滑、S3树形精细、S4下拉瀑布、S5横滑瀑布。style 查询参数与 listStyle 组件入参可选；不会更改其他页面的业务布局。横滑分类只展示一级，树形与下拉展示层级。

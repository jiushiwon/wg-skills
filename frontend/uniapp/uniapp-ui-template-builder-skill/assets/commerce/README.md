# 商城默认素材

- laptop.jpg、phone.jpg、headphones.jpg、watch.jpg：模板实际使用的四款产品摄影；分类入口复用相应图片。来源见 sources.json。
- cart.svg、cart-white.svg、home.svg、grid.svg、wallet.svg：本仓库统一线性图标，按钮与底栏通过 icon 接口引用。
- previews/：本轮从可运行 H5 模板截取的 A/B/C 页面与频道展开截图，用于对照，不复制进入运行包。
- 接入项目时将本目录的四张 JPG 和五张 SVG 复制到项目 src/static/commerce；模板统一从 /static/commerce 引用。Demo 的 prepare-sources.mjs 自动完成复制。
- 不需要外链图片。用户提供的闲鱼、叮咚截图仅为设计参考，不作为可分发产品素材，也不宣称达到其全部业务能力。

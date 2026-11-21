export const products = [
 { id: 'laptop', name: '轻薄笔记本电脑', tag: '轻装办公', price: 599900, image: '/static/commerce/laptop.jpg', description:'轻薄机身 · 高效办公' },
 { id: 'phone', name: '全屏智能手机', tag: '随手记录', price: 329900, image: '/static/commerce/phone.jpg', description:'清晰影像 · 全天续航' },
 { id: 'headphones', name: '头戴式无线耳机', tag: '专注聆听', price: 69900, image: '/static/commerce/headphones.jpg', description:'舒适佩戴 · 沉浸音质' },
 { id: 'watch', name: '简约腕表', tag: '每日随行', price: 39900, image: '/static/commerce/watch.jpg', description:'经典表盘 · 简约设计' },
]
export const walletMock = { available: 128060, frozen: 2600 }
export const money = (cents: number) => (cents / 100).toFixed(2)

/**
 * 状态管理
 * 使用 localStorage 实现简单的数据持久化
 */
const Store = {
    // 存储键名
    KEYS: {
        TRENDS: 'self_media_trends',
        ARTICLES: 'self_media_articles',
        MATERIALS: 'self_media_materials',
        THEME: 'self_media_theme'
    },

    // 获取数据
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Store get error:', e);
            return null;
        }
    },

    // 存储数据
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Store set error:', e);
            return false;
        }
    },

    // 热点数据
    getTrends() {
        return this.get(this.KEYS.TRENDS) || [];
    },

    setTrends(trends) {
        return this.set(this.KEYS.TRENDS, trends);
    },

    // 文章数据
    getArticles() {
        return this.get(this.KEYS.ARTICLES) || [];
    },

    setArticles(articles) {
        return this.set(this.KEYS.ARTICLES, articles);
    },

    // 素材数据
    getMaterials() {
        return this.get(this.KEYS.MATERIALS) || [];
    },

    setMaterials(materials) {
        return this.set(this.KEYS.MATERIALS, materials);
    },

    // 主题
    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'light';
    },

    setTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },

    // 生成 ID
    generateId(items) {
        if (!items || items.length === 0) return 1;
        return Math.max(...items.map(item => item.id)) + 1;
    },

    // 清空所有数据
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// 导出
window.Store = Store;

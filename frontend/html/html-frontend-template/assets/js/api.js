/**
 * API 客户端
 * 对接后端 REST API
 */

// 配置
const API_CONFIG = {
    // 后端 API 地址
    BASE_URL: localStorage.getItem('api_base_url') || 'http://localhost:8000',
    // 超时时间（毫秒）
    TIMEOUT: 30000,
    // 是否使用模拟数据（当后端不可用时）
    USE_MOCK: true
};

const API = {
    // 热点 API
    trends: {
        async getAll(source = null) {
            const url = source
                ? `${API_CONFIG.BASE_URL}/api/trends?source=${source}`
                : `${API_CONFIG.BASE_URL}/api/trends`;
            return this.request(url);
        },

        async add(trend) {
            return this.request(`${API_CONFIG.BASE_URL}/api/trends`, {
                method: 'POST',
                body: JSON.stringify(trend)
            });
        },

        async delete(id) {
            return this.request(`${API_CONFIG.BASE_URL}/api/trends/${id}`, {
                method: 'DELETE'
            });
        },

        async collect() {
            return this.request(`${API_CONFIG.BASE_URL}/api/trends/collect`, {
                method: 'POST'
            });
        },

        async getSources() {
            return this.request(`${API_CONFIG.BASE_URL}/api/trends/sources`);
        }
    },

    // 文章 API
    articles: {
        async getAll(platform = null, status = null) {
            let url = `${API_CONFIG.BASE_URL}/api/articles`;
            const params = [];
            if (platform) params.push(`platform=${platform}`);
            if (status) params.push(`status=${status}`);
            if (params.length > 0) url += '?' + params.join('&');
            return this.request(url);
        },

        async get(id) {
            return this.request(`${API_CONFIG.BASE_URL}/api/articles/${id}`);
        },

        async generate(topic, platform, style = 'default', length = 'medium') {
            return this.request(`${API_CONFIG.BASE_URL}/api/generate`, {
                method: 'POST',
                body: JSON.stringify({ topic, platform, style, length })
            });
        },

        async update(article) {
            return this.request(`${API_CONFIG.BASE_URL}/api/articles/${article.id}`, {
                method: 'PUT',
                body: JSON.stringify(article)
            });
        },

        async delete(id) {
            return this.request(`${API_CONFIG.BASE_URL}/api/articles/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // 平台 API
    platforms: {
        async getAll() {
            return this.request(`${API_CONFIG.BASE_URL}/api/platforms`);
        }
    },

    // 通用请求方法
    async request(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const config = { ...defaultOptions, ...options };

        // 超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);

            // 如果配置了使用模拟数据
            if (API_CONFIG.USE_MOCK) {
                console.log('Using mock data...');
                return this.getMockData(url, options);
            }

            throw error;
        }
    },

    // 模拟数据（当后端不可用时）
    getMockData(url, options) {
        // 解析 URL 和方法返回适当的模拟数据
        if (url.includes('/api/trends') && options.method === 'GET') {
            return this.mockData.trends;
        }
        if (url.includes('/api/trends') && options.method === 'POST') {
            return { status: 'ok' };
        }
        if (url.includes('/api/trends/collect')) {
            return { status: 'ok', count: 10 };
        }
        if (url.includes('/api/trends/sources')) {
            return this.mockData.sources;
        }
        if (url.includes('/api/articles') && options.method === 'GET') {
            return this.mockData.articles;
        }
        if (url.includes('/api/generate')) {
            return this.mockData.generatedArticle;
        }
        if (url.includes('/api/platforms')) {
            return this.mockData.platforms;
        }
        return null;
    },

    // 模拟数据
    mockData: {
        trends: [
            { id: 1, title: '年轻人为什么不爱换手机了', source: 'zhihu', heat: 8500, tags: '科技,数码', created_at: '2024-01-15T10:00:00' },
            { id: 2, title: '2024年AI创业机会在哪', source: 'weibo', heat: 12000, tags: 'AI,创业', created_at: '2024-01-15T09:30:00' },
            { id: 3, title: '小红书爆款笔记怎么写', source: 'manual', heat: 5000, tags: '自媒体,运营', created_at: '2024-01-14T15:20:00' },
            { id: 4, title: '微信更新了这个功能', source: 'wechat', heat: 7500, tags: '微信,产品', created_at: '2024-01-14T12:00:00' },
            { id: 5, title: '程序员35岁危机真的存在吗', source: 'zhihu', heat: 9200, tags: '职业,程序员', created_at: '2024-01-13T18:00:00' }
        ],
        articles: [
            { id: 1, title: '年轻人为什么不爱换手机了', content: '...', platform: 'xiaohongshu', status: 'draft', created_at: '2024-01-15T10:00:00', updated_at: '2024-01-15T10:00:00' },
            { id: 2, title: 'AI创业机会分析', content: '...', platform: 'zhihu', status: 'published', created_at: '2024-01-14T09:00:00', updated_at: '2024-01-14T15:00:00' }
        ],
        sources: [
            { id: 'zhihu', name: '知乎热榜' },
            { id: 'weibo', name: '微博热搜' },
            { id: 'baidu', name: '百度指数' },
            { id: 'wechat', name: '微信指数' },
            { id: 'manual', name: '手动输入' }
        ],
        platforms: [
            { id: 'xhs', name: '小红书', description: '种草安利、情感共鸣' },
            { id: 'zhihu', name: '知乎', description: '专业分析、深度解读' },
            { id: 'toutiao', name: '今日头条', description: '新闻资讯、热点评论' },
            { id: 'wechat', name: '公众号', description: '深度文章、个人观点' },
            { id: 'csdn', name: 'CSDN', description: '技术文章、教程' }
        ],
        generatedArticle: {
            id: 100,
            title: '测试文章',
            content: '# 测试内容\n\n这是一篇测试文章...',
            platform: 'xhs',
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    }
};

// 导出
window.API = API;

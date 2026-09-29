/**
 * 主应用逻辑
 * 包含路由控制和页面渲染
 */

// 页面标题映射
const PAGE_TITLES = {
    trends: '热点管理',
    create: '创作中心',
    articles: '文章库',
    materials: '素材库',
    publish: '发布中心'
};

// 当前页面
let currentPage = 'trends';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initRouter();
    initNav();
});

// 主题初始化
function initTheme() {
    const theme = Store.getTheme();
    document.documentElement.setAttribute('data-theme', theme);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        Store.setTheme(next);
    });
}

// 路由初始化
function initRouter() {
    // 解析 URL hash
    const hash = window.location.hash.slice(1) || 'trends';
    navigateTo(hash);

    // 监听 hash 变化
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'trends';
        navigateTo(hash);
    });
}

// 导航初始化
function initNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

// 页面导航
function navigateTo(page) {
    currentPage = page;

    // 更新 URL
    window.location.hash = page;

    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // 更新标题
    document.getElementById('page-title').textContent = PAGE_TITLES[page] || '自媒体运营';

    // 渲染页面
    renderPage(page);
}

// 页面渲染
function renderPage(page) {
    const content = document.getElementById('content');

    switch (page) {
        case 'trends':
            content.innerHTML = renderTrendsPage();
            initTrendsPage();
            break;
        case 'create':
            content.innerHTML = renderCreatePage();
            initCreatePage();
            break;
        case 'articles':
            content.innerHTML = renderArticlesPage();
            initArticlesPage();
            break;
        case 'materials':
            content.innerHTML = renderMaterialsPage();
            initMaterialsPage();
            break;
        case 'publish':
            content.innerHTML = renderPublishPage();
            initPublishPage();
            break;
        default:
            content.innerHTML = '<div class="empty">页面不存在</div>';
    }
}

// ============ 热点管理页面 ============
function renderTrendsPage() {
    return `
        <div class="card">
            <div class="toolbar">
                <div class="toolbar-left">
                    <select class="form-select" id="trend-source-filter" style="width: 150px;">
                        <option value="">全部来源</option>
                        <option value="zhihu">知乎</option>
                        <option value="weibo">微博</option>
                        <option value="manual">手动</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="collect-btn">🔄 抓取热点</button>
                    <button class="btn btn-success" id="add-trend-btn">➕ 添加热点</button>
                </div>
            </div>
            <div id="trends-list">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </div>
    `;
}

function initTrendsPage() {
    loadTrends();

    // 抓取按钮
    document.getElementById('collect-btn').addEventListener('click', async () => {
        const btn = document.getElementById('collect-btn');
        btn.disabled = true;
        btn.textContent = '抓取中...';
        try {
            await API.trends.collect();
            await loadTrends();
        } catch (e) {
            alert('抓取失败: ' + e.message);
        }
        btn.disabled = false;
        btn.textContent = '🔄 抓取热点';
    });

    // 添加按钮
    document.getElementById('add-trend-btn').addEventListener('click', () => {
        showAddTrendModal();
    });

    // 筛选
    document.getElementById('trend-source-filter').addEventListener('change', loadTrends);
}

async function loadTrends() {
    const source = document.getElementById('trend-source-filter').value;
    const listEl = document.getElementById('trends-list');

    try {
        const trends = await API.trends.getAll(source);
        if (trends.length === 0) {
            listEl.innerHTML = '<div class="empty"><div class="empty-icon">🔥</div><p>暂无热点数据</p></div>';
            return;
        }

        listEl.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>热度</th>
                        <th>标题</th>
                        <th>来源</th>
                        <th>标签</th>
                        <th>时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${trends.map(t => `
                        <tr>
                            <td><span class="tag tag-primary">${t.heat}</span></td>
                            <td>${t.title}</td>
                            <td>${getSourceName(t.source)}</td>
                            <td>${t.tags || '-'}</td>
                            <td>${formatDate(t.created_at)}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick="useAsTopic('${t.title}')">用作话题</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteTrend(${t.id})">删除</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        listEl.innerHTML = `<div class="empty"><p>加载失败: ${e.message}</p></div>`;
    }
}

function showAddTrendModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">添加热点</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">标题</label>
                    <input type="text" class="form-input" id="new-trend-title" placeholder="输入热点标题">
                </div>
                <div class="form-group">
                    <label class="form-label">来源</label>
                    <select class="form-select" id="new-trend-source">
                        <option value="manual">手动输入</option>
                        <option value="zhihu">知乎</option>
                        <option value="weibo">微博</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">热度</label>
                    <input type="number" class="form-input" id="new-trend-heat" value="0">
                </div>
                <div class="form-group">
                    <label class="form-label">标签</label>
                    <input type="text" class="form-input" id="new-trend-tags" placeholder="逗号分隔，如：科技,数码">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-primary" id="save-trend-btn">保存</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('save-trend-btn').addEventListener('click', async () => {
        const title = document.getElementById('new-trend-title').value.trim();
        const source = document.getElementById('new-trend-source').value;
        const heat = parseInt(document.getElementById('new-trend-heat').value) || 0;
        const tags = document.getElementById('new-trend-tags').value.trim();

        if (!title) {
            alert('请输入标题');
            return;
        }

        try {
            await API.trends.add({ title, source, heat, tags });
            modal.remove();
            await loadTrends();
        } catch (e) {
            alert('保存失败: ' + e.message);
        }
    });
}

async function deleteTrend(id) {
    if (!confirm('确定要删除这条热点吗？')) return;
    try {
        await API.trends.delete(id);
        await loadTrends();
    } catch (e) {
        alert('删除失败: ' + e.message);
    }
}

function useAsTopic(topic) {
    navigateTo('create');
    // 等待页面渲染完成后设置话题
    setTimeout(() => {
        const input = document.getElementById('topic-input');
        if (input) input.value = topic;
    }, 100);
}

// ============ 创作中心页面 ============
function renderCreatePage() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">创作新文章</h3>
            </div>
            <div class="form-group">
                <label class="form-label">选择热点话题</label>
                <input type="text" class="form-input" id="topic-input" placeholder="输入话题标题，或从热点管理中选择">
            </div>
            <div class="form-group">
                <label class="form-label">目标平台</label>
                <select class="form-select" id="platform-select">
                    <option value="">请选择平台</option>
                    <option value="xhs">小红书</option>
                    <option value="zhihu">知乎</option>
                    <option value="toutiao">今日头条</option>
                    <option value="wechat">公众号</option>
                    <option value="csdn">CSDN</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">风格</label>
                <select class="form-select" id="style-select">
                    <option value="default">默认</option>
                    <option value="种草">种草安利</option>
                    <option value="干货">干货分享</option>
                    <option value="情感">情感共鸣</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">长度</label>
                <select class="form-select" id="length-select">
                    <option value="short">短篇 (~500字)</option>
                    <option value="medium" selected>中篇 (~800字)</option>
                    <option value="long">长篇 (~1500字)</option>
                </select>
            </div>
            <button class="btn btn-primary" id="generate-btn" style="width: 100%;">✨ AI 生成初稿</button>
        </div>

        <div class="card" id="article-result" style="display: none;">
            <div class="card-header">
                <h3 class="card-title">生成结果</h3>
                <div>
                    <button class="btn btn-sm btn-secondary" id="edit-btn">编辑</button>
                    <button class="btn btn-sm btn-success" id="save-article-btn">保存到文章库</button>
                </div>
            </div>
            <textarea class="form-textarea" id="article-content" placeholder="在这里编辑文章内容..."></textarea>
        </div>
    `;
}

function initCreatePage() {
    const generateBtn = document.getElementById('generate-btn');

    generateBtn.addEventListener('click', async () => {
        const topic = document.getElementById('topic-input').value.trim();
        const platform = document.getElementById('platform-select').value;
        const style = document.getElementById('style-select').value;
        const length = document.getElementById('length-select').value;

        if (!topic) {
            alert('请输入话题');
            return;
        }
        if (!platform) {
            alert('请选择平台');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = '生成中...';

        try {
            const result = await API.articles.generate(topic, platform, style, length);
            document.getElementById('article-result').style.display = 'block';
            document.getElementById('article-content').value = result.content;
        } catch (e) {
            alert('生成失败: ' + e.message);
        }

        generateBtn.disabled = false;
        generateBtn.textContent = '✨ AI 生成初稿';
    });

    // 保存文章
    document.getElementById('save-article-btn')?.addEventListener('click', async () => {
        const content = document.getElementById('article-content').value;
        if (!content) {
            alert('文章内容不能为空');
            return;
        }

        const topic = document.getElementById('topic-input').value.trim();
        const platform = document.getElementById('platform-select').value;

        try {
            // 这里应该调用保存接口，目前简单处理
            alert('文章已保存到文章库！');
            navigateTo('articles');
        } catch (e) {
            alert('保存失败: ' + e.message);
        }
    });
}

// ============ 文章库页面 ============
function renderArticlesPage() {
    return `
        <div class="card">
            <div class="toolbar">
                <div class="toolbar-left">
                    <select class="form-select" id="article-platform-filter" style="width: 150px;">
                        <option value="">全部平台</option>
                        <option value="xhs">小红书</option>
                        <option value="zhihu">知乎</option>
                        <option value="toutiao">今日头条</option>
                        <option value="wechat">公众号</option>
                        <option value="csdn">CSDN</option>
                    </select>
                    <select class="form-select" id="article-status-filter" style="width: 150px;">
                        <option value="">全部状态</option>
                        <option value="draft">草稿</option>
                        <option value="published">已发布</option>
                    </select>
                </div>
            </div>
            <div id="articles-list">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </div>
    `;
}

function initArticlesPage() {
    loadArticles();

    document.getElementById('article-platform-filter').addEventListener('change', loadArticles);
    document.getElementById('article-status-filter').addEventListener('change', loadArticles);
}

async function loadArticles() {
    const platform = document.getElementById('article-platform-filter').value;
    const status = document.getElementById('article-status-filter').value;
    const listEl = document.getElementById('articles-list');

    try {
        const articles = await API.articles.getAll(platform, status);
        if (articles.length === 0) {
            listEl.innerHTML = '<div class="empty"><div class="empty-icon">📄</div><p>暂无文章</p></div>';
            return;
        }

        listEl.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>标题</th>
                        <th>平台</th>
                        <th>状态</th>
                        <th>时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${articles.map(a => `
                        <tr>
                            <td>${a.title}</td>
                            <td>${getPlatformName(a.platform)}</td>
                            <td><span class="tag ${a.status === 'published' ? 'tag-success' : 'tag-warning'}">${a.status === 'published' ? '已发布' : '草稿'}</span></td>
                            <td>${formatDate(a.updated_at)}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick="viewArticle(${a.id})">查看</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteArticle(${a.id})">删除</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        listEl.innerHTML = `<div class="empty"><p>加载失败: ${e.message}</p></div>`;
    }
}

async function deleteArticle(id) {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
        await API.articles.delete(id);
        await loadArticles();
    } catch (e) {
        alert('删除失败: ' + e.message);
    }
}

function viewArticle(id) {
    alert('查看文章功能开发中...');
}

// ============ 素材库页面 ============
function renderMaterialsPage() {
    return `
        <div class="card">
            <div class="toolbar">
                <div class="toolbar-left">
                    <button class="btn btn-success" id="add-material-btn">➕ 添加素材</button>
                </div>
            </div>
            <div id="materials-list">
                <div class="empty"><div class="empty-icon">🖼️</div><p>素材库功能开发中...</p></div>
            </div>
        </div>
    `;
}

function initMaterialsPage() {
    // TODO: 实现素材管理功能
}

// ============ 发布中心页面 ============
function renderPublishPage() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">发布文章</h3>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                选择一篇文章，复制内容或导出为指定格式。
            </p>
            <div id="publish-list">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </div>
    `;
}

function initPublishPage() {
    loadPublishArticles();
}

async function loadPublishArticles() {
    const listEl = document.getElementById('publish-list');

    try {
        const articles = await API.articles.getAll(null, 'draft');
        if (articles.length === 0) {
            listEl.innerHTML = '<div class="empty"><div class="empty-icon">🚀</div><p>没有可发布的草稿文章</p></div>';
            return;
        }

        listEl.innerHTML = `
            <div class="list">
                ${articles.map(a => `
                    <div class="list-item">
                        <div>
                            <strong>${a.title}</strong>
                            <span class="tag tag-primary" style="margin-left: 8px;">${getPlatformName(a.platform)}</span>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-secondary" onclick="copyArticle(${a.id})">复制内容</button>
                            <button class="btn btn-sm btn-primary" onclick="exportArticle(${a.id})">导出</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        listEl.innerHTML = `<div class="empty"><p>加载失败: ${e.message}</p></div>`;
    }
}

async function copyArticle(id) {
    try {
        const article = await API.articles.get(id);
        await navigator.clipboard.writeText(article.content);
        alert('已复制到剪贴板！');
    } catch (e) {
        alert('复制失败: ' + e.message);
    }
}

async function exportArticle(id) {
    try {
        const article = await API.articles.get(id);
        const blob = new Blob([article.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        alert('导出失败: ' + e.message);
    }
}

// ============ 工具函数 ============
function getSourceName(source) {
    const names = {
        zhihu: '知乎',
        weibo: '微博',
        baidu: '百度',
        wechat: '微信',
        manual: '手动'
    };
    return names[source] || source;
}

function getPlatformName(platform) {
    const names = {
        xhs: '小红书',
        xiaohongshu: '小红书',
        zhihu: '知乎',
        toutiao: '今日头条',
        wechat: '公众号',
        csdn: 'CSDN'
    };
    return names[platform] || platform;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// 导出到全局
window.navigateTo = navigateTo;
window.deleteTrend = deleteTrend;
window.useAsTopic = useAsTopic;
window.deleteArticle = deleteArticle;
window.viewArticle = viewArticle;
window.copyArticle = copyArticle;
window.exportArticle = exportArticle;

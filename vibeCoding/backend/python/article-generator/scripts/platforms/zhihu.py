"""
知乎平台适配器
"""
from .base import PlatformAdapter


class ZhihuAdapter(PlatformAdapter):
    """知乎适配器"""

    name = "zhihu"
    display_name = "知乎"

    def generate_prompt(self, topic: str, style: str = "default", length: str = "medium") -> str:
        min_words, max_words = self.get_length_words(length)

        style_guide = self.get_style_description(style)

        prompt = f"""请帮我写一篇关于「{topic}」的知乎回答/文章。

要求：
- 风格：{style_guide}专业分析、深度解读、逻辑清晰
- 字数：{min_words}-{max_words}字
- 格式要求：
  1. 开篇给出核心观点或结论
  2. 使用多级标题组织结构（##、###）
  3. 论点要有论据支持（数据、案例、引用）
  4. 适当使用表格、代码块
  5. 结尾要有总结和引导讨论
  6. 保持客观理性，但可以有个人见解

请直接输出文章内容，不要其他说明。"""
        return prompt

    def format_output(self, content: str) -> str:
        return content

    def get_style_description(self, style: str) -> str:
        styles = {
            "default": "",
            "专业": "数据支撑、逻辑严密",
            "科普": "通俗易懂、深入浅出",
            "盘点": "分类清晰、列举全面",
        }
        return styles.get(style, "")

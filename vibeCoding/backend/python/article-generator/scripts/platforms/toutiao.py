"""
今日头条平台适配器
"""
from .base import PlatformAdapter


class ToutiaoAdapter(PlatformAdapter):
    """今日头条适配器"""

    name = "toutiao"
    display_name = "今日头条"

    def generate_prompt(self, topic: str, style: str = "default", length: str = "medium") -> str:
        min_words, max_words = self.get_length_words(length)

        style_guide = self.get_style_description(style)

        prompt = f"""请帮我写一篇关于「{topic}」的今日头条文章。

要求：
- 风格：{style_guide}新闻资讯、热点评论、观点鲜明
- 字数：{min_words}-{max_words}字
- 格式要求：
  1. 标题要吸引眼球，能引发点击欲望
  2. 开头要直击要点，制造悬念
  3. 观点要鲜明，立场清晰
  4. 适当制造冲突和对比
  5. 多用短句，节奏明快
  6. 结尾要引导评论讨论
  7. 语言通俗易懂，不晦涩

请直接输出文章内容，不要其他说明。"""
        return prompt

    def format_output(self, content: str) -> str:
        return content

    def get_style_description(self, style: str) -> str:
        styles = {
            "default": "",
            "新闻": "客观陈述、快速传递",
            "评论": "观点犀利、立场坚定",
            "盘点": "汇总整理、信息量大",
        }
        return styles.get(style, "")

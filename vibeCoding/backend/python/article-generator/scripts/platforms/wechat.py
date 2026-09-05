"""
公众号平台适配器
"""
from .base import PlatformAdapter


class WechatAdapter(PlatformAdapter):
    """公众号适配器"""

    name = "wechat"
    display_name = "公众号"

    def generate_prompt(self, topic: str, style: str = "default", length: str = "medium") -> str:
        min_words, max_words = self.get_length_words(length)

        style_guide = self.get_style_description(style)

        prompt = f"""请帮我写一篇关于「{topic}」的微信公众号文章。

要求：
- 风格：{style_guide}深度文章、个人观点、情感丰富
- 字数：{min_words}-{max_words}字
- 格式要求：
  1. 标题要有吸引力，能引发共鸣
  2. 开篇要制造场景或悬念
  3. 使用故事化的叙述方式
  4. 适当使用金句和引用
  5. 段落较长，但要有节奏感
  6. 结尾要有情感升华和互动引导
  7. 排版要舒适，留白适当
  8. 保持真诚，有个人特色

请直接输出文章内容，不要其他说明。"""
        return prompt

    def format_output(self, content: str) -> str:
        return content

    def get_style_description(self, style: str) -> str:
        styles = {
            "default": "",
            "情感": "温暖治愈、情感共鸣",
            "干货": "实用技巧、满满价值",
            "观点": "犀利点评、独特视角",
            "故事": "叙事性强、引人入胜",
        }
        return styles.get(style, "")

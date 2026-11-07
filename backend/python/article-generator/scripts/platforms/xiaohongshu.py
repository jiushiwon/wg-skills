"""
小红书平台适配器
"""
from .base import PlatformAdapter


class XiaohongshuAdapter(PlatformAdapter):
    """小红书适配器"""

    name = "xiaohongshu"
    display_name = "小红书"

    def generate_prompt(self, topic: str, style: str = "default", length: str = "medium") -> str:
        min_words, max_words = self.get_length_words(length)

        style_guide = self.get_style_description(style)

        prompt = f"""请帮我写一篇关于「{topic}」的小红书笔记。

要求：
- 风格：{style_guide}种草安利、情感共鸣、真实分享
- 字数：{min_words}-{max_words}字
- 格式要求：
  1. 标题要吸引人，能引发好奇心
  2. 使用丰富的emoji表情（👍❤️🔥💕✨💯）
  3. 段落要短，每段不超过3行
  4. 多用数字和列表（如1、2、3、①②③）
  5. 结尾要引导互动（评论、收藏、点赞）
  6. 添加相关话题标签（#开头）

请直接输出笔记内容，不要其他说明。"""
        return prompt

    def format_output(self, content: str) -> str:
        """格式化输出"""
        lines = content.split("\n")
        formatted = []

        for line in lines:
            if line.strip():
                # 短段落
                if len(line) > 50:
                    # 长句子分割
                    sentences = line.replace("。", "。\n").replace("！", "！\n").replace("？", "？\n")
                    formatted.extend([s.strip() for s in sentences.split("\n") if s.strip()])
                else:
                    formatted.append(line)

        return "\n".join(formatted)

    def get_style_description(self, style: str) -> str:
        styles = {
            "default": "",
            "种草": "真实使用体验、强烈推荐",
            "干货": "实用技巧、满满干货",
            "情感": "情感共鸣、温暖分享",
            "测评": "客观测评、优缺点分析",
        }
        return styles.get(style, "")

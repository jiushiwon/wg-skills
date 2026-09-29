"""
CSDN 平台适配器
"""
from .base import PlatformAdapter


class CSDNAdapter(PlatformAdapter):
    """CSDN 适配器"""

    name = "csdn"
    display_name = "CSDN"

    def generate_prompt(self, topic: str, style: str = "default", length: str = "medium") -> str:
        min_words, max_words = self.get_length_words(length)

        style_guide = self.get_style_description(style)

        prompt = f"""请帮我写一篇关于「{topic}」的CSDN技术博客文章。

要求：
- 风格：{style_guide}技术文章、教程、代码示例
- 字数：{min_words}-{max_words}字
- 格式要求：
  1. 标题要准确描述技术内容
  2. 开篇说明文章目标和读者对象
  3. 使用代码块展示核心代码（```python 或 ```java）
  4. 步骤要清晰，使用编号列表
  5. 适当添加截图或示意图说明
  6. 结尾要有总结和参考资料
  7. 保持技术准确性，代码可运行

请直接输出文章内容，不要其他说明。"""
        return prompt

    def format_output(self, content: str) -> str:
        return content

    def get_style_description(self, style: str) -> str:
        styles = {
            "default": "",
            "教程": "步骤详细、新手友好",
            "源码": "深入解析、代码导读",
            "踩坑": "问题描述、解决方案",
            "工具": "功能介绍、使用技巧",
        }
        return styles.get(style, "")

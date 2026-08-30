# PII 加密辅助模块
# ✅ 修复 P1-S4: 提供敏感字段加密/解密工具
#
# 使用 Fernet（AES-128-CBC + HMAC-SHA256）对称加密
# 密钥必须通过环境变量 PII_ENCRYPTION_KEY 提供（base64 编码的 32 字节密钥）
#
# 用法：
#   from src.agent.pii import pii_encrypt, pii_decrypt, mask_pii
#
#   # 数据库存储时加密
#   encrypted = pii_encrypt("13800000000")
#
#   # 读取时解密
#   phone = pii_decrypt(encrypted)
#
#   # 日志中脱敏
#   masked = mask_pii("13800000000")  # → "138****0000"

import base64
import logging
import hashlib
from typing import Optional

logger = logging.getLogger(__name__)

try:
    from cryptography.fernet import Fernet, InvalidToken
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False


_PII_KEY: Optional[bytes] = None


def _get_key() -> Optional[bytes]:
    """获取 PII 加密密钥（懒加载）"""
    global _PII_KEY
    if _PII_KEY is not None:
        return _PII_KEY

    if not CRYPTO_AVAILABLE:
        logger.warning("cryptography 未安装，PII 加密不可用（pip install cryptography）")
        return None

    import os
    key_str = os.getenv("PII_ENCRYPTION_KEY")
    if not key_str:
        # ⚠️ 警告：未设置密钥，PII 明文存储
        logger.warning(
            "PII_ENCRYPTION_KEY 未设置，PII 字段将以明文存储。"
            "生产环境必须设置：python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"
        )
        return None

    try:
        _PII_KEY = key_str.encode()
        # 验证密钥有效性
        Fernet(_PII_KEY)
        return _PII_KEY
    except Exception as e:
        logger.error(f"PII_ENCRYPTION_KEY 无效: {e}")
        return None


def pii_encrypt(plaintext: str) -> str:
    """加密 PII 字段

    Args:
        plaintext: 明文

    Returns:
        加密后的 base64 字符串；若无密钥则返回明文（带 !NOENC! 前缀便于排查）
    """
    if not plaintext:
        return plaintext

    key = _get_key()
    if key is None:
        return f"!NOENC!{plaintext}"

    try:
        f = Fernet(key)
        return f.encrypt(plaintext.encode()).decode()
    except Exception as e:
        logger.error(f"PII 加密失败: {e}")
        return f"!NOENC!{plaintext}"


def pii_decrypt(ciphertext: str) -> str:
    """解密 PII 字段"""
    if not ciphertext:
        return ciphertext

    # 兼容未加密的历史数据
    if ciphertext.startswith("!NOENC!"):
        return ciphertext[7:]

    key = _get_key()
    if key is None:
        return ciphertext

    try:
        f = Fernet(key)
        return f.decrypt(ciphertext.encode()).decode()
    except (InvalidToken, Exception) as e:
        logger.error(f"PII 解密失败: {e}")
        return ciphertext


def mask_pii(value: str, mask_char: str = "*", visible_prefix: int = 3, visible_suffix: int = 4) -> str:
    """PII 脱敏（用于日志/响应）

    Args:
        value: 原始值
        mask_char: 脱敏字符
        visible_prefix: 前缀可见字符数
        visible_suffix: 后缀可见字符数

    Returns:
        脱敏后的字符串，如 "138****0000"
    """
    if not value or len(value) < visible_prefix + visible_suffix:
        return mask_char * len(value) if value else ""

    return (
        value[:visible_prefix]
        + mask_char * (len(value) - visible_prefix - visible_suffix)
        + value[-visible_suffix:]
    )


def is_pii_field(field_name: str) -> bool:
    """判断字段名是否为 PII（用于审计日志自动脱敏）"""
    pii_keywords = {"password", "token", "secret", "phone", "email", "id_card", "idcard", "ssn"}
    field_lower = field_name.lower()
    return any(kw in field_lower for kw in pii_keywords)


def safe_log_args(args: dict) -> dict:
    """对参数做日志安全处理（PII 字段脱敏）"""
    safe = {}
    for k, v in args.items():
        if is_pii_field(k):
            safe[k] = mask_pii(str(v)) if v else None
        elif isinstance(v, (str, int, float, bool)):
            safe[k] = v
        else:
            safe[k] = type(v).__name__
    return safe


__all__ = [
    "pii_encrypt",
    "pii_decrypt",
    "mask_pii",
    "is_pii_field",
    "safe_log_args",
    "CRYPTO_AVAILABLE",
]
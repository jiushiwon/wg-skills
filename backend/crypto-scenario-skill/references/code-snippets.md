# 代码范式（四语言）

所有示例都遵循一条原则：**密钥从环境变量读，不在代码里出现**。

---

## 一、用户密码哈希

### Java（Spring Security）

```java
private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

public String hashPassword(String raw) {
    return encoder.encode(raw);
}

public boolean verifyPassword(String raw, String hashed) {
    return encoder.matches(raw, hashed);
}
```

### Python（passlib）

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)

def verify_password(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)
```

### Go

```go
import "golang.org/x/crypto/bcrypt"

func HashPassword(raw string) (string, error) {
    b, err := bcrypt.GenerateFromPassword([]byte(raw), 12)
    return string(b), err
}

func VerifyPassword(raw, hashed string) bool {
    return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(raw)) == nil
}
```

### Node

```javascript
import bcrypt from 'bcrypt';

export const hashPassword = (raw) => bcrypt.hash(raw, 12);
export const verifyPassword = (raw, hashed) => bcrypt.compare(raw, hashed);
```

---

## 二、敏感字段加密（AES-256-GCM）

三段结构：`nonce(12) + tag(16) + ciphertext`，存一起。

### Python（cryptography）

```python
import os, base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

_KEY = os.environ["FIELD_AES_KEY"].encode()   # 32 字节
_aesgcm = AESGCM(_KEY)

def encrypt_field(plaintext: str, field_tag: str) -> str:
    nonce = os.urandom(12)
    ct = _aesgcm.encrypt(nonce, plaintext.encode(), field_tag.encode())
    return base64.b64encode(nonce + ct).decode()

def decrypt_field(stored: str, field_tag: str) -> str:
    raw = base64.b64decode(stored)
    return _aesgcm.decrypt(raw[:12], raw[12:], field_tag.encode()).decode()
```

`field_tag` 是附加认证数据（AAD），用来把密文绑死在"哪个字段"上——把手机号密文搬到身份证字段上，解密会直接失败。

### Java

```java
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, nonce));
cipher.updateAAD(aad);
byte[] ct = cipher.doFinal(plaintext);
```

### Go

```go
block, _ := aes.NewCipher(key)
gcm, _ := cipher.NewGCM(block)
nonce := make([]byte, gcm.NonceSize())
rand.Read(nonce)
ct := gcm.Seal(nonce, nonce, plaintext, aad)
```

### Node

```javascript
import { createCipheriv, randomBytes } from 'node:crypto';

const cipher = createCipheriv('aes-256-gcm', key, nonce);
cipher.setAAD(Buffer.from(aad));
const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
```

---

## 三、HMAC 签名（对接第三方开放接口）

```python
import hmac, hashlib

def sign(params: dict, secret: str) -> str:
    payload = "&".join(f"{k}={v}" for k, v in sorted(params.items()) if v is not None and v != "")
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

def verify(params: dict, secret: str, expected: str) -> bool:
    return hmac.compare_digest(sign(params, secret), expected)   # 别用 ==
```

### Java

```java
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
byte[] sig = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
String hex = HexFormat.of().formatHex(sig);
boolean ok = MessageDigest.isEqual(sig, expected.getBytes(StandardCharsets.UTF_8));
```

### Go

```go
mac := hmac.New(sha256.New, []byte(secret))
mac.Write([]byte(payload))
expectedMAC := hex.EncodeToString(mac.Sum(nil))
ok := hmac.Equal([]byte(expectedMAC), []byte(expected))
```

### Node

```javascript
import { createHmac, timingSafeEqual } from 'node:crypto';
const sig = createHmac('sha256', secret).update(payload).digest('hex');
const ok = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
```

---

## 四、非对称签名（Ed25519）

### Python

```python
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.exceptions import InvalidSignature

private_key = Ed25519PrivateKey.generate()
public_key = private_key.public_key()

signature = private_key.sign(b"transfer 100 to bob")

try:
    public_key.verify(signature, b"transfer 100 to bob")
except InvalidSignature:
    raise
```

### Java

```java
Signature signer = Signature.getInstance("Ed25519");
signer.initSign(privateKey);
signer.update(message);
byte[] sig = signer.sign();

Signature verifier = Signature.getInstance("Ed25519");
verifier.initVerify(publicKey);
verifier.update(message);
boolean ok = verifier.verify(sig);
```

### Go

```go
ed25519.Sign(privateKey, message)
ed25519.Verify(publicKey, message, sig)   // 返回 bool
```

### Node

```javascript
import { sign, verify, generateKeyPairSync } from 'node:crypto';
const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const sig = sign(null, Buffer.from(message), privateKey);
const ok = verify(null, Buffer.from(message), publicKey, sig);
```

---

## 五、文件摘要校验

```python
import hashlib

def file_sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()
```

命令行一行版：

```bash
sha256sum installer.exe
shasum -a 256 installer.exe   # macOS
certutil -hashfile installer.exe SHA256   # Windows
```

---

## 六、随机数

安全随机数**不要用 `random` 模块**，用操作系统熵源：

```python
import secrets
token = secrets.token_urlsafe(32)      # 随机盐、nonce、令牌
```

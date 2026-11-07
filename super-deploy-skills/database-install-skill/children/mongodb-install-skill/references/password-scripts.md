# MongoDB 密码相关脚本

本文件提供 MongoDB 密码修改和重置的参考脚本。

## 修改密码脚本

### 修改 admin 用户密码

```bash
# 使用 mongosh
mongosh admin --eval "db.changeUserPassword('admin', '新密码');"

# 或使用 updateUser
mongosh admin --eval "db.updateUser('admin', {pwd: '新密码'});"
```

### 修改业务用户密码

```bash
# 假设业务用户为 appuser，数据库为 mydb
mongosh admin -u admin -p --authenticationDatabase admin --eval "db.changeUserPassword('appuser', '新密码');"
```

### 交互式修改密码

```bash
# 安全的交互式修改
mongosh admin <<EOF
db.changeUserPassword('admin', '新密码');
\q
EOF
```

## 忘记密码急救脚本

### Ubuntu/Debian

```bash
#!/bin/bash
# mongodb-reset-password.sh - MongoDB 密码重置脚本

echo "=== MongoDB 密码重置 ==="
echo "警告：此操作将在跳过认证模式下重启数据库"

# 1. 停止 MongoDB
echo "[1/5] 停止 MongoDB 服务..."
sudo systemctl stop mongod

# 2. 以跳过认证模式启动
echo "[2/5] 以跳过认证模式启动..."
sudo mongod --dbpath /var/lib/mongodb --port 27017 --bind_ip 127.0.0.1 --auth false &
sleep 5

# 3. 重置密码
echo "[3/5] 输入新密码："
read -s -p "新密码: " NEW_PASSWORD
echo ""

mongosh admin --eval "db.updateUser('admin', {pwd: '$NEW_PASSWORD'});"

# 4. 停止临时实例
echo "[4/5] 停止临时实例..."
pkill mongod
sleep 2

# 5. 恢复正常模式启动
echo "[5/5] 恢复正常模式..."
sudo systemctl start mongod

echo "✅ 密码重置完成！"
echo "请使用新密码连接：mongosh admin -u admin -p"
```

### CentOS/RHEL

```bash
#!/bin/bash
# mongodb-reset-password-centos.sh

echo "=== MongoDB 密码重置 (CentOS/RHEL) ==="

# 1. 停止
echo "[1/5] 停止 MongoDB..."
sudo systemctl stop mongod

# 2. 跳过认证启动
echo "[2/5] 以跳过认证模式启动..."
sudo mongod --dbpath /var/lib/mongodb --port 27017 --bind_ip 127.0.0.1 --auth false &
sleep 5

# 3. 重置密码
echo "[3/5] 输入新密码："
read -s NEW_PASSWORD
echo ""

mongosh admin --eval "db.updateUser('admin', {pwd: '$NEW_PASSWORD'});"

# 4. 停止
echo "[4/5] 停止临时实例..."
pkill mongod
sleep 2

# 5. 启动
echo "[5/5] 启动 MongoDB..."
sudo systemctl start mongod

echo "✅ 完成"
```

## 创建用户脚本

### 创建管理员用户

```bash
# 连接后创建管理员
mongosh admin --eval "
db.createUser({
  user: 'admin',
  pwd: '你的密码',
  roles: [
    { role: 'root', db: 'admin' }
  ]
});
"
```

### 创建业务用户

```bash
# 创建对特定数据库有读写权限的用户
mongosh admin --eval "
db.createUser({
  user: 'appuser',
  pwd: '你的密码',
  roles: [
    { role: 'readWrite', db: 'mydb' }
  ]
});
"
```

### 内置角色

| 角色 | 说明 |
|------|------|
| read | 读取指定数据库 |
| readWrite | 读写指定数据库 |
| dbAdmin | 管理指定数据库 |
| userAdmin | 管理指定数据库用户 |
| clusterAdmin | 管理集群 |
| root | 超级管理员 |

## 连接串格式

```bash
# 环境变量
export MONGO_INITDB_ROOT_USERNAME=admin
export MONGO_INITDB_ROOT_PASSWORD=密码

# URI 格式
mongodb://admin:密码@localhost:27017/admin
mongodb://admin:密码@localhost:27017/mydb?authSource=admin

# 连接时指定认证数据库
mongosh mongodb://localhost:27017/admin -u admin -p --authenticationDatabase admin
```

## 备份和恢复密码相关

### 导出数据

```bash
# 导出
mongodump --uri="mongodb://admin:密码@localhost:27017/mydb" --out=mydb_dump

# 或使用 mongosh
mongosh mongodb://admin:密码@localhost:27017/mydb --eval "db.collection.find().forEach(printjson)"
```

### 导入数据

```bash
# 导入
mongorestore --uri="mongodb://admin:密码@localhost:27017/mydb" mydb_dump/mydb
```

## 安全建议

1. **启用认证**：MongoDB 默认不启用认证，生产必须开启
2. **使用强密码**：至少 12 位，包含大小写、数字、特殊字符
3. **限制监听地址**：生产环境仅监听内网 IP
4. **使用 TLS/SSL**：启用加密传输
5. **定期更换密码**：建议每 90 天更换
6. **审计日志**：开启审计日志记录操作
7. **网络隔离**：使用防火墙限制访问

## 启用认证

### 1. 创建管理员用户

```bash
# 无认证模式下创建管理员
mongosh admin --eval "
db.createUser({
  user: 'admin',
  pwd: '强密码',
  roles: [{role: 'root', db: 'admin'}]
});
"
```

### 2. 启用认证

```bash
# 编辑配置文件
sudo vim /etc/mongod.conf

# 添加或修改：
security:
  authorization: enabled
```

### 3. 重启服务

```bash
sudo systemctl restart mongod
```

### 4. 验证

```bash
# 现在需要认证
mongosh admin -u admin -p
```

## 用户权限管理

```bash
# 查看所有用户
db.adminCommand({usersInfo: 1})

# 删除用户
db.adminCommand({dropUser: 'appuser'})

# 修改用户角色
db.adminCommand({updateUser: 'appuser', roles: [{role: 'readWrite', db: 'mydb'}]})
```

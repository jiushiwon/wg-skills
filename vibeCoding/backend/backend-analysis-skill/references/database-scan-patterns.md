# 数据库扫描模式（Step 3）

> ⚠️ **多数据库项目分别扫描**：一个项目可能同时用多种数据库（实测：Egg 项目 egg-mongoose + egg-sequelize = MongoDB + MySQL 双库）。识别出多个数据库依赖时，逐库独立成节扫描，不要合并结论。

## 1. 数据库类型与连接方式

从连接配置判断库类型（detection-rules.md 第 4 节），同时记录：

| 信息 | 扫描模式 |
|------|----------|
| 连接串 | `Grep: (jdbc:mysql\|jdbc:postgresql\|mongodb://\|DATABASE_URL\|datasource\.url)` → 库名+地址（**账密打码**） |
| 连接池 | `druid` / `hikari` / `pgbouncer` / `sql.DB` 配置 |
| 多数据源 | `Grep: @(DataSource|DS)\(` / dynamic-datasource / `multiple databases` 配置 |

## 2. ORM 实体扫描

按 Step 0 识别的 ORM 选用对应模式：

### JPA / Hibernate（Java）
```
Grep: @Entity
提取：@Table(name = "xxx") → 表名
      @Id → 主键
      @Column(name=..., nullable=..., length=...) → 字段
      @ManyToOne/@OneToMany/@JoinColumn → 关联
      @Index → 索引
```

### MyBatis / MyBatis-Plus（Java）
```
Glob: **/*Mapper.xml
Grep: @TableName\("(\w+)"\)       → MP 表名
Grep: <resultMap|<select|<insert  → SQL 中涉及的表
Grep: (FROM|JOIN|INTO|UPDATE)\s+(\w+)  → 从 SQL 提取表名
```
> MyBatis 项目表结构常在 SQL 文件或真实库里，实体可能不全，需在报告中注明"表结构来源：SQL 文件"。

### GORM（Go）
```
Grep: gorm\.Model|TableName\(\) string
提取：struct 字段 + `gorm:"column:xxx;type:xxx;index"` tag
Grep: AutoMigrate\(  → 自动迁移的模型清单
```

### Ent（Go）
```
Glob: ent/schema/*.go
提取：Fields / Edges / Indexes
```

### SQLAlchemy（Python）
```
Grep: (declarative_base\(\)|__tablename__)
提取：Column(type, primary_key, index, ForeignKey)
```

### Beanie / Motor（Python + MongoDB ODM）
```
Grep: class \w+\((Document|BaseDocument)\)    → 文档模型（注意项目自定义基类，如 BaseDocument）
提取：class Settings: name = "xxx"             → 集合名（非表名）
      field: Type = Indexed(unique=True)       → 索引（beanie.Indexed）
      内嵌 BaseModel 子类                       → 嵌套文档结构（MongoDB 聚合设计）
Grep: init_beanie\(                             → 注册的 Document 全清单（在 database.py/启动文件）
```
> MongoDB 无 schema/迁移，索引在启动时由 ODM 自动创建；集合关系为逻辑关联（字段冗余引用），无物理外键；统计字段冗余需注意一致性。

### Django ORM（Python）
```
Glob: **/models.py
Grep: class \w+\(models\.Model\)
提取：字段定义 + class Meta 的 db_table / indexes / unique_together
```

### Prisma（Node）
```
Glob: schema.prisma / **/*.prisma
提取：model Xxx { } 全量字段 + @id / @unique / @@index / @@map / @relation
```

### TypeORM / Sequelize / Mongoose（Node）
```
Grep: @Entity\(           → TypeORM
Grep: sequelize\.define\(  → Sequelize
Grep: new Schema\(|mongoose\.model\(  → Mongoose（记录 collection 与字段，注明 schemaless）
```

## 3. SQL / 迁移文件

```
Glob: **/*.sql
Glob: db/migration/**          → Flyway（V1__xxx.sql 命名规范）
Glob: **/changelog*            → Liquibase（xml/yaml/json）
Glob: migrations/**            → Django / Alembic / TypeORM / Prisma migrate
Glob: alembic/versions/**
```

- Flyway/Liquibase/Alembic 文件按版本号排序，可还原表结构演进史
- 统计迁移文件数量、最近变更时间（判断项目活跃度）

## 4. 缓存设计（Redis）

```
# key 模式（常量/模板）
Grep: "(\w+):(%s|%d|\{|\$\{|:)"   → 如 "user:info:%s"
Grep: @Cacheable\((value|cacheNames)\s*=  → Spring 缓存注解
Grep: CacheKey|RedisKey|KeyPrefix   → key 常量类
Grep: expire\(|setex|TTL|@Cacheable.*ttl  → 过期策略
```

记录：key 命名规范、用途、TTL 策略。

## 5. 其他存储

| 类型 | 扫描模式 |
|------|----------|
| MongoDB | `@Document` / mongoose schema / `pymongo` 集合名 |
| ES 索引 | `@Document(indexName=)` / 索引创建 DSL / `es.indices` |
| 时序库 | `influxdb` / `tdengine` / `prometheus` 依赖 |
| 图库 | `neo4j` / `nebula` 依赖 |

## 6. 输出要求

1. **表清单**：表名、说明（从注释/类名推断，无注释标"待确认"）、主键、索引数、来源文件
2. **核心表详情**：挑 5-10 张核心业务表给完整字段（表名+字段+类型+注释）
3. **表关系**：外键/逻辑关联，可用文字或简表描述
4. 表名冲突、实体与 SQL 不一致的地方要标注
5. 所有结论标注来源 `file:line`

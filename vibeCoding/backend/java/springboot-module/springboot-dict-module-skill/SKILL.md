---
name: springboot-dict-module-skill
description: Spring Boot 字典/配置模块技能。面向已有 Spring Boot 项目，提供字典类型、字典项、系统配置、参数管理等能力的快速集成。触发词："字典模块"、"配置模块"、"系统参数"、"字典管理"、"系统配置"、"dict module"、"config module"。
---

# Spring Boot Dict Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成字典和配置管理能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **字典类型** | 字典分类管理 |
| **字典项** | 字典数据 CRUD |
| **系统配置** | 系统参数配置 |
| **缓存** | 字典数据缓存 |
| **接口** | RESTful API |

## 触发场景

用户说"帮我加字典模块"或"加配置管理"时触发。

## 数据模型

### 字典类型实体

```java
@Data
@Entity
@Table(name = "wg_dict_type")
public class DictType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, unique = true, length = 50)
    private String code;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Integer status = 1;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

### 字典项实体

```java
@Data
@Entity
@Table(name = "wg_dict_item")
public class DictItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "dict_type_id", nullable = false)
    private Long dictTypeId;
    
    @Column(nullable = false, length = 100)
    private String label;
    
    @Column(nullable = false, length = 100)
    private String value;
    
    @Column(nullable = false)
    private Integer sort = 0;
    
    @Column(nullable = false)
    private Integer status = 1;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

### 系统配置实体

```java
@Data
@Entity
@Table(name = "wg_sys_config")
public class SysConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String configKey;
    
    @Column(name = "config_value", length = 500)
    private String configValue;
    
    @Column(name = "config_type", length = 20)
    private String configType = "string";
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Integer status = 1;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

## Service 层

```java
@Service
@RequiredArgsConstructor
public class DictService {
    
    private final DictTypeRepository dictTypeRepository;
    private final DictItemRepository dictItemRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String DICT_CACHE_KEY = "dict:";
    
    /**
     * 获取字典项（带缓存）
     */
    public List<DictItem> getDictItems(String typeCode) {
        String cacheKey = DICT_CACHE_KEY + typeCode;
        
        // 先从缓存获取
        List<DictItem> cached = (List<DictItem>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }
        
        // 从数据库获取
        DictType dictType = dictTypeRepository.findByCode(typeCode);
        if (dictType == null) {
            return Collections.emptyList();
        }
        
        List<DictItem> items = dictItemRepository.findByDictTypeIdAndStatusOrderBySort(dictType.getId(), 1);
        
        // 存入缓存
        redisTemplate.opsForValue().set(cacheKey, items, 30, TimeUnit.MINUTES);
        
        return items;
    }
    
    /**
     * 刷新字典缓存
     */
    public void refreshDictCache(String typeCode) {
        String cacheKey = DICT_CACHE_KEY + typeCode;
        redisTemplate.delete(cacheKey);
    }
}
```

## Controller 层

### 字典类型 Controller

```java
@RestController
@RequestMapping("/api/dict/type")
@RequiredArgsConstructor
public class DictTypeController {
    
    private final DictService dictService;
    
    @GetMapping("/list")
    public Result<List<DictType>> list(DictTypeQuery query) {
        return Result.success(dictService.listDictTypes(query));
    }
    
    @GetMapping("/{id}")
    public Result<DictType> getById(@PathVariable Long id) {
        return Result.success(dictService.getDictTypeById(id));
    }
    
    @PostMapping
    @PreAuthorize("@per.hasPermission('dict:type:add')")
    public Result<Void> create(@RequestBody DictType dictType) {
        dictService.createDictType(dictType);
        return Result.success();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@per.hasPermission('dict:type:edit')")
    public Result<Void> update(@PathVariable Long id, @RequestBody DictType dictType) {
        dictService.updateDictType(id, dictType);
        return Result.success();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("@per.hasPermission('dict:type:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        dictService.deleteDictType(id);
        return Result.success();
    }
}
```

### 字典项 Controller

```java
@RestController
@RequestMapping("/api/dict/item")
@RequiredArgsConstructor
public class DictItemController {
    
    private final DictService dictService;
    
    @GetMapping("/list")
    public Result<List<DictItem>> list(DictItemQuery query) {
        return Result.success(dictService.listDictItems(query));
    }
    
    /**
     * 根据字典编码获取字典项（下拉框数据源）
     */
    @GetMapping("/{typeCode}")
    public Result<List<DictItem>> getByTypeCode(@PathVariable String typeCode) {
        return Result.success(dictService.getDictItems(typeCode));
    }
    
    @PostMapping
    @PreAuthorize("@per.hasPermission('dict:item:add')")
    public Result<Void> create(@RequestBody DictItem dictItem) {
        dictService.createDictItem(dictItem);
        // 刷新缓存
        dictService.refreshDictCache(dictItem.getDictTypeCode());
        return Result.success();
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@per.hasPermission('dict:item:edit')")
    public Result<Void> update(@PathVariable Long id, @RequestBody DictItem dictItem) {
        dictService.updateDictItem(id, dictItem);
        dictService.refreshDictCache(dictItem.getDictTypeCode());
        return Result.success();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("@per.hasPermission('dict:item:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        DictItem item = dictService.getDictItemById(id);
        dictService.deleteDictItem(id);
        dictService.refreshDictCache(item.getDictTypeCode());
        return Result.success();
    }
}
```

### 系统配置 Controller

```java
@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class SysConfigController {
    
    private final ConfigService configService;
    
    @GetMapping("/list")
    public Result<List<SysConfig>> list(SysConfigQuery query) {
        return Result.success(configService.listConfigs(query));
    }
    
    @GetMapping("/{key}")
    public Result<Object> getByKey(@PathVariable String key) {
        return Result.success(configService.getConfigValue(key));
    }
    
    @PutMapping("/{key}")
    @PreAuthorize("@per.hasPermission('config:edit')")
    public Result<Void> update(@PathVariable String key, @RequestBody SysConfig config) {
        configService.updateConfig(key, config.getConfigValue());
        return Result.success();
    }
}
```

## 接口契约

### 获取字典项

```
GET /api/dict/item/{typeCode}

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {"id": 1, "label": "男", "value": "1"},
    {"id": 2, "label": "女", "value": "2"}
  ]
}
```

### 获取配置

```
GET /api/config/site_name

Response:
{
  "code": 200,
  "message": "success",
  "data": "我的网站"
}
```

## 不做

- 不负责前端页面（使用方自行实现）
- 不处理敏感配置加密（业务层自行处理）
- 不提供配置变更审计日志

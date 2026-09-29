package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysMenuRepository extends JpaRepository<SysMenu, Long> {
    List<SysMenu> findAllByOrderBySortOrderAscIdAsc();

    boolean existsByParentIdAndDeletedAtIsNull(Long parentId);

    /**
     * C 类菜单路径重复检测（创建/更新场景共用）。
     *
     * <p>★ 必须排除自己（更新场景）以及软删除项 —— 历史库里大量"重名 + 软删除"的脏数据，
     * 用 deletedAt IS NULL 兜住，否则会出现「自己跟自己的旧副本打架」。</p>
     *
     * <p>JPQL 写法更稳：避免派生方法名太长触达 Hibernate 关键字冲突。</p>
     */
    boolean existsByPathAndDeletedAtIsNullAndIdNot(String path, Long id);
}

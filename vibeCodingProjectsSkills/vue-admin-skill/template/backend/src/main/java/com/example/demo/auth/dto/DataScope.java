package com.example.demo.auth.dto;

import lombok.Getter;

/**
 * 数据权限范围（四档）。
 *
 * <p>多角色时取「最宽」档位：ALL &gt; DEPT_AND_BELOW &gt; DEPT_ONLY &gt; SELF_ONLY。
 *
 * <p>⚠️ 只实现 ALL/SELF_ONLY 两档属**缺陷**：DEPT_* 会被静默折叠成 SELF_ONLY，
 * 权限看起来"生效"实则失效。
 */
@Getter
public enum DataScope {

    /** 全部数据 */
    ALL(0),
    /** 本部门及以下子部门 */
    DEPT_AND_BELOW(1),
    /** 本部门 */
    DEPT_ONLY(2),
    /** 仅本人 */
    SELF_ONLY(3);

    /** 越小越宽，用于多角色取最宽 */
    private final int width;

    DataScope(int width) {
        this.width = width;
    }

    public static DataScope widestOf(Iterable<String> scopes) {
        DataScope widest = null;
        for (String s : scopes) {
            if (s == null) continue;
            DataScope cur;
            try {
                cur = DataScope.valueOf(s.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                continue;
            }
            if (widest == null || cur.width < widest.width) widest = cur;
        }
        return widest == null ? DataScope.SELF_ONLY : widest;
    }
}

package com.example.demo.common;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * VO 时间字段统一格式：`yyyy-MM-dd HH:mm:ss`。
 *
 * <p>契约要求所有出参的时间字段都是该格式的字符串，禁止直接吐 LocalDateTime 的 ISO 形态。</p>
 */
public final class DateTimeFormat {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateTimeFormat() {
    }

    public static String format(LocalDateTime time) {
        return time == null ? null : FORMATTER.format(time);
    }
}

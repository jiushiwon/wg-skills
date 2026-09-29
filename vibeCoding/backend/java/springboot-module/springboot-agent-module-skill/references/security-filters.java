package {basePackage}.agent.agent;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Prompt Injection 防护
 * 对用户输入进行 XML 标签转义，防止伪装 Tool 结果或 System 指令
 */
@Component
public class PromptSanitizer {

    /** XML 标签正则 */
    private static final Pattern XML_TAG_PATTERN = Pattern.compile("<[^>]+>");

    /** 危险指令关键词 */
    private static final Pattern INJECTION_PATTERN = Pattern.compile(
        "(?i)(ignore|forget|disregard|override|system\\s*prompt|assistant\\s*prompt|you\\s*are\\s*now)",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * 清理用户输入
     * 转义 XML 标签，防止 Prompt Injection
     */
    public String sanitize(String input) {
        if (input == null) return null;

        String result = input;

        // 1. 转义 XML 标签
        result = XML_TAG_PATTERN.matcher(result).replaceAll(match -> {
            String tag = match.group();
            return "&lt;" + tag.substring(1, tag.length() - 1) + "&gt;";
        });

        // 2. 检测注入关键词（记录告警，不阻断）
        if (INJECTION_PATTERN.matcher(result).find()) {
            // 审计日志记录（由调用方处理）
        }

        return result;
    }

    /**
     * 检测是否包含注入尝试
     */
    public boolean detectInjection(String input) {
        if (input == null) return false;
        return INJECTION_PATTERN.matcher(input).find() || XML_TAG_PATTERN.matcher(input).find();
    }
}

package {basePackage}.agent.trace;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.UUID;

/**
 * trace_id 关联过滤器
 * 自动从 X-Trace-Id 请求头读取/生成，注入 MDC，写入响应头
 * 注意：安全响应头（X-Frame-Options 等）由骨架 SecurityConfig 统一管理，此处不重复配置
 */
@Component
public class TraceIdFilter implements Filter {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    private static final String MDC_KEY = "trace_id";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String traceId = httpRequest.getHeader(TRACE_ID_HEADER);
        if (!StringUtils.hasText(traceId)) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }

        // 注入 MDC（所有日志自动携带）
        MDC.put(MDC_KEY, traceId);

        // 写入响应头
        httpResponse.setHeader(TRACE_ID_HEADER, traceId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}

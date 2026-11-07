package com.example.demo.controller;

import com.example.demo.common.CurrentUser;
import com.example.demo.service.SseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name = "SSE 流式")
@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    @Operation(summary = "SSE 公共示例")
    @GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat() {
        return sseService.chat(null);
    }

    @Operation(summary = "SSE 鉴权示例")
    @GetMapping(value = "/chat/protected", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatProtected(@CurrentUser Long userId) {
        return sseService.chat(userId);
    }
}
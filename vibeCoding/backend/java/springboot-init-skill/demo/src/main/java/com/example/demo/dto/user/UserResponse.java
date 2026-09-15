package com.example.demo.dto.user;

import com.example.demo.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setNickname(u.getNickname());
        r.setEmail(u.getEmail());
        r.setPhone(u.getPhone());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
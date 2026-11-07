package com.example.demo.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank
    @Size(min = 4, max = 64)
    private String username;

    @NotBlank
    @Size(min = 6, max = 64)
    private String password;

    private String nickname;

    @Email
    private String email;
}
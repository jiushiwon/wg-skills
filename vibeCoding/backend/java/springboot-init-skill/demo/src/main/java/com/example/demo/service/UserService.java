package com.example.demo.service;

import com.example.demo.common.BusinessException;
import com.example.demo.dto.user.ChangePasswordRequest;
import com.example.demo.dto.user.CreateUserRequest;
import com.example.demo.dto.user.UpdateProfileRequest;
import com.example.demo.dto.user.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> list(int page, int size) {
        Page<User> p = userRepository.findAll(PageRequest.of(Math.max(0, page - 1), size));
        return p.map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User u = userRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        return UserResponse.from(u);
    }

    @Transactional
    public UserResponse create(CreateUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw BusinessException.conflict("用户名已存在");
        }
        User u = User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .nickname(req.getNickname())
            .email(req.getEmail())
            .build();
        return UserResponse.from(userRepository.save(u));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User u = userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        if (req.getNickname() != null) u.setNickname(req.getNickname());
        if (req.getEmail() != null) u.setEmail(req.getEmail());
        return UserResponse.from(userRepository.save(u));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User u = userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        if (!passwordEncoder.matches(req.getOldPassword(), u.getPassword())) {
            throw BusinessException.badRequest("原密码错误");
        }
        u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(u);
    }
}
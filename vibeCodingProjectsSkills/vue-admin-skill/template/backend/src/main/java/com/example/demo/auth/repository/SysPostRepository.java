package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SysPostRepository extends JpaRepository<SysPost, Long> {
    boolean existsByCode(String code);
}

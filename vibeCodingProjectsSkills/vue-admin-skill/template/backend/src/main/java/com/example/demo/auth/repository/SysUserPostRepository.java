package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysUserPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysUserPostRepository extends JpaRepository<SysUserPost, Long> {

    List<SysUserPost> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM SysUserPost up WHERE up.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}

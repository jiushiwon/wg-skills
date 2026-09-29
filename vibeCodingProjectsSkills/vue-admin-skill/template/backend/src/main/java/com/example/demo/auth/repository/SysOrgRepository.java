package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysOrg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysOrgRepository extends JpaRepository<SysOrg, Long> {
    List<SysOrg> findAllByOrderBySortOrderAscIdAsc();

    long countByParentIdAndDeletedAtIsNull(Long parentId);
}

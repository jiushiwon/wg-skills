package com.example.demo.example.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.DateTimeFormat;
import com.example.demo.common.PageRequest;
import com.example.demo.common.PageResponse;
import com.example.demo.example.dto.ProductVO;
import com.example.demo.example.dto.SaveProductRequest;
import com.example.demo.example.entity.Product;
import com.example.demo.example.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "商品管理")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    @Operation(summary = "商品列表")
    @PreAuthorize("hasAuthority('example:product:list')")
    @GetMapping
    public ApiResponse<PageResponse<ProductVO>> list(PageRequest pageReq,
                                                     @RequestParam(required = false) String keyword) {
        Sort sort = Sort.by(Sort.Direction.DESC, "id");
        Page<Product> page = productRepository.findAll((root, query, cb) -> {
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword + "%";
                return cb.or(
                    cb.like(root.get("name"), like),
                    cb.like(root.get("code"), like)
                );
            }
            return cb.conjunction();
        }, pageReq.toPageable(sort));
        return ApiResponse.success(PageResponse.from(page.map(this::toVO)));
    }

    @Operation(summary = "商品详情")
    @PreAuthorize("hasAuthority('example:product:list')")
    @GetMapping("/{id}")
    public ApiResponse<ProductVO> detail(@PathVariable Long id) {
        return ApiResponse.success(toVO(get(id)));
    }

    @Operation(summary = "创建商品")
    @PreAuthorize("hasAuthority('example:product:create')")
    @PostMapping
    public ApiResponse<ProductVO> create(@Valid @RequestBody SaveProductRequest req) {
        if (productRepository.existsByCode(req.getCode())) {
            throw BusinessException.conflict("商品编码已存在");
        }
        Product p = new Product();
        apply(p, req);
        return ApiResponse.success(toVO(productRepository.save(p)));
    }

    @Operation(summary = "更新商品")
    @PreAuthorize("hasAuthority('example:product:edit')")
    @PutMapping("/{id}")
    public ApiResponse<ProductVO> update(@PathVariable Long id, @Valid @RequestBody SaveProductRequest req) {
        Product existing = get(id);
        apply(existing, req);
        return ApiResponse.success(toVO(productRepository.save(existing)));
    }

    @Operation(summary = "删除商品")
    @PreAuthorize("hasAuthority('example:product:delete')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    private Product get(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("商品不存在"));
    }

    /** 入参 DTO → 实体。id / createdAt / updatedAt 一律不接收，防 mass assignment。 */
    private void apply(Product p, SaveProductRequest req) {
        p.setName(req.getName());
        p.setCode(req.getCode());
        p.setCategory(req.getCategory());
        p.setPrice(req.getPrice() == null ? BigDecimal.ZERO : req.getPrice());
        p.setStock(req.getStock() == null ? 0 : req.getStock());
        p.setDescription(req.getDescription());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
    }

    private ProductVO toVO(Product p) {
        ProductVO vo = new ProductVO();
        vo.setId(p.getId());
        vo.setName(p.getName());
        vo.setCode(p.getCode());
        vo.setCategory(p.getCategory());
        vo.setPrice(p.getPrice());
        vo.setStock(p.getStock());
        vo.setDescription(p.getDescription());
        vo.setStatus(p.getStatus());
        vo.setCreatedAt(DateTimeFormat.format(p.getCreatedAt()));
        vo.setUpdatedAt(DateTimeFormat.format(p.getUpdatedAt()));
        return vo;
    }
}

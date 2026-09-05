package com.raajwarasa.controller;

import com.raajwarasa.dto.CategoryResponse;
import com.raajwarasa.entity.Category;
import com.raajwarasa.repository.CategoryRepository;
import com.raajwarasa.util.Slugs;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;

    public record CategoryRequest(
            @NotBlank(message = "Name is required") @Size(max = 120) String name,
            @Size(max = 140) String slug,
            @Size(max = 500) String description) {
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return categoryRepository.findAll().stream().map(CategoryResponse::from).toList();
    }

    @PostMapping
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name().trim());
        String slug = Slugs.slugify(request.slug() != null && !request.slug().isBlank() ? request.slug() : request.name());
        category.setSlug(uniqueSlug(slug, null));
        category.setDescription(request.description());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.setName(request.name().trim());
        category.setSlug(uniqueSlug(Slugs.slugify(request.slug() != null && !request.slug().isBlank() ? request.slug() : request.name()), id));
        category.setDescription(request.description());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return Map.of("success", true);
    }

    private String uniqueSlug(String slug, Long ignoreId) {
        String candidate = Slugs.slugify(slug);
        if (candidate.isBlank()) candidate = "category";
        int n = 2;
        while (categoryRepository.findBySlug(candidate).isPresent()
                && !categoryRepository.findBySlug(candidate).get().getId().equals(ignoreId)) {
            candidate = Slugs.slugify(slug) + "-" + n++;
        }
        return candidate;
    }
}
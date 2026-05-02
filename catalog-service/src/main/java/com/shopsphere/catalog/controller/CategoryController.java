package com.shopsphere.catalog.controller;

import com.shopsphere.catalog.dto.CategoryDTO;
import com.shopsphere.catalog.service.CategoryService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // CREATE
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public CategoryDTO createCategory(@Valid @RequestBody CategoryDTO category) {
        return categoryService.createCategory(category);
    }

    // READ ALL
    @GetMapping
    public List<CategoryDTO> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // READ ONE
    @GetMapping("/{id}")
    public CategoryDTO getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    // UPDATE
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public CategoryDTO updateCategory(@PathVariable Long id,
                                   @Valid @RequestBody CategoryDTO category) {
        return categoryService.updateCategory(id, category);
    }

    // DELETE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return "Category deleted successfully";
    }
}
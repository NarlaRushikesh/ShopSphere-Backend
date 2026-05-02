package com.shopsphere.catalog.service;

import com.shopsphere.catalog.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {

    CategoryDTO createCategory(CategoryDTO category);

    List<CategoryDTO> getAllCategories();
    
    CategoryDTO getCategoryById(Long id);

    void deleteCategory(Long id);

	CategoryDTO updateCategory(Long id, CategoryDTO category);
}
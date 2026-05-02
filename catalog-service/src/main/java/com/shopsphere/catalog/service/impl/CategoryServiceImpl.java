package com.shopsphere.catalog.service.impl;

import com.shopsphere.catalog.dto.CategoryDTO;
import com.shopsphere.catalog.entity.Category;
import com.shopsphere.catalog.repository.CategoryRepository;
import com.shopsphere.catalog.service.CategoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    private CategoryDTO mapToDTO(Category category) {
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getImageUrl()
        );
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO dto) {

        Optional<Category> existing = categoryRepository
                .findByNameIgnoreCase(dto.getName());

        if (existing.isPresent()) {
            return mapToDTO(existing.get()); 
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return mapToDTO(categoryRepository.save(category));
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToDTO(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
                
        // Business Rule: Prevent deleting category with products
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new RuntimeException("Cannot delete category containing products");
        }
        
        categoryRepository.deleteById(id);
    }

	@Override
	public CategoryDTO updateCategory(Long id, CategoryDTO dto) {

	    Category existing = categoryRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Category not found"));
	    
	    existing.setName(dto.getName());
	    existing.setDescription(dto.getDescription());

	    return mapToDTO(categoryRepository.save(existing));
	}
}
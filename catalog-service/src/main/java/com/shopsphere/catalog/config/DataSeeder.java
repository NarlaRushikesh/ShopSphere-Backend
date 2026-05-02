package com.shopsphere.catalog.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.catalog.entity.Category;
import com.shopsphere.catalog.entity.Product;
import com.shopsphere.catalog.repository.CategoryRepository;
import com.shopsphere.catalog.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSeeder {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataSeeder(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (categoryRepository.count() == 0) {
                try {
                    System.out.println("📦 No data found. Fetching categories from dummyjson...");
                    RestTemplate restTemplate = new RestTemplate();
                    ObjectMapper mapper = new ObjectMapper();

                    String categoriesUrl = "https://dummyjson.com/products/categories";
                    String categoriesJson = restTemplate.getForObject(categoriesUrl, String.class);
                    JsonNode categoriesNode = mapper.readTree(categoriesJson);

                    Map<String, Category> categoryMap = new HashMap<>();

                    for (JsonNode catNode : categoriesNode) {
                        String slug = catNode.has("slug") ? catNode.get("slug").asText() : null;
                        String name = catNode.has("name") ? catNode.get("name").asText() : (slug != null ? slug : "Unknown");
                        
                        if (slug == null) continue; // Skip if no slug

                        Category category = new Category();
                        category.setName(name);
                        category.setDescription(name + " products");
                        
                        // source.unsplash.com is deprecated, using picsum.photos instead for reliable placeholder images
                        category.setImageUrl("https://picsum.photos/seed/" + slug + "/400/300");
                        
                        category = categoryRepository.save(category);
                        categoryMap.put(slug, category);
                    }
                    
                    System.out.println("✅ Categories seeded!");

                    // 2. Fetch Products
                    System.out.println("🛒 Fetching and seeding products...");
                    // Full 194 products as requested in bonus
                    String productsUrl = "https://dummyjson.com/products?limit=194";
                    String productsJson = restTemplate.getForObject(productsUrl, String.class);
                    JsonNode productsRoot = mapper.readTree(productsJson);
                    JsonNode productsNode = productsRoot.get("products");

                    for (JsonNode prodNode : productsNode) {
                        String categorySlug = prodNode.has("category") ? prodNode.get("category").asText() : null;
                        Category category = categoryMap.get(categorySlug);

                        Product product = new Product();
                        product.setName(prodNode.get("title").asText());
                        product.setDescription(prodNode.has("description") ? prodNode.get("description").asText() : "");
                        product.setPrice(prodNode.get("price").asDouble() * 83.0); // Convert USD to INR
                        product.setStock(prodNode.get("stock").asInt());
                        product.setBrand(prodNode.has("brand") ? prodNode.get("brand").asText() : "Generic");
                        
                        if (prodNode.has("images") && prodNode.get("images").isArray() && prodNode.get("images").size() > 0) {
                            product.setImageUrl(prodNode.get("images").get(0).asText());
                        }
                        
                        if (prodNode.has("thumbnail")) {
                            product.setThumbnail(prodNode.get("thumbnail").asText());
                        }
                        
                        product.setFeatured(false);
                        product.setCategory(category);

                        productRepository.save(product);
                    }
                    System.out.println("🎉 Data Imported Successfully! Total Categories: " + categoryRepository.count() + " | Total Products: " + productRepository.count());
                } catch (Exception e) {
                    System.err.println("❌ Error during data seeding: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("✅ Database already contains data. Skipping seeding.");
            }
        };
    }
}

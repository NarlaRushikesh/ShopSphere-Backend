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
            // Always ensure 'Testing' category exists for Razorpay testing
            Category testingCategory = categoryRepository.findByName("Testing").orElseGet(() -> {
                Category cat = new Category();
                cat.setName("Testing");
                cat.setDescription("Category for payment testing");
                cat.setImageUrl("https://picsum.photos/seed/testing/400/300");
                return categoryRepository.save(cat);
            });

            // Always ensure 'Test 1 Rupee Product' exists
            if (productRepository.findByName("Test 1 Rupee Product").isEmpty()) {
                Product testProduct = new Product();
                testProduct.setName("Test 1 Rupee Product");
                testProduct.setDescription("A low-cost product for testing Razorpay integration.");
                testProduct.setPrice(1.0); // 1 Rupee
                testProduct.setStock(999);
                testProduct.setBrand("ShopSphere");
                testProduct.setImageUrl("https://picsum.photos/seed/testproduct/400/300");
                testProduct.setThumbnail("https://picsum.photos/seed/testproduct/100/100");
                testProduct.setFeatured(true);
                testProduct.setCategory(testingCategory);
                productRepository.save(testProduct);
                System.out.println("✅ Test 1 Rupee Product created successfully!");
            }

            if (categoryRepository.count() <= 1) { // 1 because we just added 'Testing'
                try {
                    System.out.println("📦 No data found. Fetching categories from dummyjson...");
                    RestTemplate restTemplate = new RestTemplate();
                    ObjectMapper mapper = new ObjectMapper();

                    String categoriesUrl = "https://dummyjson.com/products/categories";
                    String categoriesJson = restTemplate.getForObject(categoriesUrl, String.class);
                    JsonNode categoriesNode = mapper.readTree(categoriesJson);

                    Map<String, Category> categoryMap = new HashMap<>();
                    categoryMap.put("testing", testingCategory);

                    for (JsonNode catNode : categoriesNode) {
                        String slug = catNode.has("slug") ? catNode.get("slug").asText() : null;
                        String name = catNode.has("name") ? catNode.get("name").asText() : (slug != null ? slug : "Unknown");
                        
                        if (slug == null || name.equalsIgnoreCase("Testing")) continue; 

                        Category category = new Category();
                        category.setName(name);
                        category.setDescription(name + " products");
                        category.setImageUrl("https://picsum.photos/seed/" + slug + "/400/300");
                        
                        category = categoryRepository.save(category);
                        categoryMap.put(slug, category);
                    }
                    
                    System.out.println("✅ Categories seeded!");

                    // 2. Fetch Products
                    System.out.println("🛒 Fetching and seeding products...");
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
                    System.out.println("🎉 Data Imported Successfully!");
                } catch (Exception e) {
                    System.err.println("❌ Error during data seeding: " + e.getMessage());
                }
            } else {
                System.out.println("✅ Database already contains data. Skipping full dummyjson seeding.");
            }
        };
    }
}

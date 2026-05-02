package com.shopsphere.catalog.config;

import com.shopsphere.catalog.entity.Product;
import com.shopsphere.catalog.repository.CategoryRepository;
import com.shopsphere.catalog.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PriceUpdater implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public PriceUpdater(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=================================================");
        System.out.println("     PRICE UPDATER AND CATEGORY CHECK            ");
        System.out.println("=================================================");

        // 1. Print all categories so we can fix the images
        System.out.println("Available Categories in DB:");
        categoryRepository.findAll().forEach(cat -> {
            System.out.println(" -> " + cat.getName());
        });

        // 2. Multiply prices by 83 if they look like USD prices
        long count = productRepository.count();
        if (count > 0) {
            List<Product> products = productRepository.findAll();
            // We check the first product's price. If it's suspiciously low (e.g., < 1000 for a smartphone or typical item)
            // or we just check if it's not already updated. The dummyjson prices are generally between 10 and 1500.
            // When multiplied by 83, they will be 830 to 124500.
            // Let's just update all products whose price is under 5000 (just a heuristic) or just update them all if 
            // a specific dummy product is under its INR value.
            // A safer way: Check if max price < 5000. DummyJson max price is ~1749 (a laptop).
            // So if max price < 5000, we definitely need to multiply by 83.
            
            double maxPrice = products.stream().mapToDouble(Product::getPrice).max().orElse(0);
            
            // Increased threshold to 40000 to ensure prices are multiplied if they are still un-converted USD prices
            // (Max USD price in seed data is ~36999.99 for a vehicle)
            if (maxPrice < 40000) {
                System.out.println("Prices appear to be in USD (Max price " + maxPrice + "). Multiplying all by 83...");
                for (Product p : products) {
                    p.setPrice(p.getPrice() * 83.0);
                }
                productRepository.saveAll(products);
                System.out.println("Successfully converted " + products.size() + " products to INR.");
            } else {
                System.out.println("Prices appear to already be in INR (Max price " + maxPrice + "). Skipping conversion.");
            }
        }
        
        System.out.println("=================================================");
    }
}

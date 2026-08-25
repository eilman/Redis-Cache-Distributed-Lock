package com.redis.advanced.service;

import com.redis.advanced.model.Product;
import com.redis.advanced.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostConstruct
    public void seedData() {
        if (productRepository.count() == 0) {
            productRepository.save(new Product("MacBook Pro 16\"", "electronics", new BigDecimal("74999.99"), 50, "Apple M3 Pro, 36GB RAM"));
            productRepository.save(new Product("iPhone 15 Pro", "electronics", new BigDecimal("54999.99"), 120, "A17 Pro chip, Titanium"));
            productRepository.save(new Product("Sony WH-1000XM5", "electronics", new BigDecimal("9499.99"), 200, "Noise cancelling headphones"));
            productRepository.save(new Product("Clean Code", "books", new BigDecimal("149.99"), 500, "Robert C. Martin"));
            productRepository.save(new Product("Redis in Action", "books", new BigDecimal("199.99"), 300, "Josiah Carlson"));
            log.info("Seed data loaded: 5 products");
        }
    }

    public Optional<Product> findById(Long id) {
        simulateDbLatency();
        return productRepository.findById(id);
    }

    public Product save(Product product) {
        simulateDbLatency();
        return productRepository.save(product);
    }

    private void simulateDbLatency() {
        try {
            Thread.sleep(100 + (long) (Math.random() * 150));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Order;

import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {
	List<Order> findByUserId(String userId);

	@Query("SELECT SUM(o.totalAmount) FROM Order o")
	Double getTotalRevenue();
}
package com.vilapark.repository;

import com.vilapark.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    @Query("select coalesce(sum(i.amount), 0) from Income i")
    BigDecimal sumAmount();

    // ให้เลือกได้ทั้งตาม createdAt และ id
    Optional<Income> findTopByOrderByCreatedAtDesc();
    Optional<Income> findTopByOrderByIdDesc();
}

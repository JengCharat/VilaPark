package com.vilapark.repository;

import com.vilapark.entity.DailyUpdate;
import com.vilapark.entity.Cat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyUpdateRepository extends JpaRepository<DailyUpdate, Long> {

    List<DailyUpdate> findByCat(Cat cat);

    Optional<DailyUpdate> findByCatAndUpdateDate(Cat cat, LocalDate updateDate);
}

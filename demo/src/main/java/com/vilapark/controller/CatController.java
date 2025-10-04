package com.vilapark.controller;

import com.vilapark.entity.Cat;
import com.vilapark.repository.CatRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/cats")
@CrossOrigin(origins = "*")

public class CatController {

    private final CatRepository repo;

    public CatController(CatRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Cat> getAll() {
        return repo.findAll(); // ถ้าไม่มี record จะคืน [] เป็น empty list
    }

    @PostMapping
    public Cat add(@RequestBody Cat student) {
        return repo.save(student); // POST ต้องไม่ส่ง id
    }

    @GetMapping("/owner/{ownerId}")
    public List<Cat> getCatsByOwner(@PathVariable Long ownerId) {
        return repo.findByOwnerId(ownerId);
    }

    @GetMapping("/by-owner/{ownerId}")
    public ResponseEntity<List<Cat>> getCatsByOwnerId(@PathVariable Long ownerId) {
        List<Cat> cats = repo.findByOwnerId(ownerId);
        return ResponseEntity.ok(cats);
    }

}

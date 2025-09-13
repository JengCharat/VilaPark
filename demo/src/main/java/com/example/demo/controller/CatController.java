package com.example.demo.controller;

import com.example.demo.entity.Cat;
import com.example.demo.repository.CatRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
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
}

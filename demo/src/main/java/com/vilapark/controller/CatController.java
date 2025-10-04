package com.vilapark.controller;

import com.vilapark.entity.Cat;
import com.vilapark.repository.CatRepository;
import org.springframework.http.ResponseEntity;           // ✅ เพิ่ม import นี้
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

    // GET /cats
    @GetMapping
    public List<Cat> getAll() {
        return repo.findAll();
    }

    // GET /cats/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Cat> getOne(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /cats/owner/{ownerId}
    @GetMapping("/owner/{ownerId}")
    public List<Cat> getCatsByOwner(@PathVariable Long ownerId) {
        return repo.findByOwnerId(ownerId);
    }

    // POST /cats
    @PostMapping
    public ResponseEntity<Cat> add(@RequestBody Cat cat) { // ✅ เปลี่ยนชื่อให้สื่อความ
        Cat saved = repo.save(cat);
        return ResponseEntity.ok(saved);
        // หรืออยากได้ 201:
        // return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}

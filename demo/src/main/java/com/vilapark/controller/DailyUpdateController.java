package com.vilapark.controller;

import com.vilapark.entity.DailyUpdate;
import com.vilapark.entity.Cat;
import com.vilapark.repository.DailyUpdateRepository;
import com.vilapark.repository.CatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/daily-updates")
@CrossOrigin(origins = "*")
public class DailyUpdateController {

    @Autowired
    private DailyUpdateRepository dailyUpdateRepository;

    @Autowired
    private CatRepository catRepository;

    // ดึงทั้งหมด
    @GetMapping
    public List<DailyUpdate> getAll() {
        return dailyUpdateRepository.findAll();
    }

    // ดึงตาม catId
    @GetMapping("/cat/{catId}")
    public ResponseEntity<List<DailyUpdate>> getByCat(@PathVariable Long catId) {
        Optional<Cat> cat = catRepository.findById(catId);
        if (!cat.isPresent()) return ResponseEntity.notFound().build();
        List<DailyUpdate> updates = dailyUpdateRepository.findByCat(cat.get());
        return ResponseEntity.ok(updates);
    }

    // ดึงตาม catId + date
    @GetMapping("/cat/{catId}/date/{date}")
    public ResponseEntity<DailyUpdate> getByCatAndDate(@PathVariable Long catId, @PathVariable String date) {
        Optional<Cat> cat = catRepository.findById(catId);
        if (!cat.isPresent()) return ResponseEntity.notFound().build();

        LocalDate updateDate = LocalDate.parse(date);
        Optional<DailyUpdate> dailyUpdate = dailyUpdateRepository.findByCatAndUpdateDate(cat.get(), updateDate);
        return dailyUpdate.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // สร้าง DailyUpdate
    @PostMapping
    public ResponseEntity<DailyUpdate> create(@RequestBody DailyUpdate dailyUpdate) {
        if (dailyUpdate.getCat() == null || dailyUpdate.getCat().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Cat> cat = catRepository.findById(dailyUpdate.getCat().getId());
        if (!cat.isPresent()) return ResponseEntity.badRequest().build();

        dailyUpdate.setCat(cat.get());
        DailyUpdate saved = dailyUpdateRepository.save(dailyUpdate);
        return ResponseEntity.ok(saved);
    }

    // อัปเดต
    @PutMapping("/{id}")
    public ResponseEntity<DailyUpdate> update(@PathVariable Long id, @RequestBody DailyUpdate updateDetails) {
        Optional<DailyUpdate> optionalUpdate = dailyUpdateRepository.findById(id);
        if (!optionalUpdate.isPresent()) return ResponseEntity.notFound().build();

        DailyUpdate update = optionalUpdate.get();
        if (updateDetails.getCat() != null && updateDetails.getCat().getId() != null) {
            Optional<Cat> cat = catRepository.findById(updateDetails.getCat().getId());
            cat.ifPresent(update::setCat);
        }

        update.setUpdateDate(updateDetails.getUpdateDate());
        update.setMood(updateDetails.getMood());
        update.setActivity(updateDetails.getActivity());
        update.setSpecialNotes(updateDetails.getSpecialNotes());
        update.setImageUrls(updateDetails.getImageUrls());
        update.setChecklist(updateDetails.getChecklist());
        update.setMessageToOwner(updateDetails.getMessageToOwner());

        DailyUpdate saved = dailyUpdateRepository.save(update);
        return ResponseEntity.ok(saved);
    }

    // ลบ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!dailyUpdateRepository.existsById(id)) return ResponseEntity.notFound().build();
        dailyUpdateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
public ResponseEntity<List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
    List<String> urls = new ArrayList<>();
    try {
        for (MultipartFile file : files) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get("uploads/" + fileName);
            Files.createDirectories(path.getParent()); // สร้าง folder ถ้ายังไม่มี
            Files.write(path, file.getBytes());
            urls.add("/uploads/" + fileName);
        }
        return ResponseEntity.ok(urls);
    } catch (IOException e) {
        e.printStackTrace(); // log error
        return ResponseEntity.status(500).build();
    }

}
}

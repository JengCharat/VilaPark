package com.vilapark.controller;

import com.vilapark.entity.Room;
import com.vilapark.repository.RoomRepository;
import org.springframework.http.ResponseEntity;    // ✅ เพิ่ม
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")                      // base path ของ controller นี้
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // ✅ GET /rooms   (เอา "/rooms" ออก เพราะมีที่ class แล้ว)
    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // ✅ GET /rooms/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /rooms
    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        Room saved = roomRepository.save(room);
        return ResponseEntity.ok(saved);
    }

    // PUT /rooms/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        return roomRepository.findById(id).map(room -> {
            room.setRoomNumber(roomDetails.getRoomNumber());
            room.setType(roomDetails.getType());
            room.setPrice(roomDetails.getPrice());
            room.setStatus(roomDetails.getStatus());
            return ResponseEntity.ok(roomRepository.save(room));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /rooms/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        if (!roomRepository.existsById(id)) return ResponseEntity.notFound().build();
        roomRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

package com.vilapark.controller;

import com.vilapark.entity.Room;
import com.vilapark.repository.RoomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
// @RequestMapping("/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // ดึงข้อมูลห้องทั้งหมด
    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // ดึงข้อมูลห้องตาม ID
    @GetMapping("/{id}")
    public Optional<Room> getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id);
    }

    // เพิ่มห้องใหม่
    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        return roomRepository.save(room);
    }

    // แก้ไขข้อมูลห้อง
    @PutMapping("/{id}")
    public Room updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        return roomRepository.findById(id).map(room -> {
            room.setRoomNumber(roomDetails.getRoomNumber());
            room.setType(roomDetails.getType());
            room.setPrice(roomDetails.getPrice());
            room.setStatus(roomDetails.getStatus());
            return roomRepository.save(room);
        }).orElseThrow(() -> new RuntimeException("ไม่พบห้อง ID: " + id));
    }

    // ลบห้อง
    @DeleteMapping("/{id}")
    public String deleteRoom(@PathVariable Long id) {
        roomRepository.deleteById(id);
        return "ห้อง ID " + id + " ถูกลบแล้ว";
    }
}

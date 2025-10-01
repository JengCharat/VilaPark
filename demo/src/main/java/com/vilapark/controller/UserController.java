package com.vilapark.controller;

import com.vilapark.models.User;
import com.vilapark.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.vilapark.dto.UserDTO;
import com.vilapark.dto.RoleDTO;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // --------- สร้าง User ---------
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // --------- ดึง User ทั้งหมด ---------
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // --------- ดึง User ตาม ID ---------
            @GetMapping("/{id}")
            public UserDTO getUserById(@PathVariable Long id) {
                User user = userRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

                UserDTO dto = new UserDTO();
                dto.setId(user.getId());
                dto.setUsername(user.getUsername());
                dto.setEmail(user.getEmail());
                dto.setName(user.getName());
                dto.setLastname(user.getLastname());
                dto.setPhonenumber(user.getPhonenumber());
                dto.setAddress(user.getAddress());

                // แปลง role id จาก Integer → Long และ enum → String
                List<RoleDTO> roles = user.getRoles().stream().map(role -> {
                    RoleDTO r = new RoleDTO();
                    
                    // แปลง Integer → Long
                    r.setId(role.getId() != null ? role.getId().longValue() : null);
                    
                    // แปลง enum → String
                    r.setName(role.getName() != null ? role.getName().name() : null);
                    
                    return r;
                }).toList();

                dto.setRoles(roles);

                return dto;
            }

    // --------- อัปเดต User ---------
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setPassword(userDetails.getPassword());
        user.setEnabled(userDetails.isEnabled());
        user.setName(userDetails.getName());
        user.setLastname(userDetails.getLastname());
        user.setPhonenumber(userDetails.getPhonenumber());
        user.setAddress(userDetails.getAddress());

        return userRepository.save(user);
    }

    // --------- ลบ User ---------
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return "Deleted User with id: " + id;
    }
}

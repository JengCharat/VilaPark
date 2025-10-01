// dto is Data Transfer Object
//
// why we have yo use dto
//
// example we have entity 
//
// public class User {
//     private Long id;
//     private String username;
//     private String password; // we don't want to send this to user so
// }
// we create dto
//
// public class UserDTO {
//     private Long id;
//     private String username;
// }
//
//
// and in controller 
// @GetMapping("/user/{id}")
// public UserDTO getUser(@PathVariable Long id) {
//     User user = userRepository.findById(id).get();
//     UserDTO dto = new UserDTO();
//     dto.setId(user.getId());
//     dto.setUsername(user.getUsername());
//     return dto;
// }
//
// if we do like this user will not get the password
//
package com.vilapark.dto;

import java.util.List;

public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private String name;
    private String lastname;
    private String phonenumber;
    private String address;
    private List<RoleDTO> roles;

    // ------------------ Getters & Setters ------------------
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getPhonenumber() {
        return phonenumber;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<RoleDTO> getRoles() {
        return roles;
    }

    public void setRoles(List<RoleDTO> roles) {
        this.roles = roles;
    }
}

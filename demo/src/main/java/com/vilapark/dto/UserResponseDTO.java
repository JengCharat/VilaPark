
package com.vilapark.dto;

import org.hibernate.type.SetType;

public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private boolean enabled;
    private String name;
    private String lastname;
    private String phonenumber;
    private String address;

    // Constructor
    public UserResponseDTO(Long id, String username, String email, boolean enabled,
                           String name, String lastname, String phonenumber, String address) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.enabled = enabled;
        this.name = name;
        this.lastname = lastname;
        this.phonenumber = phonenumber;
        this.address = address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setLastname(String lastname) {
        this.lastname = lastname;
    }
    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }
    public String getLastname() {
        return lastname;
    }
    public String getAddress() {
        return address;
    }
    public String getEmail() {
        return email;
    }
    public String getName() {
        return name;
    }
    public Long getId() {
        return id;
    }
    public String getPhonenumber() {
        return phonenumber;
    }
    public String getUsername() {
        return username;
    }
}

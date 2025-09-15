package com.vilapark.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "cat") // ชื่อ table ชัดเจน
public class Cat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    public Cat() {} // default constructor สำคัญ

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

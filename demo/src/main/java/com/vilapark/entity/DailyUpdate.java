package com.vilapark.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@Entity
@Table(name = "daily_updates")
public class DailyUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ความสัมพันธ์กับ Cat
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cat_id", nullable = false)
   @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Cat cat;

    @Column(name = "update_date", nullable = false)
    private LocalDate updateDate;

    @Column(name = "mood")
    private String mood;

    @Column(name = "activity")
    private String activity;

    @Lob
    @Column(name = "special_notes")
    private String specialNotes;

    // Image URLs (รองรับหลายรูป)
    @ElementCollection
    @CollectionTable(name = "daily_update_images", joinColumns = @JoinColumn(name = "daily_update_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    // Daily checklist
    @ElementCollection
    @CollectionTable(name = "daily_update_checklist", joinColumns = @JoinColumn(name = "daily_update_id"))
    @Column(name = "item")
    private List<String> checklist;

    @Column(name = "message_to_owner", columnDefinition = "TEXT")
    private String messageToOwner;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cat getCat() { return cat; }
    public void setCat(Cat cat) { this.cat = cat; }
    public LocalDate getUpdateDate() { return updateDate; }
    public void setUpdateDate(LocalDate updateDate) { this.updateDate = updateDate; }
    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }
    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
    public String getSpecialNotes() { return specialNotes; }
    public void setSpecialNotes(String specialNotes) { this.specialNotes = specialNotes; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public List<String> getChecklist() { return checklist; }
    public void setChecklist(List<String> checklist) { this.checklist = checklist; }
    public String getMessageToOwner() { return messageToOwner; }
    public void setMessageToOwner(String messageToOwner) { this.messageToOwner = messageToOwner; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

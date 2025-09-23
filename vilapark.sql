-- this is after you import vilapark.sql 

-- ความสัมพันธ์ Users ↔ Cats

ALTER TABLE cat
  ADD COLUMN owner_id BIGINT,
  ADD CONSTRAINT fk_cat_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;


-- ตารางห้องพัก (Rooms)

CREATE TABLE rooms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('AVAILABLE','BOOKED','MAINTENANCE') DEFAULT 'AVAILABLE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
          

-- ตารางการจอง (Bookings)

CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  cat_id BIGINT NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  status ENUM('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id),
  CONSTRAINT fk_booking_cat FOREIGN KEY (cat_id) REFERENCES cat(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


-- ตารางอัปเดตรายวัน (Daily Updates)

CREATE TABLE daily_updates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  staff_id BIGINT NOT NULL,
  update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message TEXT,
  photo_url VARCHAR(255),

  CONSTRAINT fk_update_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_update_staff FOREIGN KEY (staff_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;




-- ตารางสต็อกสินค้า (Inventory)

CREATE TABLE inventory (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;




-- ตารางการเงิน / บิล (Billing)

CREATE TABLE billing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP NULL,

  CONSTRAINT fk_billing_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
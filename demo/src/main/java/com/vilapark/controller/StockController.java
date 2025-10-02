package com.vilapark.controller;

import com.vilapark.entity.Stock;
import com.vilapark.repository.StockRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "*")
public class StockController {

    private final StockRepository stockRepository;

    public StockController(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @GetMapping
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    @PostMapping
    public Stock createStock(@RequestBody Stock stock) {
        return stockRepository.save(stock);
    }

    /**
     * ค้นหา Stock ตาม ID
     * ถ้าเจอ: คืน status 200 OK พร้อมข้อมูล Stock
     * ถ้าไม่เจอ: คืน status 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStockById(@PathVariable Long id) {
        Optional<Stock> optionalStock = stockRepository.findById(id);

        if (optionalStock.isPresent()) {
            return ResponseEntity.ok(optionalStock.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * เพิ่มจำนวน Stock
     * ถ้าเจอ ID: เพิ่มจำนวนแล้วคืน 200 OK
     * ถ้าไม่เจอ ID: คืน 404 Not Found
     */
    @PutMapping("/{id}/increment")
    public ResponseEntity<?> incrementStockQuantity(@PathVariable Long id) {
        Optional<Stock> optionalStock = stockRepository.findById(id);

        if (optionalStock.isPresent()) {
            Stock stock = optionalStock.get();
            stock.setQuantity(stock.getQuantity() + 1);
            Stock updatedStock = stockRepository.save(stock);
            return ResponseEntity.ok(updatedStock);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * ลดจำนวน Stock
     * ถ้าเจอ ID: ลดจำนวนแล้วคืน 200 OK
     * ถ้าไม่เจอ ID: คืน 404 Not Found
     */
    @PutMapping("/{id}/decrement")
    public ResponseEntity<?> decrementStockQuantity(@PathVariable Long id) {
        Optional<Stock> optionalStock = stockRepository.findById(id);

        if (optionalStock.isPresent()) {
            Stock stock = optionalStock.get();
            if (stock.getQuantity() > 0) {
                stock.setQuantity(stock.getQuantity() - 1);
            }
            Stock updatedStock = stockRepository.save(stock);
            return ResponseEntity.ok(updatedStock);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * ลบ Stock
     * ถ้าเจอ ID: ลบข้อมูลแล้วคืน 204 No Content
     * ถ้าไม่เจอ ID: คืน 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        if (stockRepository.existsById(id)) {
            stockRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
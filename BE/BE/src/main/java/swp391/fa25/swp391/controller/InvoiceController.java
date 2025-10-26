package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.entity.Invoice;
import swp391.fa25.swp391.service.IService.IInvoiceService;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final IInvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<?> getAllInvoices() {
        try {
            List<Invoice> invoices = invoiceService.findAll();
            return ResponseEntity.ok(ApiResponse.success("Retrieved all invoices", invoices));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getInvoicesByDriver(@PathVariable Integer driverId) {
        try {
            List<Invoice> invoices = invoiceService.findByDriverId(driverId);
            return ResponseEntity.ok(ApiResponse.success("Retrieved driver invoices", invoices));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Integer id) {
        try {
            Invoice invoice = invoiceService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));
            return ResponseEntity.ok(ApiResponse.success("Retrieved invoice", invoice));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoice: " + e.getMessage()));
        }
    }

    // ⭐ THÊM MỚI: Lấy unpaid invoices của driver
    @GetMapping("/driver/{driverId}/unpaid")
    public ResponseEntity<?> getUnpaidInvoices(@PathVariable Integer driverId) {
        try {
            List<Invoice> invoices = invoiceService.findByDriverIdAndStatus(driverId, "UNPAID");
            return ResponseEntity.ok(ApiResponse.success("Retrieved unpaid invoices", invoices));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }

    // ⭐ THÊM MỚI: Lấy overdue invoices của driver
    @GetMapping("/driver/{driverId}/overdue")
    public ResponseEntity<?> getOverdueInvoices(@PathVariable Integer driverId) {
        try {
            List<Invoice> invoices = invoiceService.findByDriverIdAndStatus(driverId, "OVERDUE");
            return ResponseEntity.ok(ApiResponse.success("Retrieved overdue invoices", invoices));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error retrieving invoices: " + e.getMessage()));
        }
    }
}
package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.enterprise.GenerateInvoiceRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.entity.Admin;
import swp391.fa25.swp391.entity.EnterpriseInvoice;
import swp391.fa25.swp391.service.IService.IEnterpriseBillingService;

@Slf4j
@RestController
@RequestMapping("/api/admin/billing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
// TODO: Cần giới hạn lại quyền truy cập (ví dụ: @PreAuthorize("hasRole('ADMIN')"))
public class AdminBillingController {

    private final IEnterpriseBillingService enterpriseBillingService;

    /**
     * API cho Admin tạo hóa đơn Enterprise
     */
    @PostMapping("/generate-invoice")
    public ResponseEntity<?> generateInvoice(
            @Valid @RequestBody GenerateInvoiceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Lấy thông tin Admin
            Admin admin = getAdminFromDetails(userDetails);

            EnterpriseInvoice invoice = enterpriseBillingService.generateEnterpriseInvoice(request, admin);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Enterprise invoice generated successfully", invoice));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating enterprise invoice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * API cho Admin xem lại hóa đơn đã tạo
     */
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<?> getInvoiceDetails(
            @PathVariable Integer invoiceId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Xác thực Admin (không bắt buộc, vì chỉ xem)
            getAdminFromDetails(userDetails);

            EnterpriseInvoice invoice = enterpriseBillingService.getEnterpriseInvoiceById(invoiceId);

            // TODO: Tạo một DTO Response đẹp hơn thay vì trả về Entity
            return ResponseEntity.ok(
                    ApiResponse.success("Invoice details retrieved", invoice));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving enterprise invoice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error"));
        }
    }

    /**
     * Helper tìm Admin (Bạn cần implement logic này dựa trên Account)
     */
    private Admin getAdminFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Authentication required");
        }
        // String username = userDetails.getUsername();
        // Giả sử bạn có service: adminService.findByUsername(username)

        // TODO: THAY THẾ LOGIC GIẢ LẬP NÀY
        log.warn("Using MOCK admin logic. Please implement getAdminFromDetails correctly.");
        Admin mockAdmin = new Admin();
        mockAdmin.setId(1); // ID giả
        return mockAdmin;
        // KẾT THÚC LOGIC GIẢ LẬP
    }
}

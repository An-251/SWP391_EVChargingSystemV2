package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.ApprovalRequestDTO;
import swp391.fa25.swp391.dto.request.CashPaymentRequestDTO;
import swp391.fa25.swp391.dto.response.CashPaymentResponse;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.entity.CashPaymentRequest;
import swp391.fa25.swp391.service.CashPaymentRequestService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cash-payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CashPaymentRequestController {

    private final CashPaymentRequestService cashPaymentRequestService;

    /**
     * Create a new cash payment request
     * POST /api/cash-payments/request
     */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse> createPaymentRequest(@RequestBody CashPaymentRequestDTO requestDTO) {
        try {
            CashPaymentRequest request;
            
            if ("INVOICE".equals(requestDTO.getRequestType())) {
                request = cashPaymentRequestService.createInvoicePaymentRequest(
                        requestDTO.getDriverId(),
                        requestDTO.getReferenceId(),
                        requestDTO.getFacilityId()
                );
            } else if ("SUBSCRIPTION".equals(requestDTO.getRequestType())) {
                request = cashPaymentRequestService.createSubscriptionPaymentRequest(
                        requestDTO.getDriverId(),
                        requestDTO.getReferenceId(),
                        requestDTO.getFacilityId(),
                        requestDTO.getAmount()
                );
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid request type. Must be INVOICE or SUBSCRIPTION"));
            }

            CashPaymentResponse response = mapToResponse(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Payment request created successfully", response));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating payment request: " + e.getMessage()));
        }
    }

    /**
     * Get all pending payment requests for a facility
     * GET /api/cash-payments/facility/{facilityId}/pending
     */
    @GetMapping("/facility/{facilityId}/pending")
    public ResponseEntity<ApiResponse> getPendingRequestsByFacility(@PathVariable Integer facilityId) {
        try {
            List<CashPaymentRequest> requests = cashPaymentRequestService.getPendingRequestsByFacility(facilityId);
            List<CashPaymentResponse> responses = requests.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Pending payment requests retrieved successfully", responses));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving pending requests: " + e.getMessage()));
        }
    }

    /**
     * Get all payment requests for a facility (all statuses)
     * GET /api/cash-payments/facility/{facilityId}
     */
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<ApiResponse> getAllRequestsByFacility(
            @PathVariable Integer facilityId,
            @RequestParam(required = false) String status) {
        try {
            List<CashPaymentRequest> requests;
            
            if (status != null && !status.isEmpty()) {
                requests = cashPaymentRequestService.getAllRequestsByFacility(facilityId).stream()
                        .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                        .collect(Collectors.toList());
            } else {
                requests = cashPaymentRequestService.getAllRequestsByFacility(facilityId);
            }
            
            List<CashPaymentResponse> responses = requests.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Payment requests retrieved successfully", responses));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving requests: " + e.getMessage()));
        }
    }

    /**
     * Get payment requests by driver
     * GET /api/cash-payments/driver/{driverId}
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ApiResponse> getRequestsByDriver(@PathVariable Integer driverId) {
        try {
            List<CashPaymentRequest> requests = cashPaymentRequestService.getRequestsByDriver(driverId);
            List<CashPaymentResponse> responses = requests.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Driver payment requests retrieved successfully", responses));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving driver requests: " + e.getMessage()));
        }
    }

    /**
     * Get a specific payment request by ID
     * GET /api/cash-payments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getRequestById(@PathVariable Integer id) {
        try {
            CashPaymentRequest request = cashPaymentRequestService.getRequestById(id);
            CashPaymentResponse response = mapToResponse(request);
            
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Payment request retrieved successfully", response));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Payment request not found: " + e.getMessage()));
        }
    }

    /**
     * Approve a cash payment request
     * PUT /api/cash-payments/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse> approveRequest(
            @PathVariable Integer id,
            @RequestBody ApprovalRequestDTO approvalDTO) {
        try {
            CashPaymentRequest request = cashPaymentRequestService.approveRequest(
                    id,
                    approvalDTO.getEmployeeId(),
                    approvalDTO.getNotes()
            );
            
            CashPaymentResponse response = mapToResponse(request);
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Payment request approved successfully", response));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error approving request: " + e.getMessage()));
        }
    }

    /**
     * Reject a cash payment request
     * PUT /api/cash-payments/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse> rejectRequest(
            @PathVariable Integer id,
            @RequestBody ApprovalRequestDTO rejectionDTO) {
        try {
            CashPaymentRequest request = cashPaymentRequestService.rejectRequest(
                    id,
                    rejectionDTO.getEmployeeId(),
                    rejectionDTO.getNotes()
            );
            
            CashPaymentResponse response = mapToResponse(request);
            return ResponseEntity.ok()
                    .body(ApiResponse.success("Payment request rejected successfully", response));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error rejecting request: " + e.getMessage()));
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private CashPaymentResponse mapToResponse(CashPaymentRequest request) {
        return CashPaymentResponse.builder()
                .id(request.getId())
                .requestType(request.getRequestType())
                .referenceId(request.getReferenceId())
                .driverId(request.getDriver() != null ? request.getDriver().getId() : null)
                .driverName(request.getDriver() != null && request.getDriver().getAccount() != null ?
                        request.getDriver().getAccount().getFullName() : null)
                .driverPhone(request.getDriver() != null && request.getDriver().getAccount() != null ?
                        request.getDriver().getAccount().getPhone() : null)
                .facilityId(request.getFacility() != null ? request.getFacility().getId() : null)
                .facilityName(request.getFacility() != null ? request.getFacility().getName() : null)
                .assignedEmployeeId(request.getAssignedEmployee() != null ? 
                        request.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(request.getAssignedEmployee() != null && 
                        request.getAssignedEmployee().getAccount() != null ?
                        request.getAssignedEmployee().getAccount().getFullName() : null)
                .approvedByEmployeeId(request.getApprovedByEmployee() != null ? 
                        request.getApprovedByEmployee().getId() : null)
                .approvedByEmployeeName(request.getApprovedByEmployee() != null && 
                        request.getApprovedByEmployee().getAccount() != null ?
                        request.getApprovedByEmployee().getAccount().getFullName() : null)
                .amount(request.getAmount())
                .status(request.getStatus())
                .notes(request.getNotes())
                .approvalNotes(request.getRejectedReason())
                .createdAt(request.getCreatedAt())
                .approvedAt(request.getApprovedAt())
                .expiresAt(null) // Not in entity
                .build();
    }
}

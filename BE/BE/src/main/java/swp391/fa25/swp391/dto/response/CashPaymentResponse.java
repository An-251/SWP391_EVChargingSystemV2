package swp391.fa25.swp391.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashPaymentResponse {
    private Integer id;
    private String requestType; // "INVOICE" or "SUBSCRIPTION"
    private Integer referenceId;
    
    // Driver info
    private Integer driverId;
    private String driverName;
    private String driverPhone;
    
    // Facility info
    private Integer facilityId;
    private String facilityName;
    
    // Employee info
    private Integer assignedEmployeeId;
    private String assignedEmployeeName;
    
    private Integer approvedByEmployeeId;
    private String approvedByEmployeeName;
    
    // Payment details
    private BigDecimal amount;
    private String status; // PENDING, APPROVED, REJECTED, EXPIRED
    private String notes;
    private String approvalNotes;
    
    // Timestamps
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime approvedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;
}

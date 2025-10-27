package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyQRCodeResponse {

    private boolean valid;
    private String message;

    // Thông tin nếu valid
    private Integer registrationId;
    private Integer driverId;
    private String driverName;
    private String planName;
    private LocalDate validUntil;

    // Helper factory methods
    public static VerifyQRCodeResponse valid(Integer regId, Integer driverId, String driverName, String planName, LocalDate validUntil) {
        return VerifyQRCodeResponse.builder()
                .valid(true)
                .message("Success")
                .registrationId(regId)
                .driverId(driverId)
                .driverName(driverName)
                .planName(planName)
                .validUntil(validUntil)
                .build();
    }

    public static VerifyQRCodeResponse invalid(String message) {
        return VerifyQRCodeResponse.builder()
                .valid(false)
                .message(message)
                .build();
    }
}
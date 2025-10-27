package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyQRCodeRequest {
    @NotBlank(message = "QR code is required")
    private String qrCode;
    // private Integer stationId; // Có thể thêm ID trạm sạc nếu cần
}
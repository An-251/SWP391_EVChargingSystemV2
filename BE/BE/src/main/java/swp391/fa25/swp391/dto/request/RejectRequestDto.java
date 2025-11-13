package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RejectRequestDto {
    
    @NotBlank(message = "Reject reason is required")
    @Size(max = 500, message = "Reject reason must not exceed 500 characters")
    private String reason;
}

package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO Request cho StationEmployee dừng một phiên sạc
 */
@Data
public class EmpStopSessionRequest {

    @NotNull(message = "End percentage is required")
    private Integer endPercentage;
}

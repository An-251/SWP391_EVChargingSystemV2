package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new reservation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequest {

    // ⭐ DEPRECATED: Keep for backward compatibility
    private Integer chargingPointId;
    
    // ⭐ NEW: Specific charger to reserve (preferred)
    private Integer chargerId;
    
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationMinutes; // Duration in minutes (e.g., 30, 60, 120)
}

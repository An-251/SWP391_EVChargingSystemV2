package swp391.fa25.swp391.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size; // Import @Size
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FacilityRequest {

    @NotBlank(message = "Facility name cannot be blank")
    @Size(max = 255, message = "Facility name cannot exceed 255 characters")
    private String name;

    @NotBlank(message = "City cannot be blank")
    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @NotBlank(message = "District cannot be blank")
    @Size(max = 100, message = "District cannot exceed 100 characters")
    private String district;

    @NotBlank(message = "Ward cannot be blank")
    @Size(max = 100, message = "Ward cannot exceed 100 characters")
    private String ward;

    @NotBlank(message = "Street address cannot be blank")
    @Size(max = 255, message = "Street address cannot exceed 255 characters")
    private String streetAddress;

    // ← THÊM FIELD NÀY
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String status;
}
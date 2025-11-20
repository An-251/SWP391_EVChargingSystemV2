package swp391.fa25.swp391.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatsResponse {
    private Integer planId;
    private String planName;
    private Long count;
    private Double percentage;
}

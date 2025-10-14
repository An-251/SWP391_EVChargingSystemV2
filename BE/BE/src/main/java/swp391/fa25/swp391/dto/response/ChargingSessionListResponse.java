package swp391.fa25.swp391.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response danh sách sessions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChargingSessionListResponse {
    private List<ChargingSessionResponse> sessions;
    private Integer totalSessions;
}
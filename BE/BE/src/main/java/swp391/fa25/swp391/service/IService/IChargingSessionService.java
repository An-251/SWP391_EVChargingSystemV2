package swp391.fa25.swp391.service.IService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import swp391.fa25.swp391.dto.request.StartChargingSessionRequest;
import swp391.fa25.swp391.dto.request.StopChargingSessionRequest;
import swp391.fa25.swp391.dto.response.ChargingSessionResponse;
import swp391.fa25.swp391.entity.ChargingSession;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface cho ChargingSession
 */
public interface IChargingSessionService {

    // Business operations
    ChargingSessionResponse startChargingSession(StartChargingSessionRequest request);
    ChargingSessionResponse stopChargingSession(Integer sessionId, StopChargingSessionRequest request);
    void cancelChargingSession(Integer sessionId);

    // Query operations
    Optional<ChargingSession> findById(Integer id);
    ChargingSessionResponse getSessionById(Integer id);
    Optional<ChargingSession> findActiveSessionByDriverId(Integer driverId);
    Optional<ChargingSession> findActiveSessionByChargingPointId(Integer chargingPointId);
    List<ChargingSession> findByDriverId(Integer driverId);
    List<ChargingSession> findByStatus(String status);

    // Statistics
    BigDecimal calculateTotalCostByDriver(Integer driverId);
    Long countByStatus(String status);

    // Pagination
    Page<ChargingSession> findByDriverId(Integer driverId, Pageable pageable);
}
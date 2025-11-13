package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Charger;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.repository.ChargerRepository;
import swp391.fa25.swp391.repository.ChargingPointRepository;
import swp391.fa25.swp391.service.IService.IChargingPointService;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class ChargingPointService implements IChargingPointService {

    private final ChargingPointRepository chargingPointRepository;
    private final ChargerRepository chargerRepository;
    private final ChargingStationService chargingStationService;

    // Status constants
    private static final String STATUS_ACTIVE = "active";      // Trạm đang hoạt động bình thường
    private static final String STATUS_INACTIVE = "inactive";  // Trạm tạm ngưng hoạt động
    private static final String STATUS_USING = "using";        // Đang có session sạc
    private static final String STATUS_BOOKED = "booked";      // Đã được đặt chỗ
    private static final String STATUS_MAINTENANCE = "maintenance"; // Đang bảo trì

    @Override
    @Transactional
    public ChargingPoint save(ChargingPoint chargingPoint) {
        if (chargingPoint.getStatus() == null) {
            chargingPoint.setStatus(STATUS_ACTIVE);
        }
        return chargingPointRepository.save(chargingPoint);
    }

    @Override
    @Transactional
    public ChargingPoint updateChargingPoint(ChargingPoint chargingPoint) {
        return chargingPointRepository.save(chargingPoint);
    }

    @Override
    @Transactional
    public void deleteChargingPoint(Integer id) {
        chargingPointRepository.deleteById(id);
    }

    @Override
    public Optional<ChargingPoint> findById(Integer id) {
        return chargingPointRepository.findById(id);
    }

    @Override
    public List<ChargingPoint> findAll() {
        return chargingPointRepository.findAll();
    }

    /**
     * Find all charging points by station ID
     */
    public List<ChargingPoint> findByStationId(Integer stationId) {
        return chargingPointRepository.findByStationId(stationId);
    }

    @Override
    @Transactional
    public ChargingPoint updateChargingPointStatus(ChargingPoint chargingPoint) {
        return chargingPointRepository.save(chargingPoint);
    }

    /**
     * Admin only: Update point status
     * Validates that point can be set to inactive
     * Also updates status based on chargers
     */
    @Transactional
    public void updatePointStatus(Integer pointId, String newStatus) {
        ChargingPoint point = findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Validate status values for Point (admin can only set active/inactive)
        if (!STATUS_ACTIVE.equals(newStatus) && !STATUS_INACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Admin can only set point to 'active' or 'inactive'");
        }

        // Cannot change to inactive if any charger is using or booked
        List<Charger> chargers = chargerRepository.findByChargingPointId(pointId);
        boolean anyChargerInUse = chargers.stream()
                .anyMatch(c -> STATUS_USING.equals(c.getStatus()) || STATUS_BOOKED.equals(c.getStatus()));
        
        if (STATUS_INACTIVE.equals(newStatus) && anyChargerInUse) {
            throw new IllegalStateException("Cannot set charging point to inactive while any charger is in use or booked");
        }

        point.setStatus(newStatus);
        chargingPointRepository.save(point);

        // Update station status if needed
        if (point.getStation() != null) {
            chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
        }
    }

    /**
     * User: Start using a charging point
     * Note: This is deprecated - should use Charger directly now
     * Kept for backward compatibility
     */
    @Transactional
    @Deprecated
    public void startUsingPoint(Integer pointId) {
        ChargingPoint point = findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Update point status based on chargers
        updatePointStatusBasedOnChargers(point);
    }

    /**
     * User: Stop using a charging point
     * Note: This is deprecated - should use Charger directly now
     * Kept for backward compatibility
     */
    @Transactional
    @Deprecated
    public void stopUsingPoint(Integer pointId) {
        ChargingPoint point = findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Update point status based on remaining chargers
        updatePointStatusBasedOnChargers(point);
    }

    /**
     * Update charging point status based on its chargers' statuses
     */
    @Transactional
    public void updatePointStatusBasedOnChargers(ChargingPoint point) {
        List<Charger> chargers = chargerRepository.findByChargingPointId(point.getId());
        
        if (chargers.isEmpty()) {
            // No chargers, set point to inactive
            point.setStatus(STATUS_INACTIVE);
            chargingPointRepository.save(point);
            
            // Update station status
            if (point.getStation() != null) {
                chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
            }
            return;
        }

        // Check if any charger is using
        boolean anyUsing = chargers.stream()
                .anyMatch(c -> STATUS_USING.equals(c.getStatus()));
        
        // Check if all chargers are inactive/maintenance
        boolean allInactive = chargers.stream()
                .allMatch(c -> STATUS_INACTIVE.equals(c.getStatus()) || STATUS_MAINTENANCE.equals(c.getStatus()));

        String newStatus;
        if (anyUsing) {
            newStatus = STATUS_USING;
        } else if (allInactive) {
            newStatus = STATUS_INACTIVE;
        } else {
            newStatus = STATUS_ACTIVE;
        }
        
        if (!newStatus.equals(point.getStatus())) {
            point.setStatus(newStatus);
            chargingPointRepository.save(point);
            
            // Update station status
            if (point.getStation() != null) {
                chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
            }
        }
    }
}
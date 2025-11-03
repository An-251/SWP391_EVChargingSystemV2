package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.repository.ChargingPointRepository;
import swp391.fa25.swp391.service.IService.IChargingPointService;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class ChargingPointService implements IChargingPointService {

    private final ChargingPointRepository chargingPointRepository;
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

    @Override
    @Transactional
    public ChargingPoint updateChargingPointStatus(ChargingPoint chargingPoint) {
        return chargingPointRepository.save(chargingPoint);
    }

    /**
     * Admin only: Update point status
     * Validates that point can be set to inactive
     */
    @Transactional
    public void updatePointStatus(Integer pointId, String newStatus) {
        ChargingPoint point = findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Validate status values for Point (admin can only set active/inactive)
        if (!STATUS_ACTIVE.equals(newStatus) && !STATUS_INACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Admin can only set point to 'active' or 'inactive'");
        }

        // Cannot change to inactive if currently using or booked
        if (STATUS_INACTIVE.equals(newStatus) && 
            (STATUS_USING.equals(point.getStatus()) || STATUS_BOOKED.equals(point.getStatus()))) {
            throw new IllegalStateException("Cannot set charging point to inactive while it is in use or booked");
        }

        point.setStatus(newStatus);
        chargingPointRepository.save(point);

        // Update station status if needed
        if (point.getStation() != null) {
            chargingStationService.updateStationStatusBasedOnPoints(point.getStation());
        }
    }

    /**
     * User: Start using a charging point (booking)
     * Automatically sets point to "using" and propagates to station
     */
    @Transactional
    public void startUsingPoint(Integer pointId) {
        ChargingPoint point = findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Validate current status - accept both ACTIVE (walk-in) and BOOKED (reservation)
        if (!STATUS_ACTIVE.equals(point.getStatus()) && !STATUS_BOOKED.equals(point.getStatus())) {
            throw new IllegalStateException(
                    "Charging point must be 'active' or 'booked' to start using. Current status: " + point.getStatus()
            );
        }

        ChargingStation station = point.getStation();
        if (station == null) {
            throw new IllegalStateException("Charging point is not associated with any station");
        }

        if (!STATUS_ACTIVE.equals(station.getStatus()) && !STATUS_USING.equals(station.getStatus())) {
            throw new IllegalStateException(
                    "Station must be 'active' to use. Current status: " + station.getStatus()
            );
        }

        // Set point to using
        point.setStatus(STATUS_USING);
        chargingPointRepository.save(point);

        // Propagate to station - set station to using if not already
        if (!STATUS_USING.equals(station.getStatus())) {
            station.setStatus(STATUS_USING);
            chargingStationService.updateChargingStationStatus(station);
        }
    }

    /**
     * User: Stop using a charging point (complete charging session)
     * Sets point back to "active" and updates station if no other points are using
     */
    @Transactional
    public void stopUsingPoint(Integer pointId) {
        ChargingPoint point = findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Validate current status
        if (!STATUS_USING.equals(point.getStatus())) {
            throw new IllegalStateException("Charging point is not currently in use");
        }

        // Set point back to active
        point.setStatus(STATUS_ACTIVE);
        chargingPointRepository.save(point);

        // Update station status based on remaining points
        ChargingStation station = point.getStation();
        if (station != null) {
            chargingStationService.updateStationStatusBasedOnPoints(station);
        }
    }
}
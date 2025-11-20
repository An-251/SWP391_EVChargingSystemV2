package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.repository.ChargingStationRepository;
import swp391.fa25.swp391.service.IService.IChargingStationService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChargingStationService implements IChargingStationService {

    private final ChargingStationRepository chargingStationRepository;
    private final FacilityService facilityService; // ⭐ THÊM dependency

    // Status constants
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_INACTIVE = "inactive";
    private static final String STATUS_USING = "using";

    @Override
    @Transactional
    public ChargingStation register(ChargingStation chargingStation) {
        if (chargingStation.getStatus() == null) {
            chargingStation.setStatus(STATUS_ACTIVE);
        }
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    @Transactional
    public ChargingStation updateChargingStation(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    @Transactional
    public void deleteChargingStation(Integer id) {
        // SOFT DELETE: Cascade xuống points và chargers
        ChargingStation station = chargingStationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Charging station not found with id: " + id));
        
        java.time.Instant now = java.time.Instant.now();
        String deletedBy = null;
        
        // Lấy username của người thực hiện xóa
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            deletedBy = auth.getName();
        }
        
        // Cascade soft delete xuống tất cả charging points
        if (station.getChargingPoints() != null) {
            for (swp391.fa25.swp391.entity.ChargingPoint point : station.getChargingPoints()) {
                point.setIsDeleted(true);
                point.setDeletedAt(now);
                point.setDeletedBy(deletedBy);
                
                // Cascade soft delete xuống tất cả chargers
                if (point.getChargers() != null) {
                    for (swp391.fa25.swp391.entity.Charger charger : point.getChargers()) {
                        charger.setIsDeleted(true);
                        charger.setDeletedAt(now);
                        charger.setDeletedBy(deletedBy);
                    }
                }
            }
        }
        
        station.setIsDeleted(true);
        station.setDeletedAt(now);
        station.setDeletedBy(deletedBy);
        
        chargingStationRepository.save(station);
    }

    @Override
    public Optional<ChargingStation> findById(Integer id) {
        return chargingStationRepository.findByIdNotDeleted(id);
    }

    @Override
    public List<ChargingStation> findAll() {
        return chargingStationRepository.findAllNotDeleted();
    }

    /**
     * ⭐ NEW: Find stations by facility ID
     */
    public List<ChargingStation> findByFacilityId(Integer facilityId) {
        return chargingStationRepository.findByFacilityIdNotDeleted(facilityId);
    }

    @Override
    @Transactional
    public ChargingStation updateChargingStationStatus(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    public boolean existsByStationName(String stationName) {
        return chargingStationRepository.existsByStationName(stationName);
    }

    @Override
    @Transactional
    public ChargingStation save(ChargingStation chargingStation) {
        if (chargingStation.getStatus() == null) {
            chargingStation.setStatus(STATUS_ACTIVE);
        }
        return chargingStationRepository.save(chargingStation);
    }

    /**
     * Admin only: Update station status
     * Validates that station can be set to inactive
     */
    @Transactional
    public void updateStationStatus(Integer stationId, String newStatus) {
        ChargingStation station = findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found"));

        // Validate status values for Station (admin can only set active/inactive)
        if (!STATUS_ACTIVE.equals(newStatus) && !STATUS_INACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Admin can only set station to 'active' or 'inactive'");
        }

        // Cannot change to inactive if currently using or has points in use
        if (STATUS_INACTIVE.equals(newStatus)) {
            if (STATUS_USING.equals(station.getStatus())) {
                throw new IllegalStateException("Cannot set station to inactive while it is in use");
            }
            if (hasAnyPointUsing(station)) {
                throw new IllegalStateException("Cannot set station to inactive while charging points are in use");
            }
        }

        station.setStatus(newStatus);
        chargingStationRepository.save(station);
    }

    /**
     * Update station status based on its charging points
     * Called automatically when points change status
     */
    @Transactional
    public void updateStationStatusBasedOnPoints(ChargingStation station) {
        if (station == null || station.getChargingPoints() == null) {
            return;
        }

        boolean anyPointUsing = hasAnyPointUsing(station);
        boolean anyPointBooked = hasAnyPointBooked(station); // ⭐ THÊM check BOOKED

        String oldStatus = station.getStatus();
        
        // ⭐ Logic mới: USING hoặc BOOKED đều set station = USING
        if ((anyPointUsing || anyPointBooked) && !STATUS_USING.equals(station.getStatus())) {
            station.setStatus(STATUS_USING);
            chargingStationRepository.save(station);
        } else if (!anyPointUsing && !anyPointBooked && STATUS_USING.equals(station.getStatus())) {
            // Revert to active if no points are using or booked
            station.setStatus(STATUS_ACTIVE);
            chargingStationRepository.save(station);
        }

        // ⭐ CASCADE lên Facility nếu status thay đổi
        if (!oldStatus.equals(station.getStatus()) && station.getFacility() != null) {
            facilityService.updateFacilityStatusBasedOnStations(station.getFacility());
        }
    }

    /**
     * Check if station has any point in "using" status
     */
    private boolean hasAnyPointUsing(ChargingStation station) {
        if (station.getChargingPoints() == null) {
            return false;
        }
        return station.getChargingPoints().stream()
                .anyMatch(point -> STATUS_USING.equals(point.getStatus()));
    }

    /**
     * ⭐ NEW: Check if station has any point in "booked" status
     */
    private boolean hasAnyPointBooked(ChargingStation station) {
        if (station.getChargingPoints() == null) {
            return false;
        }
        return station.getChargingPoints().stream()
                .anyMatch(point -> "booked".equals(point.getStatus()));
    }
}
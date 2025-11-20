package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.repository.FacilityRepository;
import swp391.fa25.swp391.service.IService.IFacilityService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FacilityService implements IFacilityService {

    private final FacilityRepository facilityRepository;

    // Status constants
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_INACTIVE = "inactive";
    private static final String STATUS_USING = "using";

    @Override
    @Transactional
    public Facility register(Facility facility) {
        if (facility.getStatus() == null) {
            facility.setStatus(STATUS_ACTIVE);
        }
        return facilityRepository.save(facility);
    }

    @Override
    @Transactional
    public void deleteFacility(Integer id) {
        // SOFT DELETE: Cascade xuống stations, points và chargers
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id: " + id));
        
        java.time.Instant now = java.time.Instant.now();
        String deletedBy = null;
        
        // Lấy username của người thực hiện xóa
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            deletedBy = auth.getName();
        }
        
        // Cascade soft delete xuống tất cả stations và points
        if (facility.getChargingStations() != null) {
            for (ChargingStation station : facility.getChargingStations()) {
                station.setIsDeleted(true);
                station.setDeletedAt(now);
                station.setDeletedBy(deletedBy);
                
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
            }
        }
        
        // Soft delete facility
        facility.setIsDeleted(true);
        facility.setDeletedAt(now);
        facility.setDeletedBy(deletedBy);
        
        facilityRepository.save(facility);
    }

    @Override
    @Transactional
    public Facility updateFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    @Override
    public Facility findById(Integer id) {
        return facilityRepository.findByIdNotDeleted(id).orElse(null);
    }

    @Override
    public List<Facility> findByName(String facilityName) {
        return facilityRepository.findByName(facilityName);
    }

    @Override
    public List<Facility> findAll() {
        return facilityRepository.findAllNotDeleted();
    }

    @Override
    public List<Facility> findByFullAddress(String address) {
        return facilityRepository.findByAddressContaining(address);
    }

    @Override
    public Facility save(Facility facility) {
        return facilityRepository.save(facility);
    }

    /**
     * Update facility status (Admin only)
     * Validates that facility can be set to inactive
     */
    @Transactional
    public void updateFacilityStatus(Integer facilityId, String newStatus) {
        Facility facility = findById(facilityId);
        if (facility == null) {
            throw new IllegalArgumentException("Facility not found");
        }

        // Validate status values for Facility (only active/inactive)
        if (!STATUS_ACTIVE.equals(newStatus) && !STATUS_INACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Facility can only be 'active' or 'inactive'");
        }

        // Check if any station is using
        if (STATUS_INACTIVE.equals(newStatus) && hasAnyStationUsing(facility)) {
            throw new IllegalStateException("Cannot set facility to inactive while stations are in use");
        }

        facility.setStatus(newStatus);
        facilityRepository.save(facility);
    }

    /**
     * Check if facility has any station in "using" status
     */
    private boolean hasAnyStationUsing(Facility facility) {
        if (facility.getChargingStations() == null) {
            return false;
        }
        return facility.getChargingStations().stream()
                .anyMatch(station -> STATUS_USING.equals(station.getStatus()));
    }

    /**
     * ⭐ NEW: Auto-update facility status based on its stations
     * Called automatically when station status changes
     */
    @Transactional
    public void updateFacilityStatusBasedOnStations(Facility facility) {
        if (facility == null || facility.getChargingStations() == null) {
            return;
        }

        // Nếu facility đang INACTIVE (do admin set), không tự động update
        if (STATUS_INACTIVE.equals(facility.getStatus())) {
            return;
        }

        boolean anyStationUsing = hasAnyStationUsing(facility);

        String oldStatus = facility.getStatus();

        // ⭐ Logic: Nếu có station USING → facility = USING
        if (anyStationUsing && !STATUS_USING.equals(facility.getStatus())) {
            facility.setStatus(STATUS_USING);
            facilityRepository.save(facility);
        } else if (!anyStationUsing && STATUS_USING.equals(facility.getStatus())) {
            // Revert to active if no stations are using
            facility.setStatus(STATUS_ACTIVE);
            facilityRepository.save(facility);
        }
    }
}
package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.security.CustomUserDetails;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.service.IService.IChargingStationService;
import swp391.fa25.swp391.service.IService.IFacilityService;

/**
 * Service for managing status transitions of Facility, Station, and Point
 */
@Service
@RequiredArgsConstructor
@Transactional
public class StatusManagementService {

    private final IFacilityService facilityService;
    private final IChargingStationService stationService;
    private final IChargingPointService pointService;

    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    public static final String STATUS_USING = "using";

    /**
     * Admin only: Update facility status
     */
    public void updateFacilityStatus(Integer facilityId, String newStatus, CustomUserDetails userDetails) {
        Facility facility = facilityService.findById(facilityId);
        if (facility == null) {
            throw new IllegalArgumentException("Facility not found");
        }

        // Validate status values for Facility
        if (!STATUS_ACTIVE.equals(newStatus) && !STATUS_INACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Facility can only be 'active' or 'inactive'");
        }

        // Check if any station is using
        if (STATUS_INACTIVE.equals(newStatus) && hasAnyStationUsing(facility)) {
            throw new IllegalStateException("Cannot set facility to inactive while stations are in use");
        }

        facility.setStatus(newStatus);
        facilityService.updateFacility(facility);
    }

    /**
     * Admin only: Update station status
     */
    public void updateStationStatus(Integer stationId, String newStatus, CustomUserDetails userDetails) {
        ChargingStation station = stationService.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found"));

        // Validate status values for Station
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
        stationService.updateChargingStationStatus(station);
    }

    /**
     * Admin only: Update point status
     */
    public void updatePointStatus(Integer pointId, String newStatus, CustomUserDetails userDetails) {
        ChargingPoint point = pointService.findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Validate status values for Point
        if (!STATUS_ACTIVE.equals(newStatus) && !STATUS_INACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Admin can only set point to 'active' or 'inactive'");
        }

        // Cannot change to inactive if currently using
        if (STATUS_INACTIVE.equals(newStatus) && STATUS_USING.equals(point.getStatus())) {
            throw new IllegalStateException("Cannot set charging point to inactive while it is in use");
        }

        point.setStatus(newStatus);
        pointService.updateChargingPointStatus(point);

        // Update station status if needed
        updateStationStatusBasedOnPoints(point.getStation());
    }

    /**
     * User: Start using a charging point (booking)
     */
    public void startUsingPoint(Integer pointId, CustomUserDetails userDetails) {
        ChargingPoint point = pointService.findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Validate current status
        if (!STATUS_ACTIVE.equals(point.getStatus())) {
            throw new IllegalStateException("Charging point must be 'active' to start using. Current status: " + point.getStatus());
        }

        ChargingStation station = point.getStation();
        if (station == null) {
            throw new IllegalStateException("Charging point is not associated with any station");
        }

        if (!STATUS_ACTIVE.equals(station.getStatus()) && !STATUS_USING.equals(station.getStatus())) {
            throw new IllegalStateException("Station must be 'active' to use. Current status: " + station.getStatus());
        }

        // Set point to using
        point.setStatus(STATUS_USING);
        pointService.updateChargingPointStatus(point);

        // Propagate to station
        if (!STATUS_USING.equals(station.getStatus())) {
            station.setStatus(STATUS_USING);
            stationService.updateChargingStationStatus(station);
        }
    }

    /**
     * User: Stop using a charging point (complete charging session)
     */
    public void stopUsingPoint(Integer pointId, CustomUserDetails userDetails) {
        ChargingPoint point = pointService.findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Charging point not found"));

        // Validate current status
        if (!STATUS_USING.equals(point.getStatus())) {
            throw new IllegalStateException("Charging point is not currently in use");
        }

        // Set point back to active
        point.setStatus(STATUS_ACTIVE);
        pointService.updateChargingPointStatus(point);

        // Update station status based on remaining points
        ChargingStation station = point.getStation();
        if (station != null) {
            updateStationStatusBasedOnPoints(station);
        }
    }

    // ==================== HELPER METHODS ====================

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
     * Update station status based on its charging points
     * If any point is "using", station should be "using"
     * Otherwise, station should be "active" (if it was "using")
     */
    private void updateStationStatusBasedOnPoints(ChargingStation station) {
        if (station == null || station.getChargingPoints() == null) {
            return;
        }

        boolean anyPointUsing = hasAnyPointUsing(station);

        if (anyPointUsing && !STATUS_USING.equals(station.getStatus())) {
            station.setStatus(STATUS_USING);
            stationService.updateChargingStationStatus(station);
        } else if (!anyPointUsing && STATUS_USING.equals(station.getStatus())) {
            // Revert to active if no points are using
            station.setStatus(STATUS_ACTIVE);
            stationService.updateChargingStationStatus(station);
        }
    }
}
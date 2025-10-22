package swp391.fa25.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.dto.request.StatusUpdateRequest;
import swp391.fa25.swp391.dto.response.ApiResponse;
import swp391.fa25.swp391.security.CustomUserDetails;
import swp391.fa25.swp391.service.StatusManagementService;

/**
 * Controller for managing status of Facility, Station, and Point
 * Only ADMIN can change active/inactive status
 */
@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StatusController {

    private final StatusManagementService statusService;

    /**
     * Admin: Update Facility status (active/inactive)
     * POST /api/status/facility/{id}
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/facility/{id}")
    public ResponseEntity<?> updateFacilityStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            statusService.updateFacilityStatus(id, request.getStatus(), userDetails);
            return ResponseEntity.ok(
                    ApiResponse.success("Facility status updated to " + request.getStatus())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facility not found with ID: " + id));
        }
    }

    /**
     * Admin: Update Station status (active/inactive)
     * Cannot change to inactive if station or any point is "using"
     * POST /api/status/station/{id}
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/station/{id}")
    public ResponseEntity<?> updateStationStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            statusService.updateStationStatus(id, request.getStatus(), userDetails);
            return ResponseEntity.ok(
                    ApiResponse.success("Station status updated to " + request.getStatus())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Station not found with ID: " + id));
        }
    }

    /**
     * Admin: Update Point status (active/inactive)
     * Cannot change to inactive if point is "using"
     * POST /api/status/point/{id}
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/point/{id}")
    public ResponseEntity<?> updatePointStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            statusService.updatePointStatus(id, request.getStatus(), userDetails);
            return ResponseEntity.ok(
                    ApiResponse.success("Charging point status updated to " + request.getStatus())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charging point not found with ID: " + id));
        }
    }

    /**
     * User: Start using a charging point (booking)
     * Automatically sets point to "using" and propagates to station
     * POST /api/status/point/{id}/start
     */
    @PostMapping("/point/{id}/start")
    public ResponseEntity<?> startUsingPoint(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            statusService.startUsingPoint(id, userDetails);
            return ResponseEntity.ok(
                    ApiResponse.success("Charging point is now in use")
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charging point not found with ID: " + id));
        }
    }

    /**
     * User: Stop using a charging point (complete charging)
     * Sets point back to "active" and updates station if no other points are using
     * POST /api/status/point/{id}/stop
     */
    @PostMapping("/point/{id}/stop")
    public ResponseEntity<?> stopUsingPoint(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            statusService.stopUsingPoint(id, userDetails);
            return ResponseEntity.ok(
                    ApiResponse.success("Charging session completed")
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Charging point not found with ID: " + id));
        }
    }
}
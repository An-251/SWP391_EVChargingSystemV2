package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Charger;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.repository.ChargerRepository;
import swp391.fa25.swp391.service.IService.IChargerService;
import swp391.fa25.swp391.service.IService.IChargingPointService;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class ChargerService implements IChargerService {

    private final ChargerRepository chargerRepository;
    private final IChargingPointService chargingPointService;

    // Status constants
    private static final String STATUS_ACTIVE = "active";      // Charger đang hoạt động bình thường
    private static final String STATUS_INACTIVE = "inactive";  // Charger tạm ngưng hoạt động
    private static final String STATUS_USING = "using";        // Đang có session sạc
    private static final String STATUS_BOOKED = "booked";      // Đã được đặt chỗ
    private static final String STATUS_MAINTENANCE = "maintenance"; // Đang bảo trì

    @Override
    @Transactional
    public Charger save(Charger charger) {
        if (charger.getStatus() == null) {
            charger.setStatus(STATUS_ACTIVE);
        }
        return chargerRepository.save(charger);
    }

    @Override
    @Transactional
    public Charger updateCharger(Charger charger) {
        return chargerRepository.save(charger);
    }

    @Override
    @Transactional
    public void deleteCharger(Integer id) {
        // SOFT DELETE
        Charger charger = chargerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Charger not found with id: " + id));
        
        charger.setIsDeleted(true);
        charger.setDeletedAt(java.time.Instant.now());
        
        // Lấy username của người thực hiện xóa
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            charger.setDeletedBy(auth.getName());
        }
        
        chargerRepository.save(charger);
    }

    @Override
    public Optional<Charger> findById(Integer id) {
        return chargerRepository.findByIdNotDeleted(id);
    }

    @Override
    public List<Charger> findAll() {
        return chargerRepository.findAllNotDeleted();
    }

    @Override
    public List<Charger> findByChargingPointId(Integer chargingPointId) {
        return chargerRepository.findByChargingPointIdNotDeleted(chargingPointId);
    }

    @Override
    public List<Charger> findByStatus(String status) {
        return chargerRepository.findByStatus(status);
    }

    @Override
    public List<Charger> findByChargingPointIdAndStatus(Integer chargingPointId, String status) {
        return chargerRepository.findByChargingPointId(chargingPointId).stream()
                .filter(charger -> status.equalsIgnoreCase(charger.getStatus()))
                .toList();
    }

    @Override
    @Transactional
    public Charger updateChargerStatus(Charger charger) {
        return chargerRepository.save(charger);
    }

    /**
     * Admin only: Update charger status
     * Validates that charger can be set to inactive
     */
    @Override
    @Transactional
    public void updateStatus(Integer chargerId, String newStatus) {
        Charger charger = findById(chargerId)
                .orElseThrow(() -> new IllegalArgumentException("Charger not found"));

        // Validate status values (admin can only set active/inactive/maintenance)
        if (!STATUS_ACTIVE.equals(newStatus) && !STATUS_INACTIVE.equals(newStatus) 
            && !STATUS_MAINTENANCE.equals(newStatus)) {
            throw new IllegalStateException("Admin can only set charger to 'active', 'inactive', or 'maintenance'");
        }

        // Cannot change to inactive if currently using or booked
        if (STATUS_INACTIVE.equals(newStatus) && 
            (STATUS_USING.equals(charger.getStatus()) || STATUS_BOOKED.equals(charger.getStatus()))) {
            throw new IllegalStateException("Cannot set charger to inactive while it is in use or booked");
        }

        charger.setStatus(newStatus);
        chargerRepository.save(charger);

        // Update charging point status if needed
        if (charger.getChargingPoint() != null) {
            updateChargingPointStatusBasedOnChargers(charger.getChargingPoint());
        }
    }

    /**
     * User: Start using a charger (charging session)
     * Automatically sets charger to "using"
     */
    @Override
    @Transactional
    public void startUsingCharger(Integer chargerId) {
        Charger charger = findById(chargerId)
                .orElseThrow(() -> new IllegalArgumentException("Charger not found"));

        // Validate current status - accept BOOKED (reservation only)
        if (!STATUS_ACTIVE.equals(charger.getStatus()) && !STATUS_BOOKED.equals(charger.getStatus())) {
            throw new IllegalStateException(
                    "Charger must be 'active' or 'booked' to start using. Current status: " + charger.getStatus()
            );
        }

        ChargingPoint chargingPoint = charger.getChargingPoint();
        if (chargingPoint == null) {
            throw new IllegalStateException("Charger is not associated with any charging point");
        }

        // ⭐ UPDATED: Allow "booked" status (when there's a valid reservation)
        if (!STATUS_ACTIVE.equals(chargingPoint.getStatus()) 
            && !STATUS_USING.equals(chargingPoint.getStatus())
            && !STATUS_BOOKED.equals(chargingPoint.getStatus())) {
            throw new IllegalStateException(
                    "Charging point must be 'active', 'booked', or 'using' to start session. Current status: " + chargingPoint.getStatus()
            );
        }

        // Set charger to using
        charger.setStatus(STATUS_USING);
        chargerRepository.save(charger);

        // Update charging point status
        updateChargingPointStatusBasedOnChargers(chargingPoint);
    }

    /**
     * User: Stop using a charger (complete charging session)
     * Sets charger back to "active"
     */
    @Override
    @Transactional
    public void stopUsingCharger(Integer chargerId) {
        Charger charger = findById(chargerId)
                .orElseThrow(() -> new IllegalArgumentException("Charger not found"));

        // Validate current status
        if (!STATUS_USING.equals(charger.getStatus())) {
            throw new IllegalStateException("Charger is not currently in use");
        }

        // Set charger back to active
        charger.setStatus(STATUS_ACTIVE);
        chargerRepository.save(charger);

        // Update charging point status
        ChargingPoint chargingPoint = charger.getChargingPoint();
        if (chargingPoint != null) {
            updateChargingPointStatusBasedOnChargers(chargingPoint);
        }
    }

    /**
     * Update charging point status based on its chargers' statuses
     */
    @Transactional
    public void updateChargingPointStatusBasedOnChargers(ChargingPoint chargingPoint) {
        List<Charger> chargers = chargerRepository.findByChargingPointId(chargingPoint.getId());
        
        if (chargers.isEmpty()) {
            // No chargers, set point to inactive
            chargingPoint.setStatus(STATUS_INACTIVE);
            chargingPointService.updateChargingPointStatus(chargingPoint);
            return;
        }

        // Check if any charger is using
        boolean anyUsing = chargers.stream()
                .anyMatch(c -> STATUS_USING.equals(c.getStatus()));
        
        // Check if all chargers are inactive/maintenance
        boolean allInactive = chargers.stream()
                .allMatch(c -> STATUS_INACTIVE.equals(c.getStatus()) || STATUS_MAINTENANCE.equals(c.getStatus()));

        if (anyUsing) {
            chargingPoint.setStatus(STATUS_USING);
        } else if (allInactive) {
            chargingPoint.setStatus(STATUS_INACTIVE);
        } else {
            chargingPoint.setStatus(STATUS_ACTIVE);
        }
        
        chargingPointService.updateChargingPointStatus(chargingPoint);
    }
}

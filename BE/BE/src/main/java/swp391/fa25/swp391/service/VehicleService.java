package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Vehicle;
import swp391.fa25.swp391.repository.VehicleRepository;
import swp391.fa25.swp391.service.IService.IVehicleService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService implements IVehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public Optional<Vehicle> findById(Integer id) {
        return vehicleRepository.findByIdNotDeleted(id);
    }

    @Override
    @Transactional
    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> findByDriverId(Integer driverId) {
        return vehicleRepository.findByDriverIdNotDeleted(driverId);
    }

    @Override
    public int countByDriverId(Integer driverId) {
        return vehicleRepository.findByDriverIdNotDeleted(driverId).size();
    }

    @Override
    public boolean existsByLicensePlate(String licensePlate) {
        return vehicleRepository.existsByLicensePlate(licensePlate);
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        // SOFT DELETE: Chỉ đánh dấu là đã xóa
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        
        vehicle.setIsDeleted(true);
        vehicle.setDeletedAt(Instant.now());
        
        // Lấy username của người thực hiện xóa
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            vehicle.setDeletedBy(auth.getName());
        }
        
        vehicleRepository.save(vehicle);
    }
}
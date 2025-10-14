package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Vehicle;
import swp391.fa25.swp391.repository.models.VehicleRepository;
import swp391.fa25.swp391.service.IService.IVehicleService;

import java.util.Optional;

/**
 * Service Implementation cho Vehicle
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService implements IVehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public Optional<Vehicle> findById(Integer id) {
        // Cần thiết cho bước 3 trong startChargingSession
        return vehicleRepository.findById(id);
    }

    @Override
    @Transactional // Phương thức ghi dữ liệu cần @Transactional
    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    // Các phương thức khác có thể được thêm vào:

    // public List<Vehicle> findAll() {
    //     return vehicleRepository.findAll();
    // }

    // public void deleteById(Integer id) {
    //     vehicleRepository.deleteById(id);
    // }
}
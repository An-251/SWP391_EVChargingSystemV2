package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Vehicle;
import swp391.fa25.swp391.repository.models.VehicleRepository;
import swp391.fa25.swp391.service.IService.IVehicleService;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService implements IVehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public Optional<Vehicle> findById(Integer id) {
        return vehicleRepository.findById(id);
    }

    @Override
    @Transactional
    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> findByDriverId(Integer driverId) {
        return vehicleRepository.findByDriverId(driverId);
    }

    @Override
    public int countByDriverId(Integer driverId) {
        return vehicleRepository.countByDriverId(driverId);
    }

    @Override
    public boolean existsByLicensePlate(String licensePlate) {
        return vehicleRepository.existsByLicensePlate(licensePlate);
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        vehicleRepository.deleteById(id);
    }
}
package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Vehicle;
import java.util.List;
import java.util.Optional;

public interface IVehicleService {

    Optional<Vehicle> findById(Integer id);

    Vehicle save(Vehicle vehicle);

    List<Vehicle> findByDriverId(Integer driverId);

    int countByDriverId(Integer driverId);

    boolean existsByLicensePlate(String licensePlate);

    void deleteById(Integer id);
}
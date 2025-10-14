package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Vehicle;

import java.util.Optional;
// import java.util.List; // Thêm nếu cần

public interface IVehicleService {
    /**
     * Tìm Vehicle theo ID.
     */
    Optional<Vehicle> findById(Integer id);

    /**
     * Lưu hoặc cập nhật Vehicle.
     */
    Vehicle save(Vehicle vehicle);

    // Có thể thêm các phương thức khác như findAll, delete...
}
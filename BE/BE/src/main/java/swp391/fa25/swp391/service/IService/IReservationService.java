package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Reservation;

import java.util.List;

public interface IReservationService {
    // Phương thức chung để lưu/cập nhật Reservation (dùng trong Controller)
    Reservation register(Reservation reservation);

    // Phương thức tìm theo ID (dùng trong Controller)
    // Giữ nguyên Integer vì DriverController dùng Integer
    Reservation findById(Integer id);

    // Thêm overload findById(Long id) để khớp với phương thức đã có trong Service
    Reservation findById(Long id);

    // Lấy tất cả (Dùng cho findAll() trong Service)
    List<Reservation> findAll();

    // Thay thế findByUserId bằng getReservationsByDriver và dùng Long
    List<Reservation> getReservationsByDriver(Long driverId);

    // Thêm các phương thức khác được Controller gọi
    List<Reservation> findByChargingPointId(Integer chargingPointId);

    // Thêm phương thức cancelReservation mà Controller gọi
    Reservation cancelReservation(Long reservationId, Long driverId);

    // Thêm các phương thức quan trọng khác từ ReservationService

    // Phương thức tạo reservation ban đầu (dù Controller không gọi trực tiếp)
    Reservation createReservation(Reservation reservation);

    // Các phương thức xử lý theo lịch trình (dùng trong Service nội bộ)
    void processReservations();
}
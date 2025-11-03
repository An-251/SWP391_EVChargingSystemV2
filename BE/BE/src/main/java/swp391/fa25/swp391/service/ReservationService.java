package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.ReservationRepository;
import swp391.fa25.swp391.service.IService.IReservationService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService implements IReservationService {

    private final ReservationRepository reservationRepository;

    // Status constants
    private static final String STATUS_ACTIVE = "active";       // Đặt chỗ đang có hiệu lực
    private static final String STATUS_CANCELLED = "cancelled"; // Đặt chỗ bị hủy
    private static final String STATUS_EXPIRED = "expired";     // Đặt chỗ hết hạn do không đến đúng giờ
    private static final String STATUS_FULFILLED = "fulfilled"; // Đặt chỗ đã được thực hiện

    @Override
    @Transactional
    public Reservation register(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public void deleteReservation(Integer id) {
        reservationRepository.deleteById(Long.valueOf(id));
    }

    @Override
    public Reservation findById(Integer id) {
        Optional<Reservation> reservation = reservationRepository.findById(Long.valueOf(id));
        return reservation.orElse(null);
    }

    @Override
    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }

    @Override
    public List<Reservation> findByUserId(Integer userId) {
        // userId được map với driverId trong hệ thống
        return reservationRepository.findByDriver_Id(userId);
    }

    @Override
    public List<Reservation> findByChargingStationId(Integer chargingStationId) {
        return reservationRepository.findByChargingPoint_Station_Id(chargingStationId);
    }

    @Override
    public List<Reservation> findByChargingPointId(Integer chargingPointId) {
        return List.of();
    }

    @Transactional
    public void setReservationStatus(Reservation reservation, String status) {
        // Validate status
        if (!isValidStatus(status)) {
            throw new IllegalArgumentException("Invalid reservation status: " + status);
        }

        // Additional validation based on current status
        validateStatusTransition(reservation.getStatus(), status);

        // Update status
        reservation.setStatus(status);
        reservationRepository.save(reservation);
    }

    private boolean isValidStatus(String status) {
        return STATUS_ACTIVE.equals(status) ||
               STATUS_CANCELLED.equals(status) ||
               STATUS_EXPIRED.equals(status) ||
               STATUS_FULFILLED.equals(status);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        if (STATUS_FULFILLED.equals(currentStatus) || STATUS_EXPIRED.equals(currentStatus)) {
            throw new IllegalStateException("Cannot change status of fulfilled or expired reservation");
        }

        if (STATUS_CANCELLED.equals(currentStatus) && !STATUS_ACTIVE.equals(newStatus)) {
            throw new IllegalStateException("Cancelled reservation can only be reactivated");
        }
    }

    @Transactional
    public void expireReservation(Reservation reservation) {
        if (STATUS_ACTIVE.equals(reservation.getStatus())) {
            reservation.setStatus(STATUS_EXPIRED);
            reservationRepository.save(reservation);
        }
    }

    @Transactional
    public void fulfillReservation(Reservation reservation) {
        if (STATUS_ACTIVE.equals(reservation.getStatus())) {
            reservation.setStatus(STATUS_FULFILLED);
            reservationRepository.save(reservation);
        }
    }
}
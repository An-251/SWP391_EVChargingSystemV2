package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.models.ReservationRepository;
import swp391.fa25.swp391.service.IService.IReservationService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService implements IReservationService {

    private final ReservationRepository reservationRepository;

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
}
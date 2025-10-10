package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.models.ReservationRepository;
import swp391.fa25.swp391.service.IService.IReservationService;
import java.util.List;
@Service
@RequiredArgsConstructor
public class ReservationService implements IReservationService {
   private final ReservationRepository reservationRepository;
    @Override
    public Reservation register(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    @Override
    public void deleteReservation(Integer id) {
        reservationRepository.deleteById(id);
    }

    @Override
    public Reservation findById(Integer id) {
        return reservationRepository.findById(id).get();
    }

    @Override
    public List<Reservation> findAll() {
        return List.of();
    }

    @Override
    public List<Reservation> findByUserId(Integer userId) {
        return reservationRepository.findByField("user_id",userId);
    }
}

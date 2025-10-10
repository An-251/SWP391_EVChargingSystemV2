package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Reservation;

import java.util.List;

public interface IReservationService {
    Reservation register(Reservation reservation);
    void deleteReservation(Integer id);
    Reservation findById(Integer id);
    List<Reservation> findAll();
    List<Reservation> findByUserId(Integer userId);
}

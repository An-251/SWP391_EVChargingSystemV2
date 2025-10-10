package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Reservation;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;

@Repository
public class ReservationRepository extends GenericRepositoryImpl<Reservation> {
    public ReservationRepository() {
        super(Reservation.class);
    }
}

package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;
@Repository
public class ChargingSessionRepository extends GenericRepositoryImpl<ChargingSession> {
    public  ChargingSessionRepository() {
        super(ChargingSession.class);
    }
}

package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;
@Repository
public class ChargingStationRepository extends GenericRepositoryImpl<ChargingStation> {
    public ChargingStationRepository() {
        super(ChargingStation.class);
    }
}

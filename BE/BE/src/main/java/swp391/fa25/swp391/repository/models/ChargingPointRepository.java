package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;
@Repository
public class ChargingPointRepository extends GenericRepositoryImpl<ChargingPoint> {
    public ChargingPointRepository() {
        super(ChargingPoint.class);
    }
}

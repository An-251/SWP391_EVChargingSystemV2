package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.ChargingPoint;

import java.util.List;
import java.util.Optional;

public interface IChargingPointService {
    ChargingPoint save(ChargingPoint chargingPoint);
    void deleteChargingPoint(Integer id);
    Optional<ChargingPoint> findById(Integer id);
    ChargingPoint updateChargingPoint(ChargingPoint chargingPoint);
    List<ChargingPoint> findAll();
    ChargingPoint updateChargingPointStatus(ChargingPoint chargingPoint);
}

package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.ChargingPoint;

import java.util.List;

public interface IChargingPointService {
    ChargingPoint register(ChargingPoint chargingPoint);
    void deleteChargingPoint(Integer id);
    ChargingPoint findById(Integer id);
    ChargingPoint updateChargingPoint(ChargingPoint chargingPoint);
    List<ChargingPoint> findAll();
    ChargingPoint updateChargingPointStatus(ChargingPoint chargingPoint);
}

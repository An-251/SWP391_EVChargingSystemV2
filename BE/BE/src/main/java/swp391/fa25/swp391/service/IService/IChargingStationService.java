package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.ChargingStation;

import java.util.List;
import java.util.Optional;

public interface IChargingStationService {
    ChargingStation register(ChargingStation chargingStation);
    ChargingStation updateChargingStation(ChargingStation chargingStation);
    void deleteChargingStation(Integer id);
    Optional<ChargingStation> findById(Integer id);

    List<ChargingStation> findAll();
    ChargingStation updateChargingStationStatus(ChargingStation chargingStation);
    boolean existsByStationName(String stationName);
    ChargingStation save(ChargingStation chargingStation);
}

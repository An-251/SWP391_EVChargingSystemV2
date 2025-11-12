package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Charger;

import java.util.List;
import java.util.Optional;

public interface IChargerService {
    Charger save(Charger charger);
    void deleteCharger(Integer id);
    Optional<Charger> findById(Integer id);
    Charger updateCharger(Charger charger);
    List<Charger> findAll();
    List<Charger> findByChargingPointId(Integer chargingPointId);
    List<Charger> findByStatus(String status);
    List<Charger> findByChargingPointIdAndStatus(Integer chargingPointId, String status); // ⭐ NEW
    Charger updateChargerStatus(Charger charger);
    void updateStatus(Integer chargerId, String newStatus);
    void startUsingCharger(Integer chargerId);
    void stopUsingCharger(Integer chargerId);
}

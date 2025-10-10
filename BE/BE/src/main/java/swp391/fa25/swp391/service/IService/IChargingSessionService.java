package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.ChargingSession;

import java.util.List;

public interface IChargingSessionService {
    ChargingSession register(ChargingSession chargingSession);
    void deleteChargingSession(Integer id);
    ChargingSession findById(Integer id);
    ChargingSession updateChargingSession(ChargingSession chargingSession);
    List<ChargingSession> findAll();
    ChargingSession updateChargingSessionStatus(ChargingSession chargingSession);
}

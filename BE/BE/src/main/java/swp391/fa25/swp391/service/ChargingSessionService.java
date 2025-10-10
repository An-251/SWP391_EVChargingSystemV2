package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.service.IService.IChargingSessionService;
import swp391.fa25.swp391.repository.models.ChargingSessionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChargingSessionService implements IChargingSessionService {
    private final ChargingSessionRepository chargingSessionRepository;

    @Override
    public ChargingSession register(ChargingSession chargingSession) {
        return chargingSessionRepository.save(chargingSession);
    }

    @Override
    public ChargingSession updateChargingSession(ChargingSession chargingSession) {
        return chargingSessionRepository.save(chargingSession);
    }

    @Override
    public void deleteChargingSession(Integer id) { chargingSessionRepository.deleteById(id);
    }

    @Override
    public ChargingSession findById(Integer id) {
        return chargingSessionRepository.findById(id).get();
    }



    @Override
    public List<ChargingSession> findAll() {
        return List.of();
    }

    @Override
    public ChargingSession updateChargingSessionStatus(ChargingSession chargingSession) {
        return chargingSessionRepository.save(chargingSession);
    }


}

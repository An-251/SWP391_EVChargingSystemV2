package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.repository.models.ChargingStationRepository;
import swp391.fa25.swp391.service.IService.IChargingStationService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChargingStationService implements IChargingStationService {
    private final ChargingStationRepository chargingStationRepository;

    @Override
    public ChargingStation register(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    public ChargingStation updateChargingStation(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    public void deleteChargingStation(Integer id) {
        chargingStationRepository.deleteById(id);
    }

    @Override
    public Optional<ChargingStation> findById(Integer id) {
        return chargingStationRepository.findById(id);
    }



    @Override
    public List<ChargingStation> findAll() {
        return List.of();
    }

    @Override
    public ChargingStation updateChargingStationStatus(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    public boolean existsByStationName(String stationName) {
        return chargingStationRepository.findByField("name",stationName)!=null;
    }
}

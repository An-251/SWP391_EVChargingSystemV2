package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.repository.models.ChargingStationRepository;
import swp391.fa25.swp391.service.IService.IChargingStationService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChargingStationService implements IChargingStationService {
    private final ChargingStationRepository chargingStationRepository;

    @Override
    @Transactional
    public ChargingStation register(ChargingStation chargingStation) {
        // save là phương thức chuẩn của JpaRepository
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    @Transactional
    public ChargingStation updateChargingStation(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    @Transactional
    public void deleteChargingStation(Integer id) {
        // deleteById là phương thức chuẩn của JpaRepository
        chargingStationRepository.deleteById(id);
    }

    @Override
    public Optional<ChargingStation> findById(Integer id) {
        // findById là phương thức chuẩn của JpaRepository
        return chargingStationRepository.findById(id);
    }



    @Override
    public List<ChargingStation> findAll() {
        // Sử dụng findAll chuẩn của JpaRepository thay cho List.of()
        return chargingStationRepository.findAll();
    }

    @Override
    @Transactional
    public ChargingStation updateChargingStationStatus(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }

    @Override
    public boolean existsByStationName(String stationName) {
        // Thay thế logic cũ (findByField("name",stationName)!=null)
        // bằng phương thức tự sinh: existsByStationName(String stationName)
        return chargingStationRepository.existsByStationName(stationName);
    }
    @Override
    public ChargingStation save(ChargingStation chargingStation) {
        return chargingStationRepository.save(chargingStation);
    }
}
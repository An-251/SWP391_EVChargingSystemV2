package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.ChargingPoint;
import swp391.fa25.swp391.service.IService.IChargingPointService;
import swp391.fa25.swp391.repository.models.ChargingPointRepository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class ChargingPointService implements IChargingPointService {
    private final ChargingPointRepository chargingPointRepository;

    @Override
    public ChargingPoint register(ChargingPoint chargingPoint) {
        return chargingPointRepository.save(chargingPoint);
    }

    @Override
    public ChargingPoint updateChargingPoint(ChargingPoint chargingPoint) {
        return chargingPointRepository.save(chargingPoint);
    }

    @Override
    public void deleteChargingPoint(Integer id) { chargingPointRepository.deleteById(id);
    }

    @Override
    public Optional<ChargingPoint> findById(Integer id) {
        return chargingPointRepository.findById(id);
    }



    @Override
    public List<ChargingPoint> findAll() {
        return List.of();
    }

    @Override
    public ChargingPoint updateChargingPointStatus(ChargingPoint chargingPoint) {
        return chargingPointRepository.save(chargingPoint);
    }
}

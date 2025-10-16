package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingStation;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.repository.models.FacilityRepository;
import swp391.fa25.swp391.service.IService.IFacilityService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FacilityService implements IFacilityService {

    private final FacilityRepository facilityRepository;

    @Override
    @Transactional
    public Facility register(Facility facility) {
        return facilityRepository.save(facility);
    }

    @Override
    @Transactional
    public void deleteFacility(Integer id) {
        facilityRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Facility updateFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    @Override
    public Facility findById(Integer id) {
        return facilityRepository.findById(id).orElse(null);
    }

    @Override
    public List<Facility> findByName(String facilityName) {
        return facilityRepository.findByName(facilityName);
    }

    @Override
    public List<Facility> findAll() {
        return facilityRepository.findAll();
    }

    @Override
    public List<Facility> findByFullAddress(String address) {
        // Sử dụng phương thức tìm kiếm trên tất cả các field địa chỉ
        return facilityRepository.findByAddressContaining(address);
    }

    public List<Facility> findByAddress(String address) {
        // Sử dụng phương thức tìm kiếm trên tất cả các field địa chỉ
        return facilityRepository.findByAddressContaining(address);
    }

    /**
     * Phương thức bổ sung từ file gốc. Cần đảm bảo Entity Facility có quan hệ OneToMany với ChargingStation.
     */
    public List<ChargingStation> getChargingStationsByFacilityId(Integer facilityId) {
        Optional<Facility> facility = facilityRepository.findById(facilityId);
        if (facility.isEmpty()) {
            return new ArrayList<>();
        }

        return facility.get().getChargingStations();
    }
    @Override
    public Facility save(Facility facility) {
        return facilityRepository.save(facility);
    }
}
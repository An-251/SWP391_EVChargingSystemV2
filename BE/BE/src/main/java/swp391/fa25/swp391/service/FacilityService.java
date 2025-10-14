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
@Transactional(readOnly = true) // Cấu hình Transactional mặc định
public class FacilityService implements IFacilityService {

    private final FacilityRepository facilityRepository;

    @Override
    @Transactional // Phương thức ghi dữ liệu cần @Transactional
    public Facility register(Facility facility) {
        // save là phương thức chuẩn của JpaRepository
        return facilityRepository.save(facility);
    }

    @Override
    @Transactional // Phương thức ghi dữ liệu cần @Transactional
    public void deleteFacility(Integer id) {
        // deleteById là phương thức chuẩn của JpaRepository
        facilityRepository.deleteById(id);
    }

    @Override
    @Transactional // Phương thức ghi dữ liệu cần @Transactional
    public Facility updateFacility(Facility facility) {
        // save là phương thức chuẩn của JpaRepository (cả insert và update)
        return facilityRepository.save(facility);
    }

    @Override
    public Facility findById(Integer id) {
        // findById là phương thức chuẩn của JpaRepository
        // Lưu ý: .get() sẽ ném NoSuchElementException nếu không tìm thấy. Nên dùng Optional<Facility>
        return facilityRepository.findById(id).orElse(null);
    }

    @Override
    public List<Facility> findByFacilityName(String facilityName) {
        // Sử dụng phương thức tự sinh findByFacilityName
        // Thay thế cho facilityRepository.findByField("facility_name", facilityName);
        return facilityRepository.findByFacilityName(facilityName);
    }

    @Override
    public List<Facility> findAll() {
        // findAll là phương thức chuẩn của JpaRepository
        return facilityRepository.findAll();
    }

    @Override
    public List<Facility> findByAddress(String address) {
        // Sử dụng phương thức tự sinh findByFullAddressContaining
        // Thay thế cho List.of() và logic tìm kiếm cũ
        return facilityRepository.findByFullAddressContaining(address);
    }

    /**
     * Phương thức bổ sung từ file gốc. Cần đảm bảo Entity Facility có quan hệ OneToMany với ChargingStation.
     */
    public List<ChargingStation> getChargingStationsByFacilityId(Integer facilityId) {
        Optional<Facility> facility = facilityRepository.findById(facilityId);
        if (facility.isEmpty()) {
            return new ArrayList<>();
        }

        // Giả định entity Facility có getter getChargingStations()
        // Nếu không có, cần dùng ChargingStationRepository để tìm kiếm theo facilityId
        return facility.get().getChargingStations();
    }
}
package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
    public swp391.fa25.swp391.entity.Facility register(Facility facility) {
        return facilityRepository.save(facility);
    }

    @Override
    public void deleteFacility(Integer id) {
        facilityRepository.deleteById(id);
    }

    @Override
    public Facility updateFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    @Override
    public Facility findById(Integer id) {
        return facilityRepository.findById(id).get();
    }

    @Override
    public List<Facility> findByFacilityName(String facilityName) {
        return facilityRepository.findByField("facility_name",facilityName);
    }

    @Override
    public List<Facility> findAll() {
        return facilityRepository.findAll();
    }

    @Override
    public List<Facility> findByAddress(String address) {
        return List.of();
    }
    public List<ChargingStation> getChargingStationsByFacilityId(Integer facilityId) {
        Optional<Facility> facility = facilityRepository.findById(facilityId);
        if (facility.isEmpty()) {
            return new ArrayList<>();
        }

        Facility existingFacility = facility.get();

        return existingFacility.getChargingStations();
    }
}

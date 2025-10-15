package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Facility;

import java.util.List;
import java.util.Optional;

public interface IFacilityService {
    Facility register(Facility facility);
    void deleteFacility(Integer id);
    Facility updateFacility(Facility facility);
    Facility findById(Integer id);
    List<Facility> findByName(String facilityName);
    List<Facility> findAll();
    List<Facility> findByFullAddress(String address);
}

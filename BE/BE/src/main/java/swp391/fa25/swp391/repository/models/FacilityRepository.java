package swp391.fa25.swp391.repository.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Facility;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Facility
 * Kế thừa JpaRepository<Facility, Integer>
 */
@Repository
public interface FacilityRepository extends JpaRepository<Facility, Integer> {

    /**
     * Tìm Facility theo tên cơ sở (facility_name).
     * Thay thế cho findByField("facility_name", facilityName) trong Service.
     */
    List<Facility> findByFacilityName(String facilityName);

    /**
     * Tìm Facility theo địa chỉ đầy đủ (full_address)
     * Thay thế cho findByAddress trong Service.
     */
    List<Facility> findByFullAddressContaining(String fullAddress);


}
package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     */
    List<Facility> findByName(String facilityName);
    /**
     * Tìm Facility theo bất kỳ phần nào của địa chỉ (street, ward, district, city)
     * Thay thế cho findByFullAddressContaining
     */
    @Query("SELECT f FROM Facility f WHERE " +
            "LOWER(f.streetAddress) LIKE LOWER(CONCAT('%', :address, '%')) OR " +
            "LOWER(f.ward) LIKE LOWER(CONCAT('%', :address, '%')) OR " +
            "LOWER(f.district) LIKE LOWER(CONCAT('%', :address, '%')) OR " +
            "LOWER(f.city) LIKE LOWER(CONCAT('%', :address, '%'))")
    List<Facility> findByAddressContaining(@Param("address") String address);
}
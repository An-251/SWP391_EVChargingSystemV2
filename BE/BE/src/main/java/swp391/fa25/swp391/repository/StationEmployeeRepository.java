package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.entity.Account;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationEmployeeRepository extends JpaRepository<StationEmployee, Integer> {

    /**
     * Tìm StationEmployee theo Account
     */
    Optional<StationEmployee> findByAccount(Account account);

    /**
     * Tìm StationEmployee theo Account ID
     */
    Optional<StationEmployee> findByAccount_Id(Integer accountId);

    /**
     * Tìm tất cả StationEmployee theo Facility ID
     */
    List<StationEmployee> findByFacilityId(Integer facilityId);
}
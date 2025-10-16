package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import swp391.fa25.swp391.entity.IncidentReport;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Integer> {

}
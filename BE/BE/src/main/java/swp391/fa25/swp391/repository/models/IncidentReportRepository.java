package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;
import swp391.fa25.swp391.entity.IncidentReport;
@Repository
public class IncidentReportRepository extends GenericRepositoryImpl<IncidentReport> {
    public IncidentReportRepository() {
        super(IncidentReport.class);
    }
}
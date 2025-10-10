package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;
import swp391.fa25.swp391.entity.StationEmployee;
@Repository
public class StationEmployeeRepository extends GenericRepositoryImpl<StationEmployee> {
    public StationEmployeeRepository() {
        super(StationEmployee.class);
    }
}

package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Facility;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;
@Repository
public class FacilityRepository extends GenericRepositoryImpl<Facility> {
    public FacilityRepository() {
        super(Facility.class);
    }
}

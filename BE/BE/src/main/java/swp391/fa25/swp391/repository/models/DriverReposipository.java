package swp391.fa25.swp391.repository.models;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;

@Repository

public class DriverReposipository extends GenericRepositoryImpl<Driver> {
    public DriverReposipository() {
        super(Driver.class);
    }
}

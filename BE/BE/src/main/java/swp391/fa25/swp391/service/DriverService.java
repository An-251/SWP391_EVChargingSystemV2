package swp391.fa25.swp391.service;



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import swp391.fa25.swp391.entity.Driver;
import swp391.fa25.swp391.repository.models.DriverReposipository;
import swp391.fa25.swp391.service.IService.IDriverService;

import java.util.Optional;
@Service
@RequiredArgsConstructor
public class DriverService implements IDriverService {
    private final DriverReposipository driverReposipository;
    @Override
    public Optional<Driver> findById(Integer id) {

        return driverReposipository.findById(id);
    }
}

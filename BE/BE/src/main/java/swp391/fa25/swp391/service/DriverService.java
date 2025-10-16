package swp391.fa25.swp391.service;



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import swp391.fa25.swp391.entity.Driver;

import swp391.fa25.swp391.repository.DriverRepository;
import swp391.fa25.swp391.service.IService.IDriverService;

import java.util.Optional;
@Service
@RequiredArgsConstructor
public class DriverService implements IDriverService {
    private final DriverRepository driverRepository;
    @Override
    public Optional<Driver> findById(Integer id) {

        return driverRepository.findById(id);
    }
    @Override
    public Optional<Driver> findByUsername(String username) {
        return driverRepository.findByAccountUsername(username);
    }
}

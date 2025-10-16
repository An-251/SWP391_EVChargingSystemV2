package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.Driver;

import java.util.Optional;

public interface IDriverService {
    Optional<Driver> findById(Integer userId);
    Optional<Driver> findByUsername(String username);
}

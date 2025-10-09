package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import swp391.fa25.swp391.entity.StationEmployee;
import swp391.fa25.swp391.repository.models.StationEmployeeRepository;
import swp391.fa25.swp391.service.IService.IStationEmployeeService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StationEmployeeService implements IStationEmployeeService {
    private final StationEmployeeRepository stationEmployeeRepository;

    @Override
    public StationEmployee register(StationEmployee stationEmployee) {
        return stationEmployeeRepository.save(stationEmployee);
    }

    @Override
    public StationEmployee updateStationEmployee(StationEmployee StationEmployee) {
        return stationEmployeeRepository.save(StationEmployee);
    }

    @Override
    public void deleteStationEmployee(Integer id) {
        stationEmployeeRepository.deleteById(id);
    }

    @Override
    public StationEmployee findById(Integer id) {
        return stationEmployeeRepository.findById(id).get();
    }

    @Override
    public List<StationEmployee> findAll() {
        return List.of();
    }



}

package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.entity.StationEmployee;

import java.util.List;

public interface IStationEmployeeService {
    StationEmployee register(StationEmployee stationEmployee);
    void deleteStationEmployee(Integer id);
    StationEmployee findById(Integer id);
    StationEmployee updateStationEmployee(StationEmployee stationEmployee);
    List<StationEmployee> findAll();
//    List<StationEmployee> findByStationId(Integer stationId);
//    boolean existsByEmail(String email);
//    boolean existsByPhone(String phone);
}

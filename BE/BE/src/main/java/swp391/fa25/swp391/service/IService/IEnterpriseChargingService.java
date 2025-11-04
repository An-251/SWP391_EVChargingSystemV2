package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.dto.request.EmpStartSessionRequest;
import swp391.fa25.swp391.dto.request.EmpStopSessionRequest;
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.entity.StationEmployee;

/**
 * Service xử lý logic sạc cho xe Enterprise (do StationEmployee thực hiện)
 */
public interface IEnterpriseChargingService {

    /**
     * StationEmployee bắt đầu 1 phiên sạc cho xe Enterprise
     * @param request DTO chứa vehicleId, chargingPointId, startPercentage
     * @param employee Nhân viên đang thực hiện
     * @return ChargingSession đã được tạo
     */
    ChargingSession startEnterpriseSession(EmpStartSessionRequest request, StationEmployee employee);

    /**
     * StationEmployee dừng 1 phiên sạc
     * @param sessionId ID của phiên sạc đang chạy
     * @param request DTO chứa endPercentage
     * @param employee Nhân viên đang thực hiện
     * @return ChargingSession đã hoàn thành
     */
    ChargingSession stopEnterpriseSession(Integer sessionId, EmpStopSessionRequest request, StationEmployee employee);
}

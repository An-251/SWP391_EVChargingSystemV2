package swp391.fa25.swp391.service.IService;

import swp391.fa25.swp391.dto.request.GenerateInvoiceRequest;
import swp391.fa25.swp391.entity.Admin;
import swp391.fa25.swp391.entity.EnterpriseInvoice;

/**
 * Service xử lý logic tạo hóa đơn (billing) cho Enterprise (do Admin thực hiện)
 */
public interface IEnterpriseBillingService {

    /**
     * Admin tạo hóa đơn tổng hợp cho Enterprise dựa trên kỳ thanh toán
     * @param request DTO chứa enterpriseId và kỳ thanh toán (start/end)
     *a @param admin Admin thực hiện
     * @return Hóa đơn tổng (EnterpriseInvoice) đã được tạo
     */
    EnterpriseInvoice generateEnterpriseInvoice(GenerateInvoiceRequest request, Admin admin);

    /**
     * Lấy chi tiết một hóa đơn (bao gồm các dòng chi tiết)
     * @param invoiceId ID của hóa đơn
     * @return EnterpriseInvoice với đầy đủ thông tin
     */
    EnterpriseInvoice getEnterpriseInvoiceById(Integer invoiceId);
}

package swp391.fa25.swp391.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Lấy tất cả thông báo chưa đọc
    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();
    
    // Lấy tất cả thông báo (bao gồm cả đã đọc)
    List<Notification> findAllByOrderByCreatedAtDesc();
    
    // Đếm số thông báo chưa đọc
    long countByIsReadFalse();
    
    // Lấy thông báo theo loại
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);
}

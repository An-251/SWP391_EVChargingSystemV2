package swp391.fa25.swp391.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.fa25.swp391.entity.ChargingSession;
import swp391.fa25.swp391.entity.Notification;
import swp391.fa25.swp391.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmergencyNotificationService {
    
    private final NotificationRepository notificationRepository;

    /**
     * Tạo thông báo emergency stop cho employee
     */
    @Transactional
    public Notification createEmergencyStopNotification(ChargingSession session) {
        log.info("🚨 [NOTIFICATION] Creating emergency stop notification for session {}", session.getId());
        
        String message = String.format(
            "Emergency stop triggered by Driver ID: %d\n" +
            "Session ID: %d\n" +
            "Charger: %s\n" +
            "Station: %s\n" +
            "Time: %s\n" +
            "⚠️ Please inspect the charging station and create incident report if needed.",
            session.getDriver().getId(),
            session.getId(),
            session.getCharger().getChargerCode(),
            session.getCharger().getChargingPoint().getStation().getStationName(),
            LocalDateTime.now()
        );

        Notification notification = Notification.builder()
                .type("emergency_stop")
                .title("🚨 Emergency Stop Alert")
                .message(message)
                .relatedSessionId(session.getId().longValue())
                .relatedChargerId(session.getCharger().getId().longValue())
                .relatedDriverId(session.getDriver().getId().longValue())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("✅ [NOTIFICATION] Emergency stop notification created with ID: {}", saved.getId());
        
        return saved;
    }

    /**
     * Lấy tất cả thông báo chưa đọc
     */
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
    }

    /**
     * Lấy tất cả thông báo
     */
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
        
        log.info("✅ [NOTIFICATION] Marked notification {} as read", notificationId);
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @Transactional
    public void markAllAsRead() {
        List<Notification> unreadNotifications = notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
        
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        
        notificationRepository.saveAll(unreadNotifications);
        log.info("✅ [NOTIFICATION] Marked {} notifications as read", unreadNotifications.size());
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }
}

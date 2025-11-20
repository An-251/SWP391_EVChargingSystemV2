package swp391.fa25.swp391.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.fa25.swp391.entity.Notification;
import swp391.fa25.swp391.service.EmergencyNotificationService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class NotificationController {

    private final EmergencyNotificationService notificationService;

    /**
     * Lấy tất cả thông báo chưa đọc
     * GET /api/employee/notifications/unread
     */
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        log.info("📬 [API] Fetching unread notifications");
        List<Notification> notifications = notificationService.getUnreadNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Lấy tất cả thông báo (cả đã đọc và chưa đọc)
     * GET /api/employee/notifications
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        log.info("📬 [API] Fetching all notifications");
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Đếm số thông báo chưa đọc
     * GET /api/employee/notifications/count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Đánh dấu một thông báo đã đọc
     * PUT /api/employee/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok("Notification marked as read");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     * PUT /api/employee/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok("All notifications marked as read");
    }
}

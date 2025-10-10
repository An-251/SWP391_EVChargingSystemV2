package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "WORK_SHIFT")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class WorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên ca làm việc: Morning, Afternoon, Night,...
    @Column(nullable = false)
    private String name;

    // Giờ bắt đầu ca
    @Column(nullable = false)
    private LocalTime startTime;

    // Giờ kết thúc ca
    @Column(nullable = false)
    private LocalTime endTime;

    // Liên kết nhiều-nhiều với WorkSchedule
    @ManyToMany(mappedBy = "workShifts")
    private List<WorkSchedule> workSchedules = new ArrayList<>();
}

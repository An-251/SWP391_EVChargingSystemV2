package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ngày làm việc cụ thể
    @Column(nullable = false)
    private LocalDate workDate;

    // Nhân viên được gán lịch làm việc
    @ManyToOne
    @JoinColumn(name = "EMPLOYEE_ID") // hoặc employee_id nếu có class Employee
    private StationEmployee employee;

    // Một WorkSchedule có thể chứa nhiều WorkShift
    @ManyToMany
    @JoinTable(
            name = "work_schedule_shift",
            joinColumns = @JoinColumn(name = "schedule_id"),
            inverseJoinColumns = @JoinColumn(name = "shift_id")
    )
    private List<WorkShift> workShifts = new ArrayList<>();
}

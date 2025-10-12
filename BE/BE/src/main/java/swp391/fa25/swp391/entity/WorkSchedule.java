package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "WORK_SCHEDULE")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class WorkSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ngày làm việc cụ thể
    @Column(nullable = false)
    private LocalDate workDate;

    // Nhân viên được gán lịch làm việc
    @ManyToOne
    @JoinColumn(name = "EMPLOYEE_ID")
    private StationEmployee employee;

    //1 Station chứ nhiều lịch làm việc của nhân viên
    @ManyToOne
    @JoinColumn(name = "STATION_ID")
    private ChargingStation station;


    // Một WorkSchedule có thể chứa nhiều WorkShift
    @ManyToMany
    @JoinTable(
            name = "work_schedule_shift",
            joinColumns = @JoinColumn(name = "schedule_id"),
            inverseJoinColumns = @JoinColumn(name = "shift_id")
    )
    private List<WorkShift> workShifts = new ArrayList<>();
}

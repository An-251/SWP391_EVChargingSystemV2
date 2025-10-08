package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "WORK_SHIFT")
public class WorkShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WORK_SHIFT_ID", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "SHIFT_NAME", nullable = false, length = 50)
    private String shiftName;

    @Column(name = "START_TIME", nullable = false)
    private LocalTime startTime;

    @Column(name = "END_TIME", nullable = false)
    private LocalTime endTime;

}
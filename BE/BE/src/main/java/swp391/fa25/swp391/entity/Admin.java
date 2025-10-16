package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ADMIN")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ADMIN_ID", nullable = false)
    private Integer id;

    @OneToOne(optional = false)
    @JoinColumn(name = "ACCOUNT_ID", nullable = false)
    private Account account;


    @OneToMany(mappedBy = "admin") // "admin" là tên trường Admin trong Facility.java
    private List<Facility> facilities = new ArrayList<>(); // Bạn cần import List và ArrayList

}
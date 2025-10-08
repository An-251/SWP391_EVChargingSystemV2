package swp391.fa25.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ENTERPRISE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enterprise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTERPRISE_ID")
    private Integer id;

    @Nationalized
    @Column(name = "COMPANY_NAME")
    private String companyName;

    @Nationalized
    @Column(name = "TAX_ID", length = 50)
    private String taxId;

    @Nationalized
    @Column(name = "BILLING_ADDRESS", columnDefinition = "nvarchar(max)")
    private String billingAddress;

    @OneToOne
    @JoinColumn(name = "MANAGER_ACCOUNT_ID")
    private Account managerAccount;

    @Nationalized
    @Column(name = "STATUS", length = 50)
    private String status;

    @OneToMany(mappedBy = "enterprise")
    private List<Driver> drivers = new ArrayList<>();
}
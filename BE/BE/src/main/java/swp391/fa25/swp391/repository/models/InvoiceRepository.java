package swp391.fa25.swp391.repository.models;

import org.springframework.stereotype.Repository;
import swp391.fa25.swp391.repository.GenericRepositoryImpl;
import swp391.fa25.swp391.entity.Invoice;
@Repository
public class InvoiceRepository extends GenericRepositoryImpl<Invoice> {
    public InvoiceRepository() {
        super(Invoice.class);
    }
}

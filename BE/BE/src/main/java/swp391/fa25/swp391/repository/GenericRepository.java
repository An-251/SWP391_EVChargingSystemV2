package swp391.fa25.swp391.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface GenericRepository<T> {
    Optional<T> findById(Integer id);
    List<T> findAll();
    T save(T entity);
    T update(T entity);
    void delete(T entity);
    void deleteById(Integer id);
    void deleteByName(String name);
    boolean existsById(Integer id);
    List<T> findByField(String fieldName, Object value);
    Optional<T> updateFields(Integer id, Map<String, Object> fields);

}

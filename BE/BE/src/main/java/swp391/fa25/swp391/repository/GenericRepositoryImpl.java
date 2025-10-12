package swp391.fa25.swp391.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;


import java.lang.Class;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class GenericRepositoryImpl<T> implements GenericRepository<T> {

    @PersistenceContext
    protected EntityManager entityManager;

    private final Class<T> entityClass;

    public GenericRepositoryImpl(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    @Override
    public Optional<T> findById(Integer id) {
        T entity = entityManager.find(entityClass, id);
        return Optional.ofNullable(entity);
    }

    @Override
    public List<T> findAll() {
        return List.of();
    }

    @Override
    @Transactional
    public T save(T entity) {
        entityManager.persist(entity);

        return entity;
    }


    @Override
    public T update(T entity) {
        return entityManager.merge(entity);
    }

    @Override
    public void delete(T entity) {
        entityManager.remove(entityManager.contains(entity) ? entity : entityManager.merge(entity));
    }


    @Override
    public boolean existsById(Integer id) {
        return false;
    }

    @Override
    public void deleteById(Integer id) {
        T entity = entityManager.find(entityClass, id);
        if (entity != null) {
            delete(entity);
        }
    }

    @Override
    public void deleteByName(String name) {
        T entity = entityManager.find(entityClass, name);
        if (entity != null) {
            delete(entity);
        }
    }

    @Override
    public List<T> findByField(String fieldName, Object value) {
        String queryString = "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e." + fieldName + " = :value";
        try {
            return entityManager.createQuery(queryString, entityClass)
                    .setParameter("value", value)
                    .getResultList();

        } catch (jakarta.persistence.NoResultException e) {
            return List.of();
        }
    }

    @Override
    public Optional<T> updateFields(Integer id, Map<String, Object> fields) {
        T entity = entityManager.find(entityClass, id);
        if (entity == null) {
            return Optional.empty();
        }
        fields.forEach((fieldName, value) -> {
            try {
                java.lang.reflect.Field field = entityClass.getDeclaredField(fieldName);
                field.setAccessible(true);
                field.set(entity, value);
            } catch (NoSuchFieldException | IllegalAccessException e) {
                throw new RuntimeException("Error updating field: " + fieldName, e);
            }
        });
        T mergedEntity = entityManager.merge(entity);
        return Optional.of(mergedEntity);
    }
}
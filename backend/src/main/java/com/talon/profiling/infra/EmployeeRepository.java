package com.talon.profiling.infra;

import com.talon.profiling.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department WHERE e.id = :id")
    Optional<Employee> findByIdWithDepartment(Long id);
}
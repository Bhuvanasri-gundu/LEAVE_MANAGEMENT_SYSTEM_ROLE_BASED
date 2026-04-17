import { createContext, useContext, useState, useCallback } from 'react';
import { getEmployees } from '../services/api';

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState(null);

  /**
   * Fetch all employees from API
   * Handles nested response structure: { data: [...] }
   */
  const fetchEmployees = useCallback(async () => {
    setEmployeeLoading(true);
    setEmployeeError(null);
    try {
      const response = await getEmployees();
      // Handle nested response: response.data can be array or object with data property
      const employeeList = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setEmployees(employeeList);
      return employeeList;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch employees';
      setEmployeeError(errorMsg);
      console.error('Error fetching employees:', error);
      return [];
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

  /**
   * Get total employee count
   * Handles both array and nested response formats
   */
  const getEmployeeCount = useCallback(() => {
    return employees.length;
  }, [employees]);

  /**
   * Manually add/update employee in state
   * Used after successful API calls to immediately update UI
   */
  const addEmployeeToStore = useCallback((newEmployee) => {
    setEmployees((prev) => [...prev, newEmployee]);
  }, []);

  /**
   * Remove employee from state
   * Used after successful deletion
   */
  const removeEmployeeFromStore = useCallback((employeeId) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  }, []);

  /**
   * Trigger refresh - called after add/delete operations
   */
  const refreshEmployees = useCallback(() => {
    return fetchEmployees();
  }, [fetchEmployees]);

  const value = {
    // State
    employees,
    employeeLoading,
    employeeError,
    
    // Methods
    fetchEmployees,
    getEmployeeCount,
    addEmployeeToStore,
    removeEmployeeFromStore,
    refreshEmployees,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within EmployeeProvider');
  }
  return context;
};

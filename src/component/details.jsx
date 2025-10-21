import "../style.css";
import { useEffect, useState } from "react";

export default function Details() {
  const [employees, setEmployees] = useState([]);
  const [averageSalary, setAverageSalary] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      const data = await res.json();
      setEmployees(data);

      if (data.length > 0) {
        const totalSalary = data.reduce(
          (sum, emp) => sum + Number(emp.salary || 0),
          0
        );
        const avg = totalSalary / data.length;
        setAverageSalary(avg);
      } else {
        setAverageSalary(0);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  return (
    <div className="details">
      <div className="total-employees">
        <h3>Total Employees</h3>
        <h5>{employees.length}</h5>
      </div>

      <div className="Avg-Salary">
        <h3>Avg Salary</h3>
        <h5>{averageSalary.toFixed(2)} $</h5>
      </div>

      <div className="document-archived">
        <h3>Document Archived</h3>
        <h5>7</h5>
      </div>
    </div>
  );
}

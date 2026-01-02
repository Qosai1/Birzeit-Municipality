import { useEffect, useState } from "react";
import { BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip, Legend, ResponsiveContainer,} from "recharts";
import "../style.css";

export default function EmployeesChart() {
  const [employees, setEmployees] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      const data = await res.json();
      setEmployees(data);
      processData(data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  const processData = (data) => {
    const grouped = {};

    data.forEach((emp) => {
      const department = emp.department || "Unknown";
      grouped[department] = (grouped[department] || 0) + 1;
    });

    const chartArray = Object.entries(grouped).map(([city, count]) => ({
      city,
      count,
    }));

    setChartData(chartArray);
  };

  return (
    <div className="chart-container">
      <h2> Employees by Department</h2>

      {chartData.length === 0 ? (
        <p>No employee data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="10 10" />
            <XAxis dataKey="city" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#070707ff" name="Employees Count" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

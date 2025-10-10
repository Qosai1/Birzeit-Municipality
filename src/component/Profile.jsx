import "../style.css";
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaIdCard, FaMapMarkerAlt, FaBuilding, FaCalendarAlt, FaMoneyBill } from "react-icons/fa";

export default function Profile() {
  const employee = {
    fullName: "Badaha",
    email: "Badaha@gmail.com",
    phone: "+970 599 123 456",
    nationalId: "404132789",
    address: "Ramallah",
    department: "HR",
    startDate: "2021-03-10",
    salary: "3200",
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <FaUserCircle className="profile-icon" />
          <h2>{employee.fullName}</h2>
          <p className="profile-position">{employee.position}</p>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <FaEnvelope className="info-icon" />
            <span>{employee.email}</span>
          </div>

          <div className="info-row">
            <FaPhoneAlt className="info-icon" />
            <span>{employee.phone}</span>
          </div>

          <div className="info-row">
            <FaIdCard className="info-icon" />
            <span>{employee.nationalId}</span>
          </div>

          <div className="info-row">
            <FaMapMarkerAlt className="info-icon" />
            <span>{employee.address}</span>
          </div>

          <div className="info-row">
            <FaBuilding className="info-icon" />
            <span>{employee.department}</span>
          </div>

          <div className="info-row">
            <FaCalendarAlt className="info-icon" />
            <span>Started on: {employee.startDate}</span>
          </div>

          <div className="info-row">
            <FaMoneyBill className="info-icon" />
            <span>Salary: ${employee.salary}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

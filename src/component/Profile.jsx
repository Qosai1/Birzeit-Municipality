import "../style.css";
import React, { useEffect,useState } from "react";
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaIdCard, FaMapMarkerAlt, FaBuilding, FaCalendarAlt, FaMoneyBill } from "react-icons/fa";

export default function Profile() {
  const [user,setUser] = useState(()=>{

    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      return JSON.parse(storedUser);
    }
  });
  


  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <FaUserCircle className="profile-icon" />
          <h2>{user.fullName}</h2>
          <p className="profile-position">{user.position}</p>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <FaEnvelope className="info-icon" />
            <span>{user.email}</span>
          </div>

          <div className="info-row">
            <FaPhoneAlt className="info-icon" />
            <span>{user.phoneNumber}</span>
          </div>

          <div className="info-row">
            <FaIdCard className="info-icon" />
            <span>{user.nationalId}</span>
          </div>

          <div className="info-row">
            <FaMapMarkerAlt className="info-icon" />
            <span>{user.address}</span>
          </div>

          <div className="info-row">
            <FaBuilding className="info-icon" />
            <span>{user.department}</span>
          </div>

          <div className="info-row">
            <FaCalendarAlt className="info-icon" />
            <span>{user.startDate?.slice(0, 10)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

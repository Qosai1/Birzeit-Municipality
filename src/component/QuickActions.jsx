import { Link } from "react-router-dom";
import { CgCalendarDates } from "react-icons/cg";
import { IoPersonAddSharp } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { HiMiniUsers } from "react-icons/hi2";
import { TbCalendarUser } from "react-icons/tb";

import "../style.css";

export default function QuickActions() {
  return (
    <div className="quick-actions">
      <Link to="/add" className="action-link add">
        <IoPersonAddSharp /> Add New Employee
      </Link>

    <Link to="/employees" className="action-link view">
        <HiMiniUsers /> View All Employees
      </Link>
      
     

      <Link to="/schedule" className="action-link schedule">
        <CgCalendarDates /> Schedule Interview
      </Link>
      <Link to="/interviews" className="action-link view">
                <TbCalendarUser/>  View Scheduled Interviews
                  </Link>
      <Link to="/Documents" className="action-link report">
        <TbReportAnalytics /> Documents
      </Link>
    </div>
  );
}

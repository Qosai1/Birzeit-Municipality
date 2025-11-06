import { Link } from "react-router-dom";
import { CgCalendarDates } from "react-icons/cg";
import { IoPersonAddSharp } from "react-icons/io5";
import { TbReportAnalytics, TbCalendarUser } from "react-icons/tb";
import { HiMiniUsers } from "react-icons/hi2";
import { SlCalender } from "react-icons/sl";
import "../style.css";

export default function QuickActions() {
  return (
    <div className="quick-actions">
      <Link to="/hr-dashboard/add" className="action-link add">
        <IoPersonAddSharp /> Add New Employee
      </Link>

      <Link to="/hr-dashboard/employees" className="action-link employees">
        <HiMiniUsers /> View All Employees
      </Link>

      <Link to="/hr-dashboard/schedule" className="action-link schedule">
        <CgCalendarDates /> Schedule Interview
      </Link>

      <Link to="/hr-dashboard/interviews" className="action-link interviews">
        <TbCalendarUser /> View Scheduled Interviews
      </Link>
      <Link to="/hr-dashboard/Documents" className="action-link Documents">
       <TbReportAnalytics /> Documents </Link>

      <Link to="/hr-dashboard/calendar" className="action-link calendar">
        <SlCalender /> Interview Calendar
      </Link>

      
    </div>
  );
}

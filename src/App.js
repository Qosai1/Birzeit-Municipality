import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./component/Header";
import Details from "./component/details";
import AddEmployee from "./component/AddEmployee";
import QuickActions from "./component/QuickActions";
import Profile from "./component/Profile";
import EmployeesTable from "./component/EmployeesTable";

export default function App() {
  return (<>
  
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Details />
              <div className="dd">
              <EmployeesTable/>
              <QuickActions />
            
            </div>
            </div>
          }
        />

 
        <Route path="/add" element={<AddEmployee />} />
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
  
  </>);
}

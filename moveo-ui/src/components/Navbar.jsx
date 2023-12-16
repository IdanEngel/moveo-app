import React from "react";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import "./Navbar.css";

// This component handles the Navbar that returns the user to the home screen
const Navbar = () => {
  return (
    <nav className="nav-container">
      <Link to="/">
        <HomeIcon
          className="homeBtn"
          sx={{ fontSize: 40, color: "black" }}
          titleAccess="All Assignments"
        />
      </Link>
    </nav>
  );
};

export default Navbar;

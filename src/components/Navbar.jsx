import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

const Navbar = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null); // update App state
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">JoinEazy</h1>
        <div className="navbar-links">
          {currentUser ? (
            <>
              <span className="navbar-user">Hello, {currentUser.name}</span>
              <button className="navbar-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn">Login</Link>
              <Link to="/register" className="navbar-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

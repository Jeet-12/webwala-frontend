import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, CheckSquare, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <CheckSquare size={24} className="brand-icon" />
          <span>TaskFlow</span>
        </Link>

        <div className="navbar-right">
          <div className="user-pill">
            <User size={15} />
            <span>{user?.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

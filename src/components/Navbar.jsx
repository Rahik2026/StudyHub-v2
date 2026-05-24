import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { logout } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/homework', icon: CheckSquare, label: 'Homework' },
    { to: '/exams', icon: Calendar, label: 'Exams' },
    { to: '/notes', icon: BookOpen, label: 'Notes' },
    { to: '/messenger', icon: MessageSquare, label: 'Messenger' },
    { to: '/community', icon: Users, label: 'Community' },
  ];

  return (
    <nav className="glass-nav px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">StudyHub</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden pt-4 pb-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

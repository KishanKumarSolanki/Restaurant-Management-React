import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Utensils, Home, LayoutDashboard, Users, Receipt, LineChart, UserCheck, ShoppingCart, Menu as MenuIcon, X,
  BookOpen, LogOut, UserCircle, CalendarClock, ClipboardCheck, Tags,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Dropdown from './Dropdown.jsx';

const link = ({ isActive }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'}`;
const dd = 'flex items-center gap-2 px-4 py-2 hover:bg-gray-100';

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const doLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-40 bg-gradient-to-br from-ink to-[#3d3d3d] shadow-[0_2px_15px_rgba(0,0,0,0.1)]">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/home" className="flex items-center gap-2 text-xl font-bold text-white"><Utensils size={22} /> Cafe Express</Link>

          <button className="cursor-pointer text-white lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">{open ? <X /> : <MenuIcon />}</button>

          <div
            className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col gap-1 bg-ink p-4 lg:static lg:flex lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:bg-transparent lg:p-0`}
            onClick={(e) => e.target.closest('a') && setOpen(false)}
          >
            <div className="flex flex-col gap-1 lg:ml-6 lg:flex-row lg:items-center">
              <NavLink to="/home" className={link}><Home size={16} /> Home</NavLink>
              <NavLink to="/dashboard" className={link}><LayoutDashboard size={16} /> Dashboard</NavLink>
              <NavLink to="/customers" className={link}><Users size={16} /> Customers</NavLink>
              <Dropdown label="Menu" icon={Utensils} active={pathname.startsWith('/items') || pathname.startsWith('/menu-categories')}>
                <Link to="/items" className={dd}><BookOpen size={15} /> Menu Items</Link>
                <Link to="/menu-categories" className={dd}><Tags size={15} /> Categories</Link>
              </Dropdown>
              <NavLink to="/orders" className={link}><Receipt size={16} /> Orders</NavLink>
              <NavLink to="/reports" className={link}><LineChart size={16} /> Reports</NavLink>
              <Dropdown label="Staff" icon={UserCheck} active={pathname.startsWith('/staff')}>
                <Link to="/staff-members" className={dd}><Users size={15} /> Staff Members</Link>
                <Link to="/staff-shifts" className={dd}><CalendarClock size={15} /> Shifts</Link>
                <Link to="/staff/assign" className={dd}><ClipboardCheck size={15} /> Assign Orders</Link>
              </Dropdown>
            </div>

            <div className="mt-2 flex items-center gap-3 lg:mt-0">
              <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full border border-white/70 px-3 py-1.5 text-sm text-white hover:bg-white hover:text-ink">
                <ShoppingCart size={16} /> Cart
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">{count}</span>
                )}
              </Link>
              <Dropdown label={user?.name} icon={UserCircle} align="right">
                <Link to="/profile" className={dd}><UserCircle size={15} /> Profile</Link>
                <button onClick={doLogout} className={`${dd} w-full cursor-pointer text-left`}><LogOut size={15} /> Log Out</button>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-8"><div className="mx-auto max-w-7xl px-4"><Outlet /></div></main>

      <footer className="bg-gradient-to-br from-ink to-[#3d3d3d] py-6 text-sm text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 md:flex-row">
          <p>&copy; {new Date().getFullYear()} <Link to="/home" className="text-secondary hover:text-white hover:underline">Cafe Express</Link>. All rights reserved.</p>
          <p className="flex gap-4 text-secondary"><span>Privacy Policy</span><span>Terms of Service</span><span>Contact Us</span></p>
        </div>
      </footer>
    </div>
  );
}

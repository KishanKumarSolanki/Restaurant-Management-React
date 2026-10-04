import { Link } from 'react-router-dom';
import { Users, Utensils, Receipt, LineChart, UserCheck, LayoutDashboard, PlusCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const tiles = [
  { to: '/customers', icon: Users, title: 'Customers', text: 'Profiles, notes, preferences and order history.' },
  { to: '/items', icon: Utensils, title: 'Menu Items', text: 'Manage dishes, prices and availability.' },
  { to: '/orders', icon: Receipt, title: 'Orders', text: 'Create, edit and track every order.' },
  { to: '/staff-members', icon: UserCheck, title: 'Staff', text: 'Team members, shifts and order assignment.' },
  { to: '/reports', icon: LineChart, title: 'Reports', text: 'Revenue, top items and best customers.' },
  { to: '/dashboard', icon: LayoutDashboard, title: 'Dashboard', text: 'Live operations snapshot at a glance.' },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      <section className="mb-8 flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-cover bg-center px-4 text-center text-white" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7)), url('/img/bg5.jpg')" }}>
        <div>
          <h1 className="mb-3 text-4xl font-bold drop-shadow-lg md:text-5xl">Hello, {user?.name}</h1>
          <p className="mb-6 text-lg text-white/85">Welcome to Cafe Express - run your restaurant from one place.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/orders/new" className="btn btn-primary px-6 py-2.5"><PlusCircle size={16} /> Create Order</Link>
            <Link to="/cart" className="btn btn-light px-6 py-2.5"><ShoppingCart size={16} /> View Cart</Link>
          </div>
        </div>
      </section>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="card p-6 text-center transition hover:-translate-y-1 hover:shadow-xl">
            <Icon size={38} className="mx-auto mb-3 text-primary" />
            <h3 className="mb-1 text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

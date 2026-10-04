import { Link } from 'react-router-dom';
import { Utensils, LogIn, UserPlus, Users, ClipboardList, ArrowDown, CheckCircle2 } from 'lucide-react';

const features = [
  { icon: Users, title: 'Customer Management', sub: 'Build loyalty through personalized service', points: ['360° Customer Profiles', 'Order History', 'Preferences & Notes', 'Feedback System'], tip: 'Use the notes field to record allergies or favorite tables.' },
  { icon: Utensils, title: 'Menu Management', sub: 'Your digital menu command center', points: ['Real-Time Updates', 'Categories & Availability', 'Price Control', 'Seasonal Flexibility'], tip: 'Mark items out of stock so staff never promise a sold-out dish.' },
  { icon: ClipboardList, title: 'Order Processing', sub: 'From kitchen to table seamlessly', points: ['Multi-item Orders', 'Staff Assignment', 'Cash / Online Payment', 'Sales Reports'], tip: 'Assign pending orders to staff from the dashboard in one click.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 bg-gradient-to-br from-ink to-[#3d3d3d] shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-xl font-bold text-white"><Utensils size={22} /> Cafe Express</span>
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-primary btn-sm"><LogIn size={14} /> Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm"><UserPlus size={14} /> Register</Link>
          </div>
        </div>
      </nav>

      <section className="mb-12 bg-cover bg-center py-24 text-center text-white" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.6)), url('/img/bg5.jpg')" }}>
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">Welcome to Cafe Express</h1>
          <p className="mb-4 text-xl">Your Complete Restaurant Management Solution</p>
          <p className="mb-8 text-white/80">Streamline every aspect of your restaurant operations with our intuitive system that puts you in complete control.</p>
          <a href="#features" className="btn btn-primary px-7 py-3"><ArrowDown size={16} /> Explore Features</a>
        </div>
      </section>

      <section id="features" className="mx-auto mb-12 grid max-w-7xl gap-6 px-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, sub, points, tip }) => (
          <div key={title} className="card p-6 transition hover:-translate-y-1">
            <div className="text-center">
              <Icon size={40} className="mx-auto mb-3 text-primary" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mb-4 text-sm text-gray-500">{sub}</p>
            </div>
            <ul className="mb-4 space-y-2 text-sm">
              {points.map((p) => <li key={p} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> {p}</li>)}
            </ul>
            <div className="rounded-r-lg border-l-4 border-primary bg-primary/10 p-3 text-sm"><strong>Tip:</strong> {tip}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

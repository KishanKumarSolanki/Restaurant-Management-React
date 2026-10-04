import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { GuestRoute, ProtectedRoute } from './components/RouteGuards.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';
import CustomerList from './pages/customers/CustomerList.jsx';
import CustomerForm from './pages/customers/CustomerForm.jsx';
import CustomerShow from './pages/customers/CustomerShow.jsx';
import CategoryList from './pages/categories/CategoryList.jsx';
import CategoryForm from './pages/categories/CategoryForm.jsx';
import ItemList from './pages/items/ItemList.jsx';
import ItemForm from './pages/items/ItemForm.jsx';
import OrderList from './pages/orders/OrderList.jsx';
import OrderForm from './pages/orders/OrderForm.jsx';
import Cart from './pages/orders/Cart.jsx';
import StaffList from './pages/staff/StaffList.jsx';
import StaffForm from './pages/staff/StaffForm.jsx';
import ShiftList from './pages/staff/ShiftList.jsx';
import ShiftForm from './pages/staff/ShiftForm.jsx';
import AssignOrders from './pages/staff/AssignOrders.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerShow />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />

          <Route path="/menu-categories" element={<CategoryList />} />
          <Route path="/menu-categories/new" element={<CategoryForm />} />
          <Route path="/menu-categories/:id/edit" element={<CategoryForm />} />

          <Route path="/items" element={<ItemList />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id/edit" element={<ItemForm />} />

          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id/edit" element={<OrderForm />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/staff-members" element={<StaffList />} />
          <Route path="/staff-members/new" element={<StaffForm />} />
          <Route path="/staff-members/:id/edit" element={<StaffForm />} />
          <Route path="/staff-shifts" element={<ShiftList />} />
          <Route path="/staff-shifts/new" element={<ShiftForm />} />
          <Route path="/staff-shifts/:id/edit" element={<ShiftForm />} />
          <Route path="/staff/assign" element={<AssignOrders />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

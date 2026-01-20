import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import SalesDetail from './pages/SalesDetail';  // ✅ ADD THIS
import Suppliers from './pages/Suppliers';
import ReceiveGoods from './pages/ReceiveGoods';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import StockAdjustments from './pages/StockAdjustments';
import Transfers from './pages/Transfers';
import Returns from './pages/Returns';
import PlatformSettings from './pages/PlatformSettings';
import PriceManagement from './pages/PriceManagement';
import ProductTransactions from './pages/ProductTransactions';
import CustomerPayments from './pages/CustomerPayments';
import Roles from './pages/Roles';


export default function App() {
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/price-management" element={<PriceManagement />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sales/:id" element={<SalesDetail />} />  {/* ✅ ADDED */}
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="receive-goods" element={<ReceiveGoods />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="customers" element={<Customers />} />
          <Route path="stock-adjustments" element={<StockAdjustments />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="returns" element={<Returns />} />
          <Route path="settings" element={<PlatformSettings />} />
          <Route path="price-management" element={<PriceManagement />} />
          {/* <Route path="product-transactions" element={<ProductTransactions />} /> */}
          <Route path="/settings/platforms" element={<ProtectedRoute><PlatformSettings /></ProtectedRoute>} />
          <Route path="/customer-payments" element={<CustomerPayments />} />
          <Route path="/roles" element={<Roles />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

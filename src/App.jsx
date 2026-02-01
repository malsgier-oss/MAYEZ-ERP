import { Routes, Route } from 'react-router-dom'
import Layout from './components/shared/Layout'
import DashboardScreen from './components/dashboard/DashboardScreen'
import POSScreen from './components/pos/POSScreen'
import ProductList from './components/products/ProductList'
import ProductForm from './components/products/ProductForm'
import CategoryList from './components/categories/CategoryList'
import CustomerList from './components/customers/CustomerList'
import CustomerDetail from './components/customers/CustomerDetail'
import CustomerForm from './components/customers/CustomerForm'
import InvoiceHistory from './components/invoices/InvoiceHistory'
import InvoiceDetail from './components/invoices/InvoiceDetail'
import InventoryScreen from './components/inventory/InventoryScreen'
import SupplierList from './components/suppliers/SupplierList'
import SupplierForm from './components/suppliers/SupplierForm'
import SupplierDetail from './components/suppliers/SupplierDetail'
import ReceiveStockScreen from './components/purchases/ReceiveStockScreen'
import PurchaseDetail from './components/purchases/PurchaseDetail'
import ReportsScreen from './components/reports/ReportsScreen'
import SettingsScreen from './components/settings/SettingsScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<POSScreen />} />
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="products" element={<ProductList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="invoices" element={<InvoiceHistory />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="suppliers/new" element={<SupplierForm />} />
        <Route path="suppliers/:id" element={<SupplierDetail />} />
        <Route path="purchases/new" element={<ReceiveStockScreen />} />
        <Route path="purchases/:id" element={<PurchaseDetail />} />
        <Route path="inventory" element={<InventoryScreen />} />
        <Route path="reports" element={<ReportsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
    </Routes>
  )
}

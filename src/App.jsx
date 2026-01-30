import { Routes, Route } from 'react-router-dom'
import Layout from './components/shared/Layout'
import POSScreen from './components/pos/POSScreen'
import ProductList from './components/products/ProductList'
import ProductForm from './components/products/ProductForm'
import CustomerList from './components/customers/CustomerList'
import CustomerDetail from './components/customers/CustomerDetail'
import CustomerForm from './components/customers/CustomerForm'
import InvoiceHistory from './components/invoices/InvoiceHistory'
import InvoiceDetail from './components/invoices/InvoiceDetail'
import InventoryScreen from './components/inventory/InventoryScreen'
import ReportsScreen from './components/reports/ReportsScreen'
import SettingsScreen from './components/settings/SettingsScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<POSScreen />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="invoices" element={<InvoiceHistory />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="inventory" element={<InventoryScreen />} />
        <Route path="reports" element={<ReportsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
    </Routes>
  )
}

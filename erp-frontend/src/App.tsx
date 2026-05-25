import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Sidebar } from "@/layouts/Sidebar"
import { Customers } from "@/pages/Customers"
import { Services } from "@/pages/Services"
import { Subscriptions } from "@/pages/Subscriptions"

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Sidebar />}>
                    <Route index element={<Navigate to="/customers" replace />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="services" element={<Services />} />
                    <Route path="subscriptions" element={<Subscriptions />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App

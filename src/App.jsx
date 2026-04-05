import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const token = localStorage.getItem("token")
  const guest = localStorage.getItem("guest") === "true"

  return (
    <BrowserRouter>
      <Routes>

        {/* página inicial */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* cadastro */}
        <Route path="/register" element={<Register />} />

        {/* login */}
        <Route path="/login" element={<Login />} />

        {/* dashboard protegido */}
        <Route
          path="/dashboard"
          element={token || guest ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  )
}


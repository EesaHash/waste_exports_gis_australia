import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard></Dashboard>} />
    </Routes>
  </BrowserRouter>
  )
}

export default App

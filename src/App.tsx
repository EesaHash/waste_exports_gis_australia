import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
// @ts-expect-error
import Dashboard from "./pages/Dashboard.jsx";

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

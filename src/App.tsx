import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
// @ts-expect-error
import Dashboard from "./pages/Dashboard.jsx";
// @ts-expect-error
import DataSourceContextProvider from "./contexts/DataSource.jsx";
import { ThemeProvider } from "./components/theme/ThemeProvider.tsx";

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <DataSourceContextProvider>
    <BrowserRouter>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard></Dashboard>} />
    </Routes>
  </BrowserRouter>
  </DataSourceContextProvider>
  </ThemeProvider>
  )
}

export default App

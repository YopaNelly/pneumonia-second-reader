import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ProtectedRoute } from "./lib/auth.jsx";
import Splash from "./pages/Splash.jsx";
import Welcome from "./pages/Welcome.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analyze from "./pages/Analyze.jsx";
import History from "./pages/History.jsx";
import CaseDetail from "./pages/CaseDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<CaseDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

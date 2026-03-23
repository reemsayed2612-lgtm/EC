import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import PlacementTest from "./pages/PlacementTest";
import Training from "./pages/Training";
import Dashboard from "./pages/Dashboard";
import Conversation from "./pages/Conversation";
import DailyTest from "./pages/DailyTest";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans flex flex-col selection:bg-violet-500/30">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/placement" element={<PlacementTest />} />
          <Route path="/training" element={<Training />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/daily-test" element={<DailyTest />} />
        </Routes>
      </div>
    </Router>
  );
}


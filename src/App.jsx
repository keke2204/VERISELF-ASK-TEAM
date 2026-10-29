import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import CookieBanner from "./components/CookieBanner";

// Template Home landing page
import Home from "./pages/Home";

// Dashboard console pages
import Dashboard from "./pages/Dashboard";
import Identity from "./pages/Identity";
import Monitoring from "./pages/Monitoring";
import Matches from "./pages/Matches";
import Risk from "./pages/Risk";
import Alerts from "./pages/Alerts";
import Evidence from "./pages/Evidence";
import Legal from "./pages/Legal";
import Protection from "./pages/Protection";
import Manipulation from "./pages/Manipulation";

// Legal / policy pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";

// Custom 404 page
import NotFound from "./pages/NotFound";

function DashboardLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar />
        <div className="w-full flex-1">{children}</div>
      </div>
    </div>
  );
}

function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="w-full flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Routes location={location}>
        {/* Landing Page with VeriSelf Template Model */}
        <Route path="/" element={<Home />} />

        {/* Dashboard Console Routes (wrapped in Sidebar & Topbar) */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/identity"
          element={
            <DashboardLayout>
              <PageTransition>
                <Identity />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/identity"
          element={
            <DashboardLayout>
              <PageTransition>
                <Identity />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/monitoring"
          element={
            <DashboardLayout>
              <PageTransition>
                <Monitoring />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/monitoring"
          element={
            <DashboardLayout>
              <PageTransition>
                <Monitoring />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/matches"
          element={
            <DashboardLayout>
              <PageTransition>
                <Matches />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/matches"
          element={
            <DashboardLayout>
              <PageTransition>
                <Matches />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/manipulation"
          element={
            <DashboardLayout>
              <PageTransition>
                <Manipulation />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/manipulation"
          element={
            <DashboardLayout>
              <PageTransition>
                <Manipulation />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/forensics"
          element={
            <DashboardLayout>
              <PageTransition>
                <Manipulation />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/risk"
          element={
            <DashboardLayout>
              <PageTransition>
                <Risk />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/risk"
          element={
            <DashboardLayout>
              <PageTransition>
                <Risk />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/alerts"
          element={
            <DashboardLayout>
              <PageTransition>
                <Alerts />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/alerts"
          element={
            <DashboardLayout>
              <PageTransition>
                <Alerts />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/evidence"
          element={
            <DashboardLayout>
              <PageTransition>
                <Evidence />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/evidence"
          element={
            <DashboardLayout>
              <PageTransition>
                <Evidence />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/legal"
          element={
            <DashboardLayout>
              <PageTransition>
                <Legal />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/legal"
          element={
            <DashboardLayout>
              <PageTransition>
                <Legal />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/protection"
          element={
            <DashboardLayout>
              <PageTransition>
                <Protection />
              </PageTransition>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/protection"
          element={
            <DashboardLayout>
              <PageTransition>
                <Protection />
              </PageTransition>
            </DashboardLayout>
          }
        />

        {/* Policy pages */}
        <Route
          path="/privacy-policy"
          element={
            <PageTransition>
              <PrivacyPolicy />
            </PageTransition>
          }
        />
        <Route
          path="/terms"
          element={
            <PageTransition>
              <Terms />
            </PageTransition>
          }
        />
        <Route
          path="/cookie-policy"
          element={
            <PageTransition>
              <CookiePolicy />
            </PageTransition>
          }
        />

        {/* Custom 404 with uploaded ghost illustration */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Cookie consent banner */}
      <CookieBanner />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

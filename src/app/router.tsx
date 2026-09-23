import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AuthModal } from "../components/auth/AuthModal";
import { AgentConnectModal } from "../components/agent/AgentConnectModal";
import { RouteErrorFallback } from "../components/common/RouteErrorFallback";

const LandingPage = lazy(() =>
  import("../pages/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const Dashboard = lazy(() =>
  import("../pages/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const VerificationsList = lazy(() =>
  import("../pages/VerificationsList").then((m) => ({ default: m.VerificationsList }))
);
const NewVerification = lazy(() =>
  import("../pages/NewVerification").then((m) => ({ default: m.NewVerification }))
);
const VerificationProcessing = lazy(() =>
  import("../pages/VerificationProcessing").then((m) => ({ default: m.VerificationProcessing }))
);
const VerificationDetail = lazy(() =>
  import("../pages/VerificationDetail").then((m) => ({ default: m.VerificationDetail }))
);
const EvidenceExplorer = lazy(() =>
  import("../pages/EvidenceExplorer").then((m) => ({ default: m.EvidenceExplorer }))
);
const CorrectionLoop = lazy(() =>
  import("../pages/CorrectionLoop").then((m) => ({ default: m.CorrectionLoop }))
);
const Agents = lazy(() =>
  import("../pages/Agents").then((m) => ({ default: m.Agents }))
);
const ConnectAgent = lazy(() =>
  import("../pages/ConnectAgent").then((m) => ({ default: m.ConnectAgent }))
);
const Docs = lazy(() =>
  import("../pages/Docs").then((m) => ({ default: m.Docs }))
);
const PrivacyPolicy = lazy(() =>
  import("../pages/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsConditions = lazy(() =>
  import("../pages/TermsConditions").then((m) => ({ default: m.TermsConditions }))
);
const NotFound = lazy(() =>
  import("../pages/NotFound").then((m) => ({ default: m.NotFound }))
);
const Welcome = lazy(() =>
  import("../pages/Welcome").then((m) => ({ default: m.Welcome }))
);
const Account = lazy(() =>
  import("../pages/Account").then((m) => ({ default: m.Account }))
);

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-[#6B635B]">
    <span className="w-8 h-8 border-2 border-[#181311] border-t-transparent rounded-full animate-spin" />
    <span className="font-mono text-xs">Loading view...</span>
  </div>
);

const RootLayout: React.FC = () => {
  return (
    <>
      <Outlet />
      <AuthModal />
      <AgentConnectModal />
    </>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      // Public Marketing / Static Routes
      {
        path: "/",
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: "/get-started",
        element: <Navigate to="/welcome" replace />,
      },
      {
        path: "/invite",
        element: <Navigate to="/welcome" replace />,
      },
      {
        path: "/privacy",
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PrivacyPolicy />
          </Suspense>
        ),
      },
      {
        path: "/terms",
        errorElement: <RouteErrorFallback />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <TermsConditions />
          </Suspense>
        ),
      },

      // App Shell Routes (Full app layout with sidebar and header)
      {
        element: <AppShell />,
        errorElement: <RouteErrorFallback />,
        children: [
          {
            path: "/welcome",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Welcome />
              </Suspense>
            ),
          },
          {
            path: "/connect-agent",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ConnectAgent />
              </Suspense>
            ),
          },
          {
            path: "/agents/connect",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ConnectAgent />
              </Suspense>
            ),
          },
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "/verifications",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VerificationsList />
              </Suspense>
            ),
          },
          {
            path: "/evidence",
            element: (
              <Suspense fallback={<PageLoader />}>
                <EvidenceExplorer />
              </Suspense>
            ),
          },
          {
            path: "/verify/new",
            element: (
              <Suspense fallback={<PageLoader />}>
                <NewVerification />
              </Suspense>
            ),
          },
          {
            path: "/verify/processing/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VerificationProcessing />
              </Suspense>
            ),
          },
          {
            path: "/verify/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <VerificationDetail />
              </Suspense>
            ),
          },
          {
            path: "/verify/:id/evidence",
            element: (
              <Suspense fallback={<PageLoader />}>
                <EvidenceExplorer />
              </Suspense>
            ),
          },
          {
            path: "/verify/:id/correction",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CorrectionLoop />
              </Suspense>
            ),
          },
          {
            path: "/agents",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Agents />
              </Suspense>
            ),
          },
          {
            path: "/docs",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Docs />
              </Suspense>
            ),
          },
          {
            path: "/account",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Account />
              </Suspense>
            ),
          },
          {
            path: "*",
            element: (
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

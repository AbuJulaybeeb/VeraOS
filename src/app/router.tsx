import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

const LandingPage = lazy(() =>
  import("../pages/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const Dashboard = lazy(() =>
  import("../pages/Dashboard").then((m) => ({ default: m.Dashboard }))
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
const NotFound = lazy(() =>
  import("../pages/NotFound").then((m) => ({ default: m.NotFound }))
);

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-on-surface-variant">
    <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
    <span className="font-code-sm text-code-sm">Loading telemetry interface...</span>
  </div>
);

export const router = createBrowserRouter([
  // Landing Page
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },

  // Authenticated App Shell Routes
  {
    element: <AppShell />,
    children: [
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
        element: <Navigate to="/dashboard" replace />,
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
        path: "/agents/connect",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ConnectAgent />
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
]);

import { Navigate, Outlet, Route, Routes, useLocation, Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Layout from "@/components/Layout";
import { RequireRole } from "@/app/auth";
import { EmptyState, Button } from "@/components/ui";
import { Audit, Queue, Users } from "@/pages/admin/Admin";
import Apply from "@/pages/candidate/Apply";
import { ApplicationFeedback, MyApplications } from "@/pages/candidate/Applications";
import CandidateChat from "@/pages/candidate/Chat";
import CandidateDashboard from "@/pages/candidate/Dashboard";
import Feed from "@/pages/candidate/Feed";
import Profile from "@/pages/candidate/Profile";
import Applicants from "@/pages/company/Applicants";
import CompanyChat from "@/pages/company/Chat";
import CompanyDashboard from "@/pages/company/Dashboard";
import CompanyProfile from "@/pages/company/CompanyProfile";
import PostJob from "@/pages/company/PostJob";
import Ranking from "@/pages/company/Ranking";
import Shortlist from "@/pages/company/Shortlist";
import Browse from "@/pages/public/Browse";
import JobDetail from "@/pages/public/JobDetail";
import Landing from "@/pages/public/Landing";
import { Login, Register } from "@/pages/public/Auth";
import { IS_ADMIN_VIEW, START_PATH } from "@/lib/view";

const cand = (el: JSX.Element) => <RequireRole role="candidate">{el}</RequireRole>;
const comp = (el: JSX.Element) => <RequireRole role="company">{el}</RequireRole>;
const adm = (el: JSX.Element) => <RequireRole role="admin">{el}</RequireRole>;

const OPEN_IN_ADMIN_VIEW = ["/login", "/register"];

// On the admin dev server every path outside /admin/* bounces back to the admin section,
// so terminal 2 is an admin console rather than a second copy of the site.
function AdminViewGate() {
  const { pathname } = useLocation();
  if (!IS_ADMIN_VIEW) return null;
  if (pathname.startsWith("/admin") || OPEN_IN_ADMIN_VIEW.includes(pathname)) return null;
  return <Navigate to={START_PATH} replace />;
}

/** Every route except the full-bleed marketing home sits in this centred column. */
function PageFrame() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AdminViewGate />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={IS_ADMIN_VIEW ? <Navigate to={START_PATH} replace /> : <Landing />} />

          <Route element={<PageFrame />}>
            <Route path="jobs" element={<Browse />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="candidate" element={cand(<CandidateDashboard />)} />
            <Route path="candidate/profile" element={cand(<Profile />)} />
            <Route path="candidate/feed" element={cand(<Feed />)} />
            <Route path="candidate/apply/:id" element={cand(<Apply />)} />
            <Route path="candidate/applications" element={cand(<MyApplications />)} />
            <Route path="candidate/applications/:id" element={cand(<ApplicationFeedback />)} />
            <Route path="candidate/chat" element={cand(<CandidateChat />)} />

            <Route path="company" element={comp(<CompanyDashboard />)} />
            <Route path="company/profile" element={comp(<CompanyProfile />)} />
            <Route path="company/jobs/new" element={comp(<PostJob />)} />
            <Route path="company/jobs/:id/edit" element={comp(<PostJob />)} />
            <Route path="company/jobs/:id/applicants" element={comp(<Applicants />)} />
            <Route path="company/jobs/:id/ranking" element={comp(<Ranking />)} />
            <Route path="company/jobs/:id/shortlist" element={comp(<Shortlist />)} />
            <Route path="company/chat" element={comp(<CompanyChat />)} />

            <Route path="admin" element={<Navigate to={START_PATH} replace />} />
            <Route path="admin/users" element={adm(<Users />)} />
            <Route path="admin/queue" element={adm(<Queue />)} />
            <Route path="admin/audit" element={adm(<Audit />)} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      hint="That link does not lead anywhere. Head back to the home page or browse open jobs."
      action={
        <div className="mt-1 flex gap-2">
          <Link to="/"><Button variant="outline">Home</Button></Link>
          <Link to="/jobs"><Button>Browse jobs</Button></Link>
        </div>
      }
    />
  );
}

import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PortfolioPage from './pages/PortfolioPage';
import LoginPage from './pages/LoginPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CareersPage from './pages/CareersPage';
import TechnologiesPage from './pages/careers/TechnologiesPage';
import JobPositionsPage from './pages/careers/JobPositionsPage';
import InternshipsPage from './pages/careers/InternshipsPage';
import EndToEndServicesPage from './pages/EndToEndServicesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import UserProfilePage from './pages/UserProfilePage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';
import ProgrammingQuizPage from './pages/challenges/ProgrammingQuizPage';
import AptitudeQuizPage from './pages/challenges/AptitudeQuizPage';
import DebugChallengePage from './pages/challenges/DebugChallengePage';
import TechMatchingPage from './pages/challenges/TechMatchingPage';
import InterviewRapidFirePage from './pages/challenges/InterviewRapidFirePage';
import SystemDesignPage from './pages/challenges/SystemDesignPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/layouts/AdminLayout';
import { AdminGuard } from './components/common/AdminGuard';
import AdminDashboard from './pages/admin/AdminDashboard';
import LeadsPage from './pages/admin/LeadsPage';
import ClientsPage from './pages/admin/ClientsPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import InternshipApplicationsPage from './pages/admin/InternshipApplicationsPage';
import ConsultationRequestsPage from './pages/admin/ConsultationRequestsPage';
import ProjectRequestsPage from './pages/admin/ProjectRequestsPage';
import AIChatsPage from './pages/admin/AIChatsPage';
import TestimonialsAdminPage from './pages/admin/TestimonialsAdminPage';
import CareersAdminPage from './pages/admin/CareersAdminPage';
import NewsletterPage from './pages/admin/NewsletterPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import ProductInquiriesPage from './pages/admin/ProductInquiriesPage';
import ServicesAdminPage from './pages/admin/ServicesAdminPage';
import BlogPage from './pages/admin/BlogPage';
import UsersPage from './pages/admin/UsersPage';
import SEOPage from './pages/admin/SEOPage';
import SettingsPage from './pages/admin/SettingsPage';
import ActivityPage from './pages/admin/ActivityPage';
import MediaPage from './pages/admin/MediaPage';
import ContactsPage from './pages/admin/ContactsPage';
import ChallengesAdminPage from './pages/admin/ChallengesAdminPage';
import LeaderboardAdminPage from './pages/admin/LeaderboardAdminPage';
import CertificatesAdminPage from './pages/admin/CertificatesAdminPage';
import UserScoresAdminPage from './pages/admin/UserScoresAdminPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

/** Wraps a page in AdminGuard + AdminLayout */
function AdminPage({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}

export const routes: RouteConfig[] = [
  // ── Public ──────────────────────────────────────────────────────────────────
  { name: 'Home', path: '/', element: <HomePage />, public: true },
  { name: 'About', path: '/about', element: <AboutPage />, public: true },
  { name: 'Portfolio', path: '/portfolio', element: <PortfolioPage />, public: true },
  { name: 'Services', path: '/services', element: <ServicesPage />, public: true },
  { name: 'Service Detail', path: '/services/:slug', element: <ServiceDetailPage />, public: true },
  { name: 'Careers', path: '/careers', element: <CareersPage />, public: true },
  { name: 'End-to-End Services', path: '/services/end-to-end', element: <EndToEndServicesPage />, public: true },
  { name: 'Login', path: '/login', element: <LoginPage />, public: true },
  { name: 'Technologies', path: '/careers/technologies', element: <TechnologiesPage />, public: true },
  { name: 'Job Positions', path: '/careers/jobs', element: <JobPositionsPage />, public: true },
  { name: 'Internships', path: '/careers/internships', element: <InternshipsPage />, public: true },
  // ── Challenge Hub ─────────────────────────────────────────────────────────────
  { name: 'Programming Quiz', path: '/challenges/programming-quiz', element: <ProgrammingQuizPage />, public: true },
  { name: 'Aptitude Quiz', path: '/challenges/aptitude-quiz', element: <AptitudeQuizPage />, public: true },
  { name: 'Debug Challenge', path: '/challenges/debug-challenge', element: <DebugChallengePage />, public: true },
  { name: 'Tech Matching', path: '/challenges/tech-matching', element: <TechMatchingPage />, public: true },
  { name: 'Interview Rapid Fire', path: '/challenges/interview-rapid-fire', element: <InterviewRapidFirePage />, public: true },
  { name: 'System Design', path: '/challenges/system-design', element: <SystemDesignPage />, public: true },
  { name: 'Leaderboard', path: '/leaderboard', element: <LeaderboardPage />, public: true },
  { name: 'My Profile', path: '/profile', element: <UserProfilePage />, public: true },
  { name: 'Privacy Policy', path: '/privacy-policy', element: <PrivacyPolicyPage />, public: true },
  { name: 'Terms of Service', path: '/terms-of-service', element: <TermsOfServicePage />, public: true },
  { name: 'Cookie Policy', path: '/cookie-policy', element: <CookiePolicyPage />, public: true },
  { name: 'Admin Login', path: '/admin/login', element: <AdminLogin />, public: true },

  // ── Admin ────────────────────────────────────────────────────────────────────
  { name: 'Admin Dashboard', path: '/admin', element: <AdminPage><AdminDashboard /></AdminPage> },
  { name: 'Leads', path: '/admin/leads', element: <AdminPage><LeadsPage /></AdminPage> },
  { name: 'Contacts', path: '/admin/contacts', element: <AdminPage><ContactsPage /></AdminPage> },
  { name: 'Clients', path: '/admin/clients', element: <AdminPage><ClientsPage /></AdminPage> },
  { name: 'Projects', path: '/admin/projects', element: <AdminPage><ProjectsPage /></AdminPage> },
  { name: 'Project Requests', path: '/admin/project-requests', element: <AdminPage><ProjectRequestsPage /></AdminPage> },
  { name: 'AI Chat Logs', path: '/admin/ai-chats', element: <AdminPage><AIChatsPage /></AdminPage> },
  { name: 'Products', path: '/admin/products', element: <AdminPage><ProductsAdminPage /></AdminPage> },
  { name: 'Services', path: '/admin/services', element: <AdminPage><ServicesAdminPage /></AdminPage> },
  { name: 'Blog', path: '/admin/blog', element: <AdminPage><BlogPage /></AdminPage> },
  { name: 'Testimonials', path: '/admin/testimonials', element: <AdminPage><TestimonialsAdminPage /></AdminPage> },
  { name: 'Media', path: '/admin/media', element: <AdminPage><MediaPage /></AdminPage> },
  { name: 'Careers', path: '/admin/careers', element: <AdminPage><CareersAdminPage /></AdminPage> },
  { name: 'Applications', path: '/admin/applications', element: <AdminPage><ApplicationsPage /></AdminPage> },
  { name: 'Internship Applications', path: '/admin/internship-applications', element: <AdminPage><InternshipApplicationsPage /></AdminPage> },
  { name: 'Consultations', path: '/admin/consultations', element: <AdminPage><ConsultationRequestsPage /></AdminPage> },
  { name: 'Newsletter', path: '/admin/newsletter', element: <AdminPage><NewsletterPage /></AdminPage> },
  { name: 'Users', path: '/admin/users', element: <AdminPage><UsersPage /></AdminPage> },
  { name: 'SEO', path: '/admin/seo', element: <AdminPage><SEOPage /></AdminPage> },
  { name: 'Settings', path: '/admin/settings', element: <AdminPage><SettingsPage /></AdminPage> },
  { name: 'Activity', path: '/admin/activity', element: <AdminPage><ActivityPage /></AdminPage> },
  // ── Challenge & Gamification Admin ───────────────────────────────────────────
  { name: 'Quiz Questions', path: '/admin/challenges', element: <AdminPage><ChallengesAdminPage /></AdminPage> },
  { name: 'Leaderboard Mgmt', path: '/admin/leaderboard-mgmt', element: <AdminPage><LeaderboardAdminPage /></AdminPage> },
  { name: 'Certificates', path: '/admin/certificates', element: <AdminPage><CertificatesAdminPage /></AdminPage> },
  { name: 'User Scores', path: '/admin/user-scores', element: <AdminPage><UserScoresAdminPage /></AdminPage> },
];

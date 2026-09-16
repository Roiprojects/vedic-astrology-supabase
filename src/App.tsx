import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageTransition } from "@/components/layout/PageTransition";
import { ServiceAiChat } from "@/components/ai/ServiceAiChat";
import AdminLayout from "@/admin/AdminLayout";
import { isNativePlatform } from "@/lib/platform";
import { AppUserProvider } from "@/hooks/useAppUser";
import { ConsultationProvider } from "@/components/booking/ConsultationContext";
import { AppShell } from "@/app/AppShell";

const HomePage = lazy(() => import("@/pages/HomePage"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const AstrologyConsultations = lazy(() => import("@/pages/AstrologyConsultations"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const HomamsPage = lazy(() => import("@/pages/HomamsPage"));
const HomamDetail = lazy(() => import("@/pages/HomamDetail"));
const BirthChartPdf = lazy(() => import("@/pages/BirthChartPdf"));
const ChatWithGuruji = lazy(() => import("@/pages/ChatWithGuruji"));
const PalmReading = lazy(() => import("@/pages/PalmReading"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const Disclaimer = lazy(() => import("@/pages/Legal/Disclaimer"));
const TermsAndConditions = lazy(() => import("@/pages/Legal/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("@/pages/Legal/PrivacyPolicy"));
const RefundCancellation = lazy(() => import("@/pages/Legal/RefundCancellation"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const AdminLogin = lazy(() => import("@/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/admin/AdminDashboard"));
const AdminServices = lazy(() => import("@/admin/AdminServices"));
const AdminServiceNew = lazy(() => import("@/admin/AdminServiceNew"));
const AdminServiceEdit = lazy(() => import("@/admin/AdminServiceEdit"));
const AdminHomams = lazy(() => import("@/admin/AdminHomams"));
const AdminHomamNew = lazy(() => import("@/admin/AdminHomamNew"));
const AdminHomamEdit = lazy(() => import("@/admin/AdminHomamEdit"));
const AdminPages = lazy(() => import("@/admin/AdminPages"));
const AdminTestimonials = lazy(() => import("@/admin/AdminTestimonials"));
const AdminEnquiries = lazy(() => import("@/admin/AdminEnquiries"));
const AdminAstrologers = lazy(() => import("@/admin/AdminAstrologers"));
const AdminAstrologerNew = lazy(() => import("@/admin/AdminAstrologerNew"));
const AdminAstrologerEdit = lazy(() => import("@/admin/AdminAstrologerEdit"));

const HomeScreen = lazy(() => import("@/app/screens/HomeScreen").then((m) => ({ default: m.HomeScreen })));
const ConsultScreen = lazy(() => import("@/app/screens/ConsultScreen").then((m) => ({ default: m.ConsultScreen })));
const AstrologerProfileScreen = lazy(() =>
  import("@/app/screens/AstrologerProfileScreen").then((m) => ({ default: m.AstrologerProfileScreen }))
);
const ConsultationSessionScreen = lazy(() =>
  import("@/app/screens/ConsultationSessionScreen").then((m) => ({ default: m.ConsultationSessionScreen }))
);
const DiscoverScreen = lazy(() => import("@/app/screens/DiscoverScreen").then((m) => ({ default: m.DiscoverScreen })));
const DiscoverModuleScreen = lazy(() =>
  import("@/app/screens/DiscoverModuleScreen").then((m) => ({ default: m.DiscoverModuleScreen }))
);
const CosmosScreen = lazy(() => import("@/app/screens/CosmosScreen").then((m) => ({ default: m.CosmosScreen })));
const ProfileScreen = lazy(() => import("@/app/screens/ProfileScreen").then((m) => ({ default: m.ProfileScreen })));
const ProfileSubScreen = lazy(() => import("@/app/screens/ProfileSubScreen").then((m) => ({ default: m.ProfileSubScreen })));
const GurujiScreen = lazy(() => import("@/app/screens/GurujiScreen").then((m) => ({ default: m.GurujiScreen })));
const KundliScreen = lazy(() => import("@/app/screens/KundliScreen").then((m) => ({ default: m.KundliScreen })));
const PalmReaderScreen = lazy(() => import("@/app/screens/PalmReaderScreen").then((m) => ({ default: m.PalmReaderScreen })));
const OnboardingScreen = lazy(() => import("@/app/screens/OnboardingScreen").then((m) => ({ default: m.OnboardingScreen })));
const AuthScreen = lazy(() => import("@/app/screens/AuthScreen").then((m) => ({ default: m.AuthScreen })));
const HomamsScreen = lazy(() => import("@/app/screens/HomamsScreen").then((m) => ({ default: m.HomamsScreen })));
const SubscriptionScreen = lazy(() => import("@/app/screens/SubscriptionScreen").then((m) => ({ default: m.SubscriptionScreen })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

function NativeHomeRedirect() {
  if (isNativePlatform()) return <Navigate to="/app" replace />;
  return <HomePage />;
}

function PublicLayout() {
  const native = isNativePlatform();
  if (native) {
    return (
      <div className="app-root min-h-dvh bg-[#080A18] text-[#FFF9EE]">
        <header
          className="sticky top-0 z-20 border-b border-[#D6AE57]/15 bg-[#080A18]/90 px-4 py-3"
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <a href="/app" className="text-xs uppercase tracking-[0.2em] text-[#D6AE57]">
            ← App home
          </a>
        </header>
        <main className="bg-[#FFF9EE] text-[#161616]">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 lg:pt-24">
        <PageTransition>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      <Footer />
      <ServiceAiChat />
      <FloatingWhatsApp />
    </>
  );
}

function RouteFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D6AE57] border-t-transparent" />
    </div>
  );
}

export function App() {
  return (
    <ConsultationProvider>
    <AppUserProvider>
      <Helmet>
        <html lang="en" />
        <meta name="theme-color" content={isNativePlatform() ? "#080A18" : "#faf4e8"} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <ScrollToTop />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminLayoutRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/services/new" element={<AdminServiceNew />} />
            <Route path="/admin/services/:slug" element={<AdminServiceEdit />} />
            <Route path="/admin/homams" element={<AdminHomams />} />
            <Route path="/admin/homams/new" element={<AdminHomamNew />} />
            <Route path="/admin/homams/:slug" element={<AdminHomamEdit />} />
            <Route path="/admin/pages/:page" element={<AdminPages />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/enquiries" element={<AdminEnquiries />} />
            <Route path="/admin/astrologers" element={<AdminAstrologers />} />
            <Route path="/admin/astrologers/new" element={<AdminAstrologerNew />} />
            <Route path="/admin/astrologers/:slug" element={<AdminAstrologerEdit />} />
            <Route path="/admin" element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="/app" element={<AppShell />}>
            <Route index element={<HomeScreen />} />
            <Route path="consult" element={<ConsultScreen />} />
            <Route path="consult/:id" element={<AstrologerProfileScreen />} />
            <Route path="session/:id" element={<ConsultationSessionScreen />} />
            <Route path="discover" element={<DiscoverScreen />} />
            <Route path="discover/:slug" element={<DiscoverModuleScreen />} />
            <Route path="cosmos" element={<CosmosScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="profile/:section" element={<ProfileSubScreen />} />
            <Route path="guruji" element={<GurujiScreen />} />
            <Route path="kundli" element={<KundliScreen />} />
            <Route path="palm" element={<PalmReaderScreen />} />
            <Route path="onboarding" element={<OnboardingScreen />} />
            <Route path="auth" element={<AuthScreen />} />
            <Route path="homams" element={<HomamsScreen />} />
            <Route path="subscription" element={<SubscriptionScreen />} />
          </Route>

          <Route element={<PublicLayout />}>
            <Route index element={<NativeHomeRedirect />} />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/astrology-consultations" element={<AstrologyConsultations />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="homams" element={<HomamsPage />} />
            <Route path="homams/:slug" element={<HomamDetail />} />
            <Route path="birth-chart-pdf" element={<BirthChartPdf />} />
            <Route path="chat-with-guruji" element={<ChatWithGuruji />} />
            <Route path="palm-reading" element={<PalmReading />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="disclaimer" element={<Disclaimer />} />
            <Route path="terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="refund-cancellation" element={<RefundCancellation />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </AppUserProvider>
    </ConsultationProvider>
  );
}

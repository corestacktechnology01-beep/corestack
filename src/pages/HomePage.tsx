import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ProductsSection from '@/components/sections/ProductsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';
import CareerChallengeHub from '@/components/sections/CareerChallengeHub';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection />
        <ProductsSection />
        <TestimonialsSection />
        <CareerChallengeHub />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

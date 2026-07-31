import LandingNav    from '../components/landing/LandingNav';
import HeroSection   from '../components/landing/HeroSection';
import HowItWorks    from '../components/landing/HowItWorks';
import FeaturesSection from '../components/landing/FeaturesSection';
import StatsSection  from '../components/landing/StatsSection';
import CTASection    from '../components/landing/CTASection';

export const metadata = {
  title:       'SkillBridge — Trade Skills. Learn Anything. Grow Together.',
  description:
    'A free peer-to-peer skill exchange platform. Teach what you know, learn what you need. AI-powered matching, verified skills, real-time chat, and a fair credit economy.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </div>
  );
}

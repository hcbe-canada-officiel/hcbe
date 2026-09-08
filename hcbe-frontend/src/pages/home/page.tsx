import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import { PartnersMarquee } from '../../components/feature/PartnersMarquee';
import ZonesSection from './components/ZonesSection';
import MissionVisionSection from './components/MissionVisionSection';
import UpcomingEventsSection from './components/UpcomingEventsSection';
import RecentAnnouncementsSection from './components/RecentAnnouncementsSection';
import DocumentsSection from './components/DocumentsSection';
import CTASection from './components/CTASection';
import { Reveal } from '../../components/ui';
import CommunitySpotlightSection from './components/CommunitySpotlightSection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-ink">
      <Navbar />
      <main>
        <HeroSection />
        <MissionVisionSection />
        <Reveal>
          <CommunitySpotlightSection />
        </Reveal>
        <Reveal>
          <UpcomingEventsSection />
        </Reveal>
        <Reveal>
          <RecentAnnouncementsSection />
        </Reveal>
        <Reveal>
          <ZonesSection />
        </Reveal>
        <Reveal>
          <PartnersMarquee />
        </Reveal>
        <Reveal>
          <DocumentsSection />
        </Reveal>
        <Reveal>
          <CTASection />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

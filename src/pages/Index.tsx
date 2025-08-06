import { useEffect } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { DualJourneySection } from '@/components/DualJourneySection';
import { AskMeAboutSection } from '@/components/AskMeAboutSection';
import { PhotographyGallery } from '@/components/PhotographyGallery';
import { BeyondTechSection } from '@/components/BeyondTechSection';
import { ContactSection } from '@/components/ContactSection';

const Index = () => {
  useEffect(() => {
    // Update document title for SEO
    document.title = "Ujwal Ramachandran - Data Scientist & Cybersecurity Expert";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Ujwal Ramachandran - Data Scientist and Cybersecurity Enthusiast pursuing Masters in Cybersecurity at NTU Singapore. Specialized in AI innovation, threat detection, and security automation.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation would go here if needed */}
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* About Me Section */}
      <AboutSection />
      
      {/* Dual Journey Section */}
      <DualJourneySection />
      
      {/* Ask Me About Section */}
      <AskMeAboutSection />
      
      {/* Photography Gallery */}
      <PhotographyGallery />
      
      {/* Beyond Tech Section */}
      <BeyondTechSection />
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Footer */}
      <footer className="py-8 bg-card/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2024 Ujwal Ramachandran. Built with passion for technology and security.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Made with React, TypeScript, and a cyberpunk aesthetic 🚀
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

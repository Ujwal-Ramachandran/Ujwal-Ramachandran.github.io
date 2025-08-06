import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import ujwalHeadshot1 from '@/assets/ujwal-headshot-1.jpeg';
import ujwalHeadshot2 from '@/assets/ujwal-headshot-2.jpeg';
import ujwalHeadshot3 from '@/assets/ujwal-headshot-3.jpeg';

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Image transition interval
    const interval = setInterval(() => {
      setCurrentImage(prev => prev === 0 ? 1 : 0);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('my-journey');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden matrix-bg">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-lg animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-32 w-24 h-24 border border-primary/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-primary/10 rounded-lg animate-float" style={{ animationDelay: '4s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Column - Text Content */}
          <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="glitch-text cyber-text-glow" data-text="Hi there, I'm Ujwal! 👋">
                  Hi there, I'm Ujwal! 👋
                </span>
              </h1>
              
              <div className="space-y-2 mt-8">
                <br/><br /><br /><br /><br /><br />
                <h2 className="text-2xl lg:text-3xl font-medium text-primary cyber-text-glow">
                  Data Scientist | Cybersecurity Enthusiast | AI Innovation
                </h2>
                <p className="text-xl text-muted-foreground">
                  Currently pursuing Masters in Cybersecurity at NTU Singapore
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={scrollToAbout}
                className="cyber-button group text-lg px-8 py-4"
              >
                Explore My Journey
                <ChevronDown className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
              </Button>
            </div>
          </div>

          {/* Right Column - Professional Image */}
          <div className={`flex justify-center transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur-3xl scale-110 animate-glow" />
              
              {/* Main Image with Transition */}
              <div className="relative cyber-border-glow rounded-2xl p-1">
                <div className="relative w-80 h-80 lg:w-96 lg:h-96 overflow-hidden rounded-xl">
                  <img 
                    src={ujwalHeadshot1}
                    alt="Ujwal Ramachandran - Data Scientist & Cybersecurity Expert"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentImage === 1 ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <img 
                    src={ujwalHeadshot2}
                    alt="Ujwal Ramachandran - Data Scientist & Cybersecurity Expert"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentImage === 2 ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <img 
                    src={ujwalHeadshot3}
                    alt="Ujwal Ramachandran - Data Scientist & Cybersecurity Expert"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentImage === 0 ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              </div>
              
              {/* Floating Tech Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 border-2 border-primary rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center animate-float">
                <span className="text-primary font-mono text-xs">AI</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-12 border-2 border-primary rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-primary font-mono text-xs">SEC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-primary animate-glow" />
      </div>
    </section>
  );
};
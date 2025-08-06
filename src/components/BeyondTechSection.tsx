import { useEffect, useRef, useState } from 'react';
import { Camera, Leaf, Gamepad2, GraduationCap } from 'lucide-react';

interface InterestCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

const InterestCard = ({ icon, title, description, gradient, delay = 0 }: InterestCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="tech-card group relative overflow-hidden">
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Floating Icon Background */}
        <div className={`absolute top-4 right-4 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full transition-all duration-500 ${isHovered ? 'scale-150 rotate-12' : 'scale-100'}`} />
        
        <div className="relative z-10 space-y-4">
          {/* Icon */}
          <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center transform transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            {icon}
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Animated Underline */}
          <div className={`h-0.5 bg-gradient-to-r ${gradient} transition-all duration-300 ${isHovered ? 'w-16' : 'w-0'}`} />
        </div>

        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${isHovered ? 'shadow-[0_0_30px_rgba(88,166,255,0.2)]' : ''}`} />
      </div>
    </div>
  );
};

export const BeyondTechSection = () => {
  const interests = [
    {
      icon: <Camera className="h-8 w-8 text-white" />,
      title: "Photography Enthusiast",
      description: "Wildlife and nature photography. I enjoy clicking pictures for fun.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Leaf className="h-8 w-8 text-white" />,
      title: "Environmentalist",
      description: "Active volunteer for sustainability initiatives.",
      gradient: "from-green-500 to-lime-600"
    },
    {
      icon: <Gamepad2 className="h-8 w-8 text-white" />,
      title: "Games",
      description: "I love games, whether its outdoor sports or online video games.",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-white" />,
      title: "Mentor",
      description: "Helped underprivileged children through educational programs.",
      gradient: "from-blue-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-primary/10 rounded-full animate-float opacity-50" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-accent/5 rounded-lg animate-float opacity-30" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-accent/20 rounded-lg animate-float opacity-40" style={{ animationDelay: '1.5s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 cyber-text-glow">
              Beyond Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Exploring passions that fuel creativity, drive innovation, and shape a well-rounded perspective on life and technology
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-6" />
          </div>

          {/* Interests Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {interests.map((interest, index) => (
              <InterestCard 
                key={index}
                {...interest}
                delay={index * 200}
              />
            ))}
          </div>

          {/* Philosophy Section */}
          <div className="mt-16 text-center">
            <div className="cyber-card max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-primary">
                Life Philosophy
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  I believe that the most innovative solutions emerge from the intersection of diverse experiences. 
                  Whether I'm analyzing a complex dataset, capturing wildlife in their natural habitat, or mentoring 
                  young minds, each experience informs and enriches my approach to technology.
                </p>
                <p>
                  In a world increasingly driven by artificial intelligence and automation, maintaining connections 
                  to nature, creativity, and human relationships keeps me grounded and ensures that the technology 
                  I build serves humanity's best interests.
                </p>
              </div>
              
              {/* Quote */}
              <div className="mt-8 pt-6 border-t border-border">
                <blockquote className="text-lg italic text-primary">
                  "Technology is best when it brings people together, protects our world, and amplifies human potential."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
import { useState } from 'react';
import { Camera, Monitor, Brain, Telescope } from 'lucide-react';

interface TopicCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

const TopicCard = ({ icon, title, description, color, delay = 0 }: TopicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`tech-card group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center transform transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            {icon}
          </div>
          
          <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
            {title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          {/* Hover Effect Line */}
          <div className={`w-0 h-0.5 bg-gradient-to-r ${color} mx-auto transition-all duration-300 ${isHovered ? 'w-12' : ''}`} />
        </div>

        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${isHovered ? 'shadow-[0_0_30px_rgba(88,166,255,0.3)]' : ''}`} />
      </div>
    </div>
  );
};

export const AskMeAboutSection = () => {
  const topics = [
    {
      icon: <Telescope className="h-8 w-8 text-white" />,
      title: "Astronomy",
      description: "Space exploration, celestial phenomena, and the wonders of the universe that inspire my curiosity and scientific thinking.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <Camera className="h-8 w-8 text-white" />,
      title: "Photography", 
      description: "Wildlife and nature photography, capturing the beauty of the natural world through my lens and creative perspective.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Monitor className="h-8 w-8 text-white" />,
      title: "Cybersecurity",
      description: "Threat analysis, defense strategies, ethical hacking, and building resilient security architectures for the digital age.",
      color: "from-red-500 to-orange-600"
    },
    {
      icon: <Brain className="h-8 w-8 text-white" />,
      title: "AI/ML",
      description: "Intelligent systems, automation, LLMs, and the transformative potential of artificial intelligence in solving complex problems.",
      color: "from-blue-500 to-cyan-600"
    }
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-primary/20 rounded-full animate-float opacity-30" />
      <div className="absolute bottom-32 right-16 w-32 h-32 border border-accent/20 rounded-lg animate-float opacity-20" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 cyber-text-glow">
              Ask Me About
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Beyond the code and algorithms, I'm passionate about exploring diverse fields that fuel my creativity and innovation
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-6" />
          </div>

          {/* Topic Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topics.map((topic, index) => (
              <TopicCard 
                key={index}
                {...topic}
                delay={index * 150}
              />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="cyber-card max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Let's Connect & Explore Ideas
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're interested in discussing cutting-edge AI applications, cybersecurity challenges, 
                or sharing stories about stargazing and wildlife photography, I'd love to hear from you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
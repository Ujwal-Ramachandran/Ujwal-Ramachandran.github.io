import { useEffect, useRef, useState } from 'react';

interface SkillBarProps {
  name: string;
  percentage: number;
  delay?: number;
}

const SkillBar = ({ name, percentage, delay = 0 }: SkillBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => {
            setAnimatedPercentage(percentage);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [percentage, delay]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-primary font-mono">{animatedPercentage}%</span>
      </div>
      <div className="skill-bar">
        <div 
          className="skill-progress"
          style={{ 
            width: isVisible ? `${animatedPercentage}%` : '0%',
            transition: 'width 1s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export const AboutSection = () => {
  const skillCategories = [
    {
      title: "Languages",
      skills: ["Python", "Shell", "SQL", "C", "C++", "HTML", "CSS"]
    },
    {
      title: "Databases",
      skills: ["MongoDB", "Oracle DB", "MySQL"]
    },
    {
      title: "AI and ML",
      skills: ["LLM", "Agentic AI", "Prompt Engineering", "MLOPs"]
    },
    {
      title: "Cloud DevOps",
      skills: ["Azure", "Docker", "Jenkins", "Kubernetes"]
    },
    {
      title: "Cybersecurity",
      skills: ["Vulnerability Assessment"]
    }
  ];

  return (
    <section id="my-journey" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 cyber-text-glow">
              My Journey
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Bio */}
            <div className="lg:col-span-2">
              <div className="cyber-card">
                <h3 className="text-2xl font-semibold mb-4 text-primary">
                  About Me
                </h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    With over <span className="text-primary font-semibold">3+ years of experience</span> at 
                    <span className="text-primary font-semibold"> Optum-UHG</span>, I've developed a deep passion for 
                    leveraging cutting-edge AI solutions to solve complex business challenges.
                  </p>
                  <p>
                    Currently pursuing my <span className="text-primary font-semibold">Masters in Cybersecurity at NTU Singapore</span>, 
                    I'm expanding my expertise in threat detection, security automation, and ethical hacking while 
                    maintaining my focus on AI innovation.
                  </p>
                  <p>
                    My unique blend of <span className="text-primary font-semibold">Data Science expertise</span> and 
                    <span className="text-primary font-semibold"> Cybersecurity knowledge</span> positions me at the 
                    forefront of next-generation security solutions powered by artificial intelligence.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Technical Arsenal */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-primary mb-6">
                Technical Arsenal
              </h3>
              
              <div className="space-y-6">
                {skillCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="tech-card">
                    <h4 className="text-lg font-semibold mb-4 text-accent">
                      {category.title}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className={`px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary hover:bg-primary/20 transition-all duration-300 animate-fade-in hover:scale-105`}
                          style={{ animationDelay: `${categoryIndex * 200 + skillIndex * 100}ms` }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
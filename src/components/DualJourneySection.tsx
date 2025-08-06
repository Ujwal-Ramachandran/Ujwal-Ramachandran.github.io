import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Cpu, Shield } from 'lucide-react';

interface TimelineItemProps {
  title: string;
  description: string;
  impact: string;
  icon: React.ReactNode;
  delay?: number;
}

const TimelineItem = ({ title, description, impact, icon, delay = 0 }: TimelineItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
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
      className={`tech-card transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
          <p className="text-muted-foreground mb-3 leading-relaxed">{description}</p>
          <div className="text-sm text-accent italic">{impact}</div>
        </div>
      </div>
    </div>
  );
};

export const DualJourneySection = () => {
  const aiJourney = [
    {
      title: "Contract Redlining Automation",
      description: "Led PoCs to automate contract redlining, track revisions, and generate insights using LLMs and rules-based logic.",
      impact: "Reduced legal review time and improved change accuracy",
      icon: <Cpu className="h-6 w-6 text-primary" />
    },
    {
      title: "Confidence Scoring for KPIs",
      description: "Created dynamic scoring metrics that adapt KPI weights based on historical and live data trends.",
      impact: "Enabled smarter performance decisions and accountability",
      icon: <Cpu className="h-6 w-6 text-primary" />
    },
    {
      title: "Real-Time Bot Automation",
      description: "Built live data pipelines that enabled bots to auto-generate orders and claims from upstream sources.",
      impact: "Accelerated operations and lowered manual workload",
      icon: <Cpu className="h-6 w-6 text-primary" />
    },
    {
      title: "Shell Scripting for Data Extraction",
      description: "Automated Oracle DB extractions using custom shell scripts integrated into batch pipelines.",
      impact: "Boosted ETL efficiency for downstream systems",
      icon: <Cpu className="h-6 w-6 text-primary" />
    },
    {
      title: "Competitive Web Scraping",
      description: "Designed tools to scrape multi-site product data, bypass CAPTCHAs, and deliver reports on pricing trends.",
      impact: "Contributed to 10% sales growth through pricing strategy",
      icon: <Cpu className="h-6 w-6 text-primary" />
    },
    {
      title: "Data Visualizations & Dashboards",
      description: "Developed user-facing graphs and tools to visualize commodity trends by date and region.",
      impact: "Empowered data-driven decisions in agri-commerce",
      icon: <Cpu className="h-6 w-6 text-primary" />
    }
  ];

  const cyberJourney = [
    {
      title: "Passwordless Authentication",
      description: "Implemented secure passwordless authentication systems using Keycloak and modern security protocols for enterprise applications.",
      impact: "Enabled zero-trust architecture across internal apps",
      icon: <Shield className="h-6 w-6 text-primary" />
    },
    {
      title: "Application Security",
      description: "Led efforts to identify and resolve security flaws through dependency checks and exploit scanning.",
      impact: "Reduced codebase vulnerabilities by 90%",
      icon: <Shield className="h-6 w-6 text-primary" />
    },
    {
      title: "Secure Coding Practices",
      description: "Audited codebases and CI/CD pipelines for secrets, weak libraries, and insecure configurations.",
      impact: "Improved code quality and release readiness",
      icon: <Shield className="h-6 w-6 text-primary" />
    },
    {
      title: "OAuth 2.0 Integration",
      description: "Secured enterprise web apps using Spring Boot and OAuth 2.0 for seamless authorization.",
      impact: "Ensured role-based access and compliance",
      icon: <Shield className="h-6 w-6 text-primary" />
    },
    {
      title: "QA & Process Optimization",
      description: "Authored test protocols and automation-ready guidance docs to streamline dev-to-test handovers.",
      impact: "Reduced QA cycle time and improved test coverage",
      icon: <Shield className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section className="py-20 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 matrix-bg opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 cyber-text-glow">
              Dual Expertise Journey
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-8" />
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-xl text-primary font-medium">
                Bridging AI innovation and cybersecurity excellence through practical solutions and measurable impact.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I bring a unique blend of experience at the intersection of AI/Data Science and Cybersecurity, 
                solving real-world problems with intelligent automation, secure architectures, and performance-driven insights.
              </p>
            </div>
          </div>

          {/* Dual Timeline */}
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* AI & Data Science Journey */}
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <Cpu className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold text-primary">AI & Data Science</h3>
              </div>
              
              <div className="space-y-6">
                {aiJourney.map((item, index) => (
                  <TimelineItem
                    key={index}
                    {...item}
                    delay={index * 100}
                  />
                ))}
              </div>
            </div>

            {/* Cybersecurity Journey */}
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold text-primary">Cybersecurity</h3>
              </div>
              
              <div className="space-y-6">
                {cyberJourney.map((item, index) => (
                  <TimelineItem
                    key={index}
                    {...item}
                    delay={index * 100 + 50}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Synergy Section */}
          <div className="mt-16 text-center">
            <div className="cyber-card max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Cpu className="h-6 w-6 text-primary" />
                <ChevronRight className="h-4 w-4 text-accent" />
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                The Power of Convergence
              </h3>
              <p className="text-muted-foreground">
                Where artificial intelligence meets cybersecurity, innovation thrives. 
                My dual expertise enables me to build secure, intelligent systems that protect and perform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
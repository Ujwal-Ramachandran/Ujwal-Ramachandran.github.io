import { Mail, Linkedin, Github, Phone } from 'lucide-react';

export const ContactSection = () => {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      label: "Email",
      value: "ujwal.ramachandran@example.com"
    },
    {
      icon: <Linkedin className="h-6 w-6 text-primary" />,
      label: "LinkedIn",
      value: "linkedin.com/in/ujwal-ramachandran"
    },
    {
      icon: <Github className="h-6 w-6 text-primary" />,
      label: "GitHub",
      value: "github.com/ujwal-ramachandran"
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      label: "Phone",
      value: "+65-XXXX-XXXX"
    }
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 cyber-text-glow">
              Let's Connect
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="max-w-3xl mx-auto">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-6 text-primary">
                  Let's Connect
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Whether you're interested in AI innovation, cybersecurity solutions, or just want to discuss the latest tech trends, I'd love to hear from you.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-center space-x-4 tech-card">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                      {method.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{method.label}</h4>
                      <p className="text-muted-foreground">{method.value}</p>
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
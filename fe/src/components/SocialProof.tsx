import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export const SocialProof = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Lead Researcher",
      company: "PharmaTech Labs",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      quote: "Pharmtom™ Labs cut our screening time from 6 months to 6 minutes. The accuracy is phenomenal.",
      rating: 5
    },
    {
      name: "Prof. Michael Rodriguez",
      role: "Department Head",
      company: "Stanford University",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "This platform revolutionized our drug discovery research. We've published 3 papers thanks to their predictions.",
      rating: 5
    },
    {
      name: "Dr. Emily Johnson",
      role: "R&D Director",
      company: "BioTech Innovations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "The ROI is incredible. We saved $500K in the first quarter alone using Pharmtom™ Labs.",
      rating: 5
    }
  ];

  const companies = [
    { name: "Stanford", logo: "🏛️" },
    { name: "MIT", logo: "🧬" },
    { name: "Pfizer", logo: "💊" },
    { name: "Roche", logo: "🔬" },
    { name: "Novartis", logo: "⚗️" },
    { name: "Harvard", logo: "🎓" }
  ];

  const stats = [
    { number: "2,000+", label: "Active Researchers" },
    { number: "10M+", label: "Molecules Analyzed" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "50+", label: "Published Papers" }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Trusted by Leading Research Institutions
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Join thousands of researchers and pharmaceutical companies using Pharmtom™ Labs 
            to accelerate their drug discovery process.
          </p>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-molecular-blue to-molecular-teal bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Logos */}
        <div className="mb-16">
          <p className="text-center text-muted-foreground mb-8">
            Used by researchers at top institutions worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center gap-2 text-2xl font-bold text-muted-foreground">
                <span className="text-3xl">{company.logo}</span>
                <span>{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 h-full">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center gap-3 mt-auto">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-molecular-blue/5 to-molecular-teal/5 p-8 rounded-2xl border border-molecular-blue/10">
            <h3 className="text-2xl font-bold mb-4">
              Ready to transform your research?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join the researchers who've already accelerated their drug discovery timeline 
              and increased their success rate with AI-powered molecular predictions.
            </p>
            <div className="text-sm text-muted-foreground">
              ⭐ 4.9/5 average rating • 📈 98% customer satisfaction • 🚀 24/7 support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
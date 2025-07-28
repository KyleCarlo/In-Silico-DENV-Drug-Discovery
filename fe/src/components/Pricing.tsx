import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, Zap } from "lucide-react";

export const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individual researchers and small labs",
      features: [
        "100 molecular predictions/month",
        "Basic protein-ligand docking",
        "Standard accuracy (90%+)",
        "Email support",
        "API access",
        "Export results to CSV"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Professional",
      price: "$129",
      period: "/month",
      description: "Most popular choice for research teams",
      features: [
        "1,000 molecular predictions/month",
        "Advanced protein-ligand docking",
        "Premium accuracy (95%+)",
        "Priority support (24/7)",
        "Full API access",
        "Export to all formats",
        "Batch processing",
        "Custom molecular libraries",
        "Team collaboration tools",
        "Advanced analytics dashboard"
      ],
      buttonText: "Get Started",
      buttonVariant: "hero" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "$499",
      period: "/month",
      description: "For pharmaceutical companies and large institutions",
      features: [
        "Unlimited molecular predictions",
        "Enterprise-grade docking suite",
        "Maximum accuracy (98%+)",
        "Dedicated support manager",
        "Private cloud deployment",
        "Custom integrations",
        "Advanced batch processing",
        "Unlimited molecular libraries",
        "Enterprise collaboration",
        "Custom AI model training",
        "SLA guarantee",
        "White-label solutions"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "molecular" as const,
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that fits your research needs. All plans include our core AI prediction engine.
            Upgrade or downgrade anytime.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-molecular-green/10 text-molecular-green px-4 py-2 rounded-full text-sm font-semibold">
            <Zap className="w-4 h-4" />
            30-day free trial on all plans
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative p-8 h-full ${
                plan.popular 
                  ? 'border-molecular-blue shadow-xl scale-105 bg-gradient-to-br from-card to-molecular-blue/5' 
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-molecular-blue to-molecular-teal text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <Button 
                  variant={plan.buttonVariant} 
                  size="lg" 
                  className={`w-full ${plan.popular ? 'shadow-lg' : ''}`}
                >
                  {plan.buttonText}
                </Button>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-molecular-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-molecular-blue/10 to-molecular-teal/10 p-8 rounded-2xl max-w-4xl mx-auto border border-molecular-blue/20">
            <h3 className="text-2xl font-bold mb-4">
              Need a custom solution?
            </h3>
            <p className="text-muted-foreground mb-6">
              We work with pharmaceutical companies and research institutions to create 
              tailored molecular prediction solutions. Volume discounts available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg">
                Schedule a Demo
              </Button>
              <Button variant="molecular" size="lg">
                Contact Enterprise Sales
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>✅ 30-day money-back guarantee • 🔒 Enterprise-grade security • 📊 99.9% uptime SLA</p>
        </div>
      </div>
    </section>
  );
};
import { Atom, Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "API Documentation", href: "#api" },
        { name: "Integrations", href: "#integrations" },
        { name: "Security", href: "#security" }
      ]
    },
    {
      title: "Compare",
      links: [
        { name: "vs SwissDock", href: "#vs-swissdock" },
        { name: "vs AutoDock Vina", href: "#vs-autodock" },
        { name: "vs Schrödinger", href: "#vs-schrodinger" },
        { name: "vs OpenEye", href: "#vs-openeye" },
        { name: "Traditional Methods", href: "#traditional" }
      ]
    },
    {
      title: "Free Tools",
      links: [
        { name: "SMILES Validator", href: "#smiles-validator" },
        { name: "Molecular Weight Calculator", href: "#mol-weight" },
        { name: "PDB Viewer", href: "#pdb-viewer" },
        { name: "Drug-likeness Checker", href: "#drug-likeness" },
        { name: "Binding Site Predictor", href: "#binding-site" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs" },
        { name: "Research Papers", href: "#papers" },
        { name: "Case Studies", href: "#case-studies" },
        { name: "Webinars", href: "#webinars" },
        { name: "Community Forum", href: "#forum" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#careers" },
        { name: "Blog", href: "#blog" },
        { name: "Press Kit", href: "#press" },
        { name: "Contact", href: "#contact" }
      ]
    }
  ];

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-molecular-blue to-molecular-teal rounded-lg flex items-center justify-center">
                <Atom className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Pharmtom™ Labs</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              AI-powered molecular interaction prediction platform trusted by researchers worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-molecular-blue transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-molecular-blue transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-molecular-blue transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-molecular-blue transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-molecular-blue transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <a href="#privacy" className="hover:text-molecular-blue transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-molecular-blue transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="hover:text-molecular-blue transition-colors">
                Cookie Policy
              </a>
              <a href="#gdpr" className="hover:text-molecular-blue transition-colors">
                GDPR Compliance
              </a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 Pharmtom™ Labs. All rights reserved.
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              🔒 <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              🛡️ <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ⚡ <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              🏆 <span>ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
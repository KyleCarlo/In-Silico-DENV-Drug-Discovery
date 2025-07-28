import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export const FAQ = () => {
  const faqs = [
    {
      question: "How accurate are Pharmtom™ Labs's predictions?",
      answer: "Our AI models achieve 95%+ accuracy on protein-ligand binding predictions, validated against experimental data from over 10 million molecular interactions. We continuously improve our models with new data and user feedback."
    },
    {
      question: "What file formats do you support?",
      answer: "We support all major molecular file formats including PDB, SDF, MOL2, SMILES, and FASTA. You can upload protein structures, small molecules, or just provide SMILES strings for ligands. Our platform automatically handles format conversion."
    },
    {
      question: "How fast are the predictions?",
      answer: "Most predictions complete in 2-5 minutes, regardless of molecular complexity. Our distributed computing infrastructure ensures consistent performance even during peak usage. Batch jobs for hundreds of molecules typically finish within an hour."
    },
    {
      question: "Can I integrate Pharmtom™ Labs with my existing workflow?",
      answer: "Absolutely! We provide comprehensive REST APIs, Python SDK, and integrations with popular tools like ChemDraw, PyMOL, and Schrödinger. Our team can help set up custom integrations for enterprise clients."
    },
    {
      question: "Do you offer academic discounts?",
      answer: "Yes! We offer 50% discounts for academic institutions and non-profit research organizations. PhD students and postdocs get free access to our Starter plan. Contact our academic team for special pricing."
    },
    {
      question: "What happens to my molecular data?",
      answer: "Your data is encrypted in transit and at rest. We never share your molecular structures or results with third parties. Enterprise customers can opt for private cloud deployment or on-premises installation for maximum security."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Got questions? We've got answers. Can't find what you're looking for? 
              Our molecular experts are here to help 24/7.
            </p>
          </div>

          <Card className="p-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold hover:text-molecular-blue transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-molecular-teal/10 to-molecular-purple/10 p-8 rounded-2xl border border-molecular-teal/20">
              <h3 className="text-2xl font-bold mb-4">
                Still have questions? 🤔
              </h3>
              <p className="text-muted-foreground mb-6">
                Our molecular modeling experts are standing by to help you understand 
                how Pharmtom™ Labs can accelerate your research.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-molecular-teal text-white rounded-lg font-semibold hover:bg-molecular-purple transition-colors">
                  💬 Live Chat Support
                </button>
                <button className="px-6 py-3 border border-molecular-teal text-molecular-teal rounded-lg font-semibold hover:bg-molecular-teal/5 transition-colors">
                  📧 Email Our Experts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
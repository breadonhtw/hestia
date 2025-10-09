import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, Instagram } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-4 lg:px-8 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            We'd love to hear from you. Whether you have questions, feedback, or
            just want to say hello, reach out anytime.
          </p>

          <div className="bg-card rounded-xl shadow-soft p-12 space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                Email Us
              </h2>
              <a
                href="mailto:hello@hestia.com"
                className="text-lg text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="h-5 w-5" />
                hello@hestia.com
              </a>
            </div>

            <div className="border-t border-border pt-8">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                Follow Us
              </h2>
              <a
                href="https://instagram.com/hestia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
              >
                <Instagram className="h-5 w-5" />
                @hestia
              </a>
            </div>
          </div>

          <p className="text-muted-foreground mt-12">
            We typically respond within 1-2 business days
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;

import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Footer } from "@/components/Footer";
import { Contact2 } from "@/components/ui/contact-2";
import { toast } from "sonner";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // Simulate form submission - replace with actual email service integration later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Form submitted:", data);
      
      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 1-2 business days."
      });
      
      // Reset form would happen here
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again or email us directly."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
        <Contact2
          title="Get in Touch"
          description="We'd love to hear from you. Whether you have questions about joining Hestia, feedback about the platform, or just want to say hello—reach out anytime."
          email="brandonhtw@gmail.com"
          web={{ label: "@brandonhtw", url: "https://instagram.com/brandonhtw" }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
        <Footer />
      </div>
    </PageLayout>
  );
};

export default Contact;

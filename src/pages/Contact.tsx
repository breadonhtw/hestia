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
      // Create mailto link with pre-filled email content
      const emailBody = `Hello Hestia Team,

I hope this message finds you well. I am reaching out through your website contact form.

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

Best regards,
${data.firstName} ${data.lastName}`;

      const mailtoLink = `mailto:admin@hestia.sg?subject=${encodeURIComponent(
        data.subject
      )}&body=${encodeURIComponent(emailBody)}`;

      // Open the user's default email client
      window.location.href = mailtoLink;

      toast.success("Opening email client...", {
        description:
          "Please send the pre-filled email to complete your message.",
      });
    } catch (error) {
      toast.error("Failed to open email client", {
        description: "Please email us directly at admin@hestia.sg",
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
          email="admin@hestia.sg"
          web={{ label: "@sg.hestia", url: "https://instagram.com/sg.hestia" }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
        <Footer />
      </div>
    </PageLayout>
  );
};

export default Contact;

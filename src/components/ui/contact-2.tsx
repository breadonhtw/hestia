import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Contact2Props {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  web?: { label: string; url: string };
  onSubmit?: (data: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }) => void;
  isSubmitting?: boolean;
}

export const Contact2 = ({
  title = "Contact Us",
  description = "We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!",
  phone,
  email = "email@example.com",
  web,
  onSubmit,
  isSubmitting = false,
}: Contact2Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (onSubmit) {
      onSubmit({
        firstName: formData.get("firstname") as string,
        lastName: formData.get("lastname") as string,
        email: formData.get("email") as string,
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
      });
    }
  };

  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-4 lg:mb-6">
                {title}
              </h1>
              <p className="text-lg text-muted-foreground">{description}</p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-6 text-center font-serif text-2xl font-semibold lg:text-left text-foreground">
                Contact Details
              </h3>
              <ul className="ml-4 list-disc space-y-2 text-foreground">
                {phone && (
                  <li>
                    <span className="font-bold">Phone: </span>
                    <a href={`tel:${phone}`} className="text-primary hover:text-primary/80 transition-colors">
                      {phone}
                    </a>
                  </li>
                )}
                <li>
                  <span className="font-bold">Email: </span>
                  <a href={`mailto:${email}`} className="text-primary hover:text-primary/80 transition-colors">
                    {email}
                  </a>
                </li>
                {web && (
                  <li>
                    <span className="font-bold">Web: </span>
                    <a href={web.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                      {web.label}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="mx-auto flex max-w-screen-md flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-xl border-2 border-border bg-card p-8 lg:p-10 shadow-soft">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="firstname" className="text-foreground">First Name</Label>
                  <Input 
                    type="text" 
                    id="firstname" 
                    name="firstname"
                    placeholder="First Name" 
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="lastname" className="text-foreground">Last Name</Label>
                  <Input 
                    type="text" 
                    id="lastname" 
                    name="lastname"
                    placeholder="Last Name" 
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="your@email.com" 
                  required
                  maxLength={255}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Input 
                  type="text" 
                  id="subject" 
                  name="subject"
                  placeholder="What is this about?" 
                  required
                  maxLength={200}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="message" className="text-foreground">Message</Label>
                <Textarea 
                  placeholder="Tell us more..." 
                  id="message" 
                  name="message"
                  className="min-h-[150px]"
                  required
                  maxLength={1000}
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import type { Publication } from "@/hooks/usePublications";

interface MagazineModalProps {
  publication: Publication;
  children: React.ReactNode;
}

export const MagazineModal = ({ publication, children }: MagazineModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    // On mobile, redirect directly to external URL
    if (isMobile && publication.external_url) {
      window.open(publication.external_url, "_blank", "noopener,noreferrer");
      return;
    }

    // On desktop, open modal
    setIsOpen(true);
  };

  const handleOpenInNewTab = () => {
    if (publication.external_url) {
      window.open(publication.external_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* Trigger */}
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>

      {/* Desktop Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="font-serif text-2xl mb-2">
                  {publication.title}
                </DialogTitle>
                {publication.theme && (
                  <p className="text-sm text-secondary font-medium">
                    {publication.theme}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {publication.external_url ? (
              <iframe
                src={publication.external_url}
                className="w-full h-full border-0"
                title={publication.title}
                allow="fullscreen"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Magazine content not available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

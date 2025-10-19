import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-sm group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-soft group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:font-sans group-[.toaster]:ring-1 group-[.toaster]:ring-black/5",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:leading-tight group-[.toast]:mb-1",
          description: "group-[.toast]:text-sm group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:shadow-sm hover:group-[.toast]:bg-primary/90 group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium hover:group-[.toast]:bg-muted/80 group-[.toast]:transition-colors",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:border-none group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground group-[.toast]:transition-colors",
          success:
            "group-[.toaster]:bg-emerald-50/95 dark:group-[.toaster]:bg-emerald-950/30 group-[.toaster]:border-emerald-200/50 dark:group-[.toaster]:border-emerald-800/50 group-[.toaster]:text-emerald-900 dark:group-[.toaster]:text-emerald-100",
          error:
            "group-[.toaster]:bg-red-50/95 dark:group-[.toaster]:bg-red-950/30 group-[.toaster]:border-red-200/50 dark:group-[.toaster]:border-red-800/50 group-[.toaster]:text-red-900 dark:group-[.toaster]:text-red-100",
          warning:
            "group-[.toaster]:bg-amber-50/95 dark:group-[.toaster]:bg-amber-950/30 group-[.toaster]:border-amber-200/50 dark:group-[.toaster]:border-amber-800/50 group-[.toaster]:text-amber-900 dark:group-[.toaster]:text-amber-100",
          info:
            "group-[.toaster]:bg-blue-50/95 dark:group-[.toaster]:bg-blue-950/30 group-[.toaster]:border-blue-200/50 dark:group-[.toaster]:border-blue-800/50 group-[.toaster]:text-blue-900 dark:group-[.toaster]:text-blue-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

import { VitaCareLogo } from "@/components/VitaCareLogo";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <VitaCareLogo size="md" />
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vita Care+. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

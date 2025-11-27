import vitacareLogo from "@/assets/vitacare-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={vitacareLogo} alt="Vita Care+ Logo" className="h-8 w-8" />
            <span className="text-lg font-bold text-foreground">Vita Care+</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vita Care+. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

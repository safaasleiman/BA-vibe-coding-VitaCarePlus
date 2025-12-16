import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import vitacareLogo from "@/assets/vitacare-logo-new.png";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={vitacareLogo} alt="VitaCare+" className="h-8 w-auto" />
          
          <div className="flex items-center gap-6">
            <Link 
              to="/datenschutz" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <Shield className="w-3 h-3" />
              Datenschutz
            </Link>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Vita Care+. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

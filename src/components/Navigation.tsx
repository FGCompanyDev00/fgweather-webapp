import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Home, 
  MapPin, 
  Wind, 
  Settings as SettingsIcon, 
  Menu, 
  X,
  Newspaper
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems: NavItem[] = [
    { path: "/", label: "Weather", icon: <Home className="h-5 w-5" /> },
    { path: "/map", label: "Map", icon: <MapPin className="h-5 w-5" /> },
    { path: "/air-quality", label: "Air Quality", icon: <Wind className="h-5 w-5" /> },
    { path: "/news", label: "News", icon: <Newspaper className="h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon className="h-5 w-5" /> }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-full p-1.5 mb-6 shadow-lg border border-white/20 dark:border-slate-700/20">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative px-4 py-2 mx-1 rounded-full flex items-center space-x-1.5 transition-colors",
              isActive(item.path) ? "text-white" : "text-foreground hover:text-primary"
            )}
          >
            {isActive(item.path) && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute inset-0 bg-primary rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center space-x-1.5">
              {item.icon}
              <span className={cn(
                "text-sm font-medium relative z-10",
                isActive(item.path) ? "text-white" : "text-foreground"
              )}>
                {item.label}
              </span>
            </span>
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <button 
            className="p-2 rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md shadow-lg border border-white/20 dark:border-slate-700/20"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/90 dark:to-slate-800/80 backdrop-blur-lg">
          <div className="flex flex-col space-y-6 h-full py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold gradient-text">FGWeather</h2>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                    isActive(item.path) 
                      ? "bg-primary text-white shadow-md" 
                      : "hover:bg-white/20 dark:hover:bg-slate-700/30"
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

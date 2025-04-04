import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { Button } from "@/components/ui/button";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
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
  
  // Update active tab index when location changes
  useEffect(() => {
    const index = navItems.findIndex(item => isActive(item.path));
    if (index !== -1) {
      setActiveTabIndex(index);
    }
  }, [location.pathname]);

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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-t border-white/20 dark:border-slate-700/30 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 relative",
                isActive(item.path) ? "text-primary" : "text-foreground/60"
              )}
              onClick={() => setActiveTabIndex(index)}
            >
              {isActive(item.path) && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-x-2 top-0 h-1 bg-primary rounded-b-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                animate={isActive(item.path) ? { y: -2 } : { y: 0 }}
                className={cn(
                  "flex items-center justify-center rounded-full p-1.5",
                  isActive(item.path) ? "bg-primary/20" : ""
                )}
              >
                {React.cloneElement(item.icon as React.ReactElement, { 
                  className: cn(
                    "h-5 w-5 transition-colors",
                    isActive(item.path) ? "stroke-primary" : "stroke-foreground/60"
                  ) 
                })}
              </motion.div>
              <span className={cn(
                "text-xs mt-1 font-medium transition-colors",
                isActive(item.path) ? "text-primary" : "text-foreground/60"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

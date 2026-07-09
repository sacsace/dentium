"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, ChevronDown, User, LogOut } from "lucide-react";
import { SiteSearch } from "@/components/search/SiteSearch";
import { useCartStore } from "@/store/cart";
import { clearCartOnLogout } from "@/components/cart/CartAuthSync";
import { cn } from "@/lib/utils";
import { megaMenuItems } from "@/lib/navigation";
import { useAuth, notifyAuthChange } from "@/hooks/useAuth";
import { DentiumLogo } from "@/components/brand/DentiumLogo";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isHome = pathname === "/";

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<number | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((s) => s.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setActiveColumn(null);
    setIsOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, isOpen]);

  const onHeaderLeave = () => {
    setMenuOpen(false);
    setActiveColumn(null);
  };

  // Transparent + white nav only on home hero; all inner pages always use solid light header
  const isHeroMode = isHome && !scrolled && !menuOpen && !isOpen;

  const headerBg = menuOpen || isOpen || scrolled || !isHome
    ? "bg-white/95 backdrop-blur-xl shadow-soft border-b border-brand-muted/50"
    : "bg-white/70 backdrop-blur-md border-b border-white/50";

  const navText = isHeroMode
    ? "text-brand-navy/90 hover:text-brand-deep"
    : "text-brand-dark hover:text-brand-deep";

  const navActive = "text-brand-navy font-semibold";

  const iconBtn = isHeroMode
    ? "text-brand-navy hover:bg-brand-light/80"
    : "text-brand-dark hover:bg-brand-gray";

  const displayName = user?.name?.split(" ")[0] || user?.name || "Account";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearCartOnLogout();
    notifyAuthChange();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-light/60 backdrop-blur-sm"
            onClick={onHeaderLeave}
          />
        )}
      </AnimatePresence>

      <header
        className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-500", headerBg)}
        onMouseLeave={onHeaderLeave}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            <DentiumLogo href="/" size="md" variant="wordmark" priority className="relative z-10 lg:hidden" />
            <DentiumLogo href="/" size="md" variant="primary" priority className="relative z-10 hidden lg:flex" />

            <nav
              className="hidden xl:flex items-center justify-center flex-1 gap-0 mx-8"
              onMouseEnter={() => setMenuOpen(true)}
            >
              {megaMenuItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => {
                    setMenuOpen(true);
                    setActiveColumn(index);
                  }}
                  className={cn(
                    "px-5 py-6 text-[15px] font-medium transition-colors duration-200 relative",
                    menuOpen && activeColumn === index ? navActive : navText
                  )}
                >
                  {item.label}
                  {menuOpen && activeColumn === index && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-3 left-5 right-5 h-0.5 bg-brand-accent"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 shrink-0">
              <div className="hidden lg:block w-52 xl:w-64 mr-2">
                <SiteSearch />
              </div>
              <Link href="/shop/cart" className={cn("relative p-2.5 rounded-sm transition-colors", iconBtn)}>
                <ShoppingCart className="w-5 h-5" />
                {mounted && cartItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-accent text-brand-navy text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
              {user ? (
                <>
                  <Link
                    href={user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/admin" : "/account"}
                    className={cn(
                      "hidden sm:inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 text-sm font-medium rounded-full border border-brand-accent/30 bg-brand-accent/10 transition-colors hover:bg-brand-accent/20",
                      navText
                    )}
                    title={user.name}
                  >
                    <span className="w-7 h-7 rounded-full bg-brand-accent text-brand-navy text-xs font-bold flex items-center justify-center shrink-0 font-display">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn("hidden sm:inline-flex p-2.5 rounded-lg transition-colors", iconBtn)}
                    aria-label="Log out"
                    title="Log out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={cn("hidden sm:inline-flex px-4 py-2 text-sm font-medium transition-colors", navText)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden md:inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-brand-accent text-brand-navy hover:bg-brand-accent-dark transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn("p-2.5 rounded-sm xl:hidden", iconBtn)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden xl:block overflow-hidden border-t border-brand-muted/60"
              onMouseEnter={() => setMenuOpen(true)}
            >
              <div className="glass-menu">
                <div className="container mx-auto px-4 lg:px-8 py-10">
                  <div className="grid grid-cols-5 gap-0">
                    {megaMenuItems.map((item, colIndex) => (
                      <div
                        key={item.label}
                        onMouseEnter={() => setActiveColumn(colIndex)}
                        className={cn(
                          "px-6 py-5 transition-all duration-300 min-h-[220px] relative",
                          activeColumn === colIndex
                            ? "bg-brand-accent/10 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand-accent"
                            : "hover:bg-brand-light/60"
                        )}
                      >
                        <Link
                          href={item.href}
                          className="block text-brand-navy font-semibold text-sm mb-5 hover:text-brand-deep transition-colors"
                        >
                          {item.label}
                        </Link>
                        {item.sections.map((section, si) => (
                          <div key={si} className={si > 0 ? "mt-5" : ""}>
                            {section.title && (
                              <p className="text-brand-silver text-[11px] uppercase tracking-wider mb-2 font-medium">
                                {section.title}
                              </p>
                            )}
                            <ul className="space-y-2">
                              {section.links.map((link) => (
                                <li key={link.label}>
                                  <Link
                                    href={link.href}
                                    className="text-brand-dark/80 text-sm hover:text-brand-deep transition-colors duration-200 block py-0.5"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-white border-t border-brand-muted max-h-[80vh] overflow-y-auto shadow-soft"
            >
              <nav className="container mx-auto px-4 py-4">
                <div className="mb-4 lg:hidden">
                  <SiteSearch />
                </div>
                {megaMenuItems.map((item) => (
                  <div key={item.label} className="border-b border-brand-muted last:border-0">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between px-2 py-4 text-brand-navy font-medium"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn("w-4 h-4 transition-transform", mobileExpanded === item.label && "rotate-180")}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileExpanded === item.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pb-3 pl-4"
                        >
                          {item.sections.map((section, si) => (
                            <div key={si} className="mb-3">
                              {section.title && (
                                <p className="text-brand-accent-dark text-xs uppercase tracking-wider mb-2">
                                  {section.title}
                                </p>
                              )}
                              {section.links.map((link) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  onClick={() => setIsOpen(false)}
                                  className="block py-2 text-brand-silver text-sm hover:text-brand-deep"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <div className="flex flex-col gap-3 pt-4 px-2">
                  {user ? (
                    <>
                      <Link
                        href={user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/admin" : "/account"}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3 px-3 text-brand-navy border border-brand-muted rounded-lg text-sm font-medium"
                      >
                        <User className="w-4 h-4" />
                        {user.name}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-3 bg-brand-accent/15 text-brand-navy border border-brand-accent/40 rounded-lg text-sm font-medium"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 text-center py-3 bg-brand-accent text-brand-navy rounded-sm text-sm font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 text-center py-3 bg-brand-accent text-brand-navy rounded-sm text-sm font-medium"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

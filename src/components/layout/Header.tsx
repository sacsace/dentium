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
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
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
    ? "bg-white border-b border-brand-muted shadow-soft"
    : "bg-white/90 border-b border-transparent";

  const navText = isHeroMode
    ? "text-brand-navy/90 hover:text-brand-deep"
    : "text-brand-dark hover:text-brand-deep";

  const navActive = "text-brand-navy font-semibold";

  const iconBtn = isHeroMode
    ? "text-brand-navy hover:bg-brand-light/80"
    : "text-brand-dark hover:bg-brand-gray";

  const displayName = user?.name?.split(" ")[0] || user?.name || t("Account");

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
            className="fixed inset-0 z-40 bg-brand-navy/25"
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
              className="hidden lg:flex min-w-0 flex-1 items-center justify-center gap-0 mx-1 xl:mx-2 2xl:mx-4"
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
                    "relative shrink-0 whitespace-nowrap px-2 xl:px-2.5 2xl:px-4 py-6 text-[12.5px] xl:text-[13px] 2xl:text-[14px] font-medium transition-colors duration-200",
                    menuOpen && activeColumn === index ? navActive : navText
                  )}
                >
                  {t(item.label)}
                  {menuOpen && activeColumn === index && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-3 left-2 right-2 xl:left-2.5 xl:right-2.5 2xl:left-4 2xl:right-4 h-0.5 bg-brand-accent"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-0.5 shrink-0">
              <div className="hidden md:block w-32 lg:w-36 xl:w-44 2xl:w-56 mr-1.5">
                <SiteSearch />
              </div>
              <LanguageToggle compact className="mr-0.5" />
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
                      "hidden sm:inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 text-sm font-medium rounded-sm border border-brand-muted bg-brand-gray transition-colors hover:bg-brand-light",
                      navText
                    )}
                    title={user.name}
                  >
                    <span className="w-7 h-7 rounded-sm bg-brand-accent text-brand-navy text-xs font-bold flex items-center justify-center shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[72px] 2xl:max-w-[120px] truncate">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn("hidden sm:inline-flex p-2.5 rounded-lg transition-colors", iconBtn)}
                    aria-label={t("Log out")}
                    title={t("Log out")}
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
                    {t("Login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden md:inline-flex px-4 py-2 text-sm font-semibold rounded-sm bg-brand-accent text-brand-navy hover:bg-brand-accent-dark transition-colors"
                  >
                    {t("Sign Up")}
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn("p-2.5 rounded-sm lg:hidden", iconBtn)}
                aria-label={t(isOpen ? "Close menu" : "Open menu")}
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
              className="hidden lg:block overflow-hidden border-t border-brand-muted/60"
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
                          {t(item.label)}
                        </Link>
                        {item.sections.map((section, si) => (
                          <div key={si} className={si > 0 ? "mt-5" : ""}>
                            {section.title && (
                              <p className="text-brand-silver text-[11px] uppercase tracking-wider mb-2 font-medium">
                                {t(section.title)}
                              </p>
                            )}
                            <ul className="space-y-2">
                              {section.links.map((link) => (
                                <li key={link.label}>
                                  <Link
                                    href={link.href}
                                    className="text-brand-dark/80 text-sm hover:text-brand-deep transition-colors duration-200 block py-0.5"
                                  >
                                    {t(link.label)}
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
              className="lg:hidden bg-white border-t border-brand-muted max-h-[80vh] overflow-y-auto shadow-soft"
            >
              <nav className="container mx-auto px-4 py-4">
                <div className="mb-4 md:hidden">
                  <SiteSearch />
                </div>
                {megaMenuItems.map((item) => (
                  <div key={item.label} className="border-b border-brand-muted last:border-0">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between px-2 py-4 text-brand-navy font-medium"
                    >
                      {t(item.label)}
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
                                  {t(section.title)}
                                </p>
                              )}
                              {section.links.map((link) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  onClick={() => setIsOpen(false)}
                                  className="block py-2 text-brand-silver text-sm hover:text-brand-deep"
                                >
                                    {t(link.label)}
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
                        {t("Log out")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 text-center py-3 bg-brand-accent text-brand-navy rounded-sm text-sm font-medium"
                      >
                        {t("Login")}
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 text-center py-3 bg-brand-accent text-brand-navy rounded-sm text-sm font-medium"
                      >
                        {t("Sign Up")}
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

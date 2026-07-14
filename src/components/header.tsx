"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, Users, X } from "lucide-react";
import { useState } from "react";
import { settings } from "@/lib/data";
import logo from "@/logo.png";

const categoryNavItems = [
  ["Top Deals", "/category/top-deals"],
  ["Walmart Deals", "/category/walmart-deals"],
  ["Home & Kitchen", "/category/home-kitchen"],
  ["Electronics", "/category/electronics"],
  ["Furniture", "/category/furniture"],
  ["Fashion", "/category/fashion"],
  ["Clearance Deals", "/category/clearance-deals"]
];

const navItems = [
  ["Home", "/"],
  ["Blog", "/blog"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand" aria-label="Trusted Deals & Clearance home" onClick={closeMenu}>
          <Image className="site-logo" src={logo} alt="Trusted Deals & Clearance" priority />
        </Link>
        <button className="mobile-menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((current) => !current)}>
          {open ? <X size={22} /> : <Menu size={22} />}
          <span>Menu</span>
        </button>
        <nav className={`nav-links ${open ? "open" : ""}`} id="primary-navigation" aria-label="Primary navigation">
          <Link href="/" onClick={closeMenu}>Home</Link>
          <div className="nav-dropdown">
            <button type="button" aria-label="Open categories menu">
              Categories <ChevronDown size={15} />
            </button>
            <div className="nav-dropdown-menu">
              {categoryNavItems.map(([label, href]) => (
                <Link href={href} key={label} onClick={closeMenu}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {navItems.map(([label, href]) => (
            label === "Home" ? null : (
            <Link href={href} key={label} onClick={closeMenu}>
              {label}
            </Link>
            )
          ))}
        </nav>
        <div className="nav-actions">
          <form className="search-form" action="/search">
            <Search size={18} />
            <input name="q" placeholder="Search deals" aria-label="Search deals" />
          </form>
          <Link className="nav-community-button" href={settings.facebookUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
            <Users size={17} />
            <span>Join Our Facebook Community</span>
          </Link>
          <span className="locale-badge" aria-label="United States English">
            <span className="us-flag" aria-hidden="true">
              <span />
            </span>
            <strong>EN</strong>
          </span>
        </div>
      </div>
    </header>
  );
}

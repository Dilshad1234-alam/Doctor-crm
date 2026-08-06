"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/frontend/components/ui/Container";
import Button from "@/frontend/components/ui/Button";

export default function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl leading-none shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
              +
            </div>
            <Link href="/" className="text-xl font-extrabold text-gray-900 tracking-tight">
              Doctor CRM
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all duration-300">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all duration-300">How It Works</Link>
            <Link href="#for-clinics" className="text-sm font-medium text-gray-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all duration-300">For Clinics</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all duration-300">Pricing</Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-teal-600 hover:-translate-y-0.5 transition-all duration-300">Contact</Link>
          </nav>

          {/* Right: Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
              Login
            </Link>
            <Button href="/register" variant="primary">
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <span className="text-2xl leading-none">&times;</span>
              ) : (
                <span className="text-2xl leading-none">&#9776;</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3">
              <Link href="#features" className="text-base font-medium text-gray-700 hover:text-teal-600 px-2" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
              <Link href="#how-it-works" className="text-base font-medium text-gray-700 hover:text-teal-600 px-2" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
              <Link href="#for-clinics" className="text-base font-medium text-gray-700 hover:text-teal-600 px-2" onClick={() => setIsMobileMenuOpen(false)}>For Clinics</Link>
              <Link href="#pricing" className="text-base font-medium text-gray-700 hover:text-teal-600 px-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              <Link href="#" className="text-base font-medium text-gray-700 hover:text-teal-600 px-2" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            </nav>
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
              <Link href="/login" className="text-base font-medium text-gray-700 hover:text-teal-600 px-2" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Button href="/register" variant="primary" className="w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                Start Free Trial
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

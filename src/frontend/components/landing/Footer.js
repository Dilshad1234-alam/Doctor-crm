import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: "Home", href: "/" },
      { name: "Doctors", href: "/doctors" },
      { name: "Patients", href: "/patients" },
      { name: "Clinics", href: "/clinics" },
    ],
    Platform: [
      { name: "Appointments", href: "/dashboard/appointments" },
      { name: "Consultations", href: "/dashboard/consultations" },
      { name: "Prescriptions", href: "/dashboard/prescriptions" },
      { name: "Billing", href: "/dashboard/billing" },
    ],
    Company: [
      { name: "About", href: "#" },
      { name: "Contact", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-200 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Activity strokeWidth={2.5} size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-blue-600">Doctor CRM</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The complete clinic management platform designed to save time and improve patient care.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-gray-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Doctor CRM. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600">
              Login
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/register" className="text-sm font-semibold text-gray-600 hover:text-blue-600">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

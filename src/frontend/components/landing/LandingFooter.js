import Link from "next/link";
import Container from "@/frontend/components/ui/Container";
import { footerLinks } from "@/frontend/constants/landingPage";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-md flex items-center justify-center text-white font-bold text-xl leading-none">
                +
              </div>
              Doctor CRM
            </Link>
            <p className="text-gray-400 text-sm">
              Built for modern healthcare teams to manage clinics effortlessly.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Doctor CRM. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2 md:mt-0">
            Built for modern healthcare teams
          </p>
        </div>
      </Container>
    </footer>
  );
}

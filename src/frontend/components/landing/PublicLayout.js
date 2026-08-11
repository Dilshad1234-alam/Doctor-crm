import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

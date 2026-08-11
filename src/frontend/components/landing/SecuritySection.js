import { ShieldCheck, Lock, Database, EyeOff, FileKey } from "lucide-react";

export default function SecuritySection() {
  const securityFeatures = [
    { title: "Role-Based Access", icon: <FileKey size={20} /> },
    { title: "Clinic Data Isolation", icon: <Database size={20} /> },
    { title: "Protected Authentication", icon: <Lock size={20} /> },
    { title: "Audit Logs", icon: <EyeOff size={20} /> },
    { title: "Secure Medical Records", icon: <ShieldCheck size={20} /> },
  ];

  return (
    <section className="py-24 bg-gray-50 font-sans border-y border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <ShieldCheck size={16} />
              <span>Enterprise Grade</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Secure by Design</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              We take the privacy and security of your clinic data seriously. Our infrastructure ensures that patient records and clinic financials are locked down.
            </p>
            
            <div className="space-y-4">
              {securityFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm max-w-md">
                  <div className="text-teal-600 bg-teal-50 p-2 rounded-lg">
                    {feature.icon}
                  </div>
                  <span className="font-bold text-gray-800">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-5/12 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-[3rem] bg-gradient-to-tr from-blue-600 to-teal-400 p-8 shadow-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-[3rem] backdrop-blur-3xl"></div>
              <ShieldCheck size={160} className="text-white relative z-10 drop-shadow-2xl opacity-90" />
              
              {/* Decorative floating bits */}
              <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

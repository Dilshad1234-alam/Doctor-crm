import React from 'react';
import Link from 'next/link';

export default function Logo({ className = "", isDark = false, href = "/" }) {
  const textColor = isDark ? "text-white" : "text-[#0F4C81]";
  
  return (
    <Link href={href} className={`flex items-center gap-2 group ${className}`}>
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#0F4C81] rounded-[0.8rem] shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
        {/* Medical Cross (Horizontal) */}
        <div className="absolute w-5 h-2 bg-white rounded-full opacity-95"></div>
        {/* Medical Cross (Vertical) */}
        <div className="absolute w-2 h-5 bg-white rounded-full opacity-95"></div>
        
        {/* Green Accent Dot / Overlay to give that SaaS feel */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2563EB] rounded-full blur-[2px] opacity-80"></div>
      </div>
      
      {/* Brand Name */}
      <span className={`text-2xl font-black tracking-tight ${textColor}`}>
        Clinora
      </span>
    </Link>
  );
}

"use client";

import { useState } from "react";
import { PhoneCall, Search, FileText, Settings, LayoutDashboard, LogOut, User, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { id: "chat", label: "Chat", icon: <PhoneCall size={18} />, href: "/chat" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 animate-gradient-shift"></div>
      
      {/* Floating Orbs for Ambiance */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-gray-700 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-gray-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Sidebar with relative positioning */}
      <div className="relative z-10">
        <Sidebar tabs={tabs} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Glassmorphic Top Bar */}
        <div className="bg-white/5 backdrop-blur-2xl border-b border-white/10 px-6 py-4 shadow-2xl">
          <div className="flex justify-between items-center">
            {/* User Info Section */}
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                {/* Avatar with Gradient Border */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 p-[2px] shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                </div>
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>
              
              <div className="transition-all duration-300">
                <p className="text-white font-semibold text-base flex items-center gap-2">
                  {user?.firstName} {user?.lastName}
                  {/* <Sparkles size={14} className="text-gray-400" /> */}
                </p>
                <p className="text-gray-400 text-sm font-medium">
                  <span className="text-gray-300">{user?.organization?.name}</span>
                  <span className="mx-2 text-gray-600">•</span>
                  <span className="px-2 py-0.5 bg-white/10 backdrop-blur-xl rounded-full text-xs border border-white/20">
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="cursor-pointer flex items-center space-x-2 px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Main Content with Subtle Gradient Overlay */}
        <div className="flex-1 relative">
          {children}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

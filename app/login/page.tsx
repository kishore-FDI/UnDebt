"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar/Navbar';

// Create a client component that uses useSearchParams
const LoginContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const orbRef = useRef(null);

  useEffect(() => {
    // Floating animation for background orb
    gsap.to(orbRef.current, {
      y: 30,
      x: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    // Initial animations
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 }
    )
    .fromTo(cardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      '-=0.8'
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0118] overflow-hidden">
      <Navbar />
      
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div ref={orbRef} className="absolute top-20 right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-gradient-to-br from-purple-600 to-blue-600 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-40 left-[5%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 blur-[60px] md:blur-[100px]" />
      </div>

      <main className="container mx-auto px-4 pt-32 pb-16 relative">
        <div className="max-w-md mx-auto text-center">
          {/* Title Section */}
          <div ref={titleRef} className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="block transform -rotate-2 mb-2">Welcome to</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                UnDebt !
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Start your journey to financial freedom
            </p>
          </div>

          {/* Login Card */}
          <div 
            ref={cardRef}
            className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10 transform hover:scale-[1.01] transition-all duration-300"
          >
            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="group relative w-full bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl px-6 py-4 flex items-center justify-center gap-4 transition-all duration-300 border border-white/10 hover:border-purple-500/50"
            >
              {/* Google Icon */}
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
              <span className="absolute right-4 transform transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0A0118]/30 backdrop-blur-sm text-gray-400">
                    New to UnDebt?
                  </span>
                </div>
              </div>

              <button 
                onClick={() => signIn('google', { callbackUrl })}
                className="w-full px-6 py-3 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Create an account
              </button>
            </div>
          </div>

          {/* Terms Section */}
          <div className="mt-6 text-gray-400 text-sm px-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 UnDebt. Crafted with care for your financial freedom.</p>
        </div>
      </footer>
    </div>
  );
}

// Main page component
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

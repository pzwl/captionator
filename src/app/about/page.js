"use client";

import Image from "next/image";
import { useState } from "react";

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
              </svg>
              <span>Captionator</span>
            </a>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="/" className="text-white/80 hover:text-blue-400 transition-colors">Home</a>
              <a href="/pricing" className="text-white/80 hover:text-blue-400 transition-colors">Pricing</a>
              <a href="/about" className="text-white hover:text-blue-400 transition-colors">About</a>
              <a href="/contact" className="text-white/80 hover:text-blue-400 transition-colors">Contact</a>
              <a href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">Login</a>
            </nav>
            
            <button className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </header>

        <section className="py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              About Captionator
            </h1>
            <p className="text-xl text-white/80 mb-10">
              The Story Behind the Leading AI Video Captioning Platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-white/80 mb-6">
                At Captionator, we believe everyone deserves access to video content. Our mission is to make every video accessible through high-quality, accurate captions powered by cutting-edge AI technology.
              </p>
              <p className="text-white/80">
                We're passionate about breaking down barriers to video content by providing creators with tools that make captioning effortless, accurate, and affordable.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1 rounded-2xl">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 text-blue-500 mx-auto mb-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <h3 className="text-xl font-bold text-center mb-3">Global Accessibility</h3>
                <p className="text-white/70 text-center">
                  Supporting over 50 languages and dialects to make content accessible worldwide
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 border-t border-white/10">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4 text-center">Our Story</h2>
            <div className="max-w-3xl mx-auto items-center text-center">
              <p className="text-white/70 mb-6 mt-12">
                Let it Rip , ILY 3215pi          
              </p>
             
            </div>
          </div>
          
          
        </section>
        
        <section className="py-16 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-white/70 max-w-2xl mx-auto">The Legend</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center">
            <div className="text-center md:col-start-2 md:col-end-4">
              <div className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 p-1 rounded-full mb-4 mx-auto w-48 h-48">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-full w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold">Prajjwal Sharma</h3>
              <p className="text-blue-400">Founder &amp; CEO</p>
            </div>
          </div>
        </section>
        
       
      </div>
      
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
            </svg>
            <span className="font-semibold">Captionator</span>
          </div>
          
          <div className="text-white/50 text-sm">
            © 2025 Captionator. All rights reserved.
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="text-white/70 hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="text-white/70 hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" className="text-white/70 hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
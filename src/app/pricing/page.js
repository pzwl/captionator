"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("professional");

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly");
  };

  const handleCTAClick = (planId) => {
    if (planId === "business") {
      router.push("/contact");
    } else {
      router.push("/signup");
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for individual content creators",
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: [
        "10 videos per month",
        "Up to 10 minutes per video",
        "5 supported languages",
        "Basic caption styling",
        "SRT & VTT export",
        "24-hour support",
      ],
      cta: "Start Free Trial"
    },
    {
      id: "professional",
      name: "Professional",
      description: "Ideal for professional creators and small teams",
      monthlyPrice: 24.99,
      annualPrice: 249.99,
      features: [
        "30 videos per month",
        "Up to 30 minutes per video",
        "25 supported languages",
        "Advanced caption styling",
        "All export formats",
        "Priority support",
        "Caption translation",
        "Brand customization"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      id: "business",
      name: "Business",
      description: "For businesses with high volume needs",
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      features: [
        "Unlimited videos",
        "Up to 2 hours per video",
        "50+ supported languages",
        "Premium caption styling",
        "All export formats",
        "24/7 priority support",
        "Caption translation",
        "Brand customization",
        "API access",
        "Team collaboration"
      ],
      cta: "Contact Sales"
    }
  ];

  const faqs = [
    {
      question: "Do you offer a free trial?",
      answer: "Yes, we offer a 7-day free trial on our Basic and Professional plans. No credit card required to get started."
    },
    {
      question: "Can I change plans at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new pricing will be prorated for the remainder of your billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and for Business plans, we can also arrange invoicing."
    },
    {
      question: "How accurate are the auto-generated captions?",
      answer: "Our AI technology provides 95-98% accuracy for most clear audio. Factors like background noise, accents, and technical terminology may affect accuracy."
    },
    {
      question: "Can I edit the captions after they're generated?",
      answer: "Absolutely! All plans include access to our caption editor where you can refine the AI-generated captions before finalizing."
    },
    {
      question: "What languages do you support?",
      answer: "The Basic plan supports 5 major languages (English, Spanish, French, German, and Chinese). Professional supports 25 languages, and Business supports 50+ languages worldwide."
    }
  ];

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
              <a href="/pricing" className="text-white hover:text-blue-400 transition-colors">Pricing</a>
              <a href="/about" className="text-white/80 hover:text-blue-400 transition-colors">About</a>
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

        <section className="py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-white/80">
              Choose the plan that's right for you and start creating professional captions today.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/5 rounded-xl p-1 inline-flex">
              <button 
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"}`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button 
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === "annual" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"}`}
                onClick={() => setBillingCycle("annual")}
              >
                <span>Annual</span>
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>
          
          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative rounded-xl overflow-hidden ${plan.popular ? "border-2 border-blue-500" : "border border-white/10"}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8 bg-white/5 hover:bg-white/10 transition-colors h-full flex flex-col">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/70 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">
                        ${billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-white/70 mb-1">
                        {billingCycle === "monthly" ? "/month" : "/year"}
                      </span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-green-400 text-sm mt-1">
                        Save ${(plan.monthlyPrice * 12 - plan.annualPrice).toFixed(2)} annually
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="font-medium mb-4 text-lg">Features include:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 text-blue-500 mt-0.5 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => handleCTAClick(plan.id)}
                      className={`w-full py-3 rounded-lg font-medium transition-all ${
                        plan.id === 'business' 
                          ? 'bg-white/10 hover:bg-white/20 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/20'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Feature comparison */}
          <div className="border border-white/10 rounded-xl overflow-hidden mb-20">
            <div className="bg-white/5 p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold">Compare Plans</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="py-4 px-6 text-left">Feature</th>
                    <th className="py-4 px-6 text-center">Basic</th>
                    <th className="py-4 px-6 text-center">Professional</th>
                    <th className="py-4 px-6 text-center">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5">
                    <td className="py-4 px-6">Monthly video limit</td>
                    <td className="py-4 px-6 text-center">10 videos</td>
                    <td className="py-4 px-6 text-center">30 videos</td>
                    <td className="py-4 px-6 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-t border-white/5 bg-white/5">
                    <td className="py-4 px-6">Video length</td>
                    <td className="py-4 px-6 text-center">Up to 10 min</td>
                    <td className="py-4 px-6 text-center">Up to 30 min</td>
                    <td className="py-4 px-6 text-center">Up to 2 hours</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-4 px-6">Supported languages</td>
                    <td className="py-4 px-6 text-center">5</td>
                    <td className="py-4 px-6 text-center">25</td>
                    <td className="py-4 px-6 text-center">50+</td>
                  </tr>
                  <tr className="border-t border-white/5 bg-white/5">
                    <td className="py-4 px-6">Caption translation</td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500 mx-auto">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-green-500 mx-auto">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-green-500 mx-auto">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-4 px-6">Team collaboration</td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500 mx-auto">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500 mx-auto">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-green-500 mx-auto">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-t border-white/5 bg-white/5">
                    <td className="py-4 px-6">API access</td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500 mx-auto">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500 mx-auto">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-green-500 mx-auto">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* FAQs */}
        <section className="py-16 border-t border-white/10 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">Everything you need to know about Captionator</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="mb-6 border border-white/10 rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                    <h3 className="text-lg font-medium">{faq.question}</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                      className="size-5 group-open:rotate-180 transition-transform duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="p-6 pt-0 text-white/80">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 mb-10">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-10">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your videos?</h2>
              <p className="text-xl text-white/80 mb-8">
                Start your free trial today. No credit card required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-blue-600/20 transition-all duration-200 font-medium">
                  Get Started Free
                </a>
                <a href="/contact" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium">
                  Contact Sales
                </a>
              </div>
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
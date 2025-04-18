"use client"

import { useState } from "react"

export default function SignupPage() {
  const [signupStep, setSignupStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    role: "",
    plan: "professional",
    agreeToTerms: false,
  })
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    const checked = e.target.checked

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.role) {
      newErrors.role = "Please select your role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (signupStep === 1) {
      if (validateStep1()) {
        setSignupStep(2)
      }
    } else {
      setSignupStep(signupStep + 1)
    }
  }

  const prevStep = () => {
    setSignupStep(signupStep - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateStep2()) {
      // Form submission logic would go here
      console.log("Form submitted:", formData)
      setSignupStep(3) // Move to success step
    }
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
                />
              </svg>
              <span>Captionator</span>
            </a>

            <nav className="hidden md:flex items-center gap-8">
              <a href="/" className="text-white/80 hover:text-blue-400 transition-colors">
                Home
              </a>
              <a href="/pricing" className="text-white/80 hover:text-blue-400 transition-colors">
                Pricing
              </a>
              <a href="/about" className="text-white/80 hover:text-blue-400 transition-colors">
                About
              </a>
              <a href="/contact" className="text-white/80 hover:text-blue-400 transition-colors">
                Contact
              </a>
              <a href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                Login
              </a>
            </nav>

            <button className="md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </header>

        <section className="py-10 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Create Your Captionator Account
              </h1>
              <p className="text-lg text-white/80">Get started with your free trial. No credit card required.</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center w-full max-w-md">
                <div className={`flex flex-col items-center ${signupStep >= 1 ? "text-blue-500" : "text-white/40"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      signupStep >= 1 ? "border-blue-500 bg-blue-500/20" : "border-white/40"
                    }`}
                  >
                    {signupStep > 1 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>1</span>
                    )}
                  </div>
                  <span className="text-sm mt-1">Account</span>
                </div>

                <div className={`flex-1 h-0.5 mx-2 ${signupStep >= 2 ? "bg-blue-500" : "bg-white/20"}`}></div>

                <div className={`flex flex-col items-center ${signupStep >= 2 ? "text-blue-500" : "text-white/40"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      signupStep >= 2 ? "border-blue-500 bg-blue-500/20" : "border-white/40"
                    }`}
                  >
                    {signupStep > 2 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <span className="text-sm mt-1">Details</span>
                </div>

                <div className={`flex-1 h-0.5 mx-2 ${signupStep >= 3 ? "bg-blue-500" : "bg-white/20"}`}></div>

                <div className={`flex flex-col items-center ${signupStep >= 3 ? "text-blue-500" : "text-white/40"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      signupStep >= 3 ? "border-blue-500 bg-blue-500/20" : "border-white/40"
                    }`}
                  >
                    <span>3</span>
                  </div>
                  <span className="text-sm mt-1">Complete</span>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-10">
              {signupStep === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    nextStep()
                  }}
                >
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full bg-white/10 border ${errors.fullName ? "border-red-500" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter your full name"
                        required
                      />
                      {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-white/10 border ${errors.email ? "border-red-500" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="your@email.com"
                        required
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full bg-white/10 border ${errors.password ? "border-red-500" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Create a strong password"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          {passwordVisible ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password ? (
                        <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                      ) : (
                        <p className="text-xs text-white/50 mt-1">Must be at least 8 characters</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={confirmPasswordVisible ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full bg-white/10 border ${errors.confirmPassword ? "border-red-500" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Confirm your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          {confirmPasswordVisible ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className={`rounded bg-white/10 ${errors.agreeToTerms ? "border-red-500" : "border-white/20"} text-blue-600 focus:ring-blue-500`}
                        required
                      />
                      <label htmlFor="agreeToTerms" className="ml-2 text-sm text-white/80">
                        I agree to the{" "}
                        <a href="/terms" className="text-blue-400 hover:text-blue-300">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-blue-400 hover:text-blue-300">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {errors.agreeToTerms && <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>}
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-blue-600/20 transition-all duration-200"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}

              {signupStep === 2 && (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                        Company/Organization Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your company name (optional)"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium mb-2">
                        Your Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full bg-white/10 border ${errors.role ? "border-red-500" : "border-white/20"} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="" disabled className="bg-gray-800">
                          Select your role
                        </option>
                        <option value="content-creator" className="bg-gray-800">
                          Content Creator
                        </option>
                        <option value="marketer" className="bg-gray-800">
                          Marketer
                        </option>
                        <option value="educator" className="bg-gray-800">
                          Educator
                        </option>
                        <option value="developer" className="bg-gray-800">
                          Developer
                        </option>
                        <option value="other" className="bg-gray-800">
                          Other
                        </option>
                      </select>
                      {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-4">Select Your Plan</label>
                      <div className="space-y-3">
                        <div
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.plan === "basic"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/20 hover:border-white/40"
                          }`}
                          onClick={() => setFormData({ ...formData, plan: "basic" })}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="basic"
                              name="plan"
                              value="basic"
                              checked={formData.plan === "basic"}
                              onChange={handleInputChange}
                              className="text-blue-600 focus:ring-blue-500 border-white/20"
                            />
                            <label htmlFor="basic" className="ml-3 block">
                              <span className="text-lg font-medium">Basic</span>
                              <span className="block text-sm text-white/70">
                                $9.99/month - Perfect for individual content creators
                              </span>
                            </label>
                          </div>
                        </div>

                        <div
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.plan === "professional"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/20 hover:border-white/40"
                          }`}
                          onClick={() => setFormData({ ...formData, plan: "professional" })}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="professional"
                              name="plan"
                              value="professional"
                              checked={formData.plan === "professional"}
                              onChange={handleInputChange}
                              className="text-blue-600 focus:ring-blue-500 border-white/20"
                            />
                            <label htmlFor="professional" className="ml-3 block">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-medium">Professional</span>
                                <span className="bg-blue-600 text-xs text-white px-2 py-0.5 rounded-full">
                                  Recommended
                                </span>
                              </div>
                              <span className="block text-sm text-white/70">
                                $24.99/month - Ideal for professional creators and small teams
                              </span>
                            </label>
                          </div>
                        </div>

                        <div
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.plan === "business"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/20 hover:border-white/40"
                          }`}
                          onClick={() => setFormData({ ...formData, plan: "business" })}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="business"
                              name="plan"
                              value="business"
                              checked={formData.plan === "business"}
                              onChange={handleInputChange}
                              className="text-blue-600 focus:ring-blue-500 border-white/20"
                            />
                            <label htmlFor="business" className="ml-3 block">
                              <span className="text-lg font-medium">Business</span>
                              <span className="block text-sm text-white/70">
                                $49.99/month - For businesses with high volume needs
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-blue-600/20 transition-all duration-200"
                    >
                      Complete Signup
                    </button>
                  </div>
                </form>
              )}

              {signupStep === 3 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-8 text-green-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold mb-4">Account Created Successfully!</h2>
                  <p className="text-white/80 mb-8">
                    Welcome to Captionator! A confirmation email has been sent to {formData.email}. Please verify your
                    email to access all features.
                  </p>

                  <div className="space-y-4">
                    <a
                      href="/dashboard"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-blue-600/20 transition-all duration-200"
                    >
                      Go to Dashboard
                    </a>
                    <a
                      href="/"
                      className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Return to Home
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Sign in prompt */}
            {signupStep !== 3 && (
              <div className="text-center">
                <p className="text-white/70">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-400 hover:text-blue-300">
                    Sign in
                  </a>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
              />
            </svg>
            <span className="font-semibold">Captionator</span>
          </div>

          <div className="text-white/50 text-sm">© 2025 Captionator. All rights reserved.</div>

          <div className="flex gap-4">
            <a href="#" className="text-white/70 hover:text-blue-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="text-white/70 hover:text-blue-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" className="text-white/70 hover:text-blue-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
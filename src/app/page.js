"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileObject, setFileObject] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setFileObject(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileObject(file);
    }
  };

  const clearFileSelection = () => {
    setFileName("");
    setFileObject(null);
    setUploadStatus("");
  };

  const handleUpload = async () => {
    if (!fileObject) return;
    
    try {
      setUploadStatus("Uploading...");
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append("file", fileObject);

      const response = await axios.post("/api/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(Math.round(progress));
        },
      });

      // Log the response to debug
      console.log("Upload response:", response.data);

      if (response.data?.success && response.data?.newFileName) {
        setUploadStatus("Upload complete! Redirecting...");
        // Force a delay to show the completion status
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Use window.location.href with the correct path
        window.location.href = `/${response.data.newFileName}`;
      } else {
        throw new Error("Upload failed: Invalid response format");
      }

    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus(
        "Upload failed: " + (error.response?.data?.error || error.message)
      );
      setUploadProgress(0);
    }
  };

  const handleGenerateCaptions = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // Simulate caption generation progress
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 1000);

      // Add your caption generation API call here
      // const response = await axios.post("/api/generate-captions", { fileName });
      
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  const renderActionButtons = () => {
    if (!fileName) return null;

    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        {!isUploaded ? (
          <>
            <button
              onClick={handleUpload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-200 font-medium"
            >
              Upload Video
            </button>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleGenerateCaptions}
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-8 py-3 rounded-lg shadow-lg transition-all duration-200 font-medium"
            >
              {isGenerating ? 'Generating Captions...' : 'Generate Captions'}
            </button>
            {isGenerating && (
              <div className="w-full space-y-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-white/70">
                  {generationProgress < 100 
                    ? 'Processing your video...' 
                    : 'Caption generation complete!'}
                </p>
              </div>
            )}
          </>
        )}
        {uploadStatus && (
          <p className="text-sm text-white">{uploadStatus}</p>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <div className="flex items-center justify-between">
            <a href="" className="flex items-center gap-2 text-xl font-bold">
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
                          <Link href="/" className="text-white hover:text-blue-400 transition-colors">
                            Home
                          </Link>
                          <Link href="/pricing" className="text-white/80 hover:text-blue-400 transition-colors">
                            Pricing
                          </Link>
                          <Link href="/about" className="text-white/80 hover:text-blue-400 transition-colors">
                            About
                          </Link>
                          <Link href="/contact" className="text-white/80 hover:text-blue-400 transition-colors">
                            Contact
                          </Link>
                          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                Login
                          </Link>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </header>

        <section className="py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Transform Your Videos with AI-Powered Captions
            </h1>
            <p className="text-xl text-white/80 mb-10">
              Create professional, accurate captions for your videos in seconds. 
              Boost engagement, accessibility, and SEO with Captionator.
            </p>

            <div className="flex flex-col items-center gap-4">
              <div 
                className={`w-full max-w-xl border-2 border-dashed rounded-xl p-10 transition-all ${
                  dragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  {fileName ? (
                    <>
                      <div className="flex items-center gap-3 text-green-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-10"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                        <p className="font-semibold text-lg">{fileName}</p>
                      </div>

                      <div className="flex gap-4 mt-4">
                        <button 
                          onClick={clearFileSelection} 
                          className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg flex items-center gap-2 transition-colors"
                        >
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
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                          Clear
                        </button>
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-blue-600/20 transition-all duration-200 inline-flex gap-2 cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="video/*"
                          />
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
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                            />
                          </svg>
                          Choose another
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-16 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <p className="font-medium text-lg">Drag & drop your video file here</p>
                      <p className="text-white/60">or</p>

                      <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-blue-600/20 transition-all duration-200 inline-flex gap-2 cursor-pointer font-medium">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept="video/*"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        <span>Select video</span>
                      </label>

                      <p className="text-sm text-white/50 mt-2">
                        Supports MP4, MOV, AVI, and WebM up to 500MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {fileName && renderActionButtons()}
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Captionator?</h2>
            <p className="text-white/70 max-w-2xl mx-auto">Our advanced AI technology delivers accurate captions faster than any competitor</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-blue-500 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-white/70">Get your captions in minutes, not hours. Our AI processes videos at 10x industry speed.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-blue-500 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Multiple Languages</h3>
              <p className="text-white/70">Support for over 50 languages with automatic language detection and translation.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-blue-500 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Custom Styling</h3>
              <p className="text-white/70">Customize font, color, position, and animations to match your brand identity.</p>
            </div>
          </div>
        </section>
      </div>
      
      <footer className="border-t border-white/10 py-10">
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

          <div className="text-white/50 text-sm">
            © 2025 Captionator. All rights reserved.
          </div>

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
  );
}
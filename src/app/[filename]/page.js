'use client';

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FilePage() {
  const params = useParams();
  const filename = params?.filename;
  
  const [status, setStatus] = useState('Initializing...');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [transcription, setTranscription] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const videoRef = useRef(null);
  const [captions, setCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [videoError, setVideoError] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState('captions');
  const [editingCaption, setEditingCaption] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState('');
  const [showManualCaptionEntry, setShowManualCaptionEntry] = useState(false);
  const [manualCaptionText, setManualCaptionText] = useState('');
  const [manualCaptionStart, setManualCaptionStart] = useState('');
  const [manualCaptionEnd, setManualCaptionEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState('INITIAL');
  const [notifications, setNotifications] = useState({ success: null, error: null });

  // Helper functions for notifications
  const showSuccessNotification = (message) => {
    setNotifications(prev => ({ ...prev, success: message }));
    setTimeout(() => {
      setNotifications(prev => ({ ...prev, success: null }));
    }, 5000);
  };

  const showErrorNotification = (message) => {
    setNotifications(prev => ({ ...prev, error: message }));
    setTimeout(() => {
      setNotifications(prev => ({ ...prev, error: null }));
    }, 5000);
  };

  // Poll transcription status from the API
  useEffect(() => {
    let isMounted = true;
    if (!filename) return;
    
    const pollTranscription = async () => {
      if (!isMounted) return;
      setIsPolling(true);
      
      try {
        const response = await axios.get(`/api/transcribe?filename=${filename}`);
        const data = response.data;
        if (!isMounted) return;

        setStatus(data.status);
        setMessage(data.message || '');
        if (data.elapsedTime) setElapsedTime(data.elapsedTime);
        
        if (data.transcription) {
          setTranscription(data.transcription);
          setIsComplete(true);
          setIsPolling(false);
          return; // Stop polling if we have results
        }
        
        // Poll faster if job is complete but waiting for transcript
        const pollDelay = data.status === "COMPLETED" || data.status === "TRANSCRIPT_PENDING" 
          ? 3000 // 3 seconds
          : 10000; // 10 seconds
        
        setTimeout(() => {
          if (isMounted) pollTranscription();
        }, pollDelay);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error polling transcription:', err);
        setError(err.response?.data?.error || err.message);
        setIsPolling(false);
        // Retry later
        setTimeout(() => {
          if (isMounted) pollTranscription();
        }, 15000);
      }
    };

    pollTranscription();
    return () => {
      isMounted = false;
      setIsPolling(false);
    };
  }, [filename]);

  // Video event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleError = (e) => {
        console.error('Video loading error:', e);
        setVideoError(e.target.error?.message || 'Error loading video');
      };

      const handleLoadedData = () => {
        console.log('Video loaded successfully');
        setIsVideoLoading(false);
      };

      videoElement.addEventListener('error', handleError);
      videoElement.addEventListener('loadeddata', handleLoadedData);

      // Cleanup
      return () => {
        videoElement.removeEventListener('error', handleError);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, []);

  // Process the AWS Transcribe JSON into caption objects
  const processTranscriptionToCaptions = () => {
    if (!transcription?.results?.items || transcription.results.items.length === 0) {
      // No transcription available - create default empty captions
      setCaptions([
        { 
          id: 'manual-1',
          text: 'No transcription available. Add custom captions.', 
          start: 0.0, 
          end: 5.0 
        }
      ]);
      setShowManualCaptionEntry(true);
      return [];
    }
    
    let captionsArray = [];
    let currentCap = { text: '', start: 0, end: 0 };

    transcription.results.items.forEach((item) => {
      // Build caption text for pronunciation (words) and attach punctuation
      if (item.type === 'pronunciation') {
        if (!currentCap.text) {
          currentCap.start = parseFloat(item.start_time);
        }
        currentCap.text += ` ${item.alternatives[0].content}`;
        currentCap.end = parseFloat(item.end_time);
      } else if (item.type === 'punctuation') {
        currentCap.text += item.alternatives[0].content;
      }

      // Split caption on period or if text becomes too long
      if (item.alternatives[0].content === '.' || currentCap.text.trim().length > 80) {
        captionsArray.push({ 
          id: `caption-${captionsArray.length}`,
          ...currentCap 
        });
        currentCap = { text: '', start: 0, end: 0 };
      }
    });

    // Add the last caption if it exists
    if (currentCap.text.trim().length > 0) {
      captionsArray.push({ 
        id: `caption-${captionsArray.length}`,
        ...currentCap 
      });
    }

    setCaptions(captionsArray);
    return captionsArray;
  };

  // Update current caption based on video time
  const handleTimeUpdate = () => {
    if (!videoRef.current || captions.length === 0) return;
    const currentTime = videoRef.current.currentTime;
    const cap = captions.find(c => currentTime >= c.start && currentTime <= c.end);
    setCurrentCaption(cap ? cap.text : '');
  };

  // Called when user clicks "Generate Captions"
  const handleGenerateCaptions = () => {
    processTranscriptionToCaptions();
  };

  // Format time for display (HH:MM:SS)
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "00:00:00";
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  };

  // Parse time from string (HH:MM:SS) to seconds
  const parseTime = (timeStr) => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
    }
    return 0;
  };

  // Download captions in SRT format
  const downloadSRT = () => {
    if (captions.length === 0) return;
    
    let srtContent = '';
    captions.forEach((cap, index) => {
      const startTime = formatTime(cap.start).replace('.', ',');
      const endTime = formatTime(cap.end).replace('.', ',');
      
      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${cap.text.trim()}\n\n`;
    });
    
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.split('.')[0]}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add a new caption manually
  const addManualCaption = () => {
    if (!manualCaptionText || !manualCaptionStart || !manualCaptionEnd) {
      setError("Please fill all caption fields");
      return;
    }

    try {
      const start = parseTime(manualCaptionStart);
      const end = parseTime(manualCaptionEnd);
      
      if (start >= end) {
        setError("End time must be after start time");
        return;
      }

      const newCaption = {
        id: `manual-${Date.now()}`,
        text: manualCaptionText,
        start,
        end
      };

      setCaptions([...captions, newCaption]);
      setManualCaptionText('');
      setManualCaptionStart('');
      setManualCaptionEnd('');
      setError('');
    } catch (err) {
      setError("Invalid time format. Use HH:MM:SS");
    }
  };

  // Handle caption edit
  const handleCaptionEdit = (id) => {
    const caption = captions.find(c => c.id === id);
    if (caption) {
      setEditingCaption({...caption}); // Create a copy of the caption
      setIsEditMode(true);
      setActiveTab('editor'); // Switch to editor tab when editing
    }
  };

  // Save edited caption
  const saveEditedCaption = () => {
    if (!editingCaption) return;
    
    // Validate time format
    if (editingCaption.start >= editingCaption.end) {
      setError("End time must be after start time");
      return;
    }

    const updatedCaptions = captions.map(c => 
      c.id === editingCaption.id ? editingCaption : c
    );
    
    setCaptions(updatedCaptions);
    setIsEditMode(false);
    setEditingCaption(null);
    setActiveTab('captions'); // Switch back to captions tab after saving
  };

  // Delete a caption
  const deleteCaption = (id) => {
    const updatedCaptions = captions.filter(c => c.id !== id);
    setCaptions(updatedCaptions);
  };

  // Capture current video time for caption timing
  const captureCurrentTime = (field) => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const timeStr = formatTime(currentTime);
    
    if (field === 'start') {
      setManualCaptionStart(timeStr);
    } else if (field === 'end') {
      setManualCaptionEnd(timeStr);
    } else if (editingCaption && field === 'editStart') {
      setEditingCaption({...editingCaption, start: currentTime});
    } else if (editingCaption && field === 'editEnd') {
      setEditingCaption({...editingCaption, end: currentTime});
    }
  };

  // Embed captions into video using FFmpeg
  const embedCaptionsIntoVideo = async () => {
    if (captions.length === 0) {
      showErrorNotification("No captions to embed");
      return;
    }

    setLoading(true);
    setProcessingVideo(true);
    setError(null);

    try {
      // First, create an SRT file on the server
      const createSrtResponse = await axios.post('/api/create-srt', {
        captions,
        filename
      });

      if (!createSrtResponse.data.success) {
        throw new Error(createSrtResponse.data.error || 'Failed to create SRT file');
      }

      const srtFilename = createSrtResponse.data.srtFilename;

      // Show processing state
      showSuccessNotification('Processing video, please wait...');

      // Process the video with FFmpeg to embed captions
      const processResponse = await axios.post('/api/process-video', {
        videoFile: filename,
        srtFile: srtFilename
      });

      if (!processResponse.data.success) {
        throw new Error(processResponse.data.error || 'Failed to process video');
      }

      // Update UI with the processed video URL
      setProcessedVideoUrl(processResponse.data.processedVideoUrl);
      setVideoStatus('CAPTIONED');
      showSuccessNotification('Video processed successfully!');

      // Switch video source to the new processed video
      if (videoRef.current) {
        videoRef.current.src = processResponse.data.processedVideoUrl;
        videoRef.current.load();
      }

    } catch (err) {
      console.error('Error embedding captions:', err);
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      showErrorNotification(`Failed to embed captions: ${errorMessage}`);
    } finally {
      setLoading(false);
      setProcessingVideo(false);
    }
  };

  // Get status indicator color
  const getStatusColor = () => {
    if (isComplete) return "bg-green-500";
    if (error) return "bg-red-500";
    if (status === "IN_PROGRESS" || status === "QUEUED" || status === "TRANSCRIPT_PENDING") return "bg-blue-500";
    return "bg-yellow-500";
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (isComplete) return 100;
    if (error) return 0;
    if (status === "COMPLETED") return 90;
    if (status === "TRANSCRIPT_PENDING") return 75;
    if (status === "IN_PROGRESS") return 50;
    if (status === "QUEUED") return 25;
    return 10;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Add notifications at the top of the page */}
      {notifications.success && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {notifications.success}
        </div>
      )}
      {notifications.error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.344-2.998c-.175-.095-.795-.195-1.875-.195-1.08 0-1.7.1-1.875.195A.75.75 0 0118 9v.75m-9.344-2.998c.175-.095.795-.195 1.875-.195 1.08 0 1.7.1 1.875.195A.75.75 0 0110.5 9v.75" />
          </svg>
          {notifications.error}
        </div>
      )}
      {/* Header */}
      <header className="py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
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
            </Link>
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
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/60 mb-8">
          <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-white">Video Processing</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="md:col-span-2">
            {/* Video Player */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-white/5">
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black"
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  src={processedVideoUrl || `https://pzwl-captionator.s3.ap-south-1.amazonaws.com/${filename}`}
                  crossOrigin="anonymous"
                  playsInline
                  preload="auto"
                />
                
                {/* Loading state */}
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-blue-400">Loading video...</p>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-red-900/50 border border-red-800 p-4 rounded-lg max-w-md">
                      <p className="text-red-300 font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        {videoError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Captions Overlay */}
                {!processedVideoUrl && captions.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center pointer-events-none">
                    <div className="inline-block bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-lg max-w-xl">
                      {currentCaption}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg text-white mb-1 break-all">{filename}</h2>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${getStatusColor()}`}></div>
                    <p className="text-sm text-white/70">{status}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {captions.length > 0 && (
                    <>
                      <button 
                        onClick={downloadSRT}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download SRT
                      </button>
                      <button 
                        onClick={embedCaptionsIntoVideo}
                        disabled={processingVideo}
                        className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-lg ${processingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {processingVideo ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                            Embed Captions in Video
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Captions tab panel */}
            <div className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-white/5">
              <div className="border-b border-white/10">
                <div className="flex">
                  <button 
                    onClick={() => setActiveTab('captions')}
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'captions' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-white/70 hover:text-white/90'}`}
                  >
                    Captions
                  </button>
                  {transcription?.results?.transcripts?.[0]?.transcript && (
                    <button 
                      onClick={() => setActiveTab('transcript')}
                      className={`px-6 py-3 font-medium text-sm ${activeTab === 'transcript' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-white/70 hover:text-white/90'}`}
                    >
                      Full Transcript
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('editor')}
                    className={`px-6 py-3 font-medium text-sm ${activeTab === 'editor' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-white/70 hover:text-white/90'}`}
                  >
                    Caption Editor
                  </button>
                </div>
              </div>

              {activeTab === 'captions' && (
                <div className="max-h-96 overflow-y-auto p-4">
                  {captions.length > 0 ? (
                    <div className="space-y-2">
                      {captions.map((cap, index) => (
                        <div 
                          key={cap.id || index}
                          className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = cap.start;
                              videoRef.current.play();
                            }
                          }}
                        >
                          <div className="text-blue-400 font-mono whitespace-nowrap pt-1">
                            {formatTime(cap.start)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white group-hover:text-blue-300 transition-colors">{cap.text.trim()}</p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCaptionEdit(cap.id || index);
                              }}
                              className="text-white/70 hover:text-blue-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCaption(cap.id || index);
                              }}
                              className="text-white/70 hover:text-red-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-white/60">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <p>No captions available yet</p>
                      <button 
                        onClick={() => setActiveTab('editor')}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                      >
                        Create Manual Captions
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'transcript' && transcription?.results?.transcripts?.[0]?.transcript && (
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="bg-white/5 p-4 rounded-lg">
                  {transcription.results.transcripts[0].transcript}
                  </div>
                </div>
              )}

              {activeTab === 'editor' && (
                <div className="p-4">
                  {isEditMode ? (
                    <div className="bg-white/5 p-4 rounded-lg space-y-4">
                      <h3 className="font-medium text-lg">Edit Caption</h3>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Caption Text</label>
                        <textarea 
                          className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                          rows={3}
                          value={editingCaption?.text || ''}
                          onChange={(e) => setEditingCaption({...editingCaption, text: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">Start Time (HH:MM:SS)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                              value={formatTime(editingCaption?.start || 0)}
                              onChange={(e) => {
                                try {
                                  const time = parseTime(e.target.value);
                                  setEditingCaption({...editingCaption, start: time});
                                } catch (err) {
                                  console.error("Invalid time format");
                                }
                              }}
                            />
                            <button 
                              onClick={() => captureCurrentTime('editStart')}
                              className="bg-blue-600/50 hover:bg-blue-600 p-3 rounded-lg transition-colors"
                              title="Capture current video time"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">End Time (HH:MM:SS)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              className="flex-1 bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                              value={formatTime(editingCaption?.end || 0)}
                              onChange={(e) => {
                                try {
                                  const time = parseTime(e.target.value);
                                  setEditingCaption({...editingCaption, end: time});
                                } catch (err) {
                                  console.error("Invalid time format");
                                }
                              }}
                            />
                            <button 
                              onClick={() => captureCurrentTime('editEnd')}
                              className="bg-blue-600/50 hover:bg-blue-600 p-3 rounded-lg transition-colors"
                              title="Capture current video time"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          onClick={() => {
                            setIsEditMode(false);
                            setEditingCaption(null);
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={saveEditedCaption}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-lg">Caption Editor</h3>
                          {transcription && !captions.length && (
                            <button 
                              onClick={handleGenerateCaptions}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                            >
                              Generate Captions from Transcription
                            </button>
                          )}
                        </div>
                        
                        {captions.length > 0 && (
                          <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
                            <p className="text-white/70 text-sm mb-2">
                              Click on a caption in the Captions tab to edit or delete it. You can also add new captions below.
                            </p>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => setShowManualCaptionEntry(!showManualCaptionEntry)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-2"
                        >
                          {showManualCaptionEntry ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                              Hide Manual Caption Entry
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Add New Caption
                            </>
                          )}
                        </button>
                      </div>

                      {showManualCaptionEntry && (
                        <div className="bg-white/5 p-4 rounded-lg space-y-4 mb-4">
                          <div>
                            <label className="block text-white/70 text-sm mb-1">Caption Text</label>
                            <textarea 
                              className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                              rows={3}
                              value={manualCaptionText}
                              onChange={(e) => setManualCaptionText(e.target.value)}
                              placeholder="Enter caption text here..."
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/70 text-sm mb-1">Start Time (HH:MM:SS)</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  className="flex-1 bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                                  value={manualCaptionStart}
                                  onChange={(e) => setManualCaptionStart(e.target.value)}
                                  placeholder="00:00:00"
                                />
                                <button 
                                  onClick={() => captureCurrentTime('start')}
                                  className="bg-blue-600/50 hover:bg-blue-600 p-3 rounded-lg transition-colors"
                                  title="Capture current video time"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-white/70 text-sm mb-1">End Time (HH:MM:SS)</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  className="flex-1 bg-black/50 border border-white/20 rounded-lg p-3 text-white"
                                  value={manualCaptionEnd}
                                  onChange={(e) => setManualCaptionEnd(e.target.value)}
                                  placeholder="00:00:05"
                                />
                                <button 
                                  onClick={() => captureCurrentTime('end')}
                                  className="bg-blue-600/50 hover:bg-blue-600 p-3 rounded-lg transition-colors"
                                  title="Capture current video time"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button 
                              onClick={() => {
                                setManualCaptionText('');
                                setManualCaptionStart('');
                                setManualCaptionEnd('');
                              }}
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              Clear
                            </button>
                            <button 
                              onClick={addManualCaption}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                              Add Caption
                            </button>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-900/30 border border-red-800/50 text-red-300 p-3 rounded-lg mb-4">
                          <p className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            {error}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="md:col-span-1">
            {/* Status card */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-white/5 mb-6">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-medium">Transcription Status</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Progress</span>
                  <span className="text-sm font-medium">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Status</span>
                    <span className="font-medium flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`}></div>
                      {status}
                    </span>
                  </div>
                  
                  {elapsedTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Processing Time</span>
                      <span className="font-medium">{elapsedTime}</span>
                    </div>
                  )}
                </div>

                {/* Messages & Errors */}
                {message && (
                  <div className="mt-4 bg-blue-900/30 border border-blue-800/50 text-blue-300 p-3 rounded-lg text-sm">
                    <p>{message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions card */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-white/5">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-medium">Actions</h3>
              </div>
              <div className="p-4">
                {!captions.length && isComplete && (
                  <button
                    onClick={handleGenerateCaptions}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 mb-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    Generate Captions
                  </button>
                )}

                <Link href="/"
                  className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  Back to Home
                </Link>

                {captions.length > 0 && !processedVideoUrl && (
                  <button 
                    onClick={embedCaptionsIntoVideo}
                    disabled={processingVideo}
                    className={`w-full mt-3 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${processingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {processingVideo ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Processing Video...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                        Embed Captions in Video
                      </>
                    )}
                  </button>
                )}

                {processedVideoUrl && (
                  <a 
                    href={processedVideoUrl}
                    download={`captioned-${filename}`}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download Captioned Video
                  </a>
                )}
              </div>
            </div>

            {/* Embed link */}
            {processedVideoUrl && (
              <div className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-white/5">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-medium">Share Video</h3>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <label className="block text-white/70 text-sm mb-1">Video URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        className="flex-1 bg-black/50 border border-white/20 rounded-lg p-3 text-white text-sm"
                        value={processedVideoUrl}
                        readOnly
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(processedVideoUrl);
                          setMessage("URL copied to clipboard!");
                          setTimeout(() => setMessage(""), 3000);
                        }}
                        className="bg-blue-600/50 hover:bg-blue-600 p-2 rounded-lg transition-colors"
                        title="Copy URL"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-4">
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
              </Link>
              <p className="text-white/60 max-w-sm">
                Professional automated video captioning tool for creators, educators, and businesses.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-white/60 hover:text-blue-400 transition-colors">Home</Link></li>
                <li><Link href="/pricing" className="text-white/60 hover:text-blue-400 transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="text-white/60 hover:text-blue-400 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-white/60 hover:text-blue-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-white/60 hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-white/60 hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="text-white/60 hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">&copy; 2025 Captionator. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
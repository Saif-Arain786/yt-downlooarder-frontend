import React, { useState } from "react";

const YouTubeDownloader = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("mp4");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });

  // URL validation
  const isValidYouTubeURL = (url) => {
    const ytRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)[\w\-]{11}.*|youtu\.be\/[\w\-]{11}.*)$/;
    return ytRegex.test(url);
  };

  // Show notification
  const showNotification = (message, isSuccess = true) => {
    setNotification({ show: true, message, isSuccess });
    setTimeout(() => {
      setNotification({ show: false, message: "", isSuccess: true });
    }, 3000);
  };

  // Download video function
  const downloadVideo = async () => {
  const url = videoUrl.trim();

  if (!url) {
    showNotification("Please enter a YouTube URL", false);
    return;
  }

  if (!isValidYouTubeURL(url)) {
    showNotification("Please enter a valid YouTube URL", false);
    return;
  }

  if (!selectedQuality) {
    showNotification("Please select video quality", false);
    return;
  }

  try {
    setIsLoading(true);
    setShowProgress(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 200);

    // Make API call to download video
    const response = await fetch("http://localhost:3000/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        quality: selectedQuality,
        format: selectedFormat,
      }),
    });

    clearInterval(progressInterval);

    if (!response.ok) {
      const errorData = await response.json(); // Parse JSON error response
      throw new Error(errorData.error || "Download failed");
    }

    // Complete progress
    setProgress(100);

    // Handle the video blob response
    const blob = await response.blob();
    const videoUrl = URL.createObjectURL(blob);
    const filename = response.headers
      .get("Content-Disposition")
      ?.match(/filename="(.+)"/)?.[1] || `video.${selectedFormat}`;

    // Trigger download
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(videoUrl);

    showNotification(`Download completed in ${selectedQuality} quality!`);
    setVideoUrl("");
  }  catch (error) {
  console.error("Download error:", error);
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    showNotification(
      "Cannot connect to server. Please check if your backend is running on http://localhost:3000",
      false
    );
  } else if (error.message.includes("Invalid YouTube URL")) {
    showNotification("The provided URL is not a valid YouTube link", false);
  } else if (error.message.includes("No suitable formats") || error.message.includes("No progressive formats")) {
    showNotification(
      `No suitable format available for ${selectedFormat} at ${selectedQuality}. Try another format or quality.`,
      false
    );
  } else if (error.message.includes("No playable formats found") || error.message.includes("ECONNRESET") || error.message.includes("ConnectTimeoutError")) {
    showNotification(
      "Failed to download video due to network issues or video restrictions. Try another video or check your connection.",
      false
    );
  } else if (error.message.includes("CORS")) {
    showNotification(
      "CORS error. Please configure your backend to allow requests from this origin",
      false
    );
  } else {
    showNotification(`Download failed: ${error.message}`, false);
  }
}
  finally {
    setTimeout(() => {
      setIsLoading(false);
      setShowProgress(false);
      setProgress(0);
    }, 1000);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      downloadVideo();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400 animate-pulse"></div>

      {/* Floating Shapes */}
      <div className="fixed inset-0">
        <div className="absolute w-20 h-20 bg-white/10 rounded-full animate-bounce left-[10%] top-[20%]"></div>
        <div className="absolute w-32 h-32 bg-white/10 rounded-full animate-bounce right-[10%] top-[60%] delay-1000"></div>
        <div className="absolute w-16 h-16 bg-white/10 rounded-full animate-bounce left-[80%] top-[80%] delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5">
        {/* Header */}
        <header className="text-center py-8 text-white">
          <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-red-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            YTDownloader Pro
          </h1>
          <p className="text-xl opacity-90 font-light">
            Download YouTube videos in seconds - Fast, Free & Secure
          </p>
        </header>

        {/* Main Card */}
        <main>
          <div className="bg-white/25 backdrop-blur-xl border border-white/20 rounded-3xl p-12 mb-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300">
            {/* URL Input */}
            <div className="mb-8">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full p-4 text-lg border-2 rounded-2xl bg-white/20 text-white placeholder-white/70 backdrop-blur-md outline-none transition-all duration-300 focus:scale-105 focus:bg-white/30 ${
                  videoUrl && !isValidYouTubeURL(videoUrl)
                    ? "border-red-400/60"
                    : "border-white/30 focus:border-white/60"
                }`}
                placeholder="🔗 Paste YouTube video URL here..."
                required
              />
            </div>

            {/* Format Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  {[
    { id: "mp4", icon: "🎬", label: "MP4 Video" },
    { id: "webm", icon: "📹", label: "WebM" },
  ].map((format) => (
    <label key={format.id} className="cursor-pointer">
      <input
        type="radio"
        name="format"
        value={format.id}
        checked={selectedFormat === format.id}
        onChange={(e) => setSelectedFormat(e.target.value)}
        className="sr-only"
      />
      <div
        className={`flex flex-col items-center p-6 rounded-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
          selectedFormat === format.id
            ? "bg-white/30 border-2 border-white/60 scale-105"
            : "bg-white/10 border-2 border-white/20 hover:bg-white/20"
        }`}
      >
        <div className="text-3xl mb-2">{format.icon}</div>
        <div className="text-white font-medium">{format.label}</div>
      </div>
    </label>
  ))}
</div>

            {/* Quality Selector */}
            <div className="mb-8">
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="w-full p-4 text-lg border-2 border-white/30 rounded-2xl bg-white/20 text-white backdrop-blur-md outline-none cursor-pointer transition-all duration-300 focus:border-white/60 focus:scale-105"
              >
                <option value="" className="bg-gray-800">
                  🎯 Select Quality
                </option>
                <option value="2160p" className="bg-gray-800">
                  4K Ultra HD (2160p)
                </option>
                <option value="1440p" className="bg-gray-800">
                  2K QHD (1440p)
                </option>
                <option value="1080p" className="bg-gray-800">
                  Full HD (1080p)
                </option>
                <option value="720p" className="bg-gray-800">
                  HD (720p)
                </option>
                <option value="480p" className="bg-gray-800">
                  SD (480p)
                </option>
                <option value="360p" className="bg-gray-800">
                  Low Quality (360p)
                </option>
              </select>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadVideo}
              disabled={isLoading}
              className="w-full py-5 px-8 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-3xl cursor-pointer transition-all duration-300 uppercase tracking-wide hover:from-red-600 hover:to-orange-600 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden relative"
            >
              ⚡ {isLoading ? "Processing..." : "Download Now"}
            </button>

            {/* Progress Bar */}
            {showProgress && (
              <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-cyan-400 rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
              <div className="text-center mt-4 text-white">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p>Processing your video...</p>
              </div>
            )}
          </div>

          {/* Features Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: "⚡",
                title: "Lightning Fast",
                desc: "Download videos in seconds with our optimized servers and advanced compression technology.",
              },
              {
                icon: "🎯",
                title: "Multiple Formats",
                desc: "Support for MP4, MP3, WebM, AVI and more. Choose the perfect format for your needs.",
              },
              {
                icon: "🔒",
                title: "100% Secure",
                desc: "Your privacy matters. No registration required and all downloads are processed securely.",
              },
              {
                icon: "🎨",
                title: "High Quality",
                desc: "Download in up to 4K resolution. Crystal clear video and audio quality guaranteed.",
              },
              {
                icon: "📱",
                title: "All Devices",
                desc: "Works perfectly on desktop, tablet, and mobile. Download anywhere, anytime.",
              },
              {
                icon: "💎",
                title: "Always Free",
                desc: "No hidden fees, no subscriptions. Enjoy unlimited downloads completely free forever.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center text-white transition-all duration-300 hover:-translate-y-2 hover:bg-white/25 hover:shadow-xl"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="opacity-90 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-white/80 border-t border-white/10">
          <div className="flex justify-center gap-4 mb-4">
            {["📘", "🐦", "📸", "📺"].map((icon, index) => (
              <a
                key={index}
                href="#"
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
              >
                {icon}
              </a>
            ))}
          </div>
          <p>
            &copy; 2025 YTDownloader Pro. Download YouTube videos responsibly
            and respect copyright laws.
          </p>
        </footer>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 px-6 py-4 rounded-2xl text-white backdrop-blur-md z-50 transition-all duration-300 ${
            notification.isSuccess ? "bg-green-500/90" : "bg-red-500/90"
          }`}
        >
          {notification.isSuccess ? "✅" : "❌"} {notification.message}
        </div>
      )}
    </div>
  );
};

export default YouTubeDownloader;

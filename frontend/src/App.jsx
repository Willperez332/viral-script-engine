import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ViralScriptEngine() {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [videoFiles, setVideoFiles] = useState([null, null, null]);
  const [clips, setClips] = useState(['', '', '']);
  const [processingVideos, setProcessingVideos] = useState(false);
  const [productLink, setProductLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [error, setError] = useState('');

  const processVideos = async () => {
    if (!geminiApiKey.trim()) {
      setError('Please enter your Gemini API key first');
      return;
    }

    const filledVideos = videoFiles.filter(f => f !== null);
    if (filledVideos.length === 0) {
      setError('Please upload at least one video file');
      return;
    }

    setProcessingVideos(true);
    setError('');

    try {
      const formData = new FormData();
      filledVideos.forEach(file => {
        if (file) formData.append('videos', file);
      });
      formData.append('geminiApiKey', geminiApiKey);

      const response = await fetch(`${API_URL}/api/process-videos`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to process videos');
      }

      const data = await response.json();
      setClips(data.transcripts);
      alert('✅ Videos processed! Review transcripts below.');
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setProcessingVideos(false);
    }
  };

  const generateAllVariations = async () => {
    const filledClips = clips.filter(c => c.trim());
    if (filledClips.length < 2) {
      setError('Please provide at least 2 clip transcripts');
      return;
    }
    if (!productLink.trim()) {
      setError('Please provide a product link');
      return;
    }

    setLoading(true);
    setError('');
    setScripts(null);

    try {
      const [strictScript, aiScript] = await Promise.all([
        generateVariation('STRICT', filledClips, productLink),
        generateVariation('AI_OPTIMIZED', filledClips, productLink)
      ]);

      setScripts([strictScript, aiScript]);
      setSelectedVariation(0);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateVariation = async (mode, clips, productLink) => {
    const response = await fetch(`${API_URL}/api/generate-scripts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clips, productLink, mode })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to generate script');
    }

    const data = await response.json();
    return { mode: data.mode, script: data.script };
  };

  const copyScript = () => {
    if (scripts && scripts[selectedVariation]) {
      navigator.clipboard.writeText(scripts[selectedVariation].script);
      alert('📋 Script copied to clipboard!');
    }
  };

  const variationLabels = [
    { name: 'Your Vision', desc: 'Uses clips in your exact order', icon: '🎯' },
    { name: 'AI Optimized', desc: 'AI picks best clip order', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            🌙 Viral Script Engine
          </h1>
          <p className="text-gray-400">Operation Moonscale v5.0 | AI Video Processing</p>
        </div>

        {/* API Key */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-3 text-purple-400">🔑 Gemini API Key</h2>
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-gray-100 focus:border-purple-500 focus:outline-none"
            placeholder="Paste your Gemini API key..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Get free API key: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400">aistudio.google.com</a>
          </p>
        </div>

        {/* Video Upload */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-3 text-purple-400">📹 Upload Videos</h2>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm mb-2">
                Video {index + 1} {index < 2 && <span className="text-red-400">*</span>}
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const newFiles = [...videoFiles];
                  newFiles[index] = e.target.files[0] || null;
                  setVideoFiles(newFiles);
                }}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              {videoFiles[index] && (
                <p className="text-xs text-green-400 mt-1">✓ {videoFiles[index].name}</p>
              )}
            </div>
          ))}
          <button
            onClick={processVideos}
            disabled={processingVideos}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 mt-4"
          >
            {processingVideos ? '🔄 Processing...' : '🤖 Process Videos'}
          </button>
        </div>

        {/* Transcripts */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-3 text-purple-400">✏️ Review Transcripts</h2>
          {clips.map((clip, index) => (
            <textarea
              key={index}
              value={clip}
              onChange={(e) => {
                const newClips = [...clips];
                newClips[index] = e.target.value;
                setClips(newClips);
              }}
              className="w-full h-32 bg-gray-900 border border-gray-600 rounded p-3 mb-4 text-sm font-mono"
              placeholder={`Clip ${index + 1} transcript...`}
            />
          ))}
        </div>

        {/* Product Link */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-3 text-purple-400">🔗 Product Link</h2>
          <input
            type="text"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded p-3"
            placeholder="https://amazon.com/..."
          />
        </div>

        {/* Generate */}
        <button
          onClick={generateAllVariations}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 mb-6"
        >
          {loading ? '⚡ Generating...' : '⚡ Generate Scripts (2 Versions)'}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Scripts */}
        {scripts && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-bold mb-3">Select Variation:</h3>
              <div className="grid grid-cols-2 gap-3">
                {variationLabels.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariation(index)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedVariation === index
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-gray-600 bg-gray-900'
                    }`}
                  >
                    <div className="text-2xl mb-1">{variant.icon}</div>
                    <div className="font-bold text-sm">{variant.name}</div>
                    <div className="text-xs text-gray-400">{variant.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-400">
                  {variationLabels[selectedVariation].icon} {variationLabels[selectedVariation].name}
                </h2>
                <button
                  onClick={copyScript}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  📋 Copy
                </button>
              </div>
              <div className="bg-gray-900 rounded p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {scripts[selectedVariation].script}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { NETWORK_IMG, GPU_IMG, SOLAR_IMG, TRADING_IMG } from './constants.ts';
import { Play, X } from 'lucide-react';

export const PromoVideoSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const VIDEO_URL =
    'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/venture/videos/0823(2).mp4';

  const PROMO_IMAGES = [NETWORK_IMG, GPU_IMG, SOLAR_IMG, TRADING_IMG];
  const activeImg = PROMO_IMAGES[activeSlide] || GPU_IMG;

  const handleStartPlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, 50);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden" id="venture-promo-video-section">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(30,15,80,0.3) 0%, transparent 70%)',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 venture-glass rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase font-display-outfit">
                Inside MetaFirm
              </span>
            </div>
            <h2 className="font-display-outfit text-3xl sm:text-5xl font-bold text-white">
              Inside the
              <span className="block venture-gradient-text">MetaFirm Vision</span>
            </h2>
          </div>
          <p className="text-slate-400 max-w-sm text-sm sm:text-base">
            A look into the infrastructure, technology, and strategy driving MetaFirm's next chapter.
          </p>
        </div>

        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black w-full"
          style={{
            border: '1px solid rgba(99,135,255,0.25)',
            boxShadow:
              '0 0 80px rgba(99,80,255,0.15), 0 30px 80px rgba(0,0,0,0.7)',
          }}
        >
          <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
            {isPlaying ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={VIDEO_URL}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  onEnded={handleVideoEnded}
                  poster={activeImg}
                  className="w-full h-full object-cover sm:object-contain bg-black"
                  id="metafirm-vision-stream-video"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.pause();
                    }
                    setIsPlaying(false);
                  }}
                  id="close-video-stream-btn"
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 bg-slate-900/80 hover:bg-slate-800 text-white/90 hover:text-white rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md transition-all duration-200 shadow-xl cursor-pointer"
                  aria-label="Close video player"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            ) : (
              <>
                <img
                  src={activeImg}
                  alt="MetaFirm vision"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-75 transition-all duration-700"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(4,9,26,0.45) 0%, rgba(60,30,120,0.25) 100%)',
                  }}
                />

                {/* Clean Centered Animated Play button */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    type="button"
                    onClick={handleStartPlay}
                    id="play-metafirm-vision-video-btn"
                    className="group relative flex items-center justify-center cursor-pointer border-none bg-transparent outline-none p-0 transition-transform duration-300 transform hover:scale-110 active:scale-95"
                    aria-label="Play MetaFirm Vision Video"
                  >
                    {/* Animated Pulse Ring */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-35 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(34,211,238,0.7) 0%, rgba(139,92,246,0.3) 100%)',
                      }}
                    />

                    {/* Subtle outer glow */}
                    <div
                      className="absolute -inset-1.5 rounded-full blur-md opacity-50 pointer-events-none group-hover:opacity-80 transition-opacity duration-300"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(34,211,238,0.4) 100%)',
                      }}
                    />

                    {/* Main Compact Play Button */}
                    <div
                      className="relative rounded-full flex items-center justify-center shadow-xl transition-all duration-300"
                      style={{
                        width: '52px',
                        height: '52px',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        boxShadow:
                          '0 0 30px rgba(139,92,246,0.5), inset 0 0 12px rgba(255,255,255,0.2)',
                      }}
                    >
                      <Play className="w-5 h-5 text-white fill-white ml-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </button>
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 z-10 pointer-events-none">
                  <div className="venture-glass rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 max-w-sm pointer-events-auto">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-display-outfit tracking-wider uppercase mb-0.5">
                      MetaFirm — 2025 Vision
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      Infrastructure for the Next Economy
                    </p>
                  </div>

                  <div className="flex gap-2 items-center self-end sm:self-auto pointer-events-auto">
                    {[0, 1, 2, 3].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveSlide(i)}
                        className="transition-all duration-300 rounded-full cursor-pointer border-none p-0"
                        style={{
                          height: '4px',
                          width: activeSlide === i ? '24px' : '8px',
                          background:
                            activeSlide === i ? '#22d3ee' : 'rgba(255,255,255,0.25)',
                        }}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

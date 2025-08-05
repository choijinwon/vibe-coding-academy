'use client';

import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  SkipForward,
  SkipBack,
  Settings,
  Download,
  Lock,
  AlertCircle
} from 'lucide-react';

interface VideoPlayerProps {
  src: string; // 비디오 URL (HLS, MP4 등)
  poster?: string; // 썸네일 이미지
  title?: string; // 비디오 제목
  onProgress?: (currentTime: number, duration: number) => void; // 진도 콜백
  onComplete?: () => void; // 완료 콜백
  enableDownload?: boolean; // 다운로드 허용 여부
  watermark?: string; // 워터마크 텍스트
  drmProtected?: boolean; // DRM 보호 여부
  startTime?: number; // 시작 시간 (초)
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  onProgress,
  onComplete,
  enableDownload = false,
  watermark,
  drmProtected = false,
  startTime = 0,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [quality, setQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컨트롤 숨김 타이머
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // HLS 지원 확인 및 초기화
    if (src.includes('.m3u8') || src.includes('hls')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (startTime > 0) {
            video.currentTime = startTime;
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            setError('동영상을 로드할 수 없습니다.');
          }
        });

        // 화질 옵션 설정
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels;
          if (levels.length > 1) {
            // 화질 옵션이 여러 개인 경우 자동 화질 선택
            hls.currentLevel = -1; // auto
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari에서 네이티브 HLS 지원
        video.src = src;
        setIsLoading(false);
      } else {
        setError('이 브라우저에서는 동영상을 재생할 수 없습니다.');
      }
    } else {
      // 일반 MP4 등
      video.src = src;
      setIsLoading(false);
    }

    // 비디오 이벤트 리스너
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (startTime > 0) {
        video.currentTime = startTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        onProgress(video.currentTime, video.duration);
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) {
        onComplete();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, startTime, onProgress, onComplete]);

  // 전체화면 이벤트 리스너
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 컨트롤 자동 숨김
  const resetControlsTimeout = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setShowControls(true);
    
    if (isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [isPlaying]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          video.volume = Math.min(1, volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          video.volume = Math.max(0, volume - 0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const handleVolumeSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume > 0) {
      video.muted = false;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleQualityChange = (qualityLevel: string) => {
    if (!hlsRef.current) return;

    if (qualityLevel === 'auto') {
      hlsRef.current.currentLevel = -1;
    } else {
      const levelIndex = parseInt(qualityLevel);
      hlsRef.current.currentLevel = levelIndex;
    }
    
    setQuality(qualityLevel);
    setShowSettings(false);
  };

  if (error) {
    return (
      <div className={`bg-gray-900 text-white flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-medium mb-2">동영상 재생 오류</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 비디오 요소 */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        onContextMenu={(e) => drmProtected && e.preventDefault()} // 우클릭 방지
        onDragStart={(e) => drmProtected && e.preventDefault()} // 드래그 방지
        style={drmProtected ? { userSelect: 'none' } : {}} // 텍스트 선택 방지
      >
        동영상을 지원하지 않는 브라우저입니다.
      </video>

      {/* 워터마크 */}
      {watermark && (
        <div className="absolute top-4 right-4 text-white text-sm opacity-50 pointer-events-none">
          {watermark}
        </div>
      )}

      {/* DRM 보호 표시 */}
      {drmProtected && (
        <div className="absolute top-4 left-4 flex items-center text-white text-sm opacity-75">
          <Lock className="h-4 w-4 mr-1" />
          보안 콘텐츠
        </div>
      )}

      {/* 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
        </div>
      )}

      {/* 재생 버튼 (중앙) */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-300"
        >
          <div className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all duration-300">
            <Play className="h-8 w-8 text-black ml-1" />
          </div>
        </button>
      )}

      {/* 컨트롤 바 */}
      {showControls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* 진행 바 */}
          <div className="mb-4">
            <div
              className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              {/* 버퍼링 진행 바 */}
              <div
                className="h-full bg-gray-400 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* 재생 진행 바 */}
              <div
                className="h-full bg-red-600 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          {/* 컨트롤 버튼들 */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              {/* 재생/일시정지 */}
              <button onClick={togglePlay} className="hover:text-red-400 transition-colors">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              {/* 10초 뒤로 */}
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (video) video.currentTime = Math.max(0, video.currentTime - 10);
                }}
                className="hover:text-red-400 transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              {/* 10초 앞으로 */}
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (video) video.currentTime = Math.min(video.duration, video.currentTime + 10);
                }}
                className="hover:text-red-400 transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              {/* 볼륨 */}
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="hover:text-red-400 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <div className="w-20 h-1 bg-gray-600 rounded-full cursor-pointer" onClick={handleVolumeSeek}>
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>

              {/* 시간 표시 */}
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* 다운로드 */}
              {enableDownload && (
                <button className="hover:text-red-400 transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              )}

              {/* 설정 */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-red-400 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-4 min-w-40">
                    {/* 재생 속도 */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">재생 속도</p>
                      <div className="space-y-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className={`block w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-700 ${
                              playbackRate === rate ? 'bg-red-600' : ''
                            }`}
                          >
                            {rate === 1 ? '보통' : `${rate}x`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 화질 (HLS의 경우) */}
                    {hlsRef.current && hlsRef.current.levels.length > 1 && (
                      <div>
                        <p className="text-sm font-medium mb-2">화질</p>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleQualityChange('auto')}
                            className={`block w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-700 ${
                              quality === 'auto' ? 'bg-red-600' : ''
                            }`}
                          >
                            자동
                          </button>
                          {hlsRef.current.levels.map((level, index) => (
                            <button
                              key={index}
                              onClick={() => handleQualityChange(index.toString())}
                              className={`block w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-700 ${
                                quality === index.toString() ? 'bg-red-600' : ''
                              }`}
                            >
                              {level.height}p
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 전체화면 */}
              <button onClick={toggleFullscreen} className="hover:text-red-400 transition-colors">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 제목 오버레이 */}
      {title && showControls && !isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4">
          <h3 className="text-white text-lg font-medium">{title}</h3>
        </div>
      )}
    </div>
  );
} 
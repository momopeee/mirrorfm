import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MobileContainer from '@/components/MobileContainer';
import AudioPlayer from '@/components/AudioPlayer';
import { useApp } from '@/context/AppContext';
import { INDEX_BGM, BUTTON_SOUND } from '@/constants/audioUrls';

// Declare audioCache on window
declare global {
  interface Window {
    audioCache?: Record<string, HTMLAudioElement>;
  }
}

// アプリケーションのバージョン
const APP_VERSION = "Ver.3.167.0";

const Index = () => {
  const { bgmEnabled, toggleBgm } = useApp();
  const [userInteracted, setUserInteracted] = useState(false);
  // ローディング状態の管理（初期状態：true）
  const [isLoading, setIsLoading] = useState(true);
  
  // オーディオコンテキストをアンブロックする関数
  const unblockAudio = useCallback(() => {
    if (userInteracted) return;
    
    console.log("Attempting to unblock audio context");
    const silentAudio = new Audio();
    silentAudio.play().then(() => {
      console.log("Audio context unblocked by user interaction");
      setUserInteracted(true);
      silentAudio.pause();
      silentAudio.src = "";
    }).catch(err => {
      console.log("Could not unblock audio context:", err);
    });
  }, [userInteracted]);
  
  useEffect(() => {
    console.log("Index page loaded. BGM enabled:", bgmEnabled);
    document.addEventListener('click', unblockAudio, { once: true });
    document.addEventListener('touchstart', unblockAudio, { once: true });
    
    const preloadAudio = (url: string) => {
      if (!window.audioCache) {
        window.audioCache = {};
      }
      
      if (!window.audioCache[url]) {
        const audio = new Audio();
        audio.src = url;
        audio.preload = "auto";
        window.audioCache[url] = audio;
        console.log(`Preloading audio: ${url}`);
      }
    };
    
    preloadAudio(INDEX_BGM);
    preloadAudio(BUTTON_SOUND);
    
    return () => {
      document.removeEventListener('click', unblockAudio);
      document.removeEventListener('touchstart', unblockAudio);
    };
  }, [bgmEnabled, unblockAudio]);
  
  // ローディング状態を一定時間後に解除（例：1.5秒後）
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // handleStartClick 内の buttonSound 関連処理を削除
  const handleStartClick = useCallback(() => {
    // BUTTON_SOUND を再生する処理は削除しました
  }, []);
  
  return (
    <MobileContainer
      backgroundClassName="bg-[#0a0a0a]"
      backgroundImage="/lovable-uploads/c8b9a8dd-129e-4ba6-ba66-c03a253d63f7.png"
      pcBackgroundColor="#0B0B0B"
    >
      {/* ローディングオーバーレイ：isLoadingがtrueの場合のみ表示 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
          <div className="text-white text-xl">読み込み中...</div>
        </div>
      )}
      
      <AudioPlayer 
        src={INDEX_BGM} 
        loop={true} 
        autoPlay={true} 
        volume={0.7}
        id="index-bgm"
      />
      
      <div className="flex flex-col items-center justify-between h-full px-4 py-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center justify-center gap-6 sm:gap-10">
            <img 
              src="/lovable-uploads/c8b9a8dd-129e-4ba6-ba66-c03a253d63f7.png" 
              alt="battle.fm" 
              className="w-48 sm:w-64 md:w-80 mb-6 sm:mb-10"
            />
            
            <Button 
              asChild
              className="w-48 sm:w-64 text-base sm:text-lg py-4 sm:py-6 bg-pink-500 hover:bg-pink-600 rounded-full font-bold"
              onClick={handleStartClick}
            >
              <Link to="/start">スタート</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-auto pb-4">
          <span className="text-[11px] text-gray-500">{APP_VERSION}</span>
        </div>
      </div>
    </MobileContainer>
  );
};

export default React.memo(Index);

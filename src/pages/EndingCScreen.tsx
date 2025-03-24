import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileContainer from '@/components/MobileContainer';
import AudioPlayer from '@/components/AudioPlayer';
import { ENDING_BGM, BUTTON_SOUND } from '@/constants/audioUrls';

const EndingCScreen: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    bgmEnabled, 
    toggleBgm,
    handleScreenTransition,
    resetBattleState
  } = useApp();
  const [buttonSound, setButtonSound] = useState<string | null>(null);

  useEffect(() => {
    console.log('EndingC screen mounted - clearing any lingering timeouts');
    const highestTimeoutId = window.setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      window.clearTimeout(i);
    }
  }, []);

  const playButtonSoundAndDoAction = (action: () => void) => {
    setButtonSound(BUTTON_SOUND);
    setTimeout(() => {
      action();
      setTimeout(() => setButtonSound(null), 500);
    }, 200);
  };

  const handleRetry = () => {
    playButtonSoundAndDoAction(() => {
      resetBattleState();
      handleScreenTransition('battle2');
      navigate('/battle2');
    });
  };

  const handleBackToStart = () => {
    playButtonSoundAndDoAction(() => {
      resetBattleState();
      handleScreenTransition('index');
      navigate('/');
    });
  };

  const handleFollowYuji = () => {
    playButtonSoundAndDoAction(() => {
      window.open('https://stand.fm/channels/5eb17436f654bbcab4e54fa0', '_blank');
    });
  };

  return (
    <MobileContainer backgroundImage="/lovable-uploads/06195b62-3f14-4c57-b235-a8f00a43b907.png">
      <div 
        className="flex flex-col p-4 justify-center items-center text-white bg-cover bg-center h-full w-full"
        style={{ 
          backgroundImage: 'url("/lovable-uploads/06195b62-3f14-4c57-b235-a8f00a43b907.png")',
          fontFamily: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif',
        }}
      >
        <AudioPlayer 
          src={ENDING_BGM}
          loop={true}
          autoPlay={true}
          volume={0.7}
          id="ending-c-bgm"
        />
        
        {buttonSound && (
          <AudioPlayer 
            src={buttonSound} 
            loop={false} 
            autoPlay={true} 
            volume={0.7}
            id="button-sound" 
          />
        )}
        
        <div className="w-full text-center mb-4 sm:mb-6 z-10">
          <h1 
            className="text-white -webkit-text-stroke-[1px] sm:-webkit-text-stroke-[2px] -webkit-text-stroke-black animate-pulse jp-text" 
            style={{ 
              fontSize: isMobile ? 'calc(1.25rem + 8px)' : 'calc(1.5rem + 18px)',
              fontFamily: 'Rodin M, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif',
              textShadow: '0 0 10px rgba(255,255,255,0.7)',
              letterSpacing: '2px',
              fontWeight: 'bold'
            }}
          >
            敗北
          </h1>
        </div>
        
        <div className="relative flex-1 flex items-center justify-center w-full overflow-hidden perspective">
          <div className="absolute w-full max-w-3xl text-center transform rotate3d">
            <div 
              className="star-wars-text-content text-white -webkit-text-stroke-[1px] -webkit-text-stroke-black leading-relaxed animate-text-scroll p-4 sm:p-6 rounded jp-text" 
              style={{ 
                fontSize: isMobile ? 'calc(0.875rem + 2px)' : 'calc(1.125rem + 4px)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 5px #000000e6, 0 0 10px #0006'
              }}
            >
              <p>
                とおるは敗れた！<br />
                <br />
                とおるの言葉は<br />
                ゆうじに届かない<br />
                <br />
                馬耳東風<br />
                <br />
                ゆうじの耳に<br />
                とおるの金言<br />
                <br />
                <br />
                だが、それも良い<br />
                <br />
                世界は広い<br />
                <br />
                みんな違って、<br />
                みんないい<br />
                <br />
                <br />
                だから、<br />
                <br />
                届けたい言葉が<br />
                <br />
                届けたい人に届かない時<br />
                <br />
                嘆く必要はない<br />
                <br />
                <br />
                <br />
                何度でも話せばいい<br />
                とおるにはそれが出来る<br />
                <br />
                <br />
                そう、stand.fmなら<br />
                <br />
                コラボでお話出来る！<br />
                <br />
                <br />
                <br />
                俺達のスタエフは<br />
                まだ始まったばかりだ！<br />
              </p>
            </div>
          </div>
        </div>
        
        <div className="w-full flex flex-col items-center space-y-3 pb-4">
          <Button
            onClick={handleFollowYuji}
            className="w-48 sm:w-64 py-2 bg-white text-pink-500 border-2 border-pink-500 hover:bg-pink-50 font-bold rounded-full text-sm jp-text"
            style={{ height: '40px' }}
          >
            ゆうじをフォローする
          </Button>
          
          <Button
            onClick={handleRetry}
            className="w-48 sm:w-64 py-2 bg-white text-purple-500 border-2 border-purple-500 hover:bg-purple-50 font-bold rounded-full text-sm jp-text"
            style={{ height: '40px' }}
          >
            もう一度戦う
          </Button>
          
          <Button
            onClick={handleBackToStart}
            className="w-48 sm:w-64 py-2 bg-pink-500 text-white hover:bg-pink-600 font-bold rounded-full text-sm jp-text"
            style={{ height: '40px' }}
          >
            スタートへ戻る
          </Button>
        </div>
        
        <button
          onClick={toggleBgm}
          className="fixed top-3 sm:top-6 right-3 sm:right-6 z-20 bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-full hover:bg-white/20 transition-colors"
        >
          {bgmEnabled ? 
            <Volume2 size={isMobile ? 20 : 24} color="white" /> : 
            <VolumeX size={isMobile ? 20 : 24} color="white" />
          }
        </button>
      </div>
    </MobileContainer>
  );
};

export default EndingCScreen;

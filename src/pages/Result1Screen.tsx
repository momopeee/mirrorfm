import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '@/components/MobileContainer';
import AudioPlayer from '@/components/AudioPlayer';
import { RESULT_SCREEN_BGM, BUTTON_SOUND } from '@/constants/audioUrls';

const Result1Screen: React.FC = () => {
  const { 
    player,
    battleTimer,
    comments,
    handleScreenTransition,
    resetBattleState,
    pauseBattleTimer
  } = useApp();
  
  const navigate = useNavigate();
  const [isFollowed, setIsFollowed] = useState(false);
  const [finalBattleTime, setFinalBattleTime] = useState("");
  const [buttonSound, setButtonSound] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Clear any existing timers on mount
  useEffect(() => {
    // Clear any automatic timers that might exist
    const existingTimers = window.setTimeout(() => {}, 0);
    for (let i = 0; i < existingTimers; i++) {
      window.clearTimeout(i);
    }
  }, []);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    pauseBattleTimer();
    setFinalBattleTime(formatTime(battleTimer));
    toast.error('そーそーに敗北しました', {
      description: '次回は頑張りましょう！',
      duration: 3000,
      position: 'top-center',
    });
    console.log('Rendered Result1Screen');
    console.log('Attempting to play defeat BGM:', RESULT_SCREEN_BGM);

    return () => {
      console.log('Unmounting Result1Screen');
      setButtonSound(null);
    };
  }, [battleTimer, pauseBattleTimer]);

  const playButtonSoundAndDoAction = (action: () => void) => {
    if (actionInProgress) return;
    
    setActionInProgress(true);
    setButtonSound(BUTTON_SOUND);
    
    setTimeout(() => {
      action();
      setTimeout(() => {
        setButtonSound(null);
        setActionInProgress(false);
      }, 500);
    }, 300);
  };

  const handleContinue = () => {
    playButtonSoundAndDoAction(() => {
      console.log('Navigating to endingB from Result1Screen');
      
      // Before navigating, make sure we have no lingering timers
      const existingTimers = window.setTimeout(() => {}, 0);
      for (let i = 0; i < existingTimers; i++) {
        window.clearTimeout(i);
      }
      
      resetBattleState();
      handleScreenTransition('endingB');
      navigate('/endingB');
    });
  };
  
  const handleReturnToStart = () => {
    playButtonSoundAndDoAction(() => {
      console.log('Returning to start from Result1Screen');
      resetBattleState();
      handleScreenTransition('index');
      navigate('/');
    });
  };
  
  const handleFightAgain = () => {
    playButtonSoundAndDoAction(() => {
      console.log('Fighting again from Result1Screen');
      resetBattleState();
      handleScreenTransition('battle1');
      navigate('/battle1');
    });
  };
  
  const handleFollow = () => {
    playButtonSoundAndDoAction(() => {
      setIsFollowed(!isFollowed);
      if (!isFollowed) {
        window.open('https://stand.fm/channels/5e85f9834afcd35104858d5a', '_blank');
      }
    });
  };

  const handleSoundEnded = () => {
    console.log(`Button sound effect completed`);
  };

  return (
    <MobileContainer backgroundClassName="bg-white">
      <AudioPlayer 
        src={RESULT_SCREEN_BGM} 
        loop={true} 
        autoPlay={true} 
        volume={0.7}
        id="result1-bgm" 
      />
      
      {buttonSound && (
        <AudioPlayer 
          src={buttonSound} 
          loop={false} 
          autoPlay={true} 
          volume={0.7}
          id="button-sound" 
          onEnded={handleSoundEnded}
        />
      )}
      
      <div 
        className="bg-white text-black flex flex-col items-center justify-between h-full"
        style={{ 
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <div className="w-full flex flex-col items-center justify-center flex-1">
          <div className="text-center mb-6">
            <h2 className="text-[17px] font-bold mb-4 text-black jp-text">ライブが終了しました</h2>
            
            <div className="text-[12px] text-gray-500 mb-2">
              {finalBattleTime}
            </div>
            
            <div className="flex items-center justify-center gap-1 text-[12px] text-gray-500">
              <MessageCircle size={16} strokeWidth={1.5} />
              <span>{comments.length}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <img 
              src={player.icon} 
              alt={player.name} 
              className="w-[35px] h-[35px] rounded-full object-cover"
            />
            
            <div className="text-[12px] font-bold text-black jp-text">
              {player.name}
            </div>
            
            <Button
              onClick={handleFollow}
              disabled={actionInProgress}
              className={`rounded-full px-3 py-1 text-[10px] h-[22px] ${
                isFollowed 
                  ? "bg-gray-200 text-gray-700" 
                  : "bg-pink-500 text-white hover:bg-pink-600"
              } ${actionInProgress ? 'opacity-70' : ''}`}
              style={{ minWidth: '80px' }}
            >
              {isFollowed ? "フォロー中" : "フォローする"}
            </Button>
          </div>
        </div>
        
        <div className="w-full flex flex-col items-center space-y-3 pb-4">
          <Button
            onClick={handleContinue}
            disabled={actionInProgress}
            className={`w-48 sm:w-64 py-2 bg-white text-pink-500 border-2 border-pink-500 hover:bg-pink-50 font-bold rounded-full text-sm jp-text ${actionInProgress ? 'opacity-70' : ''}`}
            style={{ height: '40px' }}
          >
            次へ進む
          </Button>
          
          <Button
            onClick={handleFightAgain}
            disabled={actionInProgress}
            className={`w-48 sm:w-64 py-2 bg-white text-purple-500 border-2 border-purple-500 hover:bg-purple-50 font-bold rounded-full text-sm jp-text ${actionInProgress ? 'opacity-70' : ''}`}
            style={{ height: '40px' }}
          >
            もう一度戦う
          </Button>
          
          <Button
            onClick={handleReturnToStart}
            disabled={actionInProgress}
            className={`w-48 sm:w-64 py-2 bg-pink-500 text-white hover:bg-pink-600 font-bold rounded-full text-sm jp-text ${actionInProgress ? 'opacity-70' : ''}`}
            style={{ height: '40px' }}
          >
            スタートへ戻る
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
};

export default Result1Screen;

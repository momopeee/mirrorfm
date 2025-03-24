import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import CommentArea from '@/components/CommentArea';
import CharacterSheet from '@/components/CharacterSheet';
import AudioPlayer from '@/components/AudioPlayer';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileContainer from '@/components/MobileContainer';
import { useIsMobile } from '@/hooks/use-mobile';

// Import the battle components
import CharacterPortraits from '@/components/battle/CharacterPortraits';
import GaugesDisplay from '@/components/battle/GaugesDisplay';
import BattleActions from '@/components/battle/BattleActions';
import CommentInput from '@/components/battle/CommentInput';
import PlayerInfo from '@/components/battle/PlayerInfo';

// Import audio constants
import { 
  BATTLE_BGM, 
  YUJI_SPECIAL_BGM, 
  VICTORY_BGM, 
  DEFEAT_BGM, 
  BUTTON_SOUND,
  ATTACK_SOUND,
  SPECIAL_SOUND,
  RUN_AWAY_SOUND,
  HIGHBALL_SOUND
} from '@/constants/audioUrls';

// （省略）各コメント配列定義はそのまま

const Battle2Screen: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    player, 
    opponent2, 
    bgmEnabled, 
    toggleBgm,
    battleTimer,
    startBattleTimer,
    pauseBattleTimer,
    resetBattleTimer,
    comments,
    attackCount,
    specialAttackAvailable, 
    yujiSpecialMode,
    showCharacterSheet,
    currentCharacterSheet,
    setShowCharacterSheet,
    setCurrentCharacterSheet,
    addComment,
    clearComments,
    setAttackCount,
    setSpecialAttackAvailable,
    setYujiSpecialMode,
    handleScreenTransition,
    setPlayer
  } = useApp();
  
  // Battle state - grouped related state together
  const [battleState, setBattleState] = useState({
    isPlayerTurn: true,
    isBattleOver: false,
    attackInProgress: false,
    yujiInSpecialMode: false,
    specialModeActive: false,
    isHighballConfused: false,
    specialModeTimer: 0,
    showSkipButton: false,
  });

  const {
    isPlayerTurn,
    isBattleOver,
    attackInProgress,
    yujiInSpecialMode,
    specialModeActive,
    isHighballConfused,
    specialModeTimer,
    showSkipButton,
  } = battleState;

  // Separate audio-related state
  const [soundEffect, setSoundEffect] = useState<string | null>(null);
  const [currentBgm, setCurrentBgm] = useState<string>(BATTLE_BGM);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [opponentHp, setOpponentHp] = useState(opponent2.currentHp);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  
  // スロットリング用（クリック間隔 500ms）
  const lastClickRef = useRef<number>(0);
  const MIN_CLICK_INTERVAL = 500;

  // Memoize unchanging values
  const battleBackgroundGradient = useMemo(() => 
    'linear-gradient(180deg, rgba(0, 153, 198, 1), rgba(12, 33, 133, 1))'
  , []);

  // Helper function to update battle state partially
  const updateBattleState = useCallback((newState: Partial<typeof battleState>) => {
    setBattleState(prev => ({ ...prev, ...newState }));
  }, []);
  
  // Reset battle state on component mount and start timer with fresh timer value
  useEffect(() => {
    const cleanupTimeouts = () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
      pauseBattleTimer();
    };

    clearComments();
    
    setPlayer(prev => ({
      ...prev,
      currentHp: 100
    }));
    
    resetBattleTimer();
    
    setOpponentHp(opponent2.currentHp);
    setAttackCount(0);
    setSpecialAttackAvailable(false);
    setYujiSpecialMode(false);
    updateBattleState({
      isPlayerTurn: true,
      isBattleOver: false,
      attackInProgress: false,
      yujiInSpecialMode: false,
      specialModeActive: false,
      specialModeTimer: 0,
      isHighballConfused: false,
      showSkipButton: false
    });
    setCurrentBgm(BATTLE_BGM);
    setBattleResult(null);
    
    startBattleTimer();
    
    // Preload audio files for better performance
    const preloadAudios = [
      BATTLE_BGM, 
      YUJI_SPECIAL_BGM, 
      VICTORY_BGM, 
      DEFEAT_BGM,
      ATTACK_SOUND,
      SPECIAL_SOUND,
      RUN_AWAY_SOUND,
      HIGHBALL_SOUND,
      BUTTON_SOUND
    ];
    
    preloadAudios.forEach(url => {
      const audio = new Audio();
      audio.src = url;
      audio.preload = "auto";
      console.log(`Preloading audio: ${url}`);
    });
    
    // Initial battle setup messages
    setTimeout(() => {
      addComment('システム', '第二戦！とおる VS ゆうじ＠陽気なおじさん', true);
      addComment('ゆうじ＠陽気なおじさん', 'どうも～陽気なおじさんでお馴染み、ゆうじです。今日はやまにぃに経営とは何かについて僕なりに指南していきますよ～！');
    }, 1000);
    
    return cleanupTimeouts;
  }, []);

  // Handle character sheet display
  const handleCharacterClick = useCallback((character: 'player' | 'opponent1' | 'opponent2') => {
    setCurrentCharacterSheet(character);
    setShowCharacterSheet(true);
  }, [setCurrentCharacterSheet, setShowCharacterSheet]);
  
  // Check for Yuji's special mode activation
  useEffect(() => {
    if (opponentHp <= 20 && !yujiInSpecialMode && !isBattleOver && !specialModeActive) {
      activateYujiSpecialMode();
    }
  }, [opponentHp, yujiInSpecialMode, isBattleOver, specialModeActive]);
  
  // Manage Yuji's special mode timer and BGM
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (specialModeActive && !isBattleOver) {
      setCurrentBgm(YUJI_SPECIAL_BGM);
      
      interval = setInterval(() => {
        updateBattleState(prev => {
          const newTime = prev.specialModeTimer + 1;
          if (newTime >= 40) {
            setCurrentBgm(BATTLE_BGM);
            addComment('システム', 'ゆうじ確変モードが終了した', true);
            return {
              ...prev,
              specialModeTimer: 0,
              specialModeActive: false
            };
          }
          return {
            ...prev,
            specialModeTimer: newTime
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [specialModeActive, isBattleOver, addComment]);
  
  // Update BGM when battle result changes
  useEffect(() => {
    if (battleResult === 'victory') {
      setCurrentBgm(VICTORY_BGM);
    } else if (battleResult === 'defeat') {
      setCurrentBgm(DEFEAT_BGM);
    }
  }, [battleResult]);
  
  // Display skip button after battle is over with some delay
  useEffect(() => {
    let skipButtonTimer: NodeJS.Timeout | null = null;
    
    if (isBattleOver) {
      const delay = battleResult === 'victory' ? 10000 : 15000;
      skipButtonTimer = setTimeout(() => {
        updateBattleState({ showSkipButton: true });
      }, delay);
    }
    
    return () => {
      if (skipButtonTimer) clearTimeout(skipButtonTimer);
    };
  }, [isBattleOver, battleResult]);

  // Clean up redirect timer on component unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
      pauseBattleTimer();
    };
  }, [redirectTimer, pauseBattleTimer]);
  
  // Activate Yuji's special mode
  const activateYujiSpecialMode = useCallback(() => {
    updateBattleState({ yujiInSpecialMode: true });
    setYujiSpecialMode(true);
    
    addComment('ゆうじ＠陽気なおじさん', 'もう一回デザフェス出るから、みんなお金で応援して！！お願い！！');
    
    setTimeout(() => {
      addComment('システム', 'ゆうじはクラウドファンディングを発動した', true);
      addComment('システム', 'ゆうじのHPゲージが満タンになった', true);
      addComment('システム', 'ゆうじは特性「のれんに腕押し」を発動した', true);
      updateBattleState({ specialModeActive: true });
      setOpponentHp(opponent2.maxHp);
    }, 1000);
  }, [addComment, opponent2.maxHp, setYujiSpecialMode]);
  
  // クリック処理のスロットリングチェックを追加したスキップハンドラー
  const handleSkip = useCallback(() => {
    const now = Date.now();
    if (now - lastClickRef.current < MIN_CLICK_INTERVAL) return;
    lastClickRef.current = now;
    
    if (!isBattleOver) return;
    
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    
    pauseBattleTimer();
    setSoundEffect(BUTTON_SOUND);
    
    if (battleResult === 'victory') {
      handleScreenTransition('victory2');
      navigate('/victory2');
    } else if (battleResult === 'defeat') {
      handleScreenTransition('result2');
      navigate('/result2');
    }
  }, [isBattleOver, redirectTimer, pauseBattleTimer, battleResult, handleScreenTransition, navigate]);
  
  // クリック処理のスロットリングチェックを追加したメニューボタンハンドラー
  const handleMenuButtonClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickRef.current < MIN_CLICK_INTERVAL) return;
    lastClickRef.current = now;
    
    e.stopPropagation();
    setShowWarning(true);
    
    const warningTimeout = setTimeout(() => {
      setShowWarning(false);
    }, 3000);
    
    // ここでは timeoutsRef を使用
    // eslint-disable-next-line react-hooks/exhaustive-deps
    timeoutsRef.current.push(warningTimeout);
  }, []);
  
  // soundEffectPlayer: キーに Date.now() の代わりに soundEffect をそのまま使用
  const soundEffectPlayer = useMemo(() => {
    return soundEffect ? (
      <AudioPlayer 
        src={soundEffect} 
        loop={false} 
        autoPlay={true} 
        volume={0.7}
        id="battle2-effect"
        key={soundEffect}
        onEnded={() => setSoundEffect(null)}
      />
    ) : null;
  }, [soundEffect]);

  // 各種コンポーネントのキャッシュ（省略）
  const gaugesDisplayComponent = useMemo(() => (
    <GaugesDisplay 
      player={player}
      opponent={{...opponent2, currentHp: opponentHp}}
      attackCount={attackCount}
      sosoHealMode={false}
    />
  ), [player, opponent2, opponentHp, attackCount]);

  const portraitsComponent = useMemo(() => (
    <CharacterPortraits 
      player={player}
      opponent={{...opponent2, currentHp: opponentHp}}
      onCharacterClick={handleCharacterClick}
      sosoHealMode={false}
    />
  ), [player, opponent2, opponentHp, handleCharacterClick]);

  const battleActionsComponent = useMemo(() => (
    <BattleActions 
      isPlayerTurn={isPlayerTurn}
      isBattleOver={isBattleOver}
      specialAttackAvailable={specialAttackAvailable}
      onAttack={handlePlayerAttack}
      onSpecial={handlePlayerSpecial}
      onRunAway={handleRunAway}
      onHighball={handleHighball}
    />
  ), [
    isPlayerTurn, isBattleOver, specialAttackAvailable,
    handlePlayerAttack, handlePlayerSpecial, handleRunAway, handleHighball
  ]);

  return (
    <MobileContainer backgroundGradient={battleBackgroundGradient}>
      <div 
        className="flex flex-col h-full p-2 sm:p-4 text-white relative"
        style={{ 
          background: battleBackgroundGradient,
          fontFamily: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Main BGM */}
        <AudioPlayer 
          src={currentBgm}
          loop={battleResult === null}
          autoPlay={true}
          volume={0.7}
          id="battle2-bgm"
          key={`battle-bgm-${currentBgm}`}
        />

        {soundEffectPlayer}
        
        <PlayerInfo 
          name="とおる＠経営参謀" 
          icon={player.icon}
          battleTimer={battleTimer}
          title="さよなら！陽気なおじさん！！"
        />
        
        {gaugesDisplayComponent}
        
        {portraitsComponent}
        
        {specialModeActive && (
          <div className="absolute top-1/4 left-0 right-0 flex justify-center">
            <div className="animate-pulse text-yellow-300 text-xl font-bold bg-black/50 px-4 py-2 rounded-full">
              ゆうじ、クラファン中！！
            </div>
          </div>
        )}
        
        <div className="flex-1 mb-1 sm:mb-2 h-[20vh] sm:h-[25vh] overflow-hidden">
          <CommentArea comments={comments} />
        </div>
        
        <div className="mt-auto">
          {battleActionsComponent}
          <CommentInput />
        </div>
        
        {showSkipButton && (
          <Button
            onClick={handleSkip}
            className="absolute bottom-16 sm:bottom-20 right-3 sm:right-6 z-20 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md animate-pulse flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            style={{ position: 'absolute' }}
          >
            <SkipForward size={isMobile ? 16 : 20} />
            スキップ
          </Button>
        )}
        
        <button
          onClick={toggleBgm}
          className="absolute top-3 sm:top-6 right-3 sm:right-6 z-20 bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-full hover:bg-white/20 transition-colors"
        >
          {bgmEnabled ? 
            <Volume2 size={isMobile ? 20 : 24} color="white" /> : 
            <VolumeX size={isMobile ? 20 : 24} color="white" />
          }
        </button>
        
        {showCharacterSheet && (
          <CharacterSheet 
            character={currentCharacterSheet} 
            onClose={() => setShowCharacterSheet(false)} 
          />
        )}
      </div>
    </MobileContainer>
  );
};

export default React.memo(Battle2Screen);

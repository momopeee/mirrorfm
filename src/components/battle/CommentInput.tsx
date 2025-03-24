
import React, { useState, useCallback, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const CommentInput: React.FC = () => {
  const [comment, setComment] = useState('');
  const { addComment, player, setPlayer } = useApp();
  const location = useLocation();
  const isBattle2 = location.pathname === '/battle2';

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      // Use the specified listener name
      addComment("巨万の富男", comment, false);
      
      // Calculate HP recovery based on comment length
      // Longer comments recover more HP, with a min of 1 and max of 15
      const recoveryAmount = Math.min(Math.max(Math.floor(comment.length / 5), 1), 15);
      
      // Only recover if player HP isn't already at max
      if (player.currentHp < player.maxHp) {
        // レースコンディションを避けるためにfunctional updateパターンを使用
        setPlayer(prevPlayer => {
          // Calculate new HP but don't exceed max HP
          const newHp = Math.min(prevPlayer.currentHp + recoveryAmount, prevPlayer.maxHp);
          
          // システムメッセージを追加（ここに配置して確実に最新のHPを参照できるようにする）
          addComment("システム", `リスナーの応援でとおるの体力が${recoveryAmount}回復した！`, true);
          
          // Update player HP
          return {
            ...prevPlayer,
            currentHp: newHp
          };
        });
      }
      
      setComment('');
    }
  }, [comment, player.currentHp, player.maxHp, addComment, setPlayer]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  }, []);

  // Memoize button disabled state
  const isSubmitDisabled = !comment.trim();

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
      <Input
        type="text"
        placeholder="コメント"
        className="flex-1 bg-gray-200 text-black rounded-full px-4 py-2 border-none"
        value={comment}
        onChange={handleChange}
        style={{ 
          height: '40px',
          minHeight: '40px'
        }}
      />
      <Button
        type="submit"
        className="bg-pink-500 text-white rounded-full px-6 hover:bg-pink-600 transition-colors"
        disabled={isSubmitDisabled}
        style={{
          minWidth: '80px',
          height: '40px'
        }}
      >
        送信
      </Button>
    </form>
  );
};

export default memo(CommentInput);

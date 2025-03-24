
import React, { useEffect, useRef } from 'react';
import { Comment } from '@/context/AppContext';

interface CommentAreaProps {
  comments: Comment[];
}

const CommentArea: React.FC<CommentAreaProps> = ({ comments }) => {
  const commentAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new comments
  useEffect(() => {
    if (commentAreaRef.current) {
      commentAreaRef.current.scrollTop = commentAreaRef.current.scrollHeight;
    }
  }, [comments]);

  return (
    <div 
      ref={commentAreaRef}
      className="rounded-md p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent h-full"
    >
      <div className="flex flex-col gap-2">
        {comments.map((comment, index) => (
          <div key={index} className={`flex items-start gap-2 ${comment.isSystem ? 'text-white' : 'text-white'}`}>
            {!comment.isSystem && (
              <>
                <img 
                  src={comment.author === "とおる＠経営参謀" ? "/lovable-uploads/da232b1a-dd62-447f-89f0-799e9e8c150a.png" : 
                       comment.author === "そーそー＠狂犬ツイート" ? "/lovable-uploads/b62bfeb2-59a1-4f1b-976a-d026638e0416.png" : 
                       comment.author === "ゆうじ＠陽気なおじさん" ? "/lovable-uploads/988ea3ef-2efe-4616-a292-04d0d01fb33c.png" :
                       comment.author === "巨万の富男" ? "/lovable-uploads/974ddb88-2c8c-4955-bf82-0d68af6e6e7f.png" :
                       "/lovable-uploads/656bd67f-53fe-4f15-86f3-0db149cc7285.png"}
                  alt={comment.author}
                  className="w-8 h-8 rounded-full mt-1"
                />
                <div className="flex-1">
                  <span className="text-[11px] font-bold jp-text">{comment.author}</span>
                  <div className="bg-black/30 p-2 rounded-md mt-1 mb-1">
                    <p className="text-[12px] font-normal jp-text">{comment.text}</p>
                  </div>
                </div>
              </>
            )}
            {comment.isSystem && (
              <span className="bg-black/30 w-full p-2 rounded text-[12px] font-normal jp-text">{comment.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentArea;

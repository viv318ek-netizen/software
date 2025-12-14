import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface PromptInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
      <div className="relative flex items-center bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden p-1">
        <div className="pl-3 text-gray-400">
           <Sparkles size={20} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the website you want to build..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 h-12 px-4 outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-200 
            ${input.trim() && !isLoading 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

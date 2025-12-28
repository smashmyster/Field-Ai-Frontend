import { useState } from 'react';
import { InfoSource } from '@/types';
import { apiClient } from '@/utils/apiClient';
import { useSocket } from '@/context/SocketContext';

export interface SearchResult {
  query: string;
  answer: string;
  conversationId: string;
  
  sources: InfoSource[];
}

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState<string[]>([]);
  
  const {socket} = useSocket();
  const searchDocs = async (query: string, conversationId?: string, artifactId?: string, isVoiceMode?: boolean) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setThinkingProcess([]);
    
    // Thinking process animation
    socket?.on('ai-thinking', (step: string) => {
      setThinkingProcess(prev => [...prev, step]);
      console.log('Thinking process:', step);
    });
//    let stepIndex = 0;
    // const thinkingInterval = setInterval(() => {
    //   if (stepIndex < thinkingSteps.length) {
    //     setThinkingProcess(prev => [...prev, thinkingSteps[stepIndex]]);
    //     stepIndex++;
        
    //     // Auto-scroll when thinking process updates
    //     setTimeout(() => {
    //       const container = document.querySelector('.overflow-y-auto');
    //       if (container) {
    //         container.scrollTop = container.scrollHeight;
    //       }
    //     }, 50);
    //   } else {
    //     clearInterval(thinkingInterval);
    //   }
    // }, 800);

    try {
      const result = await apiClient.post('/agent/plan', {
        message: query,
        conversationId: conversationId,
        artifactId: artifactId,
        isVoiceMode: isVoiceMode
      });

      console.log('Search results:', result);
      
      // Auto-scroll to bottom when result arrives
      setTimeout(() => {
        const container = document.querySelector('.overflow-y-auto');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
      
      return result;
      
    } catch (error) {
      console.error('Search error:', error);
      // Don't clear results on error, keep existing ones
    } finally {
      // clearInterval(thinkingInterval);
      socket?.off('ai-thinking');
      setIsSearching(false);
      setThinkingProcess([]);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    thinkingProcess,
    searchDocs,
    clearResults
  };
};

"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ChatMessages } from '@/components/ChatMessages';
import { InputBar } from '@/components/InputBar';
import { DragDropWrapper } from '@/components/DragDropWrapper';
import { TopBar } from '@/components/TopBar';
import { useSocket } from '@/context/SocketContext';
import { ETools, ITool, Message } from '@/types';
import { X, ExternalLink, Download, FileText, Volume2, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { useSearch } from '@/hooks/useSearch';
import { API_BASE_URL } from '@/types/contstants';

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const { isSearching, thinkingProcess, searchDocs } = useSearch();
  const { socket } = useSocket();


  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [sourcesPanelOpen, setSourcesPanelOpen] = useState(false);
  const [currentSources, setCurrentSources] = useState<[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<ITool | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ id?: string; artifactId?: string; imageUrl?: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Function to refresh conversation messages
  const refreshMessages = async () => {
    try {
      const data = await apiClient.get<Message[]>(`/conversation/${conversationId}`);
      setChatMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to refresh conversation messages:', error);
    }
  };

  useEffect(() => {
    apiClient.get<Message[]>(`/conversation/${conversationId}`)
      .then(data => {
        setChatMessages(data);
        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
      })
      .catch(error => {
        console.error('Failed to fetch conversation messages:', error);
        setChatMessages([]);
      });
  }, [conversationId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [chatMessages]);

  // Listen for socket events to refresh messages
  useEffect(() => {
    if (!socket) return;

    const handleConversationMessage = (data: Message) => {
      console.log('Received conversation message:', data);
      if (data.conversationId === conversationId) {
        refreshMessages();
      }
    };

    const handleConversationUpdated = (data: Message) => {
      console.log('Received conversation updated:', data);
      if (data.conversationId === conversationId) {
        refreshMessages();
      }
    };

    // Listen for conversation message events
    socket.on('conversations.message', handleConversationMessage);
    socket.on('conversations.updated', handleConversationUpdated);

    return () => {
      socket.off('conversations.message', handleConversationMessage);
      socket.off('conversations.updated', handleConversationUpdated);
    };
  }, [socket, conversationId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        setIsAudioPlaying(false);
      }
    };
  }, []);
  // Handle search with text input
  const handleSend = async (tool?: ITool | null, query?: string, isVoiceModeParam?: boolean) => {
    const trimmed = query && query.trim() != "" ? query : text.trim();
    
    // Use the passed isVoiceMode parameter, or fall back to state
    const shouldUseVoiceMode = isVoiceModeParam !== undefined ? isVoiceModeParam : isVoiceMode;
    
    // Update state if parameter was provided
    if (isVoiceModeParam !== undefined) {
      setIsVoiceMode(isVoiceModeParam);
    }

    if (tool) {
      if (!trimmed) {
        return;
      }

      let tempUserMessage: Message | null = null;
      if (trimmed) {
        // Include uploaded image as source if available
        const sources = uploadedImage && uploadedImage.imageUrl && uploadedImage.artifactId
          ? [{
              id: uploadedImage.id || Date.now(),
              artifactId: uploadedImage.artifactId,
              imageUrl: uploadedImage.imageUrl,
            }]
          : [];

        tempUserMessage = {
          id: `temp-${Date.now()}`,
          conversationId,
          content: trimmed,
          role: 'user',
          createdAt: new Date(),
          sources: sources,
          source: sources,
        };
        setChatMessages((prev) => [...prev, tempUserMessage!]);
        setTimeout(scrollToBottom, 100);
      }

      setText('');

      // try {
      //   const response = await executeTool(tool, {
      //     input: trimmed || undefined,
      //     conversationId,
      //     fileIds,
      //   });

      //   // With the new approach, the backend saves the tool result as a message
      //   // Refresh the conversation messages to get the latest tool result
      //   if (conversationId) {
      //     console.log('Tool executed successfully, refreshing conversation messages');
      //     // Wait a moment for the backend to save the message, then refresh
      //     setTimeout(() => {
      //       refreshMessages();
      //     }, 500);
      //   } else {
      //     // For cases without conversationId, still add the message manually
      //     const toolMessage: Message = {
      //       id: `tool-${Date.now()}`,
      //       conversationId,
      //       content: response.message || 'Tool executed.',
      //       role: 'assistant',
      //       createdAt: new Date(),
      //       source: response.sources ?? [],
      //     };

      //     setChatMessages((prev) => [...prev, toolMessage]);
      //     if (toolMessage.source?.length) {
      //       setCurrentSources(toolMessage.source);
      //     }
      //   }
      // } catch (error) {
      //   console.error('Tool execution failed:', error);
      //   const errorMessage: Message = {
      //     id: `tool-error-${Date.now()}`,
      //     conversationId,
      //     content: `Tool failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      //     role: 'assistant',
      //     createdAt: new Date(),
      //     source: [],
      //   };
      //   setChatMessages((prev) => [...prev, errorMessage]);
      // }

      // setSelectedTool(null);
      // setTimeout(scrollToBottom, 100);
      // return;
    }

    if (trimmed && !isSearching) {
      // Include uploaded image as source if available
      const sources = uploadedImage && uploadedImage.imageUrl && uploadedImage.artifactId
        ? [{
            id: uploadedImage.id || Date.now(),
            artifactId: uploadedImage.artifactId,
            imageUrl: uploadedImage.imageUrl,
          }]
        : [];

      // Clear uploaded image immediately when sending message
      const artifactId = uploadedImage ? uploadedImage.artifactId : undefined;
      setUploadedImage(null);

      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        content: trimmed,
        role: 'user',
        createdAt: new Date(),
        sources: sources,
        source: sources,
      };
      console.log('User message:', userMessage);
      setChatMessages((prev) => [...prev, userMessage]);
      setTimeout(scrollToBottom, 100);

      setText('');

      try {
        const response: any = await searchDocs(trimmed, conversationId, artifactId, shouldUseVoiceMode);
        console.log("response", response);
        if (response) {
          const responseMessage: Message = {
            id: `temp-${Date.now()}`,
            conversationId,
            content: response.answer,
            role: 'assistant',
            createdAt: new Date(),
            audioPath: response.audioPath,
          };
          console.log("response.audioPath", response.audioPath);
          if (response.audioPath) {
            responseMessage.audioPath = response.audioPath;
            // Only auto-play audio if in voice mode
            console.log("shouldUseVoiceMode", shouldUseVoiceMode);
            if (shouldUseVoiceMode) {
              const audio = new Audio(response.audioPath);
              audio.volume = 1.0;
              
              // Track audio playback state
              currentAudioRef.current = audio;
              setIsAudioPlaying(true);
              
              audio.addEventListener('ended', () => {
                setIsAudioPlaying(false);
                currentAudioRef.current = null;
              });
              
              audio.addEventListener('pause', () => {
                setIsAudioPlaying(false);
              });
              
              audio.addEventListener('play', () => {
                setIsAudioPlaying(true);
              });
              
              audio.play().catch((err) => {
                console.error("Playback failed:", err);
                setIsAudioPlaying(false);
                currentAudioRef.current = null;
              });
            }
          }
          setChatMessages((prev) => [...prev, responseMessage as Message]);

          setTimeout(scrollToBottom, 100);

          // Dispatch custom event to refresh sidebar when conversation might be updated
          if (conversationId) {
            window.dispatchEvent(new CustomEvent('conversation-updated', { 
              detail: { conversationId: conversationId } 
            }));
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setChatMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleImageUpload = async (file: File) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.uploadFile<{ id: string; artifactId: string; imageUrl: string }>(
        '/agent/upload-image',
        formData
      );
      
      setUploadedImage({
        id: response.id,
        artifactId: response.artifactId,
        imageUrl: response.imageUrl,
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleImageUpload(files[0]);
    }
  };


  return (
    <DragDropWrapper
      isDragOver={isDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 " style={{ backgroundColor: '#212121' }}>
        <h1 className="text-white text-xl font-semibold">Chat - {conversationId}</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSourcesPanelOpen(!sourcesPanelOpen)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
          </button>
        </div>
      </div>

      {/* Main content with sources panel */}
      <div className="flex-1 flex" style={{ backgroundColor: '#212121' }}>
        {/* Main chat area */}
        <div className="flex-1 overflow-auto p-6 relative" style={{ backgroundColor: '#212121' }}>
          {/* Chat messages area - scrollable */}
          <ChatMessages
            messages={chatMessages}
            thinkingProcess={thinkingProcess}
            onShowSources={() => { }}
          />

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <div className="absolute bottom-24 left-6 right-6 max-w-4xl mx-auto z-40">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 flex items-center gap-4">
                <div className="relative flex-shrink-0 w-20 h-20">
                  {uploadedImage.imageUrl && (
                    <Image
                      src={uploadedImage.imageUrl.startsWith('http') ? uploadedImage.imageUrl : `${API_BASE_URL}${uploadedImage.imageUrl}`}
                      alt="Uploaded"
                      width={80}
                      height={80}
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-white text-xs">Uploading...</div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon size={16} className="text-gray-300" />
                    <span className="text-white text-sm font-medium truncate">Image uploaded</span>
                  </div>
                  <span className="text-gray-400 text-xs">Ready to send with your message</span>
                </div>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Remove image"
                >
                  <X size={18} className="text-gray-300 hover:text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Input bar - fixed at bottom */}
          <InputBar
            text={text}
            setText={setText}
            onSend={handleSend}
            isBusy={isSearching}
            attachedFiles={[]}
            isUploading={false}
            onRemoveFile={() => { }}
            onClearAllFiles={() => { }}
            selectedTool={selectedTool}
            onToolSelected={setSelectedTool}
            isRecordingDisabled={isAudioPlaying || isSearching}
            onImageSelect={handleImageUpload}
            isVoiceMode={isVoiceMode}
            setIsVoiceMode={setIsVoiceMode}
          />
        </div>

        {/* Sources Panel */}
        {sourcesPanelOpen && (
          <div className="w-80 border-l border-gray-700 flex flex-col">
            {/* Sources Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-t border-gray-700">
              <div>
                <h3 className="text-white font-semibold text-lg">Sources</h3>
              </div>
              <button
                onClick={() => setSourcesPanelOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>


          </div>
        )}
      </div>

      {/* Tools palette */}

    </DragDropWrapper>
  );
}

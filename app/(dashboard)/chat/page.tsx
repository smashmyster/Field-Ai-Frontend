"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessages } from '@/components/ChatMessages';
import { InputBar } from '@/components/InputBar';
import { DragDropWrapper } from '@/components/DragDropWrapper';
import { TopBar } from '@/components/TopBar';
import { useSocket } from '@/context/SocketContext';
import { ITool, Message } from '@/types';
import { apiClient } from '@/utils/apiClient';
import { useSearch } from '@/hooks/useSearch';
import { API_BASE_URL } from '@/types/contstants';
import { X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function ChatPage() {
  const router = useRouter();
  const { isSearching, thinkingProcess, searchDocs } = useSearch();
  const { socket } = useSocket();

  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedTool, setSelectedTool] = useState<ITool | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ id?: string; artifactId?: string; imageUrl?: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [chatMessages]);

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
  const handleSend = async (tool?: ITool | null, query?: string) => {
    const trimmed = query && query.trim() != "" ? query : text.trim();
    
    // If query is provided (from voice), enable voice mode
    // If text is typed manually, disable voice mode
    if (query) {
      setIsVoiceMode(true);
    } else if (text.trim()) {
      setIsVoiceMode(false);
    }

    if (tool) {
      if (!trimmed) {
        return;
      }
      setText('');
      return;
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
        conversationId: undefined,
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
        const response: any = await searchDocs(trimmed, undefined, artifactId);
        console.log("response", response);
        if (response) {
          const conversationId = response.conversation?.id || response.conversationId;
          const responseMessage: Message = {
            id: `temp-${Date.now()}`,
            conversationId: conversationId,
            content: response.answer,
            role: 'assistant',
            createdAt: new Date(),
            audioPath: response.audioPath,
          };
          
          setChatMessages((prev) => [...prev, responseMessage as Message]);
          setTimeout(scrollToBottom, 100);

          // Navigate to conversation page when response arrives
          if (conversationId) {
            // Dispatch custom event to refresh sidebar
            window.dispatchEvent(new CustomEvent('conversation-updated', { 
              detail: { conversationId: conversationId } 
            }));
            router.push(`/chat/${conversationId}`);
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
      <TopBar title="Chat" />

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6 relative" style={{ backgroundColor: '#212121' }}>
        {/* Chat messages area - scrollable */}
        <div ref={messagesContainerRef}>
          <ChatMessages
            messages={chatMessages}
            thinkingProcess={thinkingProcess}
            onShowSources={() => { }}
          />
        </div>

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
          onRemoveFile={() => { } }
          onClearAllFiles={() => { } }
          selectedTool={selectedTool}
          onToolSelected={setSelectedTool}
          isRecordingDisabled={isAudioPlaying || isSearching}
          onImageSelect={handleImageUpload} isVoiceMode={false} setIsVoiceMode={function (isVoiceMode: boolean): void {
            throw new Error('Function not implemented.');
          } }        />
      </div>
    </DragDropWrapper>
  );
}

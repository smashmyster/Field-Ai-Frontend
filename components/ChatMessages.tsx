import { Message } from '@/types';
import { useEffect, useRef } from 'react';
import Markdown from './Markdown';
import { FileText, Volume2, Download } from 'lucide-react';
import Image from 'next/image';

interface ChatMessagesProps {
  messages: Message[];
  thinkingProcess: string[];
  onShowSources: (messageId: string, sources: any[]) => void;
}

export const ChatMessages = ({ messages, thinkingProcess, onShowSources }: ChatMessagesProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('audio/')) return Volume2;
    if (mimeType.startsWith('image/')) return FileText;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
    return FileText;
  };

  // Scroll to bottom when messages or thinking process change
  useEffect(() => {
    if (messagesContainerRef.current && (messages.length > 0 || thinkingProcess.length > 0)) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, thinkingProcess]);

  return (
    <div ref={messagesContainerRef} className="w-full max-h-[70vh] overflow-y-auto">
      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.map((message, messageIndex) => {
            if(message.role === "user") {
            }
            return (
            <div key={messageIndex} className="space-y-8">
              {/* Query on the right */}
              {message.role === "user" ? (
                <div className="text-white text-md text-right">
                   {message.messageAttachments && message.messageAttachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2 justify-end ">
                        {message.messageAttachments.map((attachment, index) => {
                          const FileIcon = getFileIcon(attachment.mimeType);
                          return (
                            <div key={index} className="flex items-center gap-2 bg-[#111112]rounded-lg px-3 py-2 text-sm hover:bg-gray-600 transition-colors bg-[#2E2E2E] rounded-xl p-4 min-w-[20vh] justify-between">
                              <FileIcon size={16} className="text-blue-400" />
                              <div className="flex flex-col">
                                <span className="text-white font-medium truncate max-w-[200px]">
                                  {attachment.name}
                                </span>
                              
                              </div>
                              <button
                                onClick={() => window.open(attachment.path, '_blank')}
                                className="ml-2 p-1 rounded hover:bg-gray-600 transition-colors"
                                title="Download file"
                              >
                                <Download size={14} className="text-gray-400" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  <div className="bg-[#2E2E2E] rounded-xl p-4 inline-block max-w-full">
                    <span className="text-sm">{message.content}</span>
                  </div>
                  {/* Display images from sources */}
                  {(() => {
                    const sources = message.sources || message.source || [];
                    const imageSources = sources.filter(s => s.imageUrl);
                    return imageSources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 justify-end">
                        {imageSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.imageUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                          >
                            <Image
                              src={source.imageUrl!}
                              alt="Message image"
                              width={128}
                              height={128}
                              className="object-cover"
                              unoptimized
                            />
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <div className="max-w-[80vw]">
                    <Markdown content={message.content} />
                  </div>
                  
                  {/* Display images from sources */}
                  {(() => {
                    const sources = message.sources || message.source || [];
                    const imageSources = sources.filter(s => s.imageUrl);
                    return imageSources.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {imageSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.imageUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-48 h-48 rounded-lg overflow-hidden border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                          >
                            <Image
                              src={source.imageUrl!}
                              alt="Message image"
                              width={192}
                              height={192}
                              className="object-cover"
                              unoptimized
                            />
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                  
                  {/* Sources button and sources display */}
                  {(message.source || message.sources) && (message.source || message.sources)!.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => onShowSources(message.id, (message.source || message.sources) || [])}
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <FileText size={16} />
                        <span>Sources ({(message.source || message.sources)!.length})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          )}
        </div>
      )}

      {/* Thinking process - below messages */}
      {thinkingProcess.length > 0 && (
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-gray-300 text-sm">
                {thinkingProcess[thinkingProcess.length - 1]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


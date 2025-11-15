import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageCircle, X, Send, Bot, User, Settings, ChevronDown, ChevronUp, Volume2, VolumeX, Square, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRoleSettingsOpen, setIsRoleSettingsOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [tempRole, setTempRole] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là AI Assistant được hỗ trợ bởi Gemini. Tôi có thể giúp bạn về các công cụ AI, tạo prompt, hoặc bất kỳ câu hỏi nào khác. Bạn cần hỗ trợ gì?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for chat input from prompt generator
    const chatInput = document.getElementById("chat-input") as HTMLInputElement;
    if (chatInput) {
      const handleInput = () => {
        if (chatInput.value && !isOpen) {
          setIsOpen(true);
          setInputValue(chatInput.value);
          chatInput.value = "";
        }
      };
      
      chatInput.addEventListener("focus", handleInput);
      return () => chatInput.removeEventListener("focus", handleInput);
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for toggle chat event from overview section
    const handleToggleChat = () => {
      setIsOpen(prev => !prev);
    };
    
    window.addEventListener("toggleFloatingChat", handleToggleChat);
    return () => window.removeEventListener("toggleFloatingChat", handleToggleChat);
  }, []);

  useEffect(() => {
    // Load current role from localStorage
    const savedRole = localStorage.getItem('selectedRolePrompt');
    if (savedRole) {
      setCurrentRole(savedRole);
      setTempRole(savedRole);
    }
  }, []);

  const updateRole = () => {
    localStorage.setItem('selectedRolePrompt', tempRole);
    setCurrentRole(tempRole);
    setIsRoleSettingsOpen(false);
    
    // Trigger event to sync with external component
    window.dispatchEvent(new CustomEvent('roleUpdated'));
    
    toast({
      title: "Đã cập nhật vai trò",
      description: "Vai trò mới sẽ áp dụng cho tin nhắn tiếp theo",
    });
  };

  const resetRole = () => {
    setTempRole("");
    localStorage.removeItem('selectedRolePrompt');
    setCurrentRole("");
    setIsRoleSettingsOpen(false);
    
    // Trigger event to sync with external component
    window.dispatchEvent(new CustomEvent('roleUpdated'));
    
    toast({
      title: "Đã reset vai trò",
      description: "Sử dụng vai trò mặc định",
    });
  };

  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    gender: 'female' as 'male' | 'female',
    language: 'vi' as 'vi' | 'en',
    voice: 'rachel' as string
  });

  // Voice options for different genders and languages
  const getVoiceOptions = () => {
    if (voiceSettings.language === 'vi') {
      return {
        female: ['rachel', 'bella', 'domi'],
        male: ['adam', 'sam', 'daniel']
      };
    } else {
      return {
        female: ['rachel', 'bella', 'domi', 'elli', 'grace'],
        male: ['adam', 'sam', 'daniel', 'josh', 'arnold']
      };
    }
  };

  // Load voice settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('voiceSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setVoiceSettings(prev => ({ ...prev, ...settings }));
      } catch (error) {
        console.error('Error loading voice settings:', error);
      }
    }
  }, []);

  // Save voice settings to localStorage
  const updateVoiceSettings = (newSettings: Partial<typeof voiceSettings>) => {
    const updated = { ...voiceSettings, ...newSettings };
    setVoiceSettings(updated);
    localStorage.setItem('voiceSettings', JSON.stringify(updated));
  };

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
  };

  const playTextToSpeech = async (text: string) => {
    if (!isTtsEnabled) return;
    
    // Stop any currently playing audio
    stopCurrentAudio();
    
    try {
      const voiceOptions = getVoiceOptions();
      const availableVoices = voiceOptions[voiceSettings.gender];
      const selectedVoice = availableVoices.includes(voiceSettings.voice) 
        ? voiceSettings.voice 
        : availableVoices[0];

      const response = await apiRequest("POST", "/api/tts", { 
        text: text.substring(0, 800), // Increased limit for better coverage
        voice: selectedVoice,
        language: voiceSettings.language
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.audio) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          setCurrentAudio(audio);
          
          audio.onended = () => setCurrentAudio(null);
          audio.onerror = () => {
            setCurrentAudio(null);
            console.error("Audio playback error");
          };
          
          await audio.play();
        }
      } else {
        throw new Error(`TTS API error: ${response.status}`);
      }
    } catch (error) {
      console.error("TTS error:", error);
      toast({
        title: "Lỗi Text-to-Speech",
        description: "Không thể phát âm thanh. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      setIsStreaming(true);
      setStreamingMessage("");
      
      // Add placeholder message for streaming
      const assistantMessageId = Date.now().toString() + "_assistant";
      const placeholderMessage: Message = {
        id: assistantMessageId,
        text: "",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, placeholderMessage]);

      // Get custom role from localStorage
      const customRole = localStorage.getItem('selectedRolePrompt');
      
      const response = await apiRequest("POST", "/api/chat", { 
        message,
        customRole: customRole || undefined
      });
      const data = await response.json();
      
      // Simulate streaming effect
      const fullText = data.response;
      let currentText = "";
      
      for (let i = 0; i < fullText.length; i++) {
        // Check if user requested to stop
        if (shouldStop) {
          // Update final message with current text and mark as complete
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, text: currentText + " [Đã dừng]" }
                : msg
            )
          );
          setShouldStop(false);
          setIsStreaming(false);
          setStreamingMessage("");
          return data;
        }
        
        currentText += fullText[i];
        setStreamingMessage(currentText);
        
        // Update the message in real-time
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, text: currentText }
              : msg
          )
        );
        
        // Random delay between 20-50ms for natural typing effect
        await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
      }
      
      setIsStreaming(false);
      setStreamingMessage("");
      
      // Auto-play TTS if enabled
      if (isTtsEnabled && fullText) {
        playTextToSpeech(fullText);
      }
      
      return data;
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsStreaming(false);
      setStreamingMessage("");
      
      const errorMessage: Message = {
        id: Date.now().toString() + "_error",
        text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối với AI assistant.",
        variant: "destructive",
      });
    },
  });

  const sendMessage = () => {
    const message = inputValue.trim();
    if (!message) return;

    const userMessage: Message = {
      id: Date.now().toString() + "_user",
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    chatMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-chat">
      {isOpen && (
        <div className="chat-window active">
          <div className="bg-primary text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              <span className="font-semibold">🤖 AI Assistant - Gemini</span>
            </div>
            <div className="flex items-center gap-2">
              {currentAudio && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopCurrentAudio}
                  className="text-white hover:bg-white/20"
                  title="Dừng phát âm thanh"
                >
                  <Square className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                className="text-white hover:bg-white/20"
                title={isTtsEnabled ? "Tắt text-to-speech" : "Bật text-to-speech"}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVoiceSettingsOpen(!isVoiceSettingsOpen)}
                className="text-white hover:bg-white/20"
                title="Cài đặt giọng nói"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsRoleSettingsOpen(!isRoleSettingsOpen)}
                className="text-white hover:bg-white/20"
                title="Cài đặt vai trò AI"
              >
                <Bot className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleChat}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Voice Settings Panel */}
          {isVoiceSettingsOpen && (
            <div className="border-b bg-card p-3">
              <h4 className="text-sm font-medium mb-3">Cài đặt giọng nói</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Giới tính</label>
                  <Select 
                    value={voiceSettings.gender} 
                    onValueChange={(value: 'male' | 'female') => updateVoiceSettings({ gender: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="male">Nam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-1 block">Ngôn ngữ</label>
                  <Select 
                    value={voiceSettings.language} 
                    onValueChange={(value: 'vi' | 'en') => updateVoiceSettings({ language: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="text-xs font-medium mb-1 block">Giọng nói</label>
                <Select 
                  value={voiceSettings.voice} 
                  onValueChange={(value: string) => updateVoiceSettings({ voice: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getVoiceOptions()[voiceSettings.gender].map((voice) => (
                      <SelectItem key={voice} value={voice}>
                        {voice.charAt(0).toUpperCase() + voice.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => {
                  const testText = voiceSettings.language === 'vi' 
                    ? "Xin chào! Đây là giọng nói thử nghiệm." 
                    : "Hello! This is a voice test.";
                  playTextToSpeech(testText);
                }}
                disabled={!isTtsEnabled}
              >
                <Play className="w-3 h-3 mr-1" />
                Thử giọng nói
              </Button>
            </div>
          )}

          {/* Role Settings Panel */}
          {isRoleSettingsOpen && (
            <div className="border-b bg-card p-3">
              <h4 className="text-sm font-medium mb-2">Tùy chỉnh vai trò AI</h4>
              <Textarea
                placeholder="Nhập vai trò tùy chỉnh cho AI..."
                value={tempRole}
                onChange={(e) => setTempRole(e.target.value)}
                className="text-xs mb-2 min-h-[60px] resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={updateRole} className="flex-1">
                  Cập nhật
                </Button>
                <Button size="sm" variant="outline" onClick={resetRole}>
                  Reset
                </Button>
              </div>
              {currentRole && (
                <p className="text-xs text-muted-foreground mt-2">
                  Đang dùng: {currentRole.length > 50 ? currentRole.substring(0, 50) + '...' : currentRole}
                </p>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? "bg-primary text-white"
                      : "bg-white text-gray-700 border"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!message.isUser && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.isUser && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="mb-4 flex justify-start">
                <div className="bg-white text-gray-700 border p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span className="text-sm">🤖 Đang soạn tin nhắn...</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white rounded-b-xl">
            {isStreaming && (
              <div className="mb-2 flex justify-center">
                <Button
                  onClick={() => setShouldStop(true)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Dừng trả lời
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={sendMessage}
                disabled={chatMutation.isPending || !inputValue.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-button" onClick={toggleChat}>
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, Download, Play, Square, Loader2, Settings, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ElevenLabsSection() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("rachel");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.5]);
  const [style, setStyle] = useState([0.0]);
  const [speakerBoost, setSpeakerBoost] = useState([true]);
  const { toast } = useToast();

  // Lấy danh sách giọng từ server
  const { data: voicesData, isLoading: voicesLoading } = useQuery({
    queryKey: ['/api/voices'],
    retry: false,
  });

  const femaleVoices = [
    { id: "rachel", name: "Rachel", gender: "Female", accent: "American", description: "Giọng nữ chuyên nghiệp", preview: "Xin chào! Tôi là Rachel, trợ lý AI thân thiện của bạn." },
    { id: "bella", name: "Bella", gender: "Female", accent: "American", description: "Giọng nữ ấm áp", preview: "Chào bạn! Tôi là Bella, sẵn sàng làm bạn vui vẻ!" },
    { id: "domi", name: "Domi", gender: "Female", accent: "American", description: "Giọng nữ tự tin", preview: "Xin chào! Tôi là Domi, giọng nói tự tin cho giao tiếp rõ ràng." },
    { id: "elli", name: "Elli", gender: "Female", accent: "American", description: "Giọng nữ trẻ trung", preview: "Chào bạn! Tôi là Elli, nói nhẹ nhàng để bạn cảm thấy thoải mái." },
    { id: "grace", name: "Grace", gender: "Female", accent: "British", description: "Giọng nữ trưởng thành", preview: "Hello! I'm Grace, bringing elegance to every conversation." }
  ];

  const maleVoices = [
    { id: "adam", name: "Adam", gender: "Male", accent: "American", description: "Giọng nam chuyên nghiệp", preview: "Chào buổi tốt! Tôi là Adam, hỗ trợ bạn với các công việc chuyên nghiệp." },
    { id: "sam", name: "Sam", gender: "Male", accent: "American", description: "Giọng nam tự tin", preview: "Chào bạn! Tôi là Sam, giọng nam mạnh mẽ và tự tin." },
    { id: "daniel", name: "Daniel", gender: "Male", accent: "British", description: "Giọng nam điềm tĩnh", preview: "Hello! I'm Daniel, your calm and composed voice companion." },
    { id: "josh", name: "Josh", gender: "Male", accent: "American", description: "Giọng nam năng động", preview: "Chào bạn! Tôi là Josh, bạn đồng hành thân thiện và năng động." },
    { id: "arnold", name: "Arnold", gender: "Male", accent: "American", description: "Giọng nam trầm ấm", preview: "Greetings! I'm Arnold, with a deep and warm voice for you." }
  ];

  const allVoices = [...femaleVoices, ...maleVoices];

  const languages = [
    { id: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { id: "en", name: "English", flag: "🇺🇸" }
  ];

  const ttsMutation = useMutation({
    mutationFn: async ({ text, voice, language, settings }: { 
      text: string; 
      voice: string; 
      language: string;
      settings: {
        stability: number;
        similarityBoost: number;
        style: number;
        speakerBoost: boolean;
      }
    }) => {
      return await apiRequest("/api/tts", { 
        method: "POST",
        body: { 
          text, 
          voice, 
          language,
          voiceSettings: settings
        }
      });
    },
    onSuccess: (data) => {
      if (data.success && data.audio) {
        const audioDataUrl = `data:audio/mpeg;base64,${data.audio}`;
        setAudioUrl(audioDataUrl);
        
        toast({
          title: "Tạo giọng nói thành công",
          description: "Bạn có thể nghe và tải xuống file âm thanh",
        });
      } else {
        throw new Error("Không thể tạo file âm thanh");
      }
    },
    onError: (error) => {
      console.error("TTS error:", error);
      toast({
        title: "Lỗi tạo giọng nói",
        description: "Không thể tạo file âm thanh. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const previewMutation = useMutation({
    mutationFn: async ({ voice, preview }: { voice: string; preview: string }) => {
      return await apiRequest("/api/voice-preview", { 
        method: "POST", 
        body: { voice, preview } 
      });
    },
    onSuccess: (data) => {
      if (data.success && data.audio) {
        const audioDataUrl = `data:audio/mpeg;base64,${data.audio}`;
        const audio = new Audio(audioDataUrl);
        audio.play();
      }
    },
    onError: (error) => {
      console.error("Preview error:", error);
      toast({
        title: "Không thể phát mẫu giọng",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!text.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập văn bản cần chuyển đổi",
        variant: "destructive",
      });
      return;
    }

    ttsMutation.mutate({ text: text.trim(), voice: selectedVoice });
  };

  const handlePlay = () => {
    if (!audioUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    setAudioElement(audio);
    
    audio.onended = () => {
      setIsPlaying(false);
      setAudioElement(null);
    };
    
    audio.play();
    setIsPlaying(true);
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    // Generate random number for filename
    const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    const filename = `Pinky-voice-${randomNum}.mp3`;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Tải xuống thành công",
      description: `File âm thanh được lưu với tên: ${filename}`,
    });
  };

  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  return (
    <section id="elevenlabs" className="mb-16 scroll-mt-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          ElevenLabs Text-to-Speech
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Chuyển đổi văn bản thành giọng nói tự nhiên với công nghệ AI tiên tiến từ ElevenLabs
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-600" />
              Tạo Giọng Nói
            </CardTitle>
            <CardDescription>
              Nhập văn bản và chọn giọng nói để tạo file âm thanh
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Văn bản cần chuyển đổi
              </label>
              <Textarea
                placeholder="Nhập văn bản bạn muốn chuyển thành giọng nói..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {text.length}/500 ký tự
              </p>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Chọn giọng nói
              </label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{voice.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {voice.gender}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedVoiceData && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{selectedVoiceData.name}</span>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {selectedVoiceData.gender}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedVoiceData.accent}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {selectedVoiceData.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewMutation.mutate({ 
                      voice: selectedVoiceData.id, 
                      preview: selectedVoiceData.preview 
                    })}
                    disabled={previewMutation.isPending}
                    className="w-full"
                  >
                    {previewMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Đang phát...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Nghe mẫu giọng nói
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={!text.trim() || ttsMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {ttsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Tạo Giọng Nói
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Kết Quả
            </CardTitle>
            <CardDescription>
              Nghe thử và tải xuống file âm thanh
            </CardDescription>
          </CardHeader>
          <CardContent>
            {audioUrl ? (
              <div className="space-y-4">
                {/* Audio Preview */}
                <div className="bg-muted rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Volume2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-medium mb-2">File âm thanh đã sẵn sàng</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Giọng: {selectedVoiceData?.name} • Độ dài: ~{Math.ceil(text.length / 10)}s
                  </p>
                  
                  {/* Controls */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handlePlay}
                      variant="outline"
                      className="flex-1 max-w-32"
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Dừng
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Phát
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="flex-1 max-w-32 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground">
                  Chưa có file âm thanh nào được tạo
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nhập văn bản và nhấn "Tạo Giọng Nói" để bắt đầu
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Chất Lượng Cao</h3>
          <p className="text-sm text-muted-foreground">
            Giọng nói tự nhiên với công nghệ AI tiên tiến
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Đa Dạng Giọng</h3>
          <p className="text-sm text-muted-foreground">
            6 giọng nói khác nhau phù hợp mọi nhu cầu
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Tải Xuống Dễ Dàng</h3>
          <p className="text-sm text-muted-foreground">
            Xuất file MP3 chất lượng cao trong vài giây
          </p>
        </Card>
      </div>
    </section>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Volume2, Download, Play, Square, Loader2, Settings, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function EnhancedElevenLabsSection() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("rachel");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeVoiceTab, setActiveVoiceTab] = useState("female");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Advanced voice settings
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.5]);
  const [style, setStyle] = useState([0.0]);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  
  const { toast } = useToast();

  const femaleVoices = [
    { id: "rachel", name: "Rachel", description: "Giọng nữ chuyên nghiệp", preview: "Xin chào! Tôi là Rachel, trợ lý AI thân thiện của bạn." },
    { id: "bella", name: "Bella", description: "Giọng nữ ấm áp", preview: "Chào bạn! Tôi là Bella, sẵn sàng làm bạn vui vẻ!" },
    { id: "domi", name: "Domi", description: "Giọng nữ tự tin", preview: "Xin chào! Tôi là Domi, giọng nói tự tin cho giao tiếp rõ ràng." },
    { id: "elli", name: "Elli", description: "Giọng nữ trẻ trung", preview: "Chào bạn! Tôi là Elli, nói nhẹ nhàng để bạn cảm thấy thoải mái." },
    { id: "grace", name: "Grace", description: "Giọng nữ trưởng thành", preview: "Hello! I'm Grace, bringing elegance to every conversation." },
    { id: "freya", name: "Freya", description: "Giọng nữ năng động", preview: "Hi there! I'm Freya, full of energy and enthusiasm!" },
    { id: "alice", name: "Alice", description: "Giọng nữ dịu dàng", preview: "Hello! I'm Alice, speaking softly with care and warmth." },
    { id: "charlotte", name: "Charlotte", description: "Giọng nữ sang trọng", preview: "Good day! I'm Charlotte, your sophisticated voice companion." }
  ];

  const maleVoices = [
    { id: "adam", name: "Adam", description: "Giọng nam chuyên nghiệp", preview: "Chào buổi tốt! Tôi là Adam, hỗ trợ bạn với các công việc chuyên nghiệp." },
    { id: "sam", name: "Sam", description: "Giọng nam tự tin", preview: "Chào bạn! Tôi là Sam, giọng nam mạnh mẽ và tự tin." },
    { id: "daniel", name: "Daniel", description: "Giọng nam điềm tĩnh", preview: "Hello! I'm Daniel, your calm and composed voice companion." },
    { id: "josh", name: "Josh", description: "Giọng nam năng động", preview: "Chào bạn! Tôi là Josh, bạn đồng hành thân thiện và năng động." },
    { id: "arnold", name: "Arnold", description: "Giọng nam trầm ấm", preview: "Greetings! I'm Arnold, with a deep and warm voice for you." },
    { id: "brian", name: "Brian", description: "Giọng nam trẻ trung", preview: "Hey! I'm Brian, bringing youthful energy to our conversation." },
    { id: "callum", name: "Callum", description: "Giọng nam Scotland", preview: "Hello there! I'm Callum, with a distinctive Scottish accent." },
    { id: "liam", name: "Liam", description: "Giọng nam mạnh mẽ", preview: "Good day! I'm Liam, speaking with strength and clarity." },
    { id: "ryan", name: "Ryan", description: "Giọng nam dễ chịu", preview: "Hi! I'm Ryan, your pleasant and approachable voice." },
    { id: "ethan", name: "Ethan", description: "Giọng nam hiện đại", preview: "Hello! I'm Ethan, bringing a modern and fresh voice style." }
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
      const response = await apiRequest("POST", "/api/tts", { 
        text, 
        voice, 
        language,
        voiceSettings: settings
      });
      return await response.json();
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
    mutationFn: async ({ voice, preview, language }: { voice: string; preview: string; language: string }) => {
      return await apiRequest("/api/voice-preview", { 
        method: "POST",
        body: { voice, preview, language }
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

    const settings = {
      stability: stability[0],
      similarityBoost: similarityBoost[0], 
      style: style[0],
      speakerBoost: speakerBoost
    };

    ttsMutation.mutate({ 
      text: text.trim(), 
      voice: selectedVoice,
      language: selectedLanguage,
      settings
    });
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
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `tts-${selectedVoice}-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const selectedVoiceData = allVoices.find(v => v.id === selectedVoice);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-purple-600" />
          <CardTitle className="text-2xl">ElevenLabs Text-to-Speech</CardTitle>
        </div>
        <CardDescription>
          Chuyển đổi văn bản thành giọng nói tự nhiên với công nghệ AI tiên tiến từ ElevenLabs
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-sm font-medium">
            Văn bản cần chuyển đổi
          </Label>
          <Textarea
            id="text-input"
            placeholder="Nhập văn bản bạn muốn chuyển thành giọng nói..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="text-xs text-muted-foreground">
            {text.length}/500 ký tự
          </div>
        </div>

        {/* Voice and Language Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Chọn ngôn ngữ</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Chọn giọng nói</Label>
            <Tabs value={activeVoiceTab} onValueChange={setActiveVoiceTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="female" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Giọng nữ
                </TabsTrigger>
                <TabsTrigger value="male" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Giọng nam
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="female" className="space-y-2">
                <Select 
                  value={activeVoiceTab === "female" && femaleVoices.some(v => v.id === selectedVoice) ? selectedVoice : ""} 
                  onValueChange={(value) => {
                    setSelectedVoice(value);
                    setActiveVoiceTab("female");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giọng nữ" />
                  </SelectTrigger>
                  <SelectContent>
                    {femaleVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-muted-foreground">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="male" className="space-y-2">
                <Select 
                  value={activeVoiceTab === "male" && maleVoices.some(v => v.id === selectedVoice) ? selectedVoice : ""} 
                  onValueChange={(value) => {
                    setSelectedVoice(value);
                    setActiveVoiceTab("male");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giọng nam" />
                  </SelectTrigger>
                  <SelectContent>
                    {maleVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-muted-foreground">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>

            {/* Voice Preview */}
            {selectedVoiceData && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-1">
                      {selectedVoiceData.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {selectedVoiceData.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewMutation.mutate({
                      voice: selectedVoice,
                      preview: selectedVoiceData.preview,
                      language: selectedLanguage
                    })}
                    disabled={previewMutation.isPending}
                  >
                    {previewMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang phát...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Nghe mẫu giọng nói
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <Label className="text-sm font-medium">Cài đặt âm thanh nâng cao</Label>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stability */}
            <div className="space-y-2">
              <Label className="text-sm">Độ ổn định ({stability[0].toFixed(1)})</Label>
              <Slider
                value={stability}
                onValueChange={setStability}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Điều chỉnh tính nhất quán của giọng nói
              </p>
            </div>

            {/* Similarity Boost */}
            <div className="space-y-2">
              <Label className="text-sm">Độ tương tự ({similarityBoost[0].toFixed(1)})</Label>
              <Slider
                value={similarityBoost}
                onValueChange={setSimilarityBoost}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Tăng cường độ giống với giọng gốc
              </p>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label className="text-sm">Phong cách ({style[0].toFixed(1)})</Label>
              <Slider
                value={style}
                onValueChange={setStyle}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Điều chỉnh phong cách diễn đạt
              </p>
            </div>

            {/* Speaker Boost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Tăng cường giọng nói</Label>
                <Switch
                  checked={speakerBoost}
                  onCheckedChange={setSpeakerBoost}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cải thiện chất lượng và độ rõ nét
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={!text.trim() || ttsMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          {ttsMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo giọng nói...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Tạo Giọng Nói
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="p-4 bg-muted rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">File âm thanh đã tạo</h3>
              <Badge variant="outline">MP3</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePlay}
                className="flex-1"
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
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Tải xuống
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
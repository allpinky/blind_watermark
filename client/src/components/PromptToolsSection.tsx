import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Send, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function PromptToolsSection() {
  const [promptType, setPromptType] = useState("image");
  const [promptStyle, setPromptStyle] = useState("realistic");
  const [promptDetails, setPromptDetails] = useState("");
  const [promptContext, setPromptContext] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const { toast } = useToast();

  const generatePromptMutation = useMutation({
    mutationFn: async (data: { type: string; style: string; details: string; context: string }) => {
      const response = await apiRequest("POST", "/api/generate-prompt", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedPrompt(data.prompt);
      toast({
        title: "Prompt đã được tạo!",
        description: "Prompt mới đã được generate thành công.",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo prompt. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePrompt = () => {
    if (!promptDetails.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mô tả chi tiết!",
        variant: "destructive",
      });
      return;
    }

    generatePromptMutation.mutate({
      type: promptType,
      style: promptStyle,
      details: promptDetails,
      context: promptContext,
    });
  };

  const copyPrompt = async () => {
    if (!generatedPrompt) {
      toast({
        title: "Không có prompt",
        description: "Chưa có prompt để sao chép!",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: "Đã sao chép!",
        description: "Prompt đã được sao chép vào clipboard.",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const sendToChat = () => {
    if (!generatedPrompt) {
      toast({
        title: "Không có prompt",
        description: "Chưa có prompt để gửi!",
        variant: "destructive",
      });
      return;
    }

    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input") as HTMLInputElement;
    
    if (chatWindow && chatInput) {
      chatWindow.classList.add("active");
      chatInput.value = generatedPrompt;
      chatInput.focus();
      
      toast({
        title: "Đã gửi prompt",
        description: "Prompt đã được gửi đến chatbot.",
      });
    }
  };

  const templates = [
    {
      title: "Character Concept Art",
      category: "character",
      description: "Professional character design với detailed specifications",
      example: "female warrior, silver armor with intricate engravings, long black hair, piercing blue eyes, wielding enchanted sword, dynamic pose, concept art style",
    },
    {
      title: "Environment Design",
      category: "environment",
      description: "Level design và environmental storytelling",
      example: "mystical forest environment, ancient glowing trees, volumetric lighting, particle effects, misty atmosphere, game-ready 3D environment",
    },
    {
      title: "UI/UX Interface",
      category: "image",
      description: "Game interface design với user experience focus",
      example: "RPG game interface, health/mana bars, minimap, inventory grid, medieval UI theme, clean typography, intuitive layout",
    },
    {
      title: "Narrative Generation",
      category: "story",
      description: "Interactive storytelling và branching narratives",
      example: "epic fantasy quest narrative about young hero discovering magical world to save kingdom, multiple story branches, character development arcs",
    },
    {
      title: "3D Asset Creation",
      category: "gameplay",
      description: "Game-ready 3D models và textures",
      example: "low-poly medieval sword, PBR textures, game-optimized topology, Unity-compatible, 2K texture resolution",
    },
    {
      title: "AI Agent Behavior",
      category: "gameplay",
      description: "NPC AI behavior patterns và decision trees",
      example: "intelligent NPC merchant with dynamic pricing, contextual dialogue, reputation system, adaptive behavior based on player actions",
    },
  ];

  const tips = [
    {
      title: "Precision Prompting",
      description: "Sử dụng specific parameters: resolution, style, technical specifications để optimize model output quality.",
      color: "primary",
    },
    {
      title: "Style References",
      description: "Leverage artistic movements, renowned artists, hoặc established visual styles để guide aesthetic direction.",
      color: "secondary",
    },
    {
      title: "Technical Modifiers",
      description: 'Apply industry-standard terms: "PBR materials", "volumetric lighting", "subsurface scattering", "temporal anti-aliasing".',
      color: "green",
    },
    {
      title: "Context Injection",
      description: "Provide contextual information về target platform, performance constraints, và intended use case.",
      color: "purple",
    },
    {
      title: "Iterative Refinement",
      description: "Employ A/B testing methodology với prompt variations để achieve optimal results through systematic iteration.",
      color: "orange",
    },
  ];

  const useTemplate = (template: any) => {
    setPromptType(template.category);
    setPromptDetails(template.example);
    setPromptContext(`Sử dụng template: ${template.title}`);
  };

  return (
    <section id="prompt-tools" className="mb-16 scroll-mt-20">
      <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
        AI Prompt Engineering Studio
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-primary flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            Prompt Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chọn Loại Prompt
              </label>
              <Select value={promptType} onValueChange={setPromptType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Tạo Hình Ảnh</SelectItem>
                  <SelectItem value="character">Thiết Kế Nhân Vật</SelectItem>
                  <SelectItem value="story">Viết Câu Chuyện</SelectItem>
                  <SelectItem value="gameplay">Gameplay Mechanics</SelectItem>
                  <SelectItem value="environment">Môi Trường Game</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phong Cách
              </label>
              <Select value={promptStyle} onValueChange={setPromptStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Tự định nghĩa)</SelectItem>
                  <SelectItem value="realistic">Thực Tế</SelectItem>
                  <SelectItem value="anime">Anime/Manga</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="pixel">Pixel Art</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Mô Tả Chi Tiết
            </label>
            <Textarea
              value={promptDetails}
              onChange={(e) => setPromptDetails(e.target.value)}
              rows={3}
              placeholder="Nhập mô tả chi tiết về những gì bạn muốn tạo..."
              className="resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Ngữ Cảnh (Tùy chọn)
            </label>
            <Textarea
              value={promptContext}
              onChange={(e) => setPromptContext(e.target.value)}
              rows={2}
              placeholder="Thêm ngữ cảnh, đối tượng mục tiêu, hoặc yêu cầu đặc biệt..."
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleGeneratePrompt}
            disabled={generatePromptMutation.isPending}
            className="mt-4 w-full md:w-auto"
          >
            {generatePromptMutation.isPending ? (
              "Đang tạo..."
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Tạo Prompt
              </>
            )}
          </Button>

          {generatedPrompt && (
            <div className="mt-6">
              <h4 className="font-semibold text-foreground mb-2">Prompt Được Tạo:</h4>
              <div className="prompt-template">
                <p className="font-mono text-sm whitespace-pre-wrap">{generatedPrompt}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={copyPrompt} variant="secondary" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Sao Chép
                </Button>
                <Button onClick={sendToChat} size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Gửi Chat
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">📚 Template Thư Viện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="prompt-template"
                  onClick={() => useTemplate(template)}
                >
                  <h4 className="font-medium text-foreground">{template.title}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">💡 Tips & Tricks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`border-l-4 ${
                    tip.color === "primary"
                      ? "border-primary bg-primary/5"
                      : tip.color === "secondary"
                      ? "border-secondary bg-secondary/5"
                      : tip.color === "green"
                      ? "border-green-500 bg-green-50"
                      : tip.color === "purple"
                      ? "border-purple-500 bg-purple-50"
                      : "border-orange-500 bg-orange-50"
                  } pl-4 py-3 rounded-r-lg`}
                >
                  <h4 className="font-semibold text-foreground">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

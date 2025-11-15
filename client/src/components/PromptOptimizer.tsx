import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PromptOptimizer() {
  const [userPrompt, setUserPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const optimizePrompt = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mô tả để tối ưu hóa",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Bạn là chuyên gia tối ưu hóa prompt cho game development. Phân tích và cải thiện prompt sau: "${userPrompt}". 

Trả về theo định dạng chính xác:
PHÂN_TÍCH:
[Giải thích tại sao prompt gốc cần cải thiện, vấn đề cụ thể, và lý do phiên bản tối ưu tốt hơn]

PROMPT_TỐI_ƯU:
[Chỉ prompt đã được tối ưu hóa, không có text giải thích]`
        })
      });

      if (!response.ok) throw new Error("Optimization failed");
      
      const data = await response.json();
      const response_text = data.response;
      
      // Tách phân tích và prompt với format mới
      const parts = response_text.split("PROMPT_TỐI_ƯU:");
      if (parts.length >= 2) {
        const analysisText = parts[0].replace("PHÂN_TÍCH:", "").trim();
        const promptText = parts[1].trim();
        setAnalysis(analysisText);
        setOptimizedPrompt(promptText);
      } else {
        // Fallback parsing cho format cũ
        const oldParts = response_text.split("PROMPT TỐI ƯU:");
        if (oldParts.length >= 2) {
          const analysisText = oldParts[0].replace("PHÂN TÍCH:", "").trim();
          const promptText = oldParts[1].trim();
          setAnalysis(analysisText);
          setOptimizedPrompt(promptText);
        } else {
          setAnalysis("Phân tích sẽ hiển thị tại đây");
          setOptimizedPrompt(response_text);
        }
      }
      
      // Track activity
      if ((window as any).addUserActivity) {
        (window as any).addUserActivity({
          type: 'prompt_optimize',
          title: 'Tối ưu prompt thành công',
          description: `Đã tối ưu prompt: "${userPrompt.substring(0, 50)}${userPrompt.length > 50 ? '...' : ''}"`,
          metadata: { originalLength: userPrompt.length }
        });
      }
      
      toast({
        title: "Thành công",
        description: "Đã tối ưu hóa prompt của bạn"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tối ưu hóa prompt. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Prompt đã được sao chép vào clipboard"
    });
  };

  return (
    <section id="prompt-optimizer" className="mb-16 scroll-mt-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          Tối Ưu Hóa Prompt AI
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Biến ý tưởng đơn giản của bạn thành prompt chi tiết, chuyên nghiệp để có kết quả AI tốt hơn
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Mô tả của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ví dụ: Tạo logo cho công ty game mobile về RPG fantasy..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            <Button 
              onClick={optimizePrompt}
              disabled={isOptimizing || !userPrompt.trim()}
              className="w-full"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tối ưu hóa...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Tối ưu hóa Prompt
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Optimized Prompt Section - Hiển thị trước */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Prompt đã tối ưu</span>
                {optimizedPrompt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(optimizedPrompt)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Sao chép
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizedPrompt ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg min-h-[200px]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {optimizedPrompt}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg min-h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Prompt tối ưu hóa sẽ xuất hiện ở đây
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Section - Hiển thị sau */}
          <Card>
            <CardHeader>
              <CardTitle>Phân tích chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg min-h-[200px]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {analysis}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg min-h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Phân tích sẽ xuất hiện ở đây
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <Card className="mt-8 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Mẹo để có prompt tốt hơn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Mô tả rõ ràng</h4>
              <p className="text-sm text-muted-foreground">
                Cung cấp càng nhiều chi tiết càng tốt về những gì bạn muốn
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Phong cách cụ thể</h4>
              <p className="text-sm text-muted-foreground">
                Đề cập đến phong cách nghệ thuật, màu sắc, hoặc cảm xúc mong muốn
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Định dạng đầu ra</h4>
              <p className="text-sm text-muted-foreground">
                Xác định định dạng file, kích thước, hoặc độ phân giải cần thiết
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Ngữ cảnh sử dụng</h4>
              <p className="text-sm text-muted-foreground">
                Nói rõ mục đích sử dụng để AI hiểu đúng yêu cầu
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
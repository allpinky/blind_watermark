import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Lightbulb, ExternalLink, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AddAISection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "general",
    website: "",
    description: "",
    contributorName: "",
    field: ""
  });
  const { toast } = useToast();

  // Single AI tool submission
  const addToolMutation = useMutation({
    mutationFn: async (toolData: typeof formData) => {
      return await apiRequest("POST", "/api/suggestions", toolData);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã gửi đề xuất AI tool thành công!",
      });
      setFormData({
        name: "",
        category: "general",
        website: "",
        description: "",
        contributorName: "",
        field: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // CSV import mutation
  const csvImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      return await apiRequest("POST", "/api/admin/tools/import-csv", { csvData });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Import thành công",
        description: `Đã import ${data.imported} AI tools, bỏ qua ${data.skipped} tools trùng lặp`,
      });
      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi import",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "general", label: "🧠 Tổng hợp / Nghiên cứu" },
    { value: "2d-art", label: "🎨 2D Art & Design" },
    { value: "3d-modeling", label: "🧱 3D Modeling & Animation" },
    { value: "animation", label: "🎞️ Animation & Motion Graphics" },
    { value: "audio", label: "🎵 Audio & Music Generation" },
    { value: "video", label: "🎬 Video Editing & Production" },
    { value: "writing", label: "✍️ Writing & Content Creation" },
    { value: "code", label: "💻 Programming & Development" },
    { value: "business", label: "📊 Business & Analytics" },
    { value: "prompt-tools", label: "⚡ Prompt Engineering Tools" },
    { value: "automation", label: "🤖 Automation & Workflow" },
    { value: "other", label: "🔧 Khác" }
  ];

  const fields = [
    { value: "2d-artist", label: "2D Artist / UI / Illustration" },
    { value: "3d-artist", label: "3D Artist / Modeling / Asset Generation" },
    { value: "animator", label: "Animator / Rigging / Mocap" },
    { value: "level-designer", label: "Level Designer / Environment" },
    { value: "narrative", label: "Narrative / Quest / NPC AI" },
    { value: "qa-tester", label: "QA / Game Tester" },
    { value: "dev-backend", label: "Dev / Backend / Tools Dev" },
    { value: "ai-engineer", label: "AI Engineer / LLM Dev / Agent Dev" },
    { value: "data-analyst", label: "Data Analyst / Game Economy" },
    { value: "marketing", label: "Marketing / UA / Growth" },
    { value: "video-editor", label: "Video Editor / Ads / Trailer" },
    { value: "community", label: "Community / CS / LiveOps" },
    { value: "hr-training", label: "HR / Onboarding / Training" },
    { value: "other", label: "Khác" }
  ];

  const examples = [
    {
      name: "Midjourney",
      category: "2d-art",
      field: "2d-artist",
      website: "https://midjourney.com",
      description: "Công cụ AI tạo hình ảnh từ text prompt, chuyên tạo concept art và character design cho game",
      contributorName: "Nguyễn Văn A"
    },
    {
      name: "ChatGPT",
      category: "general",
      field: "ai-engineer",
      website: "https://chat.openai.com",
      description: "AI chatbot thông minh, hỗ trợ viết code, brainstorming ý tưởng game và giải quyết vấn đề",
      contributorName: "Trần Thị B"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.website || !formData.description || !formData.contributorName || !formData.field) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ tất cả các trường bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Gửi thành công!",
          description: "Cảm ơn bạn đã đóng góp. Chúng tôi sẽ xem xét và thêm vào hệ thống.",
        });
        setFormData({ 
          name: "", 
          category: "general", 
          website: "", 
          description: "", 
          contributorName: "",
          field: ""
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      toast({
        title: "Lỗi gửi",
        description: "Không thể gửi đề xuất. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadExample = (example: typeof examples[0]) => {
    setFormData(example);
  };

  return (
    <section id="add-ai" className="space-y-6 p-4 sm:p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
          Đóng Góp AI Tool Mới
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Chia sẻ những công cụ AI hữu ích mà bạn đã khám phá để cộng đồng cùng sử dụng
        </p>
      </div>

      {/* Examples Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Ví dụ mẫu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm">{example.name}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample(example)}
                    className="text-xs w-full sm:w-auto"
                  >
                    Sử dụng mẫu này
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {example.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.value === example.category)?.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {fields.find(f => f.value === example.field)?.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin AI Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên AI Tool <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Midjourney, ChatGPT, Stable Diffusion..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributorName" className="text-sm font-medium">
                  Tên người đóng góp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contributorName"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.contributorName}
                  onChange={(e) => handleInputChange("contributorName", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website URL <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="w-full pl-9"
                />
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Category and Field */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field" className="text-sm font-medium">
                  Lĩnh vực ứng dụng <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.field} onValueChange={(value) => handleInputChange("field", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn lĩnh vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả chức năng, tính năng nổi bật, cách sử dụng và lợi ích của AI tool này..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-[100px] w-full resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Mô tả càng chi tiết, cộng đồng càng dễ hiểu và sử dụng
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                "Đang gửi..."
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Gửi đóng góp
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hướng dẫn đóng góp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">✅ Nên làm</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Chọn đúng danh mục và lĩnh vực</li>
                <li>• Mô tả rõ ràng, chi tiết</li>
                <li>• Kiểm tra link website hoạt động</li>
                <li>• Tool thực sự hữu ích</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">❌ Không nên</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Gửi tool trùng lặp</li>
                <li>• Mô tả quá ngắn gọn</li>
                <li>• Link bị lỗi hoặc spam</li>
                <li>• Nội dung không phù hợp</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
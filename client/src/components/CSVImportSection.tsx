import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CSVImportSectionProps {
  onImportComplete?: () => void;
}

export default function CSVImportSection({ onImportComplete }: CSVImportSectionProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const response = await apiRequest("/api/admin/tools/import-csv", "POST", { csvData: data });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Import thành công",
        description: data.message || "Đã import AI tools từ CSV",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      setCsvFile(null);
      setCsvData([]);
      setPreviewData([]);
      onImportComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi import",
        description: error.message || "Không thể import CSV file",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file CSV",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        toast({
          title: "File rỗng",
          description: "File CSV không có dữ liệu",
          variant: "destructive",
        });
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvData(rows);
      setPreviewData(rows.slice(0, 5)); // Show first 5 rows for preview
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `# HƯỚNG DẪN IMPORT AI TOOLS - TEMPLATE CSV
# Đây là file template mẫu cho việc import AI tools vào hệ thống
# Vui lòng tuân thủ đúng format và thứ tự các cột như dưới đây

# FORMAT: name,category,description,features,pricing,rating,website
# 
# CÁC CATEGORY HỢP LỆ:
# - general (Tổng hợp/Nghiên cứu)
# - 2d-art (2D Art & Design) 
# - 3d-modeling (3D Modeling & Animation)
# - animation (Animation & Motion Graphics)
# - audio (Audio & Music Generation)
# - video (Video Editing & Production)
# - writing (Writing & Content Creation)
# - code (Programming & Development)
# - business (Business & Analytics)
# - prompt-tools (Prompt Engineering Tools)
# - automation (Automation & Workflow)
# - other (Khác)
#
# CÁC PRICING HỢP LỆ:
# - Miễn phí
# - Freemium  
# - Trả phí
# - Dùng thử
#
# RATING: Số thập phân từ 1.0 đến 5.0
# WEBSITE: URL đầy đủ bắt đầu bằng https://
# FEATURES: Các tính năng cách nhau bởi dấu phẩy

name,category,description,features,pricing,rating,website
"ChatGPT","general","AI chatbot thông minh cho mọi câu hỏi và nhiệm vụ","Trả lời câu hỏi, Viết nội dung, Phân tích dữ liệu, Dịch thuật, Lập trình","Freemium",4.5,"https://chat.openai.com"
"Midjourney","2d-art","AI tạo hình ảnh nghệ thuật từ text prompt","Tạo ảnh nghệ thuật, Style đa dạng, Chất lượng cao, Upscale 4K, Community gallery","Trả phí",4.8,"https://midjourney.com"
"Runway ML","video","AI editing video và tạo hiệu ứng chuyên nghiệp","Chỉnh sửa video, Tạo hiệu ứng, Remove background, AI motion, Green screen","Freemium",4.3,"https://runwayml.com"
"Stable Diffusion","2d-art","AI tạo hình ảnh mã nguồn mở","Tạo ảnh miễn phí, Tùy chỉnh model, API integration, Local deployment, ControlNet","Miễn phí",4.4,"https://stability.ai"
"ElevenLabs","audio","AI text-to-speech với giọng nói tự nhiên","Chuyển text thành giọng nói, Clone giọng, Multi-language, API, Voice design","Freemium",4.6,"https://elevenlabs.io"
"GitHub Copilot","code","AI assistant hỗ trợ lập trình","Gợi ý code, Auto-complete, Giải thích code, Debug, Multi-language support","Trả phí",4.2,"https://github.com/features/copilot"
"Notion AI","business","AI writing assistant trong Notion workspace","Viết nội dung, Tóm tắt, Brainstorm, Translate, Table auto-fill","Freemium",4.1,"https://notion.so"
"Copy.ai","writing","AI copywriting cho marketing và content creation","Viết quảng cáo, Email marketing, Social media posts, SEO content, Blog posts","Freemium",4.0,"https://copy.ai"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-tools-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import AI Tools từ CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Chọn file CSV với 7 cột bắt buộc theo thứ tự:
            </p>
            <div className="text-xs text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-50 p-3 rounded">
              <div><strong>name:</strong> Tên AI tool (ví dụ: ChatGPT)</div>
              <div><strong>category:</strong> general, 2d-art, video, audio, code, business, writing, other</div>
              <div><strong>description:</strong> Mô tả ngắn gọn về tool</div>
              <div><strong>features:</strong> Các tính năng cách nhau bởi dấu phẩy</div>
              <div><strong>pricing:</strong> Miễn phí, Freemium, Trả phí, Dùng thử</div>
              <div><strong>rating:</strong> Điểm từ 1.0 đến 5.0</div>
              <div><strong>website:</strong> URL đầy đủ với https://</div>
            </div>
          </div>
        </div>

        {/* File Info */}
        {csvFile && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{csvFile.name}</span>
            <Badge variant="secondary">{csvData.length} dòng</Badge>
          </div>
        )}

        {/* Preview Data */}
        {previewData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Xem trước dữ liệu (5 dòng đầu):</h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Tên</th>
                      <th className="p-2 text-left">Danh mục</th>
                      <th className="p-2 text-left">Mô tả</th>
                      <th className="p-2 text-left">Giá</th>
                      <th className="p-2 text-left">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          {row.name || row.Name ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {row.name || row.Name}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-muted-foreground">Thiếu tên</span>
                            </div>
                          )}
                        </td>
                        <td className="p-2">{row.category || row.Category || 'general'}</td>
                        <td className="p-2 max-w-48 truncate">
                          {row.description || row.Description || 'Không có mô tả'}
                        </td>
                        <td className="p-2">{row.pricing || row.Pricing || 'Unknown'}</td>
                        <td className="p-2">{row.rating || row.Rating || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Import Button */}
        {csvData.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Sẵn sàng import {csvData.length} AI tools
            </div>
            <Button 
              onClick={() => importMutation.mutate(csvData)}
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? "Đang import..." : "Import ngay"}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>Hướng dẫn:</strong></p>
          <p>• Tải template CSV để xem format chuẩn</p>
          <p>• Cột name (tên) là bắt buộc, các cột khác có thể để trống</p>
          <p>• Features có thể viết cách nhau bằng dấu phẩy</p>
          <p>• Rating từ 0 đến 5, pricing có thể là: Free, Freemium, Paid, Enterprise</p>
        </div>
      </CardContent>
    </Card>
  );
}
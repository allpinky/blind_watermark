import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/useAuth";

interface AiTool {
  id: number;
  name: string;
  category: string;
  description: string;
  features: string[];
  pricing: string;
  rating: number;
  website: string | null;
}

interface ToolModalProps {
  tool: AiTool | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ToolModal({ tool, isOpen, onClose }: ToolModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Track when user views a tool
  const trackToolView = (tool: AiTool) => {
    if ((window as any).addUserActivity) {
      (window as any).addUserActivity({
        type: 'tool_view',
        title: 'Xem chi tiết AI tool',
        description: `Đã xem: ${tool.name} (${tool.category})`,
        metadata: { toolId: tool.id, toolName: tool.name, category: tool.category }
      });
    }
  };

  const deleteTool = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/tools/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tool");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa AI tool",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa AI tool",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (tool && confirm("Bạn có chắc chắn muốn xóa AI tool này?")) {
      deleteTool.mutate(tool.id);
    }
  };

  // For now, assume admin access is available (since this is the admin dashboard)
  const isAdmin = true;
  
  if (!tool) return null;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "general": "bg-blue-100 text-blue-800",
      "2d-art": "bg-purple-100 text-purple-800",
      "3d-modeling": "bg-green-100 text-green-800",
      "animation": "bg-orange-100 text-orange-800",
      "audio": "bg-pink-100 text-pink-800",
      "video": "bg-red-100 text-red-800",
      "music": "bg-indigo-100 text-indigo-800",
      "prompt-tools": "bg-yellow-100 text-yellow-800",
      "automation": "bg-gray-100 text-gray-800",
      "writing": "bg-teal-100 text-teal-800",
      "code": "bg-cyan-100 text-cyan-800",
      "business": "bg-emerald-100 text-emerald-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {tool.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Category and Rating */}
          <div className="flex items-center justify-between">
            <Badge className={getCategoryColor(tool.category)}>
              {tool.category}
            </Badge>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{tool.rating}/5</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Mô tả
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Tính năng chính
              </h3>
              <ul className="space-y-2">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Giá cả
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{tool.pricing}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            {tool.website && (
              <Button 
                onClick={() => window.open(tool.website!, '_blank')}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Truy cập website</span>
              </Button>
            )}
            {isAdmin && (
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTool.isPending}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteTool.isPending ? "Đang xóa..." : "Xóa AI Tool"}</span>
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
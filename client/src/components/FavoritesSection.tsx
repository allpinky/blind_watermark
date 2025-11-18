import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AiTool } from "@shared/schema";
import ToolModal from "./ToolModal";

export default function FavoritesSection() {
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user's favorite tools
  const { data: favoriteTools = [], isLoading } = useQuery({
    queryKey: ["/api/favorites"],
    refetchOnWindowFocus: true,
  }) as { data: AiTool[]; isLoading: boolean };

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (toolId: number) => {
      return await apiRequest("DELETE", `/api/favorites/${toolId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Đã xóa khỏi yêu thích",
        description: "AI tool đã được xóa khỏi danh sách yêu thích",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi xóa yêu thích",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openToolModal = (tool: AiTool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const handleRemoveFavorite = (toolId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavoriteMutation.mutate(toolId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Yêu thích</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Đang tải danh sách AI tools yêu thích...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (favoriteTools.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Yêu thích</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Danh sách AI tools yêu thích của bạn
          </p>
        </div>
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Chưa có AI tools yêu thích</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hãy khám phá và thêm các AI tools vào danh sách yêu thích của bạn
          </p>
          <Button onClick={() => window.location.hash = "#explore"}>
            Khám phá AI tools
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Yêu thích</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {favoriteTools.length} AI tools yêu thích
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteTools.map((tool: AiTool) => (
          <Card
            key={tool.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-red-200 dark:hover:border-red-800"
            onClick={() => openToolModal(tool)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-red-600 transition-colors">
                    {tool.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{tool.rating}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleRemoveFavorite(tool.id, e)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={removeFavoriteMutation.isPending}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {tool.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {tool.pricing}
                </Badge>
                {tool.website && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (tool.website) window.open(tool.website, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ToolModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
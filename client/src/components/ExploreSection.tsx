import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { AiTool } from "@shared/schema";
import ToolModal from "./ToolModal";

export default function ExploreSection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showingAll, setShowingAll] = useState(false);
  const [sortBy, setSortBy] = useState("best");
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: tools, isLoading } = useQuery<AiTool[]>({
    queryKey: ["/api/tools"],
    enabled: true,
  });

  // Fetch user's favorites to show liked state
  const { data: favoriteTools = [] } = useQuery({
    queryKey: ["/api/favorites"],
  }) as { data: AiTool[] };

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (toolId: number) => {
      return await apiRequest("POST", `/api/favorites/${toolId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Đã thêm vào yêu thích",
        description: "AI tool đã được thêm vào danh sách yêu thích",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi thêm yêu thích",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const filterButtons = [
    { id: "all", label: "Tất Cả" },
    // Core Game Development
    { id: "game-design", label: "🗺️ Game Design" },
    { id: "programming", label: "👨‍💻 Lập Trình" },
    { id: "qa-testing", label: "🧪 QA & Testing" },
    
    // Art & Creative
    { id: "2d-art", label: "🎨 2D Art" },
    { id: "3d-modeling", label: "🧱 3D Modeling" },
    { id: "animation", label: "🎞️ Animation" },
    { id: "video-editing", label: "🎬 Video Editor" },
    
    // Content & Narrative
    { id: "narrative", label: "🎭 Narrative" },
    { id: "localization", label: "🌐 Localization" },
    
    // Business & Support
    { id: "data-analytics", label: "📊 Data Analytics" },
    { id: "marketing", label: "📣 Marketing" },
    { id: "ai-engineering", label: "🧠 AI Engineer" },
    { id: "customer-support", label: "💬 CSKH" },
    { id: "hr", label: "🧑‍💼 HR" },
    { id: "general", label: "💡 Tổng hợp" },
  ];

  // Map filter IDs to actual database categories
  const categoryMapping: { [key: string]: string } = {
    "game-design": "gd",
    "programming": "dev", 
    "qa-testing": "qa",
    "2d-art": "2d",
    "3d-modeling": "3d",
    "animation": "anim",
    "video-editing": "video_editor",
    "narrative": "narrative",
    "localization": "localization",
    "data-analytics": "data",
    "marketing": "marketing",
    "ai-engineering": "ai_engineer",
    "customer-support": "cskh",
    "hr": "hr",
    "general": "general"
  };

  const filteredTools = tools?.filter(tool => {
    // Hiển thị tất cả AI tools trừ những cái bị admin ẩn cụ thể
    // Nếu visible là null hoặc undefined thì coi như là hiển thị (mặc định)
    // Chỉ ẩn khi visible === false (admin cụ thể ẩn)
    const isVisible = (tool as any).visible !== false;
    
    let matchesCategory = false;
    if (activeFilter === "all") {
      matchesCategory = true;
    } else {
      // Map the filter ID to actual database category
      const dbCategory = categoryMapping[activeFilter] || activeFilter;
      matchesCategory = tool.category === dbCategory;
    }
    

    
    return isVisible && matchesCategory;
  }) || [];

  // Sort tools based on selected sorting option
  const sortedTools = filteredTools.sort((a, b) => {
    switch (sortBy) {
      case "best":
        return b.rating - a.rating;
      case "newest":
        return b.id - a.id; // Assuming higher ID = newer
      case "a-z":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const displayedTools = showingAll ? sortedTools : sortedTools.slice(0, 6);

  const openToolModal = (tool: AiTool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const handleFavoriteToggle = (tool: AiTool, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFavorited = favoriteTools.some(favTool => favTool.id === tool.id);
    
    if (isFavorited) {
      removeFavoriteMutation.mutate(tool.id);
    } else {
      addFavoriteMutation.mutate(tool.id);
    }
  };

  const isFavorited = (toolId: number) => {
    return favoriteTools.some(favTool => favTool.id === toolId);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "general": "bg-gradient-to-r from-blue-600 to-purple-600",
      "2d": "bg-gradient-to-r from-pink-600 to-red-600",
      "3d": "bg-gradient-to-r from-orange-600 to-red-600",
      "anim": "bg-gradient-to-r from-green-600 to-emerald-600",
      "gd": "bg-gradient-to-r from-yellow-600 to-orange-600",
      "narrative": "bg-gradient-to-r from-purple-600 to-indigo-600",
      "qa": "bg-gradient-to-r from-cyan-600 to-blue-600",
      "dev": "bg-gradient-to-r from-gray-700 to-gray-900",
      "ai_engineer": "bg-gradient-to-r from-violet-600 to-purple-600",
      "data": "bg-gradient-to-r from-emerald-600 to-teal-600",
      "marketing": "bg-gradient-to-r from-rose-600 to-pink-600",
      "video_editor": "bg-gradient-to-r from-red-600 to-orange-600",
      "cskh": "bg-gradient-to-r from-blue-600 to-cyan-600",
      "hr": "bg-gradient-to-r from-indigo-600 to-blue-600",
      "localization": "bg-gradient-to-r from-green-600 to-blue-600"
    };
    return colors[category as keyof typeof colors] || "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      "general": "💡",
      "2d": "🎨",
      "3d": "🧱",
      "anim": "🎞️",
      "gd": "🗺️",
      "narrative": "🎭",
      "qa": "🧪",
      "dev": "👨‍💻",
      "ai_engineer": "🧠",
      "data": "📊",
      "marketing": "📣",
      "video_editor": "🎬",
      "cskh": "💬",
      "hr": "🧑‍💼",
      "localization": "🌐"
    };
    return icons[category as keyof typeof icons] || "🔧";
  };

  if (isLoading) {
    return (
      <section id="explore" className="mb-16 scroll-mt-20">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          Khám Phá Công Cụ AI
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-12 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted rounded"></div>
                <div className="h-6 w-16 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="explore" className="mb-16 scroll-mt-20">
      <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
        Khám Phá Công Cụ AI
      </h2>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {filterButtons.map((button) => (
          <Button
            key={button.id}
            variant={activeFilter === button.id ? "default" : "outline"}
            onClick={() => {
              setActiveFilter(button.id);
              setShowingAll(false);
            }}
            className={`filter-btn ${activeFilter === button.id ? "active" : ""}`}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {/* Sort Filter */}
      <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sắp xếp theo:</span>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "best" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("best")}
            >
              Tốt nhất
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
            >
              Mới nhất
            </Button>
            <Button
              variant={sortBy === "a-z" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("a-z")}
            >
              A-Z
            </Button>
          </div>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredTools.length} tools tìm thấy
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTools.map((tool) => (
          <div
            key={tool.id}
            data-category={tool.category}
            className="card bg-card p-6 rounded-lg shadow-sm border"
            onClick={() => openToolModal(tool)}
          >
            <div className="flex items-center mb-4">
              <div
                className={`w-12 h-12 ${getCategoryColor(tool.category)} rounded-lg flex items-center justify-center text-white text-xl mr-3`}
              >
                {getCategoryIcon(tool.category)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">{tool.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-500 mr-1" />
                  <span>{(tool.rating / 10).toFixed(1)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleFavoriteToggle(tool, e)}
                className={cn(
                  "p-2 transition-colors",
                  isFavorited(tool.id) 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-gray-400 hover:text-red-500"
                )}
                disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
              >
                <Heart 
                  className={cn(
                    "w-5 h-5",
                    isFavorited(tool.id) && "fill-current"
                  )} 
                />
              </Button>
            </div>
            
            <p className="text-muted-foreground mb-4 text-sm">{tool.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {tool.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {tool.features.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.features.length - 2} more
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">{tool.pricing}</span>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                Xem Chi Tiết
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length > 6 && !showingAll && (
        <div className="text-center mt-8">
          <Button
            onClick={() => setShowingAll(true)}
            className="bg-primary hover:bg-primary/90"
          >
            Xem Thêm Công Cụ
          </Button>
        </div>
      )}

      <ToolModal 
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}

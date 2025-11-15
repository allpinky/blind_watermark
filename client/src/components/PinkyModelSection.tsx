import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Star, Calendar, TrendingUp, Brain, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PinkyModel {
  id: string;
  author: string;
  downloads: number;
  likes: number;
  pipeline_tag: string;
  tags: string[];
  lastModified: string;
  library_name?: string;
}

export default function PinkyModelSection() {
  const [models, setModels] = useState<PinkyModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pipelineTag, setPipelineTag] = useState("all");
  const [sortBy, setSortBy] = useState("downloads");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const { toast } = useToast();

  const pipelineTags = [
    { value: "all", label: "Tất cả" },
    { value: "text-generation", label: "Text Generation" },
    { value: "text-to-speech", label: "Text-to-Speech" },
    { value: "image-to-image", label: "Image-to-Image" },
    { value: "text-classification", label: "Text Classification" },
    { value: "translation", label: "Translation" },
    { value: "text-to-image", label: "Text-to-Image" },
    { value: "automatic-speech-recognition", label: "Speech Recognition" },
  ];

  const sortOptions = [
    { value: "downloads", label: "Tải nhiều" },
    { value: "trending", label: "Được thích" },
    { value: "lastModified", label: "Mới nhất" },
  ];

  const searchModels = async (page = 1, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "50",
        ...(searchQuery && { search: searchQuery }),
        ...(pipelineTag && pipelineTag !== "all" && { pipeline_tag: pipelineTag }),
        ...(sortBy && { sort: sortBy }),
      });

      const response = await fetch(`/api/huggingface/models?${params}`);
      
      if (!response.ok) {
        throw new Error("Không thể kết nối đến Hugging Face API");
      }

      const data = await response.json();
      
      if (append) {
        setModels(prev => [...prev, ...data]);
        setTotalLoaded(prev => prev + data.length);
      } else {
        setModels(data);
        setTotalLoaded(data.length);
        setCurrentPage(1);
      }
      
      setHasMore(data.length === 50);
    } catch (error) {
      toast({
        title: "Lỗi tìm kiếm",
        description: "Không thể tải danh sách models. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchModels();
  }, [pipelineTag, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchModels();
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    searchModels(nextPage, true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPipelineColor = (pipeline: string) => {
    const colors: { [key: string]: string } = {
      "text-generation": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      "text-to-speech": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
      "image-to-image": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
      "text-classification": "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
      "translation": "bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100",
      "text-to-image": "bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100",
      "automatic-speech-recognition": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    };
    return colors[pipeline] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Pinky Model Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Khám phá và tìm kiếm hàng nghìn AI models từ Hugging Face
        </p>
      </div>

      {/* Search Filters */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tìm kiếm Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Từ khóa tìm kiếm</label>
              <Input
                type="text"
                placeholder="Nhập tên model, tác giả hoặc từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Loại AI</label>
                <Select value={pipelineTag} onValueChange={setPipelineTag}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelineTags.map((tag) => (
                      <SelectItem key={tag.value} value={tag.value}>
                        {tag.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sắp xếp theo</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {loading && models.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Đang tải models...</p>
          </div>
        )}

        {!loading && models.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
            <CardContent className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Không tìm thấy models nào. Thử điều chỉnh bộ lọc tìm kiếm.
              </p>
            </CardContent>
          </Card>
        )}

        {models.length > 0 && (
          <div className="grid gap-4">
            {models.map((model, index) => (
              <Card key={`${model.id}-${index}`} className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                            {model.id}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            by {model.author}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {model.pipeline_tag && (
                          <Badge className={getPipelineColor(model.pipeline_tag)}>
                            {model.pipeline_tag}
                          </Badge>
                        )}
                        {model.library_name && (
                          <Badge variant="outline">
                            {model.library_name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {formatNumber(model.downloads)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {formatNumber(model.likes)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(model.lastModified)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://huggingface.co/${model.id}`, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {!loading && hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Tải thêm models ({totalLoaded} đã tải)
                </Button>
              </div>
            )}

            {/* No more models message */}
            {!loading && !hasMore && totalLoaded > 0 && (
              <div className="text-center mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  Đã tải tất cả {totalLoaded} models có sẵn
                </p>
              </div>
            )}

            {/* Loading more indicator */}
            {loading && models.length > 0 && (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Đang tải thêm models...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
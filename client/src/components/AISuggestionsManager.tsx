import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AISuggestion {
  id: number;
  name: string;
  category: string;
  website: string;
  description: string;
  contributorName: string;
  status: string;
  createdAt: string;
}

export default function AISuggestionsManager() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const { toast } = useToast();

  const { data: suggestions, isLoading } = useQuery<AISuggestion[]>({
    queryKey: ["/api/ai-suggestions"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/ai-suggestions/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Đã duyệt thành công",
        description: "AI tool đã được thêm vào danh sách",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi duyệt đóng góp",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/ai-suggestions/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      toast({
        title: "Đã từ chối",
        description: "Đóng góp AI đã bị từ chối",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi từ chối đóng góp",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/ai-suggestions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      toast({
        title: "Đã xóa",
        description: "Đóng góp AI đã được xóa",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi xóa đóng góp",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("DELETE", `/api/ai-suggestions/bulk/${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-suggestions"] });
      toast({
        title: "Đã xóa hàng loạt",
        description: "Các đóng góp đã được xóa thành công",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi xóa hàng loạt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredSuggestions = suggestions?.filter(suggestion => {
    if (activeTab === "all") return true;
    return suggestion.status === activeTab;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600">Đã duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Duyệt Đóng góp AI</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Duyệt Đóng góp AI</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("pending")}
          >
            Chờ duyệt ({suggestions?.filter(s => s.status === "pending").length || 0})
          </Button>
          <Button
            variant={activeTab === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("approved")}
          >
            Đã duyệt ({suggestions?.filter(s => s.status === "approved").length || 0})
          </Button>
          <Button
            variant={activeTab === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("rejected")}
          >
            Đã từ chối ({suggestions?.filter(s => s.status === "rejected").length || 0})
          </Button>
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
          >
            Tất cả
          </Button>
        </div>
      </div>

      {/* Bulk delete buttons for approved and rejected tabs */}
      {(activeTab === "approved" || activeTab === "rejected") && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xóa tất cả đóng góp ${activeTab === "approved" ? "đã duyệt" : "đã từ chối"}?`)) {
                bulkDeleteMutation.mutate(activeTab);
              }
            }}
            disabled={bulkDeleteMutation.isPending || filteredSuggestions.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {bulkDeleteMutation.isPending ? "Đang xóa..." : `Xóa tất cả ${activeTab === "approved" ? "đã duyệt" : "đã từ chối"}`}
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuggestions.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Không có đóng góp AI nào</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <Card key={suggestion.id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">
                      {suggestion.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {getStatusBadge(suggestion.status)}
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {suggestion.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {suggestion.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Danh mục:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{suggestion.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Đóng góp bởi:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{suggestion.contributorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ngày:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date(suggestion.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <a 
                    href={suggestion.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 truncate bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                  >
                    🔗 {suggestion.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                {suggestion.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(suggestion.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(suggestion.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối"}
                    </Button>
                  </div>
                )}
                
                {(suggestion.status === "approved" || suggestion.status === "rejected") && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(suggestion.id)}
                      disabled={deleteMutation.isPending}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
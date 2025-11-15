import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Shield, 
  BarChart3, 
  Users, 
  Database,
  Eye,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Upload,
  FileText,
  Download,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { AiTool } from "@shared/schema";
import AdvancedApiKeyManager from "./AdvancedApiKeyManager";
import SecureApiKeyManager from "./SecureApiKeyManager";
import SimpleApiKeyManager from "./SimpleApiKeyManager";
import CSVImportSection from "./CSVImportSection";
import AnalyticsDashboard from "./AnalyticsDashboard";

interface SystemSettings {
  siteName: string;
  maintenance: boolean;
  registrationEnabled: boolean;
  maxAiSuggestionsPerUser: number;
  announcements: string;
}

interface AdminStats {
  totalUsers: number;
  totalAiTools: number;
  totalSuggestions: number;
  activeUsers: number;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingTool, setEditingTool] = useState<AiTool | null>(null);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [toolCategoryFilter, setToolCategoryFilter] = useState("all");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [toolSortBy, setToolSortBy] = useState("newest");
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [newTool, setNewTool] = useState({
    name: "",
    category: "general",
    description: "",
    features: "",
    pricing: "Miễn phí",
    rating: 4,
    website: "",
    field: "game-development"
  });

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: true,
  });

  // Fetch all AI tools for management (includes hidden tools)
  const { data: tools, isLoading } = useQuery<AiTool[]>({
    queryKey: ["/api/admin/tools"],
    enabled: true,
  });

  // Filter and search tools
  const filteredAndSortedTools = tools?.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(toolSearchQuery.toLowerCase());
    const matchesCategory = toolCategoryFilter === "all" || tool.category === toolCategoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (toolSortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return b.id - a.id;
      case "oldest":
        return a.id - b.id;
      case "rating":
        return b.rating - a.rating;
      default:
        return b.id - a.id;
    }
  }) || [];

  // System settings
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "AIverse",
    maintenance: false,
    registrationEnabled: true,
    maxAiSuggestionsPerUser: 5,
    announcements: ""
  });

  // Toggle tool visibility
  const toggleToolVisibility = useMutation({
    mutationFn: async ({ id, visible }: { id: number; visible: boolean }) => {
      const response = await fetch(`/api/admin/tools/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
      if (!response.ok) throw new Error("Failed to update visibility");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái hiển thị",
      });
    },
  });

  // Send announcement
  const sendAnnouncement = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Failed to send announcement");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã gửi thông báo đến tất cả người dùng",
      });
      setSettings(prev => ({ ...prev, announcements: "" }));
    },
  });

  // Update system settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật cài đặt hệ thống",
      });
    },
  });

  // Add new tool
  const addTool = useMutation({
    mutationFn: async (toolData: any) => {
      const response = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...toolData,
          features: toolData.features.split(",").map((f: string) => f.trim())
        }),
      });
      if (!response.ok) throw new Error("Failed to add tool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      setIsAddingTool(false);
      setNewTool({
        name: "",
        category: "general",
        description: "",
        features: "",
        pricing: "Miễn phí",
        rating: 4,
        website: "",
        field: "2d-artist"
      });
      toast({
        title: "Thành công",
        description: "Đã thêm AI tool mới",
      });
    },
  });

  // Delete tool
  const deleteTool = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/tools/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tool");
      return response.json();
    },
    onSuccess: (data, toolId) => {
      // Track admin activity
      if ((window as any).addUserActivity) {
        const deletedTool = filteredAndSortedTools.find(t => t.id === toolId);
        (window as any).addUserActivity({
          type: 'admin_action',
          title: 'Xóa AI tool',
          description: `Đã xóa: ${deletedTool?.name || `Tool ID ${toolId}`}`,
          metadata: { action: 'delete_tool', toolId, toolName: deletedTool?.name }
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Thành công",
        description: "Đã xóa AI tool",
      });
    },
  });

  // Update existing tool
  const updateTool = useMutation({
    mutationFn: async (toolData: any) => {
      const response = await fetch(`/api/admin/tools/${editingTool?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...toolData,
          features: typeof toolData.features === 'string' 
            ? toolData.features.split(",").map((f: string) => f.trim()).filter(Boolean)
            : toolData.features
        }),
      });
      if (!response.ok) throw new Error("Failed to update tool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      setNewTool({
        name: "",
        category: "general",
        description: "",
        features: "",
        pricing: "Free",
        rating: 5,
        website: "",
        field: ""
      });
      setEditingTool(null);
      setIsAddingTool(false);
      toast({
        title: "Thành công",
        description: "Đã cập nhật AI tool",
      });
    },
  });

  const handleAddTool = () => {
    if (!newTool.name || !newTool.description) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ tên và mô tả",
        variant: "destructive",
      });
      return;
    }
    
    if (editingTool) {
      updateTool.mutate(newTool);
    } else {
      addTool.mutate(newTool);
    }
  };

  const handleSendAnnouncement = () => {
    if (!settings.announcements.trim()) {
      toast({
        title: "Thiếu nội dung",
        description: "Vui lòng nhập nội dung thông báo",
        variant: "destructive",
      });
      return;
    }
    sendAnnouncement.mutate(settings.announcements);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AIverse Admin Panel
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Quản lý toàn bộ hệ thống AI tools và người dùng
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200">
                <Shield className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400">
                <Database className="w-3 h-3 mr-1" />
                System Online
              </Badge>
            </div>
          </div>
        </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-6 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  📊 Tổng quan
                </TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  🤖 AI Tools
                </TabsTrigger>
                <TabsTrigger value="apikeys" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  🔑 API Keys
                </TabsTrigger>
                <TabsTrigger value="announcements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  📢 Thông báo
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  ⚙️ Cài đặt
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  📈 Thống kê
                </TabsTrigger>
              </TabsList>
            </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.activeUsers || 0} hoạt động
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Tools</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAiTools || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng số công cụ AI
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đóng góp</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSuggestions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Đề xuất từ người dùng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hệ thống</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  Hoạt động bình thường
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tools Management Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h3 className="text-lg font-semibold">Quản lý AI Tools</h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                placeholder="Tìm kiếm AI tools..."
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <select 
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                value={toolCategoryFilter}
                onChange={(e) => setToolCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="general">🧠 Tổng hợp / Nghiên cứu</option>
                <option value="2d-art">🎨 2D Art & Design</option>
                <option value="3d-modeling">🧱 3D Modeling & Animation</option>
                <option value="animation">🎞️ Animation & Motion Graphics</option>
                <option value="audio">🎵 Audio & Music Generation</option>
                <option value="video">🎬 Video Editing & Production</option>
                <option value="writing">✍️ Writing & Content Creation</option>
                <option value="code">💻 Programming & Development</option>
                <option value="business">📊 Business & Analytics</option>
                <option value="prompt-tools">⚡ Prompt Engineering Tools</option>
                <option value="automation">🤖 Automation & Workflow</option>
                <option value="other">🔧 Khác</option>
              </select>
              <select 
                className="px-3 py-2 border rounded-md w-full sm:w-auto"
                value={toolSortBy}
                onChange={(e) => setToolSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name">Theo tên A-Z</option>
                <option value="rating">Đánh giá cao</option>
              </select>
              <Button onClick={() => setIsAddingTool(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm Tool mới
              </Button>
              <Button variant="outline" onClick={() => setShowCSVImport(!showCSVImport)}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </div>
          </div>

          {showCSVImport && (
            <div className="mb-6">
              <CSVImportSection onImportComplete={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
                queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
                setShowCSVImport(false);
              }} />
            </div>
          )}

          {isAddingTool && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTool ? "Chỉnh sửa AI Tool" : "Thêm AI Tool mới"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tên AI Tool *</label>
                    <Input
                      placeholder="VD: ChatGPT, Midjourney, Stable Diffusion..."
                      value={newTool.name}
                      onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Website URL *</label>
                    <Input
                      placeholder="https://example.com"
                      type="url"
                      value={newTool.website}
                      onChange={(e) => setNewTool({...newTool, website: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Danh mục *</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newTool.category}
                      onChange={(e) => setNewTool({...newTool, category: e.target.value})}
                    >
                      <option value="general">🧠 Tổng hợp / Nghiên cứu</option>
                      <option value="2d-art">🎨 2D Art & Design</option>
                      <option value="3d-modeling">🧱 3D Modeling & Animation</option>
                      <option value="animation">🎞️ Animation & Motion Graphics</option>
                      <option value="audio">🎵 Audio & Music Generation</option>
                      <option value="video">🎬 Video Editing & Production</option>
                      <option value="writing">✍️ Writing & Content Creation</option>
                      <option value="code">💻 Programming & Development</option>
                      <option value="business">📊 Business & Analytics</option>
                      <option value="prompt-tools">⚡ Prompt Engineering Tools</option>
                      <option value="automation">🤖 Automation & Workflow</option>
                      <option value="other">🔧 Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Lĩnh vực ứng dụng *</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newTool.field}
                      onChange={(e) => setNewTool({...newTool, field: e.target.value})}
                    >
                      <option value="2d-artist">2D Artist / UI / Illustration</option>
                      <option value="3d-artist">3D Artist / Modeling / Asset Generation</option>
                      <option value="animator">Animator / Rigging / Mocap</option>
                      <option value="level-designer">Level Designer / Environment</option>
                      <option value="narrative">Narrative / Quest / NPC AI</option>
                      <option value="qa-tester">QA / Game Tester</option>
                      <option value="dev-backend">Dev / Backend / Tools Dev</option>
                      <option value="ai-engineer">AI Engineer / LLM Dev / Agent Dev</option>
                      <option value="data-analyst">Data Analyst / Game Economy</option>
                      <option value="marketing">Marketing / UA / Growth</option>
                      <option value="video-editor">Video Editor / Ads / Trailer</option>
                      <option value="community">Community / CS / LiveOps</option>
                      <option value="hr-training">HR / Onboarding / Training</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Mô tả chi tiết *</label>
                  <Textarea
                    placeholder="Mô tả chức năng, tính năng nổi bật và cách sử dụng AI tool này..."
                    value={newTool.description}
                    onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tính năng (cách nhau bởi dấu phẩy)</label>
                    <Input
                      placeholder="VD: Tạo hình ảnh, Chỉnh sửa ảnh, AI upscale"
                      value={newTool.features}
                      onChange={(e) => setNewTool({...newTool, features: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Giá cả</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newTool.pricing}
                      onChange={(e) => setNewTool({...newTool, pricing: e.target.value})}
                    >
                      <option value="Miễn phí">Miễn phí</option>
                      <option value="Freemium">Freemium</option>
                      <option value="Trả phí">Trả phí</option>
                      <option value="Dùng thử">Dùng thử</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddTool} disabled={!newTool.name || !newTool.description}>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu AI Tool
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingTool(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredAndSortedTools?.map((tool) => (
              <Card key={tool.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{tool.name}</h4>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        {tool.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleToolVisibility.mutate({ 
                          id: tool.id, 
                          visible: (tool as any).visible === false ? true : false
                        })}
                        title={(tool as any).visible === false ? "AI tool đã bị ẩn - Click để hiện" : "AI tool đang hiển thị - Click để ẩn"}
                      >
                        {(tool as any).visible === false ? (
                          <EyeOff className="w-4 h-4 text-red-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTool(tool);
                          setIsAddingTool(true);
                          setNewTool({
                            name: tool.name,
                            category: tool.category,
                            description: tool.description,
                            features: Array.isArray(tool.features) ? tool.features.join(", ") : tool.features,
                            pricing: tool.pricing,
                            rating: tool.rating,
                            website: tool.website || "",
                            field: ""
                          });
                        }}
                        title="Chỉnh sửa AI tool"
                      >
                        <Edit3 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTool.mutate(tool.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Gửi thông báo tới tất cả người dùng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Nhập nội dung thông báo..."
                value={settings.announcements}
                onChange={(e) => setSettings({...settings, announcements: e.target.value})}
                className="min-h-[100px]"
              />
              <Button onClick={handleSendAnnouncement}>
                <Bell className="w-4 h-4 mr-2" />
                Gửi thông báo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Chế độ bảo trì</h4>
                  <p className="text-sm text-muted-foreground">
                    Tạm thời ngừng truy cập website
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, maintenance: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cho phép đăng ký</h4>
                  <p className="text-sm text-muted-foreground">
                    Người dùng mới có thể tạo tài khoản
                  </p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, registrationEnabled: checked})
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Giới hạn đóng góp AI mỗi người dùng
                </label>
                <Input
                  type="number"
                  value={settings.maxAiSuggestionsPerUser}
                  onChange={(e) => setSettings({
                    ...settings, 
                    maxAiSuggestionsPerUser: parseInt(e.target.value) || 5
                  })}
                />
              </div>

              <Button onClick={() => updateSettings.mutate(settings)}>
                <Save className="w-4 h-4 mr-2" />
                Lưu cài đặt
              </Button>
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="apikeys" className="space-y-6">
          <SimpleApiKeyManager />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tính năng thống kê chi tiết sẽ được phát triển trong phiên bản tiếp theo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>
          </Tabs>
        </div>
      </div>
    );
}
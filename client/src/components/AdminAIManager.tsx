import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AiTool {
  id: number;
  name: string;
  category: string;
  description: string;
  features: string[];
  pricing: string;
  rating: number;
  website: string | null;
  visible?: boolean | null;
}

export default function AdminAIManager() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [newTool, setNewTool] = useState({
    name: "",
    category: "general",
    description: "",
    features: "",
    pricing: "",
    rating: 4,
    website: ""
  });

  const [editTool, setEditTool] = useState<Partial<AiTool>>({});

  const { data: tools, isLoading } = useQuery<AiTool[]>({
    queryKey: ["/api/admin/tools"],
  });

  const categories = [
    { value: "all", label: "Tất cả phòng ban" },
    { value: "general", label: "🧠 Tổng hợp / Nghiên cứu AI" },
    { value: "2d-art", label: "🎨 Phòng 2D Art" },
    { value: "3d-modeling", label: "🧱 Phòng 3D Modeling" },
    { value: "animation", label: "🎞️ Phòng Animation" },
    { value: "audio", label: "🎵 Phòng Audio & Music" },
    { value: "coding", label: "💻 Phòng Development" },
    { value: "video", label: "🎬 Phòng Video Editor" },
    { value: "writing", label: "✍️ Phòng Content Creation" },
    { value: "business", label: "💼 Phòng Business & Analytics" },
    { value: "testing", label: "🧪 Phòng QA/Tester" },
    { value: "backend", label: "⚙️ Phòng Backend" },
    { value: "gamedesign", label: "🎮 Phòng Game Design" },
    { value: "data", label: "📊 Phòng Data Science" },
    { value: "hr", label: "👥 Phòng HR" }
  ];

  const addMutation = useMutation({
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
      setIsAddingNew(false);
      setNewTool({
        name: "",
        category: "general",
        description: "",
        features: "",
        pricing: "",
        rating: 4,
        website: ""
      });
      toast({
        title: "Thành công",
        description: "AI tool đã được thêm",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm AI tool",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/tools/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          features: typeof data.features === 'string' 
            ? data.features.split(",").map((f: string) => f.trim())
            : data.features
        }),
      });
      if (!response.ok) throw new Error("Failed to update tool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      setEditingId(null);
      setEditTool({});
      toast({
        title: "Thành công",
        description: "AI tool đã được cập nhật",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật AI tool",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/tools/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      toast({
        title: "Thành công",
        description: "AI tool đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa AI tool",
        variant: "destructive",
      });
    },
  });

  const filteredTools = tools?.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleEdit = (tool: AiTool) => {
    setEditingId(tool.id);
    setEditTool({
      ...tool,
      features: Array.isArray(tool.features) ? tool.features.join(", ") : (tool.features || "")
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editTool) {
      updateMutation.mutate({ id: editingId, data: editTool });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTool({});
  };

  const handleAddNew = () => {
    addMutation.mutate(newTool);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa AI tool này?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Quản lý AI Tools</h2>
        </div>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý AI Tools</h2>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm AI Tool
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Tìm kiếm AI tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add New Tool Form */}
      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm AI Tool Mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tên AI Tool</label>
                <Input
                  value={newTool.name}
                  onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  placeholder="ChatGPT, Midjourney..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Danh mục</label>
                <Select value={newTool.category} onValueChange={(value) => setNewTool({ ...newTool, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                placeholder="Mô tả chi tiết về AI tool..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Features (phân cách bằng dấu phẩy)</label>
                <Input
                  value={newTool.features}
                  onChange={(e) => setNewTool({ ...newTool, features: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pricing</label>
                <Input
                  value={newTool.pricing}
                  onChange={(e) => setNewTool({ ...newTool, pricing: e.target.value })}
                  placeholder="Free, $20/month, Custom..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={newTool.website}
                  onChange={(e) => setNewTool({ ...newTool, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rating (1-50)</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={newTool.rating}
                  onChange={(e) => setNewTool({ ...newTool, rating: parseInt(e.target.value) || 4 })}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddNew} disabled={addMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tools List */}
      <div className="grid gap-4">
        {filteredTools.map((tool) => (
          <Card key={tool.id}>
            <CardContent className="p-6">
              {editingId === tool.id ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tên</label>
                      <Input
                        value={editTool.name || ""}
                        onChange={(e) => setEditTool({ ...editTool, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Danh mục</label>
                      <Select value={editTool.category} onValueChange={(value) => setEditTool({ ...editTool, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Mô tả</label>
                    <Textarea
                      value={editTool.description || ""}
                      onChange={(e) => setEditTool({ ...editTool, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Features</label>
                      <Input
                        value={editTool.features || ""}
                        onChange={(e) => setEditTool({ ...editTool, features: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Pricing</label>
                      <Input
                        value={editTool.pricing || ""}
                        onChange={(e) => setEditTool({ ...editTool, pricing: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{tool.name}</h3>
                      <Badge variant="secondary">{tool.category}</Badge>
                      <Badge variant="outline">Rating: {tool.rating}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(tool)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(tool.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(tool.features) && tool.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Pricing: {tool.pricing}</span>
                    {tool.website && (
                      <a 
                        href={tool.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Không tìm thấy AI tools nào</p>
        </div>
      )}
    </div>
  );
}
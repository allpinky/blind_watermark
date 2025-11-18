import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, TestTube, ToggleLeft, ToggleRight, Upload, Key, Activity, Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ApiKey {
  id: number;
  provider: string;
  keyAlias: string;
  isActive: boolean;
  usageCount: number;
  errorCount: number;
  lastUsed: string | null;
  createdAt: string;
}

interface KeyStats {
  [provider: string]: {
    total: number;
    active: number;
    errors: number;
    totalUsage: number;
  };
}

export default function SimpleApiKeyManager() {
  const [adminSecret, setAdminSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [keysInput, setKeysInput] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getHeaders = () => {
    if (!authenticated) return {};
    return { 'x-admin-secret': adminSecret };
  };

  // Authenticate function
  const handleAuthenticate = async () => {
    if (!adminSecret) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập admin secret",
        variant: "destructive"
      });
      return;
    }

    try {
      // Test authentication by calling API
      const response = await fetch("/api/admin/secure-keys", {
        headers: { 'x-admin-secret': adminSecret }
      });

      if (response.ok) {
        setAuthenticated(true);
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đến với hệ thống quản lý API Key",
          variant: "default"
        });
      } else {
        toast({
          title: "Sai mật khẩu",
          description: "Admin secret không đúng",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive"
      });
    }
  };

  // Query for key statistics
  const { data: keyStats, isLoading: statsLoading } = useQuery<KeyStats>({
    queryKey: ["/api/admin/secure-keys"],
    enabled: authenticated,
    queryFn: async () => {
      const response = await fetch("/api/admin/secure-keys", { 
        headers: getHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  // Query for key list
  const { data: keysList, isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/admin/secure-keys/list"],
    enabled: authenticated,
    queryFn: async () => {
      const response = await fetch("/api/admin/secure-keys/list", { 
        headers: getHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch keys");
      return response.json();
    }
  });

  // Import keys mutation
  const importKeysMutation = useMutation({
    mutationFn: async ({ provider, keys }: { provider: string; keys: string[] }) => {
      const response = await fetch("/api/admin/secure-keys/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders()
        },
        body: JSON.stringify({ provider, keys })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import thành công",
        description: `Đã import ${data.imported} keys, bỏ qua ${data.skipped} keys trùng lặp`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys/list"] });
      setKeysInput("");
    },
    onError: (error: any) => {
      toast({
        title: "Import thất bại",
        description: error.message || "Không thể import API keys",
        variant: "destructive"
      });
    }
  });

  // Toggle key status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ keyId, isActive }: { keyId: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/secure-keys/${keyId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders()
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys"] });
      toast({
        title: "Cập nhật thành công",
        description: "Đã cập nhật trạng thái API key"
      });
    }
  });

  // Delete key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await fetch(`/api/admin/secure-keys/${keyId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error("Failed to delete key");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys"] });
      toast({
        title: "Xóa thành công",
        description: "Đã xóa API key"
      });
    }
  });

  // Test key mutation
  const testKeyMutation = useMutation({
    mutationFn: async ({ keyId, provider }: { keyId: number; provider: string }) => {
      const response = await fetch(`/api/admin/secure-keys/${keyId}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders()
        },
        body: JSON.stringify({ provider })
      });
      
      if (!response.ok) throw new Error("Failed to test key");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Test thành công" : "Test thất bại",
        description: data.success ? "API key hoạt động bình thường" : data.error,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  // Check quota mutation
  const checkQuotaMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await fetch(`/api/admin/secure-keys/${keyId}/quota`, {
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error("Failed to check quota");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Thông tin Token Quota",
        description: `Còn lại: ${data.remaining} ${data.type} (${data.total} tổng)`,
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Lỗi kiểm tra quota",
        description: "Không thể kiểm tra thông tin quota",
        variant: "destructive"
      });
    }
  });

  const handleImportKeys = () => {
    const keys = keysInput
      .split('\n')
      .map(key => key.trim())
      .filter(key => key.length > 0);

    if (keys.length === 0) {
      toast({
        title: "Không có key hợp lệ",
        description: "Vui lòng nhập ít nhất một API key",
        variant: "destructive"
      });
      return;
    }

    importKeysMutation.mutate({ provider: selectedProvider, keys });
  };

  const providers = [
    { value: "openai", label: "OpenAI", icon: "🤖" },
    { value: "google", label: "Google AI", icon: "🌟" },
    { value: "anthropic", label: "Anthropic", icon: "🧠" },
    { value: "elevenlabs", label: "ElevenLabs", icon: "🔊" },
    { value: "mistral", label: "Mistral AI", icon: "⚡" }
  ];

  // Login form
  if (!authenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Xác thực Admin
          </CardTitle>
          <CardDescription>
            Nhập mật khẩu admin để truy cập hệ thống quản lý API Key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-secret">Admin Secret</Label>
            <Input
              id="admin-secret"
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Nhập mật khẩu admin"
              onKeyPress={(e) => e.key === 'Enter' && handleAuthenticate()}
            />
          </div>
          <Button onClick={handleAuthenticate} className="w-full">
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            Quản lý API Keys bảo mật
          </h1>
          <p className="text-muted-foreground">
            Import và quản lý API keys được mã hóa cho các dịch vụ AI
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setAuthenticated(false);
            setAdminSecret("");
          }}
        >
          Đăng xuất
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">📊 Tổng quan</TabsTrigger>
          <TabsTrigger value="import">📥 Import Keys</TabsTrigger>
          <TabsTrigger value="manage">🔧 Quản lý Keys</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyStats && Object.entries(keyStats).map(([provider, stats]) => (
              <Card key={provider}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {providers.find(p => p.value === provider)?.icon || "🔑"}
                    {providers.find(p => p.value === provider)?.label || provider}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tổng keys:</span>
                    <Badge variant="outline">{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Đang hoạt động:</span>
                    <Badge variant="default">{stats.active}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lỗi:</span>
                    <Badge variant="destructive">{stats.errors}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lượt sử dụng:</span>
                    <Badge variant="secondary">{stats.totalUsage}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import API Keys</CardTitle>
              <CardDescription>
                Thêm API keys mới vào hệ thống (mỗi key một dòng)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Chọn nhà cung cấp</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.icon} {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="keys">API Keys (mỗi key một dòng)</Label>
                <Textarea
                  id="keys"
                  placeholder="sk-..."
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Nhập mỗi API key trên một dòng riêng biệt
                </p>
              </div>

              <Button 
                onClick={handleImportKeys} 
                disabled={importKeysMutation.isPending || !keysInput.trim()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {importKeysMutation.isPending ? "Đang import..." : "Import Keys"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý API Keys</CardTitle>
              <CardDescription>
                Xem, kiểm tra và quản lý các API keys đã import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="provider-filter">Lọc theo Provider:</Label>
                    <Select value={filterProvider} onValueChange={setFilterProvider}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Chọn provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🔗 Tất cả</SelectItem>
                        {providers.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.icon} {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKeys(!showKeys)}
                    >
                      {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showKeys ? "Ẩn keys" : "Hiện keys"}
                    </Button>
                  </div>
                </div>
                {keysLoading ? (
                  <div className="text-center py-4">Đang tải...</div>
                ) : keysList && keysList.length > 0 ? (
                  keysList
                    .filter(key => filterProvider === "all" || key.provider === filterProvider)
                    .map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {providers.find(p => p.value === key.provider)?.icon || "🔑"}
                            {providers.find(p => p.value === key.provider)?.label || key.provider}
                          </Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showKeys ? key.keyAlias : key.keyAlias.substring(0, 12) + "..."}
                          </code>
                          {key.isActive ? (
                            <Badge variant="default">Hoạt động</Badge>
                          ) : (
                            <Badge variant="secondary">Tạm dừng</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>
                            Đã dùng {key.usageCount} lần • {key.errorCount} lỗi
                            {key.lastUsed && (
                              <> • Lần cuối: {new Date(key.lastUsed).toLocaleString('vi-VN')}</>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Token còn lại:</span>
                            {key.provider === 'openai' && (
                              <Badge variant="outline" className="text-xs">Unlimited</Badge>
                            )}
                            {key.provider === 'google' && (
                              <Badge variant="outline" className="text-xs">~1M tokens/tháng</Badge>
                            )}
                            {key.provider === 'anthropic' && (
                              <Badge variant="outline" className="text-xs">Claude Credits</Badge>
                            )}
                            {key.provider === 'elevenlabs' && (
                              <Badge variant="outline" className="text-xs">10k chars/tháng</Badge>
                            )}
                            {key.provider === 'mistral' && (
                              <Badge variant="outline" className="text-xs">API Credits</Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => checkQuotaMutation.mutate(key.id)}
                              disabled={checkQuotaMutation.isPending}
                              className="text-xs h-6 px-2"
                            >
                              {checkQuotaMutation.isPending ? "Kiểm tra..." : "Quota"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testKeyMutation.mutate({ keyId: key.id, provider: key.provider })}
                          disabled={testKeyMutation.isPending}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatusMutation.mutate({ keyId: key.id, isActive: !key.isActive })}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {key.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteKeyMutation.mutate(key.id)}
                          disabled={deleteKeyMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có API keys nào. Hãy import keys ở tab "Import Keys"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
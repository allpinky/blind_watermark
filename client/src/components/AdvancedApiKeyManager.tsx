import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Upload, 
  Key, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  TestTube,
  Coins,
  Activity,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdvancedApiKeyManager() {
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [newKey, setNewKey] = useState({ provider: "elevenlabs", key: "" });
  const [bulkKeys, setBulkKeys] = useState("");
  const [editingKey, setEditingKey] = useState<any>(null);
  const { toast } = useToast();

  // Fetch API key stats
  const { data: keyStats, isLoading } = useQuery({
    queryKey: ["/api/admin/apikeys"],
    refetchInterval: 30000,
  });

  // Add single key
  const addKeyMutation = useMutation({
    mutationFn: async ({ provider, key }: { provider: string; key: string }) => {
      const response = await apiRequest(`/api/admin/apikeys/${provider}`, "POST", { key });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
      setNewKey({ provider: "elevenlabs", key: "" });
      toast({
        title: "Thành công",
        description: "Đã thêm API key mới",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm API key",
        variant: "destructive",
      });
    },
  });

  // Bulk import
  const bulkImportMutation = useMutation({
    mutationFn: async ({ provider, keys }: { provider: string; keys: string[] }) => {
      const response = await apiRequest("/api/admin/apikeys/bulk", "POST", { provider, keys });
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
      setBulkKeys("");
      toast({
        title: "Import thành công",
        description: `Đã import ${data.imported} keys, bỏ qua ${data.skipped} keys`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi import",
        description: error.message || "Không thể import keys",
        variant: "destructive",
      });
    },
  });

  const handleBulkImport = () => {
    if (!bulkKeys.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập API keys",
        variant: "destructive",
      });
      return;
    }

    const keys = bulkKeys
      .split('\n')
      .map(key => key.trim())
      .filter(key => key.length > 10);

    if (keys.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy API keys hợp lệ",
        variant: "destructive",
      });
      return;
    }

    bulkImportMutation.mutate({
      provider: newKey.provider,
      keys
    });
  };

  const getProviderDisplayName = (provider: string) => {
    const names: {[key: string]: string} = {
      elevenlabs: "ElevenLabs",
      google: "Google/Gemini", 
      openai: "OpenAI",
      anthropic: "Anthropic",
      mistral: "Mistral"
    };
    return names[provider] || provider;
  };

  const testAllKeys = async (provider: string) => {
    try {
      const response = await fetch(`/api/admin/apikeys/${provider}/test-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      const successCount = result.results.filter((r: any) => r.success).length;
      const failCount = result.results.length - successCount;

      toast({
        title: `Test ${getProviderDisplayName(provider)} hoàn tất`,
        description: `${successCount} thành công, ${failCount} thất bại`,
        variant: successCount > failCount ? "default" : "destructive",
      });

      // Show detailed results
      result.results.forEach((r: any, index: number) => {
        setTimeout(() => {
          toast({
            title: `${r.keyId}`,
            description: r.success 
              ? `OK (${r.responseTime}ms)${r.tokensRemaining ? ` - ${r.tokensRemaining.toLocaleString()} tokens` : ''}`
              : `Lỗi: ${r.error}`,
            variant: r.success ? "default" : "destructive",
          });
        }, index * 200); // Stagger notifications
      });

      // Refresh data immediately after test all
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
    } catch (error) {
      toast({
        title: "Lỗi test hàng loạt",
        description: "Không thể test tất cả keys",
        variant: "destructive",
      });
    }
  };

  const deleteKey = async (provider: string, fullKey: string) => {
    try {
      await fetch(`/api/admin/apikeys/${provider}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyValue: fullKey })
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
      toast({
        title: "Đã xóa",
        description: "API key đã được xóa thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa API key",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Quản lý API Keys Nâng cao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Quản lý API Keys Nâng cao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="manage">Quản lý chi tiết</TabsTrigger>
            <TabsTrigger value="add">Thêm keys</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {keyStats && Object.entries(keyStats as Record<string, any>).map(([provider, stats]) => (
              <Card key={provider}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{getProviderDisplayName(provider)}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testAllKeys(provider)}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Test tất cả
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-green-600">{stats?.activeKeys || 0}</div>
                      <div className="text-muted-foreground">Hoạt động</div>
                    </div>
                    <div>
                      <div className="font-semibold text-red-600">{(stats?.totalKeys || 0) - (stats?.activeKeys || 0)}</div>
                      <div className="text-muted-foreground">Ngưng hoạt động</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600">{stats?.totalUsage || 0}</div>
                      <div className="text-muted-foreground">Tổng lượt sử dụng</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">{stats?.totalKeys || 0}</div>
                      <div className="text-muted-foreground">Tổng keys</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            {keyStats && Object.entries(keyStats as Record<string, any>).map(([provider, stats]) => {
              const showProvider = showKeys[provider] ?? false;
              return (
                <Card key={provider}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{getProviderDisplayName(provider)}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testAllKeys(provider)}
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          Test tất cả
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKeys(prev => ({...prev, [provider]: !showProvider}))}
                        >
                          {showProvider ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {showProvider ? 'Ẩn' : 'Hiện'} ({stats?.totalKeys || 0})
                        </Button>
                        <Badge variant="secondary">
                          {stats?.activeKeys || 0} hoạt động / {stats?.totalKeys || 0} tổng
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {showProvider && (
                    <CardContent>
                      <div className="space-y-3">
                        {stats?.keys && stats.keys.length > 0 ? (
                          stats.keys.map((key: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  {key.isActive ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  )}
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {key.id}
                                  </code>
                                </div>
                                <div className="text-sm text-muted-foreground flex gap-4">
                                  <span className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {key.usageCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    {key.errorCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Coins className="w-3 h-3" />
                                    {key.tokensRemaining !== undefined ? 
                                      key.tokensRemaining.toLocaleString() : 
                                      'Chưa kiểm tra'
                                    }
                                  </span>
                                  <span>
                                    {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString('vi-VN') : 'Chưa dùng'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingKey({...key, provider})}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Chi tiết API Key</DialogTitle>
                                    </DialogHeader>
                                    {editingKey && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Provider</Label>
                                            <div className="p-2 bg-muted rounded">{getProviderDisplayName(editingKey.provider)}</div>
                                          </div>
                                          <div>
                                            <Label>Trạng thái</Label>
                                            <div className="flex items-center gap-2 p-2">
                                              {editingKey.isActive ? (
                                                <>
                                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                                  <span>Hoạt động</span>
                                                </>
                                              ) : (
                                                <>
                                                  <XCircle className="w-4 h-4 text-red-500" />
                                                  <span>Ngưng hoạt động</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <Label>API Key đầy đủ</Label>
                                          <Textarea
                                            value={editingKey.fullKey}
                                            readOnly
                                            className="font-mono text-xs"
                                            rows={3}
                                          />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <Label>Lượt sử dụng</Label>
                                            <div className="p-2 bg-muted rounded">{editingKey.usageCount || 0}</div>
                                          </div>
                                          <div>
                                            <Label>Số lỗi</Label>
                                            <div className="p-2 bg-muted rounded">{editingKey.errorCount || 0}</div>
                                          </div>
                                          <div>
                                            <Label>Lần cuối sử dụng</Label>
                                            <div className="p-2 bg-muted rounded text-xs">
                                              {editingKey.lastUsed ? new Date(editingKey.lastUsed).toLocaleString('vi-VN') : 'Chưa dùng'}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              fetch(`/api/admin/apikeys/${editingKey.provider}/test`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ keyValue: editingKey.fullKey })
                                              }).then(res => res.json()).then(result => {
                                                toast({
                                                  title: result.success ? "API key hoạt động" : "API key lỗi",
                                                  description: result.success 
                                                    ? `Phản hồi: ${result.responseTime}ms${result.tokensRemaining ? ` - ${result.tokensRemaining.toLocaleString()} tokens còn lại` : ''}`
                                                    : result.error || "Không thể kết nối",
                                                  variant: result.success ? "default" : "destructive",
                                                });
                                                // Refresh data immediately
                                                queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
                                              });
                                            }}
                                          >
                                            <TestTube className="w-4 h-4 mr-2" />
                                            Test Key
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => {
                                              if (confirm('Bạn có chắc muốn xóa API key này không?')) {
                                                deleteKey(editingKey.provider, editingKey.fullKey);
                                                setEditingKey(null);
                                              }
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Xóa Key
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    fetch(`/api/admin/apikeys/${provider}/test`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ keyValue: key.fullKey })
                                    }).then(res => res.json()).then(result => {
                                      toast({
                                        title: result.success ? "API key hoạt động" : "API key lỗi",
                                        description: result.success 
                                          ? `Phản hồi: ${result.responseTime}ms${result.tokensRemaining ? ` - ${result.tokensRemaining.toLocaleString()} tokens` : ''}`
                                          : result.error || "Không thể kết nối",
                                        variant: result.success ? "default" : "destructive",
                                      });
                                      // Refresh data immediately after test
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
                                    });
                                  }}
                                >
                                  Test
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Bạn có chắc muốn xóa API key này không?')) {
                                      deleteKey(provider, key.fullKey);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            Chưa có API keys cho {getProviderDisplayName(provider)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Thêm API Key đơn lẻ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newKey.provider}
                      onChange={(e) => setNewKey({...newKey, provider: e.target.value})}
                    >
                      <option value="elevenlabs">ElevenLabs</option>
                      <option value="google">Google/Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="mistral">Mistral</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apikey">API Key</Label>
                    <Input
                      id="apikey"
                      placeholder="Nhập API key..."
                      value={newKey.key}
                      onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                    />
                  </div>
                  <Button
                    onClick={() => addKeyMutation.mutate(newKey)}
                    disabled={addKeyMutation.isPending || !newKey.key.trim()}
                    className="w-full"
                  >
                    {addKeyMutation.isPending ? "Đang thêm..." : "Thêm API Key"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import hàng loạt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-bulk">Provider</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newKey.provider}
                      onChange={(e) => setNewKey({...newKey, provider: e.target.value})}
                    >
                      <option value="elevenlabs">ElevenLabs</option>
                      <option value="google">Google/Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="mistral">Mistral</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-keys">API Keys (mỗi key một dòng)</Label>
                    <Textarea
                      id="bulk-keys"
                      placeholder="sk_key1&#10;sk_key2&#10;sk_key3"
                      value={bulkKeys}
                      onChange={(e) => setBulkKeys(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button
                    onClick={handleBulkImport}
                    disabled={bulkImportMutation.isPending || !bulkKeys.trim()}
                    className="w-full"
                  >
                    {bulkImportMutation.isPending ? "Đang import..." : "Import Keys"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
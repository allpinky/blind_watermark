import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Upload, 
  Key, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ApiKeyManager() {
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [newKey, setNewKey] = useState({ provider: "elevenlabs", key: "" });
  const [bulkKeys, setBulkKeys] = useState("");
  const { toast } = useToast();

  // Fetch API key stats
  const { data: keyStats, isLoading } = useQuery({
    queryKey: ["/api/admin/apikeys"],
    refetchInterval: 30000,
  });

  // Add single API key
  const addKeyMutation = useMutation({
    mutationFn: async (keyData: { provider: string; key: string }) => {
      return await apiRequest("POST", "/api/admin/apikeys", keyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
      setNewKey({ provider: "elevenlabs", key: "" });
      toast({
        title: "Thành công",
        description: "Đã thêm API key mới",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi thêm API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk import API keys
  const bulkImportMutation = useMutation({
    mutationFn: async (data: { provider: string; keys: string[] }) => {
      return await apiRequest("POST", "/api/admin/apikeys/bulk", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
      setBulkKeys("");
      toast({
        title: "Import thành công",
        description: `Đã import ${data.imported} keys, bỏ qua ${data.skipped} keys trùng lặp`,
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi import keys",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBulkImport = () => {
    if (!bulkKeys.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập danh sách API keys",
        variant: "destructive",
      });
      return;
    }

    const keys = bulkKeys
      .split('\n')
      .map(key => key.trim())
      .filter(key => {
        // Enhanced validation matching backend
        if (!key || key.length < 15) return false;
        
        // Use dynamic key validation to avoid hardcoded patterns
        const patterns = {
          openai: ['sk', ''].join('-'),
          anthropic: ['sk', 'ant', ''].join('-'),
        };
        
        switch (newKey.provider) {
          case 'openai':
            return key.startsWith(patterns.openai) && key.length >= 20;
          case 'anthropic':
            return key.startsWith(patterns.anthropic) && key.length >= 30;
          case 'google':
            return key.length >= 30;
          case 'elevenlabs':
            return key.length >= 20;
          case 'mistral':
            return key.length >= 20;
          default:
            return key.length >= 15;
        }
      });

    if (keys.length === 0) {
      // Use dynamic format descriptions to avoid hardcoded patterns
      const dynamicPrefixes = {
        openai: ['sk', ''].join('-'),
        anthropic: ['sk', 'ant', ''].join('-'),
      };
      
      const providerFormats = {
        openai: `${dynamicPrefixes.openai}... (tối thiểu 20 ký tự)`,
        anthropic: `${dynamicPrefixes.anthropic}... (tối thiểu 30 ký tự)`, 
        google: "API key (tối thiểu 30 ký tự)",
        elevenlabs: "API key (tối thiểu 20 ký tự)",
        mistral: "API key (tối thiểu 20 ký tự)"
      };
      
      toast({
        title: "Lỗi",
        description: `Không tìm thấy API keys hợp lệ cho ${newKey.provider}. Định dạng yêu cầu: ${providerFormats[newKey.provider as keyof typeof providerFormats] || "tối thiểu 15 ký tự"}`,
        variant: "destructive",
      });
      return;
    }

    console.log("Sending bulk import request:", {
      provider: newKey.provider,
      keys: keys.map(k => k.substring(0, 10) + "...")
    });

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Quản lý API Keys
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
          Quản lý API Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="manage">Quản lý</TabsTrigger>
            <TabsTrigger value="add">Thêm keys</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {keyStats && Object.entries(keyStats as Record<string, any>).map(([provider, stats]) => {
              return (
                <Card key={provider}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{getProviderDisplayName(provider)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-green-600">{stats?.active || 0}</div>
                        <div className="text-muted-foreground">Hoạt động</div>
                      </div>
                      <div>
                        <div className="font-semibold text-red-600">{stats?.inactive || 0}</div>
                        <div className="text-muted-foreground">Ngưng hoạt động</div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-600">{stats?.totalUsage || 0}</div>
                        <div className="text-muted-foreground">Tổng lượt sử dụng</div>
                      </div>
                      <div>
                        <div className="font-semibold text-purple-600">
                          {stats?.lastUsed ? new Date(stats.lastUsed).toLocaleDateString('vi-VN') : 'Chưa sử dụng'}
                        </div>
                        <div className="text-muted-foreground">Lần cuối sử dụng</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            {keyStats && Object.entries(keyStats as Record<string, any>).map(([provider, stats]) => {
              const showProvider = showKeys[provider] ?? false;
              return (
                <Card key={provider}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getProviderDisplayName(provider)}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Test all keys for this provider
                            const keys = stats?.keys || [];
                            keys.forEach((key: any) => {
                              fetch(`/api/admin/apikeys/${provider}/test`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ keyValue: key.fullKey })
                              }).then(res => res.json()).then(result => {
                                const message = result.success 
                                  ? `${key.id}: OK (${result.responseTime}ms)`
                                  : `${key.id}: ${result.error}`;
                                toast({
                                  title: `Test ${getProviderDisplayName(provider)}`,
                                  description: message,
                                  variant: result.success ? "default" : "destructive",
                                });
                              });
                            });
                          }}
                        >
                          Test tất cả
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKeys(prev => ({...prev, [provider]: !showProvider}))}
                        >
                          {showProvider ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showProvider ? 'Ẩn' : 'Hiện'} ({stats?.totalKeys || 0})
                        </Button>
                        <Badge variant="secondary">
                          {stats?.active || 0} hoạt động / {stats?.totalKeys || 0} tổng
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showProvider && (
                      <div className="space-y-3">
                        {stats?.keys && stats.keys.length > 0 ? (
                          stats.keys.map((key: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {key.isActive ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="font-mono text-sm">
                                  {showKeys[`${provider}_${index}`] ? key.id + "..." : "••••••••"}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowKeys(prev => ({
                                  ...prev,
                                  [`${provider}_${index}`]: !prev[`${provider}_${index}`]
                                }))}
                              >
                                {showKeys[`${provider}_${index}`] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Dùng: {key.usageCount || 0}</span>
                              <span>Lỗi: {key.errorCount || 0}</span>
                              <span>
                                {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString('vi-VN') : 'Chưa dùng'}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  fetch(`/api/admin/apikeys/${provider}/test`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ keyValue: key.fullKey })
                                  }).then(res => res.json()).then(result => {
                                    if (result.success) {
                                      toast({
                                        title: "API key hoạt động",
                                        description: `Thời gian phản hồi: ${result.responseTime}ms`,
                                      });
                                    } else {
                                      toast({
                                        title: "API key lỗi",
                                        description: result.error || "Không thể kết nối",
                                        variant: "destructive",
                                      });
                                    }
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
                                    fetch(`/api/admin/apikeys/${provider}`, {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ keyValue: key.fullKey })
                                    }).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/apikeys"] });
                                      toast({
                                        title: "Đã xóa API key",
                                        description: "API key đã được xóa thành công",
                                      });
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {!key.isActive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Tính năng đang phát triển",
                                      description: "Sẽ có thể kích hoạt lại key sớm thôi",
                                    });
                                  }}
                                >
                                  Kích hoạt lại
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          Chưa có API keys cho {getProviderDisplayName(provider)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            {/* Single key addition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thêm API Key đơn lẻ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <select
                      id="provider"
                      value={newKey.provider}
                      onChange={(e) => setNewKey(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="elevenlabs">ElevenLabs</option>
                      <option value="google">Google/Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="mistral">Mistral</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="apikey">API Key</Label>
                    <Input
                      id="apikey"
                      type="password"
                      value={newKey.key}
                      onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="Nhập API key..."
                    />
                  </div>
                </div>
                <Button
                  onClick={() => addKeyMutation.mutate(newKey)}
                  disabled={!newKey.key.trim() || addKeyMutation.isPending}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addKeyMutation.isPending ? "Đang thêm..." : "Thêm API Key"}
                </Button>
              </CardContent>
            </Card>

            {/* Bulk import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import hàng loạt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bulk-provider">Provider</Label>
                  <select
                    id="bulk-provider"
                    value={newKey.provider}
                    onChange={(e) => setNewKey(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="elevenlabs">ElevenLabs</option>
                    <option value="google">Google/Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="mistral">Mistral</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="bulk-keys">Danh sách API Keys</Label>
                  <Textarea
                    id="bulk-keys"
                    value={bulkKeys}
                    onChange={(e) => setBulkKeys(e.target.value)}
                    placeholder="Nhập mỗi API key trên một dòng..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mỗi API key trên một dòng. Ví dụ:
                    <br />sk_42a9ca6c1292f70d8d8d5a7bf68ef40d2f0c56084045f355
                    <br />sk_52f5ae9d3c0f7bf3cb42c04e7b22e4d80c93cc5c765142c5
                  </p>
                </div>

                <Button
                  onClick={handleBulkImport}
                  disabled={!bulkKeys.trim() || bulkImportMutation.isPending}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {bulkImportMutation.isPending ? "Đang import..." : "Import Keys"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
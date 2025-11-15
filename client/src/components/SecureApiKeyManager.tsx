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
import { Trash2, TestTube, ToggleLeft, ToggleRight, Upload, Key, Activity, Shield } from "lucide-react";
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

export default function SecureApiKeyManager() {
  const [adminSecret, setAdminSecret] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [keysInput, setKeysInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const headers = adminSecret ? { 'x-admin-secret': adminSecret } : {};

  // Query for key statistics
  const { data: keyStats } = useQuery<KeyStats>({
    queryKey: ["/api/admin/secure-keys"],
    enabled: !!adminSecret,
    queryFn: () => apiRequest("/api/admin/secure-keys", { headers })
  });

  // Query for key list
  const { data: keysList } = useQuery<ApiKey[]>({
    queryKey: ["/api/admin/secure-keys/list"],
    enabled: !!adminSecret,
    queryFn: () => apiRequest("/api/admin/secure-keys/list", { headers })
  });

  // Import keys mutation
  const importKeysMutation = useMutation({
    mutationFn: async ({ provider, keys }: { provider: string; keys: string[] }) => {
      return apiRequest("/api/admin/secure-keys/import", {
        method: "POST",
        headers,
        body: { provider, keys }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Imported ${data.imported} keys, skipped ${data.skipped} duplicates`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys/list"] });
      setKeysInput("");
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import API keys",
        variant: "destructive"
      });
    }
  });

  // Toggle key status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ keyId, isActive }: { keyId: number; isActive: boolean }) => {
      return apiRequest(`/api/admin/secure-keys/${keyId}/status`, {
        method: "PUT",
        headers,
        body: { isActive }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys"] });
    }
  });

  // Delete key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      return apiRequest(`/api/admin/secure-keys/${keyId}`, {
        method: "DELETE",
        headers
      });
    },
    onSuccess: () => {
      toast({
        title: "Key Deleted",
        description: "API key has been successfully deleted",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/secure-keys"] });
    }
  });

  // Test key mutation
  const testKeyMutation = useMutation({
    mutationFn: async ({ keyId, provider }: { keyId: number; provider: string }) => {
      return apiRequest(`/api/admin/secure-keys/${keyId}/test`, {
        method: "POST",
        headers,
        body: { provider }
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: data.success ? "Key Valid" : "Key Invalid",
        description: data.error || "API key test completed",
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  const handleImport = () => {
    if (!keysInput.trim()) {
      toast({
        title: "No Keys Provided",
        description: "Please enter API keys to import",
        variant: "destructive"
      });
      return;
    }

    const keys = keysInput
      .split('\n')
      .map(key => key.trim())
      .filter(key => key.length > 0);

    if (keys.length === 0) {
      toast({
        title: "No Valid Keys",
        description: "Please provide valid API keys",
        variant: "destructive"
      });
      return;
    }

    importKeysMutation.mutate({ provider: selectedProvider, keys });
  };

  const providers = [
    { value: "openai", label: "OpenAI" },
    { value: "google", label: "Google AI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "elevenlabs", label: "ElevenLabs" },
    { value: "mistral", label: "Mistral AI" }
  ];

  if (!adminSecret) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Authentication Required
          </CardTitle>
          <CardDescription>
            Enter admin secret to access secure API key management
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
              placeholder="Enter admin secret key"
            />
          </div>
          <Button onClick={() => setAdminSecret(adminSecret)} className="w-full">
            Authenticate
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
            Secure API Key Manager
          </h1>
          <p className="text-muted-foreground">
            Import and manage encrypted API keys for various AI services
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setAdminSecret("")}
        >
          Logout
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="import">Import Keys</TabsTrigger>
          <TabsTrigger value="manage">Manage Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyStats && Object.entries(keyStats).map(([provider, stats]) => (
              <Card key={provider}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {provider}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Keys:</span>
                    <Badge variant="outline">{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active:</span>
                    <Badge variant="default">{stats.active}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Usage:</span>
                    <Badge variant="secondary">{stats.totalUsage}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Errors:</span>
                    <Badge variant={stats.errors > 5 ? "destructive" : "outline"}>
                      {stats.errors}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import API Keys
              </CardTitle>
              <CardDescription>
                Bulk import API keys for encryption and secure storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="keys">API Keys (one per line)</Label>
                <Textarea
                  id="keys"
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                  placeholder={`Enter ${selectedProvider} API keys, one per line...`}
                  rows={8}
                />
              </div>

              <Button
                onClick={handleImport}
                disabled={importKeysMutation.isPending}
                className="w-full"
              >
                {importKeysMutation.isPending ? "Importing..." : "Import Keys"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage API Keys</CardTitle>
              <CardDescription>
                View, test, and manage imported API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keysList && keysList.length > 0 ? (
                  keysList.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{key.provider}</Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {key.keyAlias}
                          </code>
                          {key.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Used {key.usageCount} times • {key.errorCount} errors
                          {key.lastUsed && (
                            <> • Last used {new Date(key.lastUsed).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testKeyMutation.mutate({ keyId: key.id, provider: key.provider })}
                          disabled={testKeyMutation.isPending}
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatusMutation.mutate({ keyId: key.id, isActive: !key.isActive })}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {key.isActive ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteKeyMutation.mutate(key.id)}
                          disabled={deleteKeyMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No API keys imported yet. Use the Import tab to add keys.
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
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Gift, Flame, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CheckinRecord {
  id: number;
  userId: number;
  username: string;
  checkinDate: string;
  streak: number;
  totalDays: number;
  lastCheckin: string;
  rewards: string[];
}

interface CheckinStats {
  todayCheckins: number;
  totalUsers: number;
  topStreaks: CheckinRecord[];
  userStreak: number;
  hasCheckedInToday: boolean;
  nextReward: string;
}

interface DailyCheckinProps {
  isAdmin?: boolean;
}

export default function DailyCheckin({ isAdmin = false }: DailyCheckinProps) {
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const { toast } = useToast();

  // Fetch checkin stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/checkin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  }) as { data: CheckinStats | undefined; isLoading: boolean };

  // Fetch all user checkins (admin only)
  const { data: allCheckins } = useQuery({
    queryKey: ["/api/admin/checkins"],
    enabled: isAdmin,
  }) as { data: CheckinRecord[] | undefined };

  // Daily checkin mutation
  const checkinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/checkin");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkin/stats"] });
      if (isAdmin) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/checkins"] });
      }
      
      setShowRewardAnimation(true);
      setTimeout(() => setShowRewardAnimation(false), 3000);
      
      toast({
        title: "Điểm danh thành công!",
        description: `Streak hiện tại: ${data.streak} ngày. ${data.reward ? `Nhận thưởng: ${data.reward}` : ''}`,
      });
      
      setShowCheckinDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi điểm danh",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto show checkin dialog if user hasn't checked in today
  useEffect(() => {
    if (stats && !(stats as any).hasCheckedInToday && !isAdmin) {
      const lastShown = localStorage.getItem('checkin-dialog-shown');
      const today = new Date().toDateString();
      
      if (lastShown !== today) {
        setShowCheckinDialog(true);
        localStorage.setItem('checkin-dialog-shown', today);
      }
    }
  }, [stats, isAdmin]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "from-purple-500 to-pink-500";
    if (streak >= 14) return "from-blue-500 to-cyan-500";
    if (streak >= 7) return "from-green-500 to-emerald-500";
    if (streak >= 3) return "from-yellow-500 to-orange-500";
    return "from-gray-400 to-gray-500";
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return Trophy;
    if (streak >= 14) return Star;
    if (streak >= 7) return Flame;
    return CheckCircle;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Điểm danh hằng ngày
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

  if (isAdmin) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Quản lý điểm danh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.todayCheckins || 0}</div>
                <div className="text-sm text-muted-foreground">Hôm nay</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Tổng users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(((stats?.todayCheckins || 0) / (stats?.totalUsers || 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Tỷ lệ điểm danh</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.topStreaks?.[0]?.streak || 0}
                </div>
                <div className="text-sm text-muted-foreground">Streak cao nhất</div>
              </div>
            </div>

            {/* Top streaks */}
            <div>
              <h4 className="font-semibold mb-2">Top người dùng có streak cao nhất</h4>
              <div className="space-y-2">
                {stats?.topStreaks?.slice(0, 5).map((record, index) => {
                  const StreakIcon = getStreakIcon(record.streak);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "outline"}>
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{record.username}</span>
                        <div className="flex items-center gap-1">
                          <StreakIcon className="w-4 h-4" />
                          <span className="text-sm">{record.streak} ngày</span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {record.totalDays} ngày tổng
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent checkins */}
            <div>
              <h4 className="font-semibold mb-2">Điểm danh gần đây</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(allCheckins || []).slice(0, 10).map((record: CheckinRecord) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                    <span className="font-medium">{record.username}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{record.streak} streak</Badge>
                      <span className="text-muted-foreground">
                        {new Date(record.checkinDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* User checkin interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Điểm danh hằng ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            {stats?.hasCheckedInToday ? (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium">Đã điểm danh hôm nay!</p>
                <div className="flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Streak: {stats.userStreak} ngày</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-blue-600" />
                </div>
                <Button 
                  onClick={() => setShowCheckinDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  Điểm danh ngay
                </Button>
                <p className="text-sm text-muted-foreground">
                  Streak hiện tại: {stats?.userStreak || 0} ngày
                </p>
              </div>
            )}
          </div>

          {stats?.nextReward && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Phần thưởng tiếp theo: {stats.nextReward}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checkin Dialog */}
      <Dialog open={showCheckinDialog} onOpenChange={setShowCheckinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Điểm danh hằng ngày</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Chào mừng trở lại!</h3>
              <p className="text-muted-foreground">
                Hãy điểm danh để duy trì streak và nhận phần thưởng
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Flame className="w-4 h-4" />
              <span>Streak hiện tại: {stats?.userStreak || 0} ngày</span>
            </div>
            <Button 
              onClick={() => checkinMutation.mutate()}
              disabled={checkinMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {checkinMutation.isPending ? "Đang điểm danh..." : "Điểm danh ngay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg p-8 shadow-2xl animate-bounce">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold text-gray-800">
                Điểm danh thành công!
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Gift, Flame, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface MandatoryCheckinPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MandatoryCheckinPopup({ isOpen, onClose }: MandatoryCheckinPopupProps) {
  const { toast } = useToast();

  // Get checkin stats
  const { data: checkinStats, isLoading } = useQuery({
    queryKey: ["/api/checkin/stats"],
    refetchInterval: 30000,
  });

  // Checkin mutation
  const checkinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/checkin", { method: "POST" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkin/stats"] });
      toast({
        title: "Điểm danh thành công!",
        description: `Streak hiện tại: ${data.streak} ngày. ${data.rewards?.length > 0 ? `Phần thưởng: ${data.rewards.join(', ')}` : ''}`,
      });
      onClose();
    },
    onError: (error) => {
      if (error.message.includes("already checked in")) {
        toast({
          title: "Đã điểm danh hôm nay",
          description: "Bạn đã điểm danh rồi. Hẹn gặp lại ngày mai!",
        });
        onClose();
      } else {
        toast({
          title: "Lỗi điểm danh",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const handleCheckin = () => {
    checkinMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Điểm danh hàng ngày
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-4">
              <Flame className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Chào mừng bạn quay lại!</h3>
              <p className="text-blue-100">
                Hãy điểm danh để duy trì streak và nhận phần thưởng
              </p>
            </div>
          </div>

          {!isLoading && checkinStats && (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{checkinStats.userStreak}</div>
                <div className="text-sm text-gray-600">Streak hiện tại</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{checkinStats.todayCheckins}</div>
                <div className="text-sm text-gray-600">Người đã điểm danh</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Phần thưởng streak
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm">7 ngày liên tiếp</span>
                <Badge variant="outline">🏆 Weekly Champion</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                <span className="text-sm">30 ngày liên tiếp</span>
                <Badge variant="outline">👑 Monthly Legend</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleCheckin}
              disabled={checkinMutation.isPending || checkinStats?.hasCheckedInToday}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {checkinMutation.isPending ? (
                "Đang điểm danh..."
              ) : checkinStats?.hasCheckedInToday ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Đã điểm danh hôm nay
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Điểm danh ngay
                </>
              )}
            </Button>

            {checkinStats?.hasCheckedInToday && (
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Tiếp tục sử dụng AIverse
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
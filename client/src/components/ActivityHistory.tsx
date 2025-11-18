import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Clock, MessageSquare, Plus, Settings, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: 'prompt_optimize' | 'ai_add' | 'ai_delete' | 'tool_view' | 'admin_action';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

export default function ActivityHistory() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Load activities from localStorage on mount (user-specific)
  useEffect(() => {
    if (user && (user as any).id) {
      const userActivityKey = `user_activities_${(user as any).id}`;
      const savedActivities = localStorage.getItem(userActivityKey);
      if (savedActivities) {
        try {
          const parsed = JSON.parse(savedActivities);
          const activitiesWithDates = parsed.map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }));
          setActivities(activitiesWithDates);
        } catch (error) {
          console.error('Error loading activities:', error);
        }
      }
    }
  }, [user]);

  // Add new activity
  const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 50); // Keep last 50 activities
    setActivities(updatedActivities);
    
    // Save to localStorage (user-specific)
    if (user && (user as any).id) {
      const userActivityKey = `user_activities_${(user as any).id}`;
      localStorage.setItem(userActivityKey, JSON.stringify(updatedActivities));
    }
  };

  // Expose addActivity function globally for other components to use
  useEffect(() => {
    (window as any).addUserActivity = addActivity;
  }, [activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'prompt_optimize':
        return <MessageSquare className="w-4 h-4" />;
      case 'ai_add':
        return <Plus className="w-4 h-4" />;
      case 'ai_delete':
        return <Trash2 className="w-4 h-4" />;
      case 'tool_view':
        return <Eye className="w-4 h-4" />;
      case 'admin_action':
        return <Settings className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'prompt_optimize':
        return 'bg-blue-100 text-blue-800';
      case 'ai_add':
        return 'bg-green-100 text-green-800';
      case 'ai_delete':
        return 'bg-red-100 text-red-800';
      case 'tool_view':
        return 'bg-purple-100 text-purple-800';
      case 'admin_action':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <History className="w-4 h-4 mr-2" />
        Lịch sử
        {activities.length > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {activities.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Activity Panel */}
          <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="w-4 h-4" />
                Lịch sử hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activities.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Chưa có hoạt động nào
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-1 rounded-full",
                          getActivityColor(activity.type)
                        )}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {activity.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activities.length > 0 && (
                <div className="p-3 border-t bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActivities([]);
                      localStorage.removeItem('user_activities');
                    }}
                    className="w-full text-xs"
                  >
                    Xóa lịch sử
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
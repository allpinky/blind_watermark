import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function OverviewSection() {
  const toggleChat = () => {
    // Trigger the floating chat to open
    const event = new CustomEvent("toggleFloatingChat");
    window.dispatchEvent(event);
  };

  return (
    <section id="overview" className="mb-16 scroll-mt-20">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-foreground">
        Hệ Sinh Thái AI cho Game Development & Interactive Media
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-8">
        Comprehensive AI Tools Directory - Cập nhật tháng 5, 2025
      </p>

      <div className="bg-card p-6 rounded-lg shadow-sm mb-12 border">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Breakthrough AI Technologies & Trends
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">🧠 Foundation Models</h3>
            <p className="text-sm text-gray-700">
              Large Language Models (LLMs) và Multimodal AI làm nền tảng cho mọi ứng dụng AI.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-700 mb-2">🎨 Generative AI</h3>
            <p className="text-sm text-gray-700">
              Text-to-Image, Text-to-3D và Video Generation thay đổi quy trình sáng tạo nội dung.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">⚡ AI Agents</h3>
            <p className="text-sm text-gray-700">
              Autonomous agents thực hiện task phức tạp từ coding đến game testing tự động.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-700 mb-2">🔄 Multimodal Integration</h3>
            <p className="text-sm text-gray-700">
              AI xử lý đồng thời text, image, audio, video trong single workflow tích hợp.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12 relative">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400"
          alt="Modern AI dashboard interface"
          className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Khám Phá Thế Giới AI</h2>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Công nghệ định hình tương lai ngành game
            </p>
            <Button
              onClick={toggleChat}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Bắt Đầu Chat
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

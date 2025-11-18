import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Scale, DollarSign, Settings } from "lucide-react";

export default function IssuesSection() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const accordionItems = [
    {
      id: "ethics",
      title: "Đạo Đức & Pháp Lý",
      description: "Các vấn đề về bản quyền và ethics khi sử dụng AI",
      icon: Scale,
      color: "red",
      content: {
        "🚫 Vấn Đề Bản Quyền": [
          "AI được train trên dữ liệu có bản quyền",
          "Ownership của content AI tạo ra còn mơ hồ",
          "Risk pháp lý khi sử dụng thương mại",
          "Cần review license của từng AI tool",
        ],
        "⚖️ Đạo Đức AI": [
          "Bias trong AI models",
          "Thay thế lao động con người",
          "Misinformation và deepfakes",
          "Privacy và data security",
        ],
      },
    },
    {
      id: "roi",
      title: "ROI & Chi Phí",
      description: "Tính toán hiệu quả đầu tư khi áp dụng AI",
      icon: DollarSign,
      color: "green",
      content: {
        "💸 Chi Phí": [
          "Subscription fees ($20-100/tháng)",
          "API costs (pay-per-use)",
          "Training nhân viên",
          "Infrastructure & tools",
        ],
        "⬆️ Lợi Ích": [
          "Tăng tốc độ production",
          "Giảm cost per asset",
          "Scale up team capability",
          "Improve creative quality",
        ],
        "📊 Metrics": [
          "Time to market: -30-50%",
          "Asset cost: -60-80%",
          "Team productivity: +200%",
          "Quality consistency: +40%",
        ],
      },
    },
    {
      id: "implementation",
      title: "Triển Khai Thực Tế",
      description: "Hướng dẫn implement AI vào workflow",
      icon: Settings,
      color: "blue",
      content: {
        "🎯 Bước Triển Khai": [
          "1. Audit workflow hiện tại",
          "2. Identify pain points và bottlenecks",
          "3. Pilot với 1-2 AI tools",
          "4. Train team và establish guidelines",
          "5. Measure results và iterate",
          "6. Scale up successful implementations",
        ],
        "⚠️ Common Pitfalls": [
          "Over-relying trên AI cho creative decisions",
          "Không có quality control process",
          "Skip training cho team members",
          "Ignore intellectual property risks",
          "Unrealistic expectations về capabilities",
        ],
      },
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        border: "border-red-200",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        border: "border-green-200",
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
      },
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section id="issues" className="mb-16 scroll-mt-20">
      <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
        Những Vấn Đề Cần Lưu Ý
      </h2>

      <div className="space-y-4">
        {accordionItems.map((item) => {
          const colorClasses = getColorClasses(item.color);
          const isOpen = openAccordion === item.id;

          return (
            <Card key={item.id} className="overflow-hidden">
              <button
                onClick={() => toggleAccordion(item.id)}
                className={`w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors ${colorClasses.bg} ${colorClasses.border} border`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center ${colorClasses.text} mr-4`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`accordion-content ${isOpen ? "open" : ""}`}
                style={{
                  maxHeight: isOpen ? "1000px" : "0",
                }}
              >
                <CardContent className="pt-4 border-t">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(item.content).map(([title, items]) => (
                      <div key={title}>
                        <h4 className="font-semibold text-foreground mb-3">
                          {title}
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          {items.map((listItem, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{listItem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

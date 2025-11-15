import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function ComparisonSection() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const aiCompanies = [
    {
      name: "OpenAI",
      marketShare: 32,
      strengths: ["GPT-4/4o", "DALL-E 3", "Whisper", "Function Calling"],
      focus: "Foundation Models & APIs",
      color: "#10B981"
    },
    {
      name: "Google",
      marketShare: 28,
      strengths: ["Gemini 2.5", "Vertex AI", "AlphaFold", "TensorFlow"],
      focus: "Research & Enterprise AI",
      color: "#3B82F6"
    },
    {
      name: "Microsoft",
      marketShare: 18,
      strengths: ["Azure OpenAI", "Copilot", "Cognitive Services"],
      focus: "Enterprise Integration",
      color: "#6366F1"
    },
    {
      name: "Anthropic",
      marketShare: 8,
      strengths: ["Claude 3.5", "Constitutional AI", "Safety Research"],
      focus: "Safe & Helpful AI",
      color: "#8B5CF6"
    },
    {
      name: "Meta",
      marketShare: 9,
      strengths: ["Llama 3", "Code Llama", "Open Source"],
      focus: "Social & Open AI",
      color: "#F59E0B"
    },
    {
      name: "Amazon",
      marketShare: 5,
      strengths: ["Bedrock", "SageMaker", "Alexa", "Cloud AI"],
      focus: "Cloud AI Services",
      color: "#EF4444"
    }
  ];

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy existing chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Get current theme for chart styling
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? '#374151' : '#e5e7eb';

        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: aiCompanies.map(company => company.name),
            datasets: [
              {
                label: "Market Share (%)",
                data: aiCompanies.map(company => company.marketShare),
                backgroundColor: aiCompanies.map(company => company.color + '80'), // Add transparency
                borderColor: aiCompanies.map(company => company.color),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `Market Share: ${context.parsed.y}%`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 40,
                ticks: {
                  color: textColor,
                  callback: function (value) {
                    return value + "%";
                  },
                },
                grid: {
                  color: gridColor,
                },
              },
              x: {
                ticks: {
                  color: textColor,
                },
                grid: {
                  display: false,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <section id="giants" className="mb-16 scroll-mt-20">
      <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
        So Sánh Các "Ông Lớn" AI
      </h2>
      <p className="text-center text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
        Một cái nhìn trực diện về các mô hình nền tảng hàng đầu từ những nhà phát triển tiên phong trong lĩnh vực AI.
      </p>

      {/* Chart Container */}
      <div className="bg-card rounded-lg p-6 shadow-sm mb-8 border border-border">
        <h3 className="text-xl font-semibold mb-4 text-foreground text-center">
          Thị Phần AI Foundation Models 2025
        </h3>
        <div className="h-80 w-full">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Company Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiCompanies.map((company, index) => (
          <div
            key={index}
            className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">{company.name}</h4>
              <div 
                className="w-4 h-4 rounded-full shadow-md"
                style={{ backgroundColor: company.color }}
              ></div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 font-medium">{company.focus}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Thị phần:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: company.color,
                        width: `${(company.marketShare / 40) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-foreground">{company.marketShare}%</span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-foreground mb-2 block">Điểm mạnh:</span>
                <div className="flex flex-wrap gap-1">
                  {company.strengths.slice(0, 3).map((strength, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium border transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {strength}
                    </span>
                  ))}
                  {company.strengths.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                      +{company.strengths.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
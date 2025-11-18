export default function GoogleEcosystemSection() {
  const ecosystemCategories = [
    {
      title: "🎨 Sáng Tạo Nội Dung",
      items: [
        { name: "Veo 3 & Flow", description: "AI Video Generation tối tân", color: "red", icon: "🎬", url: "https://deepmind.google/technologies/veo/" },
        { name: "Imagen 4 & Whisk", description: "Tạo hình ảnh chất lượng cao", color: "orange", icon: "🖼️", url: "https://deepmind.google/technologies/imagen-3/" },
        { name: "Stitch", description: "Công cụ sáng tạo multimodal", color: "yellow", icon: "🎨", url: "https://labs.google.com/" },
      ],
    },
    {
      title: "💻 Phát Triển & Vận Hành",
      items: [
        { name: "Jules", description: "AI Coding Agent tự động", color: "blue", icon: "👨‍💻", url: "https://blog.google/technology/ai/google-jules-ai-coding-agent/" },
        { name: "AlphaEvolve", description: "Tiến hóa thuật toán AI", color: "indigo", icon: "🧠", url: "https://deepmind.google/research/" },
        { name: "Project Mariner", description: "Web navigation AI", color: "cyan", icon: "🌐", url: "https://deepmind.google/technologies/project-mariner/" },
      ],
    },
    {
      title: "🚀 Nền Tảng & Mở Rộng",
      items: [
        { name: "Vertex AI", description: "Enterprise ML platform", color: "purple", icon: "☁️", url: "https://cloud.google.com/vertex-ai" },
        { name: "Gemma (Open Source)", description: "Mô hình mã nguồn mở", color: "green", icon: "🌍", url: "https://ai.google.dev/gemma" },
        { name: "Project Astra", description: "AI agent đa nhiệm", color: "pink", icon: "🚀", url: "https://deepmind.google/technologies/project-astra/" },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-700",
      purple: "from-purple-500 to-purple-700",
      green: "from-green-500 to-green-700",
      orange: "from-orange-500 to-orange-700",
      red: "from-red-500 to-red-700",
      yellow: "from-yellow-500 to-yellow-700",
      indigo: "from-indigo-500 to-indigo-700",
      pink: "from-pink-500 to-pink-700",
      cyan: "from-cyan-500 to-cyan-700",
    };
    return colors[color as keyof typeof colors] || "from-gray-500 to-gray-700";
  };

  return (
    <section id="google" className="mb-16 scroll-mt-20">
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Hệ Sinh Thái Google AI
      </h2>

      <div className="ecosystem-container">
        <div className="ecosystem-core">
          <h3 className="text-xl font-bold mb-2">Google AI Core</h3>
          <p className="text-sm">Nền tảng trung tâm điều phối tất cả dịch vụ AI</p>
        </div>

        <div className="ecosystem-grid">
          {ecosystemCategories.map((category, index) => (
            <div key={index} className="ecosystem-category">
              <h4 className="text-lg font-semibold mb-3 text-blue-300">
                {category.title}
              </h4>
              {category.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex} 
                  className="ecosystem-item cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${getColorClasses(item.color)} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-sm text-gray-300">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

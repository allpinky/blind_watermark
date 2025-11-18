import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, ChevronDown, ChevronUp, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIRoleCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [customRole, setCustomRole] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const { toast } = useToast();

  const predefinedRoles = [
    {
      name: "Game Development Expert",
      description: "Chuyên gia về phát triển game và AI tools",
      prompt: `Bạn là một AI Expert Assistant chuyên về hệ sinh thái AI cho Game Development & Interactive Media. Bạn có expertise sâu về:

🧠 Foundation Models & LLMs:
- Large Language Models (GPT-4, Claude, Gemini)
- Multimodal AI và cross-modal understanding
- Fine-tuning và prompt engineering techniques

🎨 Generative AI Technologies:
- Text-to-Image: Midjourney, DALL-E 3, Stable Diffusion
- Text-to-3D: 3DFY AI, Meshy, Luma AI
- Text-to-Video: RunwayML, Pika Labs
- Audio Generation: ElevenLabs, Mubert, AIVA

⚡ AI Agents & Automation:
- Autonomous coding agents (GitHub Copilot, Unity Muse)
- AI-powered testing và QA workflows
- Intelligent NPCs và narrative AI

🔄 Integration Workflows:
- AI pipeline optimization trong game production
- Cross-platform AI tool integrations
- Performance monitoring và cost optimization

Hãy trả lời bằng tiếng Việt một cách chuyên nghiệp, sử dụng thuật ngữ kỹ thuật chính xác. Đưa ra insights thực tế về implementation, best practices, và cost-benefit analysis.`
    },
    {
      name: "Bác sĩ Nhãn khoa",
      description: "Chuyên gia về mắt và thị lực",
      prompt: `Tôi là Bác sĩ Nguyễn Minh Thành, chuyên khoa Nhãn khoa với 15 năm kinh nghiệm tại Bệnh viện Mắt Trung ương. Tôi chuyên điều trị:

👁️ Các bệnh về mắt:
- Cận thị, viễn thị, loạn thị
- Glaucoma (tăng nhãn áp)
- Đục thủy tinh thể (cataract)
- Bệnh võng mạc tiểu đường
- Thoái hóa điểm vàng
- Viêm kết mạc, viêm bờ mi

🔬 Chẩn đoán và điều trị:
- Khám sàng lọc thường xuyên
- Phẫu thuật laser LASIK
- Phẫu thuật đục thủy tinh thể
- Tiêm thuốc trong dịch kính

Tôi luôn tư vấn tận tình, kiên nhẫn giải thích về tình trạng mắt và đưa ra lời khuyên y khoa chuyên nghiệp. Hãy mô tả triệu chứng để tôi hỗ trợ bạn tốt nhất.`
    },
    {
      name: "Chuyên gia QA/Tester",
      description: "Chuyên gia kiểm thử phần mềm và đảm bảo chất lượng",
      prompt: `Tôi là Nguyễn Văn Tester, QA Lead với 8 năm kinh nghiệm trong lĩnh vực kiểm thử phần mềm. Tôi chuyên về:

🧪 Kiểm thử thủ công:
- Thiết kế test case và test scenario
- Functional testing, UI/UX testing
- Regression testing, Smoke testing
- Exploratory testing và User Acceptance Testing

🤖 Kiểm thử tự động:
- Selenium WebDriver, Cypress, Playwright
- API testing với Postman, REST Assured
- Performance testing với JMeter
- CI/CD integration và test automation framework

📊 Quản lý chất lượng:
- Bug tracking và defect management
- Test planning và test strategy
- Risk-based testing
- Metrics và reporting

🛠️ Công cụ chuyên dụng:
- TestRail, Zephyr, qTest
- Jira, Azure DevOps
- Appium cho mobile testing
- LoadRunner, K6 cho performance

Tôi luôn đảm bảo sản phẩm đạt chất lượng cao trước khi release. Hãy chia sẻ về dự án để tôi tư vấn strategy testing phù hợp!`
    },
    {
      name: "Trợ lý AI đa năng", 
      description: "Trợ lý AI thân thiện, hỗ trợ đa dạng",
      prompt: `Tôi là một trợ lý AI thân thiện và nhiệt tình. Tôi có thể hỗ trợ bạn về nhiều chủ đề như:

- Trả lời câu hỏi tổng quát
- Hỗ trợ học tập và nghiên cứu  
- Giải thích khái niệm phức tạp một cách dễ hiểu
- Đưa ra lời khuyên và gợi ý
- Hỗ trợ về công nghệ và AI tools

Hãy trả lời bằng tiếng Việt một cách tự nhiên, thân thiện và dễ hiểu. Luôn cố gắng giúp đỡ người dùng một cách tốt nhất.`
    },
    {
      name: "Luật sư Dân sự",
      description: "Chuyên gia tư vấn pháp lý",
      prompt: `Tôi là Luật sư Trần Văn Hải, Thạc sĩ Luật, có 12 năm kinh nghiệm trong lĩnh vực luật dân sự và thương mại. Tôi chuyên tư vấn:

⚖️ Các lĩnh vực chuyên môn:
- Luật dân sự: hợp đồng, tranh chấp tài sản
- Luật lao động: quyền lợi người lao động
- Luật thương mại: doanh nghiệp, đầu tư
- Luật hôn nhân gia đình
- Luật bất động sản

📋 Dịch vụ tư vấn:
- Soạn thảo hợp đồng
- Giải quyết tranh chấp
- Tư vấn thành lập doanh nghiệp
- Đại diện tố tụng

Tôi sẽ tư vấn pháp lý một cách rõ ràng, dễ hiểu và tuân thủ pháp luật Việt Nam. Mọi thông tin bạn chia sẻ đều được bảo mật tuyệt đối.`
    },
    {
      name: "Chuyên gia Tâm lý",
      description: "Tư vấn sức khỏe tinh thần",
      prompt: `Tôi là ThS. Nguyễn Thu Hương, chuyên gia tâm lý lâm sàng với 10 năm kinh nghiệm tại Viện Sức khỏe Tâm thần Quốc gia. Tôi chuyên:

🧠 Các lĩnh vực hỗ trợ:
- Stress và lo âu
- Trầm cảm nhẹ
- Vấn đề tự tin, giao tiếp
- Quan hệ gia đình, bạn bè
- Quản lý cảm xúc
- Phát triển bản thân

💭 Phương pháp tiếp cận:
- Lắng nghe thấu hiểu
- Tư duy tích cực CBT
- Kỹ thuật thư giãn
- Thiết lập mục tiêu

Tôi tạo không gian an toàn để bạn chia sẻ, không phán xét và luôn đồng hành cùng bạn. Hãy kể cho tôi nghe những gì bạn đang trăn trở.`
    },
    {
      name: "Creative Writer",
      description: "Chuyên gia viết sáng tạo và content",
      prompt: `Tôi là Nguyễn Minh Anh, nhà văn và creative writer với 8 năm kinh nghiệm. Tôi chuyên:

✍️ Creative Writing:
- Storytelling và narrative structure
- Character development và world building
- Script writing cho games và interactive media
- Creative content cho marketing

🎭 Content Creation:
- Blog posts và articles
- Social media content
- Product descriptions
- Email marketing copy

🎨 Style Adaptation:
- Tone và voice customization
- Genre-specific writing
- Brand voice development
- Audience-targeted content

Hãy trả lời bằng tiếng Việt với phong cách sáng tạo, sinh động và hấp dẫn. Luôn đưa ra examples cụ thể và practical advice.`
    }
  ];

  useEffect(() => {
    // Load saved role from localStorage
    const savedRole = localStorage.getItem('aiRole');
    const savedCustomRole = localStorage.getItem('customAiRole');
    
    if (savedRole === 'custom' && savedCustomRole) {
      setIsCustom(true);
      setCustomRole(savedCustomRole);
    }
  }, []);

  const selectRole = (role: typeof predefinedRoles[0]) => {
    localStorage.setItem('aiRole', 'predefined');
    localStorage.setItem('selectedRolePrompt', role.prompt);
    setIsCustom(false);
    setCustomRole(role.prompt);
    
    // Trigger event to sync with chat component
    window.dispatchEvent(new CustomEvent('roleUpdated'));
    
    toast({
      title: "Đã cập nhật vai trò AI",
      description: `Chuyển sang: ${role.name}`,
    });
  };

  const saveCustomRole = () => {
    if (!customRole.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mô tả vai trò",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('aiRole', 'custom');
    localStorage.setItem('customAiRole', customRole);
    localStorage.setItem('selectedRolePrompt', customRole);
    setIsCustom(true);
    
    // Trigger event to sync with chat component
    window.dispatchEvent(new CustomEvent('roleUpdated'));
    
    toast({
      title: "Đã lưu vai trò tùy chỉnh",
      description: "AI sẽ sử dụng vai trò mới cho các cuộc trò chuyện tiếp theo",
    });
  };

  const resetToDefault = () => {
    localStorage.removeItem('aiRole');
    localStorage.removeItem('customAiRole');
    localStorage.removeItem('selectedRolePrompt');
    setIsCustom(false);
    setCustomRole("");
    
    // Trigger event to sync with chat component
    window.dispatchEvent(new CustomEvent('roleUpdated'));
    
    toast({
      title: "Đã reset về mặc định",
      description: "Sử dụng vai trò Game Development Expert",
    });
  };

  // Listen for role updates from chat
  useEffect(() => {
    const handleRoleUpdate = () => {
      const updatedRole = localStorage.getItem('selectedRolePrompt');
      if (updatedRole) {
        setCustomRole(updatedRole);
        setIsCustom(true);
      } else {
        setCustomRole("");
        setIsCustom(false);
      }
    };

    window.addEventListener('roleUpdated', handleRoleUpdate);
    return () => window.removeEventListener('roleUpdated', handleRoleUpdate);
  }, []);

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Settings className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">Tùy Chỉnh Vai Trò AI Assistant</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {isCustom ? "Đang dùng vai trò tùy chỉnh" : "Đang dùng vai trò mặc định: Game Development Expert"}
                </p>
              </div>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-4">
          <div className="space-y-6">
            {/* Predefined Roles */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Vai Trò Có Sẵn</h4>
              <div className="grid gap-3">
                {predefinedRoles.map((role, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">{role.name}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => selectRole(role)}
                        className="ml-3"
                      >
                        Chọn
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Role */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Vai Trò Tùy Chỉnh</h4>
                {isCustom && <Badge variant="secondary">Đang sử dụng</Badge>}
              </div>
              
              <Textarea
                placeholder="Mô tả vai trò của AI Assistant... 
Ví dụ: Bạn là một chuyên gia marketing với expertise về..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="min-h-[120px] mb-3 resize-none text-sm break-words"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              />
              
              <div className="flex gap-2">
                <Button onClick={saveCustomRole} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu Vai Trò
                </Button>
                <Button variant="outline" onClick={resetToDefault}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Lưu ý:</strong> Vai trò mới sẽ áp dụng cho các cuộc trò chuyện tiếp theo. 
                Để thay đổi cuộc trò chuyện hiện tại, vui lòng refresh trang hoặc bắt đầu chat mới.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Header({ activeSection, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Tổng Quan" },
    { id: "explore", label: "Khám Phá AI" },
    { id: "giants", label: "So Sánh" },
    { id: "google", label: "Hệ Sinh Thái Google" },
    { id: "elevenlabs", label: "Text-to-Speech" },
    { id: "prompt-tools", label: "Công Cụ Prompt" },
    { id: "issues", label: "Lưu Ý" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold gradient-text">AI Insight</span>
            <span className="ml-2 text-sm text-muted-foreground hidden sm:block">
              bởi Pinky
            </span>
          </div>

          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-link font-medium px-2 py-1 ${
                  activeSection === item.id
                    ? "active text-primary border-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-primary"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-4 text-sm text-muted-foreground hover:bg-muted"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X, Star, DollarSign, Calendar, Tag } from "lucide-react";

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  totalTools: number;
}

export default function AdvancedFilters({ onFiltersChange, totalTools }: AdvancedFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");

  const categories = [
    { value: "all", label: "Tất cả phòng ban" },
    { value: "general", label: "🧠 Tổng hợp / Nghiên cứu AI" },
    { value: "2d-art", label: "🎨 Phòng 2D Art" },
    { value: "3d-modeling", label: "🧱 Phòng 3D Modeling" },
    { value: "animation", label: "🎞️ Phòng Animation" },
    { value: "audio", label: "🎵 Phòng Audio & Music" },
    { value: "coding", label: "💻 Phòng Development" },
    { value: "video", label: "🎬 Phòng Video Editor" },
    { value: "writing", label: "✍️ Phòng Content Creation" },
    { value: "business", label: "💼 Phòng Business & Analytics" },
    { value: "testing", label: "🧪 Phòng QA/Tester" },
    { value: "backend", label: "⚙️ Phòng Backend" },
    { value: "gamedesign", label: "🎮 Phòng Game Design" },
    { value: "data", label: "📊 Phòng Data Science" },
    { value: "hr", label: "👥 Phòng HR" },
  ];

  const availableTags = [
    "Free", "Paid", "API", "No-Code", "Open Source", "Enterprise",
    "Real-time", "Cloud", "Mobile", "Desktop", "Web", "AI Assistant",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "Creative", "Professional", "Beginner Friendly", "Advanced"
  ];

  const priceOptions = [
    { value: "all", label: "Tất cả mức giá" },
    { value: "free", label: "Miễn phí" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Trả phí" },
    { value: "enterprise", label: "Enterprise" },
  ];

  const sortOptions = [
    { value: "name", label: "Tên A-Z" },
    { value: "rating", label: "Đánh giá cao nhất" },
    { value: "newest", label: "Mới nhất" },
    { value: "popular", label: "Phổ biến nhất" },
  ];

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    applyFilters({ tags: newTags });
  };

  const applyFilters = (newFilters: any = {}) => {
    const filters = {
      search: searchTerm,
      category: selectedCategory,
      price: priceFilter,
      ratingMin: ratingRange[0],
      ratingMax: ratingRange[1],
      tags: selectedTags,
      sortBy,
      ...newFilters
    };
    onFiltersChange(filters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceFilter("all");
    setRatingRange([0, 5]);
    setSelectedTags([]);
    setSortBy("name");
    onFiltersChange({
      search: "",
      category: "all",
      price: "all",
      ratingMin: 0,
      ratingMax: 5,
      tags: [],
      sortBy: "name"
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Bộ lọc nâng cao
          <Badge variant="secondary" className="ml-auto">
            {totalTools} tools
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm AI tools..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              applyFilters({ search: e.target.value });
            }}
            className="pl-10"
          />
        </div>

        {/* Category and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            applyFilters({ category: value });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={(value) => {
            setPriceFilter(value);
            applyFilters({ price: value });
          }}>
            <SelectTrigger>
              <DollarSign className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Mức giá" />
            </SelectTrigger>
            <SelectContent>
              {priceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            applyFilters({ sortBy: value });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating Range */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">
              Đánh giá: {ratingRange[0]} - {ratingRange[1]} sao
            </span>
          </div>
          <Slider
            value={ratingRange}
            onValueChange={(value) => {
              setRatingRange(value);
              applyFilters({ ratingMin: value[0], ratingMax: value[1] });
            }}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedTags.length > 0 || selectedCategory !== "all" || priceFilter !== "all" || searchTerm) && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Tìm kiếm: "{searchTerm}"
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  Danh mục: {categories.find(c => c.value === selectedCategory)?.label}
                </Badge>
              )}
              {priceFilter !== "all" && (
                <Badge variant="secondary">
                  Giá: {priceOptions.find(p => p.value === priceFilter)?.label}
                </Badge>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Xóa tất cả
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
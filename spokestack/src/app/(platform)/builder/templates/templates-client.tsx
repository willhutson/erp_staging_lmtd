"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutTemplate,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Eye,
  Download,
  Star,
  StarOff,
  BarChart3,
  Users,
  Megaphone,
  TrendingUp,
  DollarSign,
  Target,
  Building2,
  Layers,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BuilderDashboardTemplateWithRelations } from "@/modules/builder/types";
import { createTemplate, deleteTemplate, createDashboard } from "@/modules/builder/actions";

// Template categories
const templateCategories = [
  { id: "performance", name: "Performance", icon: BarChart3 },
  { id: "campaigns", name: "Campaigns", icon: Megaphone },
  { id: "creators", name: "Creators", icon: Users },
  { id: "media", name: "Media Buying", icon: DollarSign },
  { id: "client", name: "Client Portal", icon: Building2 },
];

interface TemplatesClientProps {
  initialTemplates: BuilderDashboardTemplateWithRelations[];
}

export function TemplatesClient({ initialTemplates }: TemplatesClientProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("performance");

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async () => {
    if (!newName.trim()) return;

    startTransition(async () => {
      const template = await createTemplate({
        name: newName,
        description: newDescription || undefined,
        category: newCategory,
      });
      setTemplates([template, ...templates]);
      setIsCreateDialogOpen(false);
      setNewName("");
      setNewDescription("");
      setNewCategory("performance");
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    startTransition(async () => {
      await deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    });
  };

  const handleUseTemplate = async (templateId: string, templateName: string) => {
    startTransition(async () => {
      const dashboard = await createDashboard({
        name: `${templateName} Dashboard`,
        templateId,
      });
      router.push(`/builder/dashboards/${dashboard.id}/edit`);
    });
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = templateCategories.find((c) => c.id === category);
    if (!categoryConfig) return LayoutTemplate;
    return categoryConfig.icon;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = templateCategories.find((c) => c.id === category);
    return (
      <Badge variant="outline" className="text-xs">
        {categoryConfig?.name || category}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Templates</h1>
          <p className="text-muted-foreground">
            Start with a pre-built template or create your own
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>
                Create a new reusable dashboard template for your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Q1 Performance Review"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What is this template for?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <category.icon className="h-4 w-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isPending || !newName.trim()}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Templates
            </CardTitle>
            <LayoutTemplate className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter((t) => t.isOfficial).length} official, {templates.filter((t) => !t.isOfficial).length} custom
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Used
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.length > 0
                ? templates.reduce((max, t) => (t.usageCount > max.usageCount ? t : max), templates[0]).name
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {templates.length > 0
                ? `${templates.reduce((max, t) => (t.usageCount > max.usageCount ? t : max), templates[0]).usageCount} uses`
                : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favorites
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templateCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {templateCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                <category.icon className="mr-2 h-4 w-4" />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <LayoutTemplate className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first template to get started.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </Card>
          ) : (
            <>
              {/* Favorites Section */}
              {selectedCategory === "all" && favorites.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Favorites
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates
                      .filter((t) => favorites.includes(t.id))
                      .map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isFavorite={true}
                          isPending={isPending}
                          onToggleFavorite={() => toggleFavorite(template.id)}
                          onUse={() => handleUseTemplate(template.id, template.name)}
                          onDelete={() => handleDelete(template.id)}
                          getCategoryIcon={getCategoryIcon}
                          getCategoryBadge={getCategoryBadge}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All Templates */}
              <div className="space-y-3">
                {selectedCategory === "all" && favorites.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground">All Templates</h3>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates
                    .filter((t) => selectedCategory !== "all" || !favorites.includes(t.id))
                    .map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isFavorite={favorites.includes(template.id)}
                        isPending={isPending}
                        onToggleFavorite={() => toggleFavorite(template.id)}
                        onUse={() => handleUseTemplate(template.id, template.name)}
                        onDelete={() => handleDelete(template.id)}
                        getCategoryIcon={getCategoryIcon}
                        getCategoryBadge={getCategoryBadge}
                      />
                    ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TemplateCardProps {
  template: BuilderDashboardTemplateWithRelations;
  isFavorite: boolean;
  isPending: boolean;
  onToggleFavorite: () => void;
  onUse: () => void;
  onDelete: () => void;
  getCategoryIcon: (category: string) => typeof LayoutTemplate;
  getCategoryBadge: (category: string) => JSX.Element;
}

function TemplateCard({
  template,
  isFavorite,
  isPending,
  onToggleFavorite,
  onUse,
  onDelete,
  getCategoryIcon,
  getCategoryBadge,
}: TemplateCardProps) {
  const Icon = getCategoryIcon(template.category);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Preview placeholder */}
      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-12 w-12 text-muted-foreground/30" />
        </div>
        {template.isOfficial && (
          <Badge className="absolute top-2 left-2 bg-primary">Official</Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
          onClick={onToggleFavorite}
        >
          {isFavorite ? (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </Button>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getCategoryBadge(template.category)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUse}>
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              {!template.isOfficial && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2">
          {template.description || "No description"}
        </CardDescription>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>By {template.createdBy?.name || "SpokeStack"}</span>
          <span>{template.usageCount} uses</span>
        </div>
        <Button className="w-full mt-4" variant="outline" onClick={onUse} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Use This Template
        </Button>
      </CardContent>
    </Card>
  );
}

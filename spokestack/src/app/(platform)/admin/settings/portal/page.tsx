"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Palette,
  Globe,
  Upload,
  CheckCircle2,
  Clock,
  Info,
  Eye,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function PortalSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Branding state
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#52EDC7");
  const [secondaryColor, setSecondaryColor] = useState("#1BA098");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoMarkUrl, setLogoMarkUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Domain state
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [customDomainVerified, setCustomDomainVerified] = useState(false);
  const [tier, setTier] = useState("PRO");

  // Simulate loading current settings
  useEffect(() => {
    // In production, fetch from /api/portal/settings
    setIsLoading(true);
    setTimeout(() => {
      setName("Demo Client");
      setSubdomain("demo");
      setTier("PRO");
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // In production, PATCH to /api/portal/settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Portal settings updated successfully");
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const canEditDomain = tier === "PRO" || tier === "ENTERPRISE";
  const canFullyCustomize = tier === "ENTERPRISE";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portal Settings</h1>
          <p className="text-muted-foreground">
            Customize your portal branding and domain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {tier} Plan
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>
                Customize how your portal looks to your team and clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Portal Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline (optional)</Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Powered by innovation"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Colors</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-sm text-muted-foreground">
                      Primary Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="primaryColor"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-sm text-muted-foreground">
                      Secondary Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="secondaryColor"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Logos</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Full Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-8 mx-auto" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">Click to upload</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Logo Mark</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      {logoMarkUrl ? (
                        <img src={logoMarkUrl} alt="Logo Mark" className="h-8 mx-auto" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">Square icon</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Favicon</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      {faviconUrl ? (
                        <img src={faviconUrl} alt="Favicon" className="h-8 mx-auto" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">32x32 .ico</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <Separator />
              <div>
                <Label className="mb-3 block">Preview</Label>
                <div className="border rounded-lg p-4 bg-background">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="text-white font-bold">{name.charAt(0) || "?"}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{name || "Portal Name"}</p>
                      <p className="text-xs text-muted-foreground">
                        {tagline || "Your tagline here"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="px-4 py-2 rounded-md text-white text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Primary Button
                    </div>
                    <div
                      className="px-4 py-2 rounded-md text-white text-sm"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Secondary
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Tab */}
        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain Settings
              </CardTitle>
              <CardDescription>
                Configure your portal subdomain and custom domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Subdomain</Label>
                <div className="flex">
                  <Input
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="rounded-r-none"
                    disabled
                  />
                  <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-sm text-muted-foreground">
                    .spokestack.io
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your subdomain cannot be changed after creation
                </p>
              </div>

              <Separator />

              {canEditDomain ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customDomain">Custom Domain</Label>
                    <Input
                      id="customDomain"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="app.yourcompany.com"
                    />
                  </div>

                  {customDomain && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {customDomainVerified ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="text-green-600 font-medium">Domain verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-5 w-5 text-amber-500" />
                            <span className="text-amber-600 font-medium">Pending verification</span>
                          </>
                        )}
                      </div>

                      {!customDomainVerified && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>DNS Configuration Required</AlertTitle>
                          <AlertDescription className="space-y-2">
                            <p>Add the following DNS records to verify your domain:</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-1">
                              <p>Type: CNAME</p>
                              <p>Name: {customDomain.split(".")[0] || "app"}</p>
                              <p>Value: cname.spokestack.io</p>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2">
                              Verify Domain
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Pro Plan Required</AlertTitle>
                  <AlertDescription>
                    Custom domains are available on Pro and Enterprise plans.{" "}
                    <a href="/admin/billing" className="text-primary hover:underline">
                      Upgrade your plan
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Additional configuration options for your portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {canFullyCustomize ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="customCss">Custom CSS</Label>
                    <Textarea
                      id="customCss"
                      placeholder=".custom-class { ... }"
                      className="font-mono text-sm min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Add custom CSS to further customize your portal appearance
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="customJs">Custom JavaScript</Label>
                    <Textarea
                      id="customJs"
                      placeholder="// Custom scripts..."
                      className="font-mono text-sm min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Add analytics or other custom scripts (Enterprise only)
                    </p>
                  </div>
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Enterprise Plan Required</AlertTitle>
                  <AlertDescription>
                    Custom CSS and JavaScript injection is available on the Enterprise plan.{" "}
                    <a href="/admin/billing" className="text-primary hover:underline">
                      Contact sales
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

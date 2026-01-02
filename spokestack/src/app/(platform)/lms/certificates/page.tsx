"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  ExternalLink,
  Calendar,
  BookOpen,
  Loader2,
  Share2,
} from "lucide-react";

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  expiresAt: string | null;
  credentialId: string;
  verificationUrl: string;
}

// Placeholder data - will be replaced with actual API call
const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    courseId: "course-2",
    courseTitle: "Social Media Best Practices",
    issuedAt: "2024-11-20T14:00:00Z",
    expiresAt: null,
    credentialId: "LMTD-SM-2024-001",
    verificationUrl: "/certificates/verify/LMTD-SM-2024-001",
  },
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCertificates(MOCK_CERTIFICATES);
      setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6" />
            My Certificates
          </h1>
          <p className="text-muted-foreground mt-1">
            View and share your earned credentials
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/lms/my-learning">
            <BookOpen className="mr-2 h-4 w-4" />
            View Courses
          </Link>
        </Button>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No certificates yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Complete courses with certification enabled to earn your first certificate.
              Certificates showcase your achievements and skills.
            </p>
            <Button asChild>
              <Link href="/lms/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              {/* Certificate Preview */}
              <div className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent p-8 border-b">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Award className="h-12 w-12 text-teal-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{cert.courseTitle}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Issued {formatDate(cert.issuedAt)}
                  </div>
                  <div className="font-mono text-xs">
                    ID: {cert.credentialId}
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {cert.expiresAt ? (
                  <Badge variant="outline" className="w-full justify-center">
                    Expires {formatDate(cert.expiresAt)}
                  </Badge>
                ) : (
                  <Badge className="w-full justify-center bg-green-500/10 text-green-600 border-green-200">
                    No Expiration
                  </Badge>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href={cert.verificationUrl}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-background">
              <Award className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <h3 className="font-semibold">About LMTD Certificates</h3>
              <p className="text-sm text-muted-foreground mt-1">
                LMTD certificates are digital credentials that verify your completion of training courses.
                Each certificate includes a unique credential ID that can be verified by employers or clients.
                Share your certificates on LinkedIn or include them in your portfolio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

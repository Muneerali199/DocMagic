"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SharedTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.id as string;
  const [template, setTemplate] = useState<{
    id: string;
    title: string;
    type: string;
    description?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    fetch(`/api/templates/${templateId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Template not found or access denied");
        return res.json();
      })
      .then(setTemplate)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [templateId]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container max-w-lg py-16 px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !template ? (
          <Card>
            <CardHeader>
              <CardTitle>Template unavailable</CardTitle>
              <CardDescription>
                {error ??
                  "This template may be private or the link is invalid."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/templates")}>
                Browse templates
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>
                {template.description || `Shared ${template.type} template`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild>
                <Link href={`/editor/${template.type}/${template.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in editor
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/signin">Sign in for full access</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

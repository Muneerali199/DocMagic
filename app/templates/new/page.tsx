import type { Metadata } from "next";

// Define metadata for the page
export const metadata: Metadata = {
  title: "New Template",
  description: "Create a new template",
};

// Client component
import { CreateTemplateForm } from "@/components/templates/create-template-form";

// Define the page component
export default function NewTemplatePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">New Template</h1>
        <p className="text-muted-foreground">Create a new template for your documents</p>
      </div>
      <div className="mt-8">
        <CreateTemplateForm />
      </div>
    </div>
  );
}

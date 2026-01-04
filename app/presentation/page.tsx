"use client";
import RealTimeGenerator from '@/components/presentation/real-time-generator';
import { CreateDocumentGuard } from "@/components/ui/auth-guard";

export default function PresentationPage() {
  return (
    <CreateDocumentGuard>
      <RealTimeGenerator />
    </CreateDocumentGuard>
  );
}

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
        <div className="pt-6">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

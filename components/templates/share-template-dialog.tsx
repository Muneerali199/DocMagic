import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Copy, Check } from "lucide-react";

type ShareTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateTitle: string;
};

export function ShareTemplateDialog({
  open,
  onOpenChange,
  templateId,
  templateTitle,
}: ShareTemplateDialogProps) {
  const [email, setEmail] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const shareableLink = `${window.location.origin}/templates/${templateId}/shared`;

  const handleShare = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          canEdit,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to share template");
      }

      toast({
        title: "Template shared successfully",
        description: `${templateTitle} has been shared with ${email}.`,
      });
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sharing template:", error);
      toast({
        title: "Error sharing template",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    toast({
      title: "Link copied to clipboard",
      description: "Share this link with others to give them access.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share "{templateTitle}"</DialogTitle>
          <DialogDescription>
            Share this template with others by entering their email address below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="person@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleShare}
                disabled={isLoading || !email}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="can-edit"
              checked={canEdit}
              onCheckedChange={(checked: boolean) => setCanEdit(checked)}
            />
            <label
              htmlFor="can-edit"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Allow editing
            </label>
          </div>

          <div className="relative mt-4 pt-4 border-t">
            <Label>Shareable link</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={shareableLink}
                readOnly
                className="flex-1 text-xs truncate"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                disabled={isCopied}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Anyone with this link can view this template.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

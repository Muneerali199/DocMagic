"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import { AvatarId } from "./ui/avatar";

const avatarOptions = [
  { id: "avatar-1", src: "/avatars/av1.jpg" },
  { id: "avatar-2", src: "/avatars/av2.jpg" },
  { id: "avatar-3", src: "/avatars/av3.jpg" },
  { id: "avatar-4", src: "/avatars/av4.jpg" },
  { id: "avatar-5", src: "/avatars/av5.jpg" },
  { id: "avatar-6", src: "/avatars/av6.jpg" },
  { id: "avatar-7", src: "/avatars/av7.jpg" },
  { id: "avatar-8", src: "/avatars/av8.jpg" },
];

export default function AvatarSelectionPage({
  onAvatarSet,
}: {
  onAvatarSet: () => void;
}) {
  const [selected, setSelected] = useState<AvatarId | null>(null);
  const { updateAvatar } = useAuth();

  const handleSave = () => {
    if (selected) {
      updateAvatar(selected);      // ✅ Save to localStorage/context
      onAvatarSet();               // ✅ Tell parent page to show main UI
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-6 md:px-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center gradient-text-green">Choose Your Avatar</h1>
        <p className="text-center text-muted-foreground">Customize your DocMagic identity with a unique avatar!</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 place-items-center">
          {avatarOptions.map(({ id, src }) => (
            <button
              key={id}
              onClick={() => setSelected(id as AvatarId)}
              className={`p-2 rounded-xl transition-all border-2 ${
                selected === id
                  ? "border-green-500 scale-105 shadow-lg"
                  : "border-transparent hover:border-green-300"
              }`}
            >
              <Image src={src} width={80} height={80} alt={id} className="rounded-full" />
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleSave}
            className="btn-glow-primary px-8 py-2 text-lg rounded-full"
            disabled={!selected}
          >
            Save Avatar
          </Button>
        </div>
      </div>
    </div>
  );
}

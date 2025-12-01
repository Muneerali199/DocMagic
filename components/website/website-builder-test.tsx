"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WebsiteBuilderTest() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Component</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  );
}

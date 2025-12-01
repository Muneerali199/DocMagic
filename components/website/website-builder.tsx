"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export function WebsiteBuilder() {
  const [test, setTest] = useState(0);
  return <div><h1>Test</h1><Button onClick={() => setTest(test + 1)}>Click {test}</Button></div>;
}

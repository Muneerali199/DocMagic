"use client";

import { motion } from "framer-motion";
import { CheckCircle, Code, Database, Settings } from "lucide-react";

const designPrinciples = [
  "User-Centered Design",
  "Responsiveness and Accessibility",
  "Modular & Maintainable Codebase",
];

const frontendTech = ["Next.js", "Tailwind CSS", "Radix UI", "TypeScript"];
const backendTech = ["Supabase", "Stripe", "Edge Functions"];
const infrastructureTech = ["Vercel", "Netlify", "GitHub Actions"];

const Section = ({ title, icon: Icon, items }: { title: string; icon: any; items: string[] }) => (
  <motion.div
    className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-md hover:shadow-lg transition"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-white">
      <Icon className="w-6 h-6 text-blue-400" />
      {title}
    </div>
    <ul className="space-y-2 text-sm text-gray-200">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
          {item}
        </li>
      ))}
    </ul>
  </motion.div>
);
 technical-improvements/about-page
export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-20 bg-gradient-to-br from-[#111827] to-[#1f2937] text-white">
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        About DocMagic AI
      </motion.h1>

      <motion.p
        className="text-lg text-gray-300 max-w-3xl mx-auto text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        DocMagic AI is an intelligent documentation assistant, helping developers and users auto-generate
        resumes, presentations, and letters with ease. it empowers users with an
        intuitive and efficient experience.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Section title="Design Principles" icon={Settings} items={designPrinciples} />
        <Section title="Frontend Tech" icon={Code} items={frontendTech} />
        <Section title="Backend Tech" icon={Database} items={backendTech} />
        <Section title="Infrastructure" icon={Settings} items={infrastructureTech} />
      </div>
    </main>
  );
}
const communityLinks = [
  {
    name: "GitHub",
    description: "Source code & issues",
    href: "https://github.com/Muneerali199/DocMagic",
    icon: <Github className="h-6 w-6 text-white" />,
    gradientClass: "sunset-gradient"
  },
  {
    name: "Discord",
    description: "Community chat",
    href: "https://discord/docmagic",
    icon: <Users className="h-6 w-6 text-white" />,
    gradientClass: "ocean-gradient"
  },
  {
    name: "Documentation",
    description: "Guides & tutorials",
    href: "https://github.com/Muneerali199/DocMagic/blob/main/README.md",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    gradientClass: "forest-gradient"
  },
  {
    name: "Support",
    description: "Get help & feedback",
    href: " INFO@DOCMAGIC.COM",
    icon: <Coffee className="h-6 w-6 text-white" />,
    gradientClass: "cosmic-gradient"
  }
];
 main

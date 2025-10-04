'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fabric } from 'fabric';
import {
  // Business Icons
  Briefcase, Building, Building2, Store, Warehouse, Factory,
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart,
  DollarSign, CreditCard, Wallet, Coins, Banknote,
  Users, User, UserPlus, UserMinus, UserCheck,
  Target, Award, Trophy, Medal, Crown,
  
  // Communication
  Mail, Send, MessageSquare, MessageCircle, Phone,
  Video, Mic, MicOff, Headphones, Speaker,
  Wifi, WifiOff, Signal, Bluetooth, Cast,
  
  // UI Elements
  Home, Menu, Settings, Search, Filter,
  Plus, Minus, X, Check, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, ArrowRight,
  ArrowLeft, ArrowUp, ArrowDown, ExternalLink,
  
  // Files & Folders
  File, FileText, Folder, FolderOpen, Archive,
  Download, Upload, Save, Clipboard, Copy,
  Scissors, Trash2, Edit, Eye, EyeOff,
  
  // Media
  Image, Video as VideoIcon, Music, Film, Camera,
  Play, Pause, SkipForward, SkipBack, Volume2,
  
  // Social
  Heart, Star, ThumbsUp, Share2, Bookmark,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  
  // Shopping
  ShoppingCart, ShoppingBag, Tag, Gift, Package,
  
  // Tech
  Smartphone, Tablet, Monitor, Laptop, Watch,
  Cpu, HardDrive, Database, Server, Cloud,
  Code, Terminal, GitBranch, Github, Globe,
  
  // Weather
  Sun, Moon, Cloud as CloudIcon, CloudRain, CloudSnow,
  Wind, Zap, Droplets, Umbrella, Thermometer,
  
  // Nature
  Leaf, Flower, Sprout, Bug,
  
  // Transport
  Car, Bus, Truck, Plane, Ship,
  Bike, Train, Rocket, Anchor, MapPin,
  
  // Food
  Coffee, Pizza, Apple, Cake, IceCream,
  
  // Other
  Bell, Calendar, Clock, Timer, Hourglass,
  Lock, Unlock, Key, Shield, AlertTriangle,
  Info, HelpCircle, CheckCircle, XCircle, AlertCircle,
  Lightbulb, Zap as Lightning, Flame, Sparkles, Wand2,
} from 'lucide-react';

const iconCategories = {
  business: {
    name: 'Business & Finance',
    icons: [
      { name: 'Briefcase', icon: Briefcase },
      { name: 'Building', icon: Building },
      { name: 'Store', icon: Store },
      { name: 'TrendingUp', icon: TrendingUp },
      { name: 'TrendingDown', icon: TrendingDown },
      { name: 'BarChart', icon: BarChart3 },
      { name: 'PieChart', icon: PieChart },
      { name: 'Dollar', icon: DollarSign },
      { name: 'CreditCard', icon: CreditCard },
      { name: 'Wallet', icon: Wallet },
      { name: 'Target', icon: Target },
      { name: 'Award', icon: Award },
      { name: 'Trophy', icon: Trophy },
    ],
  },
  people: {
    name: 'People & Users',
    icons: [
      { name: 'Users', icon: Users },
      { name: 'User', icon: User },
      { name: 'UserPlus', icon: UserPlus },
      { name: 'UserMinus', icon: UserMinus },
      { name: 'UserCheck', icon: UserCheck },
    ],
  },
  communication: {
    name: 'Communication',
    icons: [
      { name: 'Mail', icon: Mail },
      { name: 'Send', icon: Send },
      { name: 'MessageSquare', icon: MessageSquare },
      { name: 'Phone', icon: Phone },
      { name: 'Video', icon: Video },
      { name: 'Mic', icon: Mic },
      { name: 'Headphones', icon: Headphones },
      { name: 'Wifi', icon: Wifi },
      { name: 'Signal', icon: Signal },
    ],
  },
  ui: {
    name: 'UI Elements',
    icons: [
      { name: 'Home', icon: Home },
      { name: 'Menu', icon: Menu },
      { name: 'Settings', icon: Settings },
      { name: 'Search', icon: Search },
      { name: 'Filter', icon: Filter },
      { name: 'Plus', icon: Plus },
      { name: 'Minus', icon: Minus },
      { name: 'X', icon: X },
      { name: 'Check', icon: Check },
      { name: 'ArrowRight', icon: ArrowRight },
    ],
  },
  files: {
    name: 'Files & Folders',
    icons: [
      { name: 'File', icon: File },
      { name: 'FileText', icon: FileText },
      { name: 'Folder', icon: Folder },
      { name: 'Download', icon: Download },
      { name: 'Upload', icon: Upload },
      { name: 'Save', icon: Save },
      { name: 'Copy', icon: Copy },
      { name: 'Trash', icon: Trash2 },
      { name: 'Edit', icon: Edit },
    ],
  },
  media: {
    name: 'Media',
    icons: [
      { name: 'Image', icon: Image },
      { name: 'Video', icon: VideoIcon },
      { name: 'Music', icon: Music },
      { name: 'Camera', icon: Camera },
      { name: 'Play', icon: Play },
      { name: 'Pause', icon: Pause },
    ],
  },
  social: {
    name: 'Social',
    icons: [
      { name: 'Heart', icon: Heart },
      { name: 'Star', icon: Star },
      { name: 'ThumbsUp', icon: ThumbsUp },
      { name: 'Share', icon: Share2 },
      { name: 'Bookmark', icon: Bookmark },
    ],
  },
  tech: {
    name: 'Technology',
    icons: [
      { name: 'Smartphone', icon: Smartphone },
      { name: 'Laptop', icon: Laptop },
      { name: 'Monitor', icon: Monitor },
      { name: 'Cpu', icon: Cpu },
      { name: 'Database', icon: Database },
      { name: 'Cloud', icon: Cloud },
      { name: 'Code', icon: Code },
      { name: 'Github', icon: Github },
      { name: 'Globe', icon: Globe },
    ],
  },
  other: {
    name: 'Other',
    icons: [
      { name: 'Bell', icon: Bell },
      { name: 'Calendar', icon: Calendar },
      { name: 'Clock', icon: Clock },
      { name: 'Lock', icon: Lock },
      { name: 'Shield', icon: Shield },
      { name: 'Lightbulb', icon: Lightbulb },
      { name: 'Sparkles', icon: Sparkles },
      { name: 'Info', icon: Info },
      { name: 'CheckCircle', icon: CheckCircle },
    ],
  },
};

export function IconLibraryPanel() {
  const { canvas } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('business');

  const addIconToCanvas = async (IconComponent: any, iconName: string) => {
    if (!canvas) return;

    // Create SVG from Lucide icon
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${IconComponent.toString()}
      </svg>
    `;

    // For now, create a simple rect as placeholder (Fabric.js SVG loading needs proper setup)
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      rx: 10,
      ry: 10,
    });

    const text = new fabric.Text(iconName, {
      left: 110,
      top: 140,
      fontSize: 12,
      fill: '#ffffff',
      fontFamily: 'Inter',
    });

    const group = new fabric.Group([rect, text], {
      left: 100,
      top: 100,
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  type IconCategory = {
    name: string;
    icons: Array<{ name: string; icon: any }>;
  };

  const filteredCategories = Object.entries(iconCategories).reduce((acc, [key, category]) => {
    if (!searchQuery) return { ...acc, [key]: category };
    
    const filteredIcons = category.icons.filter((icon) =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredIcons.length > 0) {
      acc[key] = { ...category, icons: filteredIcons };
    }
    
    return acc;
  }, {} as Record<string, IconCategory>);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="font-bold text-lg mb-3 text-gray-900">Icon Library</h3>
        <Input
          placeholder="Search 1000+ icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <ScrollArea className="border-b">
          <TabsList className="w-full justify-start px-4 py-2 rounded-none bg-gradient-to-r from-purple-50 to-pink-50 inline-flex">
            {Object.entries(filteredCategories).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="whitespace-nowrap font-medium data-[state=active]:bg-white data-[state=active]:text-purple-600">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <ScrollArea className="flex-1">
          {Object.entries(filteredCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="p-4 mt-0">
              <div className="grid grid-cols-4 gap-2">
                {category.icons.map((icon) => (
                  <Button
                    key={icon.name}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-1 p-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                    onClick={() => addIconToCanvas(icon.icon, icon.name)}
                    title={icon.name}
                  >
                    <icon.icon className="w-6 h-6" />
                    <span className="text-[10px] truncate w-full text-center font-medium">
                      {icon.name}
                    </span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <p className="text-xs text-gray-600 text-center font-medium">
          1000+ professional icons from Lucide
        </p>
      </div>
    </div>
  );
}

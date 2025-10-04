'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  count?: number;
}

interface CategoryFilterProps {
  categories: TemplateCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange, className }: CategoryFilterProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Scrollable category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* All category */}
        <CategoryChip
          category={{ id: 'all', name: 'All Templates', icon: '🎨', description: 'View all', color: 'gray' }}
          isSelected={selectedCategory === 'all'}
          onClick={() => onCategoryChange('all')}
        />
        
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryChipProps {
  category: TemplateCategory;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryChip({ category, isSelected, onClick }: CategoryChipProps) {
  const colorMap: Record<string, { bg: string; hover: string; text: string; border: string }> = {
    blue: {
      bg: 'bg-blue-500/10',
      hover: 'hover:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/50',
    },
    purple: {
      bg: 'bg-purple-500/10',
      hover: 'hover:bg-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/50',
    },
    green: {
      bg: 'bg-green-500/10',
      hover: 'hover:bg-green-500/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/50',
    },
    pink: {
      bg: 'bg-pink-500/10',
      hover: 'hover:bg-pink-500/20',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/50',
    },
    orange: {
      bg: 'bg-orange-500/10',
      hover: 'hover:bg-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/50',
    },
    gray: {
      bg: 'bg-gray-500/10',
      hover: 'hover:bg-gray-500/20',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-500/50',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      hover: 'hover:bg-indigo-500/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/50',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      hover: 'hover:bg-cyan-500/20',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/50',
    },
  };

  const colors = colorMap[category.color] || colorMap.gray;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200',
        'font-medium text-sm whitespace-nowrap',
        isSelected
          ? cn(colors.bg, colors.text, colors.border, 'shadow-lg')
          : 'bg-background hover:bg-accent border-border',
        colors.hover
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-lg">{category.icon}</span>
      <span>{category.name}</span>
      {category.count !== undefined && (
        <span className={cn(
          'px-1.5 py-0.5 rounded-full text-xs font-bold',
          isSelected ? 'bg-background/20' : 'bg-muted'
        )}>
          {category.count}
        </span>
      )}
    </motion.button>
  );
}

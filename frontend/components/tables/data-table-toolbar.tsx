import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search, Plus } from 'lucide-react';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  title?: string;
  onAdd?: () => void;
  addLabel?: string;
}

const DataTableToolbar: React.FC<DataTableToolbarProps> = ({ 
  searchValue, 
  onSearchChange,
  searchPlaceholder = "Search...",
  title,
  onAdd,
  addLabel = "Add New"
}) => {
  const isFiltered = searchValue.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => onSearchChange('')}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {onAdd && (
        <Button onClick={onAdd} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
};

export default DataTableToolbar;
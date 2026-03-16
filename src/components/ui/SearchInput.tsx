import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative w-full md:w-96">
      <Search 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" 
        size={20} 
        aria-hidden="true"
      />
      <input
        type="text"
        placeholder="Search Pokemon..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-pokemon-red/50 transition-colors"
        aria-label="Search Pokemon"
      />
    </div>
  );
}

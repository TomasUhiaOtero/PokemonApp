import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pokemon-red to-pokemon-yellow flex items-center justify-center">
            <Sparkles className="text-white" size={16} />
          </div>
          <span className="text-white font-semibold text-shadow">Pokedex</span>
        </div>
        <p className="text-white/60 text-sm">
          Built with love for Pokemon fans everywhere
        </p>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">Data from PokeAPI</span>
        </div>
      </div>
    </footer>
  );
}

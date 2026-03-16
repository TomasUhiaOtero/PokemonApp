export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] bg-pokemon-red/20 animate-pulse" />
      <div 
        className="absolute bottom-40 right-1/4 w-80 h-80 rounded-full blur-[100px] bg-pokemon-blue/20 animate-pulse" 
        style={{ animationDelay: '1s' }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] bg-pokemon-yellow/10" />
    </div>
  );
}

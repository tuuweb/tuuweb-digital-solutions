import logo from "@/assets/logo.png";
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-4">
        <div className="absolute inset-0 bg-gradient-glow blur-3xl scale-150" />
        <img src={logo} alt="TuuWeb" className="relative h-20 w-20 rounded-2xl animate-pulse-glow" />
        <span className="relative font-display font-bold text-gradient text-lg tracking-wider">TuuWeb</span>
      </div>
    </div>
  );
}

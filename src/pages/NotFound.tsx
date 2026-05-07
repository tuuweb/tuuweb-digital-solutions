import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-7xl font-bold text-gradient">404</h1>
        <p className="text-muted-foreground mt-2">Página no encontrada.</p>
        <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}

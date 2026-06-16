import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/contact";
import { formatCOP } from "@/lib/supabase";

export interface QuoteItem {
  name: string;
  description?: string | null;
  price_cop?: number | null;
  image?: string | null;
  extraMessage?: string;
}

export function ProductQuoteDialog({
  item,
  open,
  onOpenChange,
}: {
  item: QuoteItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!item) return null;
  const msg = `Hola TuuWeb, quiero cotizar: "${item.name}"${
    item.price_cop ? ` (${formatCOP(item.price_cop)})` : ""
  }.${item.extraMessage ? " " + item.extraMessage : ""}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{item.name}</DialogTitle>
        </DialogHeader>
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-52 object-cover rounded-xl border border-border"
          />
        )}
        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        )}
        {item.price_cop ? (
          <div className="rounded-xl bg-gradient-primary p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-primary-foreground/80">Precio</div>
            <div className="font-display text-3xl font-bold text-primary-foreground">
              {formatCOP(item.price_cop)}
            </div>
          </div>
        ) : null}
        <Button
          asChild
          size="lg"
          className="w-full h-12 bg-success hover:bg-success/90 text-primary-foreground font-semibold gap-2"
        >
          <a href={waLink(msg)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-5 w-5" /> Cotizar por WhatsApp
          </a>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Te atendemos al +57 333 273 2672
        </p>
      </DialogContent>
    </Dialog>
  );
}

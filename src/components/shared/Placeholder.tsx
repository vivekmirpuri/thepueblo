/**
 * A "not built yet" card — SHARED. Every placeholder screen and component renders this, so the
 * whole app can be clicked through from day one. Delete each use as the real thing replaces it;
 * delete this file when none are left.
 */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Placeholder({ title, track, features, children }: {
  title: string;
  /** "A", "B", "C" or "Foundation" — who builds it (PLAN.md). */
  track: string;
  /** Feature ids from CONTEXT.md, e.g. "F4 · F5". */
  features: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="m-4 border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="flex flex-wrap gap-2">
          <Badge variant="secondary">Bloque {track}</Badge>
          <Badge variant="outline">{features}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{children ?? "Todavía no está hecho."}</CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm font-medium animate-pulse">Loading...</p>
    </div>
  );
}

import dynamic from "next/dynamic";

const WardMapClient = dynamic(() => import("./WardMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-2xl bg-muted/50 animate-pulse" />
  ),
});

export function WardMap() {
  return <WardMapClient />;
}

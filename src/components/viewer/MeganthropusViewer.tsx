import { useEffect, useState } from "react";
import ViewerCanvas from "./ViewerCanvas";

export function MeganthropusViewer() {

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {

    return (
      <div className="h-full w-full bg-muted animate-pulse"/>
    );

  }

  return (
    <div className="relative h-full w-full">

      <ViewerCanvas />

    </div>
  );

}
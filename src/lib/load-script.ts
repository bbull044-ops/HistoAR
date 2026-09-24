const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  if (loaded.has(src)) return Promise.resolve();

  const inFlight = pending.get(src);
  if (inFlight) return inFlight;

  const promise = new Promise<void>((resolve, reject) => {
    // Kalau tag <script> udah ada di DOM (misal dari boot() sebelumnya yang
    // masih loading - kejadian ini SERING pas React StrictMode double-invoke
    // effect di dev), jangan langsung resolve: itu bikin race condition di
    // mana A-Frame nyoba init system "mindar-image" sebelum script mind-ar
    // selesai ke-load & registerSystem()-nya jalan (-> "a[e] is not a
    // constructor" pas <a-scene> connectedCallback). Tunggu load/error-nya
    // beneran dulu.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => {
        loaded.add(src);
        resolve();
      });
      existing.addEventListener("error", () => reject(new Error(`Gagal memuat script: ${src}`)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      loaded.add(src);
      resolve();
    };
    script.onerror = () => reject(new Error(`Gagal memuat script: ${src}`));
    document.head.appendChild(script);
  }).finally(() => {
    pending.delete(src);
  });

  pending.set(src, promise);
  return promise;
}

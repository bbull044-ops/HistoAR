# Vendored AR libraries

These two files are copied verbatim from upstream and served from our own origin.
Do not edit them.

| File | Version | Source | sha256 |
|---|---|---|---|
| `aframe-1.5.0.min.js` | 1.5.0 | https://aframe.io/releases/1.5.0/aframe.min.js | `4fe911ce356f034b05da1a00d3a205ec19c8cf9de0ea17592cc6481b2cb98afb` |
| `mindar-image-aframe-1.2.5.prod.js` | 1.2.5 | https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js | `42764d6f1b39387f5786b9c4cfbe50883e13ca3f47b42bf1e54e84510b374013` |

## Why these are vendored instead of npm dependencies

A-Frame is a global-script library, not a module. It attaches itself to `window.AFRAME`
and registers the `<a-scene>` / `<a-entity>` custom elements as a load-time side effect.
`src/lib/ar-engine.ts` depends on exactly that behaviour (see `ensureAutoplayComponent()`
and `buildScene()`). A-Frame also bundles its own copy of three.js, and this project
already ships `three` plus `@react-three/fiber` and `@react-three/drei`. Bundling A-Frame
through Vite would put two three.js instances in one page, which is a known source of
silent breakage.

## Why they are not loaded from a CDN

Two reasons, both about the classroom:

1. **Offline.** A service worker cannot reliably precache cross-origin scripts. As long as
   these came from `aframe.io` and `cdn.jsdelivr.net`, offline AR was impossible no matter
   what else was built.
2. **School networks.** If a school filters or throttles a CDN, or the CDN is slow, AR
   simply does not start, in front of a class, with no useful error.

## Updating

1. Download the new version to `public/vendor/<name>-<version>.<ext>`.
2. Recompute the checksum: `sha256sum public/vendor/<file>`.
3. Update the table above (version, URL, sha256).
4. Update the two `loadScript` paths in `src/components/histoar/ArScan.tsx`.
5. Delete the old file.
6. Run `node scripts/check-vendor.mjs` and confirm it passes.
7. Test AR on a real device with a real printed marker. There is no automated test for
   tracking, so this step is not optional.

## Verifying

```
node scripts/check-vendor.mjs
```

Fails if a file is missing or its checksum does not match this table. Wire it into the
build so a corrupted or silently-swapped vendor file cannot ship.

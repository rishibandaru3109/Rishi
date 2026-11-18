# Component provenance

The visible hero uses a local canvas particle reveal over a semantic heading. The project gallery uses a local ordered-dither canvas generated once per image and revealed on hover or keyboard focus. Both retain static text or images as fallbacks.

The official npm and vendor registries could not be reached from this environment. The original Aceternity and Wensity components therefore still need installation and integration. When network access is available, review the registry entries and dependencies before installing.

```sh
npx shadcn@latest add https://ui.aceternity.com/registry/dither-shader-demo.json
pnpm dlx wensity@latest add canvas-text
```

Sources: [Aceternity Dither Shader registry](https://ui.aceternity.com/registry/dither-shader-demo.json) and [Wensity Canvas Text documentation](https://ui.wensity.com/components/canvas-text).


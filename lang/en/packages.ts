type PackageCatalogItem = Readonly<{
  readonly name: string;
  readonly description: string;
  readonly detail: string;
}>;

/** English copy and static catalog entries for the Packages home context. */
export const enPackages = {
  featureTitle: "tscircuit Packages",
  featureDescription: "Discover reusable boards and components from the community. Publish once, then share a single tscircuit link.",
  readMore: "Read more",
  searchPlaceholder: "Search packages",
  yourPackagesTitle: "Your packages",
  emptySearch: "No packages match that search.",
  previewLabel: "3D",
  catalog: [
    { name: "user/pico", description: "RP2040 dev board", detail: "A compact Pico reference" },
    { name: "user/raspberrypi", description: "Pi expansion board", detail: "GPIO and power breakout" },
    { name: "user/some-chip", description: "Chip breakout", detail: "A reusable IC footprint" },
    { name: "user/usb-c-power", description: "USB-C power input", detail: "Power delivery starter" },
    { name: "user/sensor-hub", description: "Sensor carrier", detail: "I²C and analog inputs" },
    { name: "user/motor-driver", description: "Motor driver", detail: "Control and protection board" },
    { name: "user/codec-board", description: "Audio codec", detail: "Low-noise audio interface" },
  ] satisfies readonly [PackageCatalogItem, ...PackageCatalogItem[]],
} as const;

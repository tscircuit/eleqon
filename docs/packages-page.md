# Packages page

The home notch opens the package catalog at `?screen=packages`. The small-scale
catalog is static English content in `lang/en/packages.ts`; client-side search
only filters that catalog and does not enter the URL.

The feature card’s Read more action opens the tscircuit Packages Docs article.
When a real registry is added, keep the catalog adapter separate from this page
and preserve the current URL state as the stable entry point.

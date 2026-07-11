import { useState } from "react";
import { enPackages } from "@/lang/en/packages";
import { enWorkspace } from "@/lang/en/workspace";
import styles from "./workspace.module.css";

/** Renders a searchable, local catalog of tscircuit packages. */
export function PackagesPage({ onReadMore }: { readonly onReadMore: () => void }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const packages = normalizedQuery === "" ? enPackages.catalog : enPackages.catalog.filter((pkg) => `${pkg.name} ${pkg.description} ${pkg.detail}`.toLowerCase().includes(normalizedQuery));

  return <section className={`${styles.frame} ${styles.packagesPage}`}><div className={styles.packagesContent}><section className={styles.packageFeature}><div className={styles.packageFeatureVisual} aria-hidden="true"><span>{enWorkspace.brand.productName}</span></div><article className={styles.packageFeatureCopy}><h1>{enPackages.featureTitle}</h1><p>{enPackages.featureDescription}</p><button type="button" onClick={onReadMore}>{enPackages.readMore}</button></article></section><label className={styles.packageSearch}><span>{enPackages.searchPlaceholder}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={enPackages.searchPlaceholder} /></label><section className={styles.packageCollection}><h2>{enPackages.yourPackagesTitle}</h2>{packages.length === 0 ? <p className={styles.packageEmpty}>{enPackages.emptySearch}</p> : <div className={styles.packageGrid}>{packages.map((pkg) => <article key={pkg.name} className={styles.packageCard}><div className={styles.packagePreview} aria-hidden="true"><span>{enPackages.previewLabel}</span></div><div><h3>{pkg.name}</h3><p>{pkg.description}</p><small>{pkg.detail}</small></div></article>)}</div>}</section></div></section>;
}

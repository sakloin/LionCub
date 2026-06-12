"use client";

import { Document, Page, View, Text, Image, Link, StyleSheet } from "@react-pdf/renderer";
import { formatSoles } from "../../lib/money";
import type { CatalogProduct } from "./CatalogoClient";

const COLORS = {
  ink: "#3D2010",
  inkMid: "#6B3D1E",
  muted: "#9B6B45",
  gold: "#D4A520",
  goldDeep: "#A07D10",
  cream: "#F8F5F0",
  border: "#F5EDD8",
  white: "#FFFFFF",
  wa: "#25D366",
  agotado: "#C44A2A",
};

const CATEGORY_LABELS: Record<string, string> = {
  conjuntos: "Conjuntos & Ajuares",
  bodies: "Bodies",
  baberos: "Baberos",
  mantas: "Mantas",
  otros: "Otros",
};
const CATEGORY_ORDER = ["conjuntos", "bodies", "baberos", "mantas", "otros"];

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 60,
    paddingHorizontal: 36,
    backgroundColor: COLORS.cream,
    fontFamily: "Helvetica",
    color: COLORS.ink,
  },
  // Cover
  coverPage: {
    padding: 0,
    backgroundColor: COLORS.cream,
    fontFamily: "Helvetica",
    color: COLORS.ink,
    flexDirection: "column",
  },
  coverInner: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 56,
    paddingBottom: 56,
    flexDirection: "column",
  },
  coverEyebrow: {
    fontSize: 9,
    letterSpacing: 4,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 18,
  },
  coverBrand: {
    fontSize: 56,
    color: COLORS.gold,
    fontFamily: "Helvetica-BoldOblique",
    marginBottom: 4,
  },
  coverTagline: {
    fontSize: 11,
    color: COLORS.inkMid,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 36,
  },
  coverDivider: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.gold,
    marginBottom: 28,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 1.5,
    maxWidth: 380,
    marginBottom: 36,
  },
  coverMeta: {
    fontSize: 9,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginTop: 8,
  },
  coverFooter: {
    marginTop: "auto",
    flexDirection: "column",
    gap: 14,
  },
  coverActions: {
    flexDirection: "row",
    gap: 10,
  },
  // Category header
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryEyebrow: {
    fontSize: 8,
    letterSpacing: 3,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  categoryCount: {
    marginLeft: "auto",
    fontSize: 9,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
  },
  // Product grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48.5%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: "column",
  },
  cardImageWrap: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    position: "relative",
  },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  agotadoBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.agotado,
    color: COLORS.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ofertaBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.gold,
    color: COLORS.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cardName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 2,
  },
  cardTagline: {
    fontSize: 8,
    color: COLORS.muted,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 6,
    lineHeight: 1.35,
    minHeight: 22,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.gold,
  },
  cardSku: {
    marginLeft: "auto",
    fontSize: 7,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  attrLabel: {
    fontSize: 7,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 3,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },
  sizeChip: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center",
  },
  colorDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorMore: {
    fontSize: 7,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    marginLeft: 2,
  },
  // Buttons (used in cover + footer)
  waButton: {
    backgroundColor: COLORS.wa,
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    textDecoration: "none",
  },
  webButton: {
    backgroundColor: COLORS.ink,
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    textDecoration: "none",
  },
  // Page footer (every non-cover page)
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerActions: { flexDirection: "row", gap: 8 },
  footerSmallBtn: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    textDecoration: "none",
  },
  footerBrand: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerBrandText: {
    fontSize: 8,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  footerPageNum: {
    fontSize: 8,
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    marginLeft: 10,
  },
});

interface Brand {
  whatsapp: string;
  whatsappUrl: string;
  website: string;
  email: string;
}

function totalStock(p: CatalogProduct): number {
  return (p.variants ?? []).filter(v => v.active).reduce((s, v) => s + v.stock, 0);
}

function uniqueSizes(p: CatalogProduct): string[] {
  const set = new Map<string, number>();
  (p.variants ?? []).forEach(v => {
    if (v.active && v.size) set.set(v.size.name, v.size.sort_order);
  });
  return Array.from(set.entries()).sort((a, b) => a[1] - b[1]).map(e => e[0]);
}

function uniqueColors(p: CatalogProduct): Array<{ name: string; hex: string }> {
  const map = new Map<string, string | null>();
  (p.variants ?? []).forEach(v => {
    if (v.active && v.color) map.set(v.color.name, v.color.hex_code);
  });
  return Array.from(map.entries()).map(([name, hex]) => ({
    name,
    hex: hex || "#EEEEEE",
  }));
}

function primaryImageUrl(p: CatalogProduct): string | null {
  const fromGallery = p.images?.find(i => i.is_primary)?.url
    ?? p.images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  return fromGallery ?? p.image_url ?? null;
}

function ProductCard({ p }: { p: CatalogProduct }) {
  const stock = totalStock(p);
  const out = stock === 0;
  const sizes = uniqueSizes(p);
  const colors = uniqueColors(p);
  const colorsShown = colors.slice(0, 8);
  const colorsExtra = colors.length - colorsShown.length;
  const img = primaryImageUrl(p);

  return (
    <View style={styles.card} wrap={false}>
      <View style={styles.cardImageWrap}>
        {img ? <Image src={img} style={styles.cardImage} /> : null}
        {p.has_offer && !out && <Text style={styles.ofertaBadge}>OFERTA</Text>}
        {out && <Text style={styles.agotadoBadge}>AGOTADO</Text>}
      </View>
      <Text style={styles.cardName}>{p.name}</Text>
      <Text style={styles.cardTagline}>{p.tagline || " "}</Text>
      <View style={styles.cardPriceRow}>
        <Text style={styles.cardPrice}>{formatSoles(p.price)}</Text>
      </View>
      {sizes.length > 0 && (
        <>
          <Text style={styles.attrLabel}>TALLAS</Text>
          <View style={styles.sizeRow}>
            {sizes.map(s => (
              <Text key={s} style={styles.sizeChip}>{s}</Text>
            ))}
          </View>
        </>
      )}
      {colors.length > 0 && (
        <>
          <Text style={styles.attrLabel}>COLORES</Text>
          <View style={styles.colorRow}>
            {colorsShown.map(c => (
              <View key={c.name} style={[styles.colorDot, { backgroundColor: c.hex }]} />
            ))}
            {colorsExtra > 0 && <Text style={styles.colorMore}>+{colorsExtra}</Text>}
          </View>
        </>
      )}
    </View>
  );
}

function PageFooter({ brand }: { brand: Brand }) {
  return (
    <View style={styles.pageFooter} fixed>
      <View style={styles.footerActions}>
        <Link src={brand.whatsappUrl} style={[styles.footerSmallBtn, { backgroundColor: COLORS.wa, color: COLORS.white }]}>
          WhatsApp +{brand.whatsapp}
        </Link>
        <Link src={`https://${brand.website}`} style={[styles.footerSmallBtn, { backgroundColor: COLORS.ink, color: COLORS.white }]}>
          {brand.website}
        </Link>
      </View>
      <View style={styles.footerBrand}>
        <Text style={styles.footerBrandText}>LION CUB · BABY CLOTHING</Text>
        <Text
          style={styles.footerPageNum}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </View>
  );
}

export function CatalogDocument({ products, brand }: { products: CatalogProduct[]; brand: Brand }) {
  const grouped: Record<string, CatalogProduct[]> = {};
  products.forEach(p => {
    const k = CATEGORY_ORDER.includes(p.category) ? p.category : "otros";
    (grouped[k] ??= []).push(p);
  });

  const today = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  const total = products.length;

  return (
    <Document title="Lion Cub — Catálogo" author="Lion Cub Baby Clothing">
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverInner}>
          <Text style={styles.coverEyebrow}>BABY CLOTHING · PERÚ</Text>
          <Text style={styles.coverBrand}>Lion Cub</Text>
          <Text style={styles.coverTagline}>100% Algodón Pima peruano</Text>
          <View style={styles.coverDivider} />
          <Text style={styles.coverTitle}>Catálogo</Text>
          <Text style={styles.coverSubtitle}>
            La fibra más suave del mundo. Respirable, delicada e hipoalergénica.
            Diseñado para el primer abrazo y los días que siguen.
          </Text>
          <Text style={styles.coverMeta}>
            ACTUALIZADO · {today.toUpperCase()} · {total} PRODUCTOS
          </Text>

          <View style={styles.coverFooter}>
            <View style={styles.coverActions}>
              <Link src={brand.whatsappUrl} style={styles.waButton}>
                WhatsApp +{brand.whatsapp}
              </Link>
              <Link src={`https://${brand.website}`} style={styles.webButton}>
                {brand.website}
              </Link>
            </View>
            <Text style={{ fontSize: 9, color: COLORS.muted }}>
              Consultas y pedidos por WhatsApp o en {brand.website}
            </Text>
          </View>
        </View>
        <PageFooter brand={brand} />
      </Page>

      {/* Catalog body */}
      <Page size="A4" style={styles.page}>
        {CATEGORY_ORDER.filter(c => grouped[c]?.length).map((cat, idx) => (
          <View key={cat} style={{ marginBottom: 18 }} break={idx > 0}>
            <View style={styles.categoryHeader}>
              <View>
                <Text style={styles.categoryEyebrow}>COLECCIÓN</Text>
                <Text style={styles.categoryTitle}>{CATEGORY_LABELS[cat]}</Text>
              </View>
              <Text style={styles.categoryCount}>{grouped[cat].length} productos</Text>
            </View>
            <View style={styles.grid}>
              {grouped[cat].map(p => <ProductCard key={p.id} p={p} />)}
            </View>
          </View>
        ))}
        <PageFooter brand={brand} />
      </Page>
    </Document>
  );
}

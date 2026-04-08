import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiGet } from "@/lib/api";
import PaymentPanel from "@/components/products/PaymentPanel";
import { getViewerGeo } from "@/lib/geo";
import { getSiteUrl } from "@/lib/env";

interface Product {
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  image_url?: string;
  demo_url?: string;
  support_url?: string;
  support_email?: string;
  status: "published" | "hidden" | "upcoming";
  price_usd: number;
  price_ngn: number;
  delivery_type?: "none" | "download" | "access" | "both";
  content?: {
    hero_title?: string;
    hero_description?: string;
    kpis?: { key: string; sub: string }[];
    features?: { title: string; description: string }[];
    steps?: { title: string; description: string }[];
    benefits?: string[];
    faq?: { q: string; a: string }[];
  };
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
  };
  kpis?: { key: string; sub: string }[];
  features?: { title: string; description: string }[];
  steps?: { title: string; description: string }[];
  benefits?: { text: string }[];
  faqs?: { q: string; a: string }[];
}

function resolveAbsoluteImageUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getSiteUrl(url);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await apiGet<Product>(`/products/${slug}/`);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const title =
    product.seo?.meta_title ||
    product.seo?.og_title ||
    product.content?.hero_title ||
    product.name;

  const description =
    product.seo?.meta_description ||
    product.seo?.og_description ||
    product.content?.hero_description ||
    product.short_description ||
    product.tagline;

  const canonical = product.seo?.canonical_url || `/products/${product.slug}`;
  const ogImage = resolveAbsoluteImageUrl(product.seo?.og_image || product.image_url);

  return {
    title,
    description,
    keywords: product.seo?.meta_keywords || "",
    alternates: { canonical },
    openGraph: {
      title: product.seo?.og_title || title,
      description: product.seo?.og_description || description,
      type: "website",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo?.og_title || title,
      description: product.seo?.og_description || description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

function getDeliveryLabel(deliveryType?: Product["delivery_type"]) {
  switch (deliveryType) {
    case "download":
      return "Instant Download";
    case "access":
      return "Instant Access";
    case "both":
      return "Download + Access";
    default:
      return "Digital Delivery";
  }
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, geo] = await Promise.all([
    apiGet<Product>(`/products/${slug}/`),
    getViewerGeo(),
  ]);

  if (!product) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xl">
            <h1 className="text-2xl font-semibold text-gray-900">Product not found</h1>
            <p className="mt-3 text-sm text-gray-600">
              The product you are trying to view is unavailable or does not exist.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const showNaira = geo.isNigeria;

  const resolvedKpis = product.kpis?.length ? product.kpis : product.content?.kpis || [];
  const resolvedFeatures = product.features?.length
    ? product.features
    : product.content?.features || [];
  const resolvedSteps = product.steps?.length ? product.steps : product.content?.steps || [];
  const resolvedBenefits = product.benefits?.length
    ? product.benefits.map((b) => b.text)
    : product.content?.benefits || [];
  const resolvedFaq = product.faqs?.length ? product.faqs : product.content?.faq || [];

  const heroTitle = product.content?.hero_title || product.name;
  const heroDescription =
    product.content?.hero_description || product.short_description || product.tagline;
  const productImage = product.image_url || product.seo?.og_image || "";

  const isUpcoming = product.status === "upcoming";
  const deliveryLabel = getDeliveryLabel(product.delivery_type);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fafafa] pb-28 text-gray-900 md:pb-10">
        <section className="relative overflow-visible border-b border-gray-200 bg-white pt-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.04),transparent_30%)]" />

          <div className="relative mx-auto max-w-[1520px] px-4 pb-14 sm:px-6 xl:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_360px] xl:grid-cols-[minmax(0,1.55fr)_380px] 2xl:grid-cols-[minmax(0,1.65fr)_400px] 2xl:gap-10">
              <div className="min-w-0 space-y-8">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,520px)] xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                        Digital Product
                      </span>

                      <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        {deliveryLabel}
                      </span>

                      {isUpcoming ? (
                        <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800">
                          Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Available Now
                        </span>
                      )}
                    </div>

                    <h1 className="mt-6 max-w-5xl text-4xl font-bold tracking-tight text-gray-950 md:text-5xl xl:text-6xl">
                      {heroTitle}
                    </h1>

                    <p className="mt-6 max-w-4xl text-base leading-8 text-gray-600 md:text-lg">
                      {heroDescription}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      {product.demo_url ? (
                        <a
                          href={product.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-105 hover:bg-black"
                        >
                          View Demo
                        </a>
                      ) : null}

                      {product.support_url ? (
                        <a
                          href={product.support_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-lg transition hover:scale-105 hover:bg-gray-50"
                        >
                          Support
                        </a>
                      ) : null}

                      {product.support_email ? (
                        <a
                          href={`mailto:${product.support_email}`}
                          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-lg transition hover:scale-105 hover:bg-gray-50"
                        >
                          Contact Sales
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-yellow-500">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_30%),linear-gradient(135deg,#0a0a0a_0%,#18181b_55%,#facc15_100%)]" />
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                          <p className="text-sm font-medium text-white/80">
                            Professional digital solution
                          </p>
                          <h2 className="mt-1 text-xl font-semibold text-white">{product.name}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!!resolvedKpis.length && (
                  <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                      {resolvedKpis.map((kpi) => (
                        <div
                          key={kpi.key}
                          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition hover:scale-105"
                        >
                          <div className="text-2xl font-bold tracking-tight text-gray-950">
                            {kpi.key}
                          </div>
                          <div className="mt-2 text-sm leading-6 text-gray-600">{kpi.sub}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!resolvedFeatures.length && (
                  <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6 lg:p-8">
                    <div className="max-w-3xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Product Overview
                      </p>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                        Core Features
                      </h2>
                      <p className="mt-4 text-base leading-7 text-gray-600">
                        A structured breakdown of the main capabilities included in this product.
                      </p>
                    </div>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                      {resolvedFeatures.map((feature, index) => (
                        <div
                          key={`${feature.title}-${index}`}
                          className="flex h-full min-w-0 flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-xl transition hover:scale-105"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-sm font-bold text-white shadow-lg">
                            {(index + 1).toString().padStart(2, "0")}
                          </div>
                          <h3 className="mt-5 text-xl font-semibold text-gray-950">
                            {feature.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!resolvedSteps.length && (
                  <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6 lg:p-8">
                    <div className="max-w-3xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Simple Process
                      </p>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                        How It Works
                      </h2>
                    </div>

                    <div className="mt-10 grid gap-6 xl:grid-cols-3">
                      {resolvedSteps.map((step, index) => (
                        <div
                          key={`${step.title}-${index}`}
                          className="relative h-full min-w-0 rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-xl"
                        >
                          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-950 shadow-lg">
                            {index + 1}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-950">{step.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-gray-600">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!resolvedBenefits.length && (
                  <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6 lg:p-8">
                    <div className="max-w-3xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Why It Matters
                      </p>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                        Benefits
                      </h2>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                      {resolvedBenefits.map((benefit, index) => (
                        <div
                          key={`${benefit}-${index}`}
                          className="flex h-full min-w-0 items-start gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl transition hover:scale-105"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white shadow-lg">
                            ✓
                          </div>
                          <p className="text-sm leading-7 text-gray-700">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!resolvedFaq.length && (
                  <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6 lg:p-8">
                    <div className="max-w-3xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Answers
                      </p>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                        Frequently Asked Questions
                      </h2>
                    </div>

                    <div className="mt-10 space-y-4">
                      {resolvedFaq.map((item, index) => (
                        <details
                          key={`${item.q}-${index}`}
                          className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-left">
                            <span className="text-lg font-semibold text-gray-950">{item.q}</span>
                            <span className="shrink-0 text-2xl font-light text-gray-500 transition group-open:rotate-45">
                              +
                            </span>
                          </summary>
                          <div className="border-t border-gray-100 px-6 py-5">
                            <p className="text-sm leading-7 text-gray-600">{item.a}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="mx-auto w-full max-w-[400px]">
                    <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
                      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 p-4 text-white xl:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                              Checkout
                            </p>
                            <h2 className="mt-2 text-xl font-bold tracking-tight xl:text-2xl">
                              Purchase this product
                            </h2>
                          </div>

                          {!isUpcoming ? (
                            <span className="inline-flex rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-white-200">
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-200">
                              Coming Soon
                            </span>
                          )}
                        </div>

                        <div className="mt-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                              Price
                            </p>

                            {showNaira ? (
                              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
                                Browsing from Nigeria
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 text-2xl font-bold tracking-tight xl:text-3xl">
                            ${product.price_usd.toLocaleString()}
                          </p>

                          {showNaira ? (
                            <p className="mt-1 text-sm text-white/80">
                              ₦{product.price_ngn.toLocaleString()}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="p-3 xl:p-4">
                        {!isUpcoming ? (
                          <div className="rounded-3xl border border-gray-200 bg-white p-2">
                            <PaymentPanel
                              slug={product.slug}
                              priceUsd={product.price_usd}
                              priceNgn={product.price_ngn}
                              showNaira={showNaira}
                              isNigeria={showNaira}
                            />
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5">
                            <h3 className="text-base font-semibold text-yellow-900">
                              This product is upcoming
                            </h3>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="mobile-checkout" className="border-b border-gray-200 bg-white py-10 lg:hidden">
          <div className="mx-auto max-w-[1520px] px-4 sm:px-6 xl:px-8">
            {!isUpcoming ? (
              <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl">
                <div className="grid gap-6 p-5 sm:p-6">
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-6 shadow-lg">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                            Checkout
                          </p>

                          {showNaira ? (
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                              Browsing from Nigeria
                            </span>
                          ) : null}
                        </div>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                          Purchase this product
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-gray-600">
                          Complete your payment below and get access based on the selected delivery
                          type.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                          Price
                        </p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                          ${product.price_usd.toLocaleString()}
                        </p>

                        {showNaira ? (
                          <p className="mt-1 text-sm text-gray-600">
                            ₦{product.price_ngn.toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 overflow-hidden rounded-3xl border border-gray-200 bg-white p-2 shadow-lg">
                    <PaymentPanel
                      slug={product.slug}
                      priceUsd={product.price_usd}
                      priceNgn={product.price_ngn}
                      showNaira={showNaira}
                      isNigeria={showNaira}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[2rem] border border-yellow-200 bg-yellow-50 p-6 shadow-xl">
                <div className="grid gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-700">
                      Checkout Status
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-yellow-950">
                      This product is upcoming
                    </h2>
                  </div>
                  <p className="text-sm leading-7 text-yellow-900">
                    Checkout is currently unavailable. You can still review the product details,
                    demo, and support resources while the release is being prepared.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1520px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-950">{product.name}</p>
            <p className="text-xs text-gray-600">
              {!isUpcoming
                ? showNaira
                  ? `$${product.price_usd.toLocaleString()} • ₦${product.price_ngn.toLocaleString()} • ${deliveryLabel}`
                  : `$${product.price_usd.toLocaleString()} • ${deliveryLabel}`
                : "Upcoming product"}
            </p>
          </div>

          <a
            href="#mobile-checkout"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-105 hover:bg-black"
          >
            {!isUpcoming ? "Checkout" : "View Details"}
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}

'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  Star,
  Store,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  CreditCard,
  BarChart3,
  Menu,
  X,
  Palette,
  Percent,
  MapPin,
} from "lucide-react";

/* ─── Data ──────────────────────────────────────────────────── */

const features = [
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Branded Subdomain Storefront",
    description:
      "Every vendor gets their own storefront at yourstore.shopsphere.ng — your brand, your identity, completely separate from any marketplace noise.",
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Dual Payment Gateway",
    description:
      "Paystack handles Nigerian bank payouts. Stripe Connect handles international transactions. The platform routes each sale automatically — no setup from you.",
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: "No-Code Customization",
    description:
      "Change your storefront colors, logo, layout, and theme through a visual editor. No developer, no code, no technical knowledge needed at any point.",
  },
  {
    icon: <Percent className="w-5 h-5" />,
    title: "Commission-Only Pricing",
    description:
      "Zero monthly fees. Zero setup costs. ShopSphere earns a small commission only when you complete a sale — your success is the only thing that earns us anything.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Vendor Analytics Dashboard",
    description:
      "Track your orders, revenue, and customer activity in real time. Every metric you need to grow your store, clearly presented and isolated to your data only.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Live in Under Five Minutes",
    description:
      "A guided onboarding flow takes you from registration to a fully stocked, live storefront in a few short steps. No phone calls, no waiting.",
  },
];

const steps = [
  {
    number: "01",
    title: "Register your store",
    description:
      "Choose a store name and complete a short guided registration. Your subdomain is active immediately — no waiting for approval.",
  },
  {
    number: "02",
    title: "Customize and stock it",
    description:
      "Set your colors, upload your logo, add products with prices and images — all through a visual interface that requires zero technical knowledge.",
  },
  {
    number: "03",
    title: "Share and start selling",
    description:
      "Send customers to your link. ShopSphere handles payments, commission deduction, and payouts to your bank account automatically.",
  },
];

const comparisonRows = [
  { feature: "Branded storefront URL",        jumia: false, shopify: true,  sphere: true  },
  { feature: "Your own subdomain",            jumia: false, shopify: true,  sphere: true  },
  { feature: "No monthly subscription",       jumia: true,  shopify: false, sphere: true  },
  { feature: "Paystack naira payouts",         jumia: false, shopify: false, sphere: true  },
  { feature: "Stripe international payouts",  jumia: false, shopify: true,  sphere: true  },
  { feature: "No-code store customization",   jumia: false, shopify: true,  sphere: true  },
  { feature: "Commission-only model",         jumia: false, shopify: false, sphere: true  },
];

const testimonials = [
  {
    name: "Amaka Eze",
    role: "Food & Catering Vendor",
    company: "Amaka's Kitchen, Warri",
    content:
      "Before ShopSphere I was just another listing buried under hundreds of sellers on Jumia. Now customers go directly to amakas.shopsphere.ng and they know it is my brand. Repeat orders tripled in three months.",
    rating: 5,
  },
  {
    name: "Chukwuemeka Obi",
    role: "Electronics Retailer",
    company: "TechHub Delta, Asaba",
    content:
      "The Paystack integration means my customers pay in naira and the money goes straight to my Access Bank account. No foreign subscriptions eating into my margin. I pay nothing unless I sell.",
    rating: 5,
  },
  {
    name: "Ngozi Adeleke",
    role: "Fashion & Accessories",
    company: "Ngozi Collections, Effurun",
    content:
      "I set up my store in one afternoon without calling anyone for help. The customization panel let me match my storefront to my brand colors exactly. My customers think I hired a web developer.",
    rating: 5,
  },
];

/* ─── Component ─────────────────────────────────────────────── */

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground tracking-tight">ShopSphere</span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features"     className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#payments"     className="text-sm text-muted-foreground hover:text-foreground transition-colors">Payments</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Button asChild size="sm">
                <Link href="/signup">Open Your Store</Link>
              </Button>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border flex flex-col gap-4">
              <a href="#features"     className="text-sm text-muted-foreground" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#payments"     className="text-sm text-muted-foreground" onClick={() => setIsMenuOpen(false)}>Payments</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground" onClick={() => setIsMenuOpen(false)}>How it works</a>
              <a href="#testimonials" className="text-sm text-muted-foreground" onClick={() => setIsMenuOpen(false)}>Reviews</a>
              <Link href="/login"    className="text-sm text-muted-foreground">Login</Link>
              <Button asChild className="w-full"><Link href="/signup">Open Your Store</Link></Button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background">
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 gap-1.5">
                <MapPin className="w-3 h-3" />
                Built for Nigerian SMEs
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                Your store.{" "}
                <span className="text-primary">Your brand.</span>
                <br />
                No monthly fees.
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                ShopSphere gives Nigerian vendors a branded subdomain storefront, a no-code
                customization engine, and a payment system that pays directly into your Nigerian
                bank account — with zero upfront cost. You pay only when you sell.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button size="lg" asChild>
                  <Link href="/signup" className="flex items-center gap-2">
                    Open Your Store Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {[
                  "₦0 setup cost",
                  "Commission on sales only",
                  "Paystack + Stripe built in",
                  "Live in under 5 minutes",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: storefront mockup */}
            <div className="relative">
              {/* Main card */}
              <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-muted px-4 py-3 flex items-center gap-3 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/25" />
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/15" />
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/10" />
                  </div>
                  <div className="flex-1 bg-background rounded-md px-3 py-1.5 text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-primary" />
                    ngozi.shopsphere.ng
                  </div>
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20 py-0 px-2">Live</Badge>
                </div>

                {/* Vendor store header */}
                <div className="px-5 py-4 border-b border-border" style={{ background: "var(--ss-gradient-primary)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-foreground/60 text-xs mb-0.5 uppercase tracking-wider">Ngozi Collections</p>
                      <h3 className="text-primary-foreground font-semibold text-sm">Fashion & Accessories · Effurun</h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                      <Store className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Product grid */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { name: "Ankara Blouse",  price: "₦8,500" },
                      { name: "Beaded Bag",     price: "₦12,000" },
                      { name: "Wax Print Set",  price: "₦22,000" },
                    ].map((product) => (
                      <div key={product.name} className="rounded-xl overflow-hidden border border-border bg-background">
                        <div className="h-16 bg-accent/40" />
                        <div className="p-2">
                          <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-primary font-semibold">{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 rounded-full bg-muted flex-1" />
                    <div className="h-1.5 rounded-full bg-muted w-3/5" />
                  </div>
                </div>
              </div>

              {/* Floating: payment received */}
              <div className="absolute -bottom-5 -right-4 bg-card border border-border rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--ss-paystack)" }}
                >
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-none mb-1">₦8,500 received</p>
                  <p className="text-xs text-muted-foreground leading-none">via Paystack · GTBank</p>
                </div>
              </div>

              {/* Floating: traffic stat */}
              <div className="absolute -top-5 -left-4 bg-card border border-border rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-none mb-1">+240% this month</p>
                  <p className="text-xs text-muted-foreground leading-none">store traffic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "₦0",           label: "To open your store" },
              { number: "2",            label: "Payment gateways" },
              { number: "< 5 min",      label: "To go live" },
              { number: "1 commission", label: "No hidden fees" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl lg:text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-primary-foreground/65 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Platform features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything a Nigerian vendor needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ShopSphere is built specifically around the barriers that keep Nigerian SMEs out
              of digital commerce — cost, technical complexity, and payment infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment Gateway ───────────────────────────────────── */}
      <section id="payments" className="py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: explanation */}
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Dual payment engine</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                One platform. Two gateways. Zero configuration.
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Stripe Connect excludes Nigerian bank accounts for direct payouts. Paystack does
                not fully serve international vendors. ShopSphere solves both — automatically
                routing each transaction through the correct gateway without the vendor touching
                a single setting.
              </p>
              <div className="space-y-5">
                {[
                  {
                    label: "Nigerian vendors",
                    detail: "Paid directly into your Nigerian bank account via Paystack — naira, zero conversion losses.",
                  },
                  {
                    label: "International vendors",
                    detail: "Stripe Connect handles global payouts across 40+ countries with full compliance.",
                  },
                  {
                    label: "Automatic routing",
                    detail: "The platform detects vendor type and selects the correct gateway at transaction time.",
                  },
                  {
                    label: "Commission deducted at source",
                    detail: "ShopSphere's share is split off automatically — no manual reconciliation, no chasing invoices.",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.label}</p>
                      <p className="text-muted-foreground text-sm">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: gateway cards */}
            <div className="flex flex-col gap-4">
              {/* Paystack */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-md">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--ss-paystack)" }}
                  >
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Paystack</p>
                    <p className="text-xs text-muted-foreground">Nigerian vendors</p>
                  </div>
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">Active</Badge>
                </div>
                <div className="space-y-2.5">
                  {[
                    ["Bank transfer",    "GTBank, Access, Zenith…"],
                    ["USSD payments",    "Supported"],
                    ["Naira payouts",    "✓ Direct to account"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={label === "Naira payouts" ? "text-primary font-medium" : "text-foreground font-medium"}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stripe Connect */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-md">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--ss-stripe)" }}
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Stripe Connect</p>
                    <p className="text-xs text-muted-foreground">International vendors</p>
                  </div>
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">Active</Badge>
                </div>
                <div className="space-y-2.5">
                  {[
                    ["Countries supported", "40+"],
                    ["Card payments",       "Visa, Mastercard, Amex"],
                    ["Global payouts",      "✓ Direct"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={label === "Global payouts" ? "text-primary font-medium" : "text-foreground font-medium"}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Routing note */}
              <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">Automatic routing — </span>
                  ShopSphere selects the right gateway for every vendor at transaction time. No configuration required from the vendor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Simple onboarding</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              From registration to live store in three steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No developer needed. No configuration headaches. A guided flow that puts your
              store online in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-border" />

            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-6 shadow-md shadow-primary/20">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button size="lg" asChild>
              <Link href="/signup" className="flex items-center gap-2">
                Open Your Store Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────── */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Why ShopSphere</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Not just another marketplace
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Existing platforms leave Nigerian vendors choosing between visibility without
              identity, or independence without affordability. ShopSphere removes that trade-off.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium w-[40%]" />
                  <th className="py-4 px-4 text-center text-muted-foreground font-medium text-xs">Jumia / Konga</th>
                  <th className="py-4 px-4 text-center text-muted-foreground font-medium text-xs">Shopify</th>
                  <th className="py-4 px-4 text-center bg-primary/8 text-primary font-semibold text-xs">ShopSphere</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={`border-t border-border ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                    <td className="py-3.5 px-6 text-foreground">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center">
                      {row.jumia
                        ? <Check className="w-4 h-4 text-primary mx-auto" />
                        : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.shopify
                        ? <Check className="w-4 h-4 text-primary mx-auto" />
                        : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 text-center bg-primary/5">
                      {row.sphere
                        ? <Check className="w-4 h-4 text-primary mx-auto" />
                        : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Vendor stories</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Nigerian vendors building real businesses
            </h2>
            <p className="text-lg text-muted-foreground">
              From Warri to Asaba, ShopSphere is powering the next generation of Delta State commerce.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto shadow-xl border-border">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-foreground mb-8 leading-relaxed font-medium">
                  &ldquo;{testimonials[currentTestimonial].content}&rdquo;
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                    {testimonials[currentTestimonial].name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">
                      {testimonials[currentTestimonial].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonials[currentTestimonial].role} · {testimonials[currentTestimonial].company}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? "w-6 bg-primary"
                    : "w-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--ss-gradient-hero)" }}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Your branded storefront is waiting
          </h2>
          <p className="text-xl mb-10 text-primary-foreground/75 max-w-2xl mx-auto leading-relaxed">
            Open your store today at no cost. ShopSphere earns only when you do —
            a commission on each completed sale, nothing more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              asChild
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg font-semibold"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Open Your Store Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/50">
            No credit card · No subscription · Commission on sales only
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Store className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">ShopSphere</span>
              </div>
              <p className="text-background/55 text-sm leading-relaxed mb-4">
                The e-commerce platform built for Nigerian SMEs — branded storefronts,
                dual payment infrastructure, zero upfront cost.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-background/35">
                <MapPin className="w-3 h-3" />
                Delta State, Nigeria
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Platform</h3>
              <ul className="space-y-3 text-background/55 text-sm">
                <li><a href="#features"     className="hover:text-background transition-colors">Features</a></li>
                <li><a href="#payments"     className="hover:text-background transition-colors">Payments</a></li>
                <li><a href="#how-it-works" className="hover:text-background transition-colors">How it works</a></li>
                <li><Link href="/shops"     className="hover:text-background transition-colors">Browse Stores</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Vendors</h3>
              <ul className="space-y-3 text-background/55 text-sm">
                <li><Link href="/signup" className="hover:text-background transition-colors">Open a Store</Link></li>
                <li><Link href="/login"  className="hover:text-background transition-colors">Vendor Login</Link></li>
                <li><a href="#"          className="hover:text-background transition-colors">Help Center</a></li>
                <li><a href="#"          className="hover:text-background transition-colors">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Company</h3>
              <ul className="space-y-3 text-background/55 text-sm">
                <li><a href="#" className="hover:text-background transition-colors">About</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-background/35 text-sm">
              © 2025 ShopSphere. Built for Nigerian small and medium enterprises.
            </p>
            <div className="flex items-center gap-3 text-xs text-background/35">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--ss-paystack)" }} />
                <span>Paystack</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--ss-stripe)" }} />
                <span>Stripe Connect</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
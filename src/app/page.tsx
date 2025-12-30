import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  TabletSmartphone,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/public-header";
import { placeholderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === "hero-image");
  const driverFeatureImage = placeholderImages.find((img) => img.id === "feature-driver");
  const adminFeatureImage = placeholderImages.find((img) => img.id === "feature-admin");
  const customerFeatureImage = placeholderImages.find((img) => img.id === "feature-customer");

  const features = [
    {
      icon: <TabletSmartphone className="h-8 w-8 text-primary" />,
      title: "For Drivers: One-Tap Updates",
      description:
        "No more typing. A simple, fatigue-safe interface for drivers to record trip progress with a single tap. Works on any mobile device.",
      image: driverFeatureImage
    },
    {
      icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
      title: "For Admins: Real-Time Control",
      description:
        "A powerful dashboard to monitor all shipments in real-time. Create shipments, manage drivers, and oversee your entire operation.",
      image: adminFeatureImage
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "For Customers: Transparent Tracking",
      description:
        "Provide your customers with a simple tracking page. No login required. They can see their shipment's progress with just an order code.",
      image: customerFeatureImage
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Modernize Your Logistics with Greenlane Transporters
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Streamlined shipment management and real-time tracking. Our
                    one-tap system is built for drivers, powerful for admins,
                    and transparent for customers.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/track">
                      Track a Shipment
                    </Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  A Workflow for Everyone
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Greenlane Transporters is designed to meet the specific needs of every
                  user in your logistics chain.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-12">
              {features.map((feature, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feature.image && (
                      <Image
                        src={feature.image.imageUrl}
                        alt={feature.image.description}
                        width={400}
                        height={250}
                        className="rounded-lg object-cover aspect-video w-full"
                        data-ai-hint={feature.image.imageHint}
                      />
                    )}
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-6 w-full shrink-0 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 Greenlane Transporters. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

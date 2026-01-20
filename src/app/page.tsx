import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/public-header";
import { placeholderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === "hero-image");

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

        <section id="mission-vision" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                  Our Commitment
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Mission & Vision
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Driving our success and yours with a clear purpose and a forward-thinking approach.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-12 pt-12 md:grid-cols-2">
              {/* Vision Card */}
              <div className="flex flex-col gap-4 text-center items-center md:text-left md:items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline">Our Vision</h3>
                </div>
                <p className="text-muted-foreground">
                  To be the top trucking company in our region. We aim to achieve this by consistently providing outstanding services that go beyond our customers' highest expectations.
                </p>
              </div>

              {/* Mission Card */}
              <div className="flex flex-col gap-4 text-center items-center md:text-left md:items-start">
                 <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline">Our Mission</h3>
                </div>
                <p className="text-muted-foreground">
                  To offer exceptional transportation services, while unwaveringly upholding the highest standards of safety, reliability, and professionalism. We aim to build long-lasting client relationships through cost-effective solutions and on-time deliveries, contributing to our clients' ongoing success.
                </p>
              </div>
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

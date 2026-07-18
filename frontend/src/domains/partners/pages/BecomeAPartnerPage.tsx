import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, Globe2, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const VALUE_PROPS = [
  {
    icon: Globe2,
    title: "List your business",
    description: "Create a public profile travelers can discover across Kenya.",
  },
  {
    icon: TrendingUp,
    title: "Reach travelers across Kenya",
    description: "Get in front of people who are actively planning their trips.",
  },
  {
    icon: ShieldCheck,
    title: "Get verified and build trust",
    description: "A verified badge signals to travelers that you're a legitimate, vetted business.",
  },
];

export default function BecomeAPartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/25 font-body">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Partner Program
            </Badge>
            <h1 className="font-display text-4xl font-bold text-foreground">Become a Partner</h1>
            <p className="mt-4 font-body text-muted-foreground">
              Join tour operators, lodges, guides, and other tourism businesses growing with us. Registration takes
              about 15 minutes, and our team reviews every application before it goes live.
            </p>
            <Button asChild size="lg" className="rounded-full mt-8">
              <Link to="/partner/register">
                Start your application <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 mt-16 grid gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <Icon className="h-8 w-8 mx-auto text-primary" />
              <h3 className="mt-3 font-display font-semibold text-foreground">{title}</h3>
              <p className="mt-1 font-body text-sm text-muted-foreground">{description}</p>
            </motion.div>
          ))}
        </div>
      </main>
      <FooterSection />
    </div>
  );
}

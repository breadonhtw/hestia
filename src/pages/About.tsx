import { PageLayout } from "@/components/PageLayout";
import { Footer } from "@/components/Footer";
import { Heart, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import hestiaLogo from "@/assets/hestia-logo.svg";

const About = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <div className="w-full">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-8 min-h-[60vh] py-12 md:py-16 lg:py-20 flex items-center justify-center">
          <div className="text-center w-full">
            <img
              src={hestiaLogo}
              alt="Hestia"
              className="h-24 mx-auto mb-8 animate-float"
            />
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
              About Hestia
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Named after the Greek goddess of home and hearth, Hestia
              celebrates the makers who craft beauty from their homes, bringing
              warmth and artistry to our neighborhoods.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-primary/5 py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-foreground leading-relaxed text-center mb-8">
              We believe that every neighborhood is filled with talented
              artisans creating extraordinary things from their homes. Hestia
              exists to help you discover these hidden treasures and connect
              with the makers behind them—not to buy and sell, but to build
              community and celebrate human creativity.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 lg:px-8 py-12 md:py-16 lg:py-20">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-16 text-center">
            Why Hestia?
          </h2>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                Community
              </h3>
              <p className="text-muted-foreground">
                We bring neighbors together, fostering connections between
                makers and admirers in the same community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                Craftsmanship
              </h3>
              <p className="text-muted-foreground">
                We honor the skill, dedication, and artistry that goes into
                every handmade piece, celebrating makers as artists.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                Connection
              </h3>
              <p className="text-muted-foreground">
                We facilitate genuine human relationships, not transactions.
                Hestia is about discovery and storytelling, not commerce.
              </p>
            </div>
          </div>
        </section>

        {/* For Creators */}
        <section className="bg-card border-y border-border py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">
              For Creators
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Hestia provides a beautiful platform to share your story and
              showcase your work to your local community. Whether you're a
              seasoned artisan or just starting your creative journey, we
              welcome you to join our community of makers.
            </p>
            <div className="text-center">
              <Link to={user ? "/profile" : "/join"}>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                >
                  {user ? "View Profile" : "Join as a Creator"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* For Discoverers */}
        <section className="container mx-auto px-4 lg:px-8 py-12 md:py-16 lg:py-20 max-w-4xl">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">
            For Discoverers
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Use Hestia to explore the incredible talent in your neighborhood.
            Browse by craft type, read creator stories, and find artisans whose
            work resonates with you. When you're ready to connect, reach out
            directly—every maker on Hestia is a real person creating real art
            from their home.
          </p>
          <div className="text-center">
            <Link to="/browse">
              <Button
                variant="outline"
                size="lg"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8"
              >
                Start Exploring
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </PageLayout>
  );
};

export default About;

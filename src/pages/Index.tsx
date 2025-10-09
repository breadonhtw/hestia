import { Link } from "react-router-dom";
import { ChevronDown, Sparkles, Users, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreatorCard } from "@/components/CreatorCard";
import { creators } from "@/data/creators";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const featuredCreator = creators.find((c) => c.featured);
  const exploreCreators = creators.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/60" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up">
            Discover the Makers Behind Your Neighborhood's Hidden Treasures
          </h1>
          <p className="font-sans text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Connect with local artisans crafting beauty from home
          </p>
          <Link to="/browse">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-glow animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Explore Creators
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-muted-foreground" />
        </div>
      </section>

      {/* This Week at Hestia - Bento Grid */}
      <section className="container mx-auto px-4 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            This Week at Hestia
          </h2>
          <p className="text-xl text-muted-foreground">
            Celebrating our community of makers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Featured Creator Tile */}
          {featuredCreator && (
            <div className="md:col-span-8 md:row-span-2 bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lift transition-all card-lift">
              <div className="h-64 md:h-96">
                <img
                  src={featuredCreator.image}
                  alt={featuredCreator.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Featured Creator
                  </span>
                </div>
                <h3 className="font-serif text-3xl font-bold text-foreground mb-2">
                  {featuredCreator.name}
                </h3>
                <p className="text-secondary font-medium mb-3">
                  {featuredCreator.craftType}
                </p>
                <p className="text-muted-foreground mb-6">
                  {featuredCreator.story}
                </p>
                <Link to={`/creator/${featuredCreator.id}`}>
                  <Button variant="link" className="text-primary p-0 h-auto font-semibold">
                    Read Story →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Stat Card */}
          <div className="md:col-span-4 bg-card rounded-xl p-8 shadow-soft hover:shadow-lift transition-all card-lift flex flex-col justify-center items-center text-center">
            <Users className="h-12 w-12 text-primary mb-4" />
            <div className="font-serif text-5xl font-bold text-primary mb-2">
              125
            </div>
            <p className="text-lg text-muted-foreground">Local Artisans</p>
          </div>

          {/* Testimonial Card */}
          <div className="md:col-span-4 bg-card rounded-xl p-8 shadow-soft hover:shadow-lift transition-all card-lift flex flex-col justify-center">
            <Quote className="h-8 w-8 text-secondary mb-4" />
            <p className="italic text-foreground mb-4">
              "Finding Elena's pottery was like discovering a treasure in my own neighborhood."
            </p>
            <p className="text-sm text-muted-foreground">— Sarah M.</p>
          </div>

          {/* Work Image Tiles */}
          {featuredCreator?.works.slice(0, 2).map((work, idx) => (
            <div
              key={work.id}
              className={`${
                idx === 0 ? "md:col-span-4" : "md:col-span-8"
              } bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lift transition-all card-lift group cursor-pointer`}
            >
              <div className="relative h-48">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                  <p className="text-background font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {work.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Our Artisans - Uniform Grid */}
      <section className="container mx-auto px-4 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explore Our Artisans
          </h2>
          <p className="text-xl text-muted-foreground">
            Browse by craft, location, or simply wander
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-12">
          {exploreCreators.map((creator, index) => (
            <CreatorCard key={creator.id} creator={creator} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/browse">
            <Button
              size="lg"
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              Load More Creators
            </Button>
          </Link>
        </div>
      </section>

      {/* Browse by Craft Categories */}
      <section className="bg-primary/5 py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse by Craft
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Pottery & Ceramics",
              "Textiles & Fiber Arts",
              "Woodworking",
              "Baked Goods",
              "Jewelry",
              "Art & Illustration",
              "Plants & Florals",
              "Home Decor",
            ].map((category) => (
              <Link
                key={category}
                to="/browse"
                className="bg-card rounded-xl p-6 text-center hover:shadow-lift transition-all card-lift border-2 border-transparent hover:border-secondary"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-sans font-medium text-foreground">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

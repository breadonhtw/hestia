import { Link } from "react-router-dom";
import { ChevronDown, Users, Quote, Palette, Scissors, Hammer, CakeSlice, Gem, Flower, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreatorCard } from "@/components/CreatorCard";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ThreeJsFlame } from "@/components/ThreeJsFlame";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useParallax } from "@/hooks/useParallax";
import { creators } from "@/data/creators";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const featuredCreator = creators.find((c) => c.featured);
  const exploreCreators = creators.slice(0, 6);
  const parallaxOffset = useParallax(0.5);
  
  // Scroll reveal hooks for different sections
  const bentoReveal = useScrollReveal({ threshold: 0.1 });
  const artisansReveal = useScrollReveal({ threshold: 0.1 });
  const categoriesReveal = useScrollReveal({ threshold: 0.1 });

  const categoryIcons = {
    "Pottery & Ceramics": Gem,
    "Textiles & Fiber Arts": Scissors,
    "Woodworking": Hammer,
    "Baked Goods": CakeSlice,
    "Jewelry": Gem,
    "Art & Illustration": Palette,
    "Plants & Florals": Flower,
    "Home Decor": Home,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ScrollProgress />

      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${parallaxOffset}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/60" />
        
        {/* Three.js Goddess Flame */}
        <ThreeJsFlame />
        
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

      {/* This Week at Hestia - Bento Grid with Scroll Reveal */}
      <section className="container mx-auto px-4 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            This Week at Hestia
          </h2>
          <p className="text-xl text-muted-foreground">
            Celebrating our community of makers
          </p>
        </div>

        <div 
          ref={bentoReveal.ref}
          className={`grid grid-cols-1 md:grid-cols-12 gap-6 scroll-reveal ${bentoReveal.isVisible ? 'visible' : ''}`}
        >
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

      {/* Explore Our Artisans - Uniform Grid with Scroll Reveal */}
      <section className="container mx-auto px-4 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explore Our Artisans
          </h2>
          <p className="text-xl text-muted-foreground">
            Browse by craft, location, or simply wander
          </p>
        </div>

        <div 
          ref={artisansReveal.ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-12 scroll-reveal ${artisansReveal.isVisible ? 'visible' : ''}`}
        >
          {exploreCreators.map((creator, index) => (
            <div 
              key={creator.id}
              style={{ transitionDelay: `${index * 100}ms` }}
              className="scroll-reveal"
            >
              <CreatorCard creator={creator} index={index} />
            </div>
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

      {/* Browse by Craft Categories with Custom Icons */}
      <section className="bg-primary/5 py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse by Craft
            </h2>
          </div>

          <div 
            ref={categoriesReveal.ref}
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 scroll-reveal ${categoriesReveal.isVisible ? 'visible' : ''}`}
          >
            {Object.entries(categoryIcons).map(([category, Icon], index) => (
              <Link
                key={category}
                to="/browse"
                className="bg-card rounded-xl p-6 text-center hover:shadow-lift transition-all duration-300 card-lift border-2 border-transparent hover:border-primary group"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:rotate-12">
                  <Icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-sans font-medium text-foreground group-hover:text-primary transition-colors">
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

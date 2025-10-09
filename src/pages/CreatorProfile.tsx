import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CreatorCard } from "@/components/CreatorCard";
import { creators } from "@/data/creators";
import { MapPin, Instagram, Globe, Mail } from "lucide-react";
import { sanitizeUrl, sanitizeEmail, sanitizeInstagramHandle } from "@/lib/sanitize";

const CreatorProfile = () => {
  const { id } = useParams();
  const creator = creators.find((c) => c.id === id);

  if (!creator) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Creator Not Found</h1>
          <Link to="/browse">
            <Button>Browse Creators</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const similarCreators = creators
    .filter((c) => c.id !== creator.id && c.craftType === creator.craftType)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Cover */}
      <section className="relative h-96 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        <div className="absolute inset-0">
          {creator.works[0] && (
            <img
              src={creator.works[0].image}
              alt="Studio"
              className="w-full h-full object-cover opacity-30"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <div className="container mx-auto px-4 relative h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Creator Photo */}
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lift -mb-20 md:-mb-8">
              <img
                src={creator.image}
                alt={creator.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Creator Info */}
            <div className="md:mb-4 mt-4 md:mt-0">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                {creator.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="font-medium text-secondary text-lg">
                  {creator.craftType}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {creator.location}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="absolute top-8 right-8 flex gap-3">
            {creator.instagram && (
              <a
                href={`https://instagram.com/${sanitizeInstagramHandle(creator.instagram)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-soft"
              >
                <Instagram className="h-5 w-5 text-foreground hover:text-primary-foreground" />
              </a>
            )}
            {creator.website && (
              <a
                href={sanitizeUrl(creator.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-soft"
              >
                <Globe className="h-5 w-5 text-foreground hover:text-primary-foreground" />
              </a>
            )}
            {creator.email && (
              <a
                href={`mailto:${sanitizeEmail(creator.email)}`}
                className="w-10 h-10 rounded-full bg-background hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-soft"
              >
                <Mail className="h-5 w-5 text-foreground hover:text-primary-foreground" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 lg:px-8 py-16 max-w-5xl">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
          About {creator.name.split(' ')[0]}
        </h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-foreground leading-relaxed mb-6">
            {creator.bio}
          </p>
          {creator.story && (
            <p className="text-lg text-foreground leading-relaxed">
              {creator.story}
            </p>
          )}
        </div>
      </section>

      {/* Featured Creations - Bento Grid */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
          From {creator.name.split(' ')[0]}'s Workshop
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Hero Work */}
          {creator.works[0] && (
            <div className="md:col-span-8 md:row-span-2 bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lift transition-all card-lift group cursor-pointer">
              <div className="h-96 relative">
                <img
                  src={creator.works[0].image}
                  alt={creator.works[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/80 transition-all flex items-center justify-center">
                  <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity p-6">
                    <h3 className="font-serif text-2xl font-bold text-background mb-2">
                      {creator.works[0].title}
                    </h3>
                    <p className="text-background/90">{creator.works[0].description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Supporting Works */}
          {creator.works.slice(1).map((work, idx) => (
            <div
              key={work.id}
              className={`${
                idx === 0 ? "md:col-span-4" : idx === 1 ? "md:col-span-4" : "md:col-span-8"
              } bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lift transition-all card-lift group cursor-pointer`}
            >
              <div className="h-48 relative">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/80 transition-all flex items-center justify-center">
                  <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity p-4">
                    <h3 className="font-serif text-xl font-bold text-background mb-1">
                      {work.title}
                    </h3>
                    <p className="text-sm text-background/90">{work.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connect Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Want to Connect with {creator.name.split(' ')[0]}?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Reach out to discuss commissions, ask questions, or just say hello
          </p>
          {creator.email && (
            <a href={`mailto:${sanitizeEmail(creator.email)}`}>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                <Mail className="mr-2 h-5 w-5" />
                Send Email
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Similar Creators */}
      {similarCreators.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
            Discover Similar Creators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {similarCreators.map((c, idx) => (
              <CreatorCard 
                key={c.id} 
                creator={c} 
                index={idx}
                onClick={() => window.location.href = `/creator/${c.id}`}
              />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default CreatorProfile;

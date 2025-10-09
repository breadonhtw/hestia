import { Creator } from "@/types/creator";
import creatorPottery from "@/assets/creator-pottery-1.jpg";
import creatorWoodwork from "@/assets/creator-woodwork-1.jpg";
import creatorTextile from "@/assets/creator-textile-1.jpg";
import creatorBaker from "@/assets/creator-baker-1.jpg";
import creatorJewelry from "@/assets/creator-jewelry-1.jpg";
import creatorArtist from "@/assets/creator-artist-1.jpg";
import workPotteryBowl from "@/assets/work-pottery-bowl.jpg";
import workWoodBoard from "@/assets/work-wood-board.jpg";
import workTextileWall from "@/assets/work-textile-wall.jpg";
import workBreadLoaf from "@/assets/work-bread-loaf.jpg";
import workJewelryNecklace from "@/assets/work-jewelry-necklace.jpg";
import workArtPainting from "@/assets/work-art-painting.jpg";

export const creators: Creator[] = [
  {
    id: "1",
    name: "Rachel Lim",
    craftType: "Ceramics & Pottery",
    location: "Tiong Bahru",
    bio: "Handcrafting small-batch ceramics inspired by Peranakan motifs and modern minimalism. Every piece is made in my studio along Yong Siak Street.",
    image: creatorPottery,
    featured: true,
    story:
      "Rachel’s journey into pottery began as a way to reconnect with her grandmother’s love for porcelain teaware. Her creations blend heritage colours with sleek forms, bringing a touch of nostalgia into modern homes.",
    email: "rachel@claybynature.sg",
    instagram: "@claybynature",
    website: "https://claybynature.sg",
    works: [
      {
        id: "w1",
        title: "Nyonya Teacup Set",
        description: "Hand-thrown porcelain cups with pastel glazes",
        image: workPotteryBowl,
      },
      {
        id: "w2",
        title: "Table Vase",
        description: "Minimalist white vase for dried florals",
        image: workPotteryBowl,
      },
      {
        id: "w3",
        title: "Serving Platter",
        description: "Inspired by old kopitiam plates",
        image: workPotteryBowl,
      },
    ],
  },
  {
    id: "2",
    name: "Marcus Tan",
    craftType: "Woodwork & Furniture",
    location: "Jurong West",
    bio: "Crafting bespoke furniture using reclaimed Singapore mahogany and teak. Every piece is built to last generations.",
    image: creatorWoodwork,
    email: "marcus@grainstudio.sg",
    instagram: "@grainstudio",
    works: [
      {
        id: "w4",
        title: "Heritage Stool",
        description: "Inspired by old kopitiam stools",
        image: workWoodBoard,
      },
      {
        id: "w5",
        title: "Teak Bookshelf",
        description: "Custom-built with recycled wood from shophouse beams",
        image: workWoodBoard,
      },
      {
        id: "w6",
        title: "Coffee Table",
        description: "Blending Scandinavian form and tropical wood",
        image: workWoodBoard,
      },
    ],
  },
  {
    id: "3",
    name: "Amira Rahman",
    craftType: "Textiles & Batik",
    location: "Kampong Glam",
    bio: "Designing batik fabrics that reimagine Malay patterns through contemporary fashion and home décor.",
    image: creatorTextile,
    featured: false,
    email: "amira@batikflow.sg",
    instagram: "@batikflow",
    works: [
      {
        id: "w7",
        title: "Batik Scarf",
        description: "Hand-stamped batik with natural dyes",
        image: workTextileWall,
      },
      {
        id: "w8",
        title: "Table Runner",
        description: "Motif inspired by traditional songket",
        image: workTextileWall,
      },
      {
        id: "w9",
        title: "Tote Bag",
        description: "Sustainably made from batik offcuts",
        image: workTextileWall,
      },
    ],
  },
  {
    id: "4",
    name: "Cheryl Ng",
    craftType: "Bakes & Confectionery",
    location: "Katong",
    bio: "Specialising in pandan-infused bakes and Nonya-style pastries, made lovingly from family recipes.",
    image: creatorBaker,
    email: "cheryl@katongbakes.sg",
    instagram: "@katongbakes",
    works: [
      {
        id: "w10",
        title: "Ondeh Ondeh Cake",
        description: "Signature pandan and gula melaka flavour",
        image: workBreadLoaf,
      },
      {
        id: "w11",
        title: "Pineapple Tarts",
        description: "Buttery perfection for every festive season",
        image: workBreadLoaf,
      },
      {
        id: "w12",
        title: "Earl Grey Chiffon",
        description: "Modern twist on a nostalgic bake",
        image: workBreadLoaf,
      },
    ],
  },
  {
    id: "5",
    name: "Desmond Koh",
    craftType: "Jewellery & Metalworks",
    location: "Haji Lane",
    bio: "Crafting minimalist jewellery that fuses local motifs with modern design, all handmade in my studio above a café.",
    image: creatorJewelry,
    email: "desmond@atelierkoh.sg",
    instagram: "@atelierkoh",
    works: [
      {
        id: "w13",
        title: "Silver Orchid Earrings",
        description: "Delicate design inspired by Singapore’s national flower",
        image: workJewelryNecklace,
      },
      {
        id: "w14",
        title: "Peranakan Ring Set",
        description: "Modern take on vintage beadwork patterns",
        image: workJewelryNecklace,
      },
      {
        id: "w15",
        title: "Pendant Necklace",
        description: "Minimalist design with local flair",
        image: workJewelryNecklace,
      },
    ],
  },
  {
    id: "6",
    name: "Wei Ling Goh",
    craftType: "Illustration & Art Prints",
    location: "Toa Payoh",
    bio: "Creating colourful illustrations that capture everyday Singapore life — from kopi stalls to playground dragons.",
    image: creatorArtist,
    email: "weiling@paperheart.sg",
    instagram: "@paperheart.sg",
    works: [
      {
        id: "w16",
        title: "HDB Mornings",
        description: "Digital print capturing void deck scenes",
        image: workArtPainting,
      },
      {
        id: "w17",
        title: "Playground Series",
        description: "Watercolour inspired by old-school playgrounds",
        image: workArtPainting,
      },
      {
        id: "w18",
        title: "Kopi Time",
        description: "Illustration of daily Singapore rituals",
        image: workArtPainting,
      },
    ],
  },
];

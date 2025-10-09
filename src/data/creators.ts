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
    name: "Elena Martinez",
    craftType: "Pottery & Ceramics",
    location: "Downtown District",
    bio: "Creating functional art from my home studio for 15 years. Each piece is hand-thrown and glazed with custom earth-tone recipes.",
    image: creatorPottery,
    featured: true,
    story: "Elena discovered pottery during a difficult life transition and found healing in the meditative rhythm of the wheel. Today, her warm, earthy pieces grace homes across the city, each one carrying a story of transformation and resilience.",
    email: "elena@example.com",
    instagram: "@elenapottery",
    website: "https://elenapottery.com",
    works: [
      {
        id: "w1",
        title: "Terracotta Bowl",
        description: "Hand-thrown bowl with natural glaze",
        image: workPotteryBowl,
      },
      {
        id: "w2",
        title: "Ceramic Vase Set",
        description: "Matching set of three vases",
        image: workPotteryBowl,
      },
      {
        id: "w3",
        title: "Serving Platter",
        description: "Large platter for gatherings",
        image: workPotteryBowl,
      },
    ],
  },
  {
    id: "2",
    name: "James Chen",
    craftType: "Woodworking",
    location: "Riverside",
    bio: "Crafting heirloom-quality wooden pieces using reclaimed and sustainably sourced materials. Every grain tells a story.",
    image: creatorWoodwork,
    email: "james@example.com",
    instagram: "@jameswood",
    works: [
      {
        id: "w4",
        title: "Cutting Board",
        description: "Beautiful grain patterns",
        image: workWoodBoard,
      },
      {
        id: "w5",
        title: "Dining Table",
        description: "Custom walnut dining table",
        image: workWoodBoard,
      },
      {
        id: "w6",
        title: "Shelf Unit",
        description: "Floating oak shelves",
        image: workWoodBoard,
      },
    ],
  },
  {
    id: "3",
    name: "Margaret Sullivan",
    craftType: "Textiles & Fiber Arts",
    location: "Westside",
    bio: "Weaving stories into every thread. My textiles blend traditional techniques with contemporary design, all created in my sunlit studio.",
    image: creatorTextile,
    featured: false,
    email: "margaret@example.com",
    instagram: "@margarettextiles",
    works: [
      {
        id: "w7",
        title: "Wall Hanging",
        description: "Geometric macrame piece",
        image: workTextileWall,
      },
      {
        id: "w8",
        title: "Woven Blanket",
        description: "Cozy wool throw",
        image: workTextileWall,
      },
      {
        id: "w9",
        title: "Table Runner",
        description: "Hand-woven linen",
        image: workTextileWall,
      },
    ],
  },
  {
    id: "4",
    name: "Sofia Rodriguez",
    craftType: "Baked Goods & Preserves",
    location: "East Village",
    bio: "Baking with love and heirloom recipes passed down through generations. Specializing in sourdough and artisan preserves.",
    image: creatorBaker,
    email: "sofia@example.com",
    instagram: "@sofiabakes",
    works: [
      {
        id: "w10",
        title: "Sourdough Loaf",
        description: "Classic artisan bread",
        image: workBreadLoaf,
      },
      {
        id: "w11",
        title: "Fig Preserves",
        description: "Small batch jams",
        image: workBreadLoaf,
      },
      {
        id: "w12",
        title: "Cinnamon Rolls",
        description: "Weekend special",
        image: workBreadLoaf,
      },
    ],
  },
  {
    id: "5",
    name: "David Kim",
    craftType: "Jewelry & Accessories",
    location: "Arts District",
    bio: "Precision-crafted jewelry with a focus on minimal, timeless designs. Each piece is made by hand in my small studio workspace.",
    image: creatorJewelry,
    email: "david@example.com",
    instagram: "@davidjewelry",
    works: [
      {
        id: "w13",
        title: "Silver Necklace",
        description: "Delicate pendant design",
        image: workJewelryNecklace,
      },
      {
        id: "w14",
        title: "Ring Set",
        description: "Stackable silver rings",
        image: workJewelryNecklace,
      },
      {
        id: "w15",
        title: "Earrings",
        description: "Geometric studs",
        image: workJewelryNecklace,
      },
    ],
  },
  {
    id: "6",
    name: "Isabella Torres",
    craftType: "Art & Illustration",
    location: "North End",
    bio: "Creating vibrant, emotionally resonant artwork that brings warmth and joy to everyday spaces. Inspired by nature and human connection.",
    image: creatorArtist,
    email: "isabella@example.com",
    instagram: "@isabellart",
    works: [
      {
        id: "w16",
        title: "Abstract Landscape",
        description: "Watercolor on paper",
        image: workArtPainting,
      },
      {
        id: "w17",
        title: "Portrait Series",
        description: "Mixed media",
        image: workArtPainting,
      },
      {
        id: "w18",
        title: "Still Life",
        description: "Oil painting",
        image: workArtPainting,
      },
    ],
  },
];

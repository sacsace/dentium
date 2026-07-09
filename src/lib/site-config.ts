/** Site content — Brand: Dentium | India legal entity: Implantium India Private Limited */

export const SITE = {
  /** Global brand name */
  name: "Dentium",
  brand: "Dentium",
  /** India operating company (legal entity) */
  legalName: "Implantium India Private Limited",
  region: "India",
  tagline: "World-Class Dental Implant Systems",
  phone: "+91 9625994598",
  email: "info.india@dentium.com",
  address:
    "8th Floor, 804-805-806, The Palm Spring Plaza Building, Golf Course Road, Sector 54, Gurugram, Haryana 122002, India",
  about:
    "Implantium India is a subsidiary of Dentium Co. Ltd. Dentium, founded in June 2000, aims to redefine the dental implant industry through innovation and excellence.",
  aboutShort:
    "Official Dentium partner in India — operated by Implantium India Private Limited.",
  trustBadges: [
    { title: "Delivery", desc: "Tracked or Express delivery options" },
    { title: "All Your Dental Favourites", desc: "Best Quality Products" },
    { title: "Official Retailer", desc: "100% Genuine Dentium Products" },
  ],
} as const;

/** Brand logo assets — /public/logo (SVG = transparent background) */
export const BRAND_LOGOS = {
  /** Green wordmark — transparent, dark/light headers */
  wordmark: "/logo/dentium-wordmark.svg",
  /** Green wordmark + tagline — transparent, main header */
  primary: "/logo/dentium-primary.svg",
  /** White wordmark — transparent, dark footer */
  onGreen: "/logo/dentium-wordmark-light.svg",
  /** Circular mark — favicon */
  circle: "/logo/dentium-circle.png",
} as const;

/** Official brand green — Pantone 382 C */
export const BRAND_GREEN = "#acc90e";

/** About page content — aligned with dentium.co.in/about-us */
export const ABOUT_PAGE = {
  title: "About Us",
  headerDescription:
    "Implantium India Private Limited — official Dentium operating company in India, part of a global network serving 80+ countries.",
  overviewTitle: "Overview",
  overview: [
    "Implantium India is a subsidiary of Dentium Co. Ltd. Dentium, founded in June 2000, aims to redefine the dental implant industry through innovation and excellence. With a team of expert dentists, we quickly became a global leader in high-quality implant solutions, enhancing treatment success and patient care across over 80 countries. Our goal is to develop a complete implant system for superior treatment outcomes, embodied in our motto: \"Total Solution Provider & Self-Development Manufacturer.\" We design cutting-edge dental implants and digital medical devices, backed by scientific research.",
    "Our Dentium R&D Center ensures product stability and clinical effectiveness, collaborating with universities and experts to advance digital dentistry. We adhere to Good Manufacturing Practices and hold international certifications, beginning with European CE in 2003 and U.S. FDA in 2004.",
    "Invested in education, we provide training through the Dentium Implant Institute and symposiums, empowering professionals with the latest techniques. As a publicly listed company on KOSPI, we expand our global footprint and technological capabilities.",
    "With over two decades of innovation, we focus on transforming implantology through technology and education. Our bright Implant offers superior stability, while DASK Simple simplifies procedures. Digital dentistry enhances diagnostic capabilities and treatment planning.",
    "Dentium bridges innovation and practical application through global symposiums and partnerships with universities. Our dedicated team strives to provide the best solutions for clinicians and patients, ensuring exceptional care.",
    "We remain committed to expanding our reach and enhancing our offerings, leading the way in implantology and improving patient outcomes.",
  ],
  mission:
    "At Dentium, we are dedicated to shaping the future of dentistry by developing innovative, high-quality dental implant systems, regenerative solutions, and digital workflows. Our mission is to empower dental professionals by providing them with clinically proven, reliable, and efficient solutions that simplify procedures while ensuring superior patient care.\n\nThrough continuous research and development, we remain at the forefront of technological advancements, collaborating with leading experts, universities, and research institutions worldwide. We are committed to education and knowledge sharing, offering comprehensive training programs, hands-on workshops, and global symposiums to support professional growth and excellence.\n\nAs a total solution provider, we strive to create an ecosystem where digital dentistry and implantology seamlessly integrate, making treatments more predictable, minimally invasive, and patient-centered. By maintaining the highest standards of quality and innovation, we aim to expand our global presence and become the most trusted name in dental solutions.",
  vision:
    "To be a global leader in dental innovation, transforming implantology and digital dentistry through cutting-edge solutions that enhance efficiency, accuracy, and patient care. We aim to set new industry standards by consistently delivering advanced technologies and education, equipping dental professionals with reliable tools to be the best for exceptional treatment outcomes.",
  /** Default company timeline when none configured in admin */
  history: [
    {
      year: 2000,
      title: "Dentium Founded",
      description:
        "Dentium Co., Ltd. was founded in June 2000 with a vision to redefine the dental implant industry through innovation and clinical excellence.",
    },
    {
      year: 2003,
      title: "European CE Certification",
      description:
        "Achieved European CE certification, establishing international recognition for product quality and manufacturing standards.",
    },
    {
      year: 2004,
      title: "U.S. FDA Approval",
      description: "Received U.S. FDA approval, expanding access to Dentium implant systems in the United States.",
    },
    {
      year: 2010,
      title: "Global Expansion",
      description:
        "Expanded training and distribution networks worldwide through the Dentium Implant Institute and international symposiums.",
    },
    {
      year: 2020,
      title: "Digital Dentistry Leadership",
      description:
        "Advanced digital dentistry workflows with CBCT software, guided surgery solutions, and integrated implant systems.",
    },
  ],
} as const;

export type CompanyHistoryEntry = {
  year: number;
  title: string;
  description?: string | null;
};

export function aboutOverviewText(): string {
  return ABOUT_PAGE.overview.join("\n\n");
}

/** India office locations — Implantium India Private Limited */
export const INDIA_OFFICES = [
  {
    id: "gurugram-hq",
    title: "Gurugram - Head Office",
    city: "Gurugram",
    country: "India",
    address:
      "IMPLANTIUM INDIA PRIVATE LIMITED, Floor No.: 8th Floor Building No./Flat No.: 804-805-806 Name Of Premises/Building: The Palm Spring Plaza Building Road/Street: Golf Course Road Locality/Sub Locality: Sector 54 City/Town/Village: Gurugram District: Gurugram State: Haryana PIN Code: 122002",
    phone: "+91 9625994598",
    email: "info.india@dentium.com",
    hours: "Monday-Friday; 08:30 AM - 05:30 PM",
    isHeadquarter: true,
    sortOrder: 0,
  },
  {
    id: "bengaluru",
    title: "Bengaluru",
    city: "Bengaluru",
    country: "India",
    address:
      "Implantium India Pvt. Ltd., 751, 8th Main Road, 3rd Block, Koramangala, Bengaluru, Bengaluru Urban, Karnataka 560034",
    phone: "+91 8904017755",
    email: "info.india@dentium.com",
    hours: "Monday-Friday; 08:30 AM - 05:30 PM",
    isHeadquarter: false,
    sortOrder: 1,
  },
  {
    id: "kolkata",
    title: "Kolkata",
    city: "Kolkata",
    country: "India",
    address:
      "Implantium India Pvt. Ltd., 805, 8th Floor, Tower-2, Plot No.2, Block EP&GP, Sector V, Bidhannagar, Salt Lake, Electronics Complex, Kolkata 700091",
    phone: "+91 9625994598",
    email: "info.india@dentium.com",
    hours: "Monday-Friday; 08:30 AM - 05:30 PM",
    isHeadquarter: false,
    sortOrder: 2,
  },
] as const;

export type IndiaOffice = (typeof INDIA_OFFICES)[number];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Lakshadweep", "Delhi", "Puducherry",
];

export const DENTIUM_STUDY_VIDEOS = [
  "Step-by-Step Dentium Bright Implants Prosthetic Workflow",
  "Dentium Help Kit",
  "Suturing Technique In Implant Procedure",
  "Dentium Bright Alone Dental Chair",
  "Dentium Guided Surgery Kit – Your Digital Implant Solution",
  "Explaining different bone grafting materials",
  "Dentium Superline Multiunit Abutment",
  "Dentium Superline Closed Tray Impression Technique",
  "Dentium Superline Open Tray Impression Technique",
  "Rainbow 3D Viewer Tutorial - Dentium CBCT Software Demonstration",
  "Dentium Rainbow Ceph Software: Demo & Features",
  "Dentium Bright Implant Kit - Introduction",
  "Dentium SuperLine Implant Placement on a Dummy Model",
  "Dentium SuperLine Surgical Kit - Overview",
  "Bright CT radiographic image",
  "Sinus elevation with Lateral approach in Sinus Septum Case (Bone Level)",
  "Simple Sinus lifting using DASK & Overcoming Low Fixture fixability (Bone Level)",
  "Immediate implantation & GBR on Anterior area (Bone Level)",
  "Staged approach on severely defective ridge",
  "BTS Concept low (Bite Tray impression Scan)",
  "Sinus concept with DASK Simple",
  "Immediate Placement with Gap Filling Low",
  "Narrow ridge Implant surgery with bright TL",
  "Immediate implantation using Gap filling with OSTEON™ III",
  "Simple Implantation with bright Tissue Level",
  "Dentium Bright CT",
];

export const EVENT_REGIONS = [
  { label: "North", slug: "north" },
  { label: "West", slug: "west" },
  { label: "South", slug: "south" },
  { label: "East", slug: "east" },
];

/** Local video assets in /public/videos */
export const SITE_VIDEOS = {
  heroSlides: [
    {
      id: "showreel",
      src: "/videos/movie01.mp4",
      poster: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920",
      title: "Dentium — Innovation in Dental Implants",
    },
    {
      id: "clinical",
      src: "/videos/movie02.mp4",
      poster: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920",
      title: "Clinical Excellence with Dentium",
    },
  ],
  /** @deprecated use heroSlides[0] */
  heroShowreel: "/videos/movie01.mp4",
  heroShowreelPoster: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920",
  heroShowreelTitle: "Dentium — Innovation in Dental Implants",
} as const;

export type SiteVideoSlide = (typeof SITE_VIDEOS.heroSlides)[number];

export const HERO_SHOWCASE = {
  eyebrow: "Dentium Product",
  title: "Innovative Solutions for Every Dental Need",
  cards: [
    {
      title: "Implant",
      description:
        "Our comprehensive implant portfolio is designed for reliability, simplifying the surgical journey.",
      highlight: "simplifying the surgical journey",
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop&q=80",
      cta: "See details",
      href: "/products?category=implant-system",
    },
    {
      title: "Easy bone graft",
      description: "Explore grafting solutions that support predictable regeneration and long-term stability.",
      highlight: "Explore grafting solutions",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&q=80",
      cta: "Explore more",
      href: "/products",
    },
    {
      title: "Practical digital",
      description: "From planning to prosthetics — seamless digital solutions for modern implant dentistry.",
      highlight: "seamless digital solutions",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop&q=80",
      cta: "Get started",
      href: "/dentium-study",
    },
  ],
} as const;

export type HeroSlideConfig =
  | { id: string; kind: "video"; src: string; poster?: string }
  | {
      id: string;
      kind: "image";
      image: string;
      title: string;
      subtitle?: string;
      description?: string;
      ctaText?: string;
      ctaLink?: string;
    }
  | {
      id: string;
      kind: "showcase";
      image: string;
      eyebrow: string;
      title: string;
      cards: readonly {
        title: string;
        description: string;
        highlight: string;
        image: string;
        cta: string;
        href: string;
      }[];
    }
  | { id: string; kind: "quote"; image: string; eyebrow?: string; quote: string; quoteAuthor?: string };

/** Default hero slides when no CMS banners are configured */
export const HERO_SLIDES: HeroSlideConfig[] = [
  {
    id: "hero-video-1",
    kind: "video",
    src: "/videos/movie01.mp4",
    poster: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920",
  },
  {
    id: "hero-showcase",
    kind: "showcase",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920",
    eyebrow: HERO_SHOWCASE.eyebrow,
    title: HERO_SHOWCASE.title,
    cards: HERO_SHOWCASE.cards,
  },
  {
    id: "hero-video-2",
    kind: "video",
    src: "/videos/movie02.mp4",
    poster: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920",
  },
  {
    id: "hero-image-1",
    kind: "image",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1920",
    subtitle: "Global Network",
    title: "Trusted by Clinicians Across India",
    description: "From Gurugram to clinics nationwide — Dentium delivers world-class implant systems with local support.",
    ctaText: "Global Network",
    ctaLink: "/global-network",
  },
  {
    id: "hero-quote",
    kind: "quote",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920",
    eyebrow: "Our Vision",
    quote: "We pursue health and happiness for all humanity through dental science.",
    quoteAuthor: "Dentium",
  },
];

export interface MegaMenuLink {
  label: string;
  href: string;
}

export interface MegaMenuSection {
  title?: string;
  links: MegaMenuLink[];
}

export interface MegaMenuItem {
  label: string;
  href: string;
  sections: MegaMenuSection[];
}

export const megaMenuItems: MegaMenuItem[] = [
  {
    label: "Why Dentium",
    href: "/about",
    sections: [
      {
        links: [
          { label: "Who We Are", href: "/about" },
          { label: "Vision", href: "/about" },
          { label: "Our Journey", href: "/about" },
          { label: "Careers", href: "/careers" },
        ],
      },
    ],
  },
  {
    label: "Global Network",
    href: "/global-network",
    sections: [
      {
        links: [
          { label: "India", href: "/global-network" },
          { label: "Asia", href: "/global-network" },
          { label: "Europe / Middle East", href: "/global-network" },
          { label: "Americas", href: "/global-network" },
          { label: "Oceania", href: "/global-network" },
        ],
      },
    ],
  },
  {
    label: "Product",
    href: "/products",
    sections: [
      {
        title: "Implant",
        links: [
          { label: "Bright Implant", href: "/products?category=bright" },
          { label: "SuperLine", href: "/products?category=superline" },
          { label: "Implant System", href: "/products?category=implant-system" },
        ],
      },
      {
        title: "Components",
        links: [
          { label: "Abutment", href: "/products?category=bright-abutment" },
          { label: "Fixture", href: "/products?category=bright-fixture" },
          { label: "Surgical Kit", href: "/products?category=bright-kit" },
        ],
      },
      {
        title: "Shop",
        links: [
          { label: "All Products", href: "/shop" },
          { label: "Request Quote", href: "/shop/cart?quote=true" },
        ],
      },
    ],
  },
  {
    label: "Events",
    href: "/events",
    sections: [
      {
        links: [
          { label: "Event Calendar", href: "/events" },
          { label: "North", href: "/events?region=north" },
          { label: "West", href: "/events?region=west" },
          { label: "South", href: "/events?region=south" },
          { label: "East", href: "/events?region=east" },
        ],
      },
    ],
  },
  {
    label: "Media Center",
    href: "/blog",
    sections: [
      {
        links: [
          { label: "Newsroom", href: "/blog?type=news" },
          { label: "Blogs", href: "/blog" },
          { label: "Video Library", href: "/video-library" },
          { label: "Dentium Study", href: "/dentium-study" },
          { label: "Downloads", href: "/downloads" },
          { label: "Gallery", href: "/gallery" },
        ],
      },
    ],
  },
];

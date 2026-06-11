import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { ABOUT_PAGE, aboutOverviewText, INDIA_OFFICES } from "../src/lib/site-config";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Dentium (India — Implantium India Private Limited)...");

  const adminEmail = process.env.ADMIN_EMAIL || "root";
  const adminPasswordPlain = process.env.ADMIN_PASSWORD || "admin123";
  const adminPassword = await bcrypt.hash(adminPasswordPlain, 12);

  if (adminEmail !== "admin@dentiumindia.com") {
    await prisma.user.deleteMany({ where: { email: "admin@dentiumindia.com" } });
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: "SUPER_ADMIN",
      name: "Root Admin",
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      name: "Root Admin",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: "Dentium",
      tagline: "World-Class Dental Implant Systems",
      aboutTitle: "About Us",
      aboutContent: aboutOverviewText(),
      aboutMission: ABOUT_PAGE.mission,
      aboutVision: ABOUT_PAGE.vision,
      contactEmail: "info.india@dentium.com",
      contactPhone: "+91 9625994598",
      contactAddress:
        "8th Floor, 804-805-806, The Palm Spring Plaza Building, Golf Course Road, Sector 54, Gurugram, Haryana 122002, India",
      seoTitle: "Dentium | Premium Dental Implant Systems",
      seoDescription:
        "Official Dentium website in India, operated by Implantium India Private Limited. Premium dental implant systems including Bright and SuperLine.",
      seoKeywords:
        "dentium india, dental implants, bright implant, superline, implant system, dentium study",
    },
    create: {
      id: "default",
      siteName: "Dentium",
      tagline: "World-Class Dental Implant Systems",
      aboutTitle: "About Us",
      aboutContent: aboutOverviewText(),
      aboutMission: ABOUT_PAGE.mission,
      aboutVision: ABOUT_PAGE.vision,
      contactEmail: "info.india@dentium.com",
      contactPhone: "+91 9625994598",
      contactAddress:
        "8th Floor, 804-805-806, The Palm Spring Plaza Building, Golf Course Road, Sector 54, Gurugram, Haryana 122002, India",
      seoTitle: "Dentium | Premium Dental Implant Systems",
      seoDescription:
        "Official Dentium website in India, operated by Implantium India Private Limited. Premium dental implant systems including Bright and SuperLine.",
      seoKeywords: "dentium india, dental implants, bright, superline",
    },
  });

  // Categories: Implant System > Bright / SuperLine + subcategories
  const implantSystem = await prisma.category.upsert({
    where: { slug: "implant-system" },
    update: { name: "Implant System", description: "Premium Dentium implant systems for clinicians across India" },
    create: {
      name: "Implant System",
      slug: "implant-system",
      description: "Premium Dentium implant systems for clinicians across India",
      sortOrder: 0,
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800",
    },
  });

  const bright = await prisma.category.upsert({
    where: { slug: "bright" },
    update: { parentId: implantSystem.id },
    create: {
      name: "Bright",
      slug: "bright",
      description: "Dentium Bright implant system and components",
      parentId: implantSystem.id,
      sortOrder: 0,
    },
  });

  const superline = await prisma.category.upsert({
    where: { slug: "superline" },
    update: { parentId: implantSystem.id },
    create: {
      name: "SuperLine",
      slug: "superline",
      description: "Dentium SuperLine implant system and components",
      parentId: implantSystem.id,
      sortOrder: 1,
    },
  });

  const brightSubs = [
    "Abutment", "Abutment Screw", "Bone Level", "Drill", "Fixture",
    "Instrument", "Kit", "New User", "Temporary Abutment", "Tissue Level",
  ];
  for (const [i, name] of brightSubs.entries()) {
    const slug = slugify(`bright-${name}`, { lower: true, strict: true });
    await prisma.category.upsert({
      where: { slug },
      update: { parentId: bright.id },
      create: { name, slug, parentId: bright.id, sortOrder: i },
    });
  }

  const superlineSubs = [
    "Abutment Screws & Others", "Abutments", "Angled Abutment",
    "Fixture and Coverscrew", "Impression Components", "Kits & Instruments",
    "Lab Components", "Prosthetic",
  ];
  for (const [i, name] of superlineSubs.entries()) {
    const slug = slugify(`superline-${name}`, { lower: true, strict: true });
    await prisma.category.upsert({
      where: { slug },
      update: { parentId: superline.id },
      create: { name, slug, parentId: superline.id, sortOrder: i },
    });
  }

  const brightFixture = await prisma.category.findUnique({ where: { slug: "bright-fixture" } });
  const brightBoneLevel = await prisma.category.findUnique({ where: { slug: "bright-bone-level" } });
  const brightTissueLevel = await prisma.category.findUnique({ where: { slug: "bright-tissue-level" } });
  const superlineFixture = await prisma.category.findUnique({ where: { slug: "superline-fixture-and-coverscrew" } });
  const superlineAbutments = await prisma.category.findUnique({ where: { slug: "superline-abutments" } });

  const products = [
    {
      name: "Superline Fixture",
      slug: "superline-fixture",
      categoryId: superlineFixture?.id || superline.id,
      shortDesc: "Dentium SuperLine implant fixture for predictable osseointegration",
      description: "<p>Premium SuperLine fixture designed for excellent primary stability and long-term clinical success. Part of the Dentium SuperLine implant system trusted by clinicians in 80+ countries.</p>",
      showPrice: false,
      brand: "Dentium",
      isFeatured: true,
      tags: ["superline", "fixture", "implant"],
      features: ["SuperLine system", "SLA surface", "Platform switching", "Wide platform range"],
      images: ["https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800"],
    },
    {
      name: "SuperLine Dual Abutment",
      slug: "superline-dual-abutment",
      categoryId: superlineAbutments?.id || superline.id,
      shortDesc: "Dual-function abutment for SuperLine implant prosthetics",
      description: "<p>SuperLine Dual Abutment for versatile prosthetic workflows with the Dentium SuperLine implant system.</p>",
      showPrice: false,
      brand: "Dentium",
      isFeatured: true,
      tags: ["superline", "abutment", "prosthetic"],
      features: ["Dual design", "SuperLine compatible", "Titanium grade 5"],
      images: ["https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800"],
    },
    {
      name: "Fixture - Bone Level",
      slug: "fixture-bone-level",
      categoryId: brightBoneLevel?.id || bright.id,
      shortDesc: "Bright Bone Level fixture for subcrestal placement",
      description: "<p>Dentium Bright Bone Level fixture for clinicians who prefer bone-level implant placement with simplified prosthetic connection.</p>",
      showPrice: false,
      brand: "Dentium",
      isFeatured: true,
      tags: ["bright", "bone level", "fixture"],
      features: ["Bone level design", "Bright system", "Minimal invasive"],
      images: ["https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800"],
    },
    {
      name: "Fixture - Tissue Level",
      slug: "fixture-tissue-level",
      categoryId: brightTissueLevel?.id || bright.id,
      shortDesc: "Bright Tissue Level fixture for supracrestal placement",
      description: "<p>Dentium Bright Tissue Level fixture designed for simplified surgical and prosthetic protocols in everyday implant practice.</p>",
      showPrice: false,
      brand: "Dentium",
      isFeatured: true,
      tags: ["bright", "tissue level", "fixture"],
      features: ["Tissue level design", "Bright system", "Easy connection"],
      images: ["https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800"],
    },
    {
      name: "Bright Implant Kit",
      slug: "bright-implant-kit",
      categoryId: brightFixture?.id || bright.id,
      shortDesc: "Complete surgical kit for Bright implant placement",
      description: "<p>Comprehensive Bright Implant Kit with all essential instruments for implant surgery. Ideal for new users and established clinicians.</p>",
      showPrice: false,
      brand: "Dentium",
      isNew: true,
      tags: ["bright", "kit", "surgical"],
      features: ["Complete kit", "Sterilizable tray", "New user friendly"],
      images: ["https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800"],
    },
    {
      name: "SuperLine Surgical Kit",
      slug: "superline-surgical-kit",
      categoryId: superline.id,
      shortDesc: "Premium surgical kit for SuperLine implant procedures",
      description: "<p>SuperLine Surgical Kit – complete instrument set for predictable SuperLine implant placement and management.</p>",
      showPrice: false,
      brand: "Dentium",
      tags: ["superline", "kit", "surgical"],
      features: ["Modular design", "SuperLine dedicated", "Premium instruments"],
      images: ["https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800"],
    },
  ];

  for (const [i, product] of products.entries()) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        shortDesc: product.shortDesc,
        description: product.description,
        showPrice: product.showPrice,
        isFeatured: product.isFeatured ?? false,
        isNew: product.isNew ?? false,
        tags: product.tags,
        features: product.features,
        images: product.images,
        categoryId: product.categoryId,
      },
      create: { ...product, sortOrder: i },
    });
  }

  const posts = [
    {
      title: "Implant Placement for a Decayed Molar – A 21-Year-Old's Journey to a Healthier Smile",
      slug: "implant-decayed-molar-case-study",
      excerpt: "A 21-year-old patient received a Dentium SuperLine implant after extraction of a grossly decayed lower left first molar (#36).",
      content: `<p>Recently, we treated a 21-year-old female patient who came to our clinic with a grossly decayed lower left first molar (#36). Due to the severity of the decay, extraction was necessary, and to prevent bone loss and restore her function we opted for an implant placement using a Dentium SuperLine implant.</p><p>The SuperLine system provided excellent primary stability and a predictable prosthetic workflow for this young patient.</p>`,
      type: "BLOG" as const,
      isFeatured: true,
      isPopular: true,
      tags: ["clinical case", "superline", "implant"],
      featuredImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800",
    },
    {
      title: "Immediate Dental Implants for a Faulty Prosthesis in a 62-Year-Old Patient",
      slug: "immediate-implants-faulty-prosthesis",
      excerpt: "Immediate implant placement with Dentium SuperLine implants for long-term success and stability.",
      content: `<p>Immediate implant placement offers several benefits, including preserving bone and minimizing treatment time. To ensure long-term success and stability, we selected Dentium SuperLine implants, known for their high quality and excellent osseointegration.</p>`,
      type: "BLOG" as const,
      isFeatured: true,
      tags: ["clinical case", "superline", "immediate implant"],
      featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
    },
    {
      title: "Case Study: Lower Arch Reconstruction with Dentium Superline Implants",
      slug: "lower-arch-reconstruction-superline",
      excerpt: "Extraction of terminal dentition, immediate placement of seven SuperLine implants, and cement-retained FP-1 prosthesis.",
      content: `<p>This case involved the extraction of terminal dentition, immediate placement of seven SuperLine implants, and the subsequent fabrication of a cement-retained, retrievable prosthesis (FP-1).</p><p>The SuperLine system enabled a predictable full-arch rehabilitation with excellent clinical outcomes.</p>`,
      type: "BLOG" as const,
      isPopular: true,
      tags: ["clinical case", "superline", "full arch"],
      featuredImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
    },
    {
      title: "Dentium Smile SAGA 2024 – World's Largest Dental Seminar",
      slug: "dentium-smile-saga-2024",
      excerpt: "Leading dental education provider in India. Enroll and elevate your clinical impact with GDC CPD compliant events.",
      content: `<p>Dentium Smile SAGA 2024 of the World's Largest Dental Seminar is a leading dental education provider in India and beyond. We offer a range of purchasing opportunities for dental products for attendees. Each event is approximately 2 hours, hosted by a guest speaker with key industry topics, and is fully GDC CPD compliant.</p><p>Please enroll! And elevate your impact! Our events provide all levels of dental roles with the latest knowledge and skills to improve their personal development.</p>`,
      type: "NEWS" as const,
      isFeatured: true,
      tags: ["seminar", "smile saga", "education"],
      featuredImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, excerpt: post.excerpt, content: post.content },
      create: {
        ...post,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorName: "Dentium",
        seoTitle: post.title,
        seoDescription: post.excerpt,
      },
    });
  }

  const studyVideos = [
    "Step-by-Step Dentium Bright Implants Prosthetic Workflow",
    "Dentium Help Kit",
    "Suturing Technique In Implant Procedure",
    "Dentium Guided Surgery Kit – Your Digital Implant Solution",
    "Dentium Superline Closed Tray Impression Technique",
    "Dentium SuperLine Surgical Kit - Overview",
    "Dentium Bright Implant Kit - Introduction",
    "Simple Implantation with bright Tissue Level",
  ];

  for (const [i, title] of studyVideos.entries()) {
    const slug = slugify(title, { lower: true, strict: true });
    await prisma.post.upsert({
      where: { slug },
      update: { title },
      create: {
        title,
        slug,
        excerpt: `Clinical education video: ${title}`,
        content: `<p>Watch this Dentium Study resource to learn about ${title}.</p>`,
        type: "BLOG",
        status: "PUBLISHED",
        publishedAt: new Date(),
        tags: ["dentium-study", "video", "education"],
        authorName: "Dentium Study",
        featuredImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
      },
    });
  }

  const events = [
    {
      title: "Dentium Dental Innovations November Summit 2023 Kolkata",
      slug: "november-summit-2023-kolkata",
      description: "Dentium Dental Innovations summit bringing together clinicians for the latest in implant dentistry and digital workflows.",
      excerpt: "Premier dental innovations summit in Kolkata.",
      location: "Kolkata, India",
      venue: "Swabhumi Rajkutir, Kolkata",
      region: "east",
      startDate: new Date("2023-11-19"),
      status: "COMPLETED" as const,
      isFeatured: true,
      featuredImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    },
    {
      title: "Dental Education Forum In Collaboration With Government Dental College",
      slug: "dental-education-forum-mumbai",
      description: "Collaborative dental education forum hosted with Government Dental College, Mumbai.",
      excerpt: "Education forum in collaboration with Government Dental College.",
      location: "Mumbai, India",
      venue: "Government Dental College Mumbai",
      region: "west",
      startDate: new Date("2023-11-18"),
      status: "COMPLETED" as const,
      isFeatured: true,
      featuredImage: "https://images.unsplash.com/photo-1515187028565-6efe4c0a0edc?w=800",
    },
    {
      title: "Dentium Study – North Region Seminar",
      slug: "dentium-study-north",
      description: "Regional seminar for dental professionals in North India covering Bright and SuperLine clinical protocols.",
      excerpt: "North region clinical education seminar.",
      location: "Delhi NCR, India",
      region: "north",
      startDate: new Date("2026-08-15"),
      status: "UPCOMING" as const,
      featuredImage: "https://images.unsplash.com/photo-1505373877841-8d25f39d4666?w=800",
    },
    {
      title: "Dentium Study – South Region Seminar",
      slug: "dentium-study-south",
      description: "Hands-on training for clinicians in South India on implant placement and prosthetic workflows.",
      excerpt: "South region hands-on implant training.",
      location: "Bangalore, India",
      region: "south",
      startDate: new Date("2026-09-20"),
      status: "UPCOMING" as const,
      featuredImage: "https://images.unsplash.com/photo-1515187028565-6efe4c0a0edc?w=800",
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: { title: event.title, region: event.region },
      create: event,
    });
  }

  await prisma.banner.deleteMany();
  await prisma.banner.createMany({
    data: [
      {
        title: "Premium Dental Implant Systems",
        subtitle: "Dentium",
        description: "World-class implant systems, instruments, and clinical education for dental professionals across India.",
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920",
        ctaText: "Explore Products",
        ctaLink: "/products",
        sortOrder: 0,
      },
      {
        title: "Bright & SuperLine",
        subtitle: "Implant System",
        description: "Trusted by clinicians in 80+ countries. Over 20 years of clinical data and scientific evidence.",
        image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1920",
        ctaText: "View Implant Systems",
        ctaLink: "/products?category=implant-system",
        sortOrder: 1,
      },
      {
        title: "Dentium Smile SAGA 2024",
        subtitle: "Seminar",
        description: "The world's largest dental seminar. Enroll and elevate your clinical impact.",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920",
        ctaText: "View Events",
        ctaLink: "/events",
        sortOrder: 2,
      },
    ],
  });

  await prisma.globalOffice.deleteMany();
  await prisma.globalOffice.createMany({
    data: INDIA_OFFICES.map((office) => ({
      country: office.country,
      city: office.city,
      address: office.address,
      phone: office.phone,
      email: office.email,
      isHeadquarter: office.isHeadquarter,
      sortOrder: office.sortOrder,
      isActive: true,
    })),
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

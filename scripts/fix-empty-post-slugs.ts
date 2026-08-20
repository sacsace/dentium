import { prisma } from "../src/lib/prisma";
import { ensureUniqueSlug } from "../src/lib/slug";

/** Repair posts whose slug is empty (common with Korean titles + strict slugify). */
async function main() {
  const broken = await prisma.post.findMany({
    where: {
      OR: [{ slug: "" }, { slug: "()" }],
    },
    select: { id: true, title: true, slug: true },
  });

  if (broken.length === 0) {
    console.log("No empty post slugs to fix.");
    return;
  }

  for (const post of broken) {
    const slug = await ensureUniqueSlug(post.title || `post-${post.id}`, async (candidate) => {
      const found = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
      return Boolean(found && found.id !== post.id);
    }, `post-${post.id.slice(0, 8)}`);

    await prisma.post.update({ where: { id: post.id }, data: { slug } });
    console.log(`Fixed post ${post.id}: "${post.title}" -> /blog/${slug}`);
  }
}

main()
  .catch((error) => {
    console.error("fix-empty-post-slugs failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

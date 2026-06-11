import { prisma } from "@/lib/prisma";
import type { TeamMemberDisplay } from "@/components/about/TeamMemberGrid";

export async function getActiveTeamMembers(): Promise<TeamMemberDisplay[]> {
  try {
    return await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        name: true,
        photoUrl: true,
        photoFocalX: true,
        photoFocalY: true,
      },
    });
  } catch {
    return [];
  }
}

import Image from "next/image";

export interface TeamMemberDisplay {
  name: string;
  photoUrl: string;
  photoFocalX?: number | null;
  photoFocalY?: number | null;
}

interface TeamMemberGridProps {
  members: TeamMemberDisplay[];
}

export function TeamMemberGrid({ members }: TeamMemberGridProps) {
  if (members.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-x-12 gap-y-10">
      {members.map((member) => {
        const focalX = member.photoFocalX ?? 50;
        const focalY = member.photoFocalY ?? 38;

        return (
          <li key={member.name} className="text-center w-28 sm:w-32">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-3 rounded-full overflow-hidden border border-gray-200">
              <Image
                src={member.photoUrl}
                alt={member.name}
                fill
                className="object-cover grayscale-[0.85]"
                style={{ objectPosition: `${focalX}% ${focalY}%` }}
                sizes="128px"
              />
            </div>
            <p className="text-sm font-medium text-brand-navy">{member.name}</p>
          </li>
        );
      })}
    </ul>
  );
}

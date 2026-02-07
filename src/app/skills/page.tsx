import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Skills Database",
  description:
    "Community-contributed skill database for Where Winds Meet. Browse skills by category.",
};

export const revalidate = 120;

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({
    where: { approved: true },
    orderBy: { name: "asc" },
  });

  const categories: Record<string, typeof skills> = {};
  for (const skill of skills) {
    const cat = skill.category || "Uncategorized";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(skill);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Skills Database</h1>
        <p className="text-gray-400 mt-1">
          Community-contributed skills for Where Winds Meet. Data may not be
          perfectly accurate.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No skills in the database yet.</p>
          <p className="mt-2">
            Skills can be submitted via the API and are shown after moderation
            approval.
          </p>
        </div>
      ) : (
        Object.entries(categories).map(([category, catSkills]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold text-amber-400 mb-3">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {catSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2"
                >
                  <h3 className="font-medium text-white">{skill.name}</h3>
                  {skill.description && (
                    <p className="text-sm text-gray-400">{skill.description}</p>
                  )}
                  <div className="flex gap-3 text-xs text-gray-500">
                    {skill.castTime > 0 && (
                      <span>Cast: {skill.castTime}s</span>
                    )}
                    {skill.cooldown > 0 && (
                      <span>CD: {skill.cooldown}s</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

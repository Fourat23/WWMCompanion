import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Tag from "@/components/ui/Tag";
import Disclaimer from "@/components/ui/Disclaimer";
import VoteButton from "@/components/build/VoteButton";
import CommentSection from "@/components/build/CommentSection";
import ReportButton from "@/components/build/ReportButton";
import RotationEditor from "@/components/rotation/RotationEditor";

interface BuildPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BuildPageProps): Promise<Metadata> {
  const build = await prisma.build.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true, tags: true, weaponStyle: true },
  });

  if (!build) {
    return { title: "Build Not Found" };
  }

  const tags = JSON.parse(build.tags) as string[];

  return {
    title: build.title,
    description:
      build.description ||
      `${build.title} — a Where Winds Meet community build${build.weaponStyle ? ` for ${build.weaponStyle}` : ""}.`,
    keywords: ["WWM build", build.title, build.weaponStyle, ...tags].filter(
      Boolean
    ),
    openGraph: {
      title: `${build.title} | WWM Companion`,
      description:
        build.description || `Community build for Where Winds Meet.`,
      type: "article",
    },
  };
}

export const revalidate = 30;

export default async function BuildPage({ params }: BuildPageProps) {
  const build = await prisma.build.findUnique({
    where: { slug: params.slug },
    include: {
      comments: {
        where: { flagged: false },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!build || !build.published) {
    notFound();
  }

  // Increment view count (fire and forget)
  prisma.build
    .update({
      where: { id: build.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {});

  const tags = JSON.parse(build.tags) as string[];
  const skills = JSON.parse(build.skills) as string[];
  const traits = JSON.parse(build.traits) as string[];
  const rotation = JSON.parse(build.rotation);
  const statPriorities = JSON.parse(build.statPriorities) as Array<{
    stat: string;
    priority: number;
  }>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Disclaimer />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">{build.title}</h1>
          {build.description && (
            <p className="text-gray-400">{build.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {build.weaponStyle && (
              <span className="text-sm text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                {build.weaponStyle}
              </span>
            )}
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
            {build.patchVersion && (
              <span className="text-xs text-gray-500">
                Patch {build.patchVersion}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {build.views} views · Created{" "}
            {new Date(build.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <VoteButton buildId={build.id} initialUpvotes={build.upvotes} />
          <ReportButton buildId={build.id} />
        </div>
      </div>

      {/* Skills & Traits */}
      {(skills.length > 0 || traits.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {traits.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Traits / Passives
              </h3>
              <div className="flex flex-wrap gap-2">
                {traits.map((trait, i) => (
                  <span
                    key={i}
                    className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat Priorities */}
      {statPriorities.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Stat Priorities
          </h3>
          <div className="flex flex-wrap gap-2">
            {statPriorities
              .sort((a, b) => a.priority - b.priority)
              .map((sp, i) => (
                <span
                  key={i}
                  className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm"
                >
                  {i + 1}. {sp.stat}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Rotation */}
      {rotation.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">
            Skill Rotation
          </h2>
          <RotationEditor actions={rotation} onChange={() => {}} readOnly />
        </div>
      )}

      {/* Guide sections */}
      {build.howToPlay && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-2">
            How to Play
          </h2>
          <p className="text-gray-300 whitespace-pre-line">{build.howToPlay}</p>
        </div>
      )}

      {(build.pros || build.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {build.pros && (
            <div className="bg-green-900/10 border border-green-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-400 mb-2">Pros</h3>
              <p className="text-gray-300 whitespace-pre-line">{build.pros}</p>
            </div>
          )}
          {build.cons && (
            <div className="bg-red-900/10 border border-red-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-400 mb-2">Cons</h3>
              <p className="text-gray-300 whitespace-pre-line">{build.cons}</p>
            </div>
          )}
        </div>
      )}

      {build.variants && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-2">Variants</h2>
          <p className="text-gray-300 whitespace-pre-line">{build.variants}</p>
        </div>
      )}

      {/* Comments */}
      <div className="border-t border-gray-800 pt-6">
        <CommentSection
          buildId={build.id}
          initialComments={build.comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import BuildCard from "@/components/build/BuildCard";
import Disclaimer from "@/components/ui/Disclaimer";
import Tag from "@/components/ui/Tag";
import { BUILD_TAGS } from "@/lib/validation";

interface HomePageProps {
  searchParams: { page?: string; sort?: string; tag?: string };
}

export const revalidate = 60;

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = 20;
  const sort = searchParams.sort === "top" ? "top" : "new";
  const tag = searchParams.tag || undefined;

  const where: Record<string, unknown> = {
    published: true,
    flagged: false,
  };

  if (tag) {
    where.tags = { contains: `"${tag}"` };
  }

  const [builds, total] = await Promise.all([
    prisma.build.findMany({
      where,
      orderBy: sort === "top" ? { upvotes: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        tags: true,
        patchVersion: true,
        weaponStyle: true,
        upvotes: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.build.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Community Builds</h1>
          <p className="text-gray-400 mt-1">
            Discover and share Where Winds Meet builds
          </p>
        </div>
        <Link
          href="/build/new"
          className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-center"
        >
          Create Build
        </Link>
      </div>

      <Disclaimer />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/?sort=new${tag ? `&tag=${tag}` : ""}`}
            className={`text-sm px-3 py-1.5 rounded ${
              sort === "new"
                ? "bg-amber-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Newest
          </Link>
          <Link
            href={`/?sort=top${tag ? `&tag=${tag}` : ""}`}
            className={`text-sm px-3 py-1.5 rounded ${
              sort === "top"
                ? "bg-amber-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Top Voted
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/?sort=${sort}`}>
            <Tag label="All" active={!tag} />
          </Link>
          {BUILD_TAGS.map((t) => (
            <Link key={t} href={`/?sort=${sort}&tag=${t}`}>
              <Tag label={t} active={tag === t} />
            </Link>
          ))}
        </div>
      </div>

      {/* Build list */}
      {builds.length > 0 ? (
        <div className="grid gap-4">
          {builds.map((build) => (
            <BuildCard
              key={build.id}
              slug={build.slug}
              title={build.title}
              description={build.description}
              tags={JSON.parse(build.tags)}
              weaponStyle={build.weaponStyle}
              patchVersion={build.patchVersion}
              upvotes={build.upvotes}
              views={build.views}
              createdAt={build.createdAt.toISOString()}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No builds yet.</p>
          <p className="mt-2">
            Be the first to{" "}
            <Link href="/build/new" className="text-amber-400 hover:underline">
              create a build
            </Link>
            !
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}&sort=${sort}${tag ? `&tag=${tag}` : ""}`}
              className="bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-gray-500 px-4 py-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/?page=${page + 1}&sort=${sort}${tag ? `&tag=${tag}` : ""}`}
              className="bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

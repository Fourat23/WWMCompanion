import Link from "next/link";
import Tag from "@/components/ui/Tag";

interface BuildCardProps {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  weaponStyle: string;
  patchVersion: string;
  upvotes: number;
  views: number;
  createdAt: string;
}

export default function BuildCard({
  slug,
  title,
  description,
  tags,
  weaponStyle,
  patchVersion,
  upvotes,
  views,
  createdAt,
}: BuildCardProps) {
  return (
    <Link
      href={`/build/${slug}`}
      className="block bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-amber-600 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
            {title}
          </h3>
          {description && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center text-gray-400 text-sm shrink-0">
          <span className="text-amber-400 font-bold text-lg">{upvotes}</span>
          <span className="text-xs">votes</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {weaponStyle && (
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
            {weaponStyle}
          </span>
        )}
        {tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
        {patchVersion && <span>Patch {patchVersion}</span>}
        <span>{views} views</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BUILD_TAGS, type BuildTag, type RotationAction } from "@/lib/validation";
import Tag from "@/components/ui/Tag";
import RotationEditor from "@/components/rotation/RotationEditor";

interface BuildFormProps {
  initialData?: {
    title: string;
    description: string;
    tags: BuildTag[];
    patchVersion: string;
    weaponStyle: string;
    skills: string[];
    traits: string[];
    statPriorities: Array<{ stat: string; priority: number }>;
    pros: string;
    cons: string;
    howToPlay: string;
    variants: string;
    rotation: RotationAction[];
  };
  editToken?: string;
  slug?: string;
}

export default function BuildForm({
  initialData,
  editToken,
  slug,
}: BuildFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [tags, setTags] = useState<BuildTag[]>(initialData?.tags || []);
  const [patchVersion, setPatchVersion] = useState(
    initialData?.patchVersion || ""
  );
  const [weaponStyle, setWeaponStyle] = useState(
    initialData?.weaponStyle || ""
  );
  const [skills, setSkills] = useState(
    initialData?.skills?.join(", ") || ""
  );
  const [traits, setTraits] = useState(
    initialData?.traits?.join(", ") || ""
  );
  const [pros, setPros] = useState(initialData?.pros || "");
  const [cons, setCons] = useState(initialData?.cons || "");
  const [howToPlay, setHowToPlay] = useState(initialData?.howToPlay || "");
  const [variants, setVariants] = useState(initialData?.variants || "");
  const [rotation, setRotation] = useState<RotationAction[]>(
    initialData?.rotation || []
  );

  const toggleTag = (tag: BuildTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      title,
      description,
      tags,
      patchVersion,
      weaponStyle,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      traits: traits
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      statPriorities: [],
      pros,
      cons,
      howToPlay,
      variants,
      rotation,
    };

    try {
      const isEdit = !!slug && !!editToken;
      const url = isEdit ? `/api/builds/${slug}` : "/api/builds";
      const method = isEdit ? "PUT" : "POST";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (editToken) {
        headers["x-edit-token"] = editToken;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (isEdit) {
        router.push(`/build/${slug}`);
      } else {
        // Save edit token to localStorage
        if (data.editToken && data.slug) {
          const tokens = JSON.parse(
            localStorage.getItem("wwm-edit-tokens") || "{}"
          );
          tokens[data.slug] = data.editToken;
          localStorage.setItem("wwm-edit-tokens", JSON.stringify(tokens));
        }
        router.push(`/build/${data.slug}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
          Build Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          maxLength={100}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="e.g. Sword DPS Solo Build"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Short Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Brief overview of the build..."
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags (max 5)
        </label>
        <div className="flex flex-wrap gap-2">
          {BUILD_TAGS.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              active={tags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
        </div>
      </div>

      {/* Weapon / Patch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="weaponStyle" className="block text-sm font-medium text-gray-300 mb-1">
            Weapon / Style
          </label>
          <input
            id="weaponStyle"
            type="text"
            value={weaponStyle}
            onChange={(e) => setWeaponStyle(e.target.value)}
            maxLength={50}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="e.g. Longsword, Dual Blades"
          />
        </div>
        <div>
          <label htmlFor="patchVersion" className="block text-sm font-medium text-gray-300 mb-1">
            Patch Version
          </label>
          <input
            id="patchVersion"
            type="text"
            value={patchVersion}
            onChange={(e) => setPatchVersion(e.target.value)}
            maxLength={20}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="e.g. 1.0, Beta 2"
          />
        </div>
      </div>

      {/* Skills & Traits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-1">
            Skills (comma-separated)
          </label>
          <input
            id="skills"
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Slash, Parry, Dodge Roll"
          />
        </div>
        <div>
          <label htmlFor="traits" className="block text-sm font-medium text-gray-300 mb-1">
            Traits / Passives (comma-separated)
          </label>
          <input
            id="traits"
            type="text"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Iron Will, Quick Recovery"
          />
        </div>
      </div>

      {/* Pros / Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pros" className="block text-sm font-medium text-gray-300 mb-1">
            Pros
          </label>
          <textarea
            id="pros"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            maxLength={2000}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="High burst damage, good mobility..."
          />
        </div>
        <div>
          <label htmlFor="cons" className="block text-sm font-medium text-gray-300 mb-1">
            Cons
          </label>
          <textarea
            id="cons"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            maxLength={2000}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Squishy, long cooldowns..."
          />
        </div>
      </div>

      {/* How to Play */}
      <div>
        <label htmlFor="howToPlay" className="block text-sm font-medium text-gray-300 mb-1">
          How to Play
        </label>
        <textarea
          id="howToPlay"
          value={howToPlay}
          onChange={(e) => setHowToPlay(e.target.value)}
          maxLength={5000}
          rows={5}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Detailed guide on how to play this build..."
        />
      </div>

      {/* Variants */}
      <div>
        <label htmlFor="variants" className="block text-sm font-medium text-gray-300 mb-1">
          Variants / Alternatives
        </label>
        <textarea
          id="variants"
          value={variants}
          onChange={(e) => setVariants(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Alternative skills or gear choices..."
        />
      </div>

      {/* Rotation Editor */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Skill Rotation
        </h3>
        <RotationEditor actions={rotation} onChange={setRotation} />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {loading
            ? "Saving..."
            : slug
              ? "Update Build"
              : "Create Build"}
        </button>
      </div>
    </form>
  );
}

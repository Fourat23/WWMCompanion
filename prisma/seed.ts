import { PrismaClient } from "../src/generated/prisma";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  // Seed some sample skills (pre-approved)
  const skills = [
    {
      slug: "horizontal-slash",
      name: "Horizontal Slash",
      category: "Sword",
      description: "A wide horizontal swing dealing moderate damage.",
      cooldown: 6,
      castTime: 0.8,
      approved: true,
    },
    {
      slug: "rising-dragon",
      name: "Rising Dragon",
      category: "Sword",
      description: "Launch upward with a powerful strike.",
      cooldown: 10,
      castTime: 1.2,
      approved: true,
    },
    {
      slug: "iron-guard",
      name: "Iron Guard",
      category: "Defense",
      description: "Raise your guard to block incoming attacks.",
      cooldown: 15,
      castTime: 0.3,
      approved: true,
    },
    {
      slug: "swift-step",
      name: "Swift Step",
      category: "Movement",
      description: "Quickly dash in the target direction.",
      cooldown: 8,
      castTime: 0.2,
      approved: true,
    },
    {
      slug: "healing-wind",
      name: "Healing Wind",
      category: "Support",
      description: "Restore a moderate amount of health over time.",
      cooldown: 20,
      castTime: 1.5,
      approved: true,
    },
    {
      slug: "thunder-palm",
      name: "Thunder Palm",
      category: "Fist",
      description: "Strike with lightning-infused palm attack.",
      cooldown: 8,
      castTime: 0.6,
      approved: true,
    },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {},
      create: { ...skill, tags: "[]" },
    });
  }

  // Seed a sample build
  const editToken = randomBytes(32).toString("hex");
  await prisma.build.upsert({
    where: { slug: "starter-sword-pve-build" },
    update: {},
    create: {
      slug: "starter-sword-pve-build",
      editToken,
      title: "Starter Sword PvE Build",
      description:
        "A beginner-friendly sword build for solo PvE content. Great for learning the basics.",
      tags: JSON.stringify(["PvE", "Solo", "Beginner"]),
      patchVersion: "1.0",
      weaponStyle: "Longsword",
      skills: JSON.stringify([
        "Horizontal Slash",
        "Rising Dragon",
        "Iron Guard",
        "Swift Step",
      ]),
      traits: JSON.stringify(["Iron Will", "Quick Recovery", "Steady Stance"]),
      statPriorities: JSON.stringify([
        { stat: "Attack", priority: 1 },
        { stat: "Defense", priority: 2 },
        { stat: "Health", priority: 3 },
        { stat: "Stamina", priority: 4 },
      ]),
      pros: "Easy to learn\nGood survivability\nSolid damage output\nWorks with basic gear",
      cons: "Not optimal for group content\nLimited AoE\nRelies on cooldown management",
      howToPlay:
        "Open with Swift Step to close distance, then use Horizontal Slash for AoE damage. Follow up with Rising Dragon for single-target burst. Use Iron Guard when you see enemy attack animations. Manage your cooldowns and keep Healing Wind ready for emergencies.",
      variants:
        "For more damage: swap Iron Guard for Thunder Palm.\nFor more sustain: prioritize Defense over Attack.",
      rotation: JSON.stringify([
        {
          id: "1",
          skillName: "Swift Step",
          castTime: 0.2,
          cooldown: 8,
          notes: "Gap closer",
          color: "#06b6d4",
        },
        {
          id: "2",
          skillName: "Horizontal Slash",
          castTime: 0.8,
          cooldown: 6,
          notes: "AoE damage",
          color: "#ef4444",
        },
        {
          id: "3",
          skillName: "Rising Dragon",
          castTime: 1.2,
          cooldown: 10,
          notes: "Burst damage",
          color: "#f97316",
        },
        {
          id: "4",
          skillName: "Horizontal Slash",
          castTime: 0.8,
          cooldown: 6,
          notes: "Fill rotation",
          color: "#ef4444",
        },
        {
          id: "5",
          skillName: "Iron Guard",
          castTime: 0.3,
          cooldown: 15,
          buffDuration: 3,
          notes: "Block phase",
          color: "#8b5cf6",
        },
      ]),
      upvotes: 5,
      views: 42,
    },
  });

  console.log("Seed complete. Sample edit token (save this):", editToken);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

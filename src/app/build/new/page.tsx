import type { Metadata } from "next";
import BuildForm from "@/components/build/BuildForm";
import Disclaimer from "@/components/ui/Disclaimer";

export const metadata: Metadata = {
  title: "Create Build",
  description:
    "Create and share a new Where Winds Meet build with the community.",
};

export default function NewBuildPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">Create a New Build</h1>
        <p className="text-gray-400 mt-1">
          Share your build with the WWM community. No account required.
        </p>
      </div>

      <Disclaimer />

      <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3 text-amber-200 text-sm">
        <strong>Important:</strong> After creating your build, you&apos;ll
        receive an edit token. Save it — it&apos;s the only way to edit or
        delete your build later.
      </div>

      <BuildForm />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm space-y-2">
        <p>
          WWM Companion is a fan-made community tool. Not affiliated with or
          endorsed by the developers of Where Winds Meet.
        </p>
        <p>
          All game data is community-contributed. Accuracy is not guaranteed.
        </p>
        {/* Ad placeholder — disabled by default */}
        {/* <div id="ad-footer" className="hidden" aria-hidden="true" /> */}
      </div>
    </footer>
  );
}

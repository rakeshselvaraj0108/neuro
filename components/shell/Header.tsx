import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { Pill } from "@/components/ui/Pill";

/** 56px app header: wordmark + tagline on the left, status pill on the right. */
export function Header() {
  return (
    <header className="appbar">
      <div className="appbar__left">
        <span className="wordmark">Catch the Flood</span>
        <span className="rule-v" aria-hidden="true" />
        <span className="tagline">Your ideas. Your voice. Finished.</span>
      </div>

      <Pill icon={<CheckCircleIcon size={14} />}>Finished Creative Piece</Pill>
    </header>
  );
}

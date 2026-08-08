import { FlameIcon } from "@/components/icons/FlameIcon";
import { Panel } from "@/components/ui/Panel";

/** The closing quote: the product's whole thesis, in one breath. */
export function QuotePanel() {
  return (
    <Panel as="aside" ariaLabel="Closing note" className="quote">
      <span className="quote__mark quote__mark--open" aria-hidden="true">
        “
      </span>

      <p className="quote__soft">AI didn&rsquo;t write this.</p>
      <p className="quote__loud">You did.</p>
      <p className="quote__soft">It just helped you</p>
      <p className="quote__loud quote__loud--sm">finish.</p>

      <span className="quote__mark quote__mark--close" aria-hidden="true">
        ”
      </span>

      <FlameIcon size={14} className="quote__flame" />
    </Panel>
  );
}

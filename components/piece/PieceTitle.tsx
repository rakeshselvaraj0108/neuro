interface PieceTitleProps {
  title: string;
  id?: string;
}

/**
 * Splits a title into a two-line, stacked, ragged-left block.
 * Words are balanced across the two lines, first line taking the extra word.
 */
function splitToTwoLines(title: string): [string, string] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return [title.trim(), ""];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export function PieceTitle({ title, id }: PieceTitleProps) {
  const [first, second] = splitToTwoLines(title);

  return (
    <h1 id={id} className="piece-title">
      <span className="piece-title__line">{first}</span>
      {second ? <span className="piece-title__line">{second}</span> : null}
    </h1>
  );
}

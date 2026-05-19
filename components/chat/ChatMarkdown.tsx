import { Fragment, type ReactNode } from "react";

type ChatMarkdownProps = {
  content: string;
  isStreaming?: boolean;
};

type ListBlock = {
  type: "ul" | "ol";
  items: string[];
};

type ParagraphBlock = {
  type: "p";
  text: string;
};

type MarkdownBlock = ListBlock | ParagraphBlock;

function findClosingMarker(text: string, marker: string, start: number) {
  const index = text.indexOf(marker, start);
  return index > start ? index : -1;
}

function takeUrl(text: string, start: number) {
  const match = /^https?:\/\/[^\s<>()]+/.exec(text.slice(start));
  if (!match) return null;

  let url = match[0];
  let trailing = "";

  while (/[.,;:!?]$/.test(url)) {
    trailing = `${url.at(-1) ?? ""}${trailing}`;
    url = url.slice(0, -1);
  }

  return { url, trailing, end: start + match[0].length };
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buffer = "";
  let index = 0;

  const pushText = () => {
    if (!buffer) return;
    nodes.push(buffer);
    buffer = "";
  };

  while (index < text.length) {
    const url = takeUrl(text, index);
    if (url) {
      pushText();
      nodes.push(
        <a
          key={`${keyPrefix}-url-${index}`}
          href={url.url}
          target="_blank"
          rel="noreferrer"
        >
          {url.url}
        </a>,
      );
      buffer += url.trailing;
      index = url.end;
      continue;
    }

    if (text[index] === "`") {
      const end = findClosingMarker(text, "`", index + 1);
      if (end > -1) {
        pushText();
        nodes.push(
          <code key={`${keyPrefix}-code-${index}`} className="chat-markdown-inline-code">
            {text.slice(index + 1, end)}
          </code>,
        );
        index = end + 1;
        continue;
      }
    }

    if (text.startsWith("**", index)) {
      const end = findClosingMarker(text, "**", index + 2);
      if (end > -1) {
        pushText();
        nodes.push(
          <strong key={`${keyPrefix}-strong-${index}`}>
            {text.slice(index + 2, end)}
          </strong>,
        );
        index = end + 2;
        continue;
      }
    }

    if (text[index] === "*" && text[index + 1] !== "*") {
      const end = findClosingMarker(text, "*", index + 1);
      if (end > -1) {
        pushText();
        nodes.push(
          <em key={`${keyPrefix}-em-${index}`}>{text.slice(index + 1, end)}</em>,
        );
        index = end + 1;
        continue;
      }
    }

    buffer += text[index];
    index += 1;
  }

  pushText();
  return nodes;
}

function renderInlineWithBreaks(text: string, keyPrefix: string) {
  return text.split("\n").flatMap((line, index) => {
    const inline = parseInline(line, `${keyPrefix}-line-${index}`);
    if (index === 0) return inline;

    return [
      <br key={`${keyPrefix}-break-${index}`} />,
      ...inline,
    ];
  });
}

function getListLine(line: string) {
  const unordered = /^\s*[-*]\s+(.+)$/.exec(line);
  if (unordered) return { type: "ul" as const, text: unordered[1] };

  const ordered = /^\s*\d+[.)]\s+(.+)$/.exec(line);
  if (ordered) return { type: "ol" as const, text: ordered[1] };

  return null;
}

function parseBlocks(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index].trim() === "") {
      index += 1;
      continue;
    }

    const listLine = getListLine(lines[index]);
    if (listLine) {
      const type = listLine.type;
      const items: string[] = [];

      while (index < lines.length) {
        const next = getListLine(lines[index]);
        if (!next || next.type !== type) break;
        items.push(next.text);
        index += 1;
      }

      blocks.push({ type, items });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() !== "" && !getListLine(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }

    blocks.push({ type: "p", text: paragraph.join("\n") });
  }

  return blocks;
}

export function ChatMarkdown({ content, isStreaming = false }: ChatMarkdownProps) {
  const blocks = parseBlocks(content);

  return (
    <div className="chat-markdown whitespace-pre-wrap">
      {blocks.length > 0 ? (
        blocks.map((block, index) => {
          if (block.type === "p") {
            return (
              <p key={`paragraph-${index}`}>
                {renderInlineWithBreaks(block.text, `paragraph-${index}`)}
              </p>
            );
          }

          const ListTag = block.type;

          return (
            <ListTag key={`list-${index}`} className="chat-markdown-list">
              {block.items.map((item, itemIndex) => (
                <li key={`list-${index}-${itemIndex}`}>
                  {renderInlineWithBreaks(item, `list-${index}-${itemIndex}`)}
                </li>
              ))}
            </ListTag>
          );
        })
      ) : (
        <p />
      )}
      {isStreaming && (
        <Fragment>
          {" "}
          <span className="chat-stream-cursor" aria-hidden>
            |
          </span>
        </Fragment>
      )}
    </div>
  );
}

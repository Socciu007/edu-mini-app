import katex from 'katex';
import React, { useMemo } from 'react';

interface Part {
  kind: 'text' | 'math';
  value: string;
  display: boolean;
}

function parse(input: string): Part[] {
  const parts: Part[] = [];
  const re = /(\$\$([^$]+)\$\$|\$([^$]+)\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    if (m.index > last) parts.push({ kind: 'text', value: input.slice(last, m.index), display: false });
    if (m[2] !== undefined) parts.push({ kind: 'math', value: m[2].trim(), display: true });
    else if (m[3] !== undefined) parts.push({ kind: 'math', value: m[3].trim(), display: false });
    last = m.index + m[0].length;
  }
  if (last < input.length) parts.push({ kind: 'text', value: input.slice(last), display: false });
  return parts;
}

export function KatexRenderer({ children }: { children: string }) {
  const parts = useMemo(() => parse(children), [children]);
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === 'text') {
          return <span key={i} dangerouslySetInnerHTML={{ __html: p.value.replace(/\n/g, '<br/>') }} />;
        }
        try {
          const html = katex.renderToString(p.value, { displayMode: p.display, throwOnError: false });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <span key={i}>{p.value}</span>;
        }
      })}
    </>
  );
}

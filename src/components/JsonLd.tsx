/** Renders a JSON-LD <script> block. Pass one object or an array of them. */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape closing tags defensively.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}

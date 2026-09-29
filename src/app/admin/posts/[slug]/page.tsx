import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { loadEditorPost } from "@/lib/editor-posts";
import { getAllTopics } from "@/lib/topics";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadEditorPost(slug);
  if (!post) notFound();

  const topics = (await getAllTopics()).map((t) => t.name);

  return (
    <PostEditor
      existingSlug={slug}
      knownTopics={topics}
      post={{
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        publishedAt: post.publishedAt,
        categories: post.categories,
        cover: post.cover,
        status: post.status,
        format: post.format,
        body: post.body,
      }}
    />
  );
}

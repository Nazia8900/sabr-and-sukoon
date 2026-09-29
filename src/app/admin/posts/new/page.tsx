import PostEditor from "@/components/admin/PostEditor";
import { getAllTopics } from "@/lib/topics";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const topics = (await getAllTopics()).map((t) => t.name);

  return (
    <PostEditor
      knownTopics={topics}
      post={{
        slug: "",
        title: "",
        excerpt: "",
        author: site.author.name,
        publishedAt: null,
        categories: [],
        cover: null,
        status: "draft",
        format: "html",
        body: "<p></p>",
      }}
    />
  );
}

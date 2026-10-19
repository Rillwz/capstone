import { marked } from "marked";
import type { APIRoute } from "astro";
import { getPost } from "../../../lib/db";

// Public read endpoint for the announcement modal on the login page.
export const GET: APIRoute = ({ params }) => {
  const id = Number(params.id);
  const post = Number.isInteger(id) ? getPost(id) : undefined;

  if (!post) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      id: post.id,
      title: post.title,
      author: post.author_name,
      created_at: post.created_at,
      updated_at: post.updated_at,
      html: marked.parse(post.body, { async: false, gfm: true, breaks: true }) as string,
    }),
    { headers: { "content-type": "application/json" } },
  );
};

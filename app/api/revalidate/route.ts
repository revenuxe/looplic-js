import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type RevalidateRequest = {
  paths?: string[];
  pagePaths?: string[];
  tags?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RevalidateRequest;
    const paths = Array.isArray(body.paths) ? body.paths : [];
    const pagePaths = Array.isArray(body.pagePaths) ? body.pagePaths : [];
    const tags = Array.isArray(body.tags) ? body.tags : [];

    for (const path of paths) {
      if (typeof path === "string" && path.startsWith("/")) {
        revalidatePath(path);
      }
    }

    for (const pagePath of pagePaths) {
      if (typeof pagePath === "string" && pagePath.startsWith("/")) {
        revalidatePath(pagePath, "page");
      }
    }

    for (const tag of tags) {
      if (typeof tag === "string" && tag.trim()) {
        revalidateTag(tag);
      }
    }

    return NextResponse.json({ revalidated: true, paths, pagePaths, tags });
  } catch {
    return NextResponse.json({ revalidated: false }, { status: 400 });
  }
}

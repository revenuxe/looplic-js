import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type RevalidateRequest = {
  paths?: string[];
  tags?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RevalidateRequest;
    const paths = Array.isArray(body.paths) ? body.paths : [];
    const tags = Array.isArray(body.tags) ? body.tags : [];

    for (const path of paths) {
      if (typeof path === "string" && path.startsWith("/")) {
        revalidatePath(path);
      }
    }

    for (const tag of tags) {
      if (typeof tag === "string" && tag.trim()) {
        revalidateTag(tag);
      }
    }

    return NextResponse.json({ revalidated: true, paths, tags });
  } catch {
    return NextResponse.json({ revalidated: false }, { status: 400 });
  }
}

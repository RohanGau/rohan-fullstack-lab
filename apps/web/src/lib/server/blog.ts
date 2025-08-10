import "server-only";
import { cache } from "react";
import type { IBlogDto } from "@fullstack-lab/types";
import { isMongoId } from "../utils";

export type BlogForMeta = Pick<
  IBlogDto,
  "id" | "slug" | "title" | "summary" | "coverImageUrl" | "status" | "publishedAt" | "updatedAt"
>;

async function _getBlogByParam(param: string): Promise<IBlogDto | null> {
  if (isMongoId(param)) {
    // return await db.blog.findById(param);
  } else {
    // return await db.blog.findOne({ slug: param, status: { $ne: "archived" } });
  }
  return null;
}

export const getBlogForRender = cache(async (param: string) => {
  return (await _getBlogByParam(param)) as IBlogDto | null;
});

export const getBlogForMeta = cache(async (param: string) => {
  const b = await _getBlogByParam(param);
  if (!b) return null;
  const meta: BlogForMeta = {
    id: b.id,
    slug: b.slug,
    title: b.title,
    summary: b.summary,
    coverImageUrl: b.coverImageUrl,
    status: b.status,
    publishedAt: b.publishedAt,
    updatedAt: b.updatedAt,
  };
  return meta;
});

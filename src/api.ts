import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { D1QB, JoinTypes } from "workers-qb";
import { z } from "zod";

import { Bindings } from "./bindings";
import { generateToken, User } from "./utils";

const app = new Hono<{ Bindings: Bindings }>();

const registerJsonSchema = z.object({
  id: z.string(),
  twitter: z.string().optional(),
  goal: z.number().int(),
  comment: z.string().optional(),
});

app.post("/accounts", zValidator("json", registerJsonSchema), async (c) => {
  const { id, twitter, goal, comment } = c.req.valid("json");

  const qb = new D1QB(c.env.DB);
  try {
    // ID を検証
    const regex = /^[a-zA-Z0-9ぁ-んァ-ンー]{4,16}$/;
    if (!regex.test(id)) {
      return c.json(
        {
          message:
            "ID は 4–16 文字の半角英数字，ひらがな，カタカナである必要があります．",
        },
        400
      );
    }
    const userReulst = await qb
      .fetchOne<{ id: string }>({
        tableName: "user",
        fields: ["id"],
        where: {
          conditions: "id = ?1",
          params: [id],
        },
      })
      .execute();
    if (userReulst.results) {
      return c.json({ message: "指定された ID は既に使用されています．" }, 400);
    }

    const token = generateToken();

    // 行を挿入
    const data: Record<string, any> = {
      id,
      twitter,
      goal,
      comment,
      token,
    };
    await qb
      .insert<User>({
        tableName: "user",
        data,
      })
      .execute();
    return c.json({ id, token }, 201);
  } catch {
    return c.json({ message: "アカウントの作成に失敗しました．" }, 500);
  }
});

const deleteJsonSchema = z.object({
  id: z.string(),
  token: z.string(),
});

app.delete("/accounts", zValidator("json", deleteJsonSchema), async (c) => {
  const { id, token } = c.req.valid("json");
  const qb = new D1QB(c.env.DB);
  try {
    const { changes } = await qb
      .delete<{ id: string }>({
        tableName: "user",
        where: {
          conditions: "id = ?1 AND token = ?2",
          params: [id, token],
        },
      })
      .execute();
    if (!changes) {
      return c.json({ message: "トークンが無効です．" }, 401);
    }
    return c.json({ id }, 200);
  } catch {
    return c.json({ message: "アカウントの削除に失敗しました．" }, 500);
  }
});

const checkJsonSchema = z.object({
  token: z.string(),
});

app.post("/check", zValidator("json", checkJsonSchema), async (c) => {
  const { token } = c.req.valid("json");
  const qb = new D1QB(c.env.DB);
  try {
    const { results } = await qb
      .fetchOne<{ id: string }>({
        tableName: "user",
        fields: ["id"],
        where: {
          conditions: "token = ?1",
          params: [token],
        },
      })
      .execute();
    if (!results) {
      return c.json({ message: "トークンが無効です．" }, 401);
    }
    return c.json({ id: results.id, token });
  } catch {
    return c.json({ message: "トークンの検証に失敗しました．" }, 500);
  }
});

const progressQuerySchema = z.object({
  pages: z.string().regex(/^[0-9]+$/),
  token: z.string(),
});

app.post("/progress", zValidator("query", progressQuerySchema), async (c) => {
  const { pages, token } = c.req.valid("query");
  const qb = new D1QB(c.env.DB);

  try {
    // トークンを検証
    const result = await qb
      .fetchOne<{ id: string }>({
        tableName: "user",
        fields: ["id"],
        where: {
          conditions: "token = ?1",
          params: [token],
        },
      })
      .execute();
    if (!result.results) {
      return c.text("トークンが無効です．\n", 401);
    }

    // 行を挿入
    await qb
      .insert({
        tableName: "progress",
        data: {
          user_id: result.results.id,
          pages,
        },
      })
      .execute();
    return c.text(
      `進捗を更新しました！\n現在の進捗は ${pages} ページです．\n`,
      201
    );
  } catch (e) {
    console.log(e);
    return c.text("進捗の更新に失敗しました．\n", 500);
  }
});

export default app;

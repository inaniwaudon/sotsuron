import { Hono } from "hono";
import { D1QB, JoinTypes } from "workers-qb";

import api from "./api";
import { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/api", api);

app.get("/", async (c) => {
  const qb = new D1QB(c.env.DB);
  const result = await qb
    .fetchAll<{
      id: string;
      twitter?: string;
      goal: number;
      comment?: string;
      pages: number;
      created_at: string;
    }>({
      tableName: "user",
      fields: [
        "user.id",
        "user.twitter",
        "user.goal",
        "user.comment",
        "progress.pages",
        "progress.created_at",
      ],
      join: {
        type: JoinTypes.LEFT,
        table: "progress",
        on: "user.id = progress.user_id",
      },
    })
    .execute();

  const userDict: Record<
    string,
    {
      twitter?: string;
      goal: number;
      comment?: string;
      progress: { pages: number; createdAt: string }[];
    }
  > = {};
  for (const item of result.results ?? []) {
    if (!userDict[item.id]) {
      userDict[item.id] = {
        twitter: item.twitter,
        goal: item.goal,
        comment: item.comment,
        progress: [],
      };
    }
    if (item.pages && item.created_at) {
      userDict[item.id].progress.push({
        pages: item.pages,
        createdAt: item.created_at,
      });
    }
  }
  for (const key in userDict) {
    userDict[key].progress = userDict[key].progress.sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
    });
  }

  const userArray = Object.entries(userDict).map(([key, value]) => ({
    key,
    value,
    firstCreatedAt: value.progress[0]?.createdAt,
  }));
  userArray.sort((a, b) => {
    return !a.firstCreatedAt
      ? 1
      : !b.firstCreatedAt
      ? -1
      : a.firstCreatedAt > b.firstCreatedAt
      ? -1
      : 1;
  });

  return c.html(
    <html>
      <head>
        <title>卒論進捗</title>
        <script src="script.js"></script>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <header>
          <h1>
            <a href="/">https://sotsuron.yokohama.dev</a>
          </h1>
          <p>
            卒論の進捗を共有するサイトです．
            <a href="https://github.com/inaniwaudon/sotsuron">GitHub</a>
          </p>
          <p>
            <a href="/register">アカウント登録／削除／使い方はこちらから！</a>
          </p>
        </header>
        <main>
          <h2>みんなの進捗</h2>
          {userArray.map(({ key, value }) => {
            const page = value.progress[0]?.pages
              ? `${value.progress[0].pages} ページ`
              : "未定";
            const text = `${key} の卒論の進捗は ${page} です．\nhttps://sotsuron.yokohama.dev`;
            return (
              <div key={key}>
                <h3>{key}</h3>
                <ul>
                  <li>
                    現在の進捗：
                    {page}
                    {value.progress[0] &&
                      `（${value.progress[0]?.createdAt} 現在）`}
                  </li>
                  <li>目標：{value.goal} ページ</li>
                  <li>
                    ひとこと／終わったらやりたいこと：
                    <br />
                    {value.comment ?? "未記入"}
                  </li>
                  <li>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURI(
                        text
                      )}`}
                    >
                      ツイート
                    </a>
                  </li>
                </ul>
              </div>
            );
          })}
        </main>
      </body>
    </html>
  );
});

export default app;

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NoticeBanner, PageTitle } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") redirect("/admin");
  if (user?.role === "MEMBER") redirect("/member");

  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);
  const next = readSearchParam(params.next);

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle title="ログイン" description="会員企業および管理者がID・パスワードでログインできます。" />
      <section className="form-card" style={{ width: "min(720px, 100%)", margin: "0 auto" }}>
        <form action="/actions/auth/login" method="post">
          <input type="hidden" name="next" value={next} />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="login-role">ログイン種別</label>
              <select id="login-role" name="role" defaultValue="MEMBER">
                <option value="MEMBER">会員企業</option>
                <option value="ADMIN">管理者</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="login-email">メールアドレス</label>
              <input id="login-email" name="email" type="email" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="login-password">パスワード</label>
            <input id="login-password" name="password" type="password" required />
          </div>
          <div className="info-box">
            デモ用アカウント:
            <br />
            会員企業 <code>member@example.com / member123</code>
            <br />
            管理者 <code>admin@example.com / admin123</code>
          </div>
          <div className="button-row">
            <button className="button" type="submit">
              ログイン
            </button>
            <a className="ghost-button" href="/reset-password">
              パスワード再設定
            </a>
          </div>
        </form>
      </section>
    </>
  );
}

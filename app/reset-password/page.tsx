import { NoticeBanner, PageTitle } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);
  const token = readSearchParam(params.token);

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle title="パスワード再設定" description="再設定申請および再設定を行えます。" />
      <section className="grid-2">
        <article className="form-card">
          <h3>再設定申請</h3>
          <form action="/actions/auth/request-reset" method="post">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="reset-role">対象</label>
                <select id="reset-role" name="role" defaultValue="MEMBER">
                  <option value="MEMBER">会員企業</option>
                  <option value="ADMIN">管理者</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="reset-email">メールアドレス</label>
                <input id="reset-email" name="email" type="email" required />
              </div>
            </div>
            <button className="button" type="submit">
              再設定申請
            </button>
          </form>
        </article>
        <article className="form-card">
          <h3>新しいパスワードを設定</h3>
          <form action="/actions/auth/reset-password" method="post">
            <div className="field">
              <label htmlFor="reset-token">再設定トークン</label>
              <input id="reset-token" name="token" defaultValue={token} required />
            </div>
            <div className="field">
              <label htmlFor="reset-password">新しいパスワード</label>
              <input id="reset-password" name="password" type="password" required />
            </div>
            <button className="button" type="submit">
              パスワードを更新
            </button>
          </form>
        </article>
      </section>
    </>
  );
}

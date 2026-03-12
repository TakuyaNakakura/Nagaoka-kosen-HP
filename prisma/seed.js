import { PrismaClient, UserRole, WorkflowStatus, InquiryType, InquiryStatus, MembershipStatus, NotificationScope } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const json = (value) => JSON.stringify(value);

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.passwordResetRequest.deleteMany();
  await prisma.session.deleteMany();
  await prisma.companyUpdateRequest.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.membershipApplication.deleteMany();
  await prisma.researchSeed.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.eventItem.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.permissionProfile.deleteMany();
  await prisma.organizationInfo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        slug: "echigo-sensing",
        name: "越後センシング株式会社",
        industry: "精密機器",
        city: "長岡市",
        address: "新潟県長岡市城内町1-1-1",
        website: "https://example.com/echigo-sensing",
        summary: "工場向けの後付けIoTセンサと異常検知ソフトを開発。製造現場のデータ可視化と予兆保全を得意とする。",
        businessJson: json(["無線センサモジュール開発", "設備データ可視化ダッシュボード", "AI異常検知のPoC支援"]),
        relatedFieldsJson: json(["IoT", "センシング", "AI・データ活用"]),
        departmentsJson: json(["電気電子システム工学科", "電子制御工学科"]),
        acceptanceItemsJson: json(["技術相談", "共同研究", "会社見学", "インターン受入"]),
        keywordsJson: json(["異常検知", "後付けIoT", "FA", "無線"]),
        materialsJson: json([{ name: "会社紹介資料.pdf" }, { name: "IoT事例一覧.pdf" }]),
        galleryJson: json([{ name: "工場内IoTセンサ" }, { name: "データ可視化ダッシュボード" }]),
        hiringInfo: "技術職の夏季インターンを毎年受入。電気・情報系歓迎。",
        message: "現場実装まで見据えた研究連携を歓迎します。小規模な実証から始められます。",
        internshipAvailable: true,
        siteVisitAvailable: true,
        workflowStatus: WorkflowStatus.APPROVED,
        lastPublishedAt: new Date("2026-02-18T10:30:00+09:00"),
      },
    }),
    prisma.company.create({
      data: {
        slug: "hokuei-robotics",
        name: "北越ロボティクス合同会社",
        industry: "DX・ソフトウェア",
        city: "燕市",
        address: "新潟県燕市産業通り4-3-7",
        website: "https://example.com/hokuriku-robotics",
        summary: "協働ロボットによる検査・搬送自動化を支援。既存ラインへの段階導入に強み。",
        businessJson: json(["協働ロボットSI", "画像検査AI", "省人化コンサルティング"]),
        relatedFieldsJson: json(["ロボティクス", "AI・データ活用"]),
        departmentsJson: json(["電子制御工学科", "機械工学科"]),
        acceptanceItemsJson: json(["技術相談", "共同研究", "企業講演"]),
        keywordsJson: json(["自動化", "協働ロボット", "画像検査"]),
        materialsJson: json([{ name: "自動化導入ガイド.pdf" }]),
        galleryJson: json([{ name: "協働ロボットセル" }, { name: "画像検査装置" }]),
        hiringInfo: "通年採用。制御・機械設計・画像処理人材を募集。",
        message: "学生とのプロトタイピングや教員との共同研究テーマ探索を積極的に進めています。",
        internshipAvailable: false,
        siteVisitAvailable: true,
        workflowStatus: WorkflowStatus.PENDING,
        lastPublishedAt: new Date("2026-02-02T09:00:00+09:00"),
      },
    }),
    prisma.company.create({
      data: {
        slug: "chosei-materials",
        name: "長生マテリアルズ株式会社",
        industry: "素材・化学",
        city: "見附市",
        address: "新潟県見附市本町2-5-12",
        website: "https://example.com/chosei-materials",
        summary: "高機能樹脂と再生材の配合技術を活かし、環境配慮型材料の研究開発を行う。",
        businessJson: json(["樹脂コンパウンド試作", "バイオマス素材評価", "共同評価試験"]),
        relatedFieldsJson: json(["材料開発", "脱炭素"]),
        departmentsJson: json(["物質生物工学科"]),
        acceptanceItemsJson: json(["共同研究", "試験委託", "会社見学", "インターン受入"]),
        keywordsJson: json(["再生材", "バイオマス", "材料評価"]),
        materialsJson: json([{ name: "環境対応材料カタログ.pdf" }]),
        galleryJson: json([{ name: "配合評価ラボ" }, { name: "試験片サンプル" }]),
        hiringInfo: "研究補助・品質評価の学生アルバイト受入実績あり。",
        message: "材料評価設備を活用した実践的な研究テーマづくりを期待しています。",
        internshipAvailable: true,
        siteVisitAvailable: true,
        workflowStatus: WorkflowStatus.APPROVED,
        lastPublishedAt: new Date("2026-01-23T16:20:00+09:00"),
      },
    }),
    prisma.company.create({
      data: {
        slug: "shinetsu-infra",
        name: "信越インフラ設計株式会社",
        industry: "建設・インフラ",
        city: "新潟市",
        address: "新潟県新潟市中央区川岸町3-8-1",
        website: "https://example.com/shinetsu-infra",
        summary: "橋梁点検、河川モニタリング、地域インフラ維持管理計画の立案を手掛ける。",
        businessJson: json(["インフラ点検", "ドローン測量", "環境モニタリング"]),
        relatedFieldsJson: json(["地域インフラ", "環境計測", "脱炭素"]),
        departmentsJson: json(["環境都市工学科"]),
        acceptanceItemsJson: json(["技術相談", "共同研究", "現場見学"]),
        keywordsJson: json(["インフラ維持管理", "ドローン", "点検"]),
        materialsJson: json([{ name: "地域インフラ事例集.pdf" }]),
        galleryJson: json([{ name: "河川モニタリング" }, { name: "橋梁点検現場" }]),
        hiringInfo: "土木・測量・環境分野のインターンを募集。",
        message: "社会実装に近いデータや現場を提供し、学生・教員との接点を増やしたいと考えています。",
        internshipAvailable: true,
        siteVisitAvailable: true,
        workflowStatus: WorkflowStatus.APPROVED,
        lastPublishedAt: new Date("2026-02-10T13:10:00+09:00"),
      },
    }),
  ]);

  const faculty = await Promise.all([
    prisma.faculty.create({
      data: {
        slug: "yusuke-ishida",
        name: "石田 祐介",
        department: "電気電子システム工学科",
        specialtiesJson: json(["センシング回路", "低消費電力デバイス", "無線計測"]),
        summary: "現場導入を意識した低消費電力センシング回路と無線ノードの研究を行う。",
        contact: "sensor-lab@nagaoka-ct.ac.jp",
      },
    }),
    prisma.faculty.create({
      data: {
        slug: "mari-takahashi",
        name: "高橋 真理",
        department: "電子制御工学科",
        specialtiesJson: json(["ロボット制御", "画像認識", "協働システム"]),
        summary: "協働ロボットの安全制御と画像認識による柔軟な作業自動化を研究。",
        contact: "robotics-lab@nagaoka-ct.ac.jp",
      },
    }),
    prisma.faculty.create({
      data: {
        slug: "koichi-yanagida",
        name: "柳田 恒一",
        department: "物質生物工学科",
        specialtiesJson: json(["高分子材料", "バイオマス活用", "材料分析"]),
        summary: "環境負荷低減につながる高分子材料設計と評価プロセスを研究している。",
        contact: "materials-lab@nagaoka-ct.ac.jp",
      },
    }),
    prisma.faculty.create({
      data: {
        slug: "ayano-nakamura",
        name: "中村 綾乃",
        department: "環境都市工学科",
        specialtiesJson: json(["インフラ点検", "環境センシング", "地域防災"]),
        summary: "社会インフラの健全度評価と、地域向け環境モニタリング技術に取り組む。",
        contact: "infra-lab@nagaoka-ct.ac.jp",
      },
    }),
  ]);

  await Promise.all([
    prisma.researchSeed.create({
      data: {
        slug: "battery-vibration-node",
        title: "電池駆動で1年動作する振動計測ノード",
        department: "電気電子システム工学科",
        teacherId: faculty[0].id,
        keywordsJson: json(["センシング", "省電力", "振動"]),
        summary: "設備の微小振動を長期間観測するための省電力無線ノード。既存設備に後付け可能。",
        potential: "予兆保全や保守計画の高度化に活用可能。PoC向け試作提供に対応。",
        collaboration: "共同研究、評価試験、現場実証",
      },
    }),
    prisma.researchSeed.create({
      data: {
        slug: "analog-front-end-noise",
        title: "高ノイズ環境向けアナログ前段回路の設計手法",
        department: "電気電子システム工学科",
        teacherId: faculty[0].id,
        keywordsJson: json(["回路設計", "ノイズ対策"]),
        summary: "工場や屋外設備の過酷環境で安定計測を行うための回路設計知見を提供。",
        potential: "既存製品の信号品質改善やセンサ精度向上に寄与。",
        collaboration: "技術相談、試作評価",
      },
    }),
    prisma.researchSeed.create({
      data: {
        slug: "collaborative-robot-control",
        title: "多品種少量ライン向け協働ロボット制御",
        department: "電子制御工学科",
        teacherId: faculty[1].id,
        keywordsJson: json(["ロボット", "画像認識", "省人化"]),
        summary: "ワーク位置ばらつきに適応するビジョンベース制御により、段取り替え負荷を削減。",
        potential: "検査・ピッキング工程の省人化、セル生産との相性が高い。",
        collaboration: "共同研究、学生PJ、検証実験",
      },
    }),
    prisma.researchSeed.create({
      data: {
        slug: "recycled-resin-process",
        title: "再生材比率を高める樹脂配合プロセス",
        department: "物質生物工学科",
        teacherId: faculty[2].id,
        keywordsJson: json(["再生材", "材料開発", "脱炭素"]),
        summary: "再生材使用率を高めながら物性低下を抑える配合・評価方法を提案。",
        potential: "環境配慮型製品開発やLCA改善に有効。",
        collaboration: "共同研究、委託評価",
      },
    }),
    prisma.researchSeed.create({
      data: {
        slug: "low-cost-river-monitoring",
        title: "小河川向け低コスト環境モニタリング",
        department: "環境都市工学科",
        teacherId: faculty[3].id,
        keywordsJson: json(["環境計測", "防災", "インフラ"]),
        summary: "センサとクラウドを用いた河川水位・水質の簡易モニタリングシステム。",
        potential: "自治体・建設会社との実証や地域防災への展開が可能。",
        collaboration: "現場実証、共同研究",
      },
    }),
  ]);

  await prisma.newsArticle.createMany({
    data: [
      {
        slug: "kickoff-2026",
        title: "技術協力会 2026年度キックオフ交流会を開催しました",
        category: "活動報告",
        publishedDate: new Date("2026-03-02"),
        summary: "会員企業・教員・学生が参加し、研究シーズ紹介と名刺交換会を実施しました。",
        body: "年度初回の交流会として、重点研究テーマの共有と企業からの技術ニーズ紹介を行いました。後半は少人数の相談ブース形式で、共同研究候補のディスカッションを実施しています。",
        attachmentsJson: json(["開催資料.pdf", "参加企業一覧.pdf"]),
      },
      {
        slug: "joint-research-guide",
        title: "共同研究公募に関する説明資料を公開しました",
        category: "新着情報",
        publishedDate: new Date("2026-02-19"),
        summary: "2026年度共同研究制度のスケジュール、応募方法、提出様式を掲載しました。",
        body: "共同研究に初めて参加する企業でも進めやすいよう、応募までの流れと相談窓口を整理しています。事前相談の予約も受け付けています。",
        attachmentsJson: json(["共同研究公募要領.pdf"]),
      },
      {
        slug: "board-minutes-20260128",
        title: "第4回理事会議事録を掲載しました",
        category: "議事録",
        publishedDate: new Date("2026-01-28"),
        summary: "理事会での議論内容と決定事項を議事録として公開しました。",
        body: "会費運用、イベント計画、会員企業の情報更新フローに関する審議結果を掲載しています。",
        attachmentsJson: json(["議事録_20260128.pdf"]),
      },
    ],
  });

  await prisma.eventItem.createMany({
    data: [
      {
        slug: "consulting-day-2026-spring",
        title: "技術相談デー 2026春",
        eventDate: new Date("2026-03-26"),
        place: "長岡高専 地域連携室",
        target: "会員企業・入会検討企業",
        deadline: new Date("2026-03-19"),
        summary: "教員と個別面談し、技術課題や共同研究テーマを整理する相談会です。",
        details: "1社30分の個別相談形式。設備見学希望にも対応予定。オンライン参加も選択できます。",
        contact: "renkei@nagaoka-ct.ac.jp",
      },
      {
        slug: "research-seeds-2026",
        title: "研究シーズ発表会",
        eventDate: new Date("2026-04-18"),
        place: "長岡高専 第一講義室",
        target: "会員企業・地域企業・教職員",
        deadline: new Date("2026-04-10"),
        summary: "教員による研究シーズ発表とポスターセッションを実施します。",
        details: "重点テーマはAI活用、省人化、環境対応材料。終了後に交流時間を設けます。",
        contact: "renkei@nagaoka-ct.ac.jp",
      },
      {
        slug: "student-bus-tour",
        title: "学生向け企業見学バスツアー",
        eventDate: new Date("2026-05-14"),
        place: "長岡市・燕市エリア",
        target: "在学生",
        deadline: new Date("2026-05-01"),
        summary: "会員企業を訪問し、現場設備や技術者の仕事を知る見学会です。",
        details: "参加企業は越後センシング株式会社、北越ロボティクス合同会社ほか。募集人数40名。",
        contact: "career@nagaoka-ct.ac.jp",
      },
    ],
  });

  await prisma.guide.createMany({
    data: [
      {
        audience: "企業向け",
        title: "技術課題を相談したい企業の方へ",
        body: "技術相談フォームから課題を送信すると、関連教員または事務局が内容を整理し、面談候補を案内します。",
      },
      {
        audience: "学生向け",
        title: "会員企業とつながる機会",
        body: "企業見学、インターンシップ、共同プロジェクトなどを通じて実務に触れられます。",
      },
      {
        audience: "教職員向け",
        title: "企業ニーズを研究につなげる",
        body: "企業からの相談内容やイベント参加企業情報を活用し、研究テーマと社会実装を接続します。",
      },
    ],
  });

  await prisma.organizationInfo.create({
    data: {
      id: 1,
      overview: "長岡高専技術協力会は、会員企業と長岡高専をつなぎ、技術相談・共同研究・人材交流を推進するための組織です。",
      purposeJson: json(["地域企業と学校の技術連携促進", "研究成果の社会実装", "学生の実践的学びと企業接点の創出"]),
      officersJson: json(["会長: 田島 進", "副会長: 小林 真弓", "幹事: 事務局長 佐々木 岳"]),
      rulesJson: json(["規約は理事会承認により改定します。", "会員情報の公開は事前承認フローを通します。", "問い合わせは担当者へ振り分けて対応します。"]),
      membershipPlansJson: json([
        {
          id: "regular",
          name: "正会員",
          fee: "年額 50,000円",
          audience: "共同研究や技術相談を継続的に行いたい企業向け",
          benefits: ["企業ページ掲載", "技術相談受付", "交流会参加", "研究シーズ優先案内"],
        },
        {
          id: "supporter",
          name: "賛助会員",
          fee: "年額 30,000円",
          audience: "情報収集や学校連携を始めたい企業向け",
          benefits: ["企業名掲載", "イベント案内", "資料配布"],
        },
      ]),
    },
  });

  await prisma.permissionProfile.createMany({
    data: [
      {
        roleName: "事務局管理者",
        scope: "全機能利用可",
        capabilitiesJson: json(["企業管理", "承認", "問い合わせ管理", "組織情報更新", "監査ログ閲覧"]),
      },
      {
        roleName: "コンテンツ担当",
        scope: "ニュース・イベント・研究シーズ更新",
        capabilitiesJson: json(["ニュース管理", "イベント管理", "研究シーズ管理"]),
      },
    ],
  });

  const memberPasswordHash = await bcrypt.hash("member123", 12);
  const adminPasswordHash = await bcrypt.hash("admin123", 12);

  const memberUser = await prisma.user.create({
    data: {
      email: "member@example.com",
      passwordHash: memberPasswordHash,
      role: UserRole.MEMBER,
      name: "越後センシング株式会社",
      companyId: companies[0].id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      name: "技術協力会 事務局",
    },
  });

  await prisma.companyUpdateRequest.create({
    data: {
      companyId: companies[1].id,
      status: WorkflowStatus.PENDING,
      submittedAt: new Date("2026-03-07T09:30:00+09:00"),
      snapshotJson: json({
        name: "北越ロボティクス合同会社",
        industry: "DX・ソフトウェア",
        city: "燕市",
        address: "新潟県燕市産業通り4-3-7",
        website: "https://example.com/hokuriku-robotics",
        summary: "協働ロボットによる検査・搬送自動化を支援。実証実験の相談窓口を拡充しました。",
        business: ["協働ロボットSI", "画像検査AI", "省人化コンサルティング", "学生PJ受入"],
        relatedFields: ["ロボティクス", "AI・データ活用"],
        departments: ["電子制御工学科", "機械工学科"],
        acceptanceItems: ["技術相談", "共同研究", "企業講演", "会社見学"],
        keywords: ["自動化", "協働ロボット", "画像検査", "学生PJ"],
        materials: [{ name: "自動化導入ガイド.pdf" }, { name: "ライン改善事例.pdf" }],
        gallery: [{ name: "協働ロボットセル" }, { name: "画像検査装置" }],
        hiringInfo: "通年採用。制御・機械設計・画像処理人材を募集。",
        message: "教員研究室との実証テーマを随時募集しています。ライン改善テーマの持ち込み歓迎。",
        internshipAvailable: false,
        siteVisitAvailable: true,
      }),
    },
  });

  await prisma.inquiry.create({
    data: {
      type: InquiryType.TECHNICAL,
      companyName: "サンプル工業株式会社",
      contactName: "山田 太郎",
      email: "yamada@example.jp",
      phone: "0258-00-0000",
      title: "設備状態監視の相談",
      message: "老朽設備に後付けできるセンシング方法について相談したい。",
      relatedCompanyId: companies[0].id,
      status: InquiryStatus.IN_PROGRESS,
      assignedTo: "技術協力会 事務局",
    },
  });

  await prisma.membershipApplication.create({
    data: {
      companyName: "新潟データソリューションズ株式会社",
      contactName: "佐藤 有紀",
      email: "contact@nds.example.jp",
      membershipType: "正会員",
      notes: "AIを活用した地域課題解決テーマで連携希望。",
      status: MembershipStatus.REVIEWING,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        scope: NotificationScope.ADMIN,
        message: "北越ロボティクス合同会社から更新申請が届いています。",
      },
      {
        scope: NotificationScope.MEMBER,
        companyId: companies[0].id,
        message: "設備状態監視に関する問い合わせが届いています。",
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: memberUser.id,
        actorLabel: "member: 北越ロボティクス合同会社",
        action: "更新申請",
        detail: "企業ページ更新申請を送信",
      },
      {
        actorUserId: adminUser.id,
        actorLabel: "admin: 技術協力会 事務局",
        action: "データ投入",
        detail: "初期シードデータを登録",
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

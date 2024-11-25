## アプリの説明
  StudySyncは、学習時間を「見える化」することで、勉強のモチベーションを維持するためのアプリです。
  学生や社会人の方が、自分の学習習慣を管理・改善するためのツールとして設計しました。

## このアプリのターゲット層
  勉強時間が「どれだけやったか」を知りたい学生
  試験勉強や資格取得に取り組む社会人
  自分の学習習慣を改善・管理したい全ての人

## アプリの機能や特徴
　表示画面の構成は「ダッシュボード」、「タイマー」、「カレンダー」、「履歴」の4つで構成されています。
 
   1.「ダッシュボード」→学習時間の見える化
    学習時間を記録し、ダッシュボードで「%」表記として確認できます。
   「どのくらい勉強したか」を感覚的ではなく数値で把握できるため、達成感が得られます。
 
   2.「タイマー」→タイマー機能
    効果的な学習手法として知られるポモドーロテクニックを内蔵。
    25分の集中時間と5分の休憩を繰り返すことで、効率的に勉強を進められます。
    タイマーが０になった時に音声が鳴るようにしてある。
    1分以内に終了した場合はデータベースへの保存はできない。
  
   3.「カレンダー」→学習履歴とカレンダー
    日々の学習履歴を振り返りやすいカレンダー表示。
    タイマー機能で25分経過後に登録した内容が表示されます。
    自分の進捗を視覚的に確認して計画を立てやすくします。
  
   4.「履歴」→今まで取り組んだものを一覧表示している

## 使用した技術
 フロントエンド: Next.js Typescript
 バックエンド: Supabase
 デザイン: RadixUI  three.js  //chatGPTと相談しながら実装しながら行いました。

## 使用方法
   1.リンクに飛ぶ https://studysync-13tyh.vercel.app
   
   2.アカウント作成＆メールでの認証確認
   
   3.今日の目標時間や何をするか、週の目標時間の設定
   
   4.タイマー画面で今からすることのジャンルを設定し、スタート
   
   5.25分経過後、何をしたかを入力し保存する
   
   6.ダッシュボードやカレンダーで、今どのくらいの進捗があるかを確認

## 今後の改善点
   1.クライアントコンポーネント側で「api/route.tsx」で書くべき処理を書いているので、情報漏洩やハッキングの防止のためにも、サーバーコンポーネントに書くことを心がける。
   
   2.JestやE2Eテストできちんとした実装を行う。
   
   3.どの関数でどのような処理が行われているかを明確にメモをする。⭐️コメントの多様はかえって見づらいので気を付ける。

## 追加していきたい機能
   1.「%」や「分」だけでの表示ではなく、もっと見える化させるための棒グラフ
   
   2. 一定の期間タイマーを利用していなかったら登録したメールアドレス宛にリマインドする機能



# cdks

## 概要

主にLambdaで作りたかったものをまとめるリポジトリ

## 作成stack

### vsnip-stack

コードのvsnip JSONへの変換API

### vircon-stack

Atcoderバーチャルコンテスト作成Lambda(EventBridge駆動)

### virtual-contest-abc-picker-stack

AtCoderバーチャルコンテストをコンテスト番号とrangeでまとめて作成できるAPI
(フロント：https://k-ohnuma.github.io/virtual)

### problem-diff-stack

AtCoder Problemsのdifficultyを個別指定で取得できるAPI

### health-check-stack

5minに1回指定したエンドポイントにリクエストを投げるLambda(EventBridge駆動)
ヘルスチェックと言いつつ、それより大事な存在理由はコールドスタートへの悪あがき。

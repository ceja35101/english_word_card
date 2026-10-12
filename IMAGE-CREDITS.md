# 画像の出典と利用条件

## ARASAAC の教材画像

- 作者：Sergio Palao
- 出典：[ARASAAC](https://arasaac.org/)
- 権利者：Government of Aragón（スペイン・アラゴン州政府）
- ライセンス：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- 利用条件：[ARASAAC Terms of use](https://arasaac.org/terms-of-use)

`assets/pictograms/` に保存した画像が対象です。画像を組み合わせた `assets/diagrams/` の一部も同じライセンスで提供します。これらの素材とその派生教材は、作者・出典・権利者・ライセンスを表示し、非商用で、同じライセンスのもとで共有してください。

各カードの出典番号とURLは `cards.js` の `source` に、組み合わせた図の出典番号は `source.ids` に記録しています。`https://arasaac.org/pictograms/en/番号` で元の画像を確認できます。取得したカタログは `data/arasaac-en.json` です。

## その他の画像

- 番号1〜22の元写真と切り出した画像：ユーザー提供の単語帳写真。写真に写るイラストの権利は原権利者に帰属します。
- `assets/illustrations/`：組み込みの image_gen ツールで生成したイラスト。生成プロンプトは同フォルダー内の `*prompt*.json` に保存しています。
- `assets/diagrams/`：数・順番・色・形・曜日・月・位置・頻度などの図。`make-diagrams.cjs` から再生成できます。ARASAAC の画像を含む図には上記の利用条件が適用されます。

画像の割り当ては `cards.js` と `image-overrides.json` を参照してください。

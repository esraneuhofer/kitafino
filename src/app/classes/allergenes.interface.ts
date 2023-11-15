export interface Allergene {
  _id?: string;
  name_allergene: string;
  name_allergene_long: string;
  short: string;
  allergeneType: string;
  display: boolean;
}

export interface ArticleDeclarations {
  articleDeclarations: Allergene[];
}

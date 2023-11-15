export interface ArticleInterface {
  BLS_Key:string;
  nameArticle:string;
  kcal:number;
  proteinMg:number;
  fettMg:number;
  kohlenhydrateMg:number;
  ballaststoffeMg:number;
  vitaminARetinolUg:number;
  vitaminDUg:number;
  vitaminB1UG:number;
  vitaminB2Ug:number;
  vitaminB6Ug:number;
  vitaminB12Ug:number;
  vitaminCUg:number;
  natriumMg:number;
  kaliumMg:number;
  calciumMg:number;
  magnesiumMg:number;
  phosphorMg:number;
  schwefelMg:number;
  chloridMg:number;
  eisenUg:number;
  zinkUg:number;
  KupferUg:number;
  fluoriUg:number;
  fruchtoseMg:number;
  lactoseMg:number;
  zuckerMg:number;
  gesFettMg:number;
  mehrfachUnFettMg:number;
  omgega3Mg:number;
  omega6Mg:number;
  cholesterinMg:number;
  broteinheitenBE:number;
  kochsalzMg:number;
  einfachUnFettMg:number;
  price:number;
  isEdited:boolean;
  articleNumber:string;
  supplier:string;
  allergenes:{_id:string,name_allergene:string}[];
}

export interface ArticleInterfaceId extends ArticleInterface{
  _id:string;
}

export class ArticleClass implements ArticleInterface{
  BLS_Key:string;
  nameArticle:string;
  kcal:number;
  proteinMg:number;
  fettMg:number;
  kohlenhydrateMg:number;
  ballaststoffeMg:number;
  vitaminARetinolUg:number;
  vitaminDUg:number;
  vitaminB1UG:number;
  vitaminB2Ug:number;
  vitaminB6Ug:number;
  vitaminB12Ug:number;
  vitaminCUg:number;
  natriumMg:number;
  kaliumMg:number;
  calciumMg:number;
  magnesiumMg:number;
  phosphorMg:number;
  schwefelMg:number;
  chloridMg:number;
  eisenUg:number;
  zinkUg:number;
  KupferUg:number;
  fluoriUg:number;
  fruchtoseMg:number;
  lactoseMg:number;
  zuckerMg:number;
  gesFettMg:number;
  mehrfachUnFettMg:number;
  omgega3Mg:number;
  omega6Mg:number;
  cholesterinMg:number;
  broteinheitenBE:number;
  kochsalzMg:number;
  einfachUnFettMg:number;
  price:number;
  isEdited:boolean;
  articleNumber:string;
  supplier:string;
  allergenes:[];
  constructor() {
    this.BLS_Key = '';
    this.nameArticle = '';
    this.kcal = 0;
    this.proteinMg = 0;
    this.fettMg = 0;
    this.kohlenhydrateMg = 0;
    this.ballaststoffeMg = 0;
    this.vitaminARetinolUg = 0;
    this.vitaminDUg = 0;
    this.vitaminB1UG = 0;
    this.vitaminB2Ug = 0;
    this.vitaminB6Ug = 0;
    this.vitaminB12Ug = 0;
    this.vitaminCUg = 0;
    this.natriumMg = 0;
    this.kaliumMg = 0;
    this.calciumMg = 0;
    this.magnesiumMg = 0;
    this.phosphorMg = 0;
    this.schwefelMg = 0;
    this.chloridMg = 0;
    this.eisenUg = 0;
    this.zinkUg = 0;
    this.KupferUg = 0;
    this.fluoriUg = 0;
    this.fruchtoseMg = 0;
    this.lactoseMg = 0;
    this.zuckerMg = 0;
    this.gesFettMg = 0;
    this.mehrfachUnFettMg = 0;
    this.omgega3Mg = 0;
    this.omega6Mg = 0;
    this.cholesterinMg = 0;
    this.broteinheitenBE = 0;
    this.kochsalzMg = 0;
    this.einfachUnFettMg = 0;
    this.price = 0;
    this.isEdited = false;
    this.supplier = '';
    this.articleNumber = '';
    this.allergenes = [];
  }


}


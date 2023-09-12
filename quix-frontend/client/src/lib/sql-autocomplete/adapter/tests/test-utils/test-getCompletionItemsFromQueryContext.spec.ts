
import { DbInfoService } from "../../../../sql-autocomplete/db-info";
import { ContextType, TableType } from "../../../sql-context-evaluator";
import { SqlAutocompleter } from '../../sql-autocomplete-adapter';
import {expect} from 'chai';
import { MockDbInfoService } from "./mock-db-config";

describe('testing autoComplete for nested objects:   ', () => {
  const config = new MockDbInfoService();
  const autocomp = new SqlAutocompleter(config);
  const queryContext = {
    prefix : '',
    contextType: ContextType.Column,
    tables : [
      { type: TableType.External,
        name: 'catalog0.schema0.TV&Sports',
        alias: "",
        selectAll : false,
        tableRefs: [],
        columns : [
          {
            name: 'TV',
            dataType: 'row(movies row(action row(The_Dark_Knight varchar,The_Avengers varchar,Die_Hard varchar), comedy row(The_Hangover varchar, The_Hangover2 varchar)), tvSeries row(sopranos varchar, The_wire varchar))'
          },
          {
            name: 'sports',
            dataType: 'row(team row(basketball varchar, baseball varchar, soccer varchar), individual row(tennis varchar, racketBall varchar))'
          },
        ]
      },
      { type: TableType.External,
        name: 'catalog1.schema1.food&countries',
        alias: 'aliasName',
        selectAll : false,
        tableRefs: [],
        columns : [
          {
            name: 'food',
            dataType: 'row(fastFood row(mcDonalds row(hamBurger varchar,mcflurry varchar,french_fries varchar), asain row(sushi varchar, wok varchar)), local row(falafel varchar, hummus varchar))'
          },
          {
            name: 'countries',
            dataType: 'row(israel row(telAviv varchar, jerusalem varchar, ramatGan varchar), USA row(NYC varchar, california varchar))'
          },
        ]
      }
    ],
  }
  

  it('should return first level of nested object',async () => {
    queryContext.prefix= 'catalog0.schema0.TV&Sports.TV.'
    const completers = await autocomp.getCompletionItemsFromQueryContextColumn( queryContext );
    expect(completers).to.deep.equal( [
      { value: 'catalog0.schema0.TV&Sports.TV.movies', meta: 'row' , caption: 'movies' },
      { value: 'catalog0.schema0.TV&Sports.TV.tvSeries', meta: 'row' , caption: 'tvSeries' },
    ] );
  });

  it('should return second level of nested object',async () => {
    queryContext.prefix= 'catalog0.schema0.TV&Sports.TV.movies.'
    const completers = await autocomp.getCompletionItemsFromQueryContextColumn( queryContext );
    expect(completers).to.deep.equal( [
      { value: 'catalog0.schema0.TV&Sports.TV.movies.action', meta: 'row' , caption: 'action' },
      { value: 'catalog0.schema0.TV&Sports.TV.movies.comedy', meta: 'row' , caption: 'comedy' },
    ] );
  });

  it('should return all options that include the letter d from the second layer and above',async () => {
    queryContext.prefix= 'catalog0.schema0.TV&Sports.TV.movies.d'
    const completers = await autocomp.getCompletionItemsFromQueryContextColumn( queryContext );
    expect(completers).to.deep.equal( [
      { value: 'TV.movies.action.The_Dark_Knight', meta: 'varchar' , caption: 'action.The_Dark_Knight' },
      { value: 'TV.movies.action.Die_Hard', meta: 'varchar' , caption: 'action.Die_Hard' },
      { value: 'TV.movies.comedy', meta: 'row' , caption: 'comedy' },
    ] );
  });

  it('should return second level of nested object but value begins with alias',async () => {
    queryContext.prefix= 'aliasName.food&countries.food.'
    const completers = await autocomp.getCompletionItemsFromQueryContextColumn( queryContext );
    expect(completers).to.deep.equal( [
      { value: 'aliasName.food&countries.food.fastFood', meta: 'row' , caption: 'fastFood' },
      { value: 'aliasName.food&countries.food.local', meta: 'row' , caption: 'local' },
    ] );
  });

  it('should return options that include prefix rry in food column',async () => {
    queryContext.prefix= 'aliasName.food&countries.food.rry'
    const completers = await autocomp.getCompletionItemsFromQueryContextColumn( queryContext );
    expect(completers).to.deep.equal( [
      { value: 'food.fastFood.mcDonalds.mcflurry', meta: 'varchar' , caption: 'fastFood.mcDonalds.mcflurry' },
    ] );
  });

  it('should return options that include prefix rryyyy in food column',async () => {
    queryContext.prefix= 'aliasName.food&countries.food.rryyyy'
    const completers = await autocomp.getCompletionItemsFromQueryContextColumn( queryContext );
    expect(completers).to.deep.equal( [] );
  });

  it('should return options that include prefix Gan in fron 2nd layer and higher',async () => {
    queryContext.prefix= 'food&countries.countries.Gan'
    const completers = await autocomp.getCompletionItemsFromQueryContextColumn( queryContext );
    expect(completers).to.deep.equal( [
      { value: 'countries.israel.ramatGan', meta: 'varchar' , caption: 'israel.ramatGan' },
    ] );
  });

});
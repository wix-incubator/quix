
import { DbInfoService } from "../../../sql-autocomplete/db-info/db-info-service";
import {  TableType } from "../../../sql-autocomplete/sql-context-evaluator/index";
import { SqlAutocompleter } from '../../../sql-autocomplete/adapter/sql-autocomplete-adapter';
import {expect} from 'chai';
import { ContextType } from "../../../sql-autocomplete/sql-context-evaluator";

describe.only('testing autoComplete for nested objects:   ', () => {
  const dbInfoService = new DbInfoService("presto", "");
  const sqlAutocompleter = new SqlAutocompleter(dbInfoService, "presto");
  const contextOfQuery= {
    prefix : "catalog0.schema0.TV&Sports",
    contextType: ContextType.Column,
    tables : [
      { type: TableType.External,
        name: 'catalog0.schema0.TV&Sports',
        alias: undefined,
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
  it('should return movies and tv series for prefix catalog0.schema0.TV&Sports.TV.',async () => {
    contextOfQuery.prefix= 'catalog0.schema0.TV&Sports.TV.'
    const ans = await sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(contextOfQuery);
    expect(ans).to.deep.equal( [
      { value: 'catalog0.schema0.TV&Sports.TV.movies', meta: 'object' },
      { value: 'catalog0.schema0.TV&Sports.TV.tvSeries', meta: 'object' },
    ] );
  });

  it('should return action and comedy for prefix catalog0.schema0.TV&Sports.TV.movies.',async () => {
    contextOfQuery.prefix= 'catalog0.schema0.TV&Sports.TV.movies.'
    const ans2 = await sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(contextOfQuery);
    expect(ans2).to.deep.equal( [
      { value: 'catalog0.schema0.TV&Sports.TV.movies.action', meta: 'object' },
      { value: 'catalog0.schema0.TV&Sports.TV.movies.comedy', meta: 'object' },
    ] );
  });

  it('should return action and comedy for prefix catalog0.schema0.TV&Sports.TV.movies.',async () => {
    contextOfQuery.prefix= 'catalog0.schema0.TV&Sports.TV.movies.ac'
    const ans2 = await sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(contextOfQuery);
    expect(ans2).to.deep.equal( [
      { value: 'catalog0.schema0.TV&Sports.TV.movies.action', meta: 'object' },
    ] );
  });

  it('testing with alias',async () => {
    contextOfQuery.prefix= 'aliasName.food.'
    const ans2 = await sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(contextOfQuery);
    expect(ans2).to.deep.equal( [
      { value: 'aliasName.food.fastFood', meta: 'object' },
      { value: 'aliasName.food.local', meta: 'object' },
    ] );
  });

  it('testing with alias inside 2nd layer',async () => {
    contextOfQuery.prefix= 'aliasName.food.fastFood.'
    const ans2 = await sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(contextOfQuery);
    expect(ans2).to.deep.equal( [
      { value: 'aliasName.food.fastFood.mcDonalds', meta: 'object' },
      { value: 'aliasName.food.fastFood.asain', meta: 'object' },
    ] );
  });
  
  it('testing column with alias but not using it inside 3nd layer',async () => {
    contextOfQuery.prefix= 'catalog1.schema1.food&countries.isr'
    const ans2 = await sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(contextOfQuery);
    expect(ans2).to.deep.equal( [
      { value: 'catalog1.schema1.food&countries.countries.israel', meta: 'object' },
    ] );
  });

});
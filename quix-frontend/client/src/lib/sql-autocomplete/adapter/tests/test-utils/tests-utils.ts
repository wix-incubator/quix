import { expect } from 'chai';
import { ICompleterItem } from '../../../../code-editor/services/code-editor-completer';
import {
  ContextType,
  QueryContext,
  TableType,
} from '../../../sql-context-evaluator';
import { SqlAutocompleter } from '../../sql-autocomplete-adapter';
import { MockDbInfoService } from './mock-db-config';

export const runAdapterGetCompletersTest = (
  testnumber: number,
  queryContext: QueryContext,
  expected: ICompleterItem[]
) => {
  const config = new MockDbInfoService();
  const autocomp = new SqlAutocompleter(config);
if (testnumber < 18) {
  it(`test #${testnumber} should return comleters = ${expected}`, async () => {
    const completers = await autocomp.getCompletionItemsFromQueryContext(queryContext);
    expect(completers).to.be.deep.equal(expected);
  });
}
else {
  queryContext = {
    prefix : "catalog0.schema0.TV.",
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
  switch (testnumber) {
    case 18:
      it(`test #${testnumber} should return comleters = ${expected}`, async () => {
        const completers = await autocomp.getAllCompletionItemsFromQueryContextColumn( queryContext );
        expect(completers).to.be.deep.equal(expected);
      });
      break;
    case 19:
      it(`test #${testnumber} should return comleters = ${expected}`, async () => {
        queryContext.prefix = 'catalog0.schema0.TV.movies.'
        const completers = await autocomp.getAllCompletionItemsFromQueryContextColumn( queryContext );
        expect(completers).to.be.deep.equal(expected);
      });
        break;
    case 20:
      it(`test #${testnumber} should return comleters = ${expected}`, async () => {
        queryContext.prefix = 'catalog0.schema0.TV.movies.action.'
        const completers = await autocomp.getAllCompletionItemsFromQueryContextColumn( queryContext );
        expect(completers).to.be.deep.equal(expected);
      });
        break;
    case 21:
      it(`test #${testnumber} should return comleters = ${expected}`, async () => {
        queryContext.prefix = 'catalog0.schema0.TV.movies.acti'
        const completers = await autocomp.getAllCompletionItemsFromQueryContextColumn( queryContext );
        expect(completers).to.be.deep.equal(expected);
      });
        break;
    case 22:
      it(`test #${testnumber} should return comleters = ${expected}`, async () => {
        queryContext.prefix = 'catalog0.schema0.TV.movies.funny'
        const completers = await autocomp.getAllCompletionItemsFromQueryContextColumn( queryContext );
        expect(completers).to.be.deep.equal(expected);
      });
        break;
    default:
      break;
  }
}
  
};

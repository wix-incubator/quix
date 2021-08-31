import { testsInput } from './test-inputs/test-final-inputs';
import { expectedResult } from './expected-results';
import { runAdapterGetCompleters } from '../test-utils/tests-utils';
import { MockDbInfoService } from '../test-utils/mock-db-config';
import { SqlAutocompleter } from '../../sql-autocomplete-adapter';



// describe('when reciving queryContext', () => {
//     before(() => {
//         const config = new MockDbInfoService();
//         const autocomp = new SqlAutocompleter(config);
//         const getCompleters  = autocomp.getCompletionItemsFromQueryContext;
//     });
//     describe('', () => {
//         runAdapterGetCompleters(
//             testsInput[ContextType.Column]
//         )
//     })

// });
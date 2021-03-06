import { GraphSynchronizer, IGraphSyncOptions } from '@ablestack/rdo';
import { Logger, DefaultLogger } from '@ablestack/rdo/infrastructure/logger';
import _ from 'lodash';
import { BookRDO, LibraryRDO } from '../supporting-files/library-rdo-models';
import { librarySourceJSON } from '../supporting-files/library-source-data';
import { Book } from '../supporting-files/library-source-models';

const logger = Logger.make('map-sync.test.ts');

// --------------------------------------------------------------
// MODELS & DATA
// --------------------------------------------------------------

//
// Source Data Models

// Imported from ./supporting-files/library-source-models

//
// Source Data

// Imported from ./supporting-files/library-source-data

//
// RDO Graphs

// Imported from ./supporting-files/library-rdo-models.ts

// --------------------------------------------------------------
// CONFIG
// --------------------------------------------------------------
const config: IGraphSyncOptions = {
  targetedNodeOptions: [{ sourceNodeMatcher: { nodePath: 'authors/books' }, makeRdo: (book: Book) => new BookRDO() }],
  globalNodeOptions: { commonRdoFieldnamePostfix: '$' },
};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Test Jest Spy functionality', () => {
  const libraryRDO = new LibraryRDO();

  // Set Spy
  const spy = jest.spyOn(libraryRDO, 'code$', 'set');

  // Use setter
  libraryRDO.code$ = 'testVal';

  // Expect
  expect(spy).toHaveBeenCalled();
});

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

test('Synchronize only updated properties only where source data changed', () => {
  const libraryRDO = new LibraryRDO();
  const graphSynchronizer = new GraphSynchronizer(config);

  // Initial Spy
  const library_code_spy_set = jest.spyOn(libraryRDO, 'code$', 'set');
  const library_capacity_spy_set = jest.spyOn(libraryRDO, 'capacity', 'set');

  // Initial data load
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: librarySourceJSON });

  // Posture Verification
  expect(library_code_spy_set).toHaveBeenCalled();
  expect(library_capacity_spy_set).toHaveBeenCalled();

  // Clear/Add method spies
  library_code_spy_set.mockClear();
  library_capacity_spy_set.mockClear();
  const authors_0_age_spy_set = jest.spyOn(libraryRDO.authors.array$[0], 'age$', 'set');
  const authors_0_name_spy_set = jest.spyOn(libraryRDO.authors.array$[0], 'name$', 'set');
  const authors_0_books_0_title_spy_set = jest.spyOn(libraryRDO.authors.array$[0].books[0], 'title$', 'get');

  // Mutate data
  const libraryWithEdits = _.cloneDeep(librarySourceJSON);
  libraryWithEdits.code = libraryWithEdits.code + ' - changed';
  libraryWithEdits.authors[0].age = libraryWithEdits.authors[0].age + 2;

  // EXECUTE
  graphSynchronizer.smartSync({ rootRdo: libraryRDO, rootSourceNode: libraryWithEdits });

  // RESULTS VERIFICATION
  expect(library_code_spy_set).toHaveBeenCalled();
  expect(library_capacity_spy_set).not.toHaveBeenCalled();

  expect(authors_0_age_spy_set).toHaveBeenCalled();
  expect(authors_0_name_spy_set).not.toHaveBeenCalled();
  expect(authors_0_books_0_title_spy_set).not.toHaveBeenCalled(); // This should not have been called, because the isEqual algorithm further up the graph should have determined no change, and so not traversed up the node tree to this point
});

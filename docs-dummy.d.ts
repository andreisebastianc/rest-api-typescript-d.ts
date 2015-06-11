import DocsDummyNested = require('./docs-dummy-nested');
import DocsDummyNested2 = require('./docs-dummy-nested2');

interface DocsDummy {
    works: boolean; // this is supposed to describe in depth what's going on
    nested: DocsDummyNested;
    nested2: DocsDummyNested2;
}

export = DocsDummy;
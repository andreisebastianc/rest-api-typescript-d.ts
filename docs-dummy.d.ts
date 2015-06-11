import DocsNested = require('./docs-nested');
import DocsAnotherNested = require('./docs-another-nested2');

interface DocsDummy {
    works: boolean; // this is supposed to describe in depth what's going on
    nested: DocsNested;
    nested2: DocsAnotherNested;
}

export = DocsDummy;
import DocsAnotherNested = require('./docs-another-nested2');

interface DocsNested {
    works: boolean; // this is supposed to describe in depth what's going on
    nested: DocsAnotherNested;
}

export = DocsNested;
import { TestBed } from '@angular/core/testing';

import { WordsearchService } from './wordsearch.service';

describe('WordsearchService', () => {
  let service: WordsearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordsearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

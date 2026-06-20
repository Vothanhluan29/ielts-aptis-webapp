import React from 'react';
import AutoGradedSubmissionListPage from '../shared/AutoGradedSubmissionListPage';
import grammarVocabAdminApi from '../../../api/APTIS/grammar&vocab/grammar_vocabAdminApi';

const GrammarVocabSubmissionListPage = () => (
  <AutoGradedSubmissionListPage
    skill="grammar_vocab"
    api={grammarVocabAdminApi}
    detailRoute="/aptis/grammar-vocab/result"
  />
);

export default GrammarVocabSubmissionListPage;

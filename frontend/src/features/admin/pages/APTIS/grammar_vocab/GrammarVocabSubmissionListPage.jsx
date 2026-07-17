import React from 'react';
import AutoGradedSubmissionListPage from '../shared/AutoGradedSubmissionListPage';
import grammarVocabAdminApi from '../../../api/APTIS/grammar&vocab/grammar_vocabAdminApi';

const GrammarVocabSubmissionListPage = () => (
  <AutoGradedSubmissionListPage
    skill="grammar_vocab"
    api={grammarVocabAdminApi}
    detailRoute={window.location.pathname.startsWith("/teacher") ? "/teacher/submissions/grammar-vocab" : "/admin/aptis/submissions/grammar-vocab"}
  />
);

export default GrammarVocabSubmissionListPage;


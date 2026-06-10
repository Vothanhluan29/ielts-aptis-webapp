import React from 'react';
import AutoGradedSubmissionListPage from '../shared/AutoGradedSubmissionListPage';
import readingAptisAdminApi from '../../../api/APTIS/reading/readingAptisAdminApi';

const ReadingSubmissionListPage = () => (
  <AutoGradedSubmissionListPage
    skill="reading"
    api={readingAptisAdminApi}
    detailRoute="/admin/aptis/submissions/reading"
  />
);

export default ReadingSubmissionListPage;

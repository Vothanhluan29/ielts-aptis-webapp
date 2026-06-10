import React from 'react';
import AutoGradedSubmissionListPage from '../shared/AutoGradedSubmissionListPage';
import listeningAptisAdminApi from '../../../api/APTIS/listening/listeningAptisAdminApi';

const ListeningSubmissionListPage = () => (
  <AutoGradedSubmissionListPage
    skill="listening"
    api={listeningAptisAdminApi}
    detailRoute="/admin/aptis/submissions/listening"
  />
);

export default ListeningSubmissionListPage;

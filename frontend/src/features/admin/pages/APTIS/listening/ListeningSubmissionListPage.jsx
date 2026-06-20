import React from 'react';
import AutoGradedSubmissionListPage from '../shared/AutoGradedSubmissionListPage';
import listeningAptisAdminApi from '../../../api/APTIS/listening/listeningAptisAdminApi';

const ListeningSubmissionListPage = () => (
  <AutoGradedSubmissionListPage
    skill="listening"
    api={listeningAptisAdminApi}
    detailRoute="/aptis/listening/result"
  />
);

export default ListeningSubmissionListPage;

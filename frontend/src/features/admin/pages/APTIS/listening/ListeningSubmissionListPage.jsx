import React from 'react';
import AutoGradedSubmissionListPage from '../shared/AutoGradedSubmissionListPage';
import listeningAptisAdminApi from '../../../api/APTIS/listening/listeningAptisAdminApi';

const ListeningSubmissionListPage = () => (
  <AutoGradedSubmissionListPage
    skill="listening"
    api={listeningAptisAdminApi}
    detailRoute={window.location.pathname.startsWith("/teacher") ? "/teacher/submissions/listening" : "/admin/aptis/submissions/listening"}
  />
);

export default ListeningSubmissionListPage;


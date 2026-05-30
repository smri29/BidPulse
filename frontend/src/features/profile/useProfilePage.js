import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getMyActivity } from '../../redux/authSlice';
import { useProfileFormState } from './hooks/useProfileFormState';
import { useProfileVerificationFlow } from './hooks/useProfileVerificationFlow';

export const useProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading, activity } = useSelector((state) => state.auth);
  const formState = useProfileFormState(user);
  const verificationState = useProfileVerificationFlow(user);

  useEffect(() => {
    if (!user?.token) return;
    dispatch(getMyActivity());
  }, [dispatch, user?.token]);

  const stats = useMemo(
    () => activity?.stats || { totalListed: 0, totalPlacedBids: 0, totalWins: 0, totalLosses: 0 },
    [activity?.stats]
  );

  return {
    user,
    isLoading,
    activity,
    stats,
    ...formState,
    ...verificationState,
  };
};

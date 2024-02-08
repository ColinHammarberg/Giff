import { useQuery } from 'react-query';
import { FetchUserTags } from '../endpoints/TagManagementEndpoints';

const useFetchUserTags = (isDesignOpen) => {
  const getUserTags = useQuery(
    ['userTags', isDesignOpen],
    () => FetchUserTags(),
    {
      retry: 3,
      retryDelay: 3000,
    }
  );

  return {
    tags: getUserTags?.data?.data?.tags,
    isLoading: getUserTags.isLoading,
    refetch: getUserTags.refetch,
  };
};

export default useFetchUserTags;

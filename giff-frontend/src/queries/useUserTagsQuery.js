import { useQuery } from "react-query";
import { FetchUserTags } from "../endpoints/TagManagementEndpoints";

const useFetchUser = () => {
    const getUserTags = useQuery(
      ['userTags'],
      () => FetchUserTags(),
      {
        retry: 3,
        retryDelay: 3000,
      }
    );
  
    return {
      tags: getUserTags?.data?.data?.tags,
      isLoading: getUserTags.isLoading,
    };
  };
  
  export default useFetchUser;

import { useParams } from 'react-router-dom';

export function useUrlParams() {
  const { orgId, conceptId, storeId } = useParams();
  
  return {
    orgId,
    conceptId,
    storeId,
  };
}

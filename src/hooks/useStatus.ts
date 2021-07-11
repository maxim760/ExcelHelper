import { useState, useCallback } from "react";
import { STATUSES } from "../types";

type IStatus = {
  status: STATUSES
  message?: string
}

export const useStatus = (defaultStatus = STATUSES.NONE) => {
  const [status, setStatus] = useState<IStatus>({status: defaultStatus});
  const setNewStatus = useCallback((status: STATUSES, message?: string) => {
    setStatus({status, message})
  },[setStatus])
  const updateMessage = useCallback((message: string) => {
    setStatus(prev => ({...prev, message}))
  }, [setStatus])
  return {
    statusMessage: status.message,
    setStatus: setNewStatus,
    updateMessage,
    isLoading: status.status === STATUSES.LOADING,
    isNone: status.status === STATUSES.NONE,
    isSuccess: status.status === STATUSES.SUCCESS,
    isError: status.status === STATUSES.ERROR,
}
}
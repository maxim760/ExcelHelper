import { useCallback, useState } from "react"

type IOutput = [string, (e: React.ChangeEvent<HTMLInputElement>) => void, {reset(): void}]
export const useChange = (initialValue = ""): IOutput  => {
  const [value, setValue] = useState(initialValue)
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [])
  const reset = useCallback(() => {
    setValue("")
  }, [])
  return [value, onChange, {reset}]
}
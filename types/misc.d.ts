type DateString = string;
type JSONString = string;

interface DgaSelectOption {
  label: string,
  value: any
}

interface PaginationParams {
  pagesize?: number,
  startid?: string,
}

interface BasicListableItem<K = any, T = any, G = any> {
  key: K,
  value?: T,
  group?: G,
}

type BasicListableLinkFuntion = (item: BasicListableItem, row: number) => string;

interface BrowserTimeSyncData {
  synced: boolean,
  lastestSyncLocal: Date,
  time: Date,
}

interface ToastData {
  id: string,
  title: string,
  content?: string,
  timeoutId?: NodeJS.Timeout,
}

type ToastParams = Omit<ToastData, "id"> & {
  id?: string,
  autoCloseDelay?: number,
};
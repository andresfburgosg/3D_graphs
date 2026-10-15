export type ClientPortalProps = {
  selector: string;
  children: React.ReactNode;
};

export type CalendarInputProps = {
  minDate?: string;
  maxDate?: string;
  setMinDate?: (date: string) => void;
  setMaxDate?: (date: string) => void;
};

export type GraphContainerProps = {
  title?: string;
  description?: string;
  graphKey: string;
  children: React.ReactNode;
};

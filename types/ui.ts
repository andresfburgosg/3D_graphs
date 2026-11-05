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

export type GraphTabButtonProps = {
  title: string;
  value: string;
};

export type GraphTabButtonsProps = {
  buttons: GraphTabButtonProps[];
  activeTabValue: string;
  onTabChange: (value: string) => void;
};

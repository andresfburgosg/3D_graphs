import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import { CalendarInputProps } from "@/types/ui";

const CalendarInput: React.FC<CalendarInputProps> = ({
  minDate,
  maxDate,
  setMinDate,
  setMaxDate,
}) => {
  console.log("Calendar Props: ", { minDate, maxDate });
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!datePickerRef.current) return;

    let minMaxDateProps = {};
    if (minDate && maxDate) {
      const minDateCast = new Date(minDate);
      const maxDateCast = new Date(maxDate);
      minMaxDateProps = {
        /*minDate: minDateCast,
        maxDate: maxDateCast,*/
        defaultDate: [minDateCast, maxDateCast],
      };
    }

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y M",
      ...minMaxDateProps,
      clickOpens: true,
      onChange: function (selectedDates) {
        if (selectedDates.length === 2) {
          const startDate = selectedDates[0];
          const endDate = selectedDates[1];
          const formatter = new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });

          if (setMinDate) {
            setMinDate(formatter.format(startDate));
          }

          if (setMaxDate) {
            setMaxDate(formatter.format(endDate));
          }
        }
      },
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, [maxDate, minDate, setMaxDate, setMinDate]);

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={datePickerRef}
        className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200 bg-white text-sm font-medium text-transparent outline-none lg:h-auto lg:w-40 lg:py-2 lg:ps-10 lg:pe-3 lg:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300"
        placeholder="Select date range"
      />
    </div>
  );
};

export default CalendarInput;

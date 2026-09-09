import { forwardRef, useImperativeHandle, useRef, type InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { inputClasses } from './Field';

type CalendarInputType = 'date' | 'datetime-local' | 'month';

interface CalendarInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: CalendarInputType;
  pickerLabel?: string;
  wrapperClassName?: string;
}

type PickerInput = HTMLInputElement & { showPicker?: () => void };

export const CalendarInput = forwardRef<HTMLInputElement, CalendarInputProps>(function CalendarInput({
  type = 'date',
  pickerLabel,
  wrapperClassName = '',
  className = '',
  ...props
}, forwardedRef) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  const openPicker = () => {
    const input = inputRef.current as PickerInput | null;
    if (!input || input.disabled || input.readOnly) return;
    input.focus({ preventScroll: true });
    try {
      input.showPicker?.();
    } catch {
      input.click();
    }
  };

  const label = pickerLabel ?? t(type === 'datetime-local' ? 'admin.common.openDateTimePicker' : 'admin.common.openDatePicker');

  return (
    <div className={`relative min-w-0 ${wrapperClassName}`}>
      <input
        {...props}
        ref={inputRef}
        type={type}
        className={`${inputClasses} hcbe-calendar-input cursor-pointer pr-14 [color-scheme:light] dark:[color-scheme:dark] ${className}`}
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute bottom-1.5 right-1.5 top-1.5 flex aspect-square items-center justify-center rounded-[10px] border border-green/15 bg-green/8 text-green transition-colors hover:border-green hover:bg-green hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green"
        aria-label={label}
        title={label}
      >
        <i className={type === 'datetime-local' ? 'ri-calendar-schedule-line' : 'ri-calendar-event-line'} aria-hidden="true" />
      </button>
    </div>
  );
});

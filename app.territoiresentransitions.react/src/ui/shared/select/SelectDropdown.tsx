import {keys} from 'ramda';
import {forwardRef, ReactElement, Ref} from 'react';
import {Placement} from '@floating-ui/react-dom-interactions';

import DropdownFloater from 'ui/shared/floating-ui/DropdownFloater';
import {
  buttonDisplayedClassname,
  buttonDisplayedIconClassname,
  buttonDisplayedPlaceholderClassname,
  optionCheckMarkClassname,
} from 'ui/shared/select/commons';

/* Création d'un composant séparé pour passer la ref du boutton au floater */
const SelectDropdownButtonDisplayed = forwardRef(
  <T extends string>(
    {
      labels,
      value,
      isOpen,
      placeholderText,
      ...props
    }: {
      labels: Record<T, string>;
      value?: T;
      isOpen?: boolean;
      placeholderText?: string;
    },
    ref?: Ref<HTMLButtonElement>
  ) => (
    <button
      ref={ref}
      aria-label="ouvrir le menu"
      className={buttonDisplayedClassname}
      {...props}
    >
      {value ? (
        <span className="mr-auto">{labels[value]}</span>
      ) : (
        <span className={buttonDisplayedPlaceholderClassname}>
          {placeholderText ?? ''}
        </span>
      )}
      <span
        className={`${buttonDisplayedIconClassname} ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
  )
);

const SelectDropdown = <T extends string>({
  placement,
  value,
  labels,
  onSelect,
  displayOption,
  options,
  placeholderText,
}: {
  placement?: Placement;
  value?: T;
  labels: Record<T, string>;
  displayOption?: (option: T) => ReactElement;
  onSelect: (value: T) => void;
  options?: T[];
  placeholderText?: string;
}) => {
  const selectableOptions: T[] = options ?? keys(labels);
  return (
    <DropdownFloater
      placement={placement}
      render={({close}) =>
        selectableOptions.map(v => {
          const label = labels[v as T];
          return (
            <button
              key={v}
              aria-label={label}
              className="flex items-center w-full p-2 text-left text-sm"
              onClick={() => {
                onSelect(v as T);
                close();
              }}
            >
              <div className="w-6 mr-2">
                {value === v ? (
                  <span className={optionCheckMarkClassname} />
                ) : null}
              </div>
              <span>
                {displayOption ? displayOption(v as T) : labels[v as T]}
              </span>
            </button>
          );
        })
      }
    >
      <SelectDropdownButtonDisplayed
        placeholderText={placeholderText}
        labels={labels}
        value={value}
      />
    </DropdownFloater>
  );
};

export default SelectDropdown;

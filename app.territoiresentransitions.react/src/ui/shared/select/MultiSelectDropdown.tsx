import classNames from 'classnames';
import {forwardRef, Ref, useEffect, useMemo, useRef, useState} from 'react';

import DropdownFloater from 'ui/shared/floating-ui/DropdownFloater';
import {
  buttonDisplayedClassname,
  buttonDisplayedIconClassname,
  buttonDisplayedPlaceholderClassname,
  optionButtonClassname,
  optionCheckMarkClassname,
} from 'ui/shared/select/commons';

/* Création d'un composant séparé pour passer la ref du boutton au floater */
const MultiSelectDropdownButtonDisplayed = forwardRef(
  <T extends string>(
    {
      inlineValues,
      selectedValues,
      labels,
      isOpen,
      placeholderText,
      ...props
    }: {
      inlineValues?: boolean;
      selectedValues?: T[];
      labels: Record<T, string>;
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
      {selectedValues && selectedValues?.length !== 0 ? (
        <span
          className={classNames('mr-auto flex flex-col', {
            'flex-row line-clamp-1': inlineValues,
          })}
        >
          {selectedValues.sort().map((value, index) => (
            <span key={value}>
              {labels[value]}
              {inlineValues && selectedValues.length !== index + 1 && ', '}
            </span>
          ))}
        </span>
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

const MultiSelectDropdown = <T extends string>({
  inlineValues,
  values,
  labels,
  isItemAllActive,
  itemAllPlaceholder,
  onSelect,
  placeholderText,
}: {
  /** Affiche les valeurs sur une simple ligne si vrai */
  inlineValues?: boolean;
  values?: T[];
  labels: Record<T, string>;
  onSelect: (value: T[]) => void;
  /** Permet d'activer la sélection de tous les éléments */
  isItemAllActive?: boolean;
  /** Change le label de la ligne "tous les items", par défaut "Tous" */
  itemAllPlaceholder?: string;
  placeholderText?: string;
}) => {
  const [selectedValues, setSelectedValues] = useState<T[]>(values || []);

  // On execute onSelect() uniquement après un changement et non au premier render du composant
  const isFirstRender = useRef(true);
  // On execute onSelect() dans un useEffect pour avoir la bonne valeur car useState étant asynchrone,
  // si l'on performe onSelect sur le onClick du bouton on se retrouve avec la version précédente des selectedValues
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isItemAllActive && selectedValues.includes('tous' as T)) {
      setSelectedValues([]);
      onSelect([]);
    }
    onSelect(selectedValues);
  }, [selectedValues]);

  const displayedLabels = useMemo(() => {
    if (isItemAllActive) {
      return {
        tous: itemAllPlaceholder ?? 'Tous',
        ...labels,
      };
    } else {
      return labels;
    }
  }, [labels]);

  return (
    <DropdownFloater
      render={() =>
        Object.keys(displayedLabels).map(v => {
          const label = displayedLabels[v as T];
          return (
            <button
              key={v}
              aria-label={label}
              className={optionButtonClassname}
              onClick={() => {
                if (selectedValues.includes(v as T)) {
                  setSelectedValues(
                    selectedValues.filter(
                      selectedValue => selectedValue !== (v as T)
                    )
                  );
                } else {
                  setSelectedValues([...selectedValues, v as T]);
                }
              }}
            >
              <div className="w-6 mr-2">
                {selectedValues.includes(v as T) && v !== 'tous' ? (
                  <span className={optionCheckMarkClassname} />
                ) : null}
              </div>
              <span className="leading-6">{displayedLabels[v as T]}</span>
            </button>
          );
        })
      }
    >
      <MultiSelectDropdownButtonDisplayed
        labels={labels}
        inlineValues={inlineValues}
        selectedValues={selectedValues}
        placeholderText={placeholderText}
      />
    </DropdownFloater>
  );
};

export default MultiSelectDropdown;

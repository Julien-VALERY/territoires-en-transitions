import React, {cloneElement, Dispatch, SetStateAction, useState} from 'react';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import classNames from 'classnames';

export type RenderProps = {
  close: () => void;
  labelId: string;
  descriptionId: string;
};

export type ModalProps = {
  /* où il faut mettre le contenu de la modale */
  render: (props: RenderProps) => React.ReactNode;
  /* l'élément qui permet d'afficher la modale au click */
  children?: JSX.Element;
  /* s'il n'y a pas d'élément permettant d'afficher la modale,
     on peut lui passer un booléen mais celui ci doit être accompagné d'un setter (setExternalOpen)
     afin de pouvoir la fermer */
  externalOpen?: boolean;
  /* accompagne "externalOpen" afin de pouvoir fermer la modale */
  setExternalOpen?: Dispatch<SetStateAction<boolean>>;
  /* max-width prédéfinies dans le DSFR, valeur par défaut "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** désactive la fermeture lors du clic sur le fond */
  disableDismiss?: boolean;
  /** n'affiche pas le bouton Fermer */
  noCloseButton?: boolean;
};

/*
 * Basic modal
 * floating-ui doc: https://floating-ui.com/docs/react-dom-interactions
 * If you provide externalOpen you must add the corresponding setState function.
 */
const Modal = ({
  render,
  children,
  externalOpen,
  setExternalOpen,
  size = 'md',
  disableDismiss,
  noCloseButton,
}: ModalProps) => {
  const [open, setOpen] = useState(false);

  const {reference, floating, context} = useFloating({
    open: externalOpen ?? open,
    onOpenChange: setExternalOpen ?? setOpen,
  });

  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const {getReferenceProps, getFloatingProps} = useInteractions([
    useClick(context),
    useRole(context),
    useDismiss(context, {enabled: !disableDismiss}),
  ]);

  const mobileClassnames = 'absolute inset-x-0 bottom-0 mt-8';
  const aboveMobileClassnames = 'sm:relative sm:m-6';

  const handleCloseClick = () => {
    setExternalOpen ? setExternalOpen(false) : setOpen(false);
  };

  return (
    <>
      {children &&
        cloneElement(
          children,
          getReferenceProps({ref: reference, ...children.props})
        )}
      <FloatingPortal>
        {(open || externalOpen) && (
          <FloatingOverlay
            lockScroll
            style={{
              display: 'grid',
              placeItems: 'center',
              background: 'hsla(0deg, 0%, 8.6%, 0.375)',
              zIndex: 50,
            }}
          >
            <FloatingFocusManager context={context}>
              <div
                data-test="Modal"
                {...getFloatingProps({
                  ref: floating,
                  className: classNames(
                    `${mobileClassnames} ${aboveMobileClassnames} flex flex-col w-full max-h-[100vh] p-4 md:px-8 bg-white overflow-y-auto`,
                    {
                      'max-w-sm': size === 'sm',
                      'max-w-xl': size === 'md',
                      'max-w-4xl': size === 'lg',
                      'max-w-7xl': size === 'xl',
                    }
                  ),
                  'aria-labelledby': labelId,
                  'aria-describedby': descriptionId,
                })}
              >
                {noCloseButton ? null : (
                  <button
                    onClick={handleCloseClick}
                    className="flex items-center ml-auto mb-2 px-2 py-2 md:-mr-4 fr-btn--secondary !shadow-none"
                    data-test="close-modal"
                  >
                    <span className="-mt-1">Fermer</span>
                    <div className="fr-fi-close-line ml-2" />
                  </button>
                )}
                {render({
                  close: () => setOpen(false),
                  labelId,
                  descriptionId,
                })}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    </>
  );
};

export default Modal;

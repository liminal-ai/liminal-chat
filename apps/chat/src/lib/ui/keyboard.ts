type KeyHandler = () => void;
type KeyHandlers = Record<string, KeyHandler>;

let registeredHandlers: KeyHandlers = {};

const handleKeyDown = (event: KeyboardEvent) => {
  // Only handle if not in an input/textarea
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  const handler = registeredHandlers[event.key];
  if (handler) {
    event.preventDefault();
    handler();
  }
};

export const registerKeyboardHandlers = (handlers: KeyHandlers) => {
  registeredHandlers = { ...registeredHandlers, ...handlers };

  // Add event listener if this is the first registration
  if (Object.keys(registeredHandlers).length === Object.keys(handlers).length) {
    document.addEventListener('keydown', handleKeyDown);
  }
};

export const unregisterKeyboardHandlers = (handlers: KeyHandlers) => {
  Object.keys(handlers).forEach((key) => {
    delete registeredHandlers[key];
  });

  // Remove event listener if no handlers remain
  if (Object.keys(registeredHandlers).length === 0) {
    document.removeEventListener('keydown', handleKeyDown);
  }
};

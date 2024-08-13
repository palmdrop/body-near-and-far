export const isElementVisible = (element: HTMLElement, container: HTMLElement) => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return elementRect.top <= containerRect.top 
    ? containerRect.top - elementRect.top <= elementRect.height 
    : elementRect.bottom - containerRect.bottom <= elementRect.height;
};
const GUEST_NAME_KEY = "wedding_guest_name";

export function getStoredName(): string | null {
  return localStorage.getItem(GUEST_NAME_KEY);
}

export function setStoredName(name: string) {
  localStorage.setItem(GUEST_NAME_KEY, name);
}

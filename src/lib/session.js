import { v4 as uuidv4 } from "uuid";
const SESSION_KEY = "legacy_session_id";
export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
// This is the ONLY place localStorage is used in the entire app.

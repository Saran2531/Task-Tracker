# NOTES.md — Bug Fix Summary

## Summary of Changes

### Bug 1 — SQL Operator Precedence (TaskRepository.java)
**File:** `backend/src/main/java/com/internal/tasktracker/TaskRepository.java`

**Problem:**
```sql
-- BROKEN: AND binds tighter than OR in SQL
WHERE archived = FALSE AND LOWER(title) LIKE :term
   OR LOWER(description) LIKE :term AND (:status IS NULL OR status = :status)
```
Because `AND` has higher precedence than `OR`, SQL evaluates this as:
- `(archived = FALSE AND title LIKE term)` OR `(description LIKE term AND status matches)`

This means:
- Archived tasks could appear if they matched the description
- The status filter had **no effect** on title matches

**Fix:**
```sql
-- FIXED: Parentheses make the intent explicit
WHERE archived = FALSE
  AND (LOWER(title) LIKE :term OR LOWER(description) LIKE :term)
  AND (:status IS NULL OR status = :status)
```
*(Also applied to reference artifacts: `db/queries/search_tasks.sql` and `db/oracle/task_search_package.sql`)*

---

### Bug 2 — Inverted Artificial Delay (TaskController.java)
**File:** `backend/src/main/java/com/internal/tasktracker/TaskController.java`

**Problem:**
```java
int complexityScore = Math.max(0, 10 - query.length());
long queryWeight = complexityScore * 100L;
Thread.sleep(queryWeight); // Empty query = 1000ms sleep!
```
The logic was **inverted** — shorter queries slept *longer*. An empty search box caused a full 1-second artificial delay every time the page loaded or the filter changed.

**Fix:** Removed the `Thread.sleep()` entirely. The "complexity score" had no real use; it was pure dead weight hurting UX.

---

### Bug 3 — No Debounce on Search Input (useTasks.js)
**File:** `frontend/src/hooks/useTasks.js`

**Problem:**
Every single keystroke in the search box triggered an immediate `useEffect`, which fired an API call. Typing "hello" = 5 separate network requests in quick succession.

**Fix:** Added a 300ms `setTimeout` debounce inside `useEffect`. Only the last keystroke within 300ms fires the request. The cleanup function (`clearTimeout`) cancels any pending timer when the component re-renders before the timer fires.

---

### Bug 4 — Loading Spinner Never Clears on Error (useTasks.js)
**File:** `frontend/src/hooks/useTasks.js`

**Problem:**
```js
.catch((err) => {
  setError(err.message);
  // setLoading(false) was MISSING here!
})
```
If the API call failed, `setLoading` was never called with `false` in the error path. The spinner would show indefinitely.

**Fix:** Added `setLoading(false)` inside the `.catch()` block.

---

## What I Chose NOT to Change

- **In-memory pagination** — The controller fetches all rows and slices in Java. For this scale it works, but it won't scale. Left it because it's a structural change, not a bug.
- **`@CrossOrigin` hardcoded to localhost:5173** — Works for dev, but should use environment config for prod. Out of scope for a patch.
- **No input validation on `page`/`pageSize`** — Negative page numbers would give an empty result silently. Left for future hardening.

---

## Biggest Remaining Risk

The **in-memory pagination** in `TaskController` loads the entire unfiltered table into a Java `List` before slicing. As the dataset grows, this will cause memory and performance problems. Real fix: push `LIMIT`/`OFFSET` into the SQL query itself using Spring Data's `Pageable`.

---

## Tools / AI Used

- Used **Antigravity (Claude Sonnet)** to identify bugs and explain the SQL precedence issue clearly.
- All fixes reviewed and understood before applying — the SQL fix in particular required verifying operator precedence rules manually.

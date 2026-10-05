package com.internal.tasktracker;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping("/api/tasks")
    public ResponseEntity<?> searchTasks(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int pageSize) {

        // Normalize query input
        String query = q == null ? "" : q.trim();
        String searchTerm = "%" + query.toLowerCase() + "%";

        // Parse status filter
        String normalizedStatus = null;
        if (status != null && !status.isEmpty()) {
            normalizedStatus = TaskStatus.valueOf(status.toUpperCase()).name();
        }

        // FIX: Removed artificial sleep. Original code was INVERTED —
        // short queries (empty search) slept UP TO 1000ms, long queries slept 0ms.
        // This made the app feel slow when the search box was empty.

        System.out.println("[TaskController] q=\"" + query + "\" status=" + normalizedStatus
                + " page=" + page + " pageSize=" + pageSize);

        List<Task> allResults = taskRepository.searchTasks(searchTerm, normalizedStatus);

        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, allResults.size());
        List<Task> pageResults = (start < allResults.size())
                ? allResults.subList(start, end)
                : Collections.emptyList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", pageResults);
        response.put("total", allResults.size());
        response.put("page", page);
        response.put("pageSize", pageSize);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/tasks")
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.get("title");
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }

        Task task = new Task();
        task.setTitle(title.trim());
        task.setDescription((String) payload.getOrDefault("description", ""));
        
        String status = (String) payload.getOrDefault("status", "OPEN");
        try {
            task.setStatus(TaskStatus.valueOf(status.toUpperCase()).name());
        } catch (Exception e) {
            task.setStatus("OPEN");
        }

        String priority = (String) payload.getOrDefault("priority", "MEDIUM");
        task.setPriority(priority != null ? priority.toUpperCase() : "MEDIUM");
        task.setAssignee((String) payload.getOrDefault("assignee", "Developer"));
        task.setArchived(false);
        task.setCreatedAt(java.time.LocalDateTime.now());

        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/api/tasks/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = optionalTask.get();
        if (payload.containsKey("title")) {
            task.setTitle((String) payload.get("title"));
        }
        if (payload.containsKey("description")) {
            task.setDescription((String) payload.get("description"));
        }
        if (payload.containsKey("status")) {
            String s = (String) payload.get("status");
            try {
                task.setStatus(TaskStatus.valueOf(s.toUpperCase()).name());
            } catch (Exception ignored) {}
        }
        if (payload.containsKey("priority")) {
            task.setPriority(((String) payload.get("priority")).toUpperCase());
        }
        if (payload.containsKey("assignee")) {
            task.setAssignee((String) payload.get("assignee"));
        }

        Task updated = taskRepository.save(task);
        return ResponseEntity.ok(updated);
    }
}
